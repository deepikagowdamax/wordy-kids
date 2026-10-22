import React from 'react';
import { Volume2, VolumeX, Star, Sparkles, BookOpen, Compass, Gamepad2, Award, HeartHandshake } from 'lucide-react';
import { AudioSettings, UserProgress } from '../types.ts';
import { soundEffects } from '../utils/audio.ts';

interface NavbarProps {
  activeTab: 'alphabet' | 'vocab' | 'games' | 'stickers' | 'parents';
  setActiveTab: (tab: 'alphabet' | 'vocab' | 'games' | 'stickers' | 'parents') => void;
  progress: UserProgress;
  audioSettings: AudioSettings;
  setAudioSettings: React.Dispatch<React.SetStateAction<AudioSettings>>;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  progress,
  audioSettings,
  setAudioSettings,
}) => {
  const toggleSound = () => {
    const nextVal = !audioSettings.soundEffects;
    setAudioSettings(prev => ({ ...prev, soundEffects: nextVal }));
    if (nextVal) {
      soundEffects.pop(true);
    }
  };

  const toggleSpeed = () => {
    // Toggle between Turtle 0.8x and Normal 1.0x
    const newRate = audioSettings.rate < 0.9 ? 1.0 : 0.8;
    setAudioSettings(prev => ({ ...prev, rate: newRate }));
    soundEffects.click(audioSettings.soundEffects);
  };

  const navItems = [
    { id: 'alphabet' as const, label: 'ABC Safari', icon: Compass, color: 'text-amber-600 bg-amber-100 border-amber-300' },
    { id: 'vocab' as const, label: 'Word World', icon: BookOpen, color: 'text-emerald-600 bg-emerald-100 border-emerald-300' },
    { id: 'games' as const, label: 'Fun Games', icon: Gamepad2, color: 'text-violet-600 bg-violet-100 border-violet-300' },
    { id: 'stickers' as const, label: 'Sticker Park', icon: Award, color: 'text-rose-600 bg-rose-100 border-rose-300' },
    { id: 'parents' as const, label: 'Progress', icon: HeartHandshake, color: 'text-sky-600 bg-sky-100 border-sky-300' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-4 border-amber-200 shadow-sm transition-all">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Logo and mascot */}
        <div 
          onClick={() => { setActiveTab('alphabet'); soundEffects.click(audioSettings.soundEffects); }}
          className="flex items-center gap-2 cursor-pointer group select-none"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 flex items-center justify-center shadow-md transform group-hover:scale-105 group-hover:rotate-3 transition-transform text-2xl sm:text-3xl">
            🦊
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-fredoka font-bold text-xl sm:text-2xl tracking-wide bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent">
                WonderWords
              </span>
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <p className="text-[10px] sm:text-xs font-bold text-amber-800/80 -mt-0.5 tracking-wider uppercase">
              Kids English Adventure
            </p>
          </div>
        </div>

        {/* Navigation tabs for larger screens */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  soundEffects.click(audioSettings.soundEffects);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-fredoka text-base font-semibold transition-all select-none ${
                  isActive
                    ? 'bg-amber-400 text-amber-950 shadow-md scale-105 border-2 border-amber-500'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-amber-100/60'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-amber-950 animate-bounce' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right side controls: Stars & Audio toggles */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Turtle / Bunny Speech Speed Button */}
          <button
            onClick={toggleSpeed}
            title={audioSettings.rate < 0.9 ? 'Slow Turtle Speech (Click for Normal)' : 'Normal Speech (Click for Slow Phonics)'}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-fredoka font-bold bg-amber-100 text-amber-900 border-2 border-amber-300 hover:bg-amber-200 transition-all active:scale-95 shadow-sm"
          >
            <span className="text-base sm:text-lg">{audioSettings.rate < 0.9 ? '🐢' : '🐇'}</span>
            <span className="hidden sm:inline">{audioSettings.rate < 0.9 ? 'Slow' : 'Normal'}</span>
          </button>

          {/* Sound Mute/Unmute */}
          <button
            onClick={toggleSound}
            title={audioSettings.soundEffects ? 'Sound Effects ON' : 'Sound Effects OFF'}
            className={`p-2 rounded-xl border-2 transition-all active:scale-95 shadow-sm ${
              audioSettings.soundEffects
                ? 'bg-emerald-100 border-emerald-300 text-emerald-800 hover:bg-emerald-200'
                : 'bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {audioSettings.soundEffects ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Star Bank Counter */}
          <div 
            onClick={() => { setActiveTab('stickers'); soundEffects.star(audioSettings.soundEffects); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 font-fredoka font-bold text-base sm:text-lg shadow-md border-2 border-amber-400 cursor-pointer active:scale-95 hover:brightness-105 transition-all"
            title="Your Stars! Click to visit Sticker Park"
          >
            <Star className="w-5 h-5 fill-amber-950 text-amber-950 animate-wiggle" />
            <span>{progress.stars}</span>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden flex items-center justify-around py-1.5 px-2 bg-white/95 border-t border-amber-200 shadow-inner">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                soundEffects.click(audioSettings.soundEffects);
              }}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl font-fredoka text-xs font-semibold transition-all ${
                isActive
                  ? 'text-amber-900 bg-amber-200/80 scale-105 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-amber-700' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
