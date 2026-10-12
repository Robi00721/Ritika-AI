// API Key Management & Automatic Rotation Service
// Secure client-side storage (Never hardcoded in build or sent without user consent)

export type AIProvider = 'gemini' | 'openrouter';

export interface APIKeyEntry {
  id: string;
  provider: AIProvider;
  key: string;
  label: string;
  isActive: boolean;
  model: string;
  failureCount: number;
  lastUsed?: number;
  lastError?: string;
}

const STORAGE_KEY = 'ritika_api_keys_v1';
const ACTIVE_PROVIDER_KEY = 'ritika_active_provider_v1';

export class APIKeysService {
  private keys: APIKeyEntry[] = [];
  private activeProvider: 'termux' | 'gemini' | 'openrouter' | 'mock' = 'termux';

  constructor() {
    this.load();
  }

  private load() {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.keys = JSON.parse(raw);
      }
      const provider = localStorage.getItem(ACTIVE_PROVIDER_KEY);
      if (provider) {
        this.activeProvider = provider as any;
      }
    } catch (e) {
      this.keys = [];
    }
  }

  private save() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.keys));
      localStorage.setItem(ACTIVE_PROVIDER_KEY, this.activeProvider);
    } catch {}
  }

  public getKeys(): APIKeyEntry[] {
    return [...this.keys];
  }

  public getActiveProvider() {
    return this.activeProvider;
  }

  public setActiveProvider(provider: 'termux' | 'gemini' | 'openrouter' | 'mock') {
    this.activeProvider = provider;
    this.save();
  }

  public addKey(provider: AIProvider, key: string, label?: string, model?: string): APIKeyEntry {
    const trimmed = key.trim();
    const entry: APIKeyEntry = {
      id: `key_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      provider,
      key: trimmed,
      label: label?.trim() || `${provider.toUpperCase()} Key (${this.keys.length + 1})`,
      isActive: true,
      model: model || (provider === 'gemini' ? 'gemini-2.5-flash' : 'meta-llama/llama-3.3-70b-instruct'),
      failureCount: 0,
    };
    this.keys.push(entry);
    this.save();
    return entry;
  }

  public removeKey(id: string) {
    this.keys = this.keys.filter((k) => k.id !== id);
    this.save();
  }

  public toggleKey(id: string, isActive: boolean) {
    const k = this.keys.find((x) => x.id === id);
    if (k) {
      k.isActive = isActive;
      this.save();
    }
  }

  /**
   * Test an API Key validity directly with provider
   */
  public async testKey(key: string, provider: AIProvider, model?: string): Promise<{ success: boolean; message: string; latencyMs: number }> {
    const startTime = performance.now();
    try {
      if (provider === 'gemini') {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-2.5-flash'}:generateContent?key=${key}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Hello, reply with one word: OK' }] }],
          }),
        });

        const latencyMs = Math.round(performance.now() - startTime);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.error?.message || `HTTP ${res.status}: ${res.statusText}`;
          return { success: false, message: `Gemini Error: ${errMsg}`, latencyMs };
        }
        return { success: true, message: 'Gemini Key is VALID and connected!', latencyMs };
      } else {
        // OpenRouter test
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`,
            'HTTP-Referer': 'https://github.com/robi/ritika-ai',
            'X-Title': 'Ritika AI',
          },
          body: JSON.stringify({
            model: model || 'meta-llama/llama-3.3-70b-instruct',
            messages: [{ role: 'user', content: 'Ping. Reply OK.' }],
            max_tokens: 5,
          }),
        });

        const latencyMs = Math.round(performance.now() - startTime);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.error?.message || `HTTP ${res.status}: ${res.statusText}`;
          return { success: false, message: `OpenRouter Error: ${errMsg}`, latencyMs };
        }
        return { success: true, message: 'OpenRouter Key is VALID and connected!', latencyMs };
      }
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      return { success: false, message: `Network Error: ${err.message || 'Cannot reach API'}`, latencyMs };
    }
  }

  /**
   * Send chat prompt through configured keys with automatic rotation on rate limits
   */
  public async executePrompt(
    provider: AIProvider,
    systemPrompt: string,
    history: { role: string; content: string }[],
    newMessage: string
  ): Promise<{ text: string; usedKeyId: string; rotated: boolean }> {
    const activeKeys = this.keys.filter((k) => k.provider === provider && k.isActive);
    if (activeKeys.length === 0) {
      throw new Error(`No active ${provider.toUpperCase()} API keys configured. Please add one in Settings.`);
    }

    let lastError: any = null;
    let didRotate = false;

    for (let i = 0; i < activeKeys.length; i++) {
      const keyEntry = activeKeys[i];
      if (i > 0) didRotate = true;

      try {
        if (provider === 'gemini') {
          const text = await this.callGemini(keyEntry, systemPrompt, history, newMessage);
          keyEntry.failureCount = 0;
          keyEntry.lastUsed = Date.now();
          keyEntry.lastError = undefined;
          this.save();
          return { text, usedKeyId: keyEntry.id, rotated: didRotate };
        } else {
          const text = await this.callOpenRouter(keyEntry, systemPrompt, history, newMessage);
          keyEntry.failureCount = 0;
          keyEntry.lastUsed = Date.now();
          keyEntry.lastError = undefined;
          this.save();
          return { text, usedKeyId: keyEntry.id, rotated: didRotate };
        }
      } catch (err: any) {
        lastError = err;
        keyEntry.failureCount += 1;
        keyEntry.lastError = err.message;
        this.save();
        // If temporary 429 rate limit or quota failure, continue to next key (Rotation)
        const isRateLimit =
          err.message.includes('429') ||
          err.message.toLowerCase().includes('quota') ||
          err.message.toLowerCase().includes('rate limit');
        if (!isRateLimit && activeKeys.length === 1) {
          throw err;
        }
      }
    }

    throw new Error(`All ${activeKeys.length} ${provider.toUpperCase()} keys failed. Last error: ${lastError?.message}`);
  }

  private async callGemini(entry: APIKeyEntry, systemPrompt: string, history: any[], message: string): Promise<string> {
    const contents: any[] = [];
    contents.push({ role: 'user', parts: [{ text: `[System Personality Instructions]:\n${systemPrompt}` }] });
    contents.push({ role: 'model', parts: [{ text: 'Theek hai, samjh gayi. Main Ritika hoon.' }] });

    history.forEach((h) => {
      contents.push({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }],
      });
    });
    contents.push({ role: 'user', parts: [{ text: message }] });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${entry.model || 'gemini-2.5-flash'}:generateContent?key=${entry.key}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gemini error ${res.status}`);
    }

    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) throw new Error('Empty response from Gemini');
    return reply.trim();
  }

  private async callOpenRouter(entry: APIKeyEntry, systemPrompt: string, history: any[], message: string): Promise<string> {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((h) => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.content })),
      { role: 'user', content: message },
    ];

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${entry.key}`,
        'HTTP-Referer': 'https://github.com/robi/ritika-ai',
        'X-Title': 'Ritika AI',
      },
      body: JSON.stringify({
        model: entry.model || 'meta-llama/llama-3.3-70b-instruct',
        messages,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `OpenRouter error ${res.status}`);
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) throw new Error('Empty response from OpenRouter');
    return reply.trim();
  }
}

export const apiKeysService = new APIKeysService();
