/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { AppState } from '../types';
import { LucideIcon } from './LucideIcon';
import { sfx } from '../utils/audio';

interface ExcelSyncProps {
  state: AppState;
  onImportState: (imported: AppState) => void;
  onResetState: () => void;
  onUpdateState: (state: AppState) => void;
}

export const ExcelSync: React.FC<ExcelSyncProps> = ({
  state,
  onImportState,
  onResetState,
  onUpdateState,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  // 1. Export as Unified JSON backup
  const handleExportJSON = () => {
    try {
      const dataStr = JSON.stringify(state, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `life_quest_ultimate_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      sfx.playCoin();
    } catch (e) {
      alert("JSON Export failed: " + e);
    }
  };

  // 2. Export Activities to Excel CSV
  const handleExportActivitiesCSV = () => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      // Header
      csvContent += "Activity Name,Category,Difficulty,Priority,Frequency,XP Reward,Coins Reward,Completed Times,Target Count,Notes,Started Date\n";
      
      state.activities.forEach(act => {
        const catName = state.categories.find(c => c.id === act.categoryId)?.name || act.categoryId;
        const row = [
          `"${act.name.replace(/"/g, '""')}"`,
          `"${catName}"`,
          `"${act.difficulty}"`,
          `"${act.priority}"`,
          `"${act.frequency}"`,
          act.xpReward,
          act.coinsReward,
          act.completedTimes,
          act.targetCount,
          `"${act.notes.replace(/"/g, '""')}"`,
          act.startedDate
        ].join(",");
        csvContent += row + "\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `life_quest_activities_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      sfx.playCoin();
    } catch (e) {
      alert("CSV Export failed: " + e);
    }
  };

  // 3. Handle JSON file import
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        // Basic schema checks
        if (imported.player && imported.categories && imported.activities && imported.quests) {
          onImportState(imported);
          sfx.playLevelUp();
          alert("Guild database synchronized! Your RPG state has been successfully loaded.");
        } else {
          alert("Invalid backup file! The JSON is missing required player profile or activities parameters.");
        }
      } catch (err) {
        alert("File parsing failed. Please check if the backup file is clean and unaltered: " + err);
      }
    };
    reader.readAsText(file);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(label);
    sfx.playCoin();
    setTimeout(() => setCopiedScript(null), 2000);
  };

  // VBA Code block to show
  const VBA_CODE = `Attribute VB_Name = "LifeQuestCore"
' Life Quest Ultimate - Excel Automation Core Engine
' Replicates XP accruals, Level ups, and Streaks on completed rows

Public Sub CompleteTask_Click()
    Dim wsProfile As Worksheet, wsActivities As Worksheet
    Dim curRow As Long, currentXP As Long, xpNeeded As Long, currentCoins As Long
    Dim xpReward As Long, coinsReward As Long, currentLvl As Long
    
    Set wsProfile = ThisWorkbook.Sheets("PlayerProfile")
    Set wsActivities = ThisWorkbook.Sheets("Activities")
    
    curRow = ActiveCell.Row
    If wsActivities.Cells(curRow, 1).Value = "" Then
        MsgBox "Select a valid activity row first!", vbExclamation, "No Task Found"
        Exit Sub
    End If
    
    ' Extract activity values
    xpReward = wsActivities.Cells(curRow, 6).Value ' XP column
    coinsReward = wsActivities.Cells(curRow, 7).Value ' Coins column
    
    ' Update activity clears
    wsActivities.Cells(curRow, 8).Value = wsActivities.Cells(curRow, 8).Value + 1 ' Cleared counter
    
    ' Retrieve Profile values
    currentLvl = wsProfile.Range("B3").Value ' Level
    currentXP = wsProfile.Range("B4").Value  ' XP
    xpNeeded = wsProfile.Range("B5").Value   ' XP to Next
    currentCoins = wsProfile.Range("B6").Value ' Coins
    
    ' Add rewards
    currentXP = currentXP + xpReward
    currentCoins = currentCoins + coinsReward
    
    ' Handle Level Up trigger
    Do While currentXP >= xpNeeded
        currentXP = currentXP - xpNeeded
        currentLvl = currentLvl + 1
        xpNeeded = currentLvl * 250 ' Progressive limit scaling
        MsgBox "LEVEL UP! You ascended to Level " & currentLvl & "!", vbInformation, "Ascension Triggered"
    Loop
    
    ' Write back profile stats
    wsProfile.Range("B3").Value = currentLvl
    wsProfile.Range("B4").Value = currentXP
    wsProfile.Range("B5").Value = xpNeeded
    wsProfile.Range("B6").Value = currentCoins
    
    MsgBox "Task '" & wsActivities.Cells(curRow, 1).Value & "' complete! Earned " & xpReward & " XP & " & coinsReward & " Gold.", vbOKOnly, "Chronicle Updated"
End Sub`;

  const OFFICESCRIPTS_CODE = `function main(workbook: ExcelScript.Workbook) {
  let profileSheet = workbook.getSheet("PlayerProfile");
  let actSheet = workbook.getSheet("Activities");
  let selectedRange = workbook.getActiveCell();
  let row = selectedRange.getRowIndex();
  
  // Verify row index
  if (row === 0) { return; } 
  
  let actName = actSheet.getCell(row, 0).getValue() as string;
  let xpReward = actSheet.getCell(row, 5).getValue() as number;
  let coinsReward = actSheet.getCell(row, 6).getValue() as number;
  
  if (!actName) { return; }
  
  // Increment completed clear count
  let clears = actSheet.getCell(row, 7).getValue() as number;
  actSheet.getCell(row, 7).setValue(clears + 1);
  
  // Update Profile parameters
  let levelCell = profileSheet.getRange("B3");
  let xpCell = profileSheet.getRange("B4");
  let xpToNextCell = profileSheet.getRange("B5");
  let coinsCell = profileSheet.getRange("B6");
  
  let currentLvl = levelCell.getValue() as number;
  let currentXp = xpCell.getValue() as number;
  let xpToNext = xpToNextCell.getValue() as number;
  let currentCoins = coinsCell.getValue() as number;
  
  currentXp += xpReward;
  currentCoins += coinsReward;
  
  if (currentXp >= xpToNext) {
    currentXp -= xpToNext;
    currentLvl += 1;
    xpToNext = currentLvl * 250;
    
    levelCell.setValue(currentLvl);
    xpToNextCell.setValue(xpToNext);
  }
  
  xpCell.setValue(currentXp);
  coinsCell.setValue(currentCoins);
}`;

  return (
    <div className="space-y-6" id="excel-sync-container">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <LucideIcon name="Settings" className="text-emerald-400" />
            System Settings & Excel Integration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Customize core RPG mechanics, toggle Journey Decay stats, or synchronize your live database progress directly into offline spreadsheet pipelines.
          </p>
        </div>
      </div>

      {/* JOURNEY DECAY & SYSTEM SETTINGS PANEL */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 backdrop-blur-md space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <LucideIcon name="Flame" className="text-amber-500 animate-pulse" />
              Temporal Inactivity Penalty (Journey Decay)
            </h2>
            <p className="text-xs text-slate-400">
              Encourage consistency by penalizing idle time. If you do not open the quest book daily, your XP and Gold slowly drain.
            </p>
          </div>
          
          {/* TOGGLE BUTTON */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono font-bold">
              {state.decayEnabled ? (
                <span className="text-amber-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                  DECAY ACTIVE
                </span>
              ) : (
                <span className="text-slate-500">DECAY DISABLED</span>
              )}
            </span>
            <button
              onClick={() => {
                sfx.playSkillUnlock();
                onUpdateState({
                  ...state,
                  decayEnabled: !state.decayEnabled,
                });
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                state.decayEnabled ? 'bg-amber-500' : 'bg-slate-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  state.decayEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* DIFFICULTY SELECTOR */}
        {state.decayEnabled && (
          <div className="space-y-4 pt-4 border-t border-slate-800/60 animate-fadeIn">
            <label className="text-[10px] font-bold text-slate-300 font-mono block uppercase tracking-wider">
              Select Temporal Rift Intensity (Decay Difficulty)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  id: 'Easy' as const,
                  title: 'Easy Mode',
                  xp: '5 XP',
                  coins: '1 Coin',
                  desc: 'Mild decay rate. Minimal impact for relaxing adventurers.',
                  color: 'border-emerald-500/30 hover:border-emerald-500/70',
                  activeBg: 'bg-emerald-950/20 border-emerald-500 text-emerald-400',
                  textColor: 'text-emerald-400'
                },
                {
                  id: 'Normal' as const,
                  title: 'Normal Mode',
                  xp: '15 XP',
                  coins: '5 Coins',
                  desc: 'Standard rift. Perfect balance to keep you honest.',
                  color: 'border-blue-500/30 hover:border-blue-500/70',
                  activeBg: 'bg-blue-950/20 border-blue-500 text-blue-400',
                  textColor: 'text-blue-400'
                },
                {
                  id: 'Hard' as const,
                  title: 'Hard Mode',
                  xp: '35 XP',
                  coins: '15 Coins',
                  desc: 'Severe stasis. Large penalties for highly dedicated keepers.',
                  color: 'border-purple-500/30 hover:border-purple-500/70',
                  activeBg: 'bg-purple-950/20 border-purple-500 text-purple-400',
                  textColor: 'text-purple-400'
                },
                {
                  id: 'Legend' as const,
                  title: 'Legend Mode',
                  xp: '75 XP',
                  coins: '35 Coins',
                  desc: 'Chronos curse. Catastrophic penalties. Dedication is your only shield.',
                  color: 'border-red-500/30 hover:border-red-500/70',
                  activeBg: 'bg-red-950/20 border-red-500 text-red-400',
                  textColor: 'text-red-400'
                }
              ].map((diff) => {
                const isActive = (state.decayDifficulty || 'Normal') === diff.id;
                return (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => {
                      sfx.playCoin();
                      onUpdateState({
                        ...state,
                        decayDifficulty: diff.id,
                      });
                    }}
                    className={`text-left p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                      isActive ? diff.activeBg : `bg-slate-950/40 ${diff.color} text-slate-400`
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold font-mono tracking-wide">{diff.title}</span>
                      {isActive && <LucideIcon name="CheckCircle" size={14} />}
                    </div>
                    <div className="flex gap-2 items-center text-[10px] font-mono mt-1 mb-2">
                      <span className="px-1.5 py-0.5 bg-slate-900/80 rounded border border-slate-800 text-slate-300">
                        -{diff.xp}/day
                      </span>
                      <span className="px-1.5 py-0.5 bg-slate-900/80 rounded border border-slate-800 text-slate-300">
                        -{diff.coins}/day
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">{diff.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ADDITIONAL SYSTEM CONFIG: CHRONICLES MAIN GOAL */}
        <div className="pt-4 border-t border-slate-800/60 space-y-3">
          <label className="text-[10px] font-bold text-slate-300 font-mono block uppercase tracking-wider">
            Chronicle Main Journey Goal
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={state.mainGoal || ''}
              onChange={(e) => {
                onUpdateState({
                  ...state,
                  mainGoal: e.target.value
                });
              }}
              placeholder="E.g., To initiate a legendary legacy of absolute focus."
              className="flex-1 bg-slate-950/80 border border-slate-800 text-slate-200 text-xs px-3.5 py-2 rounded-xl focus:outline-none focus:border-blue-500/60 font-sans"
            />
            <button
              onClick={() => {
                sfx.playLevelUp();
                alert("Main goal updated inside your starlight coordinates!");
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold cursor-pointer border border-slate-750 transition-colors"
            >
              Save Goal
            </button>
          </div>
        </div>
      </div>

      {/* THREE PANEL ACTIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* EXPORT / IMPORT CONTROLS (Left Panel) */}
        <div className="bg-slate-950/80 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex gap-2.5 items-center">
              <div className="p-2 bg-emerald-950/40 border border-emerald-900/40 rounded-lg text-emerald-400">
                <LucideIcon name="Download" size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-100 font-sans">Guild State Operations</h3>
            </div>

            <p className="text-xs text-slate-400 leading-normal">
              Keep offline copies of your progress logs. Use CSV formats to import directly into Excel or Google Sheets for private audits and custom charts.
            </p>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleExportActivitiesCSV}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white rounded-lg text-xs font-semibold font-mono transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LucideIcon name="FileSpreadsheet" size={14} className="text-emerald-400" />
                Export Activities as Excel CSV
              </button>

              <button
                onClick={handleExportJSON}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white rounded-lg text-xs font-semibold font-mono transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LucideIcon name="Download" size={14} className="text-blue-400" />
                Download Unified JSON Backup
              </button>
            </div>

            <div className="border-t border-slate-900 pt-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 font-mono">SYNCHRONIZE / IMPORT BACKUP</h4>
              <p className="text-[11px] text-slate-500">Upload a previously exported JSON backup file to overwrite current local storage state.</p>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportJSON}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 bg-blue-900/40 hover:bg-blue-900/60 border border-blue-800/60 text-blue-300 hover:text-white rounded-lg text-xs font-semibold font-mono transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LucideIcon name="Upload" size={14} />
                Upload JSON Archive
              </button>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-4 flex justify-between items-center text-[10px] text-slate-600 font-mono">
            <span>Local Storage Active</span>
            <button
              onClick={() => {
                if (confirm("WARNING: This will permanently delete your Quest logs and reset to the default adventurer! Continue?")) {
                  onResetState();
                }
              }}
              className="text-red-500/70 hover:text-red-400"
            >
              Reset Database
            </button>
          </div>
        </div>

        {/* BLUEPRINT FORMULA SPECIFICATION (Center Panel) */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl backdrop-blur-md space-y-5">
          <div className="flex gap-2.5 items-center">
            <div className="p-2 bg-blue-950/40 border border-blue-900/40 rounded-lg text-blue-400">
              <LucideIcon name="BookOpen" size={18} />
            </div>
            <h3 className="text-sm font-bold text-slate-100 font-sans">Excel Blueprint Specification</h3>
          </div>

          <p className="text-xs text-slate-400 leading-normal">
            To replicate this complete operating system inside Excel, set up two core tabs: <strong className="text-white">PlayerProfile</strong> and <strong className="text-white">Activities</strong>.
          </p>

          <div className="space-y-4 pt-2 text-xs">
            <div className="space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-900">
              <span className="font-mono text-[10px] text-emerald-400 block">FORMULA: DYNAMIC PROGRESSIVE XP</span>
              <p className="text-slate-300 mt-1">In PlayerProfile tab, cell <strong className="text-white font-mono">B5</strong>, paste to auto-calculate required XP to next level:</p>
              <code className="block bg-slate-900 p-1.5 rounded text-[10px] font-mono text-slate-400 mt-1.5 select-all">
                =B3 * 250
              </code>
            </div>

            <div className="space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-900">
              <span className="font-mono text-[10px] text-emerald-400 block">FORMULA: ACCRUED CATEGORY SUM</span>
              <p className="text-slate-300 mt-1">Calculate cumulative completed times in category <strong className="text-white font-mono">"Deen"</strong> dynamically:</p>
              <code className="block bg-slate-900 p-1.5 rounded text-[10px] font-mono text-slate-400 mt-1.5 select-all">
                =SUMIF(Activities!B:B, "Deen", Activities!H:H)
              </code>
            </div>

            <div className="space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-900">
              <span className="font-mono text-[10px] text-emerald-400 block">FORMULA: COMPLETED RATIO GAUGE</span>
              <p className="text-slate-300 mt-1">In cell <strong className="text-white font-mono">F2</strong>, calculate today's quest completion rates:</p>
              <code className="block bg-slate-900 p-1.5 rounded text-[10px] font-mono text-slate-400 mt-1.5 select-all">
                =COUNTIFS(Quests!E:E, TRUE, Quests!C:C, "Daily") / COUNTIF(Quests!C:C, "Daily")
              </code>
            </div>
          </div>
        </div>

        {/* COPIABLE VBA / OFFICESCRIPT MACROS (Right Panel) */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl backdrop-blur-md space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex gap-2.5 items-center">
                <div className="p-2 bg-blue-950/40 border border-blue-900/40 rounded-lg text-blue-400">
                  <LucideIcon name="Code" size={18} />
                </div>
                <h3 className="text-sm font-bold text-slate-100 font-sans">Automation VBA Macro</h3>
              </div>

              <button
                onClick={() => copyToClipboard(VBA_CODE, 'vba')}
                className="text-[10px] bg-slate-950 hover:bg-slate-900 px-2 py-1 border border-slate-800 rounded font-mono text-slate-400 hover:text-white cursor-pointer"
              >
                {copiedScript === 'vba' ? 'COPIED!' : 'COPY VBA'}
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-normal">
              Copy and paste this production-ready VBA Macro into your Excel developer Module to automate level up check-ups, coin allocations, and stats recalculations.
            </p>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 max-h-[220px] overflow-y-auto">
              <pre className="text-[9px] font-mono text-slate-400 leading-relaxed whitespace-pre">{VBA_CODE}</pre>
            </div>
          </div>

          {/* Copy Excel Office Scripts option */}
          <div className="border-t border-slate-900 pt-4 flex justify-between items-center">
            <span className="text-[10px] text-slate-500 font-mono">Compatible with Excel Online Scripts</span>
            <button
              onClick={() => copyToClipboard(OFFICESCRIPTS_CODE, 'script')}
              className="text-[10px] text-emerald-400 font-mono underline hover:text-emerald-300 cursor-pointer"
            >
              {copiedScript === 'script' ? 'COPIED SCRIPT!' : 'View Excel Office Script'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
