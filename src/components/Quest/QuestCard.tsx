/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Quest, Category } from '../../types/quest';
import { LucideIcon } from '../LucideIcon';
import { getDifficultyBorder, getDifficultyGlow } from '../../services/quest';
import { motion } from 'motion/react';
import { sfx } from '../../utils/audio';

interface QuestCardProps {
  quest: Quest;
  category: Category | undefined;
  onComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

interface SparkleParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
}

export const QuestCard: React.FC<QuestCardProps> = ({
  quest,
  category,
  onComplete,
  onEdit,
  onDelete,
}) => {
  const isBoss = quest.type === 'Boss';
  const isLegendary = quest.type === 'Legendary';
  const cardRef = useRef<HTMLDivElement>(null);

  const [particles, setParticles] = useState<SparkleParticle[]>([]);
  const [showGreenFlash, setShowGreenFlash] = useState(false);

  // Particle update animation loop
  useEffect(() => {
    if (particles.length === 0) return;

    let active = true;
    const updateParticles = () => {
      if (!active) return;
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.12, // gravity
            vx: p.vx * 0.97, // air drag
            opacity: p.opacity - 0.02,
          }))
          .filter((p) => p.opacity > 0)
      );
      if (active) {
        requestAnimationFrame(updateParticles);
      }
    };

    const frameId = requestAnimationFrame(updateParticles);
    return () => {
      active = false;
      cancelAnimationFrame(frameId);
    };
  }, [particles.length]);

  const handleCompleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    sfx.playQuestComplete();
    
    // Trigger quick full green border/bg flash
    setShowGreenFlash(true);
    setTimeout(() => setShowGreenFlash(false), 350);

    const buttonRect = e.currentTarget.getBoundingClientRect();
    const cardRect = cardRef.current?.getBoundingClientRect();

    if (cardRect) {
      // Calculate center of button relative to the card container
      const startX = buttonRect.left - cardRect.left + buttonRect.width / 2;
      const startY = buttonRect.top - cardRect.top + buttonRect.height / 2;

      // Spawn 25 celebration elements (Gold coins & Emerald sparks)
      const newParticles: SparkleParticle[] = Array.from({ length: 25 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2.5;
        const isGold = Math.random() < 0.45;
        
        return {
          id: Date.now() + i + Math.random(),
          x: startX,
          y: startY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5, // bias upwards
          size: Math.random() * 6 + 3,
          color: isGold ? '#fbbf24' : '#10b981', // Gold vs Emerald
          opacity: 1,
        };
      });

      setParticles(newParticles);
    }

    // Call state complete after showing initial explosion
    setTimeout(() => {
      onComplete();
    }, 350);
  };

  const borderClass = showGreenFlash
    ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] bg-emerald-950/10'
    : quest.completed
    ? 'bg-slate-950/20 border-slate-900 opacity-60'
    : getDifficultyBorder(quest.difficulty);

  return (
    <motion.div
      ref={cardRef}
      whileHover={quest.completed ? {} : { scale: 1.015, borderColor: 'rgba(59,130,246,0.25)', boxShadow: '0 10px 25px rgba(0,0,0,0.55)' }}
      transition={{ duration: 0.2 }}
      className={`group relative overflow-hidden border rounded-xl p-5 backdrop-blur-md flex flex-col justify-between transition-colors duration-300 ${borderClass}`}
    >
      {/* Celebration sparkles layer */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full pointer-events-none z-30"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 6px ${p.color}`,
            opacity: p.opacity,
          }}
        />
      ))}

      {/* Visual accents for Boss / Legendary */}
      {isBoss && !quest.completed && (
        <div className="absolute top-0 right-0 bg-red-600/15 border-b border-l border-red-800 text-[10px] text-red-400 font-bold px-2 py-0.5 rounded-bl font-mono animate-pulse">
          ⚠️ BOSS THREAT
        </div>
      )}
      {isLegendary && !quest.completed && (
        <div className="absolute top-0 right-0 bg-amber-600/15 border-b border-l border-amber-800 text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded-bl font-mono">
          ★ LEGENDARY
        </div>
      )}

      {/* Content */}
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <span
            className={`text-[10px] font-mono font-semibold uppercase tracking-widest ${
              isBoss ? 'text-red-400' : isLegendary ? 'text-amber-400' : 'text-blue-400'
            }`}
          >
            {quest.type} Contract
          </span>
          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {!quest.completed && (
              <button
                onClick={onEdit}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-900/60 transition-colors cursor-pointer"
                title="Forge modifications"
              >
                <LucideIcon name="Edit" size={12} />
              </button>
            )}
            <button
              onClick={onDelete}
              className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-900/60 transition-colors cursor-pointer"
              title="Forfeit contract"
            >
              <LucideIcon name="Trash" size={12} />
            </button>
          </div>
        </div>

        <div>
          <h3
            className={`text-sm font-bold tracking-tight ${
              quest.completed ? 'line-through text-slate-500' : 'text-slate-100'
            }`}
          >
            {quest.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{quest.description}</p>
        </div>

        {/* Quest Meta Links */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {category && (
            <span
              className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-${category.color}-950/40 border border-${category.color}-900/40 text-${category.color}-400`}
            >
              {category.name}
            </span>
          )}
          <span
            className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded border ${getDifficultyGlow(
              quest.difficulty
            )} bg-slate-950`}
          >
            RANK: {quest.difficulty.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Bottom line: complete button and rewards */}
      <div className="border-t border-slate-900/80 mt-5 pt-4 flex items-center justify-between">
        <div className="font-mono text-xs">
          <div className="text-blue-400 font-bold">+{quest.xpReward} XP</div>
          <div className="text-amber-400 font-bold">+{quest.coinsReward} Gold</div>
        </div>

        {quest.completed ? (
          <div className="text-xs font-mono text-emerald-500 font-bold flex items-center gap-1 bg-emerald-950/20 border border-emerald-900/40 px-2.5 py-1 rounded-lg">
            <LucideIcon name="CheckCircle" size={13} />
            SLAYED
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleCompleteClick}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
              isBoss
                ? 'bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800'
                : isLegendary
                ? 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800'
                : 'bg-blue-650 hover:bg-blue-600 text-white shadow-md'
            }`}
          >
            <LucideIcon name="Compass" size={13} />
            {isBoss ? 'Engage Raid' : 'Complete'}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default QuestCard;
