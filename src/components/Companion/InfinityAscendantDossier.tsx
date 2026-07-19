/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppState } from '../../types';
import { LucideIcon } from '../LucideIcon';
import { sfx } from '../../utils/audio';
import ref1 from '../../../assets/infinity_ascendant_ref1.jpg';
import ref2 from '../../../assets/infinity_ascendant_ref2.jpg';

interface InfinityAscendantDossierProps {
  state: AppState;
  onSetOverrideEmotion?: (emotion: string) => void;
}

export const InfinityAscendantDossier: React.FC<InfinityAscendantDossierProps> = ({
  state,
  onSetOverrideEmotion,
}) => {
  const currentLevel = state.player.level;

  const [dossierTab, setDossierTab] = useState<'gallery' | 'expressions' | 'poses' | 'evolution'>('gallery');
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [activeRefImage, setActiveRefImage] = useState<1 | 2>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dossierEmotion, setDossierEmotion] = useState('Neutral');

  const EMOTIONS_LIST = [
    { name: 'Neutral', col: 0, row: 0, quote: "Welcome back. Another chapter awaits in your legendary quest." },
    { name: 'Happy', col: 1, row: 0, quote: "Every step you take shapes your legend." },
    { name: 'Smiling', col: 2, row: 0, quote: "Progress is built one day at a time, dear Friend." },
    { name: 'Laughing', col: 3, row: 0, quote: "Haha! Even the most ancient spirits enjoy a lighthearted stride!" },
    { name: 'Proud', col: 4, row: 0, quote: "The journey itself is your greatest achievement. I am honored to stand beside you." },
    { name: 'Thinking', col: 5, row: 0, quote: "Musing on the optimal sequence of your next training regimens..." },
    { name: 'Concerned', col: 0, row: 1, quote: "A brief storm has crossed your path? Consistency is not perfection, but the will to return." },
    { name: 'Surprised', col: 1, row: 1, quote: "Oh! A sudden surge in focus coordinates!" },
    { name: 'Determined', col: 2, row: 1, quote: "Inhale focus, eliminate distractions. We conquer!" },
    { name: 'Peaceful', col: 3, row: 1, quote: "Quiet the mind, and the solutions to the most complex equations will crystallize." },
    { name: 'Sad', col: 4, row: 1, quote: "No strike is too small to be recorded in the scroll. Keep your heart light." },
    { name: 'Winking', col: 5, row: 1, quote: "A secret technique of the stars? Let's take action first!" },
    { name: 'Encouraging', col: 0, row: 2, quote: "Your commitment is a beacon of light in the tavern of life." },
    { name: 'Shocked', col: 1, row: 2, quote: "Unbelievable multiplier! Procrastination has been vaporized!" },
    { name: 'Blushing', col: 2, row: 2, quote: "Your discipline is a fine compliment to these astral robes..." },
    { name: 'Confident', col: 3, row: 2, quote: "Our eyes are locked on the master campaign." },
    { name: 'Meditating', col: 4, row: 2, quote: "Let the Emerald and Violet energies circulate peacefully." },
    { name: 'Sleeping', col: 5, row: 2, quote: "Zzz... the stardust settles... even sentinels dream of infinite worlds..." }
  ];

  const POSES_LIST = [
    { name: 'Front Turnaround', desc: 'Symmetrical armor plates and wisdom gem cores designed for stability.', x: 40, y: 320, w: 150, h: 240, img: ref1 },
    { name: 'Side Turnaround', desc: 'Wing attachment sockets and shoulder shield layout detailed.', x: 190, y: 320, w: 150, h: 240, img: ref1 },
    { name: 'Back Turnaround', desc: 'Starlight nodes running along the spine plate configuration.', x: 340, y: 320, w: 150, h: 240, img: ref1 },
    { name: 'Casting Magic', desc: 'Deploying the Emerald Shield ward to block distracting thoughtwaves.', x: 840, y: 325, w: 170, h: 230, img: ref1 },
    { name: 'Meditating Form', desc: 'Floating weightlessly in absolute zero-gravity with legs folded.', x: 680, y: 325, w: 150, h: 230, img: ref1 },
    { name: 'Active Ascent', desc: 'Powering celestial wings and preparing stardust acceleration.', x: 500, y: 325, w: 170, h: 230, img: ref1 }
  ];

  const EVOLUTION_STAGES = [
    { stage: 1, title: 'The Seeker', lvl: 1, desc: 'A basic novice form wrapping the guardian in cobalt-lined cloaks.', x: 800, y: 330, w: 112, h: 175, img: ref1 },
    { stage: 2, title: 'The Astral Vanguard', lvl: 10, desc: 'Polished copper pauldrons unlocked, starlight aura glows at shoulders.', x: 912, y: 330, w: 112, h: 175, img: ref1 },
    { stage: 3, title: 'The Celestial Scholar', lvl: 20, desc: 'Wings form completely. Floating emerald magic circles hover under feet.', x: 800, y: 505, w: 112, h: 175, img: ref1 },
    { stage: 4, title: 'The Seraph of Will', lvl: 35, desc: 'Cosmic runes orbital rotation. Double wings span with violet cores.', x: 912, y: 505, w: 112, h: 175, img: ref1 },
    { stage: 5, title: 'Sovereign of Infinity', lvl: 50, desc: 'Peak cosmic focus potential. Wrapped in stardust vortexes.', x: 450, y: 100, w: 500, h: 550, img: ref2 }
  ];

  const [selectedPreviewPose, setSelectedPreviewPose] = useState<any>(POSES_LIST[0]);
  const [selectedPreviewStage, setSelectedPreviewStage] = useState<number>(0);

  const activeEmotionObj = EMOTIONS_LIST.find(e => e.name === dossierEmotion) || EMOTIONS_LIST[0];

  const handlePanMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handlePanMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  };

  const handlePanMouseUp = () => {
    setIsPanning(false);
  };

  const handleZoomIn = () => setZoomScale(prev => Math.min(3, prev + 0.25));
  const handleZoomOut = () => setZoomScale(prev => Math.max(1, prev - 0.25));
  const handleZoomReset = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const activeStageObj = EVOLUTION_STAGES[selectedPreviewStage];
  const isUnlockedStage = currentLevel >= activeStageObj.lvl;

  return (
    <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-6 backdrop-blur-md relative overflow-hidden select-none font-sans">
      
      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-6">
          <div className="w-full flex justify-between items-center border-b border-slate-900 pb-4">
            <span className="text-sm font-mono text-cyan-400">OFFICIAL DESIGN BIBLE: SHEET {activeRefImage}</span>
            <button 
              onClick={() => setIsFullscreen(false)} 
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition-colors cursor-pointer"
            >
              <LucideIcon name="Minimize2" size={16} />
            </button>
          </div>
          
          <div 
            className="flex-1 w-full overflow-hidden relative flex items-center justify-center cursor-grab active:cursor-grabbing"
            onMouseDown={handlePanMouseDown}
            onMouseMove={handlePanMouseMove}
            onMouseUp={handlePanMouseUp}
            onMouseLeave={handlePanMouseUp}
          >
            <img 
              src={activeRefImage === 1 ? ref1 : ref2}
              alt="Fullscreen Design Reference"
              className="max-h-full max-w-full object-contain pointer-events-none select-none transition-transform duration-75"
              style={{
                transform: `scale(${zoomScale}) translate(${panOffset.x / zoomScale}px, ${panOffset.y / zoomScale}px)`
              }}
            />
          </div>

          <div className="flex gap-4 items-center bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 mt-4">
            <button onClick={() => { sfx.playCoin(); setActiveRefImage(activeRefImage === 1 ? 2 : 1); }} className="p-1 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs transition-colors cursor-pointer font-bold">
              Swap Sheet
            </button>
            <div className="h-4 w-[1px] bg-slate-800"></div>
            <button onClick={handleZoomIn} className="p-1.5 hover:bg-slate-800 text-slate-300 rounded"><LucideIcon name="ZoomIn" size={14} /></button>
            <button onClick={handleZoomOut} className="p-1.5 hover:bg-slate-800 text-slate-300 rounded"><LucideIcon name="ZoomOut" size={14} /></button>
            <button onClick={handleZoomReset} className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 hover:text-white px-2">Reset</button>
          </div>
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-500/35 to-transparent"></div>

      {/* Dossier Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-sm font-bold text-cyan-400 flex items-center gap-2 font-mono">
            <LucideIcon name="Crown" size={14} className="text-cyan-400 animate-pulse" />
            LEGENDARY CELESTIAL DOSSIER: INFINITY ASCENDANT
          </h2>
          <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-widest font-mono">Official Design Roster Database Layer</p>
        </div>
        
        {/* Navigation tabs */}
        <div className="flex bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs leading-none shrink-0 overflow-x-auto max-w-full">
          {[
            { id: 'gallery', label: 'Art Gallery', icon: 'Image' },
            { id: 'expressions', label: 'Expressions', icon: 'Smile' },
            { id: 'poses', label: 'Poses Index', icon: 'Compass' },
            { id: 'evolution', label: 'Evolution Paths', icon: 'Layers' }
          ].map((tabObj) => (
            <button
              key={tabObj.id}
              type="button"
              onClick={() => {
                sfx.playCoin();
                setDossierTab(tabObj.id as any);
                handleZoomReset();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer text-[10px] font-mono uppercase tracking-wider ${dossierTab === tabObj.id ? 'bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold' : 'text-slate-400 hover:text-white border border-transparent'}`}
            >
              <LucideIcon name={tabObj.icon} size={11} />
              {tabObj.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[310px]">
        
        {/* LEFT COLUMN: VIEWPORT PREVIEW */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
          
          {dossierTab === 'gallery' && (
            <div className="flex-1 flex flex-col justify-between h-full">
              <div 
                className="flex-1 w-full bg-slate-950 rounded-lg overflow-hidden border border-slate-800 relative flex items-center justify-center cursor-grab active:cursor-grabbing group min-h-[220px]"
                onMouseDown={handlePanMouseDown}
                onMouseMove={handlePanMouseMove}
                onMouseUp={handlePanMouseUp}
                onMouseLeave={handlePanMouseUp}
              >
                <img 
                  src={activeRefImage === 1 ? ref1 : ref2}
                  alt="Design reference sheet"
                  className="max-h-[200px] object-contain pointer-events-none transition-transform duration-75"
                  style={{
                    transform: `scale(${zoomScale}) translate(${panOffset.x / zoomScale}px, ${panOffset.y / zoomScale}px)`
                  }}
                />
                
                <div className="absolute top-2 right-2 bg-slate-950/80 border border-slate-800 rounded px-1.5 py-0.5 text-[8px] text-slate-400 font-mono shadow">
                  Sheet {activeRefImage}/2
                </div>
                
                {/* Horizontal Carousels Controls Overlay */}
                <button 
                  onClick={() => { sfx.playCoin(); setActiveRefImage(activeRefImage === 1 ? 2 : 1); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-slate-950 hover:bg-slate-900 hover:text-white text-slate-400 border border-slate-800 rounded-full transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
                >
                  <LucideIcon name="ChevronLeft" size={14} />
                </button>
                <button 
                  onClick={() => { sfx.playCoin(); setActiveRefImage(activeRefImage === 1 ? 2 : 1); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-950 hover:bg-slate-900 hover:text-white text-slate-400 border border-slate-800 rounded-full transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
                >
                  <LucideIcon name="ChevronRight" size={14} />
                </button>
              </div>

              <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-800/60">
                <div className="flex gap-2">
                  <button onClick={() => { sfx.playCoin(); setActiveRefImage(activeRefImage === 1 ? 2 : 1); }} className="px-2.5 py-1 bg-cyan-950 border border-cyan-900 text-cyan-400 hover:text-cyan-300 rounded text-[10px] font-mono font-bold transition-all cursor-pointer">
                    Swap Sheet
                  </button>
                  <button onClick={() => setIsFullscreen(true)} className="p-1 px-2 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 rounded text-[10px] flex items-center gap-1 font-mono cursor-pointer transition-all">
                    <LucideIcon name="Maximize2" size={10} /> Fullscreen
                  </button>
                </div>
                <div className="flex gap-1 items-center">
                  <button onClick={handleZoomIn} className="p-1 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded cursor-pointer"><LucideIcon name="ZoomIn" size={11} /></button>
                  <button onClick={handleZoomOut} className="p-1 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded cursor-pointer"><LucideIcon name="ZoomOut" size={11} /></button>
                  <button onClick={handleZoomReset} className="text-[9px] font-mono text-slate-500 hover:text-white px-1.5">Reset</button>
                </div>
              </div>
            </div>
          )}

          {dossierTab === 'expressions' && (
            <div className="flex-1 flex flex-col justify-center items-center py-2 h-full">
              {/* Spinning frame ring */}
              <div className="relative w-36 h-36 rounded-full border border-dashed border-cyan-500/20 flex items-center justify-center animate-[spin_40s_linear_infinite] pointer-events-none">
                <div className="w-11/12 h-11/12 rounded-full border border-dotted border-emerald-500/20 animate-[spin_20s_linear_infinite_reverse]"></div>
              </div>

              <div 
                className="absolute w-28 h-28 rounded-full overflow-hidden border-4 border-slate-950 bg-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.25)] flex items-center justify-center animate-[breath_6s_ease-in-out_infinite]"
                style={{ borderColor: '#22d3ee' }}
              >
                <div 
                  className="w-full h-full transform scale-110"
                  style={{
                    backgroundImage: `url(${ref1})`,
                    backgroundSize: `${(1024 / 73) * 100}% ${(682 / 84) * 100}%`,
                    backgroundPosition: `${( (582 + activeEmotionObj.col * 73) / (1024 - 73) ) * 100}% ${( (22 + activeEmotionObj.row * 84) / (682 - 84) ) * 100}%`,
                    backgroundRepeat: 'no-repeat'
                  }}
                />
              </div>

              <div className="mt-4 bg-slate-900 border border-slate-800/80 rounded-lg p-2 px-3 text-center z-10 w-full max-w-[260px]">
                <span className="block text-[8px] font-mono text-cyan-400 uppercase tracking-widest font-bold">Mantra Broadcast Preview</span>
                <span className="text-[10px] text-slate-300 mt-1 block font-mono italic">"{activeEmotionObj.quote}"</span>
              </div>
            </div>
          )}

          {dossierTab === 'poses' && (
            <div className="flex-1 flex flex-col justify-center items-center py-2 relative h-full">
              <div className="w-32 h-44 rounded-xl border border-slate-805 bg-slate-955 overflow-hidden relative shadow-[0_0_15px_rgba(59,130,246,0.15)] flex items-center justify-center">
                <div 
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url(${selectedPreviewPose.img})`,
                    backgroundSize: `${(1024 / selectedPreviewPose.w) * 100}% ${(682 / selectedPreviewPose.h) * 100}%`,
                    backgroundPosition: `${(selectedPreviewPose.x / (1024 - selectedPreviewPose.w)) * 100}% ${(selectedPreviewPose.y / (682 - selectedPreviewPose.h)) * 100}%`,
                    backgroundRepeat: 'no-repeat'
                  }}
                />
              </div>
              <div className="mt-3 text-center">
                <div className="font-bold text-xs text-white uppercase font-mono">{selectedPreviewPose.name}</div>
                <div className="text-[10px] text-slate-400 italic max-w-[240px] leading-relaxed mt-1">{selectedPreviewPose.desc}</div>
              </div>
            </div>
          )}

          {dossierTab === 'evolution' && (
            <div className="flex-1 flex flex-col justify-center items-center py-2 h-full">
              <div className="w-32 h-48 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden relative shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center justify-center">
                <div 
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url(${activeStageObj.img})`,
                    backgroundSize: `${(1024 / activeStageObj.w) * 100}% ${(682 / activeStageObj.h) * 100}%`,
                    backgroundPosition: `${(activeStageObj.x / (1024 - activeStageObj.w)) * 100}% ${(activeStageObj.y / (682 - activeStageObj.h)) * 100}%`,
                    backgroundRepeat: 'no-repeat'
                  }}
                />
                {!isUnlockedStage && (
                  <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center">
                    <LucideIcon name="Lock" size={14} className="text-amber-500/80 mb-2 animate-bounce" />
                    <span className="text-[8px] font-mono text-amber-500 uppercase tracking-widest font-bold">Locked Form</span>
                    <span className="text-[9px] text-slate-400 mt-1 block">Requires Level {activeStageObj.lvl}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-3 text-center">
                <div className="font-bold text-xs text-white uppercase font-mono flex items-center gap-1.5 justify-center">
                  Stage {activeStageObj.stage}: {activeStageObj.title}
                  {isUnlockedStage && <span className="text-[8px] uppercase tracking-wider font-mono text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-900/60 font-bold">Unlocked</span>}
                </div>
                <div className="text-[10px] text-slate-400 italic max-w-[240px] leading-relaxed mt-1">{activeStageObj.desc}</div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: INTERACTIVE CONTROLS */}
        <div className="flex flex-col justify-between">
          
          {dossierTab === 'gallery' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2.5">
                <span className="block text-[8px] font-mono text-cyan-400 uppercase tracking-widest font-bold">Companion Core Biography</span>
                <p className="text-xs text-slate-350 leading-relaxed font-serif">
                  "Infinity Ascendant is a legendary starlight guardian representing discipline, hope, and personal evolution. His vestments and wing complexity grow automatically as you earn XP. He supports your actions and celebrates milestones as light echoes in the tavern."
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                  <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest">Outfit Design</span>
                  <span className="text-slate-200 block font-bold text-[10px] font-mono mt-1 uppercase">Sovereign Plate</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                  <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest">Aura Spectrum</span>
                  <span className="text-slate-200 block font-bold text-[10px] font-mono mt-1 uppercase">Emerald Violet Blend</span>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-850 p-3.5 rounded-xl text-xs space-y-1 bg-[radial-gradient(ellipse_at_bottom_left,rgba(34,211,238,0.03)_0%,transparent_60%)]">
                <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest">Design Sheets Info</span>
                <div className="text-[10px] text-slate-400 font-mono flex flex-col gap-1 mt-1.5 leading-relaxed">
                  <div>• Sheet 1: 18 Expressions, posing turnaround layouts, evolution levels 1-4.</div>
                  <div>• Sheet 2: Sleeping assets, magic effects details, base Sovereign ultimate form.</div>
                </div>
              </div>
            </div>
          )}

          {dossierTab === 'expressions' && (
            <div className="space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-3">Grid Playground: Click face to sync emotion live</span>
                <div className="grid grid-cols-6 gap-2">
                  {EMOTIONS_LIST.map((emo) => {
                    const isActive = emo.name === dossierEmotion;
                    const w = 73;
                    const h = 84;
                    const x = 582 + emo.col * 73;
                    const y = 22 + emo.row * 84;
                    
                    return (
                      <button
                        key={emo.name}
                        type="button"
                        onClick={() => {
                          setDossierEmotion(emo.name);
                          sfx.playSkillUnlock();
                          if (onSetOverrideEmotion) {
                            onSetOverrideEmotion(emo.name);
                          }
                        }}
                        className={`w-9 h-10 rounded border-2 overflow-hidden transition-all hover:scale-110 cursor-pointer relative flex items-center justify-center ${isActive ? 'border-cyan-400 bg-slate-950 scale-105 shadow-[0_0_8px_rgba(34,211,238,0.4)]' : 'border-slate-800 hover:border-slate-650 bg-slate-900/50'}`}
                        title={`Trigger: ${emo.name}`}
                      >
                        <div 
                          className="w-full h-full transform scale-110"
                          style={{
                            backgroundImage: `url(${ref1})`,
                            backgroundSize: `${(1024 / w) * 100}% ${(682 / h) * 100}%`,
                            backgroundPosition: `${(x / (1024 - w)) * 100}% ${(y / (682 - h)) * 100}%`,
                            backgroundRepeat: 'no-repeat'
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-cyan-950/20 border border-cyan-900/30 rounded-xl p-3.5 mt-4">
                <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">Live Expression Engine</span>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                  Select any emotion grid block. The floating HUD widget on your dashboard will immediately update to render that specific facial assets sheet.
                </p>
              </div>
            </div>
          )}

          {dossierTab === 'poses' && (
            <div className="space-y-2 overflow-y-auto max-h-[220px] scrollbar-none pr-1">
              {POSES_LIST.map((pose) => {
                const isActive = selectedPreviewPose?.name === pose.name;
                return (
                  <button
                    key={pose.name}
                    type="button"
                    onClick={() => {
                      sfx.playCoin();
                      setSelectedPreviewPose(pose);
                    }}
                    className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${isActive ? 'bg-blue-950/40 border-blue-500/50 text-white' : 'bg-slate-900/30 border-slate-800/40 text-slate-400 hover:bg-slate-900/70 hover:text-white'}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center shrink-0">
                        <div 
                          className="w-full h-full transform scale-110"
                          style={{
                            backgroundImage: `url(${pose.img})`,
                            backgroundSize: `${(1024 / pose.w) * 100}% ${(682 / pose.h) * 100}%`,
                            backgroundPosition: `${(pose.x / (1024 - pose.w)) * 100}% ${(pose.y / (682 - pose.h)) * 100}%`,
                            backgroundRepeat: 'no-repeat'
                          }}
                        />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold uppercase font-mono">{pose.name}</h4>
                        <p className="text-[9px] font-sans truncate max-w-[150px]">{pose.desc}</p>
                      </div>
                    </div>
                    <LucideIcon name="ChevronRight" size={12} className="text-slate-505" />
                  </button>
                );
              })}
            </div>
          )}

          {dossierTab === 'evolution' && (
            <div className="space-y-2 overflow-y-auto max-h-[220px] scrollbar-none pr-1">
              {EVOLUTION_STAGES.map((stg, idx) => {
                const isUnlockedCurrent = currentLevel >= stg.lvl;
                const isActive = selectedPreviewStage === idx;
                return (
                  <button
                    key={stg.stage}
                    type="button"
                    onClick={() => {
                      sfx.playCoin();
                      setSelectedPreviewStage(idx);
                    }}
                    className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${isActive ? 'bg-emerald-950/40 border-emerald-500/50 text-white' : 'bg-slate-900/30 border-slate-800/50 text-slate-400 hover:bg-slate-900/70 hover:text-white'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full border border-slate-800 flex items-center justify-center shrink-0 relative bg-slate-950">
                        <LucideIcon name={isUnlockedCurrent ? 'Shield' : 'Lock'} size={11} className={isUnlockedCurrent ? 'text-emerald-400' : 'text-slate-500'} />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold font-mono text-white flex items-center gap-1 leading-none">
                          Stage {stg.stage}: {stg.title}
                          <span className="text-[8px] text-slate-500 normal-case lowercase font-normal font-sans ml-1">({stg.lvl}+)</span>
                        </h4>
                        <p className="text-[9px] text-slate-500 font-sans mt-0.5 truncate max-w-[160px]">{stg.desc}</p>
                      </div>
                    </div>
                    <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest font-bold hover:text-cyan-400 shrink-0">Preview</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer DB status */}
          <div className="pt-4 border-t border-slate-900/60 mt-auto flex justify-between items-center text-[9px] text-slate-500 font-mono">
            <span>Roster DB active</span>
            <span>Right-click live widget to toggle mode</span>
          </div>

        </div>
      </div>
    </div>
  );
};
export default InfinityAscendantDossier;
