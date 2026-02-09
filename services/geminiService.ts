// Funkcja pomocnicza do pobierania klucza
const getApiKey = (): string => {
  if (typeof window !== 'undefined') {
    // 1. Sprawdzamy ustawienia użytkownika (wpisane w aplikacji)
    const settings = localStorage.getItem('settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      if (parsed.geminiApiKey) return parsed.geminiApiKey;
    }
    // 2. Opcjonalnie: zmienna środowiskowa (jeśli jednak jakaś jest)
    // @ts-ignore
    if (import.meta.env.VITE_API_KEY) return import.meta.env.VITE_API_KEY;
  }
  return '';
};

export const analyzeMedicationImage = async (base64Image: string) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('Brak klucza API. Ustaw go w opcjach aplikacji.');

  // Używamy modelu ze zrzutu ekranu: gemini-2.5-flash
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  // Czyścimy base64 z nagłówka (np. "data:image/jpeg;base64,")
  const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

  const body = {
    contents: [{
      parts: [
        { text: "Przeanalizuj to zdjęcie opakowania leku. Wyciągnij nazwę, dawkę (np. 500mg), częstotliwość (jeśli widoczna), liczbę sztuk w opakowaniu i typ (tabletki/kapsułki). Zwróć TYLKO czysty JSON bez formatowania markdown." },
        {
          inline_data: {
            mime_type: "image/jpeg",
            data: cleanBase64
          }
        }
      ]
    }],
    generationConfig: {
      response_mime_type: "application/json",
      response_schema: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          dosage: { type: "STRING" },
          frequency: { type: "STRING" },
          packageSize: { type: "NUMBER" },
          unit: { type: "STRING" }
        },
        required: ["name", "dosage"]
      }
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Błąd API Gemini: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    // Parsowanie odpowiedzi
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(textResponse || '{}');

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const getMedicationInfo = async (name: string) => {
  const apiKey = getApiKey();
  if (!apiKey) return "Brak klucza API. Ustaw go w opcjach.";

  // Tutaj też używamy gemini-2.5-flash
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const body = {
    contents: [{
      parts: [{ text: `Opisz krótko lek ${name}: do czego służy, główne przeciwwskazania i czy należy brać z jedzeniem. Odpowiedz w punktach po polsku.` }]
    }]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Nie udało się pobrać informacji.";
  } catch (error) {
    console.error("Gemini Info Error:", error);
    return "Wystąpił błąd podczas łączenia z asystentem.";
  }
};

export const listAvailableModels = async () => {
  // Funkcja czysto diagnostyczna
  console.log("Funkcja dostępna, ale na telefonie zalecamy sprawdzenie ręczne.");
  return null;
};

export const isApiKeyConfigured = (): boolean => {
  return getApiKey().length > 0;
};
