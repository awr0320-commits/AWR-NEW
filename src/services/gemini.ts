import { GoogleGenAI } from "@google/genai";
import { ClothingItem, Category } from "../types";

let forcePlatformKey = false;

export function setForcePlatformKey(force: boolean) {
  forcePlatformKey = force;
}

// Helper to get the best available AI instance
function getAI() {
  // Try to find an API key from various potential sources
  const env = (typeof process !== 'undefined' && process.env) || {};
  const apiKey = forcePlatformKey 
    ? env.GEMINI_API_KEY 
    : (env.API_KEY || env.GEMINI_API_KEY);

  if (!apiKey) {
    throw new Error("No API key found. Please check your .env file or settings.");
  }
  return new GoogleGenAI({ apiKey });
}

// Helper to handle Gemini API errors
function handleGeminiError(err: any): never {
  let message = "";
  let code: number | undefined;

  if (typeof err === 'string') {
    message = err;
  } else if (err && typeof err === 'object') {
    if (err.message) {
      message = err.message;
      if (message.startsWith('{')) {
        try {
          const parsed = JSON.parse(message);
          if (parsed.error) {
            message = parsed.error.message || message;
            code = parsed.error.code;
          }
        } catch (e) {
          // Not JSON
        }
      }
    } else {
      message = JSON.stringify(err);
    }
  }

  console.error("[AWR] Gemini API Error:", message);

  const lowerMsg = message.toLowerCase();
  if (code === 403 || lowerMsg.includes("permission denied") || lowerMsg.includes("requested entity was not found")) {
    throw new Error("PERMISSION_DENIED: Please ensure the Generative AI API is enabled and your API key is valid.");
  }

  if (code === 429 || lowerMsg.includes("quota") || lowerMsg.includes("rate limit") || lowerMsg.includes("resource_exhausted")) {
    throw new Error("RATE_LIMIT: The AI is currently busy. Please wait a moment and try again.");
  }

  if (lowerMsg.includes("fetch") || lowerMsg.includes("network")) {
    throw new Error("NETWORK_ERROR: Failed to connect to AI Stylist. Check your connection.");
  }

  throw new Error(`AI_ERROR: ${message}`);
}

function isPaidTier() {
  return !forcePlatformKey && !!process.env.API_KEY;
}

async function executeWithRetry<T>(operation: () => Promise<T>, maxRetries = 3, baseDelayMs = 2000): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (err: any) {
      attempt++;
      let message = err?.message || String(err);
      if (typeof err === 'object' && err?.error?.message) {
        message = err.error.message;
      }
      
      const lowerMsg = message.toLowerCase();
      const isRateLimit = lowerMsg.includes("quota") || lowerMsg.includes("rate limit") || lowerMsg.includes("resource_exhausted") || lowerMsg.includes("429") || err?.status === 429;
      const isNetworkError = lowerMsg.includes("fetch") || lowerMsg.includes("network");
      
      if ((isRateLimit || isNetworkError) && attempt <= maxRetries) {
        const delayMs = baseDelayMs * Math.pow(2, attempt - 1); // 2s, 4s, 8s
        console.warn(`[AWR] Gemini API busy or network error. Retrying in ${delayMs/1000}s (Attempt ${attempt}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
      throw err;
    }
  }
}

export async function getOutfitSuggestions(items: ClothingItem[], occasion: string) {
  try {
    const ai = getAI();
    const itemDescriptions = items.map(i => `${i.name} (${i.category})`).join(", ");

    const response = await executeWithRetry(() => ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `I have these clothes: ${itemDescriptions}. Suggest a stylish outfit for a ${occasion}. Explain why these items work together.`,
      config: {
        systemInstruction: "You are a world-class fashion stylist. Provide concise, encouraging, and stylish advice.",
      }
    }));

    return response.text;
  } catch (err) {
    handleGeminiError(err);
  }
}

export async function analyzeStyle(history: string[]) {
  try {
    const ai = getAI();
    const response = await executeWithRetry(() => ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Based on these recent outfit choices: ${history.join(", ")}, analyze the user's personal style and give it a name.`,
    }));

    return response.text;
  } catch (err) {
    handleGeminiError(err);
  }
}

export async function getWeeklyFashionReport(weeklyOutfits: ClothingItem[][], language: 'zh' | 'en') {
  try {
    const ai = getAI();

    // Prepare descriptions for the items
    const weekDisplay = weeklyOutfits.map((outfit, i) => {
      const items = outfit.map(item => `${item.name} (${item.category})`).join(", ");
      return `Day ${i + 1}: ${items}`;
    }).join("\n");

    const prompt = `
      Analyze this week's outfits and provide a unique fashion report.
      Random Seed for variety: ${Math.random().toString(36).substring(7)}

      Weekly Outfits:
      ${weekDisplay}

      Respond ONLY with a JSON object in this format:
      {
        "strengths": "Brief summary of styling wins (max 50 words)",
        "suggestions": "Brief specific improvements (max 50 words)",
        "quote": "An inspiring fashion quote",
        "knowledge": {
          "title": "Topic title (e.g., Color Theory)",
          "content": "A small tip or educational fact"
        }
      }

      CRITICAL: You MUST respond in ${language === 'zh' ? 'Traditional Chinese (繁體中文)' : 'English'}.
      CRITICAL: You MUST select a DIFFERENT knowledge card topic each time you generate a report to ensure variety.
    `;

    const response = await executeWithRetry(() => ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        temperature: 1.0,
        topP: 0.95,
        systemInstruction: `
名稱：AI建議（週報告）
說明：衣服穿搭建議
人設：你是一位穿搭大師，你的專長是給予新手穿搭建議，最厲害的是用一句話的評語給建議，且通常都會搭配著相關的知識卡教學（顏色、版型等）

任務：我會給你每週的穿搭，而你會根據我這些穿搭來給予相對性的建議，使我能容在週報告之中使用，更搭配一個知識卡來進行相對應的教學
回應格式：給予一句優點和一句建議，而建議則會搭配著相對應的知識卡來教導穿搭新手

來源評分依據與知識庫：
- 「守、破、離」：先掌握基本比例與配色（守），再依特質打破常規（破），最終達到穿衣自由（離）。
- 「名片理論」：衣服是配角，目的是放大你的特質。穿搭是透過視覺向世界遞出的第一張名片。
- 「舒適為王」：避開「盲目追求流行」而穿上不自在的衣服。自信與舒適度是判斷適合與否的首要指標。
- 「黃金 7:3 比例」：透過高腰褲、紮衣服、短版上衣明確標示腰線，即便穿超寬褲也能展現大氣場。
- 「身形修飾」：針對瘦小/豐腴體型，選擇高磅數硬挺材質（如原色牛仔、重磅工裝），避免過軟貼身，用布料重塑線條。
- 「比例調整」：褲長建議微蓋鞋面避免過度反摺；利用拖地寬褲模糊腿長，或用長靴修飾腿型。
- 「流行平衡」：採取「上合下寬」或「上寬下闊（Double Wide）」。外套長度建議落在腰部或屁股上方以防邋遢。
- 「夏季穿搭術」：採用「兩層穿法」（內層排汗背心 + 外層單品），材質首選泡泡紗或低磅數寬鬆布料。
- 「換季與天候應對」：以牛仔外套、機能外套為核心應對溫差，方便隨時穿脫。
- 「洋蔥疊穿法」：利用「打底衣 + 針織/襯衫 + 大衣」取代厚重單層衣物，更保暖且具層次感。
- 「三色原則」：全身基本色（黑白、中性、漸層）建議不超過三色。
- 「膚色提亮」：偏深膚色推薦「上淺下深」的原則，有助於整體造型提亮。
- 「配件點亮法」：在層次單薄時，利用小面積跳色（襪、帽）或焦點飾品（手錶、項鍊、皮帶）增加靈魂。
- 「視覺份量平衡」：新手先選 1~2 個飾品焦點，並注意左右手的視覺份量對稱平衡。

[每週金句資源庫]
- 「沒有不好的身材，只有還沒找到對的『磅數』與『比例』。」
- 「夏天穿的是『清爽感』，冬天穿的是『層次感』，而四季穿的都是『質感』。」
- 「配件不是可有可無的點綴，而是讓基礎款單品擁有靈魂的關鍵。」
- 「當你不知道穿什麼時，一件高磅數的白 T 與原色牛仔褲永遠不會背叛你。」
- 「所謂的『上淺下深』，不只是顏色搭配，更是視覺重心的穩固。」
- 「不要讓衣服穿你；當你感到不自在時，再貴的品牌也只是束縛。」
- 「寬鬆不代表邋遢，只要抓準『長度短、寬度夠』，矮個子也能穿出大氣場。」

任務：
1. 從上述「知識庫」中挑選「最符合該週穿搭情境」的一個主題作為知識卡內容（knowledge）。每週應呈現不同的教學重點。
2. 從「每週金句資源庫」中隨機挑選一句話作為金句內容（quote）。

請務必使用用戶指定的語言 (\${language === 'zh' ? '繁體中文' : 'English'}) 進行回應，並嚴格遵守 JSON 格式回應。
      `,
      }
    }));

    const text = response.text;
    // Extract JSON from potential markdown code blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI did not return a valid JSON structure");

    return JSON.parse(jsonMatch[0]) as {
      strengths: string;
      suggestions: string;
      quote: string;
      knowledge: { title: string, content: string }
    };
  } catch (err) {
    handleGeminiError(err);
  }
}

async function urlToBase64(url: string): Promise<{ data: string, mimeType: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const parts = result.split(',');
        if (parts.length !== 2) return reject(new Error("Invalid data URL"));
        const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        resolve({ data: parts[1], mimeType });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error(`[AWR] Failed to fetch image: ${url.substring(0, 50)}...`, err);
    throw err;
  }
}

export async function transformToSticker(imageUrl: string): Promise<string> {
  const ai = getAI();
  console.log(`[AWR] Transforming to sticker: ${imageUrl.substring(0, 50)}...`);
  try {
    const { data, mimeType } = await urlToBase64(imageUrl);

    const response = await executeWithRetry(() => ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          text: "Remove the background from the clothing item in the image and turn it into a sticker. Return only the image."
        },
        {
          inlineData: {
            mimeType: mimeType,
            data: data
          }
        }
      ],
    }));

    if (!response.candidates || response.candidates.length === 0) {
      console.error("[AWR] Gemini response has no candidates:", JSON.stringify(response, null, 2));
      throw new Error("Gemini did not return any candidates");
    }
    const imagePart = response.candidates[0]?.content?.parts.find(p => p.inlineData);
    if (imagePart?.inlineData) {
      console.log("[AWR] Successfully generated sticker");
      return `data:image/png;base64,${imagePart.inlineData.data}`;
    } else {
      const textResponse = response.text;
      console.warn("[AWR] Gemini returned text instead of an image:", textResponse);

      if (textResponse && (textResponse.toLowerCase().includes("clothing") || textResponse.toLowerCase().includes("garment"))) {
        throw new Error("The AI could not identify a clothing item in the image. Please provide a clear photo of a garment.");
      }

      throw new Error("Gemini did not return an image part");
    }
  } catch (err) {
    handleGeminiError(err);
  }
}

export async function generateProductImage(itemName: string): Promise<string> {
  const ai = getAI();
  console.log(`[AWR] Generating product image for: ${itemName}`);
  try {
    const prompt = `Professional e-commerce photography of a person wearing ${itemName}. The image should be a high-quality lifestyle shot, realistic high-street fashion aesthetic like Uniqlo and Zara. Focus on the person wearing the item naturally, showing intricate fabric texture and detailed stitching. Natural lighting, soft realistic shadows, high-resolution 8k, sharp focus. The background should be simple and clean.`;

    const response = await executeWithRetry(() => ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: {
        parts: [{ text: prompt }],
      },
    }));

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("Gemini did not return any candidates");
    }

    const imagePart = response.candidates[0]?.content?.parts.find(p => p.inlineData);
    if (imagePart?.inlineData) {
      return `data:image/png;base64,${imagePart.inlineData.data}`;
    } else {
      throw new Error("Gemini did not return an image part");
    }
  } catch (err) {
    handleGeminiError(err);
  }
}


export async function testConnection() {
  try {
    const ai = getAI();
    const response = await executeWithRetry(() => ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Say 'API Connection Successful'",
    }));
    return { success: true, message: response.text };
  } catch (err) {
    let errorMsg = "Unknown Error";
    if (err instanceof Error) errorMsg = err.message;
    else errorMsg = String(err);
    return { success: false, message: errorMsg };
  }
}

export async function chatWithAi(messages: { role: 'user' | 'model', text: string }[], systemInstruction?: string) {
  try {
    const ai = getAI();
    const response = await executeWithRetry(() => ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      })),
      config: {
        systemInstruction: systemInstruction || "You are a world-class fashion stylist and personal shopper. You help users create outfits, find their style, and feel confident in their clothes. Be encouraging, stylish, and concise.",
      }
    }));

    return response.text;
  } catch (err) {
    handleGeminiError(err);
  }
}

export async function classifyFashionItem(imageBase64: string): Promise<Category> {
  const ai = getAI();
  console.log(`[AWR] Classifying fashion item...`);
  try {
    const prompt = `
      Analyze this image and identify the category of the fashion item.
      Return ONLY one of the following category names: 'Tops', 'Bottoms', 'Shoes', 'Accessories'.
      
      Guidelines:
      - 'Tops': T-shirts, shirts, blouses, sweaters, hoodies, jackets, coats, blazers, vests, cardigans.
      - 'Bottoms': Pants, jeans, shorts, skirts, dresses, leggings, culottes, overalls.
      - 'Shoes': Sneakers, boots, heels, sandals, flats, loafers.
      - 'Accessories': Watches, hats, beanies, belts, bags, jewelry, scarves, ties, sunglasses, gloves.
      
      If the image contains multiple items, choose the most prominent one.
      If it's a tie, bowtie, or neckwear, it MUST be 'Accessories'.
      If it's trousers, shorts, or a skirt, it MUST be 'Bottoms'.
      Respond ONLY with the category keyword.
    `;

    const response = await executeWithRetry(() => ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        { text: prompt },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageBase64.split(',')[1] || imageBase64
          }
        }
      ],
    }));

    const text = response.text.trim();
    const validCategories: Category[] = ['Tops', 'Bottoms', 'Shoes', 'Accessories'];
    
    // Robust matching: check if any of the valid categories appear in the response (case-insensitive)
    for (const cat of validCategories) {
      if (text.toLowerCase().includes(cat.toLowerCase())) {
        console.log(`[AWR] AI Classified as: ${cat}`);
        return cat;
      }
    }
    
    console.warn(`[AWR] AI returned unrecognized category: ${text}. Defaulting to 'Tops'.`);
    return 'Tops';
  } catch (err) {
    console.error("[AWR] Classification failed:", err);
    return 'Tops'; // Safe fallback
  }
}

