/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Companion } from '../../types';
import { LucideIcon } from '../LucideIcon';

interface CompanionChatProps {
  activeCompanion: Companion;
  chatHistory: { sender: 'user' | 'companion'; text: string }[];
  chatLoading: boolean;
  onSendMessage: (message: string) => void;
}

export const CompanionChat: React.FC<CompanionChatProps> = ({
  activeCompanion,
  chatHistory,
  chatLoading,
  onSendMessage,
}) => {
  const [chatInput, setChatInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    onSendMessage(chatInput.trim());
    setChatInput('');
  };

  return (
    <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md flex flex-col justify-between h-[360px]">
      <div className="border-b border-slate-800 pb-3 mb-3 flex justify-between items-center">
        <h2 className="text-xs font-mono uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
          <LucideIcon name="Cpu" size={13} className="animate-pulse" />
          Companion Brain: {activeCompanion.name}
        </h2>
        <span className="text-[9px] font-mono text-slate-500">Live AI Link</span>
      </div>

      {/* MESSAGE TIMELINE LIST */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4 scrollbar-none text-xs">
        {chatHistory.map((ch, idx) => (
          <div key={idx} className={`flex ${ch.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`p-2.5 max-w-[85%] rounded-xl leading-relaxed font-serif ${
                ch.sender === 'user'
                  ? 'bg-blue-600/20 border border-blue-500/30 text-white rounded-br-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-bl-none italic'
              }`}
            >
              <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-1">
                {ch.sender === 'user' ? 'Adventurer' : activeCompanion.name}
              </span>
              {ch.text}
            </div>
          </div>
        ))}
        {chatLoading && (
          <div className="flex justify-start">
            <div className="p-2.5 bg-slate-900 border border-slate-800 text-slate-500 rounded-xl rounded-bl-none animate-pulse italic font-serif">
              {activeCompanion.name} is channeling thoughts...
            </div>
          </div>
        )}
      </div>

      {/* CHAT INPUT BOX */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder={`Talk to ${activeCompanion.name}...`}
          disabled={chatLoading}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500/50 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={chatLoading || !chatInput.trim()}
          className="px-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
        >
          <LucideIcon name="Send" size={12} />
        </button>
      </form>
    </div>
  );
};
export default CompanionChat;
