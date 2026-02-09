import { GoogleGenAI, Type } from "@google/genai";

// Get API key from localStorage
const getApiKey = (): string => {
  if (typeof window !== 'undefined') {
    const settings = localStorage.getItem('settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      return parsed.geminiApiKey || '';
    }
  }
  return '';
};

// Initialize GoogleGenAI with the API key from localStorage
const getAI = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Brak klucza API Gemini. Dodaj go w Ustawieniach.');
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeMedicationImage = async (base64Image: string) => {
  const ai = getAI();
  const prompt = `Analyze this medication packaging. Extract the medication name, strength/dosage, recommended frequency if visible, and total number of units in the package. Return the data in JSON format in Polish.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
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

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const getMedicationInfo = async (name: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: `Opisz krótko lek ${name}: do czego służy, główne przeciwwskazania i czy należy brać z jedzeniem. Odpowiedz w punktach po polsku.`,
  });
  return response.text;
};

// Check if API key is configured
export const isApiKeyConfigured = (): boolean => {
  return getApiKey().length > 0;
};
