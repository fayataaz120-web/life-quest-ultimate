/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { AppState } from '../types';
import { Mission, DailyNote, DailyJournal, CalendarCell } from '../types/calendar';
import { LucideIcon } from '../components/LucideIcon';
import { sfx } from '../utils/audio';
import { DEFAULT_COMPANIONS } from '../data/companions';
import {
  getCalendarCells,
  loadScheduledQuests,
  saveScheduledQuests,
  calculateQuestRewards,
} from '../services/calendar';
import { dispatchNotification } from '../services/NotificationService';

// MCC Sub Components
import { CalendarSearch } from '../components/Calendar/CalendarSearch';
import { CalendarFilters } from '../components/Calendar/CalendarFilters';
import { DayPanel } from '../components/Calendar/DayPanel';
import { MissionEditor } from '../components/Calendar/MissionEditor';
import { Heatmap } from '../components/Calendar/Heatmap';
import { MissionStatistics } from '../components/Calendar/MissionStatistics';

interface CalendarProps {
  state: AppState;
  onUpdateState: (state: AppState) => void;
}

type CalendarView = 'Month' | 'Week' | 'Day' | 'Year';

export const Calendar: React.FC<CalendarProps> = ({ state, onUpdateState }) => {
  const [currentView, setCurrentView] = useState<CalendarView>('Month');
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  
  // Modal Editors Toggles
  const [showAddModal, setShowAddModal] = useState(false);
  const [missionToEdit, setMissionToEdit] = useState<Mission | undefined>(undefined);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Load Missions (which supersets scheduled quests)
  const [missions, setMissions] = useState<Record<string, Mission[]>>(() => {
    return loadScheduledQuests() as Record<string, Mission[]>;
  });

  // Load Daily Notes Map
  const [notesMap, setNotesMap] = useState<Record<string, DailyNote>>(() => {
    try {
      const saved = localStorage.getItem('life_quest_daily_note_map');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Load Daily Journals Map
  const [journalsMap, setJournalsMap] = useState<Record<string, DailyJournal>>(() => {
    try {
      const saved = localStorage.getItem('life_quest_daily_journal_map');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const todayStr = new Date().toISOString().split('T')[0];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // PERSISTENCE ACTIONS
  const saveNotesMap = (updated: Record<string, DailyNote>) => {
    setNotesMap(updated);
    localStorage.setItem('life_quest_daily_note_map', JSON.stringify(updated));
  };

  const saveJournalsMap = (updated: Record<string, DailyJournal>) => {
    setJournalsMap(updated);
    localStorage.setItem('life_quest_daily_journal_map', JSON.stringify(updated));
  };

  // NAVIGATION METHODS
  const handlePrev = () => {
    sfx.playClick();
    if (currentView === 'Month') {
      setViewDate(new Date(year, month - 1, 1));
    } else if (currentView === 'Week') {
      const d = new Date(viewDate);
      d.setDate(d.getDate() - 7);
      setViewDate(d);
    } else if (currentView === 'Day') {
      const d = new Date(viewDate);
      d.setDate(d.getDate() - 1);
      setViewDate(d);
    } else {
      setViewDate(new Date(year - 1, 0, 1));
    }
  };

  const handleNext = () => {
    sfx.playClick();
    if (currentView === 'Month') {
      setViewDate(new Date(year, month + 1, 1));
    } else if (currentView === 'Week') {
      const d = new Date(viewDate);
      d.setDate(d.getDate() + 7);
      setViewDate(d);
    } else if (currentView === 'Day') {
      const d = new Date(viewDate);
      d.setDate(d.getDate() + 1);
      setViewDate(d);
    } else {
      setViewDate(new Date(year + 1, 0, 1));
    }
  };

  const handleToday = () => {
    sfx.playClick();
    setViewDate(new Date());
    setSelectedDateStr(todayStr);
  };

  const handleCellClick = (dateStr: string) => {
    sfx.playSkillUnlock();
    setSelectedDateStr(dateStr);
  };

  // MISSION MANIPULATIONS
  const handleAddMissionSubmit = (newMission: Mission) => {
    if (!selectedDateStr) return;

    const dayMissions = missions[selectedDateStr] || [];
    // Remove if editing
    const filtered = dayMissions.filter((m) => m.id !== newMission.id);
    const updated = {
      ...missions,
      [selectedDateStr]: [...filtered, newMission],
    };

    setMissions(updated);
    saveScheduledQuests(updated);
    setShowAddModal(false);
    setMissionToEdit(undefined);

    dispatchNotification(
      'Mission Inscribed',
      `Sovereign contract "${newMission.name}" has been registered for planning.`,
      'Calendar'
    );
  };

  const handleCompleteMission = (missionId: string) => {
    if (!selectedDateStr) return;

    const dayMissions = missions[selectedDateStr] || [];
    const target = dayMissions.find((m) => m.id === missionId);
    if (!target || target.completed) return;

    // 1. Mark completed
    const updatedMissions = dayMissions.map((m) =>
      m.id === missionId ? { ...m, completed: true, status: 'Completed' as const, progress: 100 } : m
    );
    const updatedRecord = {
      ...missions,
      [selectedDateStr]: updatedMissions,
    };
    setMissions(updatedRecord);
    saveScheduledQuests(updatedRecord);

    // 2. Claim rewards
    const categoryMultiplier = state.categories.find((c) => c.id === target.categoryId)?.xpMultiplier || 1.0;
    const { xp: finalXp, coins: coinsReward } = calculateQuestRewards(target.difficulty, categoryMultiplier);

    const historyEntryIdx = state.history.findIndex((h) => h.date === selectedDateStr);
    const updatedHistory = [...state.history];
    if (historyEntryIdx >= 0) {
      updatedHistory[historyEntryIdx] = {
        ...updatedHistory[historyEntryIdx],
        xpGained: updatedHistory[historyEntryIdx].xpGained + finalXp,
        coinsGained: updatedHistory[historyEntryIdx].coinsGained + coinsReward,
        completedCount: updatedHistory[historyEntryIdx].completedCount + 1,
      };
    } else {
      updatedHistory.push({
        date: selectedDateStr,
        xpGained: finalXp,
        coinsGained: coinsReward,
        completedCount: 1,
      });
    }

    let nextLvl = state.player.level;
    let nextXp = state.player.xp + finalXp;
    let reqXp = state.player.xpToNextLevel;

    while (nextXp >= reqXp) {
      nextXp -= reqXp;
      nextLvl++;
      reqXp = 200 + 50 * nextLvl;
    }

    onUpdateState({
      ...state,
      player: {
        ...state.player,
        level: nextLvl,
        xp: nextXp,
        xpToNextLevel: reqXp,
        coins: state.player.coins + coinsReward,
      },
      lifetimeXp: state.lifetimeXp + finalXp,
      lifetimeCoins: state.lifetimeCoins + coinsReward,
      history: updatedHistory,
    });

    sfx.playLevelUp();

    dispatchNotification(
      'Mission Accomplished!',
      `Slayed: "${target.name}". Claimed +${finalXp} XP and +${coinsReward} Gold.`,
      'Quests',
      'High'
    );
  };

  const handleDeleteMission = (missionId: string) => {
    if (!selectedDateStr) return;

    const dayMissions = missions[selectedDateStr] || [];
    const updatedMissions = dayMissions.filter((m) => m.id !== missionId);

    const updated = { ...missions };
    if (updatedMissions.length > 0) {
      updated[selectedDateStr] = updatedMissions;
    } else {
      delete updated[selectedDateStr];
    }

    setMissions(updated);
    saveScheduledQuests(updated);
    sfx.playClick();
  };

  const handleEditMissionTrigger = (m: Mission) => {
    setMissionToEdit(m);
    setShowAddModal(true);
  };

  // NOTE & JOURNAL UPDATE HANDLERS
  const handleSaveNote = (date: string, noteData: DailyNote) => {
    const updated = {
      ...notesMap,
      [date]: noteData,
    };
    saveNotesMap(updated);
  };

  const handleSaveJournal = (date: string, journalData: DailyJournal) => {
    const updated = {
      ...journalsMap,
      [date]: journalData,
    };
    saveJournalsMap(updated);
  };

  // CELL HIGHLIGHT DOT INDICATORS
  const getCellIndicators = (dateStr: string) => {
    const list = missions[dateStr] || [];
    const hasNote = !!notesMap[dateStr];
    const hasJournal = !!journalsMap[dateStr];
    const historyEntry = state.history.find((h) => h.date === dateStr);

    const dots: { color: string; label: string }[] = [];

    // Green = Completed
    if (list.length > 0 && list.every((m) => m.completed)) {
      dots.push({ color: 'bg-emerald-400 shadow-[0_0_6px_#10b981]', label: 'Completed Quests' });
    }
    // Red = Missed (past days with uncompleted)
    else if (dateStr < todayStr && list.length > 0 && list.some((m) => !m.completed)) {
      dots.push({ color: 'bg-rose-500 shadow-[0_0_6px_#f43f5e]', label: 'Missed Quests' });
    }
    // Blue = Events / Notes logged
    if (hasNote || hasJournal) {
      dots.push({ color: 'bg-blue-400 shadow-[0_0_6px_#3b82f6]', label: 'Notes Logged' });
    }
    // Gold = Legendary
    if (list.some((m) => m.priority === 'Legendary')) {
      dots.push({ color: 'bg-amber-400 shadow-[0_0_6px_#f59e0b]', label: 'Legendary Target' });
    }
    // Purple = Achievements
    if ((historyEntry?.xpGained || 0) >= 120) {
      dots.push({ color: 'bg-purple-400 shadow-[0_0_6px_#a855f7]', label: 'Achievement Day' });
    }

    return dots;
  };

  // GRID RENDER BUILDERS
  const cells = getCalendarCells(year, month);

  // Filters scan
  const matchesFilters = (m: Mission) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ?? false) ||
      (m.location?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory = filterCategory === 'All' || m.categoryId === filterCategory;
    const matchesPriority = filterPriority === 'All' || m.priority === filterPriority;
    const matchesDifficulty = filterDifficulty === 'All' || m.difficulty === filterDifficulty;
    
    let matchesStatus = true;
    if (filterStatus !== 'All') {
      if (filterStatus === 'Completed') matchesStatus = m.completed;
      else if (filterStatus === 'Not Started') matchesStatus = !m.completed && m.status === 'Not Started';
      else matchesStatus = m.status === filterStatus;
    }

    return matchesSearch && matchesCategory && matchesPriority && matchesDifficulty && matchesStatus;
  };

  const getFilteredMissionsForDate = (dateStr: string) => {
    return (missions[dateStr] || []).filter(matchesFilters);
  };

  // WEEK VIEW CELLS
  const getWeekCells = (): CalendarCell[] => {
    const current = new Date(viewDate);
    const dayOfWeek = current.getDay(); // 0-6
    const startOfWeek = new Date(current);
    startOfWeek.setDate(current.getDate() - dayOfWeek);

    const weekCells: CalendarCell[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const str = d.toISOString().split('T')[0];
      weekCells.push({
        dateStr: str,
        dayNum: d.getDate(),
        isCurrentMonth: d.getMonth() === month,
      });
    }
    return weekCells;
  };

  return (
    <div className="space-y-6">
      
      {/* 1. CONTROL HUB HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-md">
        <div className="space-y-1">
          <h1 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <LucideIcon name="ShieldAlert" className="text-emerald-400" size={20} />
            Mission Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Plot primary life missions, construct notes ledgers, and track study consistency.
          </p>
        </div>

        {/* Filters and Search options toggles */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Toggle tabs */}
          <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-xl font-mono text-[10px] font-bold uppercase">
            {(['Month', 'Week', 'Day', 'Year'] as CalendarView[]).map((v) => (
              <button
                key={v}
                onClick={() => { sfx.playClick(); setCurrentView(v); }}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  currentView === v ? 'bg-slate-900 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              className="p-2 bg-slate-950 border border-slate-800 rounded-xl hover:bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <LucideIcon name="ChevronLeft" size={14} />
            </button>
            
            <span className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 min-w-[120px] text-center font-mono">
              {currentView === 'Month' && `${monthNames[month]} ${year}`}
              {currentView === 'Week' && `Week of ${getWeekCells()[0].dateStr}`}
              {currentView === 'Day' && `${viewDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
              {currentView === 'Year' && `${year}`}
            </span>

            <button
              onClick={handleNext}
              className="p-2 bg-slate-950 border border-slate-800 rounded-xl hover:bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <LucideIcon name="ChevronRight" size={14} />
            </button>

            <button
              onClick={handleToday}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl hover:bg-slate-900 text-xs font-mono font-bold text-slate-350 cursor-pointer"
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & FILTER CONTROLS BAR */}
      <div className="bg-slate-900/20 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-md space-y-3">
        <CalendarSearch
          query={searchQuery}
          onQueryChange={setSearchQuery}
          selectedCategory={filterCategory}
          onCategoryChange={setFilterCategory}
          categories={state.categories}
        />
        <CalendarFilters
          selectedPriority={filterPriority}
          onPriorityChange={setFilterPriority}
          selectedDifficulty={filterDifficulty}
          onDifficultyChange={setFilterDifficulty}
          selectedStatus={filterStatus}
          onStatusChange={setFilterStatus}
        />
      </div>

      {/* 3. CORE CALENDAR GRIDS */}
      
      {/* A. MONTH VIEW */}
      {currentView === 'Month' && (
        <div className="bg-slate-950/80 border border-slate-900 rounded-3xl p-4 md:p-5 shadow-2xl">
          <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 text-center text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 md:gap-2 min-h-[350px]">
            {cells.map((cell, idx) => {
              const list = getFilteredMissionsForDate(cell.dateStr);
              const indicators = getCellIndicators(cell.dateStr);
              
              const isToday = cell.dateStr === todayStr;
              const isSelected = cell.dateStr === selectedDateStr;

              return (
                <div
                  key={idx}
                  onClick={() => handleCellClick(cell.dateStr)}
                  className={`relative flex flex-col justify-between p-2 min-h-[65px] md:min-h-[85px] rounded-xl border transition-all duration-200 cursor-pointer bg-slate-900/30 hover:bg-slate-800/50 border-slate-900/40 text-slate-400 ${
                    !cell.isCurrentMonth ? 'opacity-30' : ''
                  } ${isToday ? 'ring-2 ring-indigo-500 border-indigo-500' : ''} ${
                    isSelected ? 'ring-2 ring-emerald-500 border-emerald-500' : ''
                  }`}
                >
                  <span className={`text-[10px] font-mono font-bold ${isToday ? 'text-indigo-400' : 'text-slate-350'}`}>
                    {cell.dayNum}
                  </span>

                  {/* Indicators Row */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {indicators.map((dot, dIdx) => (
                      <div
                        key={dIdx}
                        className={`w-1.5 h-1.5 rounded-full ${dot.color}`}
                        title={dot.label}
                      />
                    ))}
                  </div>

                  {/* Tasks count inside cell */}
                  {list.length > 0 && (
                    <div className="text-[8px] font-mono text-slate-500 text-left mt-1.5 font-bold">
                      {list.filter((m) => m.completed).length}/{list.length} Clear
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* B. WEEK VIEW */}
      {currentView === 'Week' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {getWeekCells().map((cell, idx) => {
            const list = getFilteredMissionsForDate(cell.dateStr);
            const isToday = cell.dateStr === todayStr;
            
            return (
              <div
                key={idx}
                onClick={() => handleCellClick(cell.dateStr)}
                className={`bg-slate-900/30 border p-4 rounded-2xl flex flex-col gap-3 min-h-[220px] cursor-pointer hover:border-slate-700 transition-colors ${
                  isToday ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-slate-800'
                }`}
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-800 font-mono">
                  <span className={`text-xs font-black ${isToday ? 'text-indigo-400' : 'text-slate-300'}`}>
                    {new Date(cell.dateStr + 'T00:00:00Z').toLocaleDateString(undefined, { weekday: 'short' })}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">{cell.dayNum}</span>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto scrollbar-none">
                  {list.length === 0 ? (
                    <span className="text-[9px] text-slate-600 italic block pt-4 text-center">No contracts</span>
                  ) : (
                    list.map((m) => (
                      <div
                        key={m.id}
                        className={`p-1.5 rounded bg-slate-950 border text-[9px] truncate font-sans font-semibold ${
                          m.completed ? 'border-emerald-500/20 text-emerald-400 bg-emerald-950/5' : 'border-slate-900 text-slate-300'
                        }`}
                      >
                        {m.name}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* C. DAY VIEW */}
      {currentView === 'Day' && (
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl text-center space-y-4 max-w-md mx-auto">
          <LucideIcon name="ShieldAlert" size={36} className="text-emerald-400 mx-auto" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Centered Day Portal</h3>
          <p className="text-xs text-slate-400">
            Currently viewing schedules for: {viewDate.toLocaleDateString(undefined, { dateStyle: 'long' })}
          </p>
          <button
            onClick={() => handleCellClick(viewDate.toISOString().split('T')[0])}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-mono font-bold uppercase rounded-xl cursor-pointer"
          >
            Launch Operations Desk
          </button>
        </div>
      )}

      {/* D. YEAR VIEW */}
      {currentView === 'Year' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {monthNames.map((name, mIdx) => (
            <div
              key={name}
              onClick={() => {
                sfx.playClick();
                setViewDate(new Date(year, mIdx, 1));
                setCurrentView('Month');
              }}
              className="p-3 bg-slate-900/20 border border-slate-800/80 rounded-xl hover:border-slate-600 transition-colors cursor-pointer space-y-2"
            >
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-wide border-b border-slate-900 pb-1">
                {name}
              </h4>
              <div className="grid grid-cols-7 gap-1">
                {/* Render tiny blocks representing days */}
                {Array.from({ length: new Date(year, mIdx + 1, 0).getDate() }).map((_, dIdx) => {
                  const dateStr = `${year}-${String(mIdx + 1).padStart(2, '0')}-${String(dIdx + 1).padStart(2, '0')}`;
                  const hasMissions = (missions[dateStr] || []).length > 0;
                  return (
                    <div
                      key={dIdx}
                      className={`w-[6px] h-[6px] rounded-[1px] ${
                        hasMissions ? 'bg-emerald-500' : 'bg-slate-900/40'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. STATISTICS SUMMARY */}
      <MissionStatistics state={state} missions={missions} />

      {/* 5. CONSISTENCY HEATMAP */}
      <Heatmap
        state={state}
        missions={missions}
        onSelectDate={(date) => {
          setViewDate(new Date(date));
          setSelectedDateStr(date);
        }}
      />

      {/* 6. DAY WORKSPACE DRAWERS */}
      <AnimatePresence>
        {selectedDateStr && (
          <DayPanel
            dateStr={selectedDateStr}
            state={state}
            categories={state.categories}
            missions={missions[selectedDateStr] || []}
            note={notesMap[selectedDateStr]}
            journal={journalsMap[selectedDateStr]}
            streak={state.player.currentStreak}
            journeyDay={1 + Math.max(0, Math.floor((new Date(selectedDateStr).getTime() - new Date().getTime()) / 86400000))}
            onClose={() => setSelectedDateStr(null)}
            onPlanQuestClick={() => { setMissionToEdit(undefined); setShowAddModal(true); }}
            onCompleteQuest={handleCompleteMission}
            onDeleteQuest={handleDeleteMission}
            onEditQuest={handleEditMissionTrigger}
            onSaveNote={handleSaveNote}
            onSaveJournal={handleSaveJournal}
          />
        )}
      </AnimatePresence>

      {/* 7. MISSION EDITORS MODALS */}
      {showAddModal && selectedDateStr && (
        <MissionEditor
          categories={state.categories}
          initialDateStr={selectedDateStr}
          missionToEdit={missionToEdit}
          onSubmit={handleAddMissionSubmit}
          onClose={() => { setShowAddModal(false); setMissionToEdit(undefined); }}
        />
      )}

    </div>
  );
};
export default Calendar;
