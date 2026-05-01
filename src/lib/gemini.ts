import { GoogleGenAI, Type } from "@google/genai";
import { LessonResourcesResponse } from "../types/index";

const getApiKey = () => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    console.error("GEMINI_API_KEY is not set. Please ensure you have configured it in the AI Studio Secrets panel.");
  }
  return key || '';
};

const ai = new GoogleGenAI({
  apiKey: getApiKey()
});

export async function generateLessonResources(grade: string, topic: string) {
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

  return JSON.parse(response.text);
}
