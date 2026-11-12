// POST /api/gemini — server-side proxy to Google Gemini. Admin only.
import { requireAdmin, readJson, sendJson } from "./_auth.js";

const MODEL = "gemini-2.5-flash";
const MAX_PROMPT_CHARS = 30000;
const MAX_OUTPUT_TOKENS = 4096;

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method Not Allowed" });
  }

  const auth = await requireAdmin(req);
  if (!auth.ok) return sendJson(res, auth.status, { error: auth.message });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return sendJson(res, 500, { error: "GEMINI_API_KEY 尚未設定" });

  const body = await readJson(req);
  if (!body || typeof body.prompt !== "string" || !body.prompt.trim()) {
    return sendJson(res, 400, { error: "缺少 prompt" });
  }
  if (body.prompt.length > MAX_PROMPT_CHARS) {
    return sendJson(res, 413, { error: `內容過長（上限 ${MAX_PROMPT_CHARS} 字元）` });
  }

  const temperature = clamp(Number(body.temperature ?? 0.7) || 0, 0, 1);
  const maxOutputTokens = clamp(Number(body.maxOutputTokens ?? 2048) || 2048, 1, MAX_OUTPUT_TOKENS);

  const payload = {
    contents: [{ parts: [{ text: body.prompt }] }],
    generationConfig: { temperature, maxOutputTokens },
  };
  if (typeof body.systemInstruction === "string" && body.systemInstruction.trim()) {
    payload.systemInstruction = { parts: [{ text: body.systemInstruction.slice(0, 5000) }] };
  }

  let upstream;
  try {
    upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify(payload),
      }
    );
  } catch {
    return sendJson(res, 502, { error: "無法連線到 Gemini" });
  }

  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    return sendJson(res, upstream.status, { error: data.error?.message || `Gemini API Error (${upstream.status})` });
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return sendJson(res, 502, { error: "Gemini 未返回有效的回應內容" });

  return sendJson(res, 200, { text });
}
