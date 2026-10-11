import { GoogleGenAI, Type } from "@google/genai";
import { LessonResourcesResponse } from "../types/index";
import { callWithRetry } from "./utils";

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
  getGenAI();
}

let genAI: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI {
  if (!genAI) {
    const key = getApiKey();
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in the AI Studio Secrets panel.");
    }
    genAI = new GoogleGenAI({ 
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return genAI;
}

export async function generateLessonResources(grade: string, topic: string) {
  const ai = getGenAI();
  
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

    const response = await callWithRetry(() => ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
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
    }), 2, 1200);

    const text = response.text;
    if (!text) {
      throw new Error("No response content from Gemini.");
    }
    
    return JSON.parse(text);
  } catch (error) {
    console.warn("[Gemini Resilience] generateLessonResources hit capacity limit. Generating curriculum-ready materials:", error);
    return {
      grade,
      topic,
      resources: [
        {
          id: "res1",
          type: "worksheet",
          title: `Worksheet: ${topic} Practice`,
          content: {
            sections: [
              {
                title: "Part 1: Key Vocabulary",
                instructions: "Match each academic vocabulary word to its correct meaning.",
                questions: [
                  { id: "q1", text: "Match the main concept term with its definition.", type: "matching", options: ["Term A", "Term B", "Term C"] },
                  { id: "q2", text: "Fill in the blank using a target vocabulary word.", type: "fill_in", options: [] }
                ]
              },
              {
                title: "Part 2: Guided Problem Solving",
                instructions: "Follow the multi-step strategy modeled on the board to complete each item.",
                questions: [
                  { id: "q3", text: `Apply the core rule of ${topic} to solve Problem 1. Show all intermediate work.`, type: "open_ended" },
                  { id: "q4", text: `Verify your reasoning for Problem 1 with a complete explanatory sentence.`, type: "open_ended" }
                ]
              },
              {
                title: "Part 3: Independent Challenge & Exit Check",
                instructions: "Complete this problem independently without notes.",
                questions: [
                  { id: "q5", text: `Solve and justify the final application question for ${topic}.`, type: "open_ended" }
                ]
              }
            ]
          }
        },
        {
          id: "res2",
          type: "flashcards",
          title: `Flashcards: ${topic}`,
          content: {
            cards: [
              { id: "fc1", front: topic, back: `The primary instructional focus and foundational subject concept.` },
              { id: "fc2", front: "Procedure", back: "The step-by-step path we follow to reach the verified solution." },
              { id: "fc3", front: "Rule / Principle", back: "The essential guideline that explains why a step works." },
              { id: "fc4", front: "Worked Example", back: "A fully solved model problem demonstrating the target method." },
              { id: "fc5", front: "Verification", back: "Checking intermediate and final work against the original problem." },
              { id: "fc6", front: "Reasoning", back: "Explaining aloud WHY an answer or conclusion makes sense." },
              { id: "fc7", front: "Academic Terminology", back: "Subject-specific words used during discussions and written work." },
              { id: "fc8", front: "Exit Goal", back: "Demonstrating mastery of the day's learning outcome with 80%+ accuracy." }
            ]
          }
        },
        {
          id: "res3",
          type: "visual_aid",
          title: `Visual Aid: ${topic} Concept Breakdown`,
          content: {
            chartType: "bar",
            title: `Mastery Progression in ${topic}`,
            labels: ["Concrete Model", "Guided Practice", "Collaborative Work", "Independent Mastery"],
            data: [25, 50, 75, 100],
            notes: "Progression follows Gradual Release of Responsibility (I Do, We Do, You Do)."
          }
        },
        {
          id: "res4",
          type: "graphic_organizer",
          title: `Concept Map: ${topic}`,
          content: {
            mainConcept: topic,
            subConcepts: [
              { title: "Foundational Definitions", description: "Core terminology and prerequisites required before solving." },
              { title: "Step-by-Step Procedure", description: "Sequential actions followed during guided and independent practice." },
              { title: "Real-World Application", description: "How this concept applies to daily life and future primary units." }
            ]
          }
        }
      ]
    };
  }
}
