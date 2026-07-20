/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LucideIcon } from '../LucideIcon';
import { sfx } from '../../utils/audio';

export interface CorePermissions {
  mic: boolean;
  webSearch: boolean;
  personalData: boolean;
  externalApis: boolean;
}

export interface CoreApiKeys {
  gemini: string;
  openai: string;
  claude: string;
  localEndpoint: string;
}

interface InfinityCorePanelProps {
  onChange?: (config: {
    provider: string;
    permissions: CorePermissions;
    apiKeys: CoreApiKeys;
  }) => void;
}

export const InfinityCorePanel: React.FC<InfinityCorePanelProps> = ({ onChange }) => {
  // Load configuration from local storage
  const [provider, setProvider] = useState<string>(() => {
    return localStorage.getItem('infinity_core_provider') || 'gemini';
  });

  const [permissions, setPermissions] = useState<CorePermissions>(() => {
    const saved = localStorage.getItem('infinity_core_permissions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      mic: true,
      webSearch: false,
      personalData: true,
      externalApis: false,
    };
  });

  const [apiKeys, setApiKeys] = useState<CoreApiKeys>(() => {
    return {
      gemini: localStorage.getItem('infinity_core_key_gemini') || '',
      openai: localStorage.getItem('infinity_core_key_openai') || '',
      claude: localStorage.getItem('infinity_core_key_claude') || '',
      localEndpoint: localStorage.getItem('infinity_core_key_local') || 'http://localhost:11434/v1/chat/completions',
    };
  });

  const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('infinity_core_provider', provider);
    localStorage.setItem('infinity_core_permissions', JSON.stringify(permissions));
    localStorage.setItem('infinity_core_key_gemini', apiKeys.gemini);
    localStorage.setItem('infinity_core_key_openai', apiKeys.openai);
    localStorage.setItem('infinity_core_key_claude', apiKeys.claude);
    localStorage.setItem('infinity_core_key_local', apiKeys.localEndpoint);

    if (onChange) {
      onChange({ provider, permissions, apiKeys });
    }
  }, [provider, permissions, apiKeys]);

  const handleTogglePermission = (key: keyof CorePermissions) => {
    const nextVal = !permissions[key];
    
    // Warn player when enabling critical features
    if (nextVal && key === 'webSearch') {
      sfx.playLevelUp();
      setShowConfirmModal('webSearch');
    } else if (nextVal && key === 'externalApis') {
      sfx.playLevelUp();
      setShowConfirmModal('externalApis');
    } else if (nextVal && key === 'personalData') {
      sfx.playLevelUp();
      setShowConfirmModal('personalData');
    } else {
      sfx.playClick();
      setPermissions(prev => ({ ...prev, [key]: nextVal }));
    }
  };

  const confirmToggle = (key: string) => {
    sfx.playQuestComplete();
    setPermissions(prev => ({ ...prev, [key]: true }));
    setShowConfirmModal(null);
  };

  const handleKeyChange = (key: keyof CoreApiKeys, val: string) => {
    setApiKeys(prev => ({ ...prev, [key]: val }));
  };

  const toggleShowKey = (key: string) => {
    sfx.playClick();
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-500/35 to-transparent"></div>
      
      <div className="border-b border-slate-900 pb-3 mb-4 flex justify-between items-center">
        <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
          <LucideIcon name="Cpu" size={13} className="animate-spin" style={{ animationDuration: '8s' }} />
          Infinity Core AI Gateway
        </h2>
        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">Gateway Configuration</span>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
        Customize the modular thinking engine of **Infinity Ascendant**. Choose your model provider, input credentials, and manage privacy layers.
      </p>

      {/* PROVIDER SELECT */}
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="block text-[10px] font-mono uppercase text-slate-400 tracking-wider font-bold">
            Active Provider Node
          </label>
          <select
            value={provider}
            onChange={(e) => { sfx.playCoin(); setProvider(e.target.value); }}
            className="w-full bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500/50 cursor-pointer font-mono"
          >
            <option value="gemini">Google Gemini (GenAI SDK)</option>
            <option value="openai">OpenAI (GPT-4 / 3.5)</option>
            <option value="claude">Anthropic Claude (Messages API)</option>
            <option value="local">Local Model Node (Ollama / Llama)</option>
          </select>
        </div>

        {/* API KEY CONFIGS (Conditional on select) */}
        <div className="bg-slate-900/40 border border-slate-900/60 p-3 rounded-lg space-y-3">
          {provider === 'gemini' && (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Gemini API Key</label>
                <button type="button" onClick={() => toggleShowKey('gemini')} className="text-[8px] text-slate-500 hover:text-white cursor-pointer font-mono uppercase">
                  {showKeys['gemini'] ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showKeys['gemini'] ? 'text' : 'password'}
                value={apiKeys.gemini}
                onChange={(e) => handleKeyChange('gemini', e.target.value)}
                placeholder="Leave blank to use server environment key..."
                className="w-full bg-slate-950 border border-slate-850 rounded-md px-2 py-1 text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
              />
            </div>
          )}

          {provider === 'openai' && (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">OpenAI API Key</label>
                <button type="button" onClick={() => toggleShowKey('openai')} className="text-[8px] text-slate-500 hover:text-white cursor-pointer font-mono uppercase">
                  {showKeys['openai'] ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showKeys['openai'] ? 'text' : 'password'}
                value={apiKeys.openai}
                onChange={(e) => handleKeyChange('openai', e.target.value)}
                placeholder="sk-proj-..."
                className="w-full bg-slate-950 border border-slate-850 rounded-md px-2 py-1 text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
              />
            </div>
          )}

          {provider === 'claude' && (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Claude API Key</label>
                <button type="button" onClick={() => toggleShowKey('claude')} className="text-[8px] text-slate-500 hover:text-white cursor-pointer font-mono uppercase">
                  {showKeys['claude'] ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showKeys['claude'] ? 'text' : 'password'}
                value={apiKeys.claude}
                onChange={(e) => handleKeyChange('claude', e.target.value)}
                placeholder="sk-ant-..."
                className="w-full bg-slate-950 border border-slate-850 rounded-md px-2 py-1 text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
              />
            </div>
          )}

          {provider === 'local' && (
            <div className="space-y-1">
              <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest">Local Endpoint URL</label>
              <input
                type="text"
                value={apiKeys.localEndpoint}
                onChange={(e) => handleKeyChange('localEndpoint', e.target.value)}
                placeholder="http://localhost:11434/v1/chat/completions"
                className="w-full bg-slate-950 border border-slate-850 rounded-md px-2 py-1 text-xs text-white outline-none focus:border-cyan-500/50 font-mono"
              />
            </div>
          )}
        </div>

        {/* SECURITY & PRIVACY TOGGLES */}
        <div className="space-y-2.5">
          <span className="block text-[10px] font-mono uppercase text-slate-400 tracking-wider font-bold">
            Gateway Permissions & Controls
          </span>

          <div className="space-y-2 text-xs">
            {/* 1. MIC PERMISSION */}
            <div className="flex justify-between items-center bg-slate-900/20 border border-slate-900/60 p-2.5 rounded-lg">
              <div>
                <span className="font-bold text-white block">Microphone Access</span>
                <span className="text-[9px] text-slate-500 leading-none">Enable Speech Dictation for voice chat.</span>
              </div>
              <input
                type="checkbox"
                checked={permissions.mic}
                onChange={() => handleTogglePermission('mic')}
                className="w-4 h-4 cursor-pointer accent-cyan-500"
              />
            </div>

            {/* 2. SEARCH PERMISSION */}
            <div className="flex justify-between items-center bg-slate-900/20 border border-slate-900/60 p-2.5 rounded-lg">
              <div>
                <span className="font-bold text-white block">Web Search Grounding</span>
                <span className="text-[9px] text-slate-500 leading-none">Access online sources for current data.</span>
              </div>
              <input
                type="checkbox"
                checked={permissions.webSearch}
                onChange={() => handleTogglePermission('webSearch')}
                className="w-4 h-4 cursor-pointer accent-cyan-500"
              />
            </div>

            {/* 3. PERSONAL DATA PERMISSION */}
            <div className="flex justify-between items-center bg-slate-900/20 border border-slate-900/60 p-2.5 rounded-lg">
              <div>
                <span className="font-bold text-white block">Personal Data Access</span>
                <span className="text-[9px] text-slate-500 leading-none">Feed quest logs, habits, and RPG stats.</span>
              </div>
              <input
                type="checkbox"
                checked={permissions.personalData}
                onChange={() => handleTogglePermission('personalData')}
                className="w-4 h-4 cursor-pointer accent-cyan-500"
              />
            </div>

            {/* 4. EXTERNAL APIS PERMISSION */}
            <div className="flex justify-between items-center bg-slate-900/20 border border-slate-900/60 p-2.5 rounded-lg">
              <div>
                <span className="font-bold text-white block">External APIs Link</span>
                <span className="text-[9px] text-slate-500 leading-none">Allows transmission to external providers.</span>
              </div>
              <input
                type="checkbox"
                checked={permissions.externalApis}
                onChange={() => handleTogglePermission('externalApis')}
                className="w-4 h-4 cursor-pointer accent-cyan-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRMATION WARNING MODALS */}
      {showConfirmModal && (
        <div className="absolute inset-0 bg-slate-950/95 flex flex-col justify-center p-5 z-20 animate-fadeIn">
          <LucideIcon name="AlertTriangle" className="text-amber-500 animate-bounce mb-3 mx-auto" size={24} />
          <h3 className="text-center font-mono font-bold text-white text-xs uppercase tracking-wider">
            Critical Security Check
          </h3>
          
          <p className="text-center text-[10px] text-slate-400 mt-2 leading-relaxed">
            {showConfirmModal === 'webSearch' && 'Web Search Grounding will send query parameters to search engines to retrieve live data. This requires active network transmissions. Do you approve?'}
            {showConfirmModal === 'externalApis' && 'External APIs Link allows transmission of your structured quest configurations to OpenAI, Anthropic, or Local server endpoints. Do you approve?'}
            {showConfirmModal === 'personalData' && 'Personal Data Access allows sharing your active quest lists, daily streak, fitness counters, and study books with the AI Core to customize advice. Do you approve?'}
          </p>

          <div className="flex gap-2 justify-center mt-5">
            <button
              onClick={() => setShowConfirmModal(null)}
              className="px-3 py-1.5 border border-slate-800 text-slate-400 hover:text-white rounded text-[10px] cursor-pointer"
            >
              Deny
            </button>
            <button
              onClick={() => confirmToggle(showConfirmModal)}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[10px] font-bold cursor-pointer"
            >
              Approve Permission
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
