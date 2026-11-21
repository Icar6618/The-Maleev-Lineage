export type Gender = 'male' | 'female' | 'other';

export interface FamilyPhoto {
  url: string;
  caption?: string;
  year?: string;
}

export interface Person {
  id: string;
  roleLabel?: string; // напр. 'Я', 'Батько', 'Мати', 'Дідусь (по батькові)'
  firstName: string;
  lastName: string;
  middleName?: string;
  maidenName?: string;
  gender: Gender;
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
  deathPlace?: string;
  isLiving: boolean;
  avatarUrl?: string;
  audioUrl?: string;
  profession?: string;
  favoriteQuote?: string;
  bio?: string;
  generation: number;
  branch?: string;
  fatherId?: string;
  motherId?: string;
  spouseIds?: string[];
  childrenIds?: string[];
  tags?: string[];
  photos?: FamilyPhoto[];
}

export interface FamilyData {
  title: string;
  description: string;
  lastUpdated: string;
  persons: Person[];
}

export type ViewMode = 'tree' | 'cards' | 'timeline' | 'stats';
