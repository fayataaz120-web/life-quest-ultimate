/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { DailyJournal } from '../../types/calendar';
import { LucideIcon } from '../LucideIcon';
import { sfx } from '../../utils/audio';

interface JournalEditorProps {
  dateStr: string;
  initialJournal?: DailyJournal;
  onSave: (journal: DailyJournal) => void;
}

export const JournalEditor: React.FC<JournalEditorProps> = ({
  dateStr,
  initialJournal,
  onSave,
}) => {
  const [mood, setMood] = useState<DailyJournal['mood']>(initialJournal?.mood || 'Neutral');
  const [achievement, setAchievement] = useState(initialJournal?.achievement || '');
  const [challenge, setChallenge] = useState(initialJournal?.challenge || '');
  const [learned, setLearned] = useState(initialJournal?.learned || '');
  const [prayerRef, setPrayerRef] = useState(initialJournal?.prayerReflection || '');
  const [workoutRef, setWorkoutRef] = useState(initialJournal?.workoutReflection || '');
  const [langPractice, setLangPractice] = useState(initialJournal?.languagePractice || '');
  const [readingSum, setReadingSum] = useState(initialJournal?.readingSummary || '');
  const [thoughts, setThoughts] = useState(initialJournal?.generalThoughts || '');
  
  const [saveStatus, setSaveStatus] = useState<'Saved' | 'Saving...' | 'Unsaved Changes'>('Saved');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reload fields if date changes
  useEffect(() => {
    setMood(initialJournal?.mood || 'Neutral');
    setAchievement(initialJournal?.achievement || '');
    setChallenge(initialJournal?.challenge || '');
    setLearned(initialJournal?.learned || '');
    setPrayerRef(initialJournal?.prayerReflection || '');
    setWorkoutRef(initialJournal?.workoutReflection || '');
    setLangPractice(initialJournal?.languagePractice || '');
    setReadingSum(initialJournal?.readingSummary || '');
    setThoughts(initialJournal?.generalThoughts || '');
    setSaveStatus('Saved');
  }, [dateStr, initialJournal]);

  // Handle Autosave Logic with 1.5s debounce
  const triggerAutosave = () => {
    setSaveStatus('Saving...');
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const journalData: DailyJournal = {
        mood,
        achievement: achievement.trim(),
        challenge: challenge.trim(),
        learned: learned.trim(),
        prayerReflection: prayerRef.trim(),
        workoutReflection: workoutRef.trim(),
        languagePractice: langPractice.trim(),
        readingSummary: readingSum.trim(),
        generalThoughts: thoughts.trim(),
      };
      
      onSave(journalData);
      setSaveStatus('Saved');
    }, 1500);
  };

  const handleFieldChange = (setter: (val: string) => void, val: string) => {
    setter(val);
    setSaveStatus('Unsaved Changes');
    triggerAutosave();
  };

  const handleMoodSelect = (selectedMood: DailyJournal['mood']) => {
    sfx.playClick();
    setMood(selectedMood);
    setSaveStatus('Unsaved Changes');
    // Save immediately on mood select
    setTimeout(() => {
      const journalData: DailyJournal = {
        mood: selectedMood,
        achievement: achievement.trim(),
        challenge: challenge.trim(),
        learned: learned.trim(),
        prayerReflection: prayerRef.trim(),
        workoutReflection: workoutRef.trim(),
        languagePractice: langPractice.trim(),
        readingSummary: readingSum.trim(),
        generalThoughts: thoughts.trim(),
      };
      onSave(journalData);
      setSaveStatus('Saved');
    }, 50);
  };

  const moods: { type: DailyJournal['mood']; icon: string; color: string }[] = [
    { type: 'Excellent', icon: 'Smile', color: 'text-emerald-400 bg-emerald-950/20' },
    { type: 'Good', icon: 'Laugh', color: 'text-teal-400 bg-teal-950/20' },
    { type: 'Neutral', icon: 'Meh', color: 'text-blue-400 bg-blue-950/20' },
    { type: 'Tired', icon: 'Frown', color: 'text-amber-400 bg-amber-950/20' },
    { type: 'Overwhelmed', icon: 'Compass', color: 'text-indigo-400 bg-indigo-950/20' },
    { type: 'Stressed', icon: 'AlertTriangle', color: 'text-rose-400 bg-rose-950/20' },
  ];

  return (
    <div className="space-y-4 font-sans">
      
      {/* Autosave Status Header */}
      <div className="flex justify-between items-center bg-slate-950/60 p-3 border border-slate-900 rounded-xl text-[10px] font-mono">
        <span className="text-slate-500 uppercase tracking-widest font-black">Journal Autosave Matrix</span>
        <span className={`font-bold flex items-center gap-1.5 ${
          saveStatus === 'Saved' ? 'text-emerald-400' : saveStatus === 'Saving...' ? 'text-amber-400 animate-pulse' : 'text-slate-400'
        }`}>
          <LucideIcon name={saveStatus === 'Saved' ? 'CheckCircle' : 'RefreshCw'} size={12} className={saveStatus === 'Saving...' ? 'animate-spin' : ''} />
          {saveStatus}
        </span>
      </div>

      {/* Mood Ring */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
          Today's Mood Vector
        </label>
        <div className="grid grid-cols-6 gap-1">
          {moods.map((m) => {
            const isSelected = mood === m.type;
            return (
              <button
                key={m.type}
                type="button"
                onClick={() => handleMoodSelect(m.type)}
                className={`py-2 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                  isSelected
                    ? `${m.color} border-slate-700 shadow-[0_0_8px_rgba(59,130,246,0.15)]`
                    : 'bg-slate-950/30 border-slate-900/60 text-slate-500 hover:text-slate-350'
                }`}
                title={m.type}
              >
                <LucideIcon name={m.icon as any} size={15} />
                <span className="text-[7px] font-mono font-bold uppercase tracking-wider scale-90">{m.type}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Text Logs grid */}
      <div className="space-y-3 pt-2">
        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
            ☀️ Today's Principal Achievement
          </label>
          <input
            type="text"
            placeholder="What contract did you slay today?"
            value={achievement}
            onChange={(e) => handleFieldChange(setAchievement, e.target.value)}
            className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-slate-800"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
            🌋 Biggest Daily Challenge
          </label>
          <input
            type="text"
            placeholder="What obstacle did we encounter?"
            value={challenge}
            onChange={(e) => handleFieldChange(setChallenge, e.target.value)}
            className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-slate-800"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
            🧠 What I Learned Today
          </label>
          <textarea
            placeholder="New libraries, algorithms, or alchemical discoveries..."
            value={learned}
            onChange={(e) => handleFieldChange(setLearned, e.target.value)}
            className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-1.5 text-xs text-slate-250 outline-none focus:border-slate-800 h-14 resize-none h-14"
          />
        </div>

        {/* Reflections */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500">
              📚 Reading Summary
            </label>
            <textarea
              placeholder="Books read..."
              value={readingSum}
              onChange={(e) => handleFieldChange(setReadingSum, e.target.value)}
              className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-1.5 text-xs text-slate-250 outline-none focus:border-slate-800 h-14 resize-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500">
              💬 Language Practice
            </label>
            <textarea
              placeholder="Vocabulary logs..."
              value={langPractice}
              onChange={(e) => handleFieldChange(setLangPractice, e.target.value)}
              className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-1.5 text-xs text-slate-250 outline-none focus:border-slate-800 h-14 resize-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500">
              ⚔️ Workout Reflection
            </label>
            <textarea
              placeholder="Cardio, weights details..."
              value={workoutRef}
              onChange={(e) => handleFieldChange(setWorkoutRef, e.target.value)}
              className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-1.5 text-xs text-slate-250 outline-none focus:border-slate-800 h-14 resize-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500">
              ⚡ Prayer Reflection
            </label>
            <textarea
              placeholder="Sovereign alignment..."
              value={prayerRef}
              onChange={(e) => handleFieldChange(setPrayerRef, e.target.value)}
              className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-1.5 text-xs text-slate-250 outline-none focus:border-slate-800 h-14 resize-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
            📜 General Thoughts & Musings
          </label>
          <textarea
            placeholder="General thoughts on the campaign of life..."
            value={thoughts}
            onChange={(e) => handleFieldChange(setThoughts, e.target.value)}
            className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-250 outline-none focus:border-slate-800 h-20 resize-none"
          />
        </div>
      </div>
    </div>
  );
};
export default JournalEditor;
