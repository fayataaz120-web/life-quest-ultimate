/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { AppState } from '../types';
import { LucideIcon } from './LucideIcon';
import { sfx } from '../utils/audio';

interface AICoachProps {
  state: AppState;
}

const ARCHMAGE_GREETINGS = [
  "I have read your celestial timeline, Adventurer. Your training regimens are reflecting into the cosmic mirror.",
  "Ah, the seals are aligned! Let us peer into your strengths and untapped reservoirs of mystical energy.",
  "Sloth is merely a shadow. Together, we shall kindle the fires of consistency and conquer your active quests.",
  "The road of ten thousand strikes is long, but each cleared regiment refines your soul. Speak, and I shall counsel you."
];

export const AICoach: React.FC<AICoachProps> = ({ state }) => {
  const [report, setReport] = useState<string>(() => {
    return localStorage.getItem('life_quest_ultimate_ai_report') || '';
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Select random greeting
    const idx = Math.floor(Math.random() * ARCHMAGE_GREETINGS.length);
    setGreeting(ARCHMAGE_GREETINGS[idx]);
  }, []);

  const handleConsultOracle = async () => {
    setLoading(true);
    setError(null);
    sfx.playSkillUnlock();

    try {
      const response = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(state)
      });

      if (!response.ok) {
        throw new Error(`Failed to consult Oracle matrix: status ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setReport(data.report);
      localStorage.setItem('life_quest_ultimate_ai_report', data.report);
      sfx.playLevelUp();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "The cosmic portal experienced a brief disturbance. Please re-invoke the portal.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearReport = () => {
    if (confirm("Are you sure you want to clear your current Oracle insights?")) {
      setReport('');
      localStorage.removeItem('life_quest_ultimate_ai_report');
      sfx.playQuestComplete();
    }
  };

  return (
    <div className="space-y-6" id="ai-coach-container">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <LucideIcon name="Crown" className="text-blue-400 font-bold animate-pulse" />
            Oracle AI Council Chambers
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Consult the Grand Archmage of Focus. Get constructive, non-judgmental RPG feedback and strategic advice.
          </p>
        </div>
      </div>

      {/* ARCHMAGE CONVERSATION HUD CARD */}
      <div className="bg-slate-950/70 border border-blue-900/30 rounded-xl p-6 relative overflow-hidden flex flex-col md:flex-row gap-6 items-center md:items-start shadow-[0_0_20px_rgba(59,130,246,0.03)]">
        {/* Holographic Glowing Border Background Line */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/55 to-transparent"></div>
        
        {/* Archmage Holographic Avatar */}
        <div className="relative shrink-0 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-700/30 via-indigo-700/20 to-purple-800/40 p-1.5 border border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse flex items-center justify-center">
            <LucideIcon name="Sparkles" size={42} className="text-blue-300" />
          </div>
          <span className="mt-2.5 text-[10px] font-mono tracking-widest text-blue-400 font-bold bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-900/40">
            NPC: ARCHMAGE
          </span>
        </div>

        {/* Dialogue Bubble */}
        <div className="space-y-4 text-center md:text-left flex-1">
          <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl relative">
            {/* Dialogue tail */}
            <div className="hidden md:block absolute top-6 -left-2 w-3 h-3 bg-slate-900 border-l border-b border-slate-800 rotate-45"></div>
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest">Grand Archmage of Focus says:</h3>
            <p className="text-sm text-slate-200 mt-1.5 leading-relaxed font-serif italic">
              "{greeting || "The stars are aligning. Let us plan your next strategic campaign."}"
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <button
              onClick={handleConsultOracle}
              disabled={loading}
              className={`px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-900 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.3)] cursor-pointer`}
            >
              <LucideIcon name={loading ? "Loader2" : "Sparkles"} size={14} className={loading ? "animate-spin" : ""} />
              {loading ? "Siphoning Mana..." : "Invoke Council Consultation"}
            </button>
            {report && (
              <button
                onClick={handleClearReport}
                className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Clear Insights
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MANA LOADER SCREEN */}
      {loading && (
        <div className="bg-slate-950/60 border border-blue-900/30 p-12 rounded-xl text-center flex flex-col items-center justify-center space-y-4 animate-pulse">
          <div className="p-4 bg-blue-950/50 rounded-full border border-blue-800 animate-spin">
            <LucideIcon name="Loader2" size={32} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-md font-bold text-white font-mono">SIPHONING COSMIC MANA...</h3>
            <p className="text-xs text-slate-400 mt-1">Analyzing levels, history, and records. Siphoning intelligence streams take 5-10 seconds.</p>
          </div>
        </div>
      )}

      {/* ERROR STATUS */}
      {error && (
        <div className="p-4 bg-red-950/40 border border-red-900/60 text-red-400 rounded-xl text-xs font-mono flex items-center gap-2.5">
          <LucideIcon name="AlertTriangle" size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* REPORT CONTENT PANEL */}
      {report && !loading && (
        <div className="bg-slate-900/35 border border-slate-800/80 rounded-xl p-6 md:p-8 backdrop-blur-md relative">
          {/* Holographic Glowing Header */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-800/60 mb-6">
            <h2 className="text-xs font-mono uppercase tracking-widest text-blue-400 flex items-center gap-2">
              <LucideIcon name="Scroll" size={13} />
              COUNCIL SCROLL & ROADMAP
            </h2>
            <span className="text-[10px] font-mono text-slate-500">
              Verified by Archmage of Focus
            </span>
          </div>

          {/* RENDER REPORT WITH react-markdown AND TASTEFUL TYPOGRAPHY */}
          <div className="markdown-body text-slate-300 text-xs leading-relaxed space-y-4 select-text">
            <ReactMarkdown
              components={{
                h3: ({ children }) => <h3 className="text-sm font-bold text-white mt-5 mb-2 font-mono uppercase tracking-wider border-l-2 border-blue-500 pl-2">{children}</h3>,
                h4: ({ children }) => <h4 className="text-xs font-bold text-blue-300 mt-4 mb-2">{children}</h4>,
                p: ({ children }) => <p className="leading-relaxed mb-3 text-slate-300">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3 text-slate-300">{children}</ul>,
                li: ({ children }) => <li className="text-slate-300 pl-1">{children}</li>,
                blockquote: ({ children }) => <blockquote className="border-l-4 border-slate-700 bg-slate-950/45 px-4 py-2 my-4 rounded italic text-slate-400">{children}</blockquote>,
                strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>
              }}
            >
              {report}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};
