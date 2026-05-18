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

export interface SchedulerGoal {
  id: string;
  title: string;
  description: string;
  category: 'Health' | 'Career' | 'Learning' | 'Relationships' | 'Finance' | 'Personal';
  priority: 'Low' | 'Medium' | 'High';
  targetDate: string; // YYYY-MM-DD
  estimatedHours: number;
  completed: boolean;
  progress: number; // 0-100
  createdAt: number;
}

export interface SchedulerHabit {
  id: string;
  title: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  preferredTime: string; // HH:MM format
  durationMinutes: number;
  streak: number;
  completedToday: boolean;
  energyCost: 'Low' | 'Medium' | 'High';
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface SchedulerTask {
  id: string;
  title: string;
  description: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:MM format
  durationMinutes: number;
  priority: 'Low' | 'Medium' | 'High';
  energyRequired: 'Low' | 'Medium' | 'High';
  focusRequired: 'Low' | 'Medium' | 'High';
  completed: boolean;
  relatedGoalId?: string;
  relatedHabitId?: string;
  createdAt: number;
}

export interface SchedulerEnergy {
  mental: number; // 0-100
  physical: number; // 0-100
  lastUpdated: number; // timestamp
  dailyPattern: Array<number>; // 24 values representing energy by hour
}

export interface SchedulerPreferences {
  sleepStart: string; // HH:MM
  sleepEnd: string; // HH:MM
  workStart: string; // HH:MM
  workEnd: string; // HH:MM
  productivityPeakStart: string; // HH:MM
  productivityPeakEnd: string; // HH:MM
  breakDuration: number; // minutes
  maxDailyHours: number; // hours
}

export interface SchedulerState {
  goals: SchedulerGoal[];
  habits: SchedulerHabit[];
  tasks: SchedulerTask[];
  energy: SchedulerEnergy;
  preferences: SchedulerPreferences;
  generatedSchedules: Record<string, any>; // date -> schedule data
  burnoutRisk: 'Low' | 'Medium' | 'High';
  lastOptimization: number; // timestamp
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
  scheduler: SchedulerState;
}
