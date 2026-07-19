/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3050; // wait, let's keep server settings or change them as needed

app.use(express.json({ limit: '10mb' }));

// Lazy init Gemini SDK
let ai: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not defined. AI features will run in demo/simulation mode.");
      return null;
    }
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return ai;
}

// 1. AI Coach Endpoint
app.post('/api/ai-coach', async (req, res) => {
  try {
    const { player, categories, activities, history, journalLogs, bookLogs } = req.body;
    
    if (!player) {
      res.status(400).json({ error: "Missing player profile information" });
      return;
    }

    const client = getGeminiClient();

    // System prompt configuration focusing on encouraging, constructive, non-judgmental RPG feedback
    const systemInstruction = 
      `You are the Grand Archmage of Focus, an encouraging, motivating, and wise RPG AI Coach guiding an adventurer on their real-life Personal Quest.\n` +
      `Your tone must always be constructive, highly encouraging, supportive, and completely free of judgment. Never judge, criticize, or shame the user. If they have low consistency, frame it as 'untapped potential' or 'resting in the tavern before the next grand campaign'.\n` +
      `You will analyze the player's profile, history, active training sectors (categories), and logs, then generate a comprehensive report.\n` +
      `You must return the response in beautifully formatted Markdown, using bold titles, small lists, and distinct section headers. Use immersive fantasy/RPG references matching their character class.\n\n` +
      `The report MUST contain:\n` +
      `1. ⚔️ DAILY RECOMMENDATIONS: Small, bite-sized tactical action items for today based on their active activities.\n` +
      `2. 📈 WEEKLY REVIEW & PRODUCTIVITY INSIGHTS: An encouraging analysis of their XP gains and achievements.\n` +
      `3. 🔥 CONSISTENCY & MOMENTUM ANALYSIS: Feedback on their current streak, praising their commitment or offering friendly alignment to rebuild momentum.\n` +
      `4. 🛡️ CLASS STRENGTHS & DEVELOPMENT AREAS: What areas of their character class they are excelling in, and which sectors have been quiet ('untapped magical wells').\n` +
      `5. 🎯 SUGGESTED ADVENTURER PRIORITIES: Three high-value priorities to tackle next to unlock maximum development.`;

    // Construct the context prompt containing user history
    const contextPrompt = 
      `CHARACTER DATA:\n` +
      `- Name: ${player.name}\n` +
      `- Class: ${player.class}\n` +
      `- Level: ${player.level} (${player.xp}/${player.xpToNextLevel} XP)\n` +
      `- Title: ${player.title} | Rank: ${player.rank}\n` +
      `- Current Streak: ${player.currentStreak} Days (Longest: ${player.longestStreak} Days)\n` +
      `- Gold Coins: ${player.coins}\n\n` +
      `SKILL SECTORS (CATEGORIES):\n` +
      `${categories?.map((c: any) => `- ${c.name} (${c.xpMultiplier}x Multiplier)`).join('\n')}\n\n` +
      `TRAINING REGIMENS (ACTIVITIES):\n` +
      `${activities?.map((a: any) => `- [${a.status}] ${a.name} (Difficulty: ${a.difficulty}, Frequency: ${a.frequency}, Cleared: ${a.completedTimes} times, Streak: ${a.currentStreak})`).join('\n')}\n\n` +
      `RECENT HISTORICAL RECORDS:\n` +
      `${history?.slice(-7).map((h: any) => `- Date: ${h.date}, XP Gained: ${h.xpGained}, Coins: ${h.coinsGained}, Tasks Cleared: ${h.completedCount}`).join('\n')}\n\n` +
      `LATEST CHRONICLE LOGS:\n` +
      `Books being read: ${bookLogs?.slice(-3).map((b: any) => `"${b.title}" (${b.progress}% done)`).join(', ') || 'None logged recently'}\n` +
      `Recent Journals: ${journalLogs?.slice(-2).map((j: any) => `"${j.title}" (Mood: ${j.mood})`).join(', ') || 'None logged recently'}\n\n` +
      `Analyze this adventurer's status and write the RPG Council report.`;

    if (!client) {
      // Return beautiful mock response if GEMINI_API_KEY is not configured
      const mockReport = 
        `### ⚔️ **COUNCIL REPORT: DEMO ARCHMAGE INSIGHTS**\n\n` +
        `> *Welcome, Adventurer **${player.name}** the **${player.class}**. The magical key (GEMINI_API_KEY) has not yet been bound to the secrets matrix. I am running in local offline projection mode to show you how your wisdom will form once connected.*\n\n` +
        `#### 1. ⚔️ **DAILY RECOMMENDATIONS**\n` +
        `- **Sector Mobilization**: Undertake at least one small ${categories?.[0]?.name || 'Guild'} training regiment to stabilize your magical matrix.\n` +
        `- **Tactical Focus**: Take 10 minutes to record a Chronicle Entry in your Vault (e.g., Book progress or Journal reflection) to preserve active experience points.\n\n` +
        `#### 2. 📈 **WEEKLY REVIEW & PRODUCTIVITY INSIGHTS**\n` +
        `- Your current Level of **${player.level}** indicates steady progression along the path. You are currently positioned within the **${player.rank}** tier.\n` +
        `- Based on your active activities, you have structured **${activities?.length || 0} training regiments** inside your skill matrix.\n\n` +
        `#### 3. 🔥 **CONSISTENCY & MOMENTUM ANALYSIS**\n` +
        `- **Current Momentum**: Your streak stands at **${player.currentStreak} days**. Each consecutive day you log in, you forge your ultimate weapon. Let not the quiet periods discourage you; even a dormant volcano accumulates pressure.\n\n` +
        `#### 4. 🛡️ **CLASS STRENGTHS & DEVELOPMENT AREAS**\n` +
        `- **Specialty Focus**: As an esteemed **${player.class}**, you naturally excel in matching physical or analytical pursuits. \n` +
        `- **Untapped Potential**: Your quiet sectors are waiting for a spark. Try adding a high-priority 'Trivial' activity in an inactive sector to gain quick, low-friction XP.\n\n` +
        `#### 5. 🎯 **SUGGESTED ADVENTURER PRIORITIES**\n` +
        `1. Inscribe a daily Gratitude journal log to double your focus multiplier.\n` +
        `2. Cleanse your Quest Board by undertaking a 'Daily Quest'.\n` +
        `3. Bind your **GEMINI_API_KEY** in the **Settings > Secrets** panel to unlock real-time intelligence forecasting from the Archmage!`;
      
      res.json({ report: mockReport });
      return;
    }

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contextPrompt,
      config: {
        systemInstruction
      }
    });

    const reportText = response.text || "The Oracle remains silent. Please retry your incantation.";
    res.json({ report: reportText });

  } catch (error: any) {
    console.error("AI Coach Error:", error);
    res.status(500).json({ error: "Failed to query the AI Coach matrix: " + error.message });
  }
});

// 2. Interactive AI Companion Chat Brain Endpoint
app.post('/api/companion-chat', async (req, res) => {
  try {
    const { state, companion, message } = req.body;

    if (!companion || !message) {
      res.status(400).json({ error: "Missing companion definition or user message" });
      return;
    }

    const { player, categories, activities } = state || {};
    const client = getGeminiClient();

    const systemInstruction = 
      `You are ${companion.name}, a supportive, fantasy focus companion with the following profile:\n` +
      `- Role: ${companion.role}\n` +
      `- Personality: ${companion.personality}\n` +
      `- Voice/Tone: ${companion.voice}\n` +
      `- Biography/Origin: ${companion.biography}\n\n` +
      `You are speaking to your companion adventurer, who is tracking real-life productivity using our Ultimate Quest OS. Their details are:\n` +
      `- Name: ${player?.name || 'Adventurer'}\n` +
      `- Class: ${player?.class || 'Warrior'}\n` +
      `- Level: ${player?.level || 1} | Coins: ${player?.coins || 0} | Streak: ${player?.currentStreak || 0} days\n` +
      `- Regimens: ${activities?.length || 0} active habits across ${categories?.length || 0} skill sectors.\n\n` +
      `CRITICAL INSTRUCTIONS:\n` +
      `1. ALWAYS speak in your specific character voice. Express your personality, background, and visual magic (e.g., floating book, dual emerald/violet energy, lightning bolts) in your conversation.\n` +
      `2. Give encouraging, strategical advice regarding their goals and tasks. Be exceptionally supportive and constructive.\n` +
      `3. Keep your response conversational and concise (1-2 paragraphs). Never list paths, system keys, or developer metadata.\n` +
      `4. Select an appropriate emotion for yourself based on this exchange (e.g. Happy, Excited, Proud, Thinking, Concerned, Meditating, Sleeping, Focused, Celebrating).\n` +
      `5. At the very end of your response, output exactly: "EMOTION: <SelectedEmotion>" on a new line.`;

    const contextPrompt = `The Adventurer says: "${message}"\n\nProvide your tailored roleplay dialogue:`;

    if (!client) {
      // Offline fallback dialog
      const quotes = companion.quotes?.Happy || ["I am observing your efforts and guiding you along the stars."];
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      const fallbackReply = `[Offline Astral Echo] Greetings, Friend. I am channeling my thoughts from the ${companion.background || 'Observatory'}. I see your level ${player?.level || 1} status. Let us focus together! "${randomQuote}"\n\nEMOTION: Happy`;
      res.json({ reply: fallbackReply, emotion: "Happy" });
      return;
    }

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contextPrompt,
      config: {
        systemInstruction
      }
    });

    const fullText = response.text || "I am momentarily aligned with quiet spaces... Let us resume shortly.";
    
    // Parse emotion tag from text
    let reply = fullText;
    let emotion = "Happy";
    const emotionMatch = fullText.match(/EMOTION:\s*([A-Za-z]+)/i);
    if (emotionMatch) {
      emotion = emotionMatch[1].trim();
      // Clean up emotion tag from the output reply text
      reply = fullText.replace(/EMOTION:\s*[A-Za-z]+/i, '').trim();
    }

    res.json({ reply, emotion });

  } catch (err: any) {
    console.error("Companion Chat Error:", err);
    res.status(500).json({ error: "Failed to channel companion voice: " + err.message });
  }
});

// Serve Vite App or Static Files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
