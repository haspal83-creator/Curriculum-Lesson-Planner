import { GoogleGenAI, Type } from "@google/genai";
import { LessonResourcesResponse } from "../types/index";

const getApiKey = () => {
  // On the server, we use process.env directly.
  // We keep import.meta.env for potential compatibility if vite is used for server bundles.
  const key = process.env.GEMINI_API_KEY || (import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : undefined);
  
  if (!key || key === 'undefined' || key === 'null') {
    return '';
  }
  return key;
};

/**
 * Validates that the API key is present before attempting an AI call.
 * This prevents obscure SDK errors and provides clear feedback.
 */
export function validateGeminiConfig() {
  if (!getApiKey()) {
    throw new Error("Gemini API key is missing. Please configure it in the project settings.");
  }
}

export const ai = new GoogleGenAI({
  apiKey: getApiKey()
});

export async function generateLessonResources(grade: string, topic: string) {
  validateGeminiConfig();
  
  try {
    const prompt = `Generate educational resources for a ${grade} lesson on "${topic}". 
    Provide exactly 4 resources: 
    1. A student worksheet with multiple sections (vocabulary, comprehension, application).
    2. A set of at least 8 flashcards (front and back).
    3. A visual aid (data for a bar chart or diagram related to the topic).
    4. A graphic organizer. Choose the most appropriate type: 'venn', 'story_map', 'concept_map', or 'kwl'.

    For 'venn', provide: { "leftTitle": "...", "rightTitle": "...", "leftItems": [...], "rightItems": [...], "commonItems": [...] }
    For 'story_map', provide: { "setting": "...", "problem": "...", "solution": "...", "events": [...] }
    For 'concept_map', provide: { "mainConcept": "...", "subConcepts": [{ "title": "...", "description": "..." }] }
    For 'kwl', provide: {} (it will be rendered as a blank template for students).

    Do not include lesson plan text. Only the resource data.
    Format the output as a JSON object matching the following structure:
    {
      "grade": "${grade}",
      "topic": "${topic}",
      "resources": [
        {
          "id": "res1",
          "type": "worksheet",
          "title": "Worksheet: ${topic}",
          "content": {
            "sections": [
              {
                "title": "Part 1: Vocabulary",
                "instructions": "Match the words to their definitions.",
                "questions": [
                  { "id": "q1", "text": "...", "type": "matching", "options": ["..."] }
                ]
              }
            ]
          }
        },
        ...
      ]
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            grade: { type: Type.STRING },
            topic: { type: Type.STRING },
            resources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  title: { type: Type.STRING },
                  content: { type: Type.OBJECT }
                },
                required: ["id", "type", "title", "content"]
              }
            }
          },
          required: ["grade", "topic", "resources"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response content from Gemini.");
    }
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error (generateLessonResources):", error);
    throw new Error("Failed to generate lesson resources. Please check your connection and API key.");
  }
}
