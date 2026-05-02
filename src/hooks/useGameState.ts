/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { GameState, CharacterStats, Habit, Mission, Shadow, Boss, Rank, Difficulty, SystemMemory, Plan } from '../types';
import { XP_PER_LEVEL, RANK_THRESHOLDS, DIFFICULTY_MULTIPLIERS, HABIT_XP_REWARD, BOSS_DAMAGE_MULTIPLIER, PLAYER_DAMAGE_ON_FAIL } from '../constants';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const INITIAL_STATS: CharacterStats = {
  level: 1,
  xp: 0,
  maxXp: XP_PER_LEVEL(1),
  hp: 100,
  maxHp: 100,
  mp: 50,
  maxMp: 50,
  rank: 'E',
  gold: 0,
  strength: 10,
  intelligence: 10,
  agility: 10,
  vitality: 10,
  sense: 10,
};

const STORAGE_KEY = 'shadow_sovereign_v3_stable';

const INITIAL_MEMORY: SystemMemory = {
  interests: [],
  priorities: [],
  passions: [],
  dreams: [],
  problems: [],
  mistakes: [],
  otherNotes: [],
};

const DEFAULT_HABITS: Habit[] = [];

const INITIAL_MISSIONS: Mission[] = [];


export function useGameState() {
  const { user } = useAuth();
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      character: INITIAL_STATS,
      habits: DEFAULT_HABITS,
      activeBosses: [],
      missions: INITIAL_MISSIONS,
      shadows: [],
      plans: [],
      waterIntake: { targetLiters: 2, currentMl: 0 },
      isDopamineFastActive: false,
      lastResetDate: new Date().toISOString().split('T')[0],
      systemMemory: INITIAL_MEMORY,
    };
  });


  useEffect(() => {
    // Daily Reset Check
    const today = new Date().toISOString().split('T')[0];
    if (state.lastResetDate !== today) {
      setState(prev => ({
        ...prev,
        lastResetDate: today,
        habits: prev.habits.map(h => ({ ...h, completedToday: false, failedToday: false })),
        waterIntake: { ...(prev.waterIntake || { targetLiters: 2 }), currentMl: 0 },
        character: { ...prev.character, hp: prev.character.maxHp } // Daily HP restore
      }));
    }
  }, [state.lastResetDate]);

  useEffect(() => {
    // Ensure bad habits have active bosses
    const badHabits = state.habits.filter(h => !h.isPositive);
    const missingBosses = badHabits.filter(h => !state.activeBosses.some(b => b.habitId === h.id));
    
    if (missingBosses.length > 0) {
      const newBosses: Boss[] = missingBosses.map(h => ({
        id: `boss-${h.id}-${Date.now()}`,
        name: `روح ${h.title}`,
        hp: 100,
        maxHp: 100,
        phase: 1,
        rewardXp: 50,
        rewardGold: 20,
        habitId: h.id
      }));
      setState(prev => ({ ...prev, activeBosses: [...prev.activeBosses, ...newBosses] }));
    }
  }, [state.habits, state.activeBosses]);

  useEffect(() => {
    // Real-time Cloud Sync from Firestore
    if (user && user.uid !== 'guest') {
      const userRef = doc(db, 'users', user.uid);
      
      const unsubscribe = onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data() as GameState;
          // Only update if the cloud version is actually different to avoid loops
          setState(data);
        } else {
          // If the document doesn't exist yet (new user), we'll create it soon via the other useEffect
          console.log("No cloud data found, using local/initial state");
        }
      }, (err) => {
        console.error("Error listening to Firestore updates:", err);
      });

      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    // Update LocalStorage for offline cache
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    
    // Sync to Cloud as source of truth
    if (user && user.uid !== 'guest') {
      const userRef = doc(db, 'users', user.uid);
      setDoc(userRef, state, { merge: true }).catch(err => {
        console.error("Error syncing to Firestore:", err);
      });
    }
  }, [state, user]);

  const addXp = (amount: number) => {
    setState(prev => {
      let { level, xp, maxXp } = prev.character;
      xp += amount;
      
      while (xp >= maxXp) {
        xp -= maxXp;
        level += 1;
        maxXp = XP_PER_LEVEL(level);
      }

      return {
        ...prev,
        character: { ...prev.character, level, xp, maxXp }
      };
    });
  };

  const ascend = () => {
    setState(prev => {
      const { level, rank } = prev.character;
      
      const ranks: Rank[] = ['E', 'D', 'C', 'B', 'A', 'S'];
      const currentIndex = ranks.indexOf(rank);
      if (currentIndex === ranks.length - 1) return prev;

      const nextRank = ranks[currentIndex + 1];
      const threshold = RANK_THRESHOLDS[nextRank];

      if (level < threshold) return prev;

      return {
        ...prev,
        character: { 
          ...prev.character, 
          rank: nextRank,
          maxHp: prev.character.maxHp + 50,
          hp: prev.character.maxHp + 50,
        }
      };
    });
  };

  const recordSync = () => {
    const today = new Date().toISOString().split('T')[0];
    setState(prev => ({ ...prev, lastSyncDate: today }));
  };

  const completeHabit = (habitId: string) => {
    setState(prev => {
      const habit = prev.habits.find(h => h.id === habitId);
      // Constraint: Once per day, and cannot strike if already surrendered
      if (!habit || habit.completedToday || habit.failedToday) return prev;

      const multiplier = DIFFICULTY_MULTIPLIERS[habit.difficulty];
      const xpGain = HABIT_XP_REWARD * multiplier;

      let newBosses = [...prev.activeBosses];
      if (!habit.isPositive) {
        newBosses = newBosses.map(boss => {
          if (boss.habitId === habitId) {
            // Damage scales based on phase. Monarchs (Phase 2) take 1/7th health per day (week to defeat)
            const damage = boss.phase === 1 ? boss.maxHp : (boss.maxHp / 7);
            const newHp = Math.max(0, boss.hp - damage);
            
            // Check for evolution
            if (newHp === 0 && boss.phase === 1) {
              return {
                ...boss,
                name: `العاهل المتطور لـ ${habit.title}`,
                hp: 700,
                maxHp: 700,
                phase: 2,
                rewardXp: 500,
                rewardGold: 200,
              };
            }
            return { ...boss, hp: newHp };
          }
          return boss;
        });
      }

      const updatedHabits = prev.habits.map(h => 
        h.id === habitId ? { ...h, completedToday: true, streak: h.streak + 1 } : h
      );

      addXp(xpGain);

      return {
        ...prev,
        habits: updatedHabits,
        activeBosses: newBosses.filter(b => b.hp > 0 || b.phase === 1), // Phase 1 is removed on 0, Phase 2 is kept until 0
        character: { ...prev.character, gold: prev.character.gold + (10 * multiplier) }
      };
    });
  };

  const failHabit = (habitId: string) => {
     setState(prev => {
      const habit = prev.habits.find(h => h.id === habitId);
      // Constraint: Once per day, and cannot surrender if already struck
      if (!habit || habit.completedToday || habit.failedToday) return prev;

      const multiplier = DIFFICULTY_MULTIPLIERS[habit.difficulty];
      const damage = PLAYER_DAMAGE_ON_FAIL * multiplier;

      const updatedHabits = prev.habits.map(h => 
        h.id === habitId ? { ...h, failedToday: true, streak: 0 } : h
      );

      return {
        ...prev,
        habits: updatedHabits,
        character: { ...prev.character, hp: Math.max(0, prev.character.hp - damage) }
      };
    });
  };

  const addMission = (mission: Mission) => {
    setState(prev => ({ ...prev, missions: [...prev.missions, mission] }));
  };

  const addHabit = (habit: Habit) => {
    setState(prev => ({ ...prev, habits: [...prev.habits, { ...habit, failedToday: false }] }));
  };

  const deleteHabit = (habitId: string) => {
    setState(prev => ({ ...prev, habits: prev.habits.filter(h => h.id !== habitId) }));
  };

  const completeMission = (missionId: string) => {
    setState(prev => {
      const mission = prev.missions.find(m => m.id === missionId);
      if (!mission) return prev;

      addXp(mission.xpReward);
      
      return {
        ...prev,
        missions: prev.missions.filter(m => m.id !== missionId),
        character: { ...prev.character, gold: prev.character.gold + mission.goldReward }
      };
    });
  };

  const deleteMission = (missionId: string) => {
    setState(prev => ({ ...prev, missions: prev.missions.filter(m => m.id !== missionId) }));
  };

  const setDopamineFast = (active: boolean) => {
    setState(prev => ({ ...prev, isDopamineFastActive: active }));
  };

  const buyItem = (price: number, effect: string) => {
    setState(prev => {
      if (prev.character.gold < price) return prev;
      
      let character = { ...prev.character, gold: prev.character.gold - price };
      
      // Basic effect logic
      if (effect.includes('تجديد حياة +50')) {
        character.hp = Math.min(character.maxHp, character.hp + 50);
      } else if (effect.includes('خاصية +1')) {
        character.strength += 1; // Simplification
      }

      return { ...prev, character };
    });
  };

  const addShadow = (shadow: Shadow) => {
    setState(prev => ({ ...prev, shadows: [...prev.shadows, shadow] }));
  };

  const updateSystemMemory = (memory: Partial<SystemMemory>) => {
    setState(prev => ({
      ...prev,
      systemMemory: {
        ...(prev.systemMemory || INITIAL_MEMORY),
        ...memory
      }
    }));
  };

  const startMission = (missionId: string) => {
    setState(prev => ({
      ...prev,
      missions: prev.missions.map(m => 
        m.id === missionId ? { ...m, startTime: Date.now() } : m
      )
    }));
  };

  const setupNames = (playerName: string, systemName: string) => {
    setState(prev => ({
      ...prev,
      character: { ...prev.character, name: playerName },
      systemName
    }));
  };

  const addPlan = (plan: Plan) => {
    setState(prev => ({ ...prev, plans: [...(prev.plans || []), plan] }));
  };

  const deletePlan = (id: string) => {
    setState(prev => ({ ...prev, plans: prev.plans.filter(p => p.id !== id) }));
  };

  const updateWaterIntake = (ml: number) => {
    setState(prev => ({
      ...prev,
      waterIntake: {
        ...prev.waterIntake,
        currentMl: (prev.waterIntake?.currentMl || 0) + ml
      }
    }));
  };

  const setWaterGoal = (liters: number) => {
    setState(prev => ({
      ...prev,
      waterIntake: {
        ...prev.waterIntake,
        targetLiters: liters
      }
    }));
  };

  const updatePlan = (id: string, newContent: string) => {
    setState(prev => ({
      ...prev,
      plans: prev.plans.map(p => p.id === id ? { ...p, content: newContent } : p)
    }));
  };

  return {
    state,
    addXp,
    completeHabit,
    failHabit,
    addMission,
    startMission,
    completeMission,
    deleteMission,
    setDopamineFast,
    buyItem,
    addShadow,
    addHabit,
    deleteHabit,
    updateSystemMemory,
    ascend,
    recordSync,
    setupNames,
    addPlan,
    deletePlan,
    updatePlan,
    updateWaterIntake,
    setWaterGoal,
  };
}
