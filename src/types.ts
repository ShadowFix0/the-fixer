/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export type Difficulty = 'Easy' | 'Normal' | 'Hardcore';

export type Job = 'Warrior' | 'Mage' | 'Assassin' | 'Tanker' | 'Healer';

export interface CharacterStats {
  name?: string;
  level: number;
  xp: number;
  maxXp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  rank: Rank;
  job?: Job;
  gold: number;
  strength: number;
  intelligence: number;
  agility: number;
  vitality: number;
  sense: number;
}

export interface Habit {
  id: string;
  title: string;
  difficulty: Difficulty;
  isPositive: boolean; // True for daily rites, False for bad habits (bosses)
  completedToday: boolean;
  failedToday: boolean;
  streak: number;
}

export interface Boss {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  phase: number; // 1 for scout, 2 for monarch (takes longer)
  rewardXp: number;
  rewardGold: number;
  image?: string;
  habitId: string; // The bad habit this boss represents
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'Quick' | 'Fated';
  isCompleted: boolean;
  xpReward: number;
  goldReward: number;
  isFocusMode?: boolean;
  durationMinutes?: number;
  startTime?: number;
  dueDate?: string;
  dueTime?: string;
  reminderTimeMinutes?: number; // How many minutes before deadline to notify
  reminderSent?: boolean;
}

export interface Shadow {
  id: string;
  name: string;
  rank: Rank;
  ability: string;
  image: string;
  isActive: boolean;
}

export interface SystemMemory {
  bio?: string;
  interests: string[];
  priorities: string[];
  passions: string[];
  dreams: string[];
  problems: string[];
  mistakes: string[];
  otherNotes: string[];
}

export interface PlanStep {
  id: string;
  title: string;
  isCompleted: boolean;
  type: 'mission' | 'milestone' | 'boss';
  tasks?: string[];
  location?: string;
}

export interface Plan {
  id: string;
  title: string;
  description?: string;
  category: string;
  steps: PlanStep[];
  currentStepIndex: number;
  createdAt: number;
}

export interface WaterIntake {
  targetLiters: number;
  currentMl: number;
  lastWaterTime: number;
}

export interface GameState {
  character: CharacterStats;
  habits: Habit[];
  activeBosses: Boss[];
  missions: Mission[];
  shadows: Shadow[];
  plans: Plan[];
  waterIntake: WaterIntake;
  isDopamineFastActive: boolean;
  dopamineFastEndTime?: number;
  lastResetDate: string; // YYYY-MM-DD
  lastSyncDate?: string; // YYYY-MM-DD
  systemMemory?: SystemMemory;
  systemName?: string;
  timezone?: string;
  theme: 'light' | 'dark' | 'poetry';
}
