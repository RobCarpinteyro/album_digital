
export enum Department {
  ENGINEERING = 'Engineering',
  DESIGN = 'Design',
  SALES = 'Sales',
  HR = 'Human Resources',
  EXECUTIVE = 'Executive'
}

export enum Rarity {
  COMMON = 'Common',
  RARE = 'Rare',
  EPIC = 'Epic',
  LEGENDARY = 'Legendary'
}

export interface CardData {
  id: number;
  name: string;
  role: string;
  department: Department;
  rarity: Rarity;
  imageUrl: string;
  description: string;
  power: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rewardPacks: number;
}

export interface UserState {
  name: string;
  email: string;
  isRegistered: boolean;
  collection: number[]; // Array of Card IDs owned
  duplicates: Record<number, number>; // Card ID -> Count
  lastPackOpened: number | null; // Timestamp
  achievements: string[]; // IDs of unlocked achievements
  packsAvailable: number; // Number of packs waiting to be opened (rewards)
}

export interface TradeOffer {
  id: string;
  userName: string;
  offering: number[];
  requesting: Department;
}
