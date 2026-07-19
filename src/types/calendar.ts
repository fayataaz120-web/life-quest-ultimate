/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ScheduledQuest {
  id: string;
  name: string; // Compatible with legacy title
  categoryId: string;
  difficulty: 'Trivial' | 'Easy' | 'Medium' | 'Hard' | 'Legendary';
  completed: boolean;
  
  // Advanced MCC Mission properties
  description?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical' | 'Legendary';
  status?: 'Not Started' | 'In Progress' | 'Paused' | 'Completed' | 'Cancelled' | 'Missed' | 'Archived';
  type?: 'Daily' | 'Weekly' | 'Monthly' | 'One-Time' | 'Long-Term Goal' | 'Habit' | 'Challenge' | 'Legendary Quest' | 'Hidden Quest';
  estTime?: number; // in minutes
  startTime?: string; // "HH:MM"
  endTime?: string; // "HH:MM"
  deadline?: string; // "YYYY-MM-DD"
  repeat?: 'None' | 'Daily' | 'Weekly' | 'Monthly';
  rewardXp?: number;
  rewardCoins?: number;
  tags?: string[];
  colorLabel?: string;
  reminder?: string; // "HH:MM"
  location?: string;
  checklist?: { id: string; text: string; completed: boolean }[];
  progress?: number; // 0 to 100
  customIcon?: string;
  notes?: string;
  links?: string[];
}

export type Mission = ScheduledQuest;

export interface CalendarCell {
  dateStr: string;
  dayNum: number;
  isCurrentMonth: boolean;
}

export interface DailyNote {
  morningPlan?: string;
  todayGoals?: string;
  quickNotes?: string;
  studyNotes?: string;
  ideas?: string;
  meetingNotes?: string;
  reflection?: string;
  gratitude?: string;
  lessonsLearned?: string;
  tomorrowPlan?: string;
}

export interface DailyJournal {
  mood: 'Excellent' | 'Good' | 'Neutral' | 'Tired' | 'Overwhelmed' | 'Stressed';
  achievement?: string;
  challenge?: string;
  learned?: string;
  prayerReflection?: string;
  workoutReflection?: string;
  languagePractice?: string;
  readingSummary?: string;
  generalThoughts?: string;
}
