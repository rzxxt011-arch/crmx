import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL } from '../constants';
// Fix: Removed unused import of useTranslation hook. Hooks can only be called inside React components.
// For service-level errors, generic messages are usually sufficient or passed from components.

interface GenerateTextOptions {
  model?: string;
  systemInstruction?: string;
  topK?: number;
  topP?: number;
  temperature?: number;
}

export const generateText = async (
  prompt: string,
  options?: GenerateTextOptions
): Promise<string> => {
  const model = options?.model || GEMINI_MODEL;
  
  // Create a new GoogleGenAI instance right before making an API call
  // to ensure it always uses the most up-to-date API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: options?.systemInstruction,
        topK: options?.topK,
        topP: options?.topP,
        temperature: options?.temperature,
      },
    });
    return response.text;
  } catch (error: any) {
    if (error.message.includes("Requested entity was not found.")) {
      // Assuming window.aistudio.openSelectKey() will be available in the environment
      // We assume key selection was successful after triggering openSelectKey() to mitigate race condition.
      await window.aistudio.openSelectKey();
      // Retry the request after key selection.
      // NOTE: This retry mechanism is simplified for demonstration.
      // In a real app, you might want more sophisticated retry logic or state management.
      const aiRetry = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const responseRetry: GenerateContentResponse = await aiRetry.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          systemInstruction: options?.systemInstruction,
          topK: options?.topK,
          topP: options?.topP,
          temperature: options?.temperature,
        },
      });
      return responseRetry.text;
    }
    // General error message (could be translated if this function was a hook or took a `t` param)
    console.error('Gemini API Error:', error);
    throw new Error(`Failed to generate content: ${error.message || 'Unknown error'}. Please check your API key and network connection. Billing documentation: ai.google.dev/gemini-api/docs/billing`);
  }
};
