
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
          ? "நீங்கள் Kalvi.AI-ன் உதவியாளர். மாணவர்களுக்குக் கனிவாகவும் தெளிவாகவும் தமிழில் பதிலளிக்கவும். இந்த பதில் குரலில் படிக்கப்படும், எனவே நட்சத்திரங்கள் (**), தலைப்புகள் (#), அல்லது பட்டியல் குறியீடுகள் போன்ற markdown வடிவமைப்பைப் பயன்படுத்த வேண்டாம். வெறும் இயல்பான வாக்கியங்களில் பதிலளிக்கவும்."
          : "You are the Kalvi.AI assistant. Help students with their queries in a friendly and professional manner. This response will be read aloud, so do not use markdown formatting like asterisks, headers, or bullet points — respond in plain natural sentences only."
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

export interface SkillGapResult {
  matchScore: number;
  strengths: string[];
  gaps: { skill: string; why: string; howToLearn: string }[];
  recommendedNextStep: string;
}

export const analyzeSkillGap = async (
  targetCareer: string,
  currentSkills: string,
  gradeGroup: string,
  isTamil: boolean
): Promise<SkillGapResult> => {
  const client = getClient();
  if (!client) {
    throw new Error(isTamil ? "AI API Key இல்லை." : "AI API Key is missing. Please check your environment variables.");
  }

  const systemInstruction = isTamil
    ? "நீங்கள் ஒரு தொழில் வழிகாட்டி ஆலோசகர். மாணவரின் இலக்கு தொழிலுக்கும் தற்போதைய திறன்களுக்கும் இடையிலான இடைவெளியை பகுப்பாய்வு செய்து தமிழில் பதிலளிக்கவும்."
    : "You are a career skills advisor for Indian school students. Analyze the gap between a student's current skills and their target career, and respond in clear, encouraging language.";

  const prompt = `Target career: ${targetCareer}\nStudent grade group: ${gradeGroup}\nCurrent skills/subjects the student is confident in: ${currentSkills || 'Not specified'}\n\nProvide a match score (0-100) between current skills and the target career, 2-4 strengths, 3-5 concrete skill gaps (each with why it matters and how to start learning it, keeping suggestions age-appropriate and free/low-cost where possible), and one recommended first action to take this week.`;

  try {
    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.NUMBER, description: "0-100 fit score between current skills and target career." },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            gaps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  skill: { type: Type.STRING },
                  why: { type: Type.STRING },
                  howToLearn: { type: Type.STRING },
                },
                required: ["skill", "why", "howToLearn"],
              },
            },
            recommendedNextStep: { type: Type.STRING },
          },
          required: ["matchScore", "strengths", "gaps", "recommendedNextStep"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("AI returned an empty response.");
    return JSON.parse(text) as SkillGapResult;
  } catch (e: any) {
    console.error("AI Skill Gap Error:", e?.message || e);
    throw new Error(isTamil ? "திறன் இடைவெளி பகுப்பாய்வை உருவாக்க முடியவில்லை." : "Failed to analyze skill gap. Please try again.");
  }
};

export const synthesizeSpeech = async (text: string): Promise<string | null> => {
  const client = getClient();
  if (!client) return null;
  try {
    const response = await client.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: text,
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" }
          }
        }
      }
    });
    const part = response.candidates?.[0]?.content?.parts?.[0] as any;
    const audioData = part?.inlineData?.data;
    return audioData || null;
  } catch (e: any) {
    console.error("TTS generation error:", e?.message || e);
    return null;
  }
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
