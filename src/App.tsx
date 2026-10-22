/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { AlphabetSafari } from './components/AlphabetSafari.tsx';
import { VocabWonderland } from './components/VocabWonderland.tsx';
import { GamesHub } from './components/GamesHub.tsx';
import { StickerAlbum } from './components/StickerAlbum.tsx';
import { ParentDashboard } from './components/ParentDashboard.tsx';
import { AudioSettings, UserProgress } from './types.ts';
import { loadAudioSettings, loadProgress, saveAudioSettings, saveProgress } from './utils/storage.ts';
import { soundEffects, speakText } from './utils/audio.ts';
import { Sparkles, Compass, BookOpen, Gamepad2, Award, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'alphabet' | 'vocab' | 'games' | 'stickers' | 'parents'>('alphabet');
  const [progress, setProgress] = useState<UserProgress>(loadProgress);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(loadAudioSettings);

  // Save progress changes to localStorage
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // Save audio setting changes to localStorage
  useEffect(() => {
    saveAudioSettings(audioSettings);
  }, [audioSettings]);

  const handleUpdateProgress = (updater: (prev: UserProgress) => UserProgress) => {
    setProgress((prev) => updater(prev));
  };

  const handleResetProgress = () => {
    const fresh: UserProgress = {
      stars: 5,
      tracedLetters: [],
      masteredWords: [],
      gamesPlayed: 0,
      unlockedStickers: ['stk-lion', 'stk-star'],
      placedStickers: [],
      streakDays: 1,
      lastPlayedDate: new Date().toISOString().split('T')[0],
    };
    setProgress(fresh);
    saveProgress(fresh);
    soundEffects.correct(audioSettings.soundEffects);
    speakText('Progress has been reset. Ready for a new adventure!', { rate: audioSettings.rate });
  };

  const handleMascotGreet = () => {
    soundEffects.star(audioSettings.soundEffects);
    speakText('Hello little explorer! Let us learn English today! Pick any fun game or letter!', {
      rate: audioSettings.rate,
      pitch: 1.2,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBEB] text-slate-800">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        progress={progress}
        audioSettings={audioSettings}
        setAudioSettings={setAudioSettings}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
        {/* Playful Welcome Hero Greeting Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 p-4 sm:p-6 shadow-md border-3 border-amber-500 text-white select-none">
          {/* Decorative floating bubbles in background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 left-20 w-48 h-48 bg-yellow-300/20 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div
                onClick={handleMascotGreet}
                className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-3xl bg-white/95 shadow-lg border-2 border-amber-300 flex items-center justify-center text-4xl sm:text-5xl cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                title="Tap Pip the Fox to hear hello!"
              >
                <span className="animate-wiggle">🦊</span>
              </div>
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-1.5">
                  <span className="text-xs sm:text-sm font-bold bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Welcome, Explorer! ⭐
                  </span>
                  <Sparkles className="w-4 h-4 text-yellow-200 animate-spin" style={{ animationDuration: '8s' }} />
                </div>
                <h1 className="font-fredoka text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5 drop-shadow-xs">
                  Ready to Learn English with Pip?
                </h1>
                <p className="text-white/90 text-xs sm:text-sm font-semibold max-w-lg mt-0.5">
                  Listen to phonics, trace letters, discover new words, and win star badges!
                </p>
              </div>
            </div>

            {/* Quick Activity Shortcuts */}
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
              <button
                onClick={() => { setActiveTab('alphabet'); soundEffects.click(audioSettings.soundEffects); }}
                className="px-3.5 py-2 rounded-2xl bg-white text-amber-950 font-fredoka font-bold text-xs sm:text-sm shadow-sm hover:bg-amber-50 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Compass className="w-4 h-4 text-amber-600" />
                <span>Trace Letters</span>
              </button>
              <button
                onClick={() => { setActiveTab('games'); soundEffects.click(audioSettings.soundEffects); }}
                className="px-3.5 py-2 rounded-2xl bg-amber-950 text-amber-200 font-fredoka font-bold text-xs sm:text-sm shadow-sm hover:bg-amber-900 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Gamepad2 className="w-4 h-4 text-amber-400" />
                <span>Play Games</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Tab Views */}
        {activeTab === 'alphabet' && (
          <AlphabetSafari
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
            audioSettings={audioSettings}
          />
        )}

        {activeTab === 'vocab' && (
          <VocabWonderland
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
            audioSettings={audioSettings}
          />
        )}

        {activeTab === 'games' && (
          <GamesHub
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
            audioSettings={audioSettings}
          />
        )}

        {activeTab === 'stickers' && (
          <StickerAlbum
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
            audioSettings={audioSettings}
          />
        )}

        {activeTab === 'parents' && (
          <ParentDashboard
            progress={progress}
            onResetProgress={handleResetProgress}
            audioSettings={audioSettings}
            setAudioSettings={setAudioSettings}
          />
        )}
      </main>

      {/* Cheerful Safe Kid Footer */}
      <footer className="mt-auto border-t-2 border-amber-200 bg-white/80 py-4 px-4 text-center text-xs font-semibold text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-fredoka text-amber-800 font-bold text-sm">WonderWords</span>
            <span>• 100% Kid Safe & Ad-Free Learning</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with care for young English learners</span>
            <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-500" />
          </div>
        </div>
      </footer>
    </div>
  );
}
