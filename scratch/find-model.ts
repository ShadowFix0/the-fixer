import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function findModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.list();
    const models = (response as any).models || response;
    const candidates = models.filter((m: any) => 
      m.supportedActions.includes("generateContent") && 
      !m.name.includes("vision") && 
      !m.name.includes("embedding")
    ).map((m: any) => m.name);
    console.log("Candidate Models:", candidates);
  } catch (error) {
    console.error("Error finding models:", error);
  }
}

findModel();
