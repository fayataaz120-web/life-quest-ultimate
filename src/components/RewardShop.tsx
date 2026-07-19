/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShopItem, PlayerProfile } from '../types';
import { LucideIcon } from './LucideIcon';
import { sfx } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';


interface RewardShopProps {
  rewards: ShopItem[];
  player: PlayerProfile;
  onPurchaseReward: (id: string, cost: number) => void;
  onAddReward: (reward: Omit<ShopItem, 'id' | 'purchaseCount' | 'custom'>) => void;
  onUpdateReward: (id: string, updated: Partial<ShopItem>) => void;
  onDeleteReward: (id: string) => void;
}

export const RewardShop: React.FC<RewardShopProps> = ({
  rewards,
  player,
  onPurchaseReward,
  onAddReward,
  onUpdateReward,
  onDeleteReward,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReward, setNewReward] = useState({
    name: "",
    cost: 50,
    description: "",
    icon: "Gift"
  });

  const [editingReward, setEditingReward] = useState<ShopItem | null>(null);
  const [editRewardForm, setEditRewardForm] = useState({
    name: "",
    cost: 50,
    description: "",
    icon: "Gift"
  });


  const handlePurchase = (item: ShopItem) => {
    if (player.coins < item.cost) {
      alert(`Insufficient coins! You need ${item.cost} Gold, but currently hold only ${player.coins} Gold.`);
      return;
    }
    onPurchaseReward(item.id, item.cost);
    sfx.playCoin();
  };

  const handleCreateReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReward.name.trim()) return;

    onAddReward({
      name: newReward.name.trim(),
      cost: newReward.cost,
      description: newReward.description.trim(),
      icon: newReward.icon
    });

    setNewReward({
      name: "",
      cost: 50,
      description: "",
      icon: "Gift"
    });
    setShowAddModal(false);
    sfx.playSkillUnlock();
  };

  const handleOpenEditModal = (item: ShopItem) => {
    setEditingReward(item);
    setEditRewardForm({
      name: item.name,
      cost: item.cost,
      description: item.description,
      icon: item.icon
    });
  };

  const handleSaveReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReward || !editRewardForm.name.trim()) return;

    onUpdateReward(editingReward.id, {
      name: editRewardForm.name.trim(),
      cost: editRewardForm.cost,
      description: editRewardForm.description.trim(),
      icon: editRewardForm.icon
    });

    setEditingReward(null);
    sfx.playSkillUnlock();
  };


  return (
    <div className="space-y-6" id="reward-shop-container">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2 font-sans">
            <LucideIcon name="Store" className="text-amber-400" />
            Tavern Reward Shop
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Exchange your hard-earned gold coins to purchase real-life leisure activities, completely guilt-free. You earned this.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LucideIcon name="Plus" size={14} />
            Create Custom Reward
          </button>
          
          <div className="bg-slate-950 px-4 py-2 border border-slate-800 rounded-lg flex items-center gap-2 text-xs font-mono shrink-0">
            <LucideIcon name="Coins" className="text-amber-400" />
            <span>TREASURY: </span>
            <span className="text-amber-400 font-bold text-sm">{player.coins} Gold</span>
          </div>
        </div>
      </div>

      {/* REWARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((item) => (
          <div
            key={item.id}
            className="bg-slate-950/80 border border-slate-850 rounded-xl p-5 flex flex-col justify-between hover:border-slate-800 hover:bg-slate-950 transition-all group"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="p-2.5 bg-slate-900 border border-slate-800 text-blue-400 rounded-lg">
                  <LucideIcon name={item.icon} size={20} />
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-mono block">PURCHASE COUNT</span>
                  <span className="text-xs font-mono text-slate-300 font-semibold">{item.purchaseCount} times</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white flex items-center justify-between">
                  <span>{item.name}</span>
                  {item.custom && (
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity animate-none">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                        title="Forge modifications"
                      >
                        <LucideIcon name="Edit" size={12} />
                      </button>
                      <button
                        onClick={() => onDeleteReward(item.id)}
                        className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                        title="Erase custom incentive"
                      >
                        <LucideIcon name="Trash" size={12} />
                      </button>
                    </div>
                  )}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{item.description}</p>
              </div>
            </div>

            {/* Bottom cost and buy check */}
            <div className="border-t border-slate-900/80 mt-5 pt-4 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <LucideIcon name="Coins" size={14} className="text-amber-400" />
                <span className="text-sm font-bold text-amber-400 font-mono">{item.cost} Gold</span>
              </div>

              <button
                onClick={() => handlePurchase(item)}
                disabled={player.coins < item.cost}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${player.coins >= item.cost ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_8px_rgba(245,158,11,0.25)]' : 'bg-slate-900 text-slate-600 border border-slate-850 cursor-not-allowed'}`}
              >
                <LucideIcon name="ShoppingBag" size={13} />
                Acquire Reward
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE CUSTOM REWARD MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900 border border-blue-900/50 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl relative"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
              >
                <LucideIcon name="X" size={18} />
              </button>

              <div className="flex gap-3 items-center">
                <div className="p-2 bg-blue-950/40 border border-blue-900/40 rounded-lg text-blue-400">
                  <LucideIcon name="Store" size={20} />
                </div>
                <div>
                  <h3 className="text-md font-bold text-white font-sans">Create Guild Reward</h3>
                  <p className="text-xs text-slate-400">Design custom real-life items or actions you can unlock using your coins.</p>
                </div>
              </div>

              <form onSubmit={handleCreateReward} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">REWARD TITLE</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Eat 1 cup of Ice Cream, Sleep in on Sunday"
                    value={newReward.name}
                    onChange={(e) => setNewReward(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">INCENTIVE DESCRIPTION</label>
                  <textarea
                    required
                    placeholder="Specify details or bounds. Complete honesty is expected!"
                    value={newReward.description}
                    onChange={(e) => setNewReward(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none h-16 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono">COIN VALUE COST</label>
                    <input
                      type="number"
                      min={1}
                      value={newReward.cost}
                      onChange={(e) => setNewReward(prev => ({ ...prev, cost: Math.max(1, Number(e.target.value)) }))}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono">SECTOR ICON</label>
                    <select
                      value={newReward.icon}
                      onChange={(e) => setNewReward(prev => ({ ...prev, icon: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value="Gift">Gift Box</option>
                      <option value="Pizza">Pizza slice</option>
                      <option value="Gamepad2">Gamepad controller</option>
                      <option value="Book">Paperback book</option>
                      <option value="Tv">TV screen</option>
                      <option value="Coffee">Coffee cup</option>
                      <option value="Sparkles">Sparkles magic</option>
                      <option value="Dumbbell">Dumbbell gym</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md cursor-pointer"
                >
                  Inscribe Reward on Store Tapestry
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT CUSTOM REWARD MODAL */}
      <AnimatePresence>
        {editingReward && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900 border border-blue-900/50 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl relative"
            >
              <button
                onClick={() => { setEditingReward(null); }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
              >
                <LucideIcon name="X" size={18} />
              </button>

              <div className="flex gap-3 items-center">
                <div className="p-2 bg-blue-950/40 border border-blue-900/40 rounded-lg text-blue-400">
                  <LucideIcon name="Edit" size={20} />
                </div>
                <div>
                  <h3 className="text-md font-bold text-white font-sans">Forge Modifications: Store Reward</h3>
                  <p className="text-xs text-slate-400">Configure parameters of your custom shop incentive.</p>
                </div>
              </div>

              <form onSubmit={handleSaveReward} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">REWARD TITLE</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cheat Meal Pizza, Watch 1 Episode of Anime"
                    value={editRewardForm.name}
                    onChange={(e) => setEditRewardForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-mono">REWARD DESCRIPTION</label>
                  <textarea
                    required
                    placeholder="Summarise what physical or digital leisure this purchase permits..."
                    value={editRewardForm.description}
                    onChange={(e) => setEditRewardForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none h-16 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono">COIN VALUE COST</label>
                    <input
                      type="number"
                      min={1}
                      value={editRewardForm.cost}
                      onChange={(e) => setEditRewardForm(prev => ({ ...prev, cost: Math.max(1, Number(e.target.value)) }))}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono">SECTOR ICON</label>
                    <select
                      value={editRewardForm.icon}
                      onChange={(e) => setEditRewardForm(prev => ({ ...prev, icon: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value="Gift">Gift Box</option>
                      <option value="Pizza">Pizza slice</option>
                      <option value="Gamepad2">Gamepad controller</option>
                      <option value="Book">Paperback book</option>
                      <option value="Tv">TV screen</option>
                      <option value="Coffee">Coffee cup</option>
                      <option value="Sparkles">Sparkles magic</option>
                      <option value="Dumbbell">Dumbbell gym</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md cursor-pointer"
                >
                  Inscribe Modifications & Update Shop
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
