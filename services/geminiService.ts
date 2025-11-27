
import { GoogleGenAI, Type } from "@google/genai";
import { CardData, Department, Rarity } from '../types';

const TOTAL_EMPLOYEES = 250;

// --- AQUÍ ES DONDE DEBES PONER TUS 7 TARJETAS ---
// Reemplaza los valores de 'name', 'role', 'imageUrl', etc. con tus datos reales.
const FIXED_STARTER_CARDS: CardData[] = [
  {
    id: 1,
    name: "Nombre Tarjeta 1",
    role: "Puesto 1",
    department: Department.DIRECTION, // Cambia al departamento correcto
    rarity: Rarity.LEGENDARY,
    imageUrl: "https://via.placeholder.com/300x400?text=Tarjeta+1", // PEGA AQUÍ TU URL O BASE64
    description: "Descripción personalizada para la tarjeta número 1.",
    power: 99
  },
  {
    id: 2,
    name: "Nombre Tarjeta 2",
    role: "Puesto 2",
    department: Department.SALES,
    rarity: Rarity.EPIC,
    imageUrl: "https://via.placeholder.com/300x400?text=Tarjeta+2",
    description: "Descripción personalizada para la tarjeta número 2.",
    power: 95
  },
  {
    id: 3,
    name: "Nombre Tarjeta 3",
    role: "Puesto 3",
    department: Department.MARKETING,
    rarity: Rarity.EPIC,
    imageUrl: "https://via.placeholder.com/300x400?text=Tarjeta+3",
    description: "Descripción personalizada para la tarjeta número 3.",
    power: 92
  },
  {
    id: 4,
    name: "Nombre Tarjeta 4",
    role: "Puesto 4",
    department: Department.HR,
    rarity: Rarity.RARE,
    imageUrl: "https://via.placeholder.com/300x400?text=Tarjeta+4",
    description: "Descripción personalizada para la tarjeta número 4.",
    power: 88
  },
  {
    id: 5,
    name: "Nombre Tarjeta 5",
    role: "Puesto 5",
    department: Department.FINANCE,
    rarity: Rarity.RARE,
    imageUrl: "https://via.placeholder.com/300x400?text=Tarjeta+5",
    description: "Descripción personalizada para la tarjeta número 5.",
    power: 85
  },
  {
    id: 6,
    name: "Nombre Tarjeta 6",
    role: "Puesto 6",
    department: Department.OPERATIONS,
    rarity: Rarity.COMMON,
    imageUrl: "https://via.placeholder.com/300x400?text=Tarjeta+6",
    description: "Descripción personalizada para la tarjeta número 6.",
    power: 80
  },
  {
    id: 7,
    name: "Nombre Tarjeta 7",
    role: "Puesto 7",
    department: Department.IT,
    rarity: Rarity.COMMON,
    imageUrl: "https://via.placeholder.com/300x400?text=Tarjeta+7",
    description: "Descripción personalizada para la tarjeta número 7.",
    power: 78
  }
];

const FIXED_COUNT = FIXED_STARTER_CARDS.length;

// Fallback data in Spanish for LICON Corporate (Starting from ID 8)
const FALLBACK_ROSTER: CardData[] = Array.from({ length: TOTAL_EMPLOYEES - FIXED_COUNT }, (_, i) => {
  const realIndex = i + FIXED_COUNT;
  const depts = Object.values(Department);
  const dept = depts[realIndex % depts.length];
  return {
    id: realIndex + 1,
    name: `Colaborador ${realIndex + 1}`,
    role: `Especialista en ${dept}`,
    department: dept,
    rarity: realIndex % 20 === 0 ? Rarity.LEGENDARY : realIndex % 10 === 0 ? Rarity.EPIC : realIndex % 5 === 0 ? Rarity.RARE : Rarity.COMMON,
    imageUrl: `https://picsum.photos/seed/${realIndex + 1}/300/400`,
    description: "Comprometido con la excelencia y los valores de LICON.",
    power: Math.floor(Math.random() * 100)
  };
});

export const fetchCompanyRoster = async (): Promise<CardData[]> => {
  // Always start with the fixed cards
  let finalRoster: CardData[] = [...FIXED_STARTER_CARDS];

  if (!process.env.API_KEY) {
    console.warn("No API Key found, using fallback data.");
    return [...finalRoster, ...FALLBACK_ROSTER];
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Genera una lista de 40 empleados corporativos para la empresa 'LICON'. Asígnalos a los departamentos: Dirección, Ventas, Marketing, Recursos Humanos, Finanzas, Operaciones, Sistemas, Logística. Incluye una mezcla de rarezas. Roles como 'Director General', 'Gerente Regional', 'Analista Senior', 'Desarrollador Full Stack', 'Contador', 'Jefe de Almacén'. Descripciones profesionales pero inspiradoras en Español.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              role: { type: Type.STRING },
              department: { type: Type.STRING, enum: ["Dirección", "Ventas", "Marketing", "Recursos Humanos", "Finanzas", "Operaciones", "Sistemas", "Logística"] },
              rarity: { type: Type.STRING, enum: ["Común", "Rara", "Épica", "Legendaria"] },
              description: { type: Type.STRING },
              power: { type: Type.NUMBER, description: "Un número entre 1 y 99" }
            },
            required: ["name", "role", "department", "rarity", "description", "power"]
          }
        }
      }
    });

    const rawData = JSON.parse(response.text || "[]");
    
    // Expand to fill the rest of the 250 slots (minus the fixed ones)
    const remainingSlots = TOTAL_EMPLOYEES - FIXED_COUNT;

    for (let i = 0; i < remainingSlots; i++) {
        const currentId = i + FIXED_COUNT + 1;
        // Use generated data, cycle through it if we run out
        const template = rawData.length > 0 ? rawData[i % rawData.length] : FALLBACK_ROSTER[i];
        
        const isClone = i >= rawData.length;
        
        finalRoster.push({
            id: currentId,
            name: isClone ? `${template.name} (${currentId})` : template.name,
            role: template.role,
            department: template.department as Department,
            rarity: template.rarity as Rarity,
            description: template.description,
            power: isClone ? Math.floor(Math.random() * 100) : template.power,
            imageUrl: `https://picsum.photos/seed/${template.name.replace(/\s/g, '')}${currentId}/300/400`
        });
    }
    
    return finalRoster;

  } catch (error) {
    console.error("Gemini generation failed:", error);
    return [...finalRoster, ...FALLBACK_ROSTER];
  }
};

// New Helper to Apply Admin Overrides
export const getMergedRoster = (generatedRoster: CardData[]): CardData[] => {
    const storedOverrides = localStorage.getItem('licon_custom_cards');
    if (!storedOverrides) return generatedRoster;

    try {
        const overrides: Record<number, CardData> = JSON.parse(storedOverrides);
        return generatedRoster.map(card => {
            if (overrides[card.id]) {
                return { ...card, ...overrides[card.id] };
            }
            return card;
        });
    } catch (e) {
        console.error("Failed to parse custom cards", e);
        return generatedRoster;
    }
}
