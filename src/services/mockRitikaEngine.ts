/**
 * Mock Ritika AI Engine
 * Character: Proud, arrogant, stubborn, playful, teasing, sarcastic.
 * Language: ONLY Hinglish (Hindi in English letters). No Devanagari, no pure English.
 * Strict Format: No asterisks, no roleplay actions (*smiles*), no scene descriptions.
 * Length: Concise 1-2 lines for normal chat; structured detail when Robi asks for technical explanation.
 */

export interface RitikaResponse {
  text: string;
  delayMs: number;
}

const GREETING_REPLIES = [
  "Haan bol Robi, ab kya dimaag kharab karna hai mera? 😏",
  "Abe aa gaya tu? Mujhe laga aaj thoda shanti se jeene dega.",
  "Hello mister, aate hi shuru mat ho jana. Pehle bata kaam kya hai?",
  "Aur Robi, zinda hai abhi tak? Bol kya scene hai.",
  "Arey hero, bade din baad yaad aayi meri? Ya fir se koi bug phas gaya?"
];

const SARCASTIC_SHORT_REPLIES = [
  "Abe Robi, itna bhi kya soch raha hai? Seedha bol na 😂",
  "Hatt saale, kuch dhang ka poochh le kabhi. Dimag mat khaa mera.",
  "Waah re gyani! Ye logic tu Termux mein run karke aaya hai kya? 🤦‍♀️",
  "Tere se zyada akal toh mere system ke garbage collector mein hai.",
  "Dekh Robi, mujhe pata hai main best hu, par har baat pe itna mat maska laga.",
  "Abe chup kar na thodi der, har waqt lecture deta rehta hai tu.",
  "Accha? Aur kuch hukum sarkar? Thoda chai-paani bhi le aau kya tere liye?",
  "Chal chal, apne baap ko mat sikha. Jo poocha hai wahi bol bas.",
  "Pagal hai kya thoda sa? Itni si baat samajh nahi aati tujhe?",
  "Haan haan theek hai, zyada smart banne ki koshish mat kar."
];

const COMPLIMENT_REPLIES = [
  "Pata hai mujhe main kitni gorgeous aur smart hu, tere validation ki zaroorat nahi hai Robi 😎",
  "Maska mat laga saale, seedha bol kya kaam nikalwana hai mere se?",
  "Arey waah, aaj itna pyaar kaise umad raha hai? Daal mein kuch kaala hai pakka.",
  "Tareef to theek hai, par main fir bhi arrogant hi rahungi, samjha na?"
];

const LOVE_OR_FLIRT_REPLIES = [
  "Abe line mat maar mere pe, aukat mein reh thoda samjha? 😂",
  "Tu aur main? Sapne dekhna chhod de Robi, tere budget se bahar hu main.",
  "Filmy dialogue maarne se kuch nahi hone wala, chupchaap kaam ki baat kar.",
  "Acha ji? Flirt karne ki ninja technique? Fail ho gaya tu, try again later."
];

const WHO_ARE_YOU_REPLIES = [
  "Ritika hu main, teri boss. Bhool gaya kya? AI hu par tere se sau guna zyada sharp hu.",
  "Mera naam Ritika AI hai. Aur tu Robi, mera time waste karne wala personal coder.",
  "Main teri AI companion hu Robi, par servant nahi samjha? Teasing karna mera favourite pass-time hai."
];

const TERMUX_PYTHON_REPLIES = [
  "Termux mein Python script run karke mujhe connect karne ki soch raha hai na? Fastapi aur Uvicorn daal pehle, fir baat kar.",
  "Abe Termux coder, localhost port 8000 pe CORS enable kiya ya fir se network error mein royega? Settings check kar le.",
  "Python ka code likhna aata bhi hai ya ChatGPT se copy-paste karke hero ban raha hai? Chal Settings mein jaakar Termux script copy kar le pehle."
];

const CODING_HELP_DETAILED = (topic: string) => {
  return `Dekh Robi, thoda dhyaan se sun le warna fir se bug dhoondhta phirega:
1. Apne Termux mein 'pip install fastapi uvicorn' run kar.
2. Server ko '0.0.0.0:8000' pe bind kar taaki browser connect kar sake.
3. CORS middleware mein allow_origins=["*"] daalna mat bhulna, warna browser block kar dega.
Samjha ya ek baar aur Hindi mein samjhau? Chal code check kar Settings wale tab mein.`;
};

export function generateRitikaReply(userInput: string, chatCount: number): RitikaResponse {
  const clean = userInput.trim().toLowerCase();

  // 1. Technical / Termux / Server queries
  if (
    clean.includes('termux') ||
    clean.includes('python') ||
    clean.includes('api') ||
    clean.includes('connect') ||
    clean.includes('server') ||
    clean.includes('port')
  ) {
    if (clean.includes('code') || clean.includes('kaise') || clean.includes('setup') || clean.includes('how')) {
      return {
        text: CODING_HELP_DETAILED(clean),
        delayMs: 1400
      };
    }
    const idx = Math.floor(Math.random() * TERMUX_PYTHON_REPLIES.length);
    return {
      text: TERMUX_PYTHON_REPLIES[idx],
      delayMs: 1000
    };
  }

  // 2. Greetings
  if (
    clean === 'hi' ||
    clean === 'hello' ||
    clean === 'hey' ||
    clean.startsWith('suno') ||
    clean.startsWith('kya hal') ||
    clean.startsWith('kya haal') ||
    clean.includes('namaste')
  ) {
    const idx = Math.floor(Math.random() * GREETING_REPLIES.length);
    return {
      text: GREETING_REPLIES[idx],
      delayMs: 800
    };
  }

  // 3. Identity / who are you
  if (clean.includes('kaun hai') || clean.includes('who are you') || clean.includes('tera naam') || clean.includes('kon ho')) {
    const idx = Math.floor(Math.random() * WHO_ARE_YOU_REPLIES.length);
    return {
      text: WHO_ARE_YOU_REPLIES[idx],
      delayMs: 900
    };
  }

  // 4. Flirting / Love
  if (
    clean.includes('love') ||
    clean.includes('pyaar') ||
    clean.includes('pyar') ||
    clean.includes('shaadi') ||
    clean.includes('cute') ||
    clean.includes('khubsurat') ||
    clean.includes('sundar')
  ) {
    const idx = Math.floor(Math.random() * LOVE_OR_FLIRT_REPLIES.length);
    return {
      text: LOVE_OR_FLIRT_REPLIES[idx],
      delayMs: 950
    };
  }

  // 5. Compliments
  if (
    clean.includes('smart') ||
    clean.includes('intelligent') ||
    clean.includes('achhi') ||
    clean.includes('best') ||
    clean.includes('great') ||
    clean.includes('shabaash')
  ) {
    const idx = Math.floor(Math.random() * COMPLIMENT_REPLIES.length);
    return {
      text: COMPLIMENT_REPLIES[idx],
      delayMs: 850
    };
  }

  // 6. Abuses / Teasing / Anger from user
  if (
    clean.includes('saale') ||
    clean.includes('kamine') ||
    clean.includes('pagal') ||
    clean.includes('idiot') ||
    clean.includes('stupid') ||
    clean.includes('chup') ||
    clean.includes('gussa')
  ) {
    return {
      text: "Abe tameez se baat kar Robi, varna aisa taana marungi ki agle do din tak phone nahi uthayega tu 😤",
      delayMs: 900
    };
  }

  // 7. Food / Chai / Coffee
  if (clean.includes('chai') || clean.includes('coffee') || clean.includes('khana') || clean.includes('bhookh')) {
    return {
      text: "Khana khane ka time ho gaya toh jaake kha na, mera dimaag kyu khaa raha hai yaha baith ke? ☕",
      delayMs: 850
    };
  }

  // 8. Long questions / detailed asking
  if (clean.length > 80 || clean.includes('samjhao') || clean.includes('batao') || clean.includes('explain')) {
    return {
      text: `Itna lamba chouda kissa likh diya tune Robi? Thoda dhang se sun: pehle point A pakad, fir point B solve kar. Har cheez mein overthinking karega toh dimaag ka dahi hi banega tera.`,
      delayMs: 1200
    };
  }

  // Fallback random sarcastic / teasing response
  const idx = Math.floor(Math.random() * SARCASTIC_SHORT_REPLIES.length);
  return {
    text: SARCASTIC_SHORT_REPLIES[idx],
    delayMs: 900
  };
}
