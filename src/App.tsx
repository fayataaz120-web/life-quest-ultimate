/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppState, PlayerProfile, Quest, Activity, ShopItem, PlayerClass, Category, JourneyHistoryEntry, RoadmapItem } from './types';
import { INITIAL_STATE } from './data/initialData';
import { LucideIcon } from './components/LucideIcon';
import { sfx } from './utils/audio';

// Tabs
import { Dashboard } from './components/Dashboard';
import { Categories } from './components/Categories';
import { QuestPage } from './pages/Quest';
import { SkillTreeTab } from './components/SkillTreeTab';
import { RewardShop } from './components/RewardShop';
import { LongTermDatabase } from './components/LongTermDatabase';
import { Analytics } from './components/Analytics';
import { ExcelSync } from './components/ExcelSync';
import { CharacterCreation } from './components/CharacterCreation';
import { AICoach } from './components/AICoach';
import { CompanionLiveView } from './components/CompanionLiveView';
import { CompanionPage } from './pages/Companion';
import { JourneyPage } from './pages/Journey';
import { Calendar } from './pages/Calendar';
import { RoadmapTab } from './components/RoadmapTab';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ProfileMenu } from './components/ProfileMenu';
import { AnimatePresence, motion } from 'motion/react';
import { ScrollProgress } from './animations/ScrollProgress';
import { PageTransition } from './animations/PageTransition';
import { AmbientEffects } from './animations/AmbientEffects';
import { WeatherSystem } from './animations/WeatherSystem';
import { CursorMagic } from './animations/CursorMagic';
import { NotificationSystem } from './animations/NotificationSystem';
import { CinematicManager } from './animations/CinematicManager';
import { NotificationProvider } from './context/NotificationProvider';
import { NotificationBell } from './components/Notification/NotificationBell';
import { NotificationCenter } from './components/Notification/NotificationCenter';

const STORAGE_KEY = 'life_quest_ultimate_state';

export function AppContent() {
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('life_quest_active_session_email');
  });

  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  const [usersRegistry, setUsersRegistry] = useState<{ [email: string]: string }>(() => {
    try {
      const stored = localStorage.getItem('life_quest_users_registry');
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  });

  const [state, rawSetState] = useState<AppState>(() => {
    try {
      const activeUser = localStorage.getItem('life_quest_active_session_email');
      const key = activeUser ? `life_quest_state_${activeUser}` : STORAGE_KEY;
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.roadmap) parsed.roadmap = [];
        return parsed;
      }
    } catch (e) {
      console.warn("Failed to load local storage state:", e);
    }
    return INITIAL_STATE;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'categories' | 'quests' | 'skills' | 'shop' | 'databases' | 'analytics' | 'excel' | 'coach' | 'companion' | 'journeys' | 'calendar' | 'roadmap'>('dashboard');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [overrideEmotion, setOverrideEmotion] = useState<string | undefined>(undefined);
  const [customCompanionMsg, setCustomCompanionMsg] = useState<string | undefined>(undefined);
  const [viewingSnapshot, setViewingSnapshot] = useState<AppState | null>(null);

  const mainScrollRef = React.useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  const handleMainScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop > 15) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };


  // Synchronously recalculates current statistics and achievements based on state arrays
  const runStateRecalculations = (s: AppState): AppState => {
    const defaultStats = { questsCompleted: 0, activitiesCompleted: 0, wordsLearned: 0, skillsUnlocked: 0, booksRead: 0 };
    
    // 1. Recalculate current journey statistics
    const questsCompleted = s.quests ? s.quests.filter(q => q.completed).length : 0;
    const activitiesCompleted = s.activities ? s.activities.reduce((sum, a) => sum + (a.completedTimes || 0), 0) : 0;
    const wordsLearned = s.vocabularyLogs ? s.vocabularyLogs.filter(v => v.learned).length : 0;
    const skillsUnlocked = s.skills ? s.skills.filter(s => s.unlocked).length : 0;
    const booksRead = s.bookLogs ? s.bookLogs.filter(b => b.status === 'Completed').length : 0;

    const journeyStatistics = {
      questsCompleted,
      activitiesCompleted,
      wordsLearned,
      skillsUnlocked,
      booksRead,
    };

    // 2. Check current achievements
    const currentAchievements = [...(s.journeyAchievements || [])];
    const addCurrent = (id: string) => {
      if (!currentAchievements.includes(id)) {
        currentAchievements.push(id);
      }
    };

    const lvl = s.player?.level || 1;
    if (lvl >= 5) addCurrent("lvl-5");
    if (lvl >= 10) addCurrent("lvl-10");
    if (lvl >= 15) addCurrent("lvl-15");
    if (lvl >= 20) addCurrent("lvl-20");

    const streak = s.player?.currentStreak || 0;
    if (streak >= 3) addCurrent("streak-3");
    if (streak >= 7) addCurrent("streak-7");
    if (streak >= 14) addCurrent("streak-14");

    if (questsCompleted >= 1) addCurrent("quest-1");
    if (questsCompleted >= 5) addCurrent("quest-5");
    if (questsCompleted >= 10) addCurrent("quest-10");

    if (booksRead >= 1) addCurrent("book-1");
    if (booksRead >= 3) addCurrent("book-3");

    if (skillsUnlocked >= 1) addCurrent("skill-1");
    if (skillsUnlocked >= 3) addCurrent("skill-3");

    // 3. Check lifetime achievements & badges
    const lifetimeAchievements = [...(s.lifetimeAchievements || [])];
    const legacyBadges = [...(s.legacyBadges || [])];
    const addLifetime = (id: string) => {
      if (!lifetimeAchievements.includes(id)) {
        lifetimeAchievements.push(id);
      }
    };
    const addBadge = (id: string) => {
      if (!legacyBadges.includes(id)) {
        legacyBadges.push(id);
      }
    };

    // Estimate lifetime XP using completed journeys history + current
    const total_xp = (s.lifetimeXp || 0) + (s.player?.xp || 0);
    if (total_xp >= 1000) addLifetime("lt-xp-1k");
    if (total_xp >= 5000) addLifetime("lt-xp-5k");

    // Total quests
    const totalQuests = (s.lifetimeStatistics?.totalQuestsCompleted || 0) + questsCompleted;
    if (totalQuests >= 1) addLifetime("lt-quest-1");
    if (totalQuests >= 5) addLifetime("lt-quest-5");
    if (totalQuests >= 25) addLifetime("lt-quest-25");

    // Total books
    const totalBooks = (s.lifetimeStatistics?.totalJourneysCompleted || 0) * 2 + booksRead;
    if (totalBooks >= 1) addLifetime("lt-book-1");
    if (totalBooks >= 5) addLifetime("lt-book-5");

    // Badges based on completed journeys count
    const completedJourneysCount = s.lifetimeStatistics?.totalJourneysCompleted || 0;
    if (completedJourneysCount >= 1) addBadge("badge-pioneer");
    if (completedJourneysCount >= 3) addBadge("badge-phoenix");
    if (completedJourneysCount >= 1 && lvl >= 15) addBadge("badge-titan");

    return {
      ...s,
      journeyStatus: s.journeyStatus || 'Active',
      journeyNumber: s.journeyNumber || 1,
      journeyName: s.journeyName || "Chapter 1: The Awakening",
      journeyStartDate: s.journeyStartDate || "2026-07-15",
      journeyStatistics,
      journeyAchievements: currentAchievements,
      lifetimeXp: s.lifetimeXp || 0,
      lifetimeCoins: s.lifetimeCoins || 0,
      lifetimeBooks: s.lifetimeBooks || 0,
      lifetimeAchievements,
      legacyBadges,
      journeyHistory: s.journeyHistory || [],
      roadmap: s.roadmap || [],
      lifetimeStatistics: {
        totalQuestsCompleted: s.lifetimeStatistics?.totalQuestsCompleted || 0,
        totalActivitiesCompleted: s.lifetimeStatistics?.totalActivitiesCompleted || 0,
        totalJourneysCompleted: s.lifetimeStatistics?.totalJourneysCompleted || 0,
        totalWordsLearned: s.lifetimeStatistics?.totalWordsLearned || 0,
        totalSkillsUnlocked: s.lifetimeStatistics?.totalSkillsUnlocked || 0,
        totalDaysActive: s.lifetimeStatistics?.totalDaysActive || 1,
      }
    };
  };


  const setState = (updater: AppState | ((prev: AppState) => AppState)) => {
    rawSetState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return runStateRecalculations(next);
    });
  };

  // Sync state to local storage
  useEffect(() => {
    try {
      const key = currentUserEmail ? `life_quest_state_${currentUserEmail}` : STORAGE_KEY;
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.error("Local storage sync failed:", e);
    }
  }, [state, currentUserEmail]);

  // Inactivity Decay Check & Streak Maintenance
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastActive = state.lastActiveDate;
    
    if (!lastActive) {
      // First-time init or migration: save today and exit
      setState(prev => ({ ...prev, lastActiveDate: todayStr }));
      return;
    }

    if (lastActive === todayStr) {
      return; // Already active today
    }

    // Calculate days elapsed
    const lastDateObj = new Date(lastActive);
    const todayDateObj = new Date(todayStr);
    const msDiff = todayDateObj.getTime() - lastDateObj.getTime();
    const daysDiff = Math.floor(msDiff / (1000 * 60 * 60 * 24));

    if (daysDiff >= 1) {
      setState(prev => {
        let updatedPlayer = { ...prev.player };
        let penaltyMsg = "";

        // 1. Handle Streak Decay
        // Inactivity of 2 or more days breaks the active streak
        if (daysDiff >= 2) {
          updatedPlayer.currentStreak = 0;
          penaltyMsg += "Your active streak has cooled down to 0 days due to inactivity.";
        }

        // 2. Handle Stats Decay if enabled
        if (prev.decayEnabled) {
          const difficulty = prev.decayDifficulty || 'Normal';
          let xpDecayRate = 15;
          let coinDecayRate = 5;

          if (difficulty === 'Easy') {
            xpDecayRate = 5;
            coinDecayRate = 1;
          } else if (difficulty === 'Normal' || (difficulty as string) === 'Medium') {
            xpDecayRate = 15;
            coinDecayRate = 5;
          } else if (difficulty === 'Hard') {
            xpDecayRate = 35;
            coinDecayRate = 15;
          } else if (difficulty === 'Legend') {
            xpDecayRate = 75;
            coinDecayRate = 35;
          }

          const totalXpPen = xpDecayRate * daysDiff;
          const totalCoinPen = coinDecayRate * daysDiff;

          updatedPlayer.xp = Math.max(0, updatedPlayer.xp - totalXpPen);
          updatedPlayer.coins = Math.max(0, updatedPlayer.coins - totalCoinPen);

          penaltyMsg += ` Inactivity Decay Mode penalised you -${totalXpPen} XP and -${totalCoinPen} Coins (Difficulty: ${difficulty}).`;
        }

        if (penaltyMsg) {
          setTimeout(() => {
            setOverrideEmotion('Concerned');
            setCustomCompanionMsg(`A temporal rift occurred! ${penaltyMsg} Stay consistent, guardian, we can recover!`);
          }, 1500);
        }

        return {
          ...prev,
          player: updatedPlayer,
          lastActiveDate: todayStr
        };
      });
    }
  }, []);

  // Sync audio enabled state with synthesizer class
  useEffect(() => {
    sfx.toggle(audioEnabled);
  }, [audioEnabled]);

  // Helper: Reward player and recalculate levels / history entries
  const rewardPlayer = (xpGained: number, coinsGained: number) => {
    setState((prev) => {
      let { level, xp, xpToNextLevel, coins, unlockedTitles } = prev.player;
      xp += xpGained;
      coins += coinsGained;
      let leveledUp = false;

      // Handle recursive leveling up
      while (xp >= xpToNextLevel) {
        xp -= xpToNextLevel;
        level += 1;
        xpToNextLevel = level * 250; // Scalable XP requirements
        leveledUp = true;

        // Auto unlock milestone titles!
        if (level >= 15 && !unlockedTitles.includes("Master of Focus")) {
          unlockedTitles.push("Master of Focus");
        }
        if (level >= 20 && !unlockedTitles.includes("Grandmaster Alchemist")) {
          unlockedTitles.push("Grandmaster Alchemist");
        }
      }

      // Audio cues & Companion reactions
      if (leveledUp) {
        setTimeout(() => sfx.playLevelUp(), 100);
        setTimeout(() => {
          setOverrideEmotion('Level Up');
          setCustomCompanionMsg(`CONGRATULATIONS! You ascended to Level ${level}! Your celestial reserves are expanding!`);
        }, 300);
      } else {
        setTimeout(() => sfx.playQuestComplete(), 50);
        setTimeout(() => {
          setOverrideEmotion('Celebrating');
          setCustomCompanionMsg(`Cleared task! Siphoned +${xpGained} XP and +${coinsGained} Gold coins.`);
        }, 150);
      }

      // Sync/Log history for today
      const todayStr = new Date().toISOString().split('T')[0];
      const history = [...prev.history];
      const todayIdx = history.findIndex(h => h.date === todayStr);

      if (todayIdx >= 0) {
        history[todayIdx] = {
          ...history[todayIdx],
          xpGained: history[todayIdx].xpGained + xpGained,
          coinsGained: history[todayIdx].coinsGained + coinsGained,
          completedCount: history[todayIdx].completedCount + 1
        };
      } else {
        history.push({
          date: todayStr,
          xpGained,
          coinsGained,
          completedCount: 1
        });
      }

      return {
        ...prev,
        player: {
          ...prev.player,
          level,
          xp,
          xpToNextLevel,
          coins,
          unlockedTitles
        },
        history
      };
    });
  };

  // Guard flags
  const isReadOnly = viewingSnapshot !== null;
  const isPaused = state.journeyStatus === 'Paused';
  const isInteractionDisabled = isReadOnly || isPaused;

  // Profile actions
  const handleUpdatePlayer = (updated: Partial<PlayerProfile>) => {
    if (isInteractionDisabled) return;
    setState(prev => ({
      ...prev,
      player: { ...prev.player, ...updated }
    }));
  };

  // Quests actions
  const handleCompleteQuest = (id: string) => {
    if (isInteractionDisabled) return;
    const quest = state.quests.find(q => q.id === id);
    if (!quest || quest.completed) return;

    setState(prev => ({
      ...prev,
      quests: prev.quests.map(q => q.id === id ? { ...q, completed: true, completedDate: new Date().toISOString().split('T')[0] } : q)
    }));

    // Trigger rewards
    rewardPlayer(quest.xpReward, quest.coinsReward);
  };

  const handleAddQuest = (newQ: Omit<Quest, 'id' | 'completed' | 'dateAdded'>) => {
    if (isInteractionDisabled) return;
    const id = `quest-${Date.now()}`;
    const dateAdded = new Date().toISOString().split('T')[0];
    setState(prev => ({
      ...prev,
      quests: [...prev.quests, { id, ...newQ, completed: false, dateAdded }]
    }));
  };

  const handleDeleteQuest = (id: string) => {
    if (isInteractionDisabled) return;
    setState(prev => ({
      ...prev,
      quests: prev.quests.filter(q => q.id !== id)
    }));
  };

  const handleUpdateQuest = (id: string, updated: Partial<Quest>) => {
    if (isInteractionDisabled) return;
    setState(prev => ({
      ...prev,
      quests: prev.quests.map(q => q.id === id ? { ...q, ...updated } : q)
    }));
  };


  // Activities actions
  const handleCompleteActivity = (id: string) => {
    if (isInteractionDisabled) return;
    const act = state.activities.find(a => a.id === id);
    if (!act) return;

    setState(prev => {
      const activities = prev.activities.map(a => {
        if (a.id === id) {
          const nextClears = a.completedTimes + 1;
          const nextStreak = a.currentStreak + 1;
          const nextLongest = Math.max(a.longestStreak, nextStreak);
          return {
            ...a,
            completedTimes: nextClears,
            currentStreak: nextStreak,
            longestStreak: nextLongest
          };
        }
        return a;
      });
      return { ...prev, activities };
    });

    // Calculate dynamic XP considering multipliers
    const cat = state.categories.find(c => c.id === act.categoryId);
    const mult = cat ? cat.xpMultiplier : 1.0;
    const finalXP = Math.round(act.xpReward * mult);

    rewardPlayer(finalXP, act.coinsReward);
  };

  const handleAddActivity = (newAct: Omit<Activity, 'id' | 'completedTimes' | 'currentStreak' | 'longestStreak'>) => {
    if (isInteractionDisabled) return;
    const id = `act-${Date.now()}`;
    setState(prev => ({
      ...prev,
      activities: [...prev.activities, { id, ...newAct, completedTimes: 0, currentStreak: 0, longestStreak: 0 }]
    }));
  };

  const handleUpdateActivity = (id: string, updated: Partial<Activity>) => {
    if (isInteractionDisabled) return;
    setState(prev => ({
      ...prev,
      activities: prev.activities.map(a => a.id === id ? { ...a, ...updated } : a)
    }));
  };

  const handleDeleteActivity = (id: string) => {
    if (isInteractionDisabled) return;
    setState(prev => ({
      ...prev,
      activities: prev.activities.filter(a => a.id !== id)
    }));
  };

  // Categories Actions
  const handleAddCategory = (newCat: Omit<Category, 'id'>) => {
    if (isInteractionDisabled) return;
    const id = `cat-${Date.now()}`;
    const category: Category = { id, ...newCat };
    setState(prev => ({
      ...prev,
      categories: [...prev.categories, category]
    }));
  };

  const handleUpdateCategory = (id: string, updated: Partial<Category>) => {
    if (isInteractionDisabled) return;
    setState(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === id ? { ...c, ...updated } : c)
    }));
  };

  const handleDeleteCategory = (id: string) => {
    if (isInteractionDisabled) return;
    setState(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== id),
      activities: prev.activities.filter(a => a.categoryId !== id)
    }));
  };

  // Skill tree actions
  const handleUnlockSkill = (id: string, cost: number) => {
    if (isInteractionDisabled) return;
    setState(prev => ({
      ...prev,
      player: { ...prev.player, coins: prev.player.coins - cost },
      skills: prev.skills.map(s => s.id === id ? { ...s, unlocked: true } : s)
    }));
  };

  // Rewards Actions
  const handlePurchaseReward = (id: string, cost: number) => {
    if (isInteractionDisabled) return;
    setState(prev => ({
      ...prev,
      player: { ...prev.player, coins: prev.player.coins - cost },
      rewards: prev.rewards.map(r => r.id === id ? { ...r, purchaseCount: r.purchaseCount + 1 } : r)
    }));
  };

  const handleAddReward = (newR: Omit<ShopItem, 'id' | 'purchaseCount' | 'custom'>) => {
    if (isInteractionDisabled) return;
    const id = `reward-${Date.now()}`;
    setState(prev => ({
      ...prev,
      rewards: [...prev.rewards, { id, ...newR, purchaseCount: 0, custom: true }]
    }));
  };

  const handleDeleteReward = (id: string) => {
    if (isInteractionDisabled) return;
    setState(prev => ({
      ...prev,
      rewards: prev.rewards.filter(r => r.id !== id)
    }));
  };

  const handleUpdateReward = (id: string, updated: Partial<ShopItem>) => {
    if (isInteractionDisabled) return;
    setState(prev => ({
      ...prev,
      rewards: prev.rewards.map(r => r.id === id ? { ...r, ...updated } : r)
    }));
  };

  // --- ROADMAP SYSTEM HANDLERS ---
  const handleAddRoadmapItem = (newItem: Omit<RoadmapItem, 'id' | 'status' | 'dateAdded'>) => {
    if (isInteractionDisabled) return;
    const id = `rd-${Date.now()}`;
    const dateAdded = new Date().toISOString().split('T')[0];
    setState(prev => ({
      ...prev,
      roadmap: [...(prev.roadmap || []), { id, ...newItem, status: 'Not Started', dateAdded }]
    }));
  };

  const handleUpdateRoadmapItem = (id: string, updated: Partial<RoadmapItem>) => {
    if (isInteractionDisabled) return;
    setState(prev => ({
      ...prev,
      roadmap: (prev.roadmap || []).map(item => item.id === id ? { ...item, ...updated } : item)
    }));
  };

  const handleDeleteRoadmapItem = (id: string) => {
    if (isInteractionDisabled) return;
    setState(prev => ({
      ...prev,
      roadmap: (prev.roadmap || []).filter(item => item.id !== id)
    }));
  };

  const handleCompleteRoadmapItem = (id: string) => {
    if (isInteractionDisabled) return;
    const item = state.roadmap?.find(r => r.id === id);
    if (!item || item.status === 'Completed') return;

    setState(prev => ({
      ...prev,
      roadmap: (prev.roadmap || []).map(r => r.id === id ? { ...r, status: 'Completed', completedDate: new Date().toISOString().split('T')[0] } : r)
    }));

    rewardPlayer(item.xpReward, item.coinsReward);
  };


  // Long-term Database Actions
  const handleAddLog = (tableKey: keyof AppState, log: any) => {
    if (isInteractionDisabled) return;
    setState(prev => ({
      ...prev,
      [tableKey]: [...(prev[tableKey] as any[]), log]
    }));
  };

  const handleDeleteLog = (tableKey: keyof AppState, id: string) => {
    if (isInteractionDisabled) return;
    setState(prev => ({
      ...prev,
      [tableKey]: (prev[tableKey] as any[]).filter(item => item.id !== id)
    }));
  };

  // Excel Operations
  const handleImportState = (imported: AppState) => {
    setState(imported);
  };

  const handleResetState = () => {
    setState(INITIAL_STATE);
    localStorage.removeItem(STORAGE_KEY);
    sfx.playLevelUp();
  };

  const handleStartJourney = (name: string, characterClass: PlayerClass, startDate: string) => {
    setState({
      ...INITIAL_STATE,
      player: {
        name: name,
        class: characterClass,
        level: 1,
        xp: 0,
        xpToNextLevel: 250,
        coins: 0,
        title: "Initiate",
        rank: "Bronze I",
        currentStreak: 0,
        longestStreak: 0,
        prestige: 0,
        unlockedTitles: ["Initiate"],
        journeyStartDate: startDate
      },
      // Make sure all progress fields are strictly clean and empty
      bookLogs: [],
      videoLogs: [],
      courseLogs: [],
      fitnessLogs: [],
      journalLogs: [],
      projectLogs: [],
      dreamLogs: [],
      businessIdeaLogs: [],
      vocabularyLogs: [],
      travelLogs: [],
      quoteLogs: [],
      history: [],
      activities: INITIAL_STATE.activities.map(act => ({
        ...act,
        completedTimes: 0,
        currentStreak: 0,
        longestStreak: 0,
        startedDate: startDate
      })),
      quests: INITIAL_STATE.quests.map(q => ({
        ...q,
        completed: false,
        dateAdded: startDate
      })),
      skills: INITIAL_STATE.skills.map(s => ({
        ...s,
        unlocked: false
      })),
      rewards: INITIAL_STATE.rewards.map(r => ({
        ...r,
        purchaseCount: 0
      })),
      roadmap: (INITIAL_STATE.roadmap || []).map(item => ({
        ...item,
        status: item.id === 'rd-initiation-1' ? 'Completed' : item.id === 'rd-initiation-2' ? 'In Progress' : 'Not Started',
        completedDate: item.id === 'rd-initiation-1' ? startDate : undefined,
        dateAdded: startDate
      })),
      journeyStatus: 'Active',
      journeyNumber: 1,
      journeyName: `Chapter 1: The Awakening`,
      journeyStartDate: startDate
    });

    sfx.playLevelUp();
  };

  // --- JOURNEY SYSTEM HANDLERS ---
  const handleStartNewJourney = (option: 'Fresh' | 'Rebirth', name: string) => {
    if (option === 'Rebirth') {
      localStorage.removeItem(STORAGE_KEY);
      setState(INITIAL_STATE);
      setViewingSnapshot(null);
      sfx.playLevelUp();
      return;
    }

    // Fresh Journey (Option A)
    setState((prev) => {
      const completedBooks = prev.bookLogs ? prev.bookLogs.filter(b => b.status === 'Completed').length : 0;
      const uniqueLanguages = prev.vocabularyLogs ? Array.from(new Set(prev.vocabularyLogs.filter(v => v.learned).map(v => v.language))) : [];
      
      const completedQuests = prev.quests ? prev.quests.filter(q => q.completed).length : 0;
      const totalQuests = prev.quests ? prev.quests.length : 0;
      const completedActs = prev.activities ? prev.activities.reduce((sum, a) => sum + (a.completedTimes || 0), 0) : 0;
      const totalActTargets = prev.activities ? prev.activities.reduce((sum, a) => sum + (a.targetCount || 0), 0) : 0;
      
      const completionPercentage = Math.min(100, Math.round(
        ((completedQuests + completedActs) / Math.max(1, totalQuests + totalActTargets)) * 100
      ));

      const newHistoryEntry: JourneyHistoryEntry = {
        id: `journey-${prev.journeyNumber}-${Date.now()}`,
        number: prev.journeyNumber,
        name: prev.journeyName,
        startDate: prev.journeyStartDate || prev.player?.journeyStartDate || "2026-07-15",
        endDate: new Date().toISOString().split('T')[0],
        highestLevel: prev.player?.level || 1,
        highestXp: prev.player?.xp || 0,
        longestStreak: prev.player?.longestStreak || 0,
        booksRead: completedBooks,
        languagesLearned: uniqueLanguages,
        achievementsCount: prev.journeyAchievements?.length || 0,
        completionPercentage,
        status: 'Archived',
        stateSnapshot: JSON.stringify({
          ...prev,
          journeyHistory: [] // Avoid nesting recursion
        })
      };

      const nextLifetimeXp = (prev.lifetimeXp || 0) + (prev.player?.xp || 0);
      const nextLifetimeCoins = (prev.lifetimeCoins || 0) + (prev.player?.coins || 0);
      const nextLifetimeBooks = (prev.lifetimeBooks || 0) + completedBooks;

      const updatedLifetimeStatistics = {
        totalQuestsCompleted: (prev.lifetimeStatistics?.totalQuestsCompleted || 0) + completedQuests,
        totalActivitiesCompleted: (prev.lifetimeStatistics?.totalActivitiesCompleted || 0) + completedActs,
        totalJourneysCompleted: (prev.lifetimeStatistics?.totalJourneysCompleted || 0) + 1,
        totalWordsLearned: (prev.lifetimeStatistics?.totalWordsLearned || 0) + (prev.vocabularyLogs ? prev.vocabularyLogs.filter(v => v.learned).length : 0),
        totalSkillsUnlocked: (prev.lifetimeStatistics?.totalSkillsUnlocked || 0) + (prev.skills ? prev.skills.filter(s => s.unlocked).length : 0),
        totalDaysActive: (prev.lifetimeStatistics?.totalDaysActive || 1) + 1
      };

      const nextJourneyNumber = prev.journeyNumber + 1;
      const nextJourneyName = name || `Chapter ${nextJourneyNumber}: The Legend Continues`;
      const todayStr = new Date().toISOString().split('T')[0];

      return {
        ...prev,
        player: {
          ...prev.player,
          level: 1,
          xp: 0,
          xpToNextLevel: 250,
          coins: 0,
          currentStreak: 0,
          longestStreak: 0,
          journeyStartDate: todayStr
        },
        bookLogs: [],
        videoLogs: [],
        courseLogs: [],
        fitnessLogs: [],
        journalLogs: [],
        projectLogs: [],
        dreamLogs: [],
        businessIdeaLogs: [],
        vocabularyLogs: [],
        travelLogs: [],
        quoteLogs: [],
        history: [],
        activities: INITIAL_STATE.activities.map(act => ({
          ...act,
          completedTimes: 0,
          currentStreak: 0,
          longestStreak: 0,
          startedDate: todayStr
        })),
        quests: INITIAL_STATE.quests.map(q => ({
          ...q,
          completed: false,
          dateAdded: todayStr
        })),
        skills: INITIAL_STATE.skills.map(s => ({
          ...s,
          unlocked: false
        })),
        rewards: INITIAL_STATE.rewards.map(r => ({
          ...r,
          purchaseCount: 0
        })),
        roadmap: (INITIAL_STATE.roadmap || []).map(item => ({
          ...item,
          status: item.id === 'rd-initiation-1' ? 'Completed' : item.id === 'rd-initiation-2' ? 'In Progress' : 'Not Started',
          completedDate: item.id === 'rd-initiation-1' ? todayStr : undefined,
          dateAdded: todayStr
        })),
        journeyStatus: 'Active',

        journeyNumber: nextJourneyNumber,
        journeyName: nextJourneyName,
        journeyStartDate: todayStr,
        journeyEndDate: undefined,
        journeyAchievements: [],
        journeyStatistics: {
          questsCompleted: 0,
          activitiesCompleted: 0,
          wordsLearned: 0,
          skillsUnlocked: 0,
          booksRead: 0
        },

        lifetimeXp: nextLifetimeXp,
        lifetimeCoins: nextLifetimeCoins,
        lifetimeBooks: nextLifetimeBooks,
        journeyHistory: [...(prev.journeyHistory || []), newHistoryEntry],
        lifetimeStatistics: updatedLifetimeStatistics
      };
    });
    setViewingSnapshot(null);
    sfx.playLevelUp();
  };

  const handlePauseJourney = () => {
    setState((prev) => ({
      ...prev,
      journeyStatus: 'Paused'
    }));
    sfx.playSkillUnlock();
  };

  const handleResumeJourney = () => {
    setState((prev) => ({
      ...prev,
      journeyStatus: 'Active'
    }));
    sfx.playSkillUnlock();
  };

  const handleResetCurrentJourney = () => {
    setState((prev) => {
      const todayStr = new Date().toISOString().split('T')[0];
      return {
        ...prev,
        player: {
          ...prev.player,
          level: 1,
          xp: 0,
          xpToNextLevel: 250,
          coins: 0,
          currentStreak: 0,
          longestStreak: 0,
          journeyStartDate: todayStr
        },
        bookLogs: [],
        videoLogs: [],
        courseLogs: [],
        fitnessLogs: [],
        journalLogs: [],
        projectLogs: [],
        dreamLogs: [],
        businessIdeaLogs: [],
        vocabularyLogs: [],
        travelLogs: [],
        quoteLogs: [],
        history: [],
        activities: INITIAL_STATE.activities.map(act => ({
          ...act,
          completedTimes: 0,
          currentStreak: 0,
          longestStreak: 0,
          startedDate: todayStr
        })),
        quests: INITIAL_STATE.quests.map(q => ({
          ...q,
          completed: false,
          dateAdded: todayStr
        })),
        skills: INITIAL_STATE.skills.map(s => ({
          ...s,
          unlocked: false
        })),
        rewards: INITIAL_STATE.rewards.map(r => ({
          ...r,
          purchaseCount: 0
        })),
        roadmap: (INITIAL_STATE.roadmap || []).map(item => ({
          ...item,
          status: item.id === 'rd-initiation-1' ? 'Completed' : item.id === 'rd-initiation-2' ? 'In Progress' : 'Not Started',
          completedDate: item.id === 'rd-initiation-1' ? todayStr : undefined,
          dateAdded: todayStr
        })),
        journeyStatus: 'Active',
        journeyAchievements: []
      };
    });
    sfx.playLevelUp();
  };

  const handleLogin = (email: string) => {
    setCurrentUserEmail(email);
    localStorage.setItem('life_quest_active_session_email', email);
    
    // Load state for this user
    const userStateKey = `life_quest_state_${email}`;
    const storedState = localStorage.getItem(userStateKey);
    if (storedState) {
      try {
        const parsed = JSON.parse(storedState);
        rawSetState(parsed);
      } catch (e) {
        rawSetState(INITIAL_STATE);
      }
    } else {
      rawSetState(INITIAL_STATE);
    }
  };

  const handleRegister = (email: string, pass: string) => {
    const nextRegistry = { ...usersRegistry, [email]: pass };
    setUsersRegistry(nextRegistry);
    localStorage.setItem('life_quest_users_registry', JSON.stringify(nextRegistry));

    setCurrentUserEmail(email);
    localStorage.setItem('life_quest_active_session_email', email);
    rawSetState(INITIAL_STATE);
  };

  const handleCompleteSetup = (data: {
    playerName: string;
    journeyName: string;
    theme: string;
    timeZone: string;
    dailyResetTime: string;
    mainGoal: string;
  }) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Check if the user has an existing anonymous profile with progress to migrate
    const hasAnonymousProgress = state.player && state.player.name && state.player.level > 1;
    
    let finalState: AppState;
    if (hasAnonymousProgress) {
      // Migrate existing anonymous progress
      finalState = {
        ...state,
        player: {
          ...state.player,
          name: data.playerName,
          mainGoal: data.mainGoal,
          timeZone: data.timeZone,
          dailyResetTime: data.dailyResetTime,
          title: "The Seeker",
          unlockedTitles: Array.from(new Set([...(state.player.unlockedTitles || []), "The Seeker"]))
        },
        headquartersTheme: data.theme,
        journeyName: data.journeyName
      };
    } else {
      // Clean initialization as Level 1 Seeker
      finalState = {
        ...INITIAL_STATE,
        player: {
          name: data.playerName,
          class: 'Warrior',
          level: 1,
          xp: 0,
          xpToNextLevel: 250,
          coins: 0,
          title: "The Seeker",
          rank: "Bronze I",
          currentStreak: 0,
          longestStreak: 0,
          prestige: 0,
          unlockedTitles: ["The Seeker"],
          journeyStartDate: todayStr,
          mainGoal: data.mainGoal,
          timeZone: data.timeZone,
          dailyResetTime: data.dailyResetTime
        },
        headquartersTheme: data.theme,
        journeyName: data.journeyName,
        journeyNumber: 1,
        journeyStatus: 'Active',
        bookLogs: [],
        videoLogs: [],
        courseLogs: [],
        fitnessLogs: [],
        journalLogs: [],
        projectLogs: [],
        dreamLogs: [],
        businessIdeaLogs: [],
        vocabularyLogs: [],
        travelLogs: [],
        quoteLogs: [],
        history: [],
        activities: INITIAL_STATE.activities.map(act => ({
          ...act,
          completedTimes: 0,
          currentStreak: 0,
          longestStreak: 0,
          startedDate: todayStr
        })),
        quests: INITIAL_STATE.quests.map(q => ({
          ...q,
          completed: false,
          dateAdded: todayStr
        })),
        skills: INITIAL_STATE.skills.map(s => ({
          ...s,
          unlocked: false
        })),
        rewards: INITIAL_STATE.rewards.map(r => ({
          ...r,
          purchaseCount: 0
        })),
        roadmap: (INITIAL_STATE.roadmap || []).map(item => ({
          ...item,
          status: item.id === 'rd-initiation-1' ? 'Completed' : item.id === 'rd-initiation-2' ? 'In Progress' : 'Not Started',
          completedDate: item.id === 'rd-initiation-1' ? todayStr : undefined,
          dateAdded: todayStr
        })),
        journeyAchievements: []
      };
    }

    rawSetState(finalState);
    const key = `life_quest_state_${localStorage.getItem('life_quest_active_session_email') || 'anonymous'}`;
    localStorage.setItem(key, JSON.stringify(finalState));
  };

  const handleLogout = () => {
    localStorage.removeItem('life_quest_active_session_email');
    setCurrentUserEmail(null);
    setAuthView('login');
    rawSetState(INITIAL_STATE);
    setActiveTab('dashboard');
  };

  const handleExportData = () => {
    sfx.playSkillUnlock();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `life_quest_ledger_${currentUserEmail || 'backup'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (imported: AppState) => {
    setState(imported);
  };


  const handleViewJourney = (id: string) => {
    const historicalEntry = state.journeyHistory?.find(j => j.id === id);
    if (historicalEntry) {
      try {
        const parsedSnapshot = JSON.parse(historicalEntry.stateSnapshot) as AppState;
        parsedSnapshot.journeyStatus = historicalEntry.status;
        parsedSnapshot.journeyNumber = historicalEntry.number;
        parsedSnapshot.journeyName = historicalEntry.name;
        
        setViewingSnapshot(parsedSnapshot);
        sfx.playSkillUnlock();
      } catch (e) {
        console.error("Failed to parse journey snapshot:", e);
      }
    }
  };

  const handleRestoreJourney = (numberOrId: string) => {
    const historicalEntry = state.journeyHistory?.find(j => j.id === numberOrId || j.number.toString() === numberOrId);
    if (!historicalEntry) return;

    try {
      const restoredState = JSON.parse(historicalEntry.stateSnapshot) as AppState;
      
      const completedBooks = state.bookLogs ? state.bookLogs.filter(b => b.status === 'Completed').length : 0;
      const uniqueLanguages = state.vocabularyLogs ? Array.from(new Set(state.vocabularyLogs.filter(v => v.learned).map(v => v.language))) : [];
      
      const completedQuests = state.quests ? state.quests.filter(q => q.completed).length : 0;
      const totalQuests = state.quests ? state.quests.length : 0;
      const completedActs = state.activities ? state.activities.reduce((sum, a) => sum + (a.completedTimes || 0), 0) : 0;
      const totalActTargets = state.activities ? state.activities.reduce((sum, a) => sum + (a.targetCount || 0), 0) : 0;
      
      const completionPercentage = Math.min(100, Math.round(
        ((completedQuests + completedActs) / Math.max(1, totalQuests + totalActTargets)) * 100
      ));

      const archivedCurrentEntry: JourneyHistoryEntry = {
        id: `journey-${state.journeyNumber}-${Date.now()}`,
        number: state.journeyNumber,
        name: state.journeyName,
        startDate: state.journeyStartDate || state.player?.journeyStartDate || "2026-07-15",
        endDate: new Date().toISOString().split('T')[0],
        highestLevel: state.player?.level || 1,
        highestXp: state.player?.xp || 0,
        longestStreak: state.player?.longestStreak || 0,
        booksRead: completedBooks,
        languagesLearned: uniqueLanguages,
        achievementsCount: state.journeyAchievements?.length || 0,
        completionPercentage,
        status: 'Paused',
        stateSnapshot: JSON.stringify({
          ...state,
          journeyHistory: []
        })
      };

      const nextHistory = (state.journeyHistory || [])
        .filter(j => j.id !== historicalEntry.id)
        .map(j => ({ ...j }));
      nextHistory.push(archivedCurrentEntry);

      setState(() => ({
        ...restoredState,
        journeyStatus: 'Active',
        journeyHistory: nextHistory,
        lifetimeXp: state.lifetimeXp,
        lifetimeCoins: state.lifetimeCoins,
        lifetimeBooks: state.lifetimeBooks,
        lifetimeAchievements: state.lifetimeAchievements,
        legacyBadges: state.legacyBadges,
        lifetimeStatistics: state.lifetimeStatistics
      }));

      setViewingSnapshot(null);
      sfx.playLevelUp();
    } catch (e) {
      console.error("Failed to restore journey snapshot:", e);
    }
  };

  if (!currentUserEmail || !state.player.name) {
    if (currentUserEmail && (!state.player || !state.player.name)) {
      return (
        <Register
          onRegister={handleRegister}
          onCompleteSetup={handleCompleteSetup}
          onNavigateToLogin={() => setAuthView('login')}
          usersRegistry={usersRegistry}
        />
      );
    }

    if (authView === 'login') {
      return (
        <Login
          onLogin={handleLogin}
          onNavigateToRegister={() => setAuthView('register')}
          usersRegistry={usersRegistry}
        />
      );
    } else {
      return (
        <Register
          onRegister={handleRegister}
          onCompleteSetup={handleCompleteSetup}
          onNavigateToLogin={() => setAuthView('login')}
          usersRegistry={usersRegistry}
        />
      );
    }
  }

  const viewState = viewingSnapshot || state;

  // Day & Night background color gradient shift based on local hour
  const localHour = new Date().getHours();
  let timeGradient = "bg-[#0B0F19]";
  if (localHour >= 6 && localHour < 12) {
    timeGradient = "bg-gradient-to-b from-amber-500/5 via-[#0B0F19] to-[#0B0F19]";
  } else if (localHour >= 12 && localHour < 17) {
    timeGradient = "bg-gradient-to-b from-sky-500/5 via-[#0B0F19] to-[#0B0F19]";
  } else if (localHour >= 17 && localHour < 20) {
    timeGradient = "bg-gradient-to-b from-rose-500/5 via-indigo-950/5 to-[#0B0F19]";
  } else {
    timeGradient = "bg-gradient-to-b from-emerald-950/10 via-[#0B0F19] to-[#0B0F19]";
  }

  return (
    <div className={`min-h-screen ${timeGradient} text-slate-100 flex flex-col font-sans selection:bg-blue-600/30 selection:text-blue-300 relative`}>
      <ScrollProgress containerRef={mainScrollRef} />
      <AmbientEffects />
      <WeatherSystem />
      <CursorMagic />
      <NotificationSystem />
      <NotificationCenter />
      <CinematicManager state={viewState} />
      
      {/* GLOBAL BACKGROUND GLOW EFFECTS */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* WARNING/NOTIFICATION BANNERS */}
      {viewingSnapshot && (
        <div className="relative z-50 bg-amber-500/15 border-b border-amber-500/30 text-amber-300 px-4 py-2.5 text-xs flex justify-between items-center backdrop-blur-md">
          <div className="flex items-center gap-2">
            <LucideIcon name="History" size={14} className="animate-pulse text-amber-400" />
            <span>
              <strong>Chronicles Viewport:</strong> You are exploring records from <strong>Journey #{viewingSnapshot.journeyNumber}: {viewingSnapshot.journeyName}</strong>. All live quest completion and logs are frozen.
            </span>
          </div>
          <button 
            onClick={() => setViewingSnapshot(null)}
            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/35 text-amber-200 rounded-md font-bold transition-all text-[10px] uppercase tracking-wider cursor-pointer border border-amber-500/30"
          >
            Return to Present Era
          </button>
        </div>
      )}

      {state.journeyStatus === 'Paused' && !viewingSnapshot && (
        <div className="relative z-50 bg-blue-500/15 border-b border-blue-500/30 text-blue-300 px-4 py-2.5 text-xs flex justify-between items-center backdrop-blur-md">
          <div className="flex items-center gap-2">
            <LucideIcon name="PauseCircle" size={14} className="text-blue-400 animate-pulse" />
            <span>
              <strong>Journey Paused:</strong> Your current life quest chapter is frozen. You can review all data and logs, but XP/Coin generation is paused until you resume.
            </span>
          </div>
          <button 
            onClick={handleResumeJourney}
            className="px-2.5 py-1 bg-blue-500/20 hover:bg-blue-500/35 text-blue-200 rounded-md font-bold transition-all text-[10px] uppercase tracking-wider cursor-pointer border border-blue-500/30"
          >
            Resume Journey
          </button>
        </div>
      )}

      {/* TOP COMPACT HUD */}
      <header className={`sticky top-0 z-40 transition-all duration-350 px-4 py-3 md:px-8 flex justify-between items-center ${scrolled ? 'bg-slate-950/70 border-b border-emerald-500/20 backdrop-blur-xl shadow-lg shadow-emerald-950/15' : 'bg-slate-950/85 border-b border-blue-950/40 backdrop-blur-md'}`}>
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-600/15 border border-blue-500/30 rounded-lg text-blue-400">
            <LucideIcon name="Crown" size={18} className="animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold tracking-widest text-slate-400 font-mono">OPERATING SYSTEM</span>
            <h1 className="text-sm font-black text-white tracking-wider flex items-center gap-1">
              <span>LIFE QUEST</span>
              <span className="text-blue-400">ULTIMATE</span>
            </h1>
          </div>
        </div>

        {/* HUD STATS SUMMARY */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-xs font-mono">
            <span className="text-slate-500">LEVEL:</span>
            <span className="text-amber-400 font-bold">{viewState.player.level}</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-xs font-mono">
            <span className="text-slate-500">STREAK:</span>
            <span className="text-red-400 font-bold flex items-center gap-0.5">
              <LucideIcon name="Flame" size={12} />
              {viewState.player.currentStreak}D
            </span>
          </div>

          {/* Audio Chime toggler */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${audioEnabled ? 'bg-blue-950/40 border-blue-900/40 text-blue-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
            title={audioEnabled ? "Disable RPG sound synthesizer" : "Enable RPG sound synthesizer"}
          >
            <LucideIcon name={audioEnabled ? "Volume2" : "VolumeX"} size={15} />
          </button>

          <NotificationBell />

          {currentUserEmail && (
            <ProfileMenu
              state={viewState}
              email={currentUserEmail}
              onUpdateState={setState}
              onLogout={handleLogout}
              onExportData={handleExportData}
              onImportData={handleImportData}
            />
          )}
        </div>
      </header>

      {/* CORE FRAMEWORK GRID (Navigation tab panel + Main viewport) */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* SIDE BAR NAVIGATION */}
        <aside className="w-full lg:w-64 bg-slate-950/40 border-b lg:border-b-0 lg:border-r border-slate-900/60 p-4 lg:p-6 space-y-4 shrink-0">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden lg:block">Guild Operations</div>
          
          <motion.nav 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.04,
                }
              }
            }}
            className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 scrollbar-none"
          >
            {[
              { key: 'dashboard', name: 'Adventurer Stats', icon: 'Shield' },
              { key: 'calendar', name: 'Quest Calendar', icon: 'Calendar' },
              { key: 'journeys', name: 'Journey Ledger', icon: 'History' },
              { key: 'companion', name: 'Companion & HQ', icon: 'Sparkles' },
              { key: 'coach', name: 'AI Oracle Coach', icon: 'Crown' },
              { key: 'categories', name: 'Guild Sectors', icon: 'Layers' },
              { key: 'quests', name: 'Quest Bounties', icon: 'Compass' },
              { key: 'roadmap', name: 'Legendary Roadmap', icon: 'Map' },
              { key: 'skills', name: 'Skill Constellations', icon: 'Network' },
              { key: 'shop', name: 'Tavern Rewards', icon: 'Store' },
              { key: 'databases', name: 'Chronicles Vault', icon: 'Database' },
              { key: 'analytics', name: 'Growth Metrics', icon: 'LineChart' },
              { key: 'excel', name: 'Settings & Excel', icon: 'Settings' }
            ].map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <motion.button
                  key={tab.key}
                  variants={{
                    hidden: { opacity: 0, x: -15 },
                    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } }
                  }}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`relative px-3 py-2 lg:py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all shrink-0 cursor-pointer overflow-hidden group/nav ${
                    isActive 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-900/30 shadow-[0_0_15px_rgba(16,185,129,0.04)] lg:pl-5' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/30 border border-transparent'
                  }`}
                >
                  {isActive && (
                    <motion.span 
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-emerald-500 rounded-r shadow-[0_0_8px_#10b981]" 
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    />
                  )}
                  <LucideIcon name={tab.icon} size={15} className={`transition-transform duration-200 group-hover/nav:scale-110 ${isActive ? 'text-emerald-400' : ''}`} />
                  <span>{tab.name}</span>
                </motion.button>
              );
            })}
          </motion.nav>
        </aside>

        {/* MAIN VIEWPORT PANEL */}
        <main 
          ref={mainScrollRef}
          onScroll={handleMainScroll}
          className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full relative z-10"
        >
          <AnimatePresence mode="wait">
            <PageTransition key={activeTab}>
              {activeTab === 'dashboard' && (
                <Dashboard
                  player={viewState.player}
                  categories={viewState.categories}
                  activities={viewState.activities}
                  quests={viewState.quests}
                  history={viewState.history}
                  onUpdatePlayer={handleUpdatePlayer}
                  onCompleteQuest={handleCompleteQuest}
                  state={viewState}
                />
              )}

              {activeTab === 'calendar' && (
                <Calendar
                  state={viewState}
                  onUpdateState={setState}
                />
              )}

              {activeTab === 'categories' && (
                <Categories
                  categories={viewState.categories}
                  activities={viewState.activities}
                  onCompleteActivity={handleCompleteActivity}
                  onAddActivity={handleAddActivity}
                  onUpdateActivity={handleUpdateActivity}
                  onDeleteActivity={handleDeleteActivity}
                  onAddCategory={handleAddCategory}
                  onUpdateCategory={handleUpdateCategory}
                  onDeleteCategory={handleDeleteCategory}
                />
              )}

              {activeTab === 'quests' && (
                <QuestPage
                  quests={viewState.quests}
                  categories={viewState.categories}
                  onCompleteQuest={handleCompleteQuest}
                  onAddQuest={handleAddQuest}
                  onUpdateQuest={handleUpdateQuest}
                  onDeleteQuest={handleDeleteQuest}
                />
              )}

              {activeTab === 'roadmap' && (
                <RoadmapTab
                  roadmap={viewState.roadmap || []}
                  categories={viewState.categories}
                  onAddRoadmapItem={handleAddRoadmapItem}
                  onUpdateRoadmapItem={handleUpdateRoadmapItem}
                  onDeleteRoadmapItem={handleDeleteRoadmapItem}
                  onCompleteRoadmapItem={handleCompleteRoadmapItem}
                />
              )}

              {activeTab === 'skills' && (
                <SkillTreeTab
                  skills={viewState.skills}
                  categories={viewState.categories}
                  player={viewState.player}
                  onUnlockSkill={handleUnlockSkill}
                />
              )}

              {activeTab === 'shop' && (
                <RewardShop
                  rewards={viewState.rewards}
                  player={viewState.player}
                  onPurchaseReward={handlePurchaseReward}
                  onAddReward={handleAddReward}
                  onUpdateReward={handleUpdateReward}
                  onDeleteReward={handleDeleteReward}
                />
              )}

              {activeTab === 'databases' && (
                <LongTermDatabase
                  state={viewState}
                  onAddLog={handleAddLog}
                  onDeleteLog={handleDeleteLog}
                />
              )}

              {activeTab === 'analytics' && (
                <Analytics state={viewState} />
              )}

              {activeTab === 'coach' && (
                <AICoach state={viewState} />
              )}

              {activeTab === 'companion' && (
                <CompanionPage
                  state={viewState}
                  onUpdateState={setState}
                  onSetOverrideEmotion={(emo) => {
                    setOverrideEmotion(emo);
                    setTimeout(() => setOverrideEmotion(undefined), 5000);
                  }}
                  onTriggerMessage={setCustomCompanionMsg}
                />
              )}

              {activeTab === 'excel' && (
                <ExcelSync
                  state={viewState}
                  onImportState={handleImportState}
                  onResetState={handleResetState}
                  onUpdateState={setState}
                />
              )}

              {activeTab === 'journeys' && (
                <JourneyPage
                  state={state}
                  viewingSnapshot={viewingSnapshot}
                  onStartNewJourney={handleStartNewJourney}
                  onPauseJourney={handlePauseJourney}
                  onResumeJourney={handleResumeJourney}
                  onViewJourney={handleViewJourney}
                  onRestoreJourney={handleRestoreJourney}
                  onCloseViewSnapshot={() => setViewingSnapshot(null)}
                  onResetCurrentJourney={handleResetCurrentJourney}
                />
              )}
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>

      {/* FOOTER SYSTEM METADATA */}
      <footer className="bg-slate-950 border-t border-slate-900/40 py-4 px-8 text-center text-[10px] text-slate-600 font-mono flex flex-col md:flex-row justify-between items-center gap-2">
        <span>© 2026 LIFE QUEST ULTIMATE. Crafted for Elite Performers.</span>
        <span>Excel Expert Synchronizer Layer v1.0.4 Online</span>
      </footer>

      {/* FLOATING INTERACTIVE COMPANION VIEW */}
      <CompanionLiveView
        state={viewState}
        onUpdateState={setState}
        overrideEmotion={overrideEmotion}
        customMessage={customCompanionMsg}
        onClearCustomMessage={() => setCustomCompanionMsg(undefined)}
      />

    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}
