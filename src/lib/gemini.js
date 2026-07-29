/**
 * Google Gemini AI REST API Helper
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Send prompt to Google Gemini 2.5 Flash API
 */
export async function generateText(prompt, options = {}) {
  const apiKey = options.apiKey || GEMINI_API_KEY;

  if (!apiKey || apiKey === "your-gemini-api-key-here") {
    throw new Error("Gemini API Key 尚未設定。請在 .env 檔案中的 VITE_GEMINI_API_KEY 設定您的 API Key。");
  }

  const model = options.model || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxOutputTokens ?? 2048,
    },
  };

  if (options.systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: options.systemInstruction }],
    };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Gemini API Error (${response.status})`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];

  if (!candidate || !candidate.content?.parts?.[0]?.text) {
    throw new Error("Gemini 未返回有效的回應內容");
  }

  return candidate.content.parts[0].text;
}

/**
 * AI 幫撰寫/潤飾內文
 */
export async function polishContent(content, instruction = "") {
  const prompt = `你是一位專業的 UI/UX 設計師與資深前端工程師文章編輯。請幫忙潤飾以下文章內容，使其保持專業、流暢且具吸引力。

${instruction ? `特別要求：${instruction}\n` : ""}

原文內容：
${content}`;

  return await generateText(prompt, { temperature: 0.6 });
}

/**
 * AI 自動生成摘要
 */
export async function summarizeContent(content) {
  const prompt = `請針對以下作品/文章內容，寫出一段精鍊且吸引人的摘要（約 100~150 字），簡述專案目標、核心亮點與成果：

${content}`;

  return await generateText(prompt, { temperature: 0.5 });
}

/**
 * AI 自動生成標籤 (JSON Array)
 */
export async function generateTags(content) {
  const prompt = `請閱讀以下內容，並提取出 3 到 6 個最相關的關鍵字/標籤（例如：UI/UX, React, Figma, Branding, Design System）。
請只返回一個 JSON 陣列格式，例如 ["UI/UX", "React", "Figma"]，不要加任何 Markdown 語法或說明文字。

內容：
${content}`;

  const rawText = await generateText(prompt, { temperature: 0.3 });
  try {
    const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Fallback if parsing fails
  }

  return rawText.split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
}

/**
 * AI 生成專案/文章大綱
 */
export async function generateOutline(topic) {
  const prompt = `請為主題「${topic}」寫份完整的專案/文章大綱，包含：
1. 專案背景與痛點分析 (Background & Challenge)
2. 核心設計概念與解決方案 (Concept & Solution)
3. 關鍵功能與 UI/UX 亮點 (Key Features & Highlights)
4. 成果與心得總結 (Results & Learnings)

請使用清晰的 Markdown 標題 (H2, H3) 與列點。`;

  return await generateText(prompt, { temperature: 0.7 });
}
