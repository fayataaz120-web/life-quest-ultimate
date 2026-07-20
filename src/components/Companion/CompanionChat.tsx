/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Companion } from '../../types';
import { LucideIcon } from '../LucideIcon';
import { sfx } from '../../utils/audio';

interface CompanionChatProps {
  activeCompanion: Companion;
  chatHistory: { sender: 'user' | 'companion'; text: string }[];
  chatLoading: boolean;
  onSendMessage: (message: string) => void;
  micPermissionEnabled: boolean;
  onRequestMicPermission: () => Promise<boolean>;
}

export const CompanionChat: React.FC<CompanionChatProps> = ({
  activeCompanion,
  chatHistory,
  chatLoading,
  onSendMessage,
  micPermissionEnabled,
  onRequestMicPermission,
}) => {
  const [chatInput, setChatInput] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    onSendMessage(chatInput.trim());
    setChatInput('');
  };

  const handleMicClick = async () => {
    // Request mic access first if disabled
    if (!micPermissionEnabled) {
      const approved = await onRequestMicPermission();
      if (!approved) return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.");
      return;
    }

    try {
      sfx.playSkillUnlock();
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setChatInput(transcript);
        sfx.playCoin();
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
    }
  };

  const parseMessageSources = (text: string) => {
    const sources: ('personal' | 'search' | 'general')[] = [];
    let cleanedText = text;

    if (/\[Memory Core:\s*Personal Data\]/gi.test(cleanedText)) {
      sources.push('personal');
      cleanedText = cleanedText.replace(/\[Memory Core:\s*Personal Data\]/gi, '').trim();
    }
    if (/\[Aether Web:\s*Search Retrieval\]/gi.test(cleanedText)) {
      sources.push('search');
      cleanedText = cleanedText.replace(/\[Aether Web:\s*Search Retrieval\]/gi, '').trim();
    }
    if (/\[Guardian Core:\s*General Wisdom\]/gi.test(cleanedText)) {
      sources.push('general');
      cleanedText = cleanedText.replace(/\[Guardian Core:\s*General Wisdom\]/gi, '').trim();
    }

    return { sources, cleanedText };
  };

  return (
    <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md flex flex-col justify-between h-[360px] relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
      
      <div className="border-b border-slate-800 pb-3 mb-3 flex justify-between items-center">
        <h2 className="text-xs font-mono uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
          <LucideIcon name="Cpu" size={13} className="animate-pulse" />
          Companion Brain: {activeCompanion.name}
        </h2>
        <span className="text-[9px] font-mono text-slate-500">Live AI Link</span>
      </div>

      {/* MESSAGE TIMELINE LIST */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4 scrollbar-none text-xs">
        {chatHistory.map((ch, idx) => {
          const isUser = ch.sender === 'user';
          const { sources, cleanedText } = isUser ? { sources: [], cleanedText: ch.text } : parseMessageSources(ch.text);

          return (
            <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`p-2.5 max-w-[85%] rounded-xl leading-relaxed font-serif ${
                  isUser
                    ? 'bg-blue-600/20 border border-blue-500/30 text-white rounded-br-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-350 rounded-bl-none'
                }`}
              >
                <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 leading-none">
                  {isUser ? 'Adventurer' : activeCompanion.name}
                </span>
                
                <p className={isUser ? '' : 'italic'}>{cleanedText}</p>

                {/* Badge Sources */}
                {sources.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2.5 pt-2 border-t border-slate-800/40">
                    {sources.includes('personal') && (
                      <span className="text-[8px] font-mono font-bold bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 px-1.5 py-0.5 rounded flex items-center gap-1 select-none">
                        <LucideIcon name="User" size={8} />
                        Memory: Personal Data
                      </span>
                    )}
                    {sources.includes('search') && (
                      <span className="text-[8px] font-mono font-bold bg-blue-950/40 border border-blue-900/50 text-blue-400 px-1.5 py-0.5 rounded flex items-center gap-1 select-none">
                        <LucideIcon name="Globe" size={8} />
                        Aether Web: Search
                      </span>
                    )}
                    {sources.includes('general') && (
                      <span className="text-[8px] font-mono font-bold bg-purple-950/40 border border-purple-900/50 text-purple-400 px-1.5 py-0.5 rounded flex items-center gap-1 select-none">
                        <LucideIcon name="Cpu" size={8} />
                        Guardian: Core AI
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {chatLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="p-2.5 bg-slate-900 border border-slate-800 text-slate-500 rounded-xl rounded-bl-none italic font-serif">
              {activeCompanion.name} is channeling thoughts...
            </div>
          </div>
        )}
      </div>

      {/* CHAT INPUT BOX */}
      <form onSubmit={handleSubmit} className="flex gap-2 relative z-10">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder={isListening ? "Listening..." : `Talk to ${activeCompanion.name}...`}
          disabled={chatLoading}
          className={`flex-1 bg-slate-900 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500/50 disabled:opacity-50 ${isListening ? 'border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.25)] animate-pulse' : ''}`}
        />
        
        {/* VOICE MICROPHONE ACTIVATOR BUTTON */}
        <button
          type="button"
          onClick={handleMicClick}
          disabled={chatLoading}
          className={`px-2.5 rounded-lg border text-xs flex items-center justify-center cursor-pointer transition-colors ${
            isListening 
              ? 'bg-red-950/50 border-red-500 text-red-400 hover:bg-red-900/40 animate-pulse' 
              : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
          title="Speech to Text Dictation"
        >
          <LucideIcon name="Mic" size={13} className={isListening ? 'scale-110' : ''} />
        </button>

        <button
          type="submit"
          disabled={chatLoading || !chatInput.trim()}
          className="px-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-850 disabled:text-slate-500 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
        >
          <LucideIcon name="Send" size={12} />
        </button>
      </form>
    </div>
  );
};
export default CompanionChat;
