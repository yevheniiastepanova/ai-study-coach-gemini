// api/gemini.js

import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // ✅ ЯВНАЯ проверка ключа (очень важно для логов)
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is missing in environment variables",
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // ✅ ЕДИНСТВЕННО ПРАВИЛЬНАЯ МОДЕЛЬ ДЛЯ SDK 0.24.x
    const model = genAI.getGenerativeModel({
      model: "models/gemini-1.5-flash-latest",
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return res.status(200).json({ text });
  } catch (error) {
    console.error("Gemini API error:", error);

    // ✅ возвращаем реальное сообщение ошибки (для дебага)
    return res.status(500).json({
      error: error.message || "Gemini request failed",
    });
  }
}
