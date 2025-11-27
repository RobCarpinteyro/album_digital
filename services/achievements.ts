
import { Achievement, UserState, CardData, Department, Rarity } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    title: 'Bienvenido a LICON',
    description: 'Abre tu primer sobre de tarjetas.',
    icon: '👋',
    rewardPacks: 1
  },
  {
    id: 'direction_complete',
    title: 'Líder Nato',
    description: 'Colecciona todas las tarjetas de Dirección.',
    icon: '👔',
    rewardPacks: 2
  },
  {
    id: 'sales_complete',
    title: 'Lobo de Ventas',
    description: 'Colecciona todas las tarjetas de Ventas.',
    icon: '💼',
    rewardPacks: 2
  },
  {
    id: 'marketing_complete',
    title: 'Genio Creativo',
    description: 'Colecciona todas las tarjetas de Marketing.',
    icon: '🎨',
    rewardPacks: 2
  },
  {
    id: 'hr_complete',
    title: 'Gestor de Talento',
    description: 'Colecciona todas las tarjetas de RR.HH.',
    icon: '🤝',
    rewardPacks: 2
  },
  {
    id: 'finance_complete',
    title: 'Maestro de los Números',
    description: 'Colecciona todas las tarjetas de Finanzas.',
    icon: '💰',
    rewardPacks: 2
  },
  {
    id: 'ops_complete',
    title: 'Ingeniero de Procesos',
    description: 'Colecciona todas las tarjetas de Operaciones.',
    icon: '⚙️',
    rewardPacks: 2
  },
  {
    id: 'it_complete',
    title: 'Hacker Ético',
    description: 'Colecciona todas las tarjetas de Sistemas.',
    icon: '💻',
    rewardPacks: 2
  },
  {
    id: 'logistics_complete',
    title: 'Estratega de Rutas',
    description: 'Colecciona todas las tarjetas de Logística.',
    icon: '🚚',
    rewardPacks: 2
  },
  {
    id: 'legend_hunter',
    title: 'Leyenda Viviente',
    description: 'Encuentra una carta de rareza Legendaria.',
    icon: '✨',
    rewardPacks: 3
  },
  {
    id: 'halfway_there',
    title: 'Mitad del Camino',
    description: 'Colecciona el 50% de las cartas únicas.',
    icon: '📈',
    rewardPacks: 1
  }
];

export const checkAchievements = (user: UserState, roster: CardData[]): string[] => {
  const newUnlocks: string[] = [];
  const ownedSet = new Set(user.collection);

  ACHIEVEMENTS.forEach(ach => {
    if (user.achievements.includes(ach.id)) return;

    let unlocked = false;

    switch (ach.id) {
      case 'first_step':
        unlocked = user.collection.length > 0;
        break;
      case 'direction_complete':
        unlocked = checkDeptComplete(Department.DIRECTION, roster, ownedSet);
        break;
      case 'sales_complete':
        unlocked = checkDeptComplete(Department.SALES, roster, ownedSet);
        break;
      case 'marketing_complete':
        unlocked = checkDeptComplete(Department.MARKETING, roster, ownedSet);
        break;
      case 'hr_complete':
        unlocked = checkDeptComplete(Department.HR, roster, ownedSet);
        break;
      case 'finance_complete':
        unlocked = checkDeptComplete(Department.FINANCE, roster, ownedSet);
        break;
      case 'ops_complete':
        unlocked = checkDeptComplete(Department.OPERATIONS, roster, ownedSet);
        break;
      case 'it_complete':
        unlocked = checkDeptComplete(Department.IT, roster, ownedSet);
        break;
      case 'logistics_complete':
        unlocked = checkDeptComplete(Department.LOGISTICS, roster, ownedSet);
        break;
      case 'legend_hunter':
        unlocked = roster.some(c => c.rarity === Rarity.LEGENDARY && ownedSet.has(c.id));
        break;
      case 'halfway_there':
        unlocked = roster.length > 0 && (ownedSet.size / roster.length) >= 0.5;
        break;
    }

    if (unlocked) {
      newUnlocks.push(ach.id);
    }
  });

  return newUnlocks;
};

const checkDeptComplete = (dept: Department, roster: CardData[], ownedSet: Set<number>) => {
  const deptCards = roster.filter(c => c.department === dept);
  if (deptCards.length === 0) return false;
  return deptCards.every(c => ownedSet.has(c.id));
};
