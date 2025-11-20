
import { Achievement, UserState, CardData, Department, Rarity } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    title: 'Rookie Collector',
    description: 'Open your first pack of cards.',
    icon: '🧢',
    rewardPacks: 1
  },
  {
    id: 'engineer_complete',
    title: 'Engineering Master',
    description: 'Collect all Engineering department cards.',
    icon: '🛠️',
    rewardPacks: 2
  },
  {
    id: 'design_complete',
    title: 'Design Guru',
    description: 'Collect all Design department cards.',
    icon: '🎨',
    rewardPacks: 2
  },
  {
    id: 'sales_complete',
    title: 'Top Closer',
    description: 'Collect all Sales department cards.',
    icon: '💼',
    rewardPacks: 2
  },
  {
    id: 'hr_complete',
    title: 'People Person',
    description: 'Collect all HR department cards.',
    icon: '👥',
    rewardPacks: 2
  },
  {
    id: 'executive_complete',
    title: 'Board Member',
    description: 'Collect all Executive department cards.',
    icon: '👑',
    rewardPacks: 3
  },
  {
    id: 'legend_hunter',
    title: 'Legend Hunter',
    description: 'Find a Legendary rarity card.',
    icon: '✨',
    rewardPacks: 2
  },
  {
    id: 'halfway_there',
    title: 'Halfway There',
    description: 'Collect 50% of the unique cards.',
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
      case 'engineer_complete':
        unlocked = checkDeptComplete(Department.ENGINEERING, roster, ownedSet);
        break;
      case 'design_complete':
        unlocked = checkDeptComplete(Department.DESIGN, roster, ownedSet);
        break;
      case 'sales_complete':
        unlocked = checkDeptComplete(Department.SALES, roster, ownedSet);
        break;
      case 'hr_complete':
        unlocked = checkDeptComplete(Department.HR, roster, ownedSet);
        break;
      case 'executive_complete':
        unlocked = checkDeptComplete(Department.EXECUTIVE, roster, ownedSet);
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
