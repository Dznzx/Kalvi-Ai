
import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from "../types";
import { supabase } from "./supabaseClient";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateQuiz = async (topicOrContent: string, isTamil: boolean): Promise<QuizQuestion[]> => {
  const client = getClient();
  if (!client) {
    throw new Error("AI API Key is missing. Please check your environment variables.");
  }

  const systemInstruction = isTamil 
    ? "நீங்கள் ஒரு அனுபவமிக்க ஆசிரியர். வழங்கப்பட்ட தலைப்பில் 3 சவாலான பல்தேர்வு கேள்விகளைத் தமிழில் உருவாக்கவும். பதில்கள் மற்றும் விளக்கங்கள் தெளிவாக இருக்க வேண்டும்."
    : "You are an expert AI tutor. Generate 3 challenging multiple-choice questions about the provided topic. Provide 4 options for each, the correct answer index (0-3), and a helpful explanation.";

  const prompt = `Generate a quiz about: ${topicOrContent}. Language: ${isTamil ? 'Tamil' : 'English'}`;

  try {
    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: "The text of the quiz question.",
              },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Four multiple choice options.",
              },
              correctAnswerIndex: {
                type: Type.NUMBER,
                description: "The 0-based index of the correct option.",
              },
              explanation: {
                type: Type.STRING,
                description: "A short explanation of why the answer is correct.",
              },
            },
            required: ["question", "options", "correctAnswerIndex", "explanation"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("AI returned an empty response.");
    
    return JSON.parse(text) as QuizQuestion[];
  } catch (e: any) {
    console.error("AI Quiz Generation Error:", e?.message || e);
    throw new Error(isTamil ? "AI வினாடி வினாவை உருவாக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்." : "Failed to generate AI quiz. Please try again.");
  }
};

export const generateChatResponse = async (prompt: string, history: any[], isTamil: boolean) => {
  const client = getClient();
  if (!client) return "API Key missing.";
  try {
    const chat = client.chats.create({ 
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: isTamil 
          ? "நீங்கள் Kalvi.AI-ன் உதவியாளர். மாணவர்களுக்குக் கனிவாகவும் தெளிவாகவும் தமிழில் பதிலளிக்கவும்."
          : "You are the Kalvi.AI assistant. Help students with their queries in a friendly and professional manner."
      }
    });
    const result = await chat.sendMessage({ message: prompt });
    return result.text || "";
  } catch (e: any) { 
    return `Error: ${e?.message || "Connection failed"}`; 
  }
};

export const generateTamilTranslations = async (titleEn: string, descEn: string) => {
  const client = getClient();
  if (!client) return null;
  try {
    const result = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following to Tamil. Return JSON only with fields 'titleTa' and 'descTa'.\nTitle: ${titleEn}\nDescription: ${descEn}`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titleTa: { type: Type.STRING },
            descTa: { type: Type.STRING }
          },
          required: ["titleTa", "descTa"]
        }
      }
    });
    return JSON.parse(result.text || "{}");
  } catch (e) { return null; }
};

export const summarizeLesson = async (content: string, isTamil: boolean) => {
  const client = getClient();
  if (!client) return "";
  try {
    const result = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Summarize this lesson content briefly ${isTamil ? 'in Tamil' : 'in English'}:\n\n${content}`
    });
    return result.text || "";
  } catch (e) { return ""; }
};

export const explainConcept = async (text: string, isTamil: boolean) => {
  const client = getClient();
  if (!client) return "";
  try {
    const result = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Explain this concept to a 12-year old student ${isTamil ? 'in simple Tamil' : 'in simple English'}:\n\n${text}`
    });
    return result.text || "";
  } catch (e) { return ""; }
};

export const generateAssistantHelp = async (content: string, query: string, isTamil: boolean) => {
  const client = getClient();
  if (!client) return "";
  try {
    const result = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Context: ${content}\n\nStudent Question: ${query}\n\nAnswer ${isTamil ? 'in Tamil' : 'in English'}:`
    });
    return result.text || "";
  } catch (e) { return ""; }
};
