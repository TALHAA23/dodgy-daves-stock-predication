import { genAI } from "./gemini-api";
import { SafetyFilterLevel, HarmCategory } from "@google/genai";

export default async function safeAi(prompt) {
  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      config: {
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: SafetyFilterLevel.BLOCK_LOW_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: SafetyFilterLevel.BLOCK_LOW_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: SafetyFilterLevel.BLOCK_LOW_AND_ABOVE,
          },
        ],
      },
    });
    console.log(response);
  } catch (err) {
    console.log(err);
  }
}
