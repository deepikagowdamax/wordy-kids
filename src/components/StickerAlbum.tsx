import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Lock, Sparkles, Trash2, RotateCw, Plus, Image as ImageIcon } from 'lucide-react';
import { AudioSettings, PlacedSticker, StickerItem, UserProgress } from '../types.ts';
import { STICKERS_DATA } from '../data/stickersData.ts';
import { soundEffects, speakText } from '../utils/audio.ts';

interface StickerAlbumProps {
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
  audioSettings: AudioSettings;
}

type SceneTheme = 'meadow' | 'beach' | 'space' | 'castle';

export const StickerAlbum: React.FC<StickerAlbumProps> = ({
  progress,
  onUpdateProgress,
  audioSettings,
}) => {
  const [currentScene, setCurrentScene] = useState<SceneTheme>('meadow');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'animals' | 'magic' | 'space' | 'badges'>('all');
  const [activePlacedId, setActivePlacedId] = useState<string | null>(null);

  const sceneContainerRef = useRef<HTMLDivElement | null>(null);

  const SCENE_THEMES: { id: SceneTheme; name: string; emoji: string; bgClass: string; decor: string }[] = [
    {
      id: 'meadow',
      name: 'Sunny Meadow',
      emoji: '🌻',
      bgClass: 'bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-200',
      decor: '🌳 🌷 🌿 🌼 🍄',
    },
    {
      id: 'beach',
      name: 'Ocean Beach',
      emoji: '🌊',
      bgClass: 'bg-gradient-to-b from-cyan-200 via-sky-100 to-amber-200',
      decor: '🌴 🐚 🦀 ⛱️ ⛵',
    },
    {
      id: 'space',
      name: 'Cosmic Space',
      emoji: '🚀',
      bgClass: 'bg-gradient-to-b from-indigo-950 via-purple-900 to-slate-900',
      decor: '⭐ 🪐 ☄️ ✨ 🛰️',
    },
    {
      id: 'castle',
      name: 'Fairy Castle',
      emoji: '🏰',
      bgClass: 'bg-gradient-to-b from-pink-200 via-purple-100 to-rose-200',
      decor: '👑 🪄 🏰 🌸 🎠',
    },
  ];

  const currentThemeObj = SCENE_THEMES.find((s) => s.id === currentScene) || SCENE_THEMES[0];

  // Filter stickers
  const displayedStickers = STICKERS_DATA.filter((stk) => {
    if (selectedCategory === 'all') return true;
    return stk.category === selectedCategory;
  });

  // Unlock sticker if stars are sufficient
  const unlockSticker = (sticker: StickerItem) => {
    if (progress.stars < sticker.requiredStars) {
      soundEffects.tryAgain(audioSettings.soundEffects);
      speakText(`You need ${sticker.requiredStars} stars to unlock ${sticker.name}! Keep learning!`, {
        rate: audioSettings.rate,
      });
      return;
    }

    soundEffects.fanfare(audioSettings.soundEffects);
    try {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    } catch {
      // ignore
    }

    onUpdateProgress((prev) => ({
      ...prev,
      unlockedStickers: [...prev.unlockedStickers, sticker.id],
    }));

    speakText(`Hooray! You unlocked the ${sticker.name} sticker!`, {
      rate: audioSettings.rate,
    });
  };

  // Add sticker to scene canvas
  const addStickerToScene = (sticker: StickerItem) => {
    soundEffects.pop(audioSettings.soundEffects);
    const newPlaced: PlacedSticker = {
      id: `placed-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      stickerId: sticker.id,
      emoji: sticker.emoji,
      x: 35 + Math.random() * 30,
      y: 35 + Math.random() * 30,
      scale: 1.0,
      rotation: (Math.random() - 0.5) * 20,
    };

    onUpdateProgress((prev) => ({
      ...prev,
      placedStickers: [...prev.placedStickers, newPlaced],
    }));
    setActivePlacedId(newPlaced.id);
  };

  // Dragging sticker inside scene
  const handleDrag = (e: React.MouseEvent | React.TouchEvent, placedId: string) => {
    e.stopPropagation();
    setActivePlacedId(placedId);
    const container = sceneContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if ('touches' in moveEvent) {
        clientX = moveEvent.touches[0].clientX;
        clientY = moveEvent.touches[0].clientY;
      } else {
        clientX = moveEvent.clientX;
        clientY = moveEvent.clientY;
      }

      const rawX = ((clientX - rect.left) / rect.width) * 100;
      const rawY = ((clientY - rect.top) / rect.height) * 100;
      const clampedX = Math.max(5, Math.min(95, rawX));
      const clampedY = Math.max(5, Math.min(95, rawY));

      onUpdateProgress((prev) => ({
        ...prev,
        placedStickers: prev.placedStickers.map((item) =>
          item.id === placedId ? { ...item, x: clampedX, y: clampedY } : item
        ),
      }));
    };

    const onEnd = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onEnd);
  };

  // Rotate selected sticker
  const rotateSticker = (placedId: string) => {
    soundEffects.click(audioSettings.soundEffects);
    onUpdateProgress((prev) => ({
      ...prev,
      placedStickers: prev.placedStickers.map((item) =>
        item.id === placedId ? { ...item, rotation: (item.rotation + 25) % 360 } : item
      ),
    }));
  };

  // Scale selected sticker
  const scaleSticker = (placedId: string) => {
    soundEffects.click(audioSettings.soundEffects);
    onUpdateProgress((prev) => ({
      ...prev,
      placedStickers: prev.placedStickers.map((item) => {
        if (item.id !== placedId) return item;
        const nextScale = item.scale >= 1.6 ? 0.9 : item.scale + 0.25;
        return { ...item, scale: Number(nextScale.toFixed(2)) };
      }),
    }));
  };

  // Remove sticker
  const removeSticker = (placedId: string) => {
    soundEffects.click(audioSettings.soundEffects);
    onUpdateProgress((prev) => ({
      ...prev,
      placedStickers: prev.placedStickers.filter((item) => item.id !== placedId),
    }));
    setActivePlacedId(null);
  };

  // Clear all stickers in scene
  const clearScene = () => {
    soundEffects.click(audioSettings.soundEffects);
    onUpdateProgress((prev) => ({
      ...prev,
      placedStickers: [],
    }));
    setActivePlacedId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Scene theme selector */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border-2 border-amber-200">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">🏆</span>
            <div>
              <h2 className="font-fredoka text-xl sm:text-2xl font-bold text-slate-800">
                Sticker Park & Trophy World
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold">
                Collect badges with your stars, decorate scenes, and create your own stories!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1.5 rounded-full border border-amber-300">
              ⭐ Available Stars: {progress.stars}
            </span>
          </div>
        </div>

        {/* Scene Background Theme Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-bold text-slate-500 shrink-0 mr-1">Choose Scene:</span>
          {SCENE_THEMES.map((scene) => {
            const isSelected = scene.id === currentScene;
            return (
              <button
                key={scene.id}
                onClick={() => {
                  setCurrentScene(scene.id);
                  soundEffects.click(audioSettings.soundEffects);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl font-fredoka text-xs sm:text-sm font-bold border-2 transition-all shrink-0 ${
                  isSelected
                    ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>{scene.emoji}</span>
                <span>{scene.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Scene Canvas */}
      <div className="relative">
        <div
          ref={sceneContainerRef}
          className={`w-full aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden border-4 border-amber-300 shadow-md relative select-none touch-none ${currentThemeObj.bgClass}`}
        >
          {/* Subtle thematic scenery watermark */}
          <div className="absolute bottom-2 left-4 text-2xl sm:text-4xl opacity-50 tracking-widest pointer-events-none select-none">
            {currentThemeObj.decor}
          </div>

          {/* Prompt if no stickers placed */}
          {progress.placedStickers.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center pointer-events-none">
              <span className="text-4xl sm:text-5xl mb-2 animate-bounce">🎨</span>
              <p className="font-fredoka text-lg sm:text-xl font-bold text-slate-700/80 drop-shadow-xs">
                Your scene is empty!
              </p>
              <p className="text-xs sm:text-sm font-semibold text-slate-600/80">
                Tap unlocked stickers below to place them in your world!
              </p>
            </div>
          )}

          {/* Placed Stickers */}
          {progress.placedStickers.map((placed) => {
            const isSelected = placed.id === activePlacedId;
            return (
              <div
                key={placed.id}
                onMouseDown={(e) => handleDrag(e, placed.id)}
                onTouchStart={(e) => handleDrag(e, placed.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePlacedId(placed.id);
                  soundEffects.click(audioSettings.soundEffects);
                }}
                style={{
                  left: `${placed.x}%`,
                  top: `${placed.y}%`,
                  transform: `translate(-50%, -50%) rotate(${placed.rotation}deg) scale(${placed.scale})`,
                }}
                className={`absolute cursor-grab active:cursor-grabbing p-1.5 rounded-2xl transition-shadow ${
                  isSelected ? 'ring-2 ring-amber-400 bg-white/40 shadow-lg' : 'hover:scale-105'
                }`}
              >
                <span className="text-4xl sm:text-6xl drop-shadow-md block select-none">
                  {placed.emoji}
                </span>

                {/* Micro control toolbar when sticker is selected */}
                {isSelected && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/95 rounded-xl px-2 py-1 shadow-md border border-slate-200 z-30"
                  >
                    <button
                      onClick={() => rotateSticker(placed.id)}
                      title="Rotate"
                      className="p-1 hover:bg-slate-100 rounded-lg text-slate-700 text-xs"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => scaleSticker(placed.id)}
                      title="Resize"
                      className="p-1 hover:bg-slate-100 rounded-lg text-slate-700 text-xs font-bold"
                    >
                      Aa
                    </button>
                    <button
                      onClick={() => removeSticker(placed.id)}
                      title="Remove"
                      className="p-1 hover:bg-rose-100 rounded-lg text-rose-600 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Clear Scene button */}
        {progress.placedStickers.length > 0 && (
          <button
            onClick={clearScene}
            className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-xs text-xs font-bold text-slate-700 hover:text-rose-600 shadow-sm border border-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Scene</span>
          </button>
        )}
      </div>

      {/* Sticker Drawer Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border-2 border-amber-200 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-fredoka text-lg sm:text-xl font-bold text-slate-800">
              Your Sticker Drawer
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              Tap any unlocked sticker to place it onto the scene!
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-2xl">
            {(['all', 'animals', 'magic', 'space', 'badges'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setSelectedCategory(tab);
                  soundEffects.click(audioSettings.soundEffects);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-fredoka font-bold capitalize transition-all ${
                  selectedCategory === tab
                    ? 'bg-white text-amber-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Sticker Cards Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {displayedStickers.map((sticker) => {
            const isUnlocked = progress.unlockedStickers.includes(sticker.id);
            const canAfford = progress.stars >= sticker.requiredStars;

            return (
              <div
                key={sticker.id}
                onClick={() => {
                  if (isUnlocked) {
                    addStickerToScene(sticker);
                  } else {
                    unlockSticker(sticker);
                  }
                }}
                className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer transform active:scale-95 ${
                  isUnlocked
                    ? 'bg-amber-50/60 border-amber-300 hover:border-amber-400 hover:scale-105 shadow-xs'
                    : canAfford
                    ? 'bg-emerald-50/70 border-emerald-300 hover:border-emerald-500 hover:scale-105 shadow-xs animate-pulse'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="text-4xl sm:text-5xl mb-1.5 flex items-center justify-center h-14">
                  {isUnlocked ? (
                    sticker.emoji
                  ) : (
                    <div className="relative">
                      <span className="blur-[2px] opacity-40">{sticker.emoji}</span>
                      <Lock className="w-5 h-5 text-slate-500 absolute inset-0 m-auto" />
                    </div>
                  )}
                </div>

                <p className="text-xs font-fredoka font-bold text-slate-800 truncate">
                  {sticker.name}
                </p>

                <div className="mt-1">
                  {isUnlocked ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <Plus className="w-3 h-3" /> Add
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        canAfford
                          ? 'bg-emerald-500 text-white'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      ⭐ {sticker.requiredStars}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
