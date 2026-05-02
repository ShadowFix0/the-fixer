/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Rank, Difficulty } from './types';

export const XP_PER_LEVEL = (level: number) => Math.floor(100 * Math.pow(1.2, level - 1));

export const RANK_THRESHOLDS: Record<Rank, number> = {
  'E': 1,
  'D': 10,
  'C': 25,
  'B': 50,
  'A': 80,
  'S': 100,
};

export const DIFFICULTY_MULTIPLIERS: Record<Difficulty, number> = {
  'Easy': 1,
  'Normal': 2.5,
  'Hardcore': 5,
};

export const HABIT_XP_REWARD = 20;
export const MISSION_XP_REWARD = 50;

export const BOSS_DAMAGE_MULTIPLIER = 10;
export const PLAYER_DAMAGE_ON_FAIL = 15;

export const JOBS = [
  { id: 'Warrior', name: 'محارب', description: 'يركز على القوة البدنية والتمارين.' },
  { id: 'Mage', name: 'ساحر', description: 'يركز على التعلم والذكاء.' },
  { id: 'Assassin', name: 'مغتال', description: 'يركز على السرعة والمهام السريعة.' },
  { id: 'Tanker', name: 'مدرع', description: 'يركز على التحمل والعادات القاسية.' },
  { id: 'Healer', name: 'معالج', description: 'يركز على الصحة النفسية والراحة.' },
];
