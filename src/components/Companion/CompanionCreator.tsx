/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LucideIcon } from '../LucideIcon';

interface CompanionCreatorProps {
  onClose: () => void;
  onCreate: (data: {
    name: string;
    bio: string;
    role: string;
    personality: string;
    voice: string;
    greeting: string;
    color: string;
    vfx: string[];
  }) => void;
}

export const CompanionCreator: React.FC<CompanionCreatorProps> = ({ onClose, onCreate }) => {
  const [newCompName, setNewCompName] = useState('');
  const [newCompBio, setNewCompBio] = useState('');
  const [newCompRole, setNewCompRole] = useState('Productivity Tutor');
  const [newCompPersonality, setNewCompPersonality] = useState('Cheerful and energetic');
  const [newCompVoice, setNewCompVoice] = useState('Bright, chiming tone');
  const [newCompGreeting, setNewCompGreeting] = useState("Let's absolute crush it today!");
  const [newCompColor, setNewCompColor] = useState('sky');
  const [newCompVfx, setNewCompVfx] = useState<string[]>(['floating_particles']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName.trim()) return;

    onCreate({
      name: newCompName.trim(),
      bio: newCompBio.trim(),
      role: newCompRole.trim(),
      personality: newCompPersonality.trim(),
      voice: newCompVoice.trim(),
      greeting: newCompGreeting.trim(),
      color: newCompColor,
      vfx: newCompVfx,
    });

    setNewCompName('');
    setNewCompBio('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-950 border border-indigo-500/40 rounded-xl p-6 space-y-4 animate-[fadeIn_0.3s_ease]"
    >
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <h2 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
          <LucideIcon name="Flame" />
          CONJURE NEW COMPANION (UNLIMITED)
        </h2>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-white">
          <LucideIcon name="X" size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Companion Name *</label>
          <input
            type="text"
            required
            value={newCompName}
            onChange={(e) => setNewCompName(e.target.value)}
            placeholder="e.g., Alchemical Imp"
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:border-indigo-500 outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Role / Specialization</label>
          <input
            type="text"
            value={newCompRole}
            onChange={(e) => setNewCompRole(e.target.value)}
            placeholder="e.g., Discipline Overseer"
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:border-indigo-500 outline-none"
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Biography / Origin Story</label>
          <textarea
            value={newCompBio}
            onChange={(e) => setNewCompBio(e.target.value)}
            placeholder="Describe your custom guardian's origin and magical attributes..."
            rows={2}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:border-indigo-500 outline-none h-16 resize-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Personality Traits</label>
          <input
            type="text"
            value={newCompPersonality}
            onChange={(e) => setNewCompPersonality(e.target.value)}
            placeholder="e.g., Stern yet encouraging"
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:border-indigo-500 outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Vocal Tone description</label>
          <input
            type="text"
            value={newCompVoice}
            onChange={(e) => setNewCompVoice(e.target.value)}
            placeholder="e.g., Whispering starlight voice"
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:border-indigo-500 outline-none"
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Greeting Quote</label>
          <input
            type="text"
            value={newCompGreeting}
            onChange={(e) => setNewCompGreeting(e.target.value)}
            placeholder="The greeting they whisper when summoned..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:border-indigo-500 outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Energy Color Scheme</label>
          <select
            value={newCompColor}
            onChange={(e) => setNewCompColor(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white outline-none"
          >
            <option value="sky">Ocean Blue Energy</option>
            <option value="emerald">Forest Emerald Aura</option>
            <option value="purple">Cosmic Violet Warp</option>
            <option value="rose">Lava Crimson Strike</option>
            <option value="amber">Celestial Gold Light</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Visual FX Manifestations</label>
          <div className="flex flex-wrap gap-2 pt-1">
            {['floating_particles', 'magic_circles', 'lightning_sparks'].map((fx) => (
              <button
                type="button"
                key={fx}
                onClick={() => {
                  if (newCompVfx.includes(fx)) {
                    setNewCompVfx(newCompVfx.filter((item) => item !== fx));
                  } else {
                    setNewCompVfx([...newCompVfx, fx]);
                  }
                }}
                className={`px-2.5 py-1 rounded-full text-[10px] font-mono border transition-all cursor-pointer ${
                  newCompVfx.includes(fx)
                    ? 'bg-indigo-950 border-indigo-500 text-indigo-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {fx.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-900">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-lg"
        >
          Conjure Companion
        </button>
      </div>
    </form>
  );
};
export default CompanionCreator;
