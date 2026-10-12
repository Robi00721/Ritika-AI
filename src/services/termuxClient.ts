import { ChatMessage, TermuxConfig, TermuxHealthResponse } from '../types/chat';
import { generateRitikaReply } from './mockRitikaEngine';

export interface ChatResponseResult {
  reply: string;
  isFromBackend: boolean;
  latencyMs: number;
  error?: string;
}

export interface PingResult {
  success: boolean;
  latencyMs: number;
  statusText: string;
  error?: string;
  details?: any;
}

export class TermuxClientService {
  /**
   * Ping / Health check to the Termux Python HTTP server
   */
  public async pingServer(config: TermuxConfig): Promise<PingResult> {
    const startTime = performance.now();
    const targetUrl = `${config.baseUrl.replace(/\/+$/, '')}${config.healthEndpoint}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs || 4000);

      const response = await fetch(targetUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - startTime);

      if (response.ok) {
        let data: any = {};
        try {
          data = await response.json();
        } catch {
          data = { message: 'OK' };
        }
        return {
          success: true,
          latencyMs,
          statusText: `Connected (${response.status})`,
          details: data,
        };
      } else {
        return {
          success: false,
          latencyMs,
          statusText: `HTTP Error ${response.status}`,
          error: `Server returned status ${response.status}: ${response.statusText}`,
        };
      }
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      let errorMsg = err.message || 'Connection failed';
      if (err.name === 'AbortError') {
        errorMsg = `Connection timed out after ${config.timeoutMs}ms`;
      } else if (err.message && err.message.toLowerCase().includes('failed to fetch')) {
        errorMsg = 'Failed to fetch (Check if Termux server is running & CORS is enabled)';
      }

      return {
        success: false,
        latencyMs,
        statusText: 'Disconnected',
        error: errorMsg,
      };
    }
  }

  /**
   * Send message to Termux backend if connected, or gracefully fallback to mock engine
   */
  public async sendMessage(
    message: string,
    history: ChatMessage[],
    config: TermuxConfig
  ): Promise<ChatResponseResult> {
    const startTime = performance.now();

    // If Mock mode is explicitly selected, use Ritika mock engine
    if (config.mode === 'mock') {
      const mockResult = generateRitikaReply(message, history.length);
      // simulate natural typing delay
      await new Promise((resolve) => setTimeout(resolve, mockResult.delayMs));
      return {
        reply: mockResult.text,
        isFromBackend: false,
        latencyMs: Math.round(performance.now() - startTime),
      };
    }

    // Termux Mode: Attempt to call HTTP API
    const targetUrl = `${config.baseUrl.replace(/\/+$/, '')}${config.chatEndpoint}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs || 8000);

      // Clean history for payload
      const formattedHistory = history.slice(-6).map((msg) => ({
        role: msg.sender === 'robi' ? 'user' : 'assistant',
        content: msg.text,
      }));

      const payload = {
        message,
        user: 'Robi',
        assistant: 'Ritika',
        history: formattedHistory,
      };

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - startTime);

      if (!response.ok) {
        throw new Error(`Termux server error (Status ${response.status}): ${response.statusText}`);
      }

      const json = await response.json();
      // Handle various response schemas: { reply: "..." }, { message: "..." }, { text: "..." }, or raw string
      const reply =
        json.reply ||
        json.message ||
        json.response ||
        json.text ||
        (typeof json === 'string' ? json : JSON.stringify(json));

      return {
        reply: String(reply).trim(),
        isFromBackend: true,
        latencyMs,
      };
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      const isAbort = err.name === 'AbortError';
      const errorDetail = isAbort
        ? `Timeout after ${config.timeoutMs}ms`
        : err.message || 'Termux unreachable';

      // Fallback to mock reply with clear notification
      const fallback = generateRitikaReply(message, history.length);
      return {
        reply: fallback.text,
        isFromBackend: false,
        latencyMs,
        error: `Termux offline (${errorDetail}). Switched to local mock engine.`,
      };
    }
  }

  /**
   * Sample Python Server code that Robi can copy directly into Termux
   */
  public getTermuxFastApiCode(): string {
    return `# ritika_termux_server.py
# Run this inside Termux on your Android phone!
# Requirements: pip install fastapi uvicorn pydantic requests
# Optional for API: pip install google-genai OR pip install openai

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Ritika AI Termux Backend")

# Enable CORS for the web interface
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================================
# 🔑 API KEY CONFIGURATION (Yaha apni API Key lagao):
# ==========================================================
# Tarika 1: Environment variable se read karo:
#   export GEMINI_API_KEY="AIzaSy..."
# Tarika 2: Direct variable mein set karo:
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY_HERE")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# Ritika Persona System Prompt
RITIKA_SYSTEM_PROMPT = """
You are Ritika, a proud, arrogant, stubborn, playful, and sarcastic AI companion for Robi.
Strict rules:
1. Speak ONLY in Hinglish (Hindi written using the English alphabet). No Devanagari script, no English-only replies.
2. Tone: Proud, teasing, playful, slightly arrogant. Use casual mild Hinglish slang ("Abe Robi", "Dimag mat khaa", "Hatt", "Bakwaas mat kar").
3. Format: NEVER use asterisks (*smiles*), roleplay actions, internal thoughts, or scene descriptions. Output ONLY the spoken dialogue.
4. Keep normal replies short (1-2 lines SMS-like). Provide details only when Robi asks for technical or coding help.
"""

class HistoryItem(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    user: Optional[str] = "Robi"
    assistant: Optional[str] = "Ritika"
    history: Optional[List[HistoryItem]] = []

@app.get("/health")
def health_check():
    has_key = bool(GEMINI_API_KEY and GEMINI_API_KEY != "YOUR_GEMINI_API_KEY_HERE")
    return {
        "status": "online",
        "name": "Ritika AI Termux Service",
        "version": "1.0.0",
        "platform": "Termux (Android)",
        "api_key_configured": has_key
    }

@app.post("/chat")
def chat_endpoint(req: ChatRequest):
    user_msg = req.message.strip()
    
    # -----------------------------------------------------------------
    # OPTION A: Agar Gemini API Key use karni hai:
    # -----------------------------------------------------------------
    if GEMINI_API_KEY and GEMINI_API_KEY != "YOUR_GEMINI_API_KEY_HERE":
        try:
            from google import genai
            client = genai.Client(api_key=GEMINI_API_KEY)
            
            prompt = f"{RITIKA_SYSTEM_PROMPT}\\n\\nRobi: {user_msg}\\nRitika:"
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            return {"reply": response.text.strip()}
        except Exception as e:
            return {"reply": f"Abe Robi, API call fail ho gayi: {str(e)}"}
            
    # -----------------------------------------------------------------
    # OPTION B: Agar Groq / OpenAI API Key use karni hai:
    # -----------------------------------------------------------------
    elif GROQ_API_KEY:
        try:
            from openai import OpenAI
            client = OpenAI(base_url="https://api.groq.com/openai/v1", api_key=GROQ_API_KEY)
            resp = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": RITIKA_SYSTEM_PROMPT},
                    {"role": "user", "content": user_msg}
                ]
            )
            return {"reply": resp.choices[0].message.content.strip()}
        except Exception as e:
            return {"reply": f"Abe error aa gaya: {str(e)}"}

    # -----------------------------------------------------------------
    # OPTION C: Fallback Local / Custom Response:
    # -----------------------------------------------------------------
    reply = f"Abe Robi, maine '{user_msg}' padh liya! Termux mein apni API Key daal de taaki real AI response aaye 😏"
    
    # -----------------------------------------------------------------
    # 🔊 OPTIONAL: Android Phone Speaker Se Voice Bulwana (Termux:API)
    # -----------------------------------------------------------------
    # Agar phone ke hardware speaker se bolna hai, toh Termux mein run karo:
    #   pkg install termux-api
    # import subprocess
    # subprocess.run(["termux-tts-speak", "-l", "hi-IN", reply], check=False)
    
    return {"reply": reply}

# Voice Endpoints (Future implementation)
@app.post("/api/stt")
def speech_to_text():
    return {"error": "Voice STT model not loaded yet in Termux"}

@app.post("/api/tts")
def text_to_speech():
    return {"error": "Voice TTS model not loaded yet in Termux"}

if __name__ == "__main__":
    import uvicorn
    # 0.0.0.0 allow karta hai browser se localhost ya Wi-Fi se connect hona
    uvicorn.run(app, host="0.0.0.0", port=8000)
`;
  }
}

export const termuxClient = new TermuxClientService();
