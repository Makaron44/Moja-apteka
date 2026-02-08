
import { GoogleGenAI, Type } from "@google/genai";

// Always initialize GoogleGenAI with the API key from process.env.API_KEY
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeMedicationImage = async (base64Image: string) => {
  const ai = getAI();
  const prompt = `Analyze this medication packaging. Extract the medication name, strength/dosage, recommended frequency if visible, and total number of units in the package. Return the data in JSON format in Polish.`;

  try {
    // Generate content using the multimodal parts structure recommended in guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Name of the medication" },
            dosage: { type: Type.STRING, description: "Strength/Dosage (e.g. 500mg)" },
            frequency: { type: Type.STRING, description: "How often to take (in Polish)" },
            packageSize: { type: Type.NUMBER, description: "Total units in full package" },
            unit: { type: Type.STRING, description: "Unit type: tabletki, kapsułki, ml, etc." }
          },
          required: ["name", "dosage"]
        }
      }
    });

    // Access the text property directly (not as a method)
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const getMedicationInfo = async (name: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Opisz krótko lek ${name}: do czego służy, główne przeciwwskazania i czy należy brać z jedzeniem. Odpowiedz w punktach po polsku.`,
  });
  // Access the text property directly
  return response.text;
};
