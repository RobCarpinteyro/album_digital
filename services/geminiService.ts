import { GoogleGenAI, Type } from "@google/genai";
import { CardData, Department, Rarity } from '../types';

// Fallback data in case API fails or key is missing
const FALLBACK_ROSTER: CardData[] = Array.from({ length: 40 }, (_, i) => {
  const depts = Object.values(Department);
  const dept = depts[i % depts.length];
  return {
    id: i + 1,
    name: `Employee ${i + 1}`,
    role: `${dept} Specialist`,
    department: dept,
    rarity: i % 10 === 0 ? Rarity.LEGENDARY : i % 5 === 0 ? Rarity.EPIC : i % 3 === 0 ? Rarity.RARE : Rarity.COMMON,
    imageUrl: `https://picsum.photos/seed/${i + 1}/300/400`,
    description: "A hardworking employee dedicated to the company mission.",
    power: Math.floor(Math.random() * 100)
  };
});

export const fetchCompanyRoster = async (): Promise<CardData[]> => {
  if (!process.env.API_KEY) {
    console.warn("No API Key found, using fallback data.");
    return FALLBACK_ROSTER;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate a roster of 40 employees for a fictional tech startup called 'NebulaCorp'. Assign them to departments: Engineering, Design, Sales, Human Resources. Include a mix of rarities based on their 'importance' or 'uniqueness'. Make the descriptions funny or corporate-satirical.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              role: { type: Type.STRING },
              department: { type: Type.STRING, enum: ["Engineering", "Design", "Sales", "Human Resources"] },
              rarity: { type: Type.STRING, enum: ["Common", "Rare", "Epic", "Legendary"] },
              description: { type: Type.STRING },
              power: { type: Type.NUMBER, description: "A number between 1 and 99" }
            },
            required: ["name", "role", "department", "rarity", "description", "power"]
          }
        }
      }
    });

    const rawData = JSON.parse(response.text || "[]");
    
    // Map to our strict types and add IDs/Images
    return rawData.map((item: any, index: number) => ({
      id: index + 1,
      name: item.name,
      role: item.role,
      department: item.department as Department, // Assuming Gemini respects the enum string
      rarity: item.rarity as Rarity,
      description: item.description,
      power: item.power,
      imageUrl: `https://picsum.photos/seed/${item.name.replace(/\s/g, '')}${index}/300/400`
    }));

  } catch (error) {
    console.error("Gemini generation failed:", error);
    return FALLBACK_ROSTER;
  }
};
