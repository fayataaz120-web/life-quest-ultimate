/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AppState, Companion } from '../types';
import { DEFAULT_COMPANIONS } from '../data/companions';
import { LucideIcon } from './LucideIcon';
import { sfx } from '../utils/audio';
import ref1 from '../../assets/infinity_ascendant_ref1.jpg';
import ref2 from '../../assets/infinity_ascendant_ref2.jpg';
import steampunk3D from '../../assets/steampunk_3d.png';
import infinity3D from '../../assets/infinity_3d.png';
import { Companion3DScene } from './Companion3DScene';
import { voice } from '../utils/voice';

interface CompanionLiveViewProps {
  state: AppState;
  onUpdateState: (state: AppState) => void;
  overrideEmotion?: string;
  customMessage?: string;
  onClearCustomMessage?: () => void;
}

export const CompanionLiveView: React.FC<CompanionLiveViewProps> = ({
  state,
  onUpdateState,
  overrideEmotion,
  customMessage,
  onClearCustomMessage
}) => {
  const companions = [...DEFAULT_COMPANIONS, ...(state.customCompanions || [])];
  const equippedId = state.equippedCompanionId ?? 'infinity-ascendant';
  const companion = companions.find(c => c.id === equippedId) || DEFAULT_COMPANIONS[0];
  
  const isHidden = state.hideCompanion ?? false;
  const size = state.companionSize ?? 'md';
  const posX = state.companionPositionX ?? 0;
  const posY = state.companionPositionY ?? 0;
  const renderingMode = state.companionRenderingMode || 
    (equippedId === 'infinity-ascendant' 
      ? '3d' 
      : equippedId === 'steampunk-sentinel' 
        ? '3d' 
        : 'vector');

  const level = state.player?.level || 1;
  const stageInfo = (() => {
    if (level < 10) {
      return {
        stage: 1,
        title: "The Seeker",
        desc: "A humble focus apprentice in basic garments, absorbing the initial sparks of consistency.",
        auraIntensity: "low",
        hasWings: false,
        hasFloatingAccessories: false,
        hasAdvancedVfx: false
      };
    } else if (level < 20) {
      return {
        stage: 2,
        title: "The Astral Vanguard",
        desc: "A dedicated guardian wearing polished copper pauldrons, backed by simple swirling mana vectors.",
        auraIntensity: "medium",
        hasWings: true,
        hasFloatingAccessories: false,
        hasAdvancedVfx: false
      };
    } else if (level < 30) {
      return {
        stage: 3,
        title: "The Celestial Scholar",
        desc: "A wise focused guide holding floating crystal shards and glowing wing feathers.",
        auraIntensity: "high",
        hasWings: true,
        hasFloatingAccessories: true,
        hasAdvancedVfx: true
      };
    } else if (level < 40) {
      return {
        stage: 4,
        title: "The Seraph of Will",
        desc: "An advanced cosmic protector backed by rotating runic equations and a floating tome of wisdom.",
        auraIntensity: "intense",
        hasWings: true,
        hasFloatingAccessories: true,
        hasAdvancedVfx: true
      };
    } else {
      return {
        stage: 5,
        title: "The Sovereign of Infinity",
        desc: "A legendary cosmic sovereign at the peak of absolute focus, wrapped in cascading galaxy vortexes.",
        auraIntensity: "supreme",
        hasWings: true,
        hasFloatingAccessories: true,
        hasAdvancedVfx: true
      };
    }
  })();

  const [emotion, setEmotion] = useState<string>('Greeting');
  const [bubbleText, setBubbleText] = useState<string>('');
  const [bubbleVisible, setBubbleVisible] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [specialAnim, setSpecialAnim] = useState<string | null>(null);
  const [isIdle, setIsIdle] = useState(false);
  const [idleTick, setIdleTick] = useState(0);
  const [summoning, setSummoning] = useState(false);
  const [summonName, setSummonName] = useState('');
  
  const [questCompleteParticles, setQuestCompleteParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isInitialGreeting, setIsInitialGreeting] = useState(true);
  
  const widgetRef = useRef<HTMLDivElement>(null);
  const bubbleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevEquippedIdRef = useRef<string | null | undefined>(state.equippedCompanionId);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Mouse tracking state for looking at cursor
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [widgetCenter, setWidgetCenter] = useState({ x: 0, y: 0 });

  // Initialize companion location on mount if not set
  useEffect(() => {
    const widgetWidth = widgetRef.current?.offsetWidth || 240;
    const widgetHeight = widgetRef.current?.offsetHeight || 240;
    if (state.companionPositionX === undefined || state.companionPositionY === undefined) {
      onUpdateState({
        ...state,
        companionPositionX: window.innerWidth - widgetWidth - 24,
        companionPositionY: window.innerHeight - widgetHeight - 24,
        companionPositionMode: state.companionPositionMode || 'Bottom',
        companionScale: state.companionScale || 1.0
      });
    }
  }, []);

  // Global mouse move tracker for look-at cursor tracking
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  // Sync widget center coordinates for cursor looking
  const updateWidgetCenter = () => {
    const rect = widgetRef.current?.getBoundingClientRect();
    if (rect) {
      setWidgetCenter({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
    }
  };

  useEffect(() => {
    updateWidgetCenter();
    const interval = setInterval(updateWidgetCenter, 1000);
    return () => clearInterval(interval);
  }, [state.companionPositionX, state.companionPositionY, state.companionPositionMode]);

  // Compute eye cursor tracking offset
  const getEyeTrackOffset = () => {
    if (!widgetCenter.x || !widgetCenter.y) return { x: 0, y: 0 };
    const dx = mousePos.x - widgetCenter.x;
    const dy = mousePos.y - widgetCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 15) return { x: 0, y: 0 };
    const maxOffset = 2.5;
    const ratio = Math.min(maxOffset, (distance / 250) * maxOffset);
    return {
      x: (dx / distance) * ratio,
      y: (dy / distance) * ratio
    };
  };

  const eyeOffset = getEyeTrackOffset();

  // Auto detect emotion based on recent state metrics or events
  useEffect(() => {
    if (overrideEmotion) {
      setIsInitialGreeting(false);
      setEmotion(overrideEmotion);
      triggerDialogueForEmotion(overrideEmotion);
      return;
    }

    if (isInitialGreeting) {
      return; // Do not override the welcome back or return from absence greeting
    }

    const recentActivities = state.activities || [];
    const completedRecently = recentActivities.some(a => a.completedTimes > 0);
    const hasActiveStreak = (state.player?.currentStreak ?? 0) > 3;
    const lowCompleted = recentActivities.every(a => a.completedTimes === 0);

    let nextEmotion = 'Happy';
    if (lowCompleted) {
      nextEmotion = 'Concerned';
    } else if (hasActiveStreak) {
      nextEmotion = 'Proud';
    } else if (completedRecently) {
      nextEmotion = 'Excited';
    }

    setEmotion(nextEmotion);
    triggerDialogueForEmotion(nextEmotion);
  }, [overrideEmotion, state.player?.level, state.player?.currentStreak, equippedId, isInitialGreeting]);

  // Initial welcome back or absence duration check greeting
  const didGreetRef = useRef(false);
  useEffect(() => {
    // Only greet once per session/equip
    didGreetRef.current = false;
  }, [equippedId]);

  useEffect(() => {
    if (didGreetRef.current) return;
    didGreetRef.current = true;
    setIsInitialGreeting(true);

    const lastActive = state.lastActiveDate;
    const todayStr = new Date().toISOString().split('T')[0];
    
    let daysDiff = 0;
    if (lastActive) {
      const lastDateObj = new Date(lastActive);
      const todayDateObj = new Date(todayStr);
      const msDiff = todayDateObj.getTime() - lastDateObj.getTime();
      daysDiff = Math.floor(msDiff / (1000 * 60 * 60 * 24));
    }

    setTimeout(() => {
      setEmotion('Greeting');
      if (daysDiff >= 2) {
        // Returned after long absence!
        const absenceQuotes = companion.quotes.Absence || companion.quotes.Greeting || ["Welcome back, traveler."];
        const randomQuote = absenceQuotes[Math.floor(Math.random() * absenceQuotes.length)];
        setBubbleText(randomQuote);
        sfx.playQuestComplete();
      } else {
        // Welcome back greeting
        const greetingQuotes = companion.quotes.Greeting || ["Welcome back, Hero."];
        const randomQuote = greetingQuotes[Math.floor(Math.random() * greetingQuotes.length)];
        setBubbleText(randomQuote);
        sfx.playLevelUp();
      }
      setBubbleVisible(true);

      // Dismiss greeting phase after 6 seconds to resume idle tracking
      setTimeout(() => {
        setIsInitialGreeting(false);
      }, 6000);
    }, 1000);
  }, [equippedId]);

  // Handle custom messages passed from parent
  useEffect(() => {
    if (customMessage) {
      setIsInitialGreeting(false);
      setBubbleText(customMessage);
      setBubbleVisible(true);
      sfx.playQuestComplete();
      
      // Trigger golden particle burst on task completion or level up
      if (customMessage.includes('Cleared task') || customMessage.includes('CONGRATULATIONS') || customMessage.includes('ascended')) {
        const particlesList: { id: number; x: number; y: number }[] = [];
        for (let i = 0; i < 24; i++) {
          particlesList.push({
            id: Math.random() + i,
            x: 10 + Math.random() * 80,
            y: 60 + Math.random() * 25
          });
        }
        setQuestCompleteParticles(particlesList);
        
        // Custom pride emotion trigger
        setEmotion('Proud');

        setTimeout(() => {
          setQuestCompleteParticles([]);
        }, 3000);
      }

      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
      bubbleTimerRef.current = setTimeout(() => {
        setBubbleVisible(false);
        if (onClearCustomMessage) onClearCustomMessage();
      }, 7000);
    }
  }, [customMessage]);

  // Voice Synthesis Trigger on bubble text updates
  useEffect(() => {
    if (bubbleVisible && bubbleText && equippedId === 'infinity-ascendant') {
      voice.speak(bubbleText);
    } else {
      voice.stop();
    }
  }, [bubbleText, bubbleVisible, equippedId]);

  // Make sure we stop voice on unmount
  useEffect(() => {
    return () => {
      voice.stop();
    };
  }, []);

  const triggerDialogueForEmotion = (emo: string) => {
    const quotes = companion.quotes[emo] || companion.quotes['Happy'] || ["Keep focused on your path!"];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setBubbleText(randomQuote);
    setBubbleVisible(true);

    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = setTimeout(() => {
      setBubbleVisible(false);
    }, 6000);
  };

  const handleCompanionClick = (e: React.MouseEvent) => {
    if (e.detail === 2) return;
    setIsInitialGreeting(false);
    sfx.playSkillUnlock();
    const emotions = Object.keys(companion.quotes).filter(k => k !== 'Absence');
    const randomEmo = emotions[Math.floor(Math.random() * emotions.length)];
    setEmotion(randomEmo);
    triggerDialogueForEmotion(randomEmo);
  };

  // Double Click Special Animation Handler
  const handleDoubleClick = () => {
    setIsInitialGreeting(false);
    sfx.playLevelUp();
    const anims = ['spin-once', 'bounce-intense', 'heartbeat-giant'];
    const randomAnim = anims[Math.floor(Math.random() * anims.length)];
    setSpecialAnim(randomAnim);
    setEmotion('Excited');
    setBubbleText("Incredible flow! Let's elevate our focus coordinates to absolute legend status!");
    setBubbleVisible(true);
    
    setTimeout(() => {
      setSpecialAnim(null);
    }, 2000);
  };

  // Right Click Menu Handler
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
    sfx.playCoin();
  };

  useEffect(() => {
    const closeMenu = () => setMenuOpen(false);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  // Long Press Timer
  const handleMouseDownPress = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return;
    if (e.button !== 0) return;
    
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    pressTimerRef.current = setTimeout(() => {
      setShowProfileModal(true);
      sfx.playLevelUp();
    }, 600);
  };

  const handleMouseUpPress = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  // Wheel Scroll Zoom Handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const scaleDelta = e.deltaY < 0 ? 0.05 : -0.05;
    const currentScale = state.companionScale ?? 1.0;
    const nextScale = Math.max(0.6, Math.min(2.5, currentScale + scaleDelta));
    onUpdateState({
      ...state,
      companionScale: parseFloat(nextScale.toFixed(2))
    });
  };

  // Idle state watcher
  const resetIdleTimer = () => {
    setIsIdle(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
      setEmotion('Meditating');
      setBubbleText("Gentle celestial stillness... The mind settles into deep focus orbits...");
      setBubbleVisible(true);
    }, 120000);
  };

  useEffect(() => {
    resetIdleTimer();
    const events = ['mousemove', 'mousedown', 'keydown', 'click', 'scroll'];
    events.forEach(evt => window.addEventListener(evt, resetIdleTimer));
    return () => {
      events.forEach(evt => window.removeEventListener(evt, resetIdleTimer));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isIdle) {
      setIdleTick(0);
      return;
    }
    const interval = setInterval(() => {
      setIdleTick(prev => prev + 0.05);
    }, 50);
    return () => clearInterval(interval);
  }, [isIdle]);

  const idleXOffset = isIdle ? Math.sin(idleTick) * 20 : 0;
  const idleYOffset = isIdle ? Math.cos(idleTick * 1.5) * 12 : 0;

  // Drag and Drop implementation
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return;
    if (e.button !== 0) return;
    
    setIsDragging(true);
    const rect = widgetRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    handleMouseDownPress(e);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
        pressTimerRef.current = null;
      }
      
      if (!isDragging) return;
      
      let newX = e.clientX - dragOffset.x;
      let newY = e.clientY - dragOffset.y;
      
      const widgetWidth = widgetRef.current?.offsetWidth || 240;
      const widgetHeight = widgetRef.current?.offsetHeight || 240;
      
      newX = Math.max(10, Math.min(window.innerWidth - widgetWidth - 10, newX));
      newY = Math.max(10, Math.min(window.innerHeight - widgetHeight - 10, newY));
      
      onUpdateState({
        ...state,
        companionPositionX: newX,
        companionPositionY: newY,
        companionPositionMode: 'Floating'
      });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
      handleMouseUpPress();
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, state]);

  // Keyboard shortcut to show/hide
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        onUpdateState({
          ...state,
          hideCompanion: !state.hideCompanion
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state]);

  // Active Companion Swap Summon Animation trigger
  useEffect(() => {
    const currentId = state.equippedCompanionId;
    if (currentId && currentId !== prevEquippedIdRef.current) {
      const comp = companions.find(c => c.id === currentId) || DEFAULT_COMPANIONS[0];
      setSummonName(comp.name);
      setSummoning(true);
      
      const origX = state.companionPositionX;
      const origY = state.companionPositionY;
      const origMode = state.companionPositionMode;
      const origScale = state.companionScale || 1.0;
      
      const widgetWidth = widgetRef.current?.offsetWidth || 240;
      const widgetHeight = widgetRef.current?.offsetHeight || 240;
      
      const centerX = window.innerWidth / 2 - widgetWidth / 2;
      const centerY = window.innerHeight / 2 - widgetHeight / 2;
      
      onUpdateState({
        ...state,
        equippedCompanionId: currentId,
        companionPositionX: centerX,
        companionPositionY: centerY,
        companionPositionMode: 'Floating',
        companionScale: 1.6
      });
      
      sfx.playLevelUp();
      setEmotion('Greeting');
      setBubbleText(comp.greeting || "Ready to align focus!");
      setBubbleVisible(true);
      
      setTimeout(() => {
        setSummoning(false);
        onUpdateState({
          ...state,
          companionPositionX: origX ?? (window.innerWidth - widgetWidth - 24),
          companionPositionY: origY ?? (window.innerHeight - widgetHeight - 24),
          companionPositionMode: origMode || 'Bottom',
          companionScale: origScale
        });
      }, 3500);
    }
    prevEquippedIdRef.current = currentId;
  }, [state.equippedCompanionId]);

  // Smart Obstacle Avoidance logic
  const checkAndResolveOverlaps = () => {
    if (isDragging || summoning) return;
    const widget = widgetRef.current;
    if (!widget) return;
    
    const widgetRect = widget.getBoundingClientRect();
    const overlapElements = document.querySelectorAll('.dashboard-card, .sidebar, .widget, .stats-panel, .panel');
    
    let isOverlapping = false;
    let overlapRect: DOMRect | null = null;
    
    for (let i = 0; i < overlapElements.length; i++) {
      const el = overlapElements[i] as HTMLElement;
      const rect = el.getBoundingClientRect();
      const isIntersecting = !(
        widgetRect.right < rect.left ||
        widgetRect.left > rect.right ||
        widgetRect.bottom < rect.top ||
        widgetRect.top > rect.bottom
      );
      
      const isVisible = rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).display !== 'none';
      
      if (isIntersecting && isVisible) {
        isOverlapping = true;
        overlapRect = rect;
        break;
      }
    }
    
    if (isOverlapping && overlapRect) {
      const widgetWidth = widgetRect.width;
      const widgetHeight = widgetRect.height;
      
      let targetX = state.companionPositionX ?? (window.innerWidth - widgetWidth - 24);
      let targetY = state.companionPositionY ?? (window.innerHeight - widgetHeight - 24);
      
      if (overlapRect.left > widgetWidth + 40) {
        targetX = overlapRect.left - widgetWidth - 20;
      } else if (overlapRect.top > widgetHeight + 40) {
        targetY = overlapRect.top - widgetHeight - 20;
      } else {
        targetX = 24;
        targetY = window.innerHeight - widgetHeight - 24;
      }
      
      targetX = Math.max(10, Math.min(window.innerWidth - widgetWidth - 10, targetX));
      targetY = Math.max(10, Math.min(window.innerHeight - widgetHeight - 10, targetY));
      
      onUpdateState({
        ...state,
        companionPositionX: targetX,
        companionPositionY: targetY,
        companionPositionMode: 'Auto'
      });
      sfx.playSkillUnlock();
    }
  };

  useEffect(() => {
    const timer = setTimeout(checkAndResolveOverlaps, 600);
    return () => clearTimeout(timer);
  }, [state.companionPositionMode, window.innerWidth]);

  // Handle Preset Position modes sync
  useEffect(() => {
    const mode = state.companionPositionMode || 'Bottom';
    if (mode === 'Floating') return;
    
    const widgetWidth = widgetRef.current?.offsetWidth || 240;
    const widgetHeight = widgetRef.current?.offsetHeight || 240;
    
    let targetX = window.innerWidth - widgetWidth - 24;
    let targetY = window.innerHeight - widgetHeight - 24;
    
    if (mode === 'Left') {
      targetX = 24;
      targetY = window.innerHeight - widgetHeight - 24;
    } else if (mode === 'Right') {
      targetX = window.innerWidth - widgetWidth - 24;
      targetY = 150;
    } else if (mode === 'Bottom') {
      targetX = window.innerWidth - widgetWidth - 24;
      targetY = window.innerHeight - widgetHeight - 24;
    } else if (mode === 'Auto') {
      if (window.innerWidth < 768) {
        targetX = window.innerWidth - widgetWidth - 12;
        targetY = window.innerHeight - widgetHeight - 12;
      } else {
        targetX = 24;
        targetY = window.innerHeight - widgetHeight - 24;
      }
    }
    
    targetX = Math.max(10, Math.min(window.innerWidth - widgetWidth - 10, targetX));
    targetY = Math.max(10, Math.min(window.innerHeight - widgetHeight - 10, targetY));
    
    if (targetX !== state.companionPositionX || targetY !== state.companionPositionY) {
      onUpdateState({
        ...state,
        companionPositionX: targetX,
        companionPositionY: targetY
      });
    }
  }, [state.companionPositionMode, window.innerWidth, window.innerHeight]);

  // Window Resize Clamping listener
  useEffect(() => {
    const handleResizeClamp = () => {
      const widgetWidth = widgetRef.current?.offsetWidth || 240;
      const widgetHeight = widgetRef.current?.offsetHeight || 240;
      
      const currentX = state.companionPositionX ?? (window.innerWidth - widgetWidth - 24);
      const currentY = state.companionPositionY ?? (window.innerHeight - widgetHeight - 24);
      
      const clampedX = Math.max(10, Math.min(window.innerWidth - widgetWidth - 10, currentX));
      const clampedY = Math.max(10, Math.min(window.innerHeight - widgetHeight - 10, currentY));
      
      if (clampedX !== state.companionPositionX || clampedY !== state.companionPositionY) {
        onUpdateState({
          ...state,
          companionPositionX: clampedX,
          companionPositionY: clampedY
        });
      }
    };
    window.addEventListener('resize', handleResizeClamp);
    return () => window.removeEventListener('resize', handleResizeClamp);
  }, [state.companionPositionX, state.companionPositionY]);

  if (isHidden) {
    return (
      <button
        onClick={() => onUpdateState({ ...state, hideCompanion: false })}
        className="fixed bottom-4 right-4 z-50 p-3 bg-slate-900/95 border border-blue-500/40 text-blue-400 hover:text-white rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105 transition-all flex items-center gap-2 text-xs font-mono no-drag cursor-pointer"
        title="Summon Guardian (Ctrl + H)"
      >
        <LucideIcon name="Sparkles" className="animate-spin" size={14} />
        <span>Summon Guardian</span>
      </button>
    );
  }

  // Handle sizes helper classes
  const sizeClasses = {
    sm: "w-48 h-48",
    md: "w-64 h-64",
    lg: "w-80 h-80"
  };

  const textSizes = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm"
  };

  // Render original vector outlines for companion appearance based on id
  const renderCompanionVFX = () => {
    // Stage 1 (Seeker) has minimal VFX
    if (stageInfo.stage === 1) {
      return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Simple Seeker Aura */}
          <div className="absolute w-28 h-28 rounded-full bg-gradient-to-tr from-blue-500/5 via-indigo-500/2 to-transparent blur-xl animate-pulse"></div>
          {/* Minimal single floating spark */}
          <div className="absolute bottom-16 right-16 w-1 h-1 rounded-full bg-cyan-400/30 blur-[1px] animate-pulse"></div>
        </div>
      );
    }

    switch (equippedId) {
      case 'infinity-ascendant':
        return (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Spinning Golden Outer Magic Circle */}
            {stageInfo.stage >= 3 && (
              <div className="absolute w-4/5 h-4/5 border border-dashed border-amber-500/20 rounded-full animate-[spin_40s_linear_infinite]"></div>
            )}
            
            {/* Nested rotating rune circle */}
            {stageInfo.stage >= 4 && (
              <div className="absolute w-3/4 h-3/4 border border-indigo-500/10 rounded-full animate-[spin_20s_linear_infinite] flex items-center justify-center">
                <div className="w-11/12 h-11/12 border border-dotted border-purple-500/20 rounded-full animate-[spin_10s_linear_infinite_reverse]"></div>
              </div>
            )}
            
            {/* Pulsing Aura radial gradient */}
            <div 
              className="absolute rounded-full bg-gradient-to-tr from-emerald-500/15 via-violet-500/10 to-transparent blur-2xl animate-pulse"
              style={{
                width: stageInfo.stage === 2 ? '120px' : stageInfo.stage === 3 ? '150px' : '180px',
                height: stageInfo.stage === 2 ? '120px' : stageInfo.stage === 3 ? '150px' : '180px',
              }}
            ></div>

            {/* Glowing floating runes / celestial dust */}
            <div className="absolute top-8 left-12 w-2 h-2 rounded-full bg-emerald-400 blur-[1.5px] animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            {stageInfo.stage >= 3 && (
              <>
                <div className="absolute bottom-12 right-14 w-1.5 h-1.5 rounded-full bg-violet-400 blur-[1px] animate-pulse"></div>
                <div className="absolute top-1/2 right-6 w-2.5 h-2.5 rounded-full bg-amber-400 blur-[2px] animate-bounce" style={{ animationDelay: '0.8s' }}></div>
              </>
            )}
          </div>
        );
      case 'arcane-djinn':
        return (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Swirling Tempest Tornado Vortex at bottom */}
            <div className="absolute bottom-4 w-1/3 h-6 bg-gradient-to-r from-sky-400/5 via-amber-400/10 to-sky-400/5 rounded-full blur-[2px] animate-[pulse_1.5s_infinite]"></div>
            {stageInfo.stage >= 3 && (
              <div className="absolute bottom-6 w-1/2 h-3 bg-sky-500/15 rounded-full blur-[3px] animate-[spin_5s_linear_infinite]"></div>
            )}
            {/* Lightning storm elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.04)_0%,transparent_70%)] animate-pulse"></div>
          </div>
        );
      case 'knowledge-keeper':
        return (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Gently Floating Candlelights */}
            <div className="absolute top-6 left-1/4 w-1.5 h-3 bg-amber-400 rounded-full blur-[1px] animate-bounce"></div>
            {stageInfo.stage >= 3 && (
              <div className="absolute top-10 right-1/4 w-1 h-2 bg-amber-300 rounded-full blur-[1px] animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            )}
            
            {/* Glowing magic runes surrounding sage */}
            <div className="absolute w-4/5 h-4/5 border border-emerald-500/5 rounded-full animate-pulse flex items-center justify-center">
              {stageInfo.stage >= 3 && (
                <div className="absolute w-5/6 h-5/6 border border-emerald-500/5 rounded-full animate-spin" style={{ animationDuration: '60s' }}></div>
              )}
            </div>
          </div>
        );
      default:
        return (
          <div className="absolute inset-0 bg-radial-gradient from-blue-500/5 to-transparent blur-xl animate-pulse"></div>
        );
    }
  };

  // Render Vector Companion Core
  const renderCompanionVector = () => {
    switch (equippedId) {
      case 'infinity-ascendant': {
        const getEmotionFeatures = (emo: string) => {
          const normalized = emo.toLowerCase();
          
          let leftEyebrow = "M 88 81 Q 93 79, 96 82";
          let rightEyebrow = "M 112 81 Q 107 79, 104 82";
          let leftEyePath = ""; 
          let rightEyePath = "";
          let isEyeClosed = false;
          let eyeScaleY = 1.0;
          let mouthPath = "M 96 93 Q 100 95, 104 93"; 
          let mouthFill = "none";
          let wingTransformLeft = "rotate(0)";
          let wingTransformRight = "rotate(0)";
          let auraColorLeft = "url(#emerald-glow-radial)";
          let auraColorRight = "url(#violet-glow-radial)";
          let magicIntensity = 0.5;
          let cheekBlush = 0.15;
          let eyeSparkleScale = 1.0;
          let isSleeping = false;
          let headTilt = "rotate(0)";
          
          if (normalized === 'happy' || normalized === 'celebrating' || normalized === 'laughing' || normalized === 'greeting') {
            leftEyebrow = "M 88 80 Q 93 76, 96 79"; 
            rightEyebrow = "M 112 80 Q 107 76, 104 79";
            mouthPath = "M 95 92 Q 100 100, 105 92 Z"; 
            mouthFill = "#fda4af"; 
            wingTransformLeft = "rotate(-12) translate(-3, -2)";
            wingTransformRight = "rotate(12) translate(3, -2)";
            auraColorLeft = "url(#gold-glow-radial)";
            auraColorRight = "url(#emerald-glow-radial)";
            magicIntensity = 0.95;
            cheekBlush = 0.35;
            eyeSparkleScale = 1.6;
            if (normalized === 'laughing' || normalized === 'happy' || normalized === 'greeting') {
              isEyeClosed = true;
              leftEyePath = "M 89 85 Q 93 81, 97 85"; 
              rightEyePath = "M 103 85 Q 107 81, 111 85";
            }
          } else if (normalized === 'proud' || normalized === 'confident') {
            leftEyebrow = "M 88 79 Q 93 78, 97 81"; 
            rightEyebrow = "M 112 79 Q 107 78, 103 81";
            mouthPath = "M 94 92 Q 100 97, 106 92"; 
            wingTransformLeft = "rotate(-16) translate(-6, -4)"; 
            wingTransformRight = "rotate(16) translate(6, -4)";
            auraColorLeft = "url(#emerald-glow-radial)";
            auraColorRight = "url(#emerald-gold-radial)";
            magicIntensity = 0.9;
            eyeSparkleScale = 1.5;
          } else if (normalized === 'thinking') {
            leftEyebrow = "M 88 80 Q 93 78, 96 82"; 
            rightEyebrow = "M 112 82 Q 107 81, 104 83"; 
            mouthPath = "M 96 93 Q 101 93, 104 94"; 
            wingTransformLeft = "rotate(4) translate(2, 1)";
            wingTransformRight = "rotate(-4) translate(-2, 1)";
            auraColorLeft = "url(#violet-glow-radial)";
            auraColorRight = "url(#blue-glow-radial)";
            magicIntensity = 0.6;
            headTilt = "rotate(-2)";
          } else if (normalized === 'concerned') {
            leftEyebrow = "M 89 82 Q 93 84, 96 81"; 
            rightEyebrow = "M 111 82 Q 107 84, 104 81";
            mouthPath = "M 97 94 Q 100 92, 103 94"; 
            wingTransformLeft = "rotate(8) translate(3, 4)"; 
            wingTransformRight = "rotate(-8) translate(-3, 4)";
            auraColorLeft = "url(#blue-glow-radial)";
            auraColorRight = "url(#violet-glow-radial)";
            magicIntensity = 0.3;
            cheekBlush = 0.1;
            headTilt = "rotate(1)";
          } else if (normalized === 'sleeping') {
            leftEyebrow = "M 88 83 Q 93 84, 96 84"; 
            rightEyebrow = "M 112 83 Q 107 84, 104 84";
            isEyeClosed = true;
            leftEyePath = "M 89 84 Q 93 87, 97 84"; 
            rightEyePath = "M 103 84 Q 107 87, 111 84";
            mouthPath = "M 98 94 Q 100 95, 102 94"; 
            wingTransformLeft = "rotate(14) translate(4, 6)"; 
            wingTransformRight = "rotate(-14) translate(-4, 6)";
            auraColorLeft = "url(#dark-violet-radial)";
            auraColorRight = "url(#dark-violet-radial)";
            magicIntensity = 0.15;
            cheekBlush = 0.08;
            isSleeping = true;
            headTilt = "rotate(2.5)";
          } else if (normalized === 'meditating' || normalized === 'peaceful') {
            leftEyebrow = "M 88 81 Q 93 81, 96 82"; 
            rightEyebrow = "M 112 81 Q 107 81, 104 82";
            isEyeClosed = true;
            leftEyePath = "M 89 84.5 Q 93 86.5, 97 84.5"; 
            rightEyePath = "M 103 84.5 Q 107 86.5, 111 84.5";
            mouthPath = "M 97 93 Q 100 94.5, 103 93"; 
            wingTransformLeft = "rotate(6) translate(2, 3)";
            wingTransformRight = "rotate(-6) translate(-2, 3)";
            auraColorLeft = "url(#emerald-violet-radial)";
            auraColorRight = "url(#emerald-violet-radial)";
            magicIntensity = 0.5;
            cheekBlush = 0.12;
          } else if (normalized === 'surprised') {
            leftEyebrow = "M 88 77 Q 93 75, 96 78"; 
            rightEyebrow = "M 112 77 Q 107 75, 104 78";
            mouthPath = "M 98 94 Q 100 97, 102 94 Z"; 
            mouthFill = "#ffffff";
            wingTransformLeft = "rotate(-18) translate(-4, -4)"; 
            wingTransformRight = "rotate(18) translate(4, -4)";
            auraColorLeft = "url(#gold-glow-radial)";
            auraColorRight = "url(#blue-glow-radial)";
            magicIntensity = 0.8;
            eyeScaleY = 1.35;
            headTilt = "rotate(-1.5)";
          } else if (normalized === 'respectful') {
            leftEyebrow = "M 88 82 Q 93 81, 96 83"; 
            rightEyebrow = "M 112 82 Q 107 81, 104 83";
            isEyeClosed = true;
            leftEyePath = "M 89 84.5 Q 93 86.5, 97 84.5"; 
            rightEyePath = "M 103 84.5 Q 107 86.5, 111 84.5";
            mouthPath = "M 97 93 Q 100 94.5, 103 93"; 
            wingTransformLeft = "rotate(4) translate(2, 2)";
            wingTransformRight = "rotate(-4) translate(-2, 2)";
            auraColorLeft = "url(#emerald-glow-radial)";
            auraColorRight = "url(#emerald-violet-radial)";
            magicIntensity = 0.4;
            headTilt = "rotate(3)"; 
          }
          
          return {
            leftEyebrow,
            rightEyebrow,
            leftEyePath,
            rightEyePath,
            isEyeClosed,
            eyeScaleY,
            mouthPath,
            mouthFill,
            wingTransformLeft,
            wingTransformRight,
            auraColorLeft,
            auraColorRight,
            magicIntensity,
            cheekBlush,
            eyeSparkleScale,
            isSleeping,
            headTilt
          };
        };

        const f = getEmotionFeatures(emotion);

        return (
          <svg viewBox="0 0 200 200" className="w-full h-full relative z-10 select-none">
            {/* Defs containing premium gradients and drop shadows */}
            <defs>
              <linearGradient id="emerald-wing-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
              <linearGradient id="violet-wing-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#4c1d95" />
              </linearGradient>
              <linearGradient id="white-feather-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="60%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </linearGradient>
              <linearGradient id="robe-white-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>
              <linearGradient id="robe-black-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#090d16" />
              </linearGradient>
              <linearGradient id="gold-metal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <linearGradient id="gold-armor-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="30%" stopColor="#fbbf24" />
                <stop offset="70%" stopColor="#ca8a04" />
                <stop offset="100%" stopColor="#854d0e" />
              </linearGradient>
              <linearGradient id="hair-base-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#111827" />
                <stop offset="50%" stopColor="#030712" />
                <stop offset="100%" stopColor="#000000" />
              </linearGradient>
              <linearGradient id="hair-emerald-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0b1329" />
                <stop offset="45%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <linearGradient id="gem-emerald-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
              <linearGradient id="crystal-grad-violet" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f3e8ff" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#581c87" />
              </linearGradient>
              <linearGradient id="crystal-grad-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ecfdf5" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#064e3b" />
              </linearGradient>
              <linearGradient id="cloak-emerald-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="cloak-violet-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
              </linearGradient>

              {/* Aura Radial Gradients for Dynamic Mood Atmosphere */}
              <radialGradient id="emerald-glow-radial">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#059669" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#047857" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="gold-glow-radial">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#d97706" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="violet-glow-radial">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#7c3aed" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#6d28d9" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="blue-glow-radial">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#2563eb" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="dark-violet-radial">
                <stop offset="0%" stopColor="#581c87" stopOpacity="0.3" />
                <stop offset="60%" stopColor="#3b0764" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="emerald-violet-radial">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="emerald-gold-radial">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* 1. EMERALD, GOLD, AND VIOLET MAGICAL BACKGROUND AURAS & CONSTELLATIONS */}
            <circle cx="65" cy="95" r="55" fill={f.auraColorLeft} opacity={f.magicIntensity * 0.32} style={{ filter: "blur(22px)" }} className="animate-pulse" />
            <circle cx="135" cy="105" r="55" fill={f.auraColorRight} opacity={f.magicIntensity * 0.32} style={{ filter: "blur(22px)" }} className="animate-pulse" />
            
            {/* Connecting Constellation Line Art */}
            {stageInfo.stage >= 3 && (
              <g stroke="#ffffff" strokeWidth="0.5" opacity="0.35" fill="none">
                {/* Left Constellation */}
                <path d="M 25,60 L 45,45 L 35,30 M 45,45 L 60,52" />
                <circle cx="25" cy="60" r="1.5" fill="#fef08a" />
                <circle cx="45" cy="45" r="2.0" fill="#ffffff" className="animate-ping" style={{ animationDuration: '3s' }} />
                <circle cx="35" cy="30" r="1.2" fill="#8b5cf6" />
                <circle cx="60" cy="52" r="1.5" fill="#10b981" />
                
                {/* Right Constellation */}
                <path d="M 175,60 L 155,45 L 165,30 M 155,45 L 140,52" />
                <circle cx="175" cy="60" r="1.5" fill="#fef08a" />
                <circle cx="155" cy="45" r="2.0" fill="#ffffff" className="animate-ping" style={{ animationDuration: '4s' }} />
                <circle cx="165" cy="30" r="1.2" fill="#8b5cf6" />
                <circle cx="140" cy="52" r="1.5" fill="#10b981" />
              </g>
            )}

            {/* 2. CONCENTRIC GEOMETRIC MAGIC PORTALS (Rotate clockwise and counter-clockwise) */}
            <ellipse cx="100" cy="105" rx="92" ry="26" fill="none" stroke="url(#gold-metal-grad)" strokeWidth="0.8" strokeDasharray="16 8" opacity={f.magicIntensity * 0.75} transform="rotate(-10 100 105)" className="origin-[100px_105px] animate-[spin_35s_linear_infinite]" />
            <ellipse cx="100" cy="105" rx="82" ry="20" fill="none" stroke="#10b981" strokeWidth="0.5" strokeDasharray="6 14" opacity={f.magicIntensity * 0.6} transform="rotate(15 100 105)" className="origin-[100px_105px] animate-[spin_20s_linear_infinite_reverse]" />
            
            {/* Stars along orbit lines */}
            <g transform="rotate(-10 100 105)" className="origin-[100px_105px] animate-[spin_35s_linear_infinite]">
              <polygon points="12,-4 14,0 18,2 14,4 12,8 10,4 6,2 10,0" fill="#fbbf24" transform="translate(8, 105) scale(0.5)" />
              <circle cx="192" cy="105" r="2.2" fill="#10b981" style={{ filter: "drop-shadow(0 0 4px #10b981)" }} />
            </g>
            <g transform="rotate(15 100 105)" className="origin-[100px_105px] animate-[spin_20s_linear_infinite_reverse]">
              <polygon points="12,-4 14,0 18,2 14,4 12,8 10,4 6,2 10,0" fill="#c084fc" transform="translate(18, 105) scale(0.4)" />
              <circle cx="182" cy="105" r="1.8" fill="#ffffff" />
            </g>

            {/* 3. FLOWING CLOAK / ENERGY RIBBONS OF MAGICAL LIGHT */}
            <path
              d="M 82 85 Q 40 135, 48 178 Q 100 192, 152 178 Q 160 135, 118 85 Z"
              fill="url(#cloak-violet-grad)"
              className="origin-[100px_85px] animate-[breath_4s_ease-in-out_infinite]"
              style={{ mixBlendMode: "screen" }}
            />
            <path
              d="M 88 85 Q 45 125, 54 173 Q 100 184, 146 173 Q 155 125, 112 85 Z"
              fill="url(#cloak-emerald-grad)"
              className="origin-[100px_85px] animate-[breath_4s_ease-in-out_infinite_reverse]"
              style={{ mixBlendMode: "screen" }}
            />
            
            {/* Elegant Energy Ribbon (Spiral vector path wrapping around chest) */}
            {stageInfo.stage >= 3 && (
              <path 
                d="M 60,150 Q 80,125 100,145 Q 120,165 140,140 Q 110,135 100,130" 
                fill="none" 
                stroke="url(#gold-metal-grad)" 
                strokeWidth="1" 
                strokeDasharray="4 2" 
                opacity="0.75" 
                className="animate-[pulse_2s_infinite]"
              />
            )}

            {/* 4. TWO MAJESTIC CELESTIAL WINGS (Responsive & Layered Feathers with Emerald Edges) */}
            {/* LEFT CELESTIAL WING */}
            {stageInfo.hasWings && (
              <g 
                transform={f.wingTransformLeft} 
                className="origin-[100px_105px] transition-transform duration-700" 
                style={{ filter: "drop-shadow(0 0 10px rgba(16,185,129,0.55))" }}
              >
                <g className="origin-[100px_105px] animate-[wiggle_5s_ease-in-out_infinite]">
                  {/* Back wing shadow */}
                  <path d="M 100 105 C 40 40, -15 20, 5 95 C 15 115, 45 125, 85 112 Z" fill="#022c22" opacity="0.5" />
                  
                  {/* Outer Gold Frame & Armor Plates */}
                  <path
                    d="M 100 105 C 45 45, -10 25, 8 95 C 16 115, 42 125, 85 112 Z"
                    fill="url(#gold-metal-grad)"
                  />
                  
                  {/* Wing Core feather blade */}
                  <path
                    d="M 96 105 C 52 52, -2 38, 12 92 C 18 109, 44 116, 83 107 Z"
                    fill="url(#emerald-wing-grad)"
                  />

                  {/* Layered white feathers with emerald glowing edges */}
                  <path d="M 90 98 Q 50 68, 25 72 Q 45 88, 80 92" fill="url(#white-feather-grad)" stroke="#10b981" strokeWidth="0.6" />
                  <path d="M 80 104 Q 45 78, 20 88 Q 38 100, 72 100" fill="url(#white-feather-grad)" stroke="#10b981" strokeWidth="0.6" />
                  <path d="M 72 108 Q 38 88, 15 104 Q 30 114, 62 106" fill="url(#white-feather-grad)" stroke="#10b981" strokeWidth="0.6" />
                  
                  {/* Golden Ancient Magical Runes engraved on left wing */}
                  {stageInfo.stage >= 3 && (
                    <g stroke="url(#gold-metal-grad)" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.95">
                      {/* Rune glyph 1 */}
                      <path d="M 38 72 L 42 79 L 34 81" />
                      {/* Rune glyph 2 */}
                      <path d="M 46 80 L 52 83 M 49 79 L 49 86" />
                      {/* Rune glyph 3 */}
                      <path d="M 56 88 Q 60 91, 54 96" />
                    </g>
                  )}
                </g>
              </g>
            )}

            {/* RIGHT CELESTIAL WING */}
            {stageInfo.hasWings && (
              <g 
                transform={f.wingTransformRight} 
                className="origin-[100px_105px] transition-transform duration-700" 
                style={{ filter: "drop-shadow(0 0 10px rgba(139,92,246,0.55))" }}
              >
                <g className="origin-[100px_105px] animate-[wiggle_5s_ease-in-out_infinite_reverse]">
                  {/* Back wing shadow */}
                  <path d="M 100 105 C 160 40, 215 20, 195 95 C 185 115, 155 125, 115 112 Z" fill="#1e1b4b" opacity="0.5" />
                  
                  {/* Outer Gold Frame & Armor Plates */}
                  <path
                    d="M 100 105 C 155 45, 210 25, 192 95 C 184 115, 158 125, 115 112 Z"
                    fill="url(#gold-metal-grad)"
                  />
                  
                  {/* Wing Core feather blade */}
                  <path
                    d="M 104 105 C 148 52, 202 38, 188 92 C 182 109, 156 116, 117 107 Z"
                    fill="url(#violet-wing-grad)"
                  />

                  {/* Layered white feathers with violet glowing edges */}
                  <path d="M 110 98 Q 150 68, 175 72 Q 155 88, 120 92" fill="url(#white-feather-grad)" stroke="#8b5cf6" strokeWidth="0.6" />
                  <path d="M 120 104 Q 155 78, 180 88 Q 162 100, 128 100" fill="url(#white-feather-grad)" stroke="#8b5cf6" strokeWidth="0.6" />
                  <path d="M 128 108 Q 162 88, 185 104 Q 170 114, 138 106" fill="url(#white-feather-grad)" stroke="#8b5cf6" strokeWidth="0.6" />
                  
                  {/* Sparkly cosmic stars on right wing */}
                  <circle cx="152" cy="74" r="1.2" fill="#ffffff" opacity="0.9" className="animate-pulse" />
                  <circle cx="166" cy="80" r="1.5" fill="#fcd34d" opacity="0.8" />
                  <circle cx="144" cy="84" r="0.8" fill="#ffffff" opacity="0.75" />
                  <circle cx="172" cy="88" r="1.0" fill="#a7f3d0" opacity="0.9" />

                  {/* Golden Ancient Magical Runes engraved on right wing */}
                  {stageInfo.stage >= 3 && (
                    <g stroke="url(#gold-metal-grad)" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.95">
                      {/* Rune glyph 1 */}
                      <path d="M 162 72 L 158 79 L 166 81" />
                      {/* Rune glyph 2 */}
                      <path d="M 154 80 L 148 83 M 151 79 L 151 86" />
                      {/* Rune glyph 3 */}
                      <path d="M 144 88 Q 140 91, 146 96" />
                    </g>
                  )}
                </g>
              </g>
            )}

            {/* 5. FLOWING FANTASY ROBES & ARMOR (White and Black with Golden Embroideries) */}
            <g className="origin-[100px_160px] animate-[breath_3s_ease-in-out_infinite]">
              {/* Outer Layer Flowing Cape/Wings Shield */}
              <path
                d="M 68 118 Q 45 145, 42 182 Q 100 192, 158 182 Q 155 145, 132 118 Z"
                fill="none"
                stroke="url(#gold-metal-grad)"
                strokeWidth="0.5"
                opacity="0.3"
              />
              
              {/* Flowing Lower Black Robe */}
              <path
                d="M 80 138 L 100 105 L 120 138 L 135 184 Q 100 192, 65 184 Z"
                fill="url(#robe-black-grad)"
                stroke="#0f172a"
                strokeWidth="1"
              />
              
              {/* Inner Obsidian Tunic */}
              <path
                d="M 88 118 L 112 118 L 115 180 L 85 180 Z"
                fill="#0b0f19"
                stroke="url(#gold-metal-grad)"
                strokeWidth="1"
              />
              
              {/* Embroidered Celestial Runes and Gold lines inside Tunic */}
              <path d="M 94 125 L 106 125" stroke="url(#gold-metal-grad)" strokeWidth="0.8" opacity="0.8" />
              <path d="M 91 135 L 109 135" stroke="url(#gold-metal-grad)" strokeWidth="0.8" opacity="0.8" />
              <path d="M 100 120 L 100 170" stroke="url(#gold-metal-grad)" strokeWidth="1.2" strokeDasharray="3 4" />
              
              {/* Symmetrical Gem Embeds */}
              <polygon points="100,126 103,130 100,134 97,130" fill="url(#gem-emerald-grad)" style={{ filter: "drop-shadow(0 0 3px #10b981)" }} />
              <polygon points="100,143 103,147 100,151 97,147" fill="url(#gem-emerald-grad)" />
              <polygon points="100,160 102,163 100,166 98,163" fill="#fbbf24" />

              {/* Luxurious White Outer Robe panels splitting open */}
              <path
                d="M 78 120 Q 88 118, 91 133 L 72 182 Q 66 183, 62 180 Z"
                fill="url(#robe-white-grad)"
                stroke="#cbd5e1"
                strokeWidth="0.6"
              />
              <path
                d="M 122 120 Q 112 118, 109 133 L 128 182 Q 134 183, 138 180 Z"
                fill="url(#robe-white-grad)"
                stroke="#cbd5e1"
                strokeWidth="0.6"
              />
              
              {/* Gold borders on White Robes */}
              <path d="M 78 120 L 72 182" stroke="url(#gold-metal-grad)" strokeWidth="1.2" fill="none" />
              <path d="M 122 120 L 128 182" stroke="url(#gold-metal-grad)" strokeWidth="1.2" fill="none" />
              
              {/* Leather belts around the waist */}
              <rect x="83" y="146" width="34" height="4" rx="1" fill="#451a03" stroke="url(#gold-metal-grad)" strokeWidth="0.5" />
              <polygon points="100,144 104,148 100,152 96,148" fill="url(#gold-metal-grad)" />

              {/* 6. ADVANCED CELESTIAL ARMOR (Chestplate & Pauldrons) */}
              {/* Left Pauldron (Shoulder Guard) */}
              {stageInfo.stage >= 2 && (
                <g>
                  <path
                    d="M 74 110 Q 62 106, 64 122 Q 74 126, 80 115 Z"
                    fill="url(#gold-armor-grad)"
                    stroke="url(#gold-metal-grad)"
                    strokeWidth="1"
                  />
                  {/* Inlaid Emerald Gem */}
                  <polygon points="69,114 72,117 69,120 66,117" fill="url(#gem-emerald-grad)" style={{ filter: "drop-shadow(0 0 2px #10b981)" }} />
                </g>
              )}
              
              {/* Right Pauldron */}
              {stageInfo.stage >= 2 && (
                <g>
                  <path
                    d="M 126 110 Q 138 106, 136 122 Q 126 126, 120 115 Z"
                    fill="url(#gold-armor-grad)"
                    stroke="url(#gold-metal-grad)"
                    strokeWidth="1"
                  />
                  {/* Inlaid Emerald Gem */}
                  <polygon points="131,114 134,117 131,120 128,117" fill="url(#gem-emerald-grad)" style={{ filter: "drop-shadow(0 0 2px #10b981)" }} />
                </g>
              )}

              {/* Chestplate with golden filigrees */}
              <path
                d="M 80 112 Q 100 102, 120 112 L 115 135 Q 100 145, 85 135 Z"
                fill="url(#gold-armor-grad)"
                stroke="url(#gold-metal-grad)"
                strokeWidth="1.5"
              />
              {/* Inner metal shadow core */}
              <path
                d="M 84 115 Q 100 107, 116 115 L 111 131 Q 100 139, 89 131 Z"
                fill="#1e293b"
              />
              {/* Fine gold embroidery filigree curves */}
              {stageInfo.stage >= 3 && (
                <>
                  <path d="M 88 117 Q 100 126, 112 117" fill="none" stroke="url(#gold-metal-grad)" strokeWidth="0.8" opacity="0.9" />
                  <path d="M 91 125 Q 100 132, 109 125" fill="none" stroke="url(#gold-metal-grad)" strokeWidth="0.8" opacity="0.9" />
                </>
              )}

              {/* Radiant Heart Medallion */}
              <circle cx="100" cy="122" r="6" fill="#0b0f19" stroke="url(#gold-metal-grad)" strokeWidth="1" />
              <circle cx="100" cy="122" r="4" fill="#10b981" className="animate-pulse" />
              <circle cx="100" cy="122" r="1.5" fill="#ffffff" />
            </g>

            {/* 7. HEAD, EXPRESSIVE FACE, AND MULTI-LAYERED HAIR */}
            <g transform={f.headTilt} className="origin-[100px_90px] transition-transform duration-500">
              {/* Back Hair Flowing Outwards (Base layer) */}
              <path d="M 76 78 C 52 100, 48 125, 58 140 C 68 122, 75 110, 80 92 Z" fill="url(#hair-base-grad)" />
              <path d="M 124 78 C 148 100, 152 125, 142 140 C 132 122, 125 110, 120 92 Z" fill="url(#hair-base-grad)" />
              
              {/* Emerald Highlights and Violet Reflections on Back Hair */}
              <path d="M 58 102 Q 50 118, 55 136" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.65" />
              <path d="M 142 102 Q 150 118, 145 136" fill="none" stroke="#8b5cf6" strokeWidth="2" opacity="0.55" strokeDasharray="4 2" />
              
              {/* Outer Volume Hair Crown (Spiky but elegant anime shape) */}
              <path d="M 72 74 Q 52 50, 80 44 Q 92 34, 100 48 Q 108 34, 120 44 Q 148 50, 128 74 Z" fill="url(#hair-base-grad)" />
              
              {/* Face Base (Soft Ivory Tone with Shading) */}
              <path
                d="M 85 82 Q 100 102, 115 82 Q 110 70, 90 70 Z"
                fill="#fff2e8"
              />
              {/* Chin Shading */}
              <path d="M 90 94 Q 100 102, 110 94 Q 100 98, 90 94" fill="#f87171" opacity="0.18" />
              
              {/* Soft facial blush */}
              <ellipse cx="91" cy="88" rx="4" ry="1.8" fill="#fda4af" opacity={f.cheekBlush} />
              <ellipse cx="109" cy="88" rx="4" ry="1.8" fill="#fda4af" opacity={f.cheekBlush} />

              {/* Overlapping Bangs framing the face */}
              {/* Side Sweeps */}
              <path d="M 76 68 C 72 82, 83 100, 85 104 C 88 95, 82 80, 82 68 Z" fill="url(#hair-emerald-grad)" />
              <path d="M 124 68 C 128 82, 117 100, 115 104 C 112 95, 118 80, 118 68 Z" fill="url(#hair-emerald-grad)" />
              
              {/* Central spiky locks (Anime Signature) */}
              <path d="M 90 60 Q 98 84, 98 88 Q 99 82, 106 60 Z" fill="url(#hair-emerald-grad)" />
              <path d="M 96 58 Q 101 78, 103 82 Q 102 75, 110 58 Z" fill="url(#hair-emerald-grad)" fillOpacity="0.9" />
              <path d="M 86 64 Q 93 76, 92 81 Q 91 75, 96 64 Z" fill="url(#hair-base-grad)" />
              <path d="M 114 64 Q 107 76, 108 81 Q 109 75, 104 64 Z" fill="url(#hair-base-grad)" />

              {/* Expressive Face Features based on Active Emotion */}
              {/* Eyebrows */}
              <path d={f.leftEyebrow} fill="none" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" />
              <path d={f.rightEyebrow} fill="none" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" />

              {/* Eyes */}
              {f.isEyeClosed ? (
                <>
                  {/* Beautiful curved closed eyelashes */}
                  <path d={f.leftEyePath} fill="none" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" />
                  <path d={f.rightEyePath} fill="none" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" />
                  {/* Closed Eye reflections / Sparkle */}
                  <circle cx="93" cy="89" r="0.8" fill="#fbbf24" opacity="0.6" />
                  <circle cx="107" cy="89" r="0.8" fill="#fbbf24" opacity="0.6" />
                </>
              ) : (
                <>
                  {/* Upper Eyelashes */}
                  <path d="M 88 83.5 Q 93 81.5, 98 84" fill="none" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M 112 83.5 Q 107 81.5, 102 84" fill="none" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
                  
                  {/* Left Eye Pupil (Emerald Iris + Gold Core) */}
                  <g transform={`scale(1, ${f.eyeScaleY})`} className="origin-[93px_85px]">
                    <ellipse cx="93" cy="85.5" rx="3.5" ry="4" fill="#0f172a" />
                    <ellipse cx={93 + eyeOffset.x} cy={85.8 + eyeOffset.y} rx="2.5" ry="3.2" fill="#10b981" />
                    <circle cx={93 + eyeOffset.x * 1.1} cy={85.8 + eyeOffset.y * 1.1} r="1.3" fill="#fbbf24" />
                    <polygon points="93,85.3 93.3,85.6 93.7,85.6 93.4,85.9 93.5,86.2 93,86 92.5,86.2 92.6,85.9 92.3,85.6 92.7,85.6" fill="#ffffff" transform={`translate(${eyeOffset.x * 1.2}, ${eyeOffset.y * 1.2})`} />
                    <circle cx={94.5 + eyeOffset.x * 1.3} cy={84 + eyeOffset.y * 1.3} r="0.9" fill="#ffffff" />
                  </g>
                  
                  {/* Right Eye Pupil (Emerald Iris + Gold Core) */}
                  <g transform={`scale(1, ${f.eyeScaleY})`} className="origin-[107px_85px]">
                    <ellipse cx="107" cy="85.5" rx="3.5" ry="4" fill="#0f172a" />
                    <ellipse cx={107 + eyeOffset.x} cy={85.8 + eyeOffset.y} rx="2.5" ry="3.2" fill="#10b981" />
                    <circle cx={107 + eyeOffset.x * 1.1} cy={85.8 + eyeOffset.y * 1.1} r="1.3" fill="#fbbf24" />
                    <polygon points="107,85.3 107.3,85.6 107.7,85.6 107.4,85.9 107.5,86.2 107,86 106.5,86.2 106.6,85.9 106.3,85.6 106.7,85.6" fill="#ffffff" transform={`translate(${eyeOffset.x * 1.2}, ${eyeOffset.y * 1.2})`} />
                    <circle cx="108.5" cy="84" r="0.9" fill="#ffffff" transform={`translate(${eyeOffset.x * 1.3}, ${eyeOffset.y * 1.3})`} />
                  </g>
                </>
              )}
              
              {/* Cute nose stroke */}
              <path d="M 100 88 L 99.5 90 L 100.5 90" fill="none" stroke="#fca5a5" strokeWidth="0.8" strokeLinecap="round" />

              {/* Expressive Mouth */}
              <path d={f.mouthPath} fill={f.mouthFill} stroke="#334155" strokeWidth="1.2" strokeLinecap="round" />

              {/* Overhead Halo Crown */}
              {stageInfo.stage >= 2 && (
                <g transform="translate(0, -6)">
                  <g className="origin-[100px_72px] animate-[bounce_4s_ease-in-out_infinite]">
                    {/* Concentric Halo Arc */}
                    <path
                      d="M 85 71 Q 100 62, 115 71"
                      fill="none"
                      stroke="url(#gold-metal-grad)"
                      strokeWidth={stageInfo.stage >= 4 ? "1.8" : "1.0"}
                      strokeLinecap="round"
                      strokeDasharray={stageInfo.stage >= 4 ? "4 2" : "none"}
                    />
                    {/* Radiant floating central emerald star */}
                    {stageInfo.stage >= 3 && (
                      <polygon 
                        points="100,56 102.5,61.5 108,61.5 103.5,64.5 105,70 100,66.5 95,70 96.5,64.5 92,61.5 97.5,61.5" 
                        fill="url(#gold-metal-grad)" 
                        style={{ filter: "drop-shadow(0 0 4px #fbbf24)" }} 
                      />
                    )}
                    {stageInfo.stage >= 3 && (
                      <circle cx="100" cy="62.5" r="1.5" fill="#10b981" />
                    )}
                    <circle cx="89" cy="68" r="1.2" fill="#fbbf24" />
                    <circle cx="111" cy="68" r="1.2" fill="#fbbf24" />
                  </g>
                </g>
              )}
            </g>

            {/* 8. FLOATING MAGICAL ACCESSORIES */}
            {/* THE CHRONICLE OF WISDOM (Floating Book left side) */}
            {stageInfo.hasFloatingAccessories && (
              <g>
                <g transform="translate(30, 120) scale(0.95)" style={{ filter: "drop-shadow(0 0 8px rgba(16,185,129,0.6))" }}>
                  <g className="origin-[12px_12px] animate-[bounce_3s_ease-in-out_infinite]">
                    {/* Book Cover with gold and emerald bindings */}
                    <path d="M 2 14 L 10 18 L 10 4 L 2 0 Z" fill="#090d16" stroke="url(#gold-metal-grad)" strokeWidth="0.75" />
                    <path d="M 22 14 L 14 18 L 14 4 L 22 0 Z" fill="#090d16" stroke="url(#gold-metal-grad)" strokeWidth="0.75" />
                    
                    {/* Glowing emerald gemstone on cover center */}
                    <polygon points="6,9 8,11 6,13 4,11" fill="url(#gem-emerald-grad)" />
                    <polygon points="18,9 20,11 18,13 16,11" fill="url(#gem-emerald-grad)" />
                    
                    {/* Book Pages */}
                    <path d="M 10 18 Q 6 15, 3 13 L 3 1 L 10 4 Z" fill="#fffef0" />
                    <path d="M 14 18 Q 18 15, 21 13 L 21 1 L 14 4 Z" fill="#fffef0" />
                    <line x1="12" y1="4" x2="12" y2="18" stroke="url(#gold-metal-grad)" strokeWidth="1" />
                    
                    {/* Golden Runes on Pages */}
                    <line x1="5" y1="5" x2="8" y2="5" stroke="#10b981" strokeWidth="0.6" />
                    <line x1="5" y1="8" x2="7" y2="8" stroke="#10b981" strokeWidth="0.6" />
                    <line x1="16" y1="5" x2="19" y2="5" stroke="#10b981" strokeWidth="0.6" />
                    <line x1="16" y1="8" x2="18" y2="8" stroke="#10b981" strokeWidth="0.6" />
                  </g>
                </g>
                {/* Tiny spell trail dots from book */}
                <circle cx="48" cy="116" r="1.2" fill="#10b981" className="animate-ping" />
                <circle cx="56" cy="112" r="0.8" fill="#a7f3d0" />
              </g>
            )}

            {/* FLOATING CRYSTALS (Right side, violet/gold starlight faceted gems) */}
            {stageInfo.hasFloatingAccessories && (
              <g>
                <g transform="translate(162, 118)" style={{ filter: "drop-shadow(0 0 6px rgba(139,92,246,0.5))" }}>
                  <g className="origin-[8px_12px] animate-[bounce_3s_ease-in-out_infinite_reverse]">
                    {/* Primary Crystal Shard */}
                    <polygon points="8,0 14,10 8,22 2,10" fill="url(#crystal-grad-violet)" />
                    {/* Highlight facet */}
                    <polygon points="8,0 8,22 2,10" fill="#ffffff" opacity="0.3" />
                    
                    {/* Small orbiting shards */}
                    <polygon points="1,4 3,8 0,11" fill="url(#gold-metal-grad)" transform="translate(-6, 2) scale(0.7) rotate(45)" className="animate-pulse" />
                    <polygon points="1,4 3,8 0,11" fill="url(#crystal-grad-emerald)" transform="translate(14, 10) scale(0.6) rotate(-30)" />
                  </g>
                </g>
                <circle cx="152" cy="118" r="1" fill="#c084fc" className="animate-ping" />
              </g>
            )}

          </svg>
        );
      }
      case 'steampunk-sentinel':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full relative z-10 select-none">
            {/* Rotating Outer Gear */}
            <g className="origin-[100px_100px] animate-[spin_25s_linear_infinite]" style={{ transformOrigin: '100px 100px' }}>
              <circle cx="100" cy="100" r="45" fill="none" stroke="#d97706" strokeWidth="2.5" strokeDasharray="6 6" />
              {Array.from({ length: 8 }).map((_, i) => (
                <rect
                  key={i}
                  x="95"
                  y="46"
                  width="10"
                  height="12"
                  rx="1.5"
                  fill="#d97706"
                  transform={`rotate(${i * 45} 100 100)`}
                />
              ))}
            </g>
            <circle cx="100" cy="100" r="40" fill="#0f172a" stroke="#475569" strokeWidth="1" />
            
            {/* Steampunk Goggles Frame */}
            <rect x="74" y="86" width="52" height="28" rx="6" fill="#78350f" stroke="#fbbf24" strokeWidth="1" />
            {/* Glowing amber lenses */}
            <circle cx="87" cy="100" r="9" fill="#f59e0b" className="animate-pulse" />
            <circle cx="113" cy="100" r="9" fill="#f59e0b" className="animate-pulse" />
            <circle cx="87" cy="100" r="5" fill="#fef08a" />
            <circle cx="113" cy="100" r="5" fill="#fef08a" />
            <path d="M 96 100 L 104 100" stroke="#fbbf24" strokeWidth="2" />
            
            {/* Top Hat */}
            <rect x="76" y="60" width="48" height="26" rx="2" fill="#1e293b" stroke="#d97706" strokeWidth="1.5" />
            <rect x="66" y="80" width="68" height="6" rx="2" fill="#78350f" />
            {/* Small golden buckle on hat */}
            <rect x="94" y="75" width="12" height="5" fill="#eab308" />
            
            {/* Steam Pipe Chimney blowing steam particles */}
            <g className="origin-[72px_55px] animate-bounce">
              <path d="M 70 56 L 76 56 L 74 42 L 68 42 Z" fill="#475569" stroke="#d97706" strokeWidth="0.5" />
              <circle cx="71" cy="35" r="3.5" fill="#cbd5e1" opacity="0.6" className="animate-ping" style={{ animationDuration: '2s' }} />
            </g>
          </svg>
        );
      case 'arcane-djinn':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full relative z-10 select-none">
            {/* Blue Vapor Cloud Lower Body */}
            <path
              d="M 70 160 Q 100 185 130 160 Q 115 130 100 120 Q 85 130 70 160 Z"
              fill="url(#djinn-cloud-grad)"
              className="origin-[100px_160px] animate-[breath_2s_ease-in-out_infinite]"
              style={{ filter: "drop-shadow(0 0 12px rgba(56,189,248,0.4))" }}
            />
            {/* Muscular Robed Chest */}
            <path
              d="M 70 110 L 130 110 L 115 140 L 85 140 Z"
              fill="#0284c7"
              stroke="#f59e0b"
              strokeWidth="1.5"
              className="origin-[100px_110px] animate-[breath_2s_ease-in-out_infinite]"
            />
            {/* Golden Braces */}
            <rect x="66" y="105" width="8" height="15" rx="3" fill="#eab308" />
            <rect x="126" y="105" width="8" height="15" rx="3" fill="#eab308" />
            
            {/* Smiling Djinn Head with glowing ponytail */}
            <circle cx="100" cy="85" r="16" fill="#38bdf8" />
            {/* Ponytail */}
            <path d="M 100 69 Q 115 50 130 65 Q 110 75 100 69 Z" fill="#eab308" className="animate-pulse" />
            {/* Glowing Golden Collar */}
            <path d="M 84 94 Q 100 102 116 94" stroke="#eab308" strokeWidth="4" fill="none" />
            
            {/* Glowing Eyes */}
            <circle cx={94 + eyeOffset.x} cy={83 + eyeOffset.y} r="2.5" fill="#fcd34d" className="animate-ping" />
            <circle cx={106 + eyeOffset.x} cy={83 + eyeOffset.y} r="2.5" fill="#fcd34d" className="animate-ping" />
            <circle cx={94 + eyeOffset.x} cy={83 + eyeOffset.y} r="2" fill="#ffffff" />
            <circle cx={106 + eyeOffset.x} cy={83 + eyeOffset.y} r="2" fill="#ffffff" />
            
            {/* Gradients */}
            <defs>
              <linearGradient id="djinn-cloud-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
        );
      case 'knowledge-keeper':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full relative z-10 select-none">
            {/* Wizard Robe (Sage green) */}
            <path
              d="M 75 160 L 100 80 L 125 160 Z"
              fill="#064e3b"
              stroke="#10b981"
              strokeWidth="1"
              className="origin-[100px_160px] animate-[breath_4s_ease-in-out_infinite]"
            />
            {/* Long white beard */}
            <path
              d="M 88 100 C 88 150, 112 150, 112 100 Z"
              fill="#f1f5f9"
              className="origin-[100px_100px] animate-[wiggle_3s_ease-in-out_infinite]"
            />
            {/* Hood and wise face */}
            <circle cx="100" cy="90" r="12" fill="#fef08a" />
            {/* Wise glowing eyes with tracking */}
            <circle cx={96 + eyeOffset.x} cy={90 + eyeOffset.y} r="1.5" fill="#10b981" />
            <circle cx={104 + eyeOffset.x} cy={90 + eyeOffset.y} r="1.5" fill="#10b981" />
            <path d="M 88 90 C 88 74, 112 74, 112 90 Z" fill="#047857" />
            
            {/* Floating Magical Book in front of him */}
            <g className="origin-[100px_125px] animate-[bounce_3s_ease-in-out_infinite]">
              {/* Spine */}
              <rect x="98" y="115" width="4" height="20" rx="1" fill="#78350f" />
              {/* Left Page */}
              <path d="M 98 115 Q 80 112 65 120 L 65 136 Q 80 128 98 131 Z" fill="#fef08a" stroke="#b45309" strokeWidth="1" />
              {/* Right Page */}
              <path d="M 102 115 Q 120 112 135 120 L 135 136 Q 120 128 102 131 Z" fill="#fef08a" stroke="#b45309" strokeWidth="1" />
              {/* Spell sparkles from book */}
              <circle cx="75" cy="122" r="1.5" fill="#10b981" className="animate-ping" />
              <circle cx="125" cy="122" r="1.5" fill="#10b981" className="animate-ping" />
            </g>
          </svg>
        );
      default:
        // Generic glowing runic crest for custom companions
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full relative z-10 select-none animate-pulse">
            <circle cx="100" cy="100" r="45" fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="5 5" className="animate-spin" style={{ animationDuration: '10s' }} />
            <circle cx="100" cy="100" r="30" fill="none" stroke="#10b981" strokeWidth="1.5" />
            <path d="M 100 70 L 110 90 L 130 100 L 110 110 L 100 130 L 90 110 L 70 100 L 90 90 Z" fill="url(#custom-companion-grad)" />
            <defs>
              <linearGradient id="custom-companion-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
        );
    }
  };

  // Render Official Sprite Sheet Cropped Asset
  const renderCompanionSprite = () => {
    const EMOTION_MAP: Record<string, { col: number; row: number }> = {
      Neutral: { col: 0, row: 0 },
      Greeting: { col: 0, row: 0 },
      Happy: { col: 1, row: 0 },
      Smiling: { col: 2, row: 0 },
      Laughing: { col: 3, row: 0 },
      Excited: { col: 3, row: 0 },
      Proud: { col: 4, row: 0 },
      Thinking: { col: 5, row: 0 },
      Concerned: { col: 0, row: 1 },
      Surprised: { col: 1, row: 1 },
      Determined: { col: 2, row: 1 },
      Peaceful: { col: 3, row: 1 },
      Sad: { col: 4, row: 1 },
      Winking: { col: 5, row: 1 },
      Encouraging: { col: 0, row: 2 },
      Shocked: { col: 1, row: 2 },
      Blushing: { col: 2, row: 2 },
      Confident: { col: 3, row: 2 },
      Meditating: { col: 4, row: 2 },
      Sleeping: { col: 5, row: 2 }
    };

    const norm = emotion ? (emotion.charAt(0).toUpperCase() + emotion.slice(1).toLowerCase()) : 'Neutral';
    const coords = EMOTION_MAP[norm] || EMOTION_MAP['Neutral'];

    const w = 73;
    const h = 84;
    const x = 582 + coords.col * 73;
    const y = 22 + coords.row * 84;

    const bgSizeX = (1024 / w) * 100;
    const bgSizeY = (682 / h) * 100;
    const bgPosX = (x / (1024 - w)) * 100;
    const bgPosY = (y / (682 - h)) * 100;

    return (
      <div className="w-full h-full flex flex-col items-center justify-center relative select-none">
        {/* Magic Aura Ring Frame */}
        <div className="absolute w-[92%] h-[92%] rounded-full border-2 border-dashed border-amber-500/20 animate-[spin_30s_linear_infinite] flex items-center justify-center pointer-events-none">
          <div className="w-11/12 h-11/12 rounded-full border border-dotted border-emerald-500/20 animate-[spin_15s_linear_infinite_reverse]"></div>
        </div>

        {/* Circular Avatar Window with Golden/Emerald Glowing Borders */}
        <div 
          className="w-[80%] h-[80%] rounded-full overflow-hidden border-4 border-slate-900 relative shadow-[0_0_20px_rgba(16,185,129,0.2)] bg-slate-950 flex items-center justify-center animate-[breath_6s_ease-in-out_infinite]"
          style={{
            borderColor: stageInfo.stage >= 4 ? '#fbbf24' : stageInfo.stage >= 2 ? '#10b981' : '#475569',
            boxShadow: stageInfo.stage >= 5 
              ? '0 0 25px rgba(251,191,36,0.5)' 
              : stageInfo.stage >= 3 
                ? '0 0 20px rgba(16,185,129,0.4)' 
                : '0 0 10px rgba(0,0,0,0.5)'
          }}
        >
          {/* Sliced Sprite Layer */}
          <div 
            className="w-full h-full transform scale-110"
            style={{
              backgroundImage: `url(${ref1})`,
              backgroundSize: `${bgSizeX}% ${bgSizeY}%`,
              backgroundPosition: `${bgPosX}% ${bgPosY}%`,
              backgroundRepeat: 'no-repeat'
            }}
          />

          {/* Senses glow overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 via-transparent to-violet-500/5 mix-blend-screen pointer-events-none animate-pulse"></div>
        </div>

        {/* Stage Crest Indicator Badge */}
        <div className="absolute bottom-0 bg-slate-950/90 border border-slate-800 rounded-full px-2.5 py-0.5 text-[8px] font-mono font-bold text-amber-500 tracking-wider shadow-md select-none">
          STAGE {stageInfo.stage}
        </div>
      </div>
    );
  };

  const renderCompanion3D = () => {
    if (equippedId === 'infinity-ascendant') {
      return (
        <div className="w-full h-full flex items-center justify-center relative select-none">
          <Companion3DScene
            state={state}
            emotion={emotion}
            mousePos={mousePos}
            widgetCenter={widgetCenter}
          />
        </div>
      );
    }

    const imgSrc = equippedId === 'steampunk-sentinel' ? steampunk3D : infinity3D;
    const glowColor = equippedId === 'steampunk-sentinel' ? 'rgba(217,119,6,0.5)' : 'rgba(16,185,129,0.5)';
    const borderColor = equippedId === 'steampunk-sentinel' ? '#d97706' : '#10b981';
    const badgeText = equippedId === 'steampunk-sentinel' ? 'STEAMPUNK 3D' : 'CELESTIAL 3D';

    return (
      <div className="w-full h-full flex flex-col items-center justify-center relative select-none">
        {/* Magic Aura Ring Frame */}
        <div className="absolute w-[95%] h-[95%] rounded-full border border-dashed border-slate-500/20 animate-[spin_25s_linear_infinite] flex items-center justify-center pointer-events-none">
          <div className="w-11/12 h-11/12 rounded-full border border-dotted border-amber-500/10 animate-[spin_12s_linear_infinite_reverse]"></div>
        </div>

        {/* Circular Avatar Window with glowing border */}
        <div 
          className="w-[82%] h-[82%] rounded-full overflow-hidden border-4 bg-slate-950 flex items-center justify-center relative animate-[breath_6s_ease-in-out_infinite]"
          style={{
            borderColor: borderColor,
            boxShadow: `0 0 25px ${glowColor}`
          }}
        >
          <img 
            src={imgSrc} 
            alt={`${companion.name} 3D`} 
            className="w-[90%] h-[90%] object-contain transform scale-110 drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent pointer-events-none"></div>
        </div>

        {/* Stage Crest Indicator Badge */}
        <div className="absolute bottom-0 bg-slate-950/90 border border-slate-800 rounded-full px-2.5 py-0.5 text-[8px] font-mono font-bold text-amber-500 tracking-wider shadow-md select-none">
          {badgeText}
        </div>
      </div>
    );
  };

  const handleResize = () => {
    const sizes: ('sm' | 'md' | 'lg')[] = ['sm', 'md', 'lg'];
    const nextSize = sizes[(sizes.indexOf(size) + 1) % sizes.length];
    onUpdateState({
      ...state,
      companionSize: nextSize
    });
    sfx.playCoin();
  };

  const handleToggleFavorite = () => {
    let favorites = [...(state.favoriteCompanionIds || [])];
    if (favorites.includes(equippedId)) {
      favorites = favorites.filter(id => id !== equippedId);
    } else {
      favorites.push(equippedId);
    }
    onUpdateState({
      ...state,
      favoriteCompanionIds: favorites
    });
    sfx.playQuestComplete();
  };

  const currentX = (state.companionPositionX ?? 0) + idleXOffset;
  const currentY = (state.companionPositionY ?? 0) + idleYOffset;
  const scale = state.companionScale ?? 1.0;

  return (
    <div
      ref={widgetRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUpPress}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onWheel={handleWheel}
      style={{
        left: `${currentX}px`,
        top: `${currentY}px`,
        position: 'fixed',
        zIndex: 100,
        transform: `scale(${scale})`,
        transformOrigin: 'bottom center',
        transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), left 0.3s cubic-bezier(0.16, 1, 0.3, 1), top 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      className={`select-none flex flex-col items-center justify-end pointer-events-auto cursor-grab active:cursor-grabbing`}
      id="companion-live-widget"
    >
      {/* INJECT KEYFRAME ANIMATIONS LOCALLY */}
      <style>{`
        @keyframes spin-once {
          0% { transform: scale(${scale}) rotate(0deg); }
          100% { transform: scale(${scale}) rotate(360deg); }
        }
        @keyframes bounce-intense {
          0%, 100% { transform: scale(${scale}) translateY(0); }
          50% { transform: scale(${scale}) translateY(-45px); }
        }
        @keyframes heartbeat-giant {
          0%, 100% { transform: scale(${scale}); }
          30% { transform: scale(${scale * 1.3}); }
          60% { transform: scale(${scale * 0.9}); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes float-up {
          0% { transform: translateY(0) scale(0.5); opacity: 1; }
          100% { transform: translateY(-130px) scale(1.3); opacity: 0; }
        }
      `}</style>

      {/* 1. SUMMON MAGIC BANNER OVERLAY */}
      {summoning && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50 animate-fadeIn">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"></div>
          <div className="relative bg-gradient-to-r from-transparent via-slate-950/95 to-transparent py-8 px-24 w-full border-y border-amber-500/30 text-center animate-[slideIn_0.6s_ease-out] flex flex-col items-center gap-2">
            <span className="text-[10px] font-mono tracking-[0.4em] text-amber-400 font-bold uppercase animate-pulse">
              CELESTIAL GUARDIAN SUMMONED
            </span>
            <h1 className="text-3xl font-black text-white tracking-widest uppercase font-sans flex items-center gap-3">
              <LucideIcon name="Sparkles" className="text-amber-400 animate-spin" size={24} style={{ animationDuration: '6s' }} />
              {summonName}
              <LucideIcon name="Sparkles" className="text-amber-400 animate-spin" size={24} style={{ animationDuration: '6s' }} />
            </h1>
            <p className="text-xs text-slate-400 tracking-wide font-serif italic max-w-md mt-1">
              "{companion.biography}"
            </p>
            <span className="text-[10px] font-mono text-emerald-400 font-bold tracking-widest uppercase mt-2">
              {summonName} Equipped Successfully
            </span>
          </div>
        </div>
      )}

      {/* 2. CONTEXT MENU */}
      {menuOpen && (
        <div
          className="fixed z-50 bg-slate-950/95 border border-slate-800 rounded-xl shadow-2xl p-2.5 min-w-[210px] text-xs font-mono text-slate-200 no-drag"
          style={{
            left: `${menuPos.x}px`,
            top: `${menuPos.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2 py-1.5 border-b border-slate-900 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex justify-between items-center">
            <span>Guardian Menu</span>
            <button onClick={() => setMenuOpen(false)} className="text-slate-500 hover:text-white cursor-pointer">
              <LucideIcon name="X" size={10} />
            </button>
          </div>
          
          <div className="py-1">
            <span className="px-2 py-1 text-[9px] text-slate-500 font-sans block">Positioning Preset</span>
            {[
              { id: 'Bottom' as const, label: 'Bottom Corner', icon: 'Layout' },
              { id: 'Left' as const, label: 'Left Side', icon: 'AlignLeft' },
              { id: 'Right' as const, label: 'Right Side', icon: 'AlignRight' },
              { id: 'Floating' as const, label: 'Floating Mode', icon: 'Sparkles' },
              { id: 'Auto' as const, label: 'Auto Position', icon: 'Compass' }
            ].map((p) => {
              const isSel = (state.companionPositionMode || 'Bottom') === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    sfx.playCoin();
                    onUpdateState({
                      ...state,
                      companionPositionMode: p.id
                    });
                    setMenuOpen(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between hover:bg-slate-800/80 transition-colors cursor-pointer ${isSel ? 'text-amber-400 bg-slate-900/60' : 'text-slate-300'}`}
                >
                  <span className="flex items-center gap-2">
                    <LucideIcon name={p.icon} size={11} />
                    {p.label}
                  </span>
                  {isSel && <LucideIcon name="Check" size={10} />}
                </button>
              );
            })}
          </div>

          {(equippedId === 'infinity-ascendant' || equippedId === 'steampunk-sentinel') && (
            <div className="py-1 border-t border-slate-900">
              <span className="px-2 py-1 text-[9px] text-slate-500 font-sans block">Display Mode</span>
              <div className="flex gap-1 px-2 py-1">
                {[
                  { id: 'vector', label: 'Vector SVG' },
                  { id: 'sprite', label: 'Anime 2D' },
                  { id: '3d', label: '3D Render' }
                 ].map((mode) => {
                   const isSel = renderingMode === mode.id;
                   if (equippedId === 'steampunk-sentinel' && mode.id === 'sprite') return null;
                   return (
                     <button
                       key={mode.id}
                       onClick={() => {
                         sfx.playSkillUnlock();
                         onUpdateState({
                           ...state,
                           companionRenderingMode: mode.id as any
                         });
                         setMenuOpen(false);
                       }}
                       className={`flex-1 text-center py-1 rounded hover:bg-slate-800 transition-colors cursor-pointer border text-[10px] ${isSel ? 'border-amber-500/40 text-amber-400 bg-slate-900 font-bold' : 'border-transparent text-slate-400'}`}
                     >
                       {mode.label}
                     </button>
                   );
                 })}
              </div>
            </div>
          )}
          
          <div className="py-1 border-t border-slate-900">
            <span className="px-2 py-1 text-[9px] text-slate-500 font-sans block">Select Emotion</span>
            <div className="grid grid-cols-2 gap-1 px-2 py-1">
              {['Happy', 'Excited', 'Proud', 'Thinking', 'Concerned', 'Meditating', 'Sleeping'].map((emo) => {
                const isSel = emotion === emo;
                return (
                  <button
                    key={emo}
                    onClick={() => {
                      sfx.playSkillUnlock();
                      setEmotion(emo);
                      triggerDialogueForEmotion(emo);
                      setMenuOpen(false);
                    }}
                    className={`text-[10px] text-left px-1.5 py-1 rounded hover:bg-slate-800 transition-colors cursor-pointer border ${isSel ? 'border-amber-500/40 text-amber-400 bg-slate-900' : 'border-transparent text-slate-400'}`}
                  >
                    {emo}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="py-1 border-t border-slate-900">
            <span className="px-2 py-1 text-[9px] text-slate-500 font-sans block">Trigger Rituals</span>
            <div className="flex flex-col gap-0.5">
              {[
                { id: 'spin-once', label: 'Cosmic Spin Filter', icon: 'RotateCw' },
                { id: 'bounce-intense', label: 'Starlight Bounce', icon: 'TrendingUp' },
                { id: 'heartbeat-giant', label: 'Ethereal Pulse Wave', icon: 'Heart' }
              ].map((anim) => (
                <button
                  key={anim.id}
                  onClick={() => {
                    sfx.playLevelUp();
                    setSpecialAnim(anim.id);
                    setMenuOpen(false);
                    setTimeout(() => setSpecialAnim(null), 2500);
                  }}
                  className="w-full text-left px-2 py-1 rounded hover:bg-slate-800 text-slate-300 flex items-center gap-2 cursor-pointer text-[10px]"
                >
                  <LucideIcon name={anim.icon} size={10} className="text-amber-400" />
                  {anim.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="py-2 px-2 border-t border-slate-900 space-y-1">
            <div className="flex justify-between items-center text-[9px] text-slate-500">
              <span>Companion Zoom</span>
              <span className="text-amber-400">{scale.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={scale}
              onChange={(e) => {
                onUpdateState({
                  ...state,
                  companionScale: parseFloat(e.target.value)
                });
              }}
              className="w-full accent-amber-500 bg-slate-900 rounded-lg cursor-pointer h-1"
            />
          </div>

          <button
            onClick={() => {
              setShowProfileModal(true);
              setMenuOpen(false);
            }}
            className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-blue-400 hover:text-blue-300 font-semibold border-t border-slate-900 flex items-center gap-2 cursor-pointer mt-1"
          >
            <LucideIcon name="User" size={11} />
            Open Guardian Profile
          </button>
        </div>
      )}

      {/* 3. GUARDIAN PROFILE DOSSIER MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn no-drag">
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" onClick={() => setShowProfileModal(false)}></div>
          <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden animate-[scaleUp_0.3s_ease]">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-violet-500"></div>
            
            <div className="flex justify-between items-center p-5 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <LucideIcon name="Shield" className="text-amber-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Guardian Profile Dossier</h2>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-white hover:bg-slate-800/60 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <LucideIcon name="X" size={14} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar text-sans">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-36 h-36 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center p-2 relative overflow-hidden group/portrait shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-emerald-500/5"></div>
                  <div className="w-full h-full scale-[1.1] transition-transform group-hover/portrait:scale-[1.2] duration-500">
                    {renderCompanionVector()}
                  </div>
                </div>
                
                <div className="flex-1 space-y-2 text-center md:text-left">
                  <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                    {companion.role}
                  </span>
                  <h3 className="text-xl font-extrabold text-white tracking-wide">{companion.name}</h3>
                  <p className="text-xs text-slate-400 font-serif italic">
                    "{companion.biography}"
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 space-y-1">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Personality Profile</span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{companion.personality}</p>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 space-y-1">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Vocal Resonance</span>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono italic">{companion.voice}</p>
                </div>
              </div>
              
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <LucideIcon name="Crown" size={12} className="text-amber-500" />
                    Evolutionary Stage Info
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">Stage {stageInfo.stage} / 5</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-serif italic">
                  {stageInfo.desc}
                </p>
                
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>STAGE REACHED</span>
                    <span>LEVEL {state.player?.level || 1}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-1000"
                      style={{ width: `${Math.min(100, ((state.player?.level || 1) / 50) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end pt-2 border-t border-slate-800/40">
                <button
                  onClick={() => {
                    sfx.playQuestComplete();
                    handleToggleFavorite();
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <LucideIcon name="Star" size={13} className={state.favoriteCompanionIds?.includes(equippedId) ? 'text-amber-400 fill-amber-400' : 'text-slate-400'} />
                  {state.favoriteCompanionIds?.includes(equippedId) ? 'Unfavorite' : 'Favorite'}
                </button>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-lg shadow-indigo-500/20"
                >
                  Dismiss Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. HOVER BUTTONS */}
      <div className="absolute top-12 -right-2 flex flex-col gap-1.5 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity duration-300 z-50 bg-slate-950/80 border border-slate-800 p-1 rounded-lg shadow-xl backdrop-blur-md no-drag">
        <button
          onClick={handleResize}
          className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
          title={`Cycle Size (Current: ${size.toUpperCase()})`}
        >
          <LucideIcon name="Maximize2" size={13} />
        </button>
        <button
          onClick={handleToggleFavorite}
          className={`p-1.5 hover:bg-slate-800 rounded transition-colors cursor-pointer ${state.favoriteCompanionIds?.includes(equippedId) ? 'text-amber-400' : 'text-slate-400 hover:text-white'}`}
          title="Toggle Favorite"
        >
          <LucideIcon name="Star" size={13} />
        </button>
        <button
          onClick={() => onUpdateState({ ...state, hideCompanion: true })}
          className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
          title="Hide Companion (Ctrl + H to reveal)"
        >
          <LucideIcon name="EyeOff" size={13} />
        </button>
      </div>

      {/* 5. TALK BUBBLE */}
      {bubbleVisible && bubbleText && (
        <div
          className="mb-4 max-w-[240px] md:max-w-[280px] bg-slate-950/95 border border-slate-800 p-3 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.5)] backdrop-blur-md relative animate-[fadeIn_0.3s_ease] text-left no-drag"
          style={{ borderLeftColor: companion.colorTheme.glow }}
        >
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-950 border-r border-b border-slate-800 rotate-45"></div>
          
          <div className="flex justify-between items-center mb-1 gap-4">
            <div className="flex flex-col">
              <span className="text-[9px] font-mono uppercase tracking-widest font-bold" style={{ color: companion.colorTheme.glow }}>
                {companion.name} ({emotion})
              </span>
              <span className="text-[8px] text-slate-400 font-sans tracking-wide mt-0.5">
                Stage {stageInfo.stage}: {stageInfo.title}
              </span>
            </div>
            <button
              onClick={() => setBubbleVisible(false)}
              className="text-slate-500 hover:text-white cursor-pointer self-start"
            >
              <LucideIcon name="X" size={10} />
            </button>
          </div>
          <p className={`${textSizes[size]} text-slate-200 leading-relaxed font-serif italic select-text mt-1.5`}>
            "{bubbleText}"
          </p>
        </div>
      )}

      {/* 6. CHARACTER GRAPHICS CARD */}
      <div className={`relative group transition-all duration-300 ${specialAnim === 'spin-once' ? 'animate-[spin-once_1s_ease-out]' : specialAnim === 'bounce-intense' ? 'animate-[bounce-intense_1s_ease-out]' : specialAnim === 'heartbeat-giant' ? 'animate-[heartbeat-giant_1s_ease-out]' : ''}`}>
        <div
          onClick={handleCompanionClick}
          className={`${sizeClasses[size]} relative flex items-center justify-center transition-transform hover:scale-[1.03] duration-300`}
        >
          {renderingMode === '3d' ? (
            renderCompanion3D()
          ) : renderingMode === 'sprite' ? (
            renderCompanionSprite()
          ) : (
            <>
              {renderCompanionVFX()}
              {renderCompanionVector()}
            </>
          )}
        </div>

        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-3 rounded-full opacity-60 blur-[1px] animate-[pulse_1.5s_infinite]"
          style={{
            background: `radial-gradient(ellipse at center, ${companion.colorTheme.glow}55 0%, transparent 70%)`
          }}
        ></div>
      </div>

      {/* Golden Quest Complete Particles */}
      {questCompleteParticles.map(p => (
        <span
          key={p.id}
          className="absolute w-1.5 h-1.5 rounded-full bg-amber-400 opacity-90 pointer-events-none animate-[float-up_1.8s_ease-out_infinite]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            filter: 'drop-shadow(0 0 4px #eab308)',
            animationDelay: `${Math.random() * 0.4}s`,
            animationDuration: `${1.2 + Math.random() * 1.0}s`,
            animationIterationCount: 1
          }}
        />
      ))}
    </div>
  );
};
