/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { DailyNote } from '../../types/calendar';
import { LucideIcon } from '../LucideIcon';

interface NotesEditorProps {
  dateStr: string;
  initialNote?: DailyNote;
  onSave: (note: DailyNote) => void;
}

export const NotesEditor: React.FC<NotesEditorProps> = ({
  dateStr,
  initialNote,
  onSave,
}) => {
  const [morning, setMorning] = useState(initialNote?.morningPlan || '');
  const [goals, setGoals] = useState(initialNote?.todayGoals || '');
  const [quick, setQuick] = useState(initialNote?.quickNotes || '');
  const [study, setStudy] = useState(initialNote?.studyNotes || '');
  const [ideas, setIdeas] = useState(initialNote?.ideas || '');
  const [meeting, setMeeting] = useState(initialNote?.meetingNotes || '');
  const [ref, setRef] = useState(initialNote?.reflection || '');
  const [gratitude, setGratitude] = useState(initialNote?.gratitude || '');
  const [lessons, setLessons] = useState(initialNote?.lessonsLearned || '');
  const [tomorrow, setTomorrow] = useState(initialNote?.tomorrowPlan || '');

  const [activeTab, setActiveTab] = useState<'plan' | 'study' | 'reflect'>('plan');
  const [saveStatus, setSaveStatus] = useState<'Saved' | 'Saving...' | 'Unsaved Changes'>('Saved');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reload on date shift
  useEffect(() => {
    setMorning(initialNote?.morningPlan || '');
    setGoals(initialNote?.todayGoals || '');
    setQuick(initialNote?.quickNotes || '');
    setStudy(initialNote?.studyNotes || '');
    setIdeas(initialNote?.ideas || '');
    setMeeting(initialNote?.meetingNotes || '');
    setRef(initialNote?.reflection || '');
    setGratitude(initialNote?.gratitude || '');
    setLessons(initialNote?.lessonsLearned || '');
    setTomorrow(initialNote?.tomorrowPlan || '');
    setSaveStatus('Saved');
  }, [dateStr, initialNote]);

  const triggerAutosave = () => {
    setSaveStatus('Saving...');
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const noteData: DailyNote = {
        morningPlan: morning.trim(),
        todayGoals: goals.trim(),
        quickNotes: quick.trim(),
        studyNotes: study.trim(),
        ideas: ideas.trim(),
        meetingNotes: meeting.trim(),
        reflection: ref.trim(),
        gratitude: gratitude.trim(),
        lessonsLearned: lessons.trim(),
        tomorrowPlan: tomorrow.trim(),
      };
      
      onSave(noteData);
      setSaveStatus('Saved');
    }, 1500);
  };

  const handleFieldChange = (setter: (val: string) => void, val: string) => {
    setter(val);
    setSaveStatus('Unsaved Changes');
    triggerAutosave();
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Autosave Status Header */}
      <div className="flex justify-between items-center bg-slate-950/60 p-3 border border-slate-900 rounded-xl text-[10px] font-mono">
        <span className="text-slate-500 uppercase tracking-widest font-black flex items-center gap-1">
          <LucideIcon name="Edit3" size={11} />
          Markdown Notes Ledger
        </span>
        <span className={`font-bold flex items-center gap-1.5 ${
          saveStatus === 'Saved' ? 'text-emerald-400' : saveStatus === 'Saving...' ? 'text-amber-400 animate-pulse' : 'text-slate-400'
        }`}>
          <LucideIcon name={saveStatus === 'Saved' ? 'CheckCircle' : 'RefreshCw'} size={12} className={saveStatus === 'Saving...' ? 'animate-spin' : ''} />
          {saveStatus}
        </span>
      </div>

      {/* Sub tabs inside notes */}
      <div className="flex bg-slate-950 border border-slate-900 rounded-xl p-1 text-[10px] font-mono font-bold uppercase">
        <button
          type="button"
          onClick={() => setActiveTab('plan')}
          className={`flex-1 py-1.5 text-center rounded-lg cursor-pointer transition-colors ${
            activeTab === 'plan' ? 'bg-slate-900 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Daily Plan
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('study')}
          className={`flex-1 py-1.5 text-center rounded-lg cursor-pointer transition-colors ${
            activeTab === 'study' ? 'bg-slate-900 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Ideas & Study
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reflect')}
          className={`flex-1 py-1.5 text-center rounded-lg cursor-pointer transition-colors ${
            activeTab === 'reflect' ? 'bg-slate-900 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Reflection
        </button>
      </div>

      <div className="space-y-4">
        {/* SUB TAB 1: DAILY PLAN */}
        {activeTab === 'plan' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                🌅 Morning Strategic Plan (Supports Markdown)
              </label>
              <textarea
                placeholder="- [ ] 09:00: Run compiler setup..."
                value={morning}
                onChange={(e) => handleFieldChange(setMorning, e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-slate-800 h-24 font-mono leading-relaxed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                🎯 Principal Goals
              </label>
              <textarea
                placeholder="1. Slay primary daily missions..."
                value={goals}
                onChange={(e) => handleFieldChange(setGoals, e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-slate-800 h-20 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                🚀 Tomorrow Plan
              </label>
              <textarea
                placeholder="Outline next focus milestones..."
                value={tomorrow}
                onChange={(e) => handleFieldChange(setTomorrow, e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-slate-800 h-16 font-mono"
              />
            </div>
          </div>
        )}

        {/* SUB TAB 2: IDEAS & STUDY */}
        {activeTab === 'study' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                🧠 Study / Grimoire Notes
              </label>
              <textarea
                placeholder="Log theories, terms, formulas, or grammar points..."
                value={study}
                onChange={(e) => handleFieldChange(setStudy, e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-slate-800 h-24 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                💡 Infinite Ideas Sandbox
              </label>
              <textarea
                placeholder="Creative brainstorm logs, business frameworks..."
                value={ideas}
                onChange={(e) => handleFieldChange(setIdeas, e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-slate-800 h-20 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                👥 Meeting Notes
              </label>
              <textarea
                placeholder="Discussion notes or stakeholder criteria..."
                value={meeting}
                onChange={(e) => handleFieldChange(setMeeting, e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-slate-800 h-16 font-mono"
              />
            </div>
          </div>
        )}

        {/* SUB TAB 3: REFLECTION */}
        {activeTab === 'reflect' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                📜 Evening Reflections
              </label>
              <textarea
                placeholder="Reflect on today's discipline, failures, and energy patterns..."
                value={ref}
                onChange={(e) => handleFieldChange(setRef, e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-slate-800 h-24 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                🙏 Daily Gratitude Logs
              </label>
              <textarea
                placeholder="Three things we are grateful for today..."
                value={gratitude}
                onChange={(e) => handleFieldChange(setGratitude, e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-slate-800 h-20 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                🛡️ Lessons Learned / Guardrails
              </label>
              <textarea
                placeholder="Failures transmuting into wisdom metrics..."
                value={lessons}
                onChange={(e) => handleFieldChange(setLessons, e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-slate-800 h-20 font-mono"
              />
            </div>

            {/* Quick Notes */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                ⚡ Quick Scratch Notes
              </label>
              <input
                type="text"
                placeholder="Short reminders, phone numbers..."
                value={quick}
                onChange={(e) => handleFieldChange(setQuick, e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-slate-800 font-mono"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default NotesEditor;
