/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Companion } from '../../types';
import { LucideIcon } from '../LucideIcon';

interface CompanionCardProps {
  comp: Companion;
  isEquipped: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onEquip: () => void;
  onUnequip: () => void;
  onFavorite: () => void;
  onArchive: () => void;
}

export const CompanionCard: React.FC<CompanionCardProps> = ({
  comp,
  isEquipped,
  isFavorite,
  isArchived,
  isSelected,
  onSelect,
  onEquip,
  onUnequip,
  onFavorite,
  onArchive,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`border rounded-xl p-4 transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden ${
        isSelected
          ? 'bg-slate-900/60 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
          : 'bg-slate-900/20 border-slate-800/60 hover:bg-slate-900/35 hover:border-slate-700/50'
      }`}
    >
      {/* Upper Badges & actions */}
      <div className="flex justify-between items-start gap-2 mb-2 relative z-10">
        <div>
          <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
            {comp.name}
            {isFavorite && <LucideIcon name="Star" size={12} className="text-amber-400 fill-amber-400" />}
          </h3>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{comp.role}</span>
        </div>

        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite();
            }}
            className={`p-1 hover:bg-slate-800/80 rounded transition-colors cursor-pointer ${
              isFavorite ? 'text-amber-400' : 'text-slate-500 hover:text-white'
            }`}
          >
            <LucideIcon name="Star" size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onArchive();
            }}
            className={`p-1 hover:bg-slate-800/80 rounded transition-colors cursor-pointer ${
              isArchived ? 'text-blue-400' : 'text-slate-500 hover:text-white'
            }`}
            title={isArchived ? 'Unarchive' : 'Archive'}
          >
            <LucideIcon name={isArchived ? 'ArchiveRestore' : 'Archive'} size={12} />
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4 relative z-10">{comp.biography}</p>

      {/* Lower Status Info */}
      <div className="flex justify-between items-center border-t border-slate-800/50 pt-3 mt-auto relative z-10">
        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          {comp.personality.split(' ')[0] || 'Active'}
        </span>

        {isEquipped ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUnequip();
            }}
            className="px-3 py-1 bg-red-950/40 border border-red-900/60 hover:bg-red-900/30 text-red-400 rounded text-[10px] font-bold transition-all cursor-pointer"
          >
            Unequip
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEquip();
            }}
            className="px-3 py-1 bg-blue-950/60 border border-blue-900/60 hover:bg-blue-900/40 text-blue-400 rounded text-[10px] font-bold transition-all cursor-pointer"
          >
            Equip
          </button>
        )}
      </div>

      {/* Holographic glowing back line */}
      {isEquipped && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-transparent pointer-events-none rounded-bl-full animate-pulse"></div>
      )}
    </div>
  );
};
export default CompanionCard;
