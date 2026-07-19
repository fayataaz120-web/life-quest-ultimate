/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookLog, VideoLog, CourseLog, FitnessLog,
  JournalLog, ProjectLog, DreamLog, BusinessIdeaLog,
  VocabularyLog, TravelLog, QuoteLog, AppState
} from '../types';
import { LucideIcon } from './LucideIcon';
import { sfx } from '../utils/audio';

interface LongTermDatabaseProps {
  state: AppState;
  onAddLog: (table: keyof AppState, log: any) => void;
  onDeleteLog: (table: keyof AppState, id: string) => void;
}

type DatabaseTab = 'books' | 'videos' | 'courses' | 'fitness' | 'journal' | 'projects' | 'dreams' | 'business' | 'vocab' | 'travel' | 'quotes';

export const LongTermDatabase: React.FC<LongTermDatabaseProps> = ({
  state,
  onAddLog,
  onDeleteLog,
}) => {
  const [activeTab, setActiveTab] = useState<DatabaseTab>('books');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [bookForm, setBookForm] = useState({ title: "", author: "", status: "Reading" as any, pages: 200, progress: 0, rating: 5, review: "" });
  const [videoForm, setVideoForm] = useState({ title: "", creator: "", category: "Knowledge", durationMin: 20, watched: false });
  const [courseForm, setCourseForm] = useState({ name: "", provider: "", progress: 0, completed: false, certificatesUrl: "" });
  const [fitnessForm, setFitnessForm] = useState({ activity: "", metric: "", value: 10, durationMin: 45 });
  const [journalForm, setJournalForm] = useState({ title: "", content: "", mood: "Motivated" });
  const [projectForm, setProjectForm] = useState({ name: "", description: "", status: "Planning" as any, xpEarned: 0 });
  const [dreamForm, setDreamForm] = useState({ description: "", lucidity: 5, tags: "" });
  const [businessForm, setBusinessForm] = useState({ title: "", problem: "", solution: "", marketSize: "", viability: 5 });
  const [vocabForm, setVocabForm] = useState({ word: "", definition: "", language: "Arabic", learned: true });
  const [travelForm, setTravelForm] = useState({ destination: "", notes: "", completed: false });
  const [quoteForm, setQuoteForm] = useState({ text: "", author: "", source: "", category: "Wisdom" });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const date = new Date().toISOString().split('T')[0];
    const id = `log-${Date.now()}`;

    let data: any = {};
    let tableKey: keyof AppState = 'bookLogs';

    switch (activeTab) {
      case 'books':
        tableKey = 'bookLogs';
        data = { id, ...bookForm, dateLogged: date };
        break;
      case 'videos':
        tableKey = 'videoLogs';
        data = { id, ...videoForm, dateLogged: date };
        break;
      case 'courses':
        tableKey = 'courseLogs';
        data = { id, ...courseForm, dateLogged: date };
        break;
      case 'fitness':
        tableKey = 'fitnessLogs';
        data = { id, ...fitnessForm, dateLogged: date };
        break;
      case 'journal':
        tableKey = 'journalLogs';
        data = { id, ...journalForm, dateLogged: date };
        break;
      case 'projects':
        tableKey = 'projectLogs';
        data = { id, ...projectForm, dateLogged: date };
        break;
      case 'dreams':
        tableKey = 'dreamLogs';
        data = { id, ...dreamForm, tags: dreamForm.tags.split(',').map(t => t.trim()).filter(Boolean), dateLogged: date };
        break;
      case 'business':
        tableKey = 'businessIdeaLogs';
        data = { id, ...businessForm, dateLogged: date };
        break;
      case 'vocab':
        tableKey = 'vocabularyLogs';
        data = { id, ...vocabForm, dateLogged: date };
        break;
      case 'travel':
        tableKey = 'travelLogs';
        data = { id, ...travelForm, dateLogged: date };
        break;
      case 'quotes':
        tableKey = 'quoteLogs';
        data = { id, ...quoteForm, dateLogged: date };
        break;
    }

    onAddLog(tableKey, data);
    sfx.playSkillUnlock();
    setShowAddForm(false);
    // Reset specific forms
    if (activeTab === 'quotes') {
      setQuoteForm({ text: "", author: "", source: "", category: "Wisdom" });
    }
  };

  // Safe accessor to ensure lists exist
  const getSafeList = (tab: DatabaseTab) => {
    switch (tab) {
      case 'books': return state.bookLogs || [];
      case 'videos': return state.videoLogs || [];
      case 'courses': return state.courseLogs || [];
      case 'fitness': return state.fitnessLogs || [];
      case 'journal': return state.journalLogs || [];
      case 'projects': return state.projectLogs || [];
      case 'dreams': return state.dreamLogs || [];
      case 'business': return state.businessIdeaLogs || [];
      case 'vocab': return state.vocabularyLogs || [];
      case 'travel': return state.travelLogs || [];
      case 'quotes': return state.quoteLogs || [];
      default: return [];
    }
  };

  // Searching & Filtering lists
  const getFilteredList = (tab: DatabaseTab) => {
    const list = getSafeList(tab);
    if (!searchTerm.trim()) return list;
    const query = searchTerm.toLowerCase();

    switch (tab) {
      case 'books':
        return (list as BookLog[]).filter(b => 
          b.title.toLowerCase().includes(query) || 
          b.author.toLowerCase().includes(query) || 
          (b.review && b.review.toLowerCase().includes(query))
        );
      case 'videos':
        return (list as VideoLog[]).filter(v => 
          v.title.toLowerCase().includes(query) || 
          v.creator.toLowerCase().includes(query) || 
          v.category.toLowerCase().includes(query)
        );
      case 'courses':
        return (list as CourseLog[]).filter(c => 
          c.name.toLowerCase().includes(query) || 
          c.provider.toLowerCase().includes(query)
        );
      case 'fitness':
        return (list as FitnessLog[]).filter(f => 
          f.activity.toLowerCase().includes(query) || 
          f.metric.toLowerCase().includes(query)
        );
      case 'journal':
        return (list as JournalLog[]).filter(j => 
          j.title.toLowerCase().includes(query) || 
          j.content.toLowerCase().includes(query) || 
          j.mood.toLowerCase().includes(query)
        );
      case 'projects':
        return (list as ProjectLog[]).filter(p => 
          p.name.toLowerCase().includes(query) || 
          p.description.toLowerCase().includes(query) || 
          p.status.toLowerCase().includes(query)
        );
      case 'dreams':
        return (list as DreamLog[]).filter(d => 
          d.description.toLowerCase().includes(query) || 
          d.tags.some(t => t.toLowerCase().includes(query))
        );
      case 'business':
        return (list as BusinessIdeaLog[]).filter(b => 
          b.title.toLowerCase().includes(query) || 
          b.problem.toLowerCase().includes(query) || 
          b.solution.toLowerCase().includes(query)
        );
      case 'vocab':
        return (list as VocabularyLog[]).filter(v => 
          v.word.toLowerCase().includes(query) || 
          v.definition.toLowerCase().includes(query) || 
          v.language.toLowerCase().includes(query)
        );
      case 'travel':
        return (list as TravelLog[]).filter(t => 
          t.destination.toLowerCase().includes(query) || 
          t.notes.toLowerCase().includes(query)
        );
      case 'quotes':
        return (list as QuoteLog[]).filter(q => 
          q.text.toLowerCase().includes(query) || 
          q.author.toLowerCase().includes(query) || 
          (q.source && q.source.toLowerCase().includes(query))
        );
      default:
        return list;
    }
  };

  const activeList = getFilteredList(activeTab);
  const totalSafeCount = getSafeList(activeTab).length;

  return (
    <div className="space-y-6" id="longterm-databases-container">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <LucideIcon name="Database" className="text-blue-400" />
            Adventurer Chronicles & Archives
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Store and organize long-term records. Watch your historical library accumulate details of your growth over years of quests.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
        >
          <LucideIcon name="Edit3" size={14} />
          Record New Entry
        </button>
      </div>

      {/* SEARCH HUD BAR */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <LucideIcon name="Search" size={14} className="text-slate-500" />
        </div>
        <input
          type="text"
          placeholder={`Search inside ${activeTab.toUpperCase()} records...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800/80 focus:border-blue-500/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner font-mono"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white text-xs font-mono"
          >
            Clear
          </button>
        )}
      </div>

      {/* HORIZONTAL MINI SUB-TABS */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-950 border border-slate-800/80 rounded-xl">
        {[
          { key: 'books', name: 'Book Library', icon: 'Book' },
          { key: 'videos', name: 'Knowledge Feed', icon: 'Video' },
          { key: 'courses', name: 'Academy Courses', icon: 'GraduationCap' },
          { key: 'fitness', name: 'Fitness Logs', icon: 'Dumbbell' },
          { key: 'journal', name: 'Daily Journals', icon: 'FileText' },
          { key: 'projects', name: 'Project Vault', icon: 'FolderOpen' },
          { key: 'dreams', name: 'Dream Log', icon: 'Moon' },
          { key: 'business', name: 'Business Ideas', icon: 'Lightbulb' },
          { key: 'vocab', name: 'Vocabulary', icon: 'Languages' },
          { key: 'travel', name: 'Travel Dream', icon: 'Map' },
          { key: 'quotes', name: 'Wisdom Quotes', icon: 'Sparkles' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key as DatabaseTab);
              setShowAddForm(false);
              setSearchTerm(''); // clear filter on tab switch
            }}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${activeTab === tab.key ? 'bg-blue-900/40 text-blue-300 border border-blue-800/50' : 'text-slate-400 hover:text-white hover:bg-slate-900/50'}`}
          >
            <LucideIcon name={tab.icon} size={14} />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* ACTIVE TABLE / DATA RENDER CONTAINER */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 backdrop-blur-md overflow-x-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-md font-bold text-slate-100 font-sans uppercase tracking-wider flex items-center gap-2">
            <span>Archive Records: {activeTab.toUpperCase()}</span>
          </h2>
          <span className="text-xs font-mono text-slate-500">
            Showing {activeList.length} of {totalSafeCount} entries
          </span>
        </div>

        {activeList.length === 0 && (
          <div className="text-center py-16 text-slate-500 font-mono text-xs space-y-2">
            <LucideIcon name="Search" className="mx-auto text-slate-700" size={24} />
            <p>No recorded entries found matching your query.</p>
          </div>
        )}

        {activeList.length > 0 && (
          <>
            {/* 1. BOOK LOGS */}
            {activeTab === 'books' && (
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 font-mono text-slate-500 uppercase tracking-wider">
                    <th className="py-2">Book Title</th>
                    <th className="py-2">Author</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Progress</th>
                    <th className="py-2">Rating</th>
                    <th className="py-2">Logged Date</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {(activeList as BookLog[]).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-950/40">
                      <td className="py-3 font-semibold text-slate-100">{log.title}</td>
                      <td className="py-3 text-slate-400">{log.author}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${log.status === 'Completed' ? 'bg-emerald-950/40 text-emerald-400' : log.status === 'Reading' ? 'bg-blue-950/40 text-blue-400' : 'bg-slate-850 text-slate-400'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 font-mono">{log.progress}% ({log.pages} pgs)</td>
                      <td className="py-3 text-amber-400">{"★".repeat(log.rating || 5)}</td>
                      <td className="py-3 text-slate-500 font-mono">{log.dateLogged}</td>
                      <td className="py-3 text-right">
                        <button onClick={() => onDeleteLog('bookLogs', log.id)} className="text-slate-600 hover:text-red-400 p-1">
                          <LucideIcon name="Trash2" size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 2. VIDEO LOGS */}
            {activeTab === 'videos' && (
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 font-mono text-slate-500 uppercase tracking-wider">
                    <th className="py-2">Educational Video</th>
                    <th className="py-2">Creator</th>
                    <th className="py-2">Topic</th>
                    <th className="py-2">Duration</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 font-mono">Logged Date</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {(activeList as VideoLog[]).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-950/40">
                      <td className="py-3 font-semibold text-slate-100">{log.title}</td>
                      <td className="py-3 text-slate-400">{log.creator}</td>
                      <td className="py-3"><span className="text-slate-400 bg-slate-950 px-2 py-0.5 rounded text-[10px]">{log.category}</span></td>
                      <td className="py-3 font-mono">{log.durationMin} mins</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${log.watched ? 'bg-emerald-950/40 text-emerald-400' : 'bg-amber-950/40 text-amber-400'}`}>
                          {log.watched ? 'Watched' : 'Queue'}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 font-mono">{log.dateLogged}</td>
                      <td className="py-3 text-right">
                        <button onClick={() => onDeleteLog('videoLogs', log.id)} className="text-slate-600 hover:text-red-400 p-1">
                          <LucideIcon name="Trash2" size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 3. COURSE LOGS */}
            {activeTab === 'courses' && (
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 font-mono text-slate-500 uppercase tracking-wider">
                    <th className="py-2">Course Name</th>
                    <th className="py-2">Provider Academy</th>
                    <th className="py-2">Progress</th>
                    <th className="py-2">Certificate</th>
                    <th className="py-2">Logged Date</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {(activeList as CourseLog[]).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-950/40">
                      <td className="py-3 font-semibold text-slate-100">{log.name}</td>
                      <td className="py-3 text-slate-400">{log.provider}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-950 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: `${log.progress}%` }}></div>
                          </div>
                          <span className="font-mono">{log.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3">
                        {log.certificatesUrl ? (
                          <a href={log.certificatesUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1 font-mono text-[10px]">
                            <LucideIcon name="ExternalLink" size={10} /> View Certificate
                          </a>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="py-3 text-slate-500 font-mono">{log.dateLogged}</td>
                      <td className="py-3 text-right">
                        <button onClick={() => onDeleteLog('courseLogs', log.id)} className="text-slate-600 hover:text-red-400 p-1">
                          <LucideIcon name="Trash2" size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 4. FITNESS LOGS */}
            {activeTab === 'fitness' && (
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 font-mono text-slate-500 uppercase tracking-wider">
                    <th className="py-2">Athletic Workout</th>
                    <th className="py-2">Performance metric</th>
                    <th className="py-2">Volume Lifted/Value</th>
                    <th className="py-2">Time Spent</th>
                    <th className="py-2 font-mono">Logged Date</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {(activeList as FitnessLog[]).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-950/40">
                      <td className="py-3 font-semibold text-slate-100">{log.activity}</td>
                      <td className="py-3 text-slate-400">{log.metric}</td>
                      <td className="py-3 font-mono font-bold text-red-400">{log.value} (SI)</td>
                      <td className="py-3 font-mono">{log.durationMin} mins</td>
                      <td className="py-3 text-slate-500 font-mono">{log.dateLogged}</td>
                      <td className="py-3 text-right">
                        <button onClick={() => onDeleteLog('fitnessLogs', log.id)} className="text-slate-600 hover:text-red-400 p-1">
                          <LucideIcon name="Trash2" size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 5. JOURNAL LOGS */}
            {activeTab === 'journal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(activeList as JournalLog[]).map((log) => (
                  <div key={log.id} className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl relative space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-slate-500 font-mono">{log.dateLogged}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs bg-blue-950/40 text-blue-300 px-2 py-0.5 rounded-full border border-blue-900/40">
                          Mood: {log.mood}
                        </span>
                        <button onClick={() => onDeleteLog('journalLogs', log.id)} className="text-slate-600 hover:text-red-400 p-1">
                          <LucideIcon name="Trash2" size={12} />
                        </button>
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-white">{log.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed italic">"{log.content}"</p>
                  </div>
                ))}
              </div>
            )}

            {/* 6. PROJECTS */}
            {activeTab === 'projects' && (
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 font-mono text-slate-500 uppercase tracking-wider">
                    <th className="py-2">Project Blueprint</th>
                    <th className="py-2">Development Status</th>
                    <th className="py-2">XP earned</th>
                    <th className="py-2 font-mono">Logged Date</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {(activeList as ProjectLog[]).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-950/40">
                      <td className="py-3">
                        <div className="font-semibold text-slate-100">{log.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{log.description}</div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${log.status === 'Shipped' ? 'bg-emerald-950/40 text-emerald-400' : log.status === 'In Progress' ? 'bg-blue-950/40 text-blue-400' : 'bg-slate-850 text-slate-400'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 font-mono font-semibold text-blue-400">+{log.xpEarned} XP</td>
                      <td className="py-3 text-slate-500 font-mono">{log.dateLogged}</td>
                      <td className="py-3 text-right">
                        <button onClick={() => onDeleteLog('projectLogs', log.id)} className="text-slate-600 hover:text-red-400 p-1">
                          <LucideIcon name="Trash2" size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 7. DREAM LOG */}
            {activeTab === 'dreams' && (
              <div className="space-y-4">
                {(activeList as DreamLog[]).map((log) => (
                  <div key={log.id} className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl flex justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                        <span>{log.dateLogged}</span>
                        <span>•</span>
                        <span>Lucidity Tier: <span className="text-blue-300 font-bold">{log.lucidity}/10</span></span>
                      </div>
                      <p className="text-xs text-slate-300 leading-normal italic">"{log.description}"</p>
                      <div className="flex gap-1">
                        {log.tags.map((tag, i) => (
                          <span key={i} className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">#{tag}</span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => onDeleteLog('dreamLogs', log.id)} className="text-slate-600 hover:text-red-400 p-1 shrink-0 h-fit self-start">
                      <LucideIcon name="Trash2" size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 8. BUSINESS IDEAS */}
            {activeTab === 'business' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(activeList as BusinessIdeaLog[]).map((log) => (
                  <div key={log.id} className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-between h-full space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-bold text-amber-400">{log.title}</h4>
                        <span className="text-[10px] font-mono font-bold bg-amber-950/40 border border-amber-900 text-amber-300 px-2 py-0.5 rounded">
                          Viability: {log.viability}/10
                        </span>
                      </div>
                      <div className="text-xs space-y-1">
                        <p className="text-slate-500 font-mono uppercase text-[9px]">The Bottleneck problem:</p>
                        <p className="text-slate-300 leading-relaxed italic">{log.problem}</p>
                        <p className="text-slate-500 font-mono uppercase text-[9px] mt-2">The Digital Solution:</p>
                        <p className="text-slate-200 leading-relaxed">{log.solution}</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-900 pt-3 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                      <span>Size: {log.marketSize || "N/A"}</span>
                      <div className="flex items-center gap-2">
                        <span>Logged: {log.dateLogged}</span>
                        <button onClick={() => onDeleteLog('businessIdeaLogs', log.id)} className="text-slate-600 hover:text-red-400 p-1">
                          <LucideIcon name="Trash2" size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 9. VOCABULARY */}
            {activeTab === 'vocab' && (
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 font-mono text-slate-500 uppercase tracking-wider">
                    <th className="py-2">Foreign Word/Phrase</th>
                    <th className="py-2">Definition / Explanation</th>
                    <th className="py-2">Language Branch</th>
                    <th className="py-2">Attainment</th>
                    <th className="py-2 font-mono">Logged Date</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {(activeList as VocabularyLog[]).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-950/40">
                      <td className="py-3 font-semibold text-slate-100 font-serif text-sm">{log.word}</td>
                      <td className="py-3 text-slate-300 italic">"{log.definition}"</td>
                      <td className="py-3"><span className="text-indigo-400 bg-indigo-950/40 border border-indigo-900/40 px-2 py-0.5 rounded text-[10px] font-mono">{log.language}</span></td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${log.learned ? 'bg-emerald-950/40 text-emerald-400' : 'bg-slate-850 text-slate-400'}`}>
                          {log.learned ? 'Fully Mastered' : 'Memorizing'}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 font-mono">{log.dateLogged}</td>
                      <td className="py-3 text-right">
                        <button onClick={() => onDeleteLog('vocabularyLogs', log.id)} className="text-slate-600 hover:text-red-400 p-1">
                          <LucideIcon name="Trash2" size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 10. TRAVEL */}
            {activeTab === 'travel' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(activeList as TravelLog[]).map((log) => (
                  <div key={log.id} className="bg-slate-950/80 border border-slate-850 p-4 rounded-xl flex justify-between gap-4">
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1">
                        <LucideIcon name="Compass" size={13} className="text-blue-400" />
                        {log.destination}
                      </h4>
                      <p className="text-xs text-slate-400 leading-normal">{log.notes}</p>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono ${log.completed ? 'bg-emerald-950/40 text-emerald-400' : 'bg-amber-950/30 text-amber-400'}`}>
                        {log.completed ? 'Completed' : 'Dream Quest'}
                      </span>
                    </div>
                    <div className="flex flex-col justify-between items-end shrink-0">
                      <button onClick={() => onDeleteLog('travelLogs', log.id)} className="text-slate-600 hover:text-red-400 p-1">
                        <LucideIcon name="Trash2" size={12} />
                      </button>
                      <span className="text-[10px] text-slate-500 font-mono">{log.dateLogged}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 11. WISDOM QUOTES */}
            {activeTab === 'quotes' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(activeList as QuoteLog[]).map((log) => (
                  <div key={log.id} className="bg-slate-950/80 border border-slate-800 p-5 rounded-xl relative flex flex-col justify-between h-full space-y-3 shadow-sm hover:border-slate-700 transition-all">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-mono bg-blue-950/40 text-blue-300 px-2 py-0.5 rounded border border-blue-900/40">
                          {log.category || 'Wisdom'}
                        </span>
                        <button onClick={() => onDeleteLog('quoteLogs', log.id)} className="text-slate-600 hover:text-red-400 p-1">
                          <LucideIcon name="Trash2" size={12} />
                        </button>
                      </div>
                      <p className="text-xs text-slate-200 font-serif leading-relaxed italic">
                        "{log.text}"
                      </p>
                    </div>

                    <div className="border-t border-slate-900/60 pt-2.5 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                      <span>
                        — <strong className="text-slate-400">{log.author}</strong> {log.source && <span className="text-slate-500">({log.source})</span>}
                      </span>
                      <span>{log.dateLogged}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* RECORD ENTRY MODAL */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-blue-900/50 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <LucideIcon name="X" size={18} />
            </button>

            <div className="flex gap-3 items-center">
              <div className="p-2 bg-blue-950/40 border border-blue-900/40 rounded-lg text-blue-400">
                <LucideIcon name="Edit3" size={20} />
              </div>
              <div>
                <h3 className="text-md font-bold text-white font-sans">Inscribe Chronicle: {activeTab.toUpperCase()}</h3>
                <p className="text-xs text-slate-400">Log standard records to build your permanent adventurer archives.</p>
              </div>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 pt-2">
              {/* 1. BOOKS FORM */}
              {activeTab === 'books' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono">BOOK TITLE</label>
                      <input type="text" required value={bookForm.title} onChange={e => setBookForm(p => ({ ...p, title: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono">AUTHOR</label>
                      <input type="text" required value={bookForm.author} onChange={e => setBookForm(p => ({ ...p, author: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono">TOTAL PAGES</label>
                      <input type="number" value={bookForm.pages} onChange={e => setBookForm(p => ({ ...p, pages: Number(e.target.value) }))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono">PROGRESS %</label>
                      <input type="number" max={100} min={0} value={bookForm.progress} onChange={e => setBookForm(p => ({ ...p, progress: Number(e.target.value) }))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono">STATUS</label>
                      <select value={bookForm.status} onChange={e => setBookForm(p => ({ ...p, status: e.target.value as any }))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none">
                        <option value="Reading">Active Reading</option>
                        <option value="Completed">Completed Read</option>
                        <option value="To Read">To Read List</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono">STAR RATING (1-5)</label>
                      <input type="number" max={5} min={1} value={bookForm.rating} onChange={e => setBookForm(p => ({ ...p, rating: Number(e.target.value) }))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono">REVIEW NOTES</label>
                      <input type="text" value={bookForm.review} onChange={e => setBookForm(p => ({ ...p, review: e.target.value }))} placeholder="Key insights..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. VIDEOS FORM */}
              {activeTab === 'videos' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono">VIDEO TITLE</label>
                    <input type="text" required value={videoForm.title} onChange={e => setVideoForm(p => ({ ...p, title: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1 col-span-2">
                      <label className="text-xs text-slate-400 font-mono">CREATOR CHANNELS</label>
                      <input type="text" required value={videoForm.creator} onChange={e => setVideoForm(p => ({ ...p, creator: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono">DURATION (MIN)</label>
                      <input type="number" value={videoForm.durationMin} onChange={e => setVideoForm(p => ({ ...p, durationMin: Number(e.target.value) }))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono">TOPIC CATEGORY</label>
                      <input type="text" value={videoForm.category} onChange={e => setVideoForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Health, Programming" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono">WATCHED STATUS</label>
                      <select value={String(videoForm.watched)} onChange={e => setVideoForm(p => ({ ...p, watched: e.target.value === 'true' }))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none">
                        <option value="false">Farming/In Queue</option>
                        <option value="true">Fully Watched</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. COURSE FORM */}
              {activeTab === 'courses' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono">COURSE NAME</label>
                    <input type="text" required value={courseForm.name} onChange={e => setCourseForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono">PROVIDER / ACADEMY</label>
                      <input type="text" required value={courseForm.provider} onChange={e => setCourseForm(p => ({ ...p, provider: e.target.value }))} placeholder="Udemy, Coursera, MIT" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono">PROGRESS %</label>
                      <input type="number" max={100} min={0} value={courseForm.progress} onChange={e => setCourseForm(p => ({ ...p, progress: Number(e.target.value), completed: Number(e.target.value) === 100 }))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono">CERTIFICATE LINK (URL)</label>
                    <input type="url" value={courseForm.certificatesUrl} onChange={e => setCourseForm(p => ({ ...p, certificatesUrl: e.target.value }))} placeholder="https://..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
                  </div>
                </div>
              )}

              {/* 4. FITNESS FORM */}
              {activeTab === 'fitness' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono">ATHLETIC ACTIVITY</label>
                      <input type="text" required value={fitnessForm.activity} onChange={e => setFitnessForm(p => ({ ...p, activity: e.target.value }))} placeholder="e.g. Heavy Squats, Running" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono">METRIC RECORD</label>
                      <input type="text" required value={fitnessForm.metric} onChange={e => setFitnessForm(p => ({ ...p, metric: e.target.value }))} placeholder="e.g. 100kg 3x5, 5km Cardio" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono">VOLUME VALUE (NUMERICAL)</label>
                      <input type="number" value={fitnessForm.value} onChange={e => setFitnessForm(p => ({ ...p, value: Number(e.target.value) }))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono">DURATION IN MINS</label>
                      <input type="number" value={fitnessForm.durationMin} onChange={e => setFitnessForm(p => ({ ...p, durationMin: Number(e.target.value) }))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono" />
                    </div>
                  </div>
                </div>
              )}

              {/* 5. JOURNAL FORM */}
              {activeTab === 'journal' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono">REFLECTIVE TITLE</label>
                      <input type="text" required value={journalForm.title} onChange={e => setJournalForm(p => ({ ...p, title: e.target.value }))} placeholder="Key topic today..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono">DOMINANT MOOD</label>
                      <select value={journalForm.mood} onChange={e => setJournalForm(p => ({ ...p, mood: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none">
                        <option value="Motivated">⚡ Motivated</option>
                        <option value="Reflective">🧠 Reflective</option>
                        <option value="Fatigued">💤 Fatigued</option>
                        <option value="Grateful">🙏 Grateful</option>
                        <option value="Restless">🌀 Restless</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono">JOURNAL CONTENT</label>
                    <textarea required value={journalForm.content} onChange={e => setJournalForm(p => ({ ...p, content: e.target.value }))} placeholder="Write details..." className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none h-24 resize-none" />
                  </div>
                </div>
              )}

              {/* 6. PROJECTS FORM */}
              {activeTab === 'projects' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono">PROJECT BLUEPRINT NAME</label>
                    <input type="text" required value={projectForm.name} onChange={e => setProjectForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono">PROJECT DESCRIPTION</label>
                    <input type="text" required value={projectForm.description} onChange={e => setProjectForm(p => ({ ...p, description: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono">STATUS</label>
                      <select value={projectForm.status} onChange={e => setProjectForm(p => ({ ...p, status: e.target.value as any }))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none">
                        <option value="Planning">Planning blueprint</option>
                        <option value="In Progress">Active Development</option>
                        <option value="Shipped">Fully Shipped (Done)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono">XP EARNED ACCRUED</label>
                      <input type="number" value={projectForm.xpEarned} onChange={e => setProjectForm(p => ({ ...p, xpEarned: Number(e.target.value) }))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono" />
                    </div>
                  </div>
                </div>
              )}

              {/* 7. DREAMS FORM */}
              {activeTab === 'dreams' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono">DREAM CONTENT</label>
                    <textarea required value={dreamForm.description} onChange={e => setDreamForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe dream sheets..." className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none h-20 resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono">LUCIDITY SCORE (1-10)</label>
                      <input type="number" max={10} min={1} value={dreamForm.lucidity} onChange={e => setDreamForm(p => ({ ...p, lucidity: Number(e.target.value) }))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono">TAGS (COMMA SEPARATED)</label>
                      <input type="text" value={dreamForm.tags} onChange={e => setDreamForm(p => ({ ...p, tags: e.target.value }))} placeholder="flying, space, chase" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* 8. BUSINESS FORM */}
              {activeTab === 'business' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono">IDEA TITLE</label>
                      <input type="text" required value={businessForm.title} onChange={e => setBusinessForm(p => ({ ...p, title: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono">MARKET SIZE SUMMARY</label>
                      <input type="text" value={businessForm.marketSize} onChange={e => setBusinessForm(p => ({ ...p, marketSize: e.target.value }))} placeholder="e.g. $50M global, local micro" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono">PAINFUL PROBLEM</label>
                    <input type="text" required value={businessForm.problem} onChange={e => setBusinessForm(p => ({ ...p, problem: e.target.value }))} placeholder="Describe the acute pain point..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono">SCALABLE SOLUTION</label>
                    <input type="text" required value={businessForm.solution} onChange={e => setBusinessForm(p => ({ ...p, solution: e.target.value }))} placeholder="Describe the digital software/solution..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono">VIABILITY SCORE (1-10)</label>
                    <input type="number" max={10} min={1} value={businessForm.viability} onChange={e => setBusinessForm(p => ({ ...p, viability: Number(e.target.value) }))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono" />
                  </div>
                </div>
              )}

              {/* 9. VOCAB FORM */}
              {activeTab === 'vocab' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono">FOREIGN WORD/PHRASE</label>
                      <input type="text" required value={vocabForm.word} onChange={e => setVocabForm(p => ({ ...p, word: e.target.value }))} placeholder="e.g. Al-Ikhlas" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono">LANGUAGE BRANCH</label>
                      <input type="text" required value={vocabForm.language} onChange={e => setVocabForm(p => ({ ...p, language: e.target.value }))} placeholder="Arabic, Spanish" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono">DEFINITION & EXPLANATION</label>
                    <input type="text" required value={vocabForm.definition} onChange={e => setVocabForm(p => ({ ...p, definition: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
                  </div>
                </div>
              )}

              {/* 10. TRAVEL FORM */}
              {activeTab === 'travel' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono">DESTINATION REGION</label>
                    <input type="text" required value={travelForm.destination} onChange={e => setTravelForm(p => ({ ...p, destination: e.target.value }))} placeholder="Mecca, Tokyo, Rome" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono">DREAM QUEST NOTES</label>
                    <textarea required value={travelForm.notes} onChange={e => setTravelForm(p => ({ ...p, notes: e.target.value }))} placeholder="Target accomplishments..." className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none h-20 resize-none" />
                  </div>
                </div>
              )}

              {/* 11. WISDOM QUOTES FORM */}
              {activeTab === 'quotes' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono">QUOTE WISDOM TEXT</label>
                    <textarea required value={quoteForm.text} onChange={e => setQuoteForm(p => ({ ...p, text: e.target.value }))} placeholder="Type the inspirational quote or pearl of wisdom..." className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none h-24 resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono">AUTHOR / SPEAKER</label>
                      <input type="text" required value={quoteForm.author} onChange={e => setQuoteForm(p => ({ ...p, author: e.target.value }))} placeholder="Imam Ghazali, Steve Jobs, etc." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-mono">SOURCE REFERENCE</label>
                      <input type="text" value={quoteForm.source} onChange={e => setQuoteForm(p => ({ ...p, source: e.target.value }))} placeholder="e.g. Book, Video, Speech" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-mono">DISCIPLINE CATEGORY</label>
                    <select value={quoteForm.category} onChange={e => setQuoteForm(p => ({ ...p, category: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none">
                      <option value="Wisdom">🧠 Universal Wisdom</option>
                      <option value="Deen">🙏 Spiritual / Deen</option>
                      <option value="Focus">⚡ Focus & Consistency</option>
                      <option value="Strength">💪 Health & Resilience</option>
                      <option value="Wealth">💰 Business & Gold</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg text-xs transition-all shadow-md cursor-pointer"
              >
                Inscribe Entry in Adventure Chronicle
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
