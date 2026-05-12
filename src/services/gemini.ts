import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface Recipe {
  name: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  ingredients: {
    item: string;
    amount: string;
    isMissing?: boolean;
  }[];
  steps: {
    instruction: string;
    duration?: string;
  }[];
  nutrition: {
    calories: number;
    protein: string;
    carbs: string;
    fats: string;
    fiber?: string;
  };
}

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    description: { type: Type.STRING },
    prepTime: { type: Type.STRING },
    cookTime: { type: Type.STRING },
    servings: { type: Type.NUMBER },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING },
          amount: { type: Type.STRING },
          isMissing: { type: Type.BOOLEAN },
        },
        required: ["item", "amount"],
      },
    },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          instruction: { type: Type.STRING },
          duration: { type: Type.STRING },
        },
        required: ["instruction"],
      },
    },
    nutrition: {
      type: Type.OBJECT,
      properties: {
        calories: { type: Type.NUMBER },
        protein: { type: Type.STRING },
        carbs: { type: Type.STRING },
        fats: { type: Type.STRING },
        fiber: { type: Type.STRING },
      },
      required: ["calories", "protein", "carbs", "fats"],
    },
  },
  required: ["name", "description", "prepTime", "cookTime", "servings", "ingredients", "steps", "nutrition"],
};

export async function getRecipeSuggestions(pantry: string[], servings: number): Promise<Recipe[]> {
  const prompt = `Actúa como un experto chef chileno. 
  Tengo estos ingredientes en mi cocina: ${pantry.join(", ")}.
  Sugiere exactamente 3 recetas distintas (pueden ser desayuno, almuerzo, once, dulce o salado) que se puedan preparar preferentemente con lo que tengo.
  
  REGLAS ESTRICTAS:
  1. Contexto: CHILE. Usa términos e ingredientes locales (ej: palta, zapallo camote, marraqueta, harina con polvos, manjar, posta negra, etc.).
  2. Ajusta las cantidades para ${servings} personas.
  3. Si faltan ingredientes para completar la receta, inclúyelos y márcalos como isMissing: true.
  4. Entrega opciones variadas (ej: una salada, una dulce, una rápida).`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: recipeSchema,
      },
    },
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Error parsing Gemini response:", e);
    return [];
  }
}

export async function getSpecificRecipe(query: string, pantry: string[], servings: number): Promise<Recipe | null> {
  const prompt = `Quiero cocinar: ${query} para ${servings} personas. 
  CONTEXTO IMPORTANTE: Estoy en Chile. Los ingredientes deben ser fáciles de encontrar en supermercados chilenos y las cantidades deben estar ajustadas para ${servings} porciones.
  Tengo estos ingredientes: ${pantry.join(", ")}. 
  Dame la receta detallada. Por favor, identifica qué ingredientes de la receta NO tengo en mi lista y márcalos como isMissing: true.
  Los que sí tengo, márcalos como isMissing: false.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: recipeSchema,
    },
  });

  try {
    return JSON.parse(response.text || "null");
  } catch (e) {
    console.error("Error parsing Gemini response:", e);
    return null;
  }
}
