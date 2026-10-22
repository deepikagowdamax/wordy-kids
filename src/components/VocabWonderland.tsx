import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, Sparkles, Check, ChevronLeft, ChevronRight, LayoutGrid, Eye, Star } from 'lucide-react';
import { CategoryId, WordItem, AudioSettings, UserProgress } from '../types.ts';
import { VOCABULARY_CATEGORIES, VOCABULARY_DATA } from '../data/vocabularyData.ts';
import { speakText, soundEffects } from '../utils/audio.ts';
import { recordActivity } from '../utils/activity.ts';

interface VocabWonderlandProps {
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
  audioSettings: AudioSettings;
}

export const VocabWonderland: React.FC<VocabWonderlandProps> = ({
  progress,
  onUpdateProgress,
  audioSettings,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('animals');
  const [viewMode, setViewMode] = useState<'card' | 'grid'>('card');
  const [activeWordIndex, setActiveWordIndex] = useState<number>(0);

  // Filter words by category
  const categoryWords = VOCABULARY_DATA.filter((w) => w.category === selectedCategory);
  const currentWord: WordItem = categoryWords[activeWordIndex] || categoryWords[0];
  const isMastered = progress.masteredWords.includes(currentWord?.id || '');

  // Pronounce word
  const speakWord = (word: string, slow = false) => {
    soundEffects.click(audioSettings.soundEffects);
    speakText(word, {
      rate: slow ? 0.75 : audioSettings.rate,
      pitch: audioSettings.pitch,
      accent: audioSettings.accent,
    });
  };

  // Pronounce single letter phonics when tapping letter badges
  const speakLetter = (letter: string) => {
    soundEffects.click(audioSettings.soundEffects);
    speakText(letter, {
      rate: 0.9,
      pitch: audioSettings.pitch,
      accent: audioSettings.accent,
    });
  };

  // Pronounce example sentence
  const speakSentence = (sentence: string) => {
    soundEffects.click(audioSettings.soundEffects);
    speakText(sentence, {
      rate: audioSettings.rate,
      pitch: audioSettings.pitch,
      accent: audioSettings.accent,
    });
  };

  // Mark word as learned/mastered
  const toggleMastery = () => {
    if (!currentWord) return;
    const wordId = currentWord.id;
    const already = progress.masteredWords.includes(wordId);

    if (!already) {
      soundEffects.star(audioSettings.soundEffects);
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
      speakText(`Awesome! You learned ${currentWord.word}!`, { rate: audioSettings.rate });
    } else {
      soundEffects.click(audioSettings.soundEffects);
    }

    onUpdateProgress((prev) => {
      const exists = prev.masteredWords.includes(wordId);
      const updated = {
        ...prev,
        stars: exists ? prev.stars : prev.stars + 2,
        masteredWords: exists
          ? prev.masteredWords.filter((id) => id !== wordId)
          : [...prev.masteredWords, wordId],
      };
      return exists ? updated : recordActivity(updated, 'word', 2);
    });
  };

  const nextWord = () => {
    soundEffects.click(audioSettings.soundEffects);
    setActiveWordIndex((prev) => (prev + 1) % categoryWords.length);
  };

  const prevWord = () => {
    soundEffects.click(audioSettings.soundEffects);
    setActiveWordIndex((prev) => (prev - 1 + categoryWords.length) % categoryWords.length);
  };

  const currentCategoryMeta = VOCABULARY_CATEGORIES.find((c) => c.id === selectedCategory) || VOCABULARY_CATEGORIES[0];

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border-2 border-amber-200">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">📚</span>
            <div>
              <h2 className="font-fredoka text-xl sm:text-2xl font-bold text-slate-800">
                Word World Vocabulary
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold">
                Tap words to listen, spell letters, and expand your vocabulary!
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-amber-50 p-1 rounded-2xl border border-amber-200">
            <button
              onClick={() => { setViewMode('card'); soundEffects.click(audioSettings.soundEffects); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-fredoka font-bold transition-all ${
                viewMode === 'card'
                  ? 'bg-amber-400 text-amber-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Big Card</span>
            </button>
            <button
              onClick={() => { setViewMode('grid'); soundEffects.click(audioSettings.soundEffects); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-fredoka font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-amber-400 text-amber-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Word Grid</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
          {VOCABULARY_CATEGORIES.map((cat) => {
            const isSelected = cat.id === selectedCategory;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setActiveWordIndex(0);
                  soundEffects.click(audioSettings.soundEffects);
                }}
                className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl font-fredoka text-sm font-bold border-2 transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 border-amber-500 shadow-md scale-102'
                    : 'bg-amber-50/70 hover:bg-amber-100/80 text-slate-700 border-amber-200'
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'card' && currentWord ? (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-3 border-amber-300 relative overflow-hidden text-center transition-all">
            {/* Header badges: Category & learned status */}
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 flex items-center gap-1.5">
                <span>{currentCategoryMeta.icon}</span>
                <span>{currentCategoryMeta.name}</span>
                <span className="text-slate-400">({activeWordIndex + 1}/{categoryWords.length})</span>
              </span>

              <button
                onClick={toggleMastery}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs sm:text-sm font-fredoka font-bold transition-all border ${
                  isMastered
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-amber-50'
                }`}
              >
                <Star className={`w-4 h-4 ${isMastered ? 'fill-emerald-500 text-emerald-600' : 'text-slate-400'}`} />
                <span>{isMastered ? 'Learned! ⭐' : 'Mark Learned'}</span>
              </button>
            </div>

            {/* Giant Illustrated Emoji with gentle animation */}
            <div 
              onClick={() => speakWord(currentWord.word)}
              className="w-36 h-36 sm:w-44 sm:h-44 mx-auto rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border-4 border-amber-200 shadow-inner flex items-center justify-center text-6xl sm:text-7xl cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              title="Click to hear word!"
            >
              <span className="animate-float">{currentWord.emoji}</span>
            </div>

            {/* Word Name */}
            <h3 className="font-fredoka text-4xl sm:text-5xl font-extrabold text-slate-900 mt-5 tracking-tight">
              {currentWord.word}
            </h3>

            {/* Phonetic Pronunciation Guide */}
            <p className="text-xs sm:text-sm font-bold text-amber-700 mt-1 uppercase tracking-wider">
              Sounds like: [{currentWord.phonetic}]
            </p>

            {/* Interactive Letter Tiles: tap to hear each letter */}
            <div className="mt-4 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-400 mr-1">Spell:</span>
              {currentWord.word.split('').map((letter, idx) => (
                <button
                  key={idx}
                  onClick={() => speakLetter(letter)}
                  className="w-9 h-10 sm:w-10 sm:h-11 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-fredoka font-bold text-lg sm:text-xl border-2 border-amber-300 shadow-xs active:scale-90 transition-all flex items-center justify-center"
                  title={`Tap letter ${letter}`}
                >
                  {letter}
                </button>
              ))}
            </div>

            {/* If Numbers category: Interactive Counting Beads! */}
            {currentWord.count !== undefined && (
              <div className="mt-4 p-3 bg-amber-50/80 rounded-2xl border border-amber-200">
                <p className="text-xs font-bold text-amber-900 mb-2">
                  Tap to count all {currentWord.count} items!
                </p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {Array.from({ length: currentWord.count }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => speakWord(`${i + 1}`)}
                      className="w-8 h-8 rounded-full bg-amber-400 text-amber-950 font-fredoka font-bold text-sm shadow-sm hover:scale-110 active:scale-95 transition-all flex items-center justify-center border border-amber-500"
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Meaning & Definition */}
            <p className="text-sm sm:text-base text-slate-600 font-semibold mt-4 max-w-lg mx-auto">
              {currentWord.definition}
            </p>

            {/* Example sentence */}
            <div className="mt-4 p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 text-left flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">Example sentence:</span>
                <p className="text-xs sm:text-sm text-slate-800 font-bold mt-0.5">
                  "{currentWord.exampleSentence}"
                </p>
              </div>
              <button
                onClick={() => speakSentence(currentWord.exampleSentence)}
                className="shrink-0 p-2.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 transition-colors shadow-xs active:scale-95"
                title="Read aloud"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {/* Audio action buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => speakWord(currentWord.word, false)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-amber-950 font-fredoka font-bold text-lg shadow-md hover:brightness-105 active:scale-95 transition-all"
              >
                <Volume2 className="w-5 h-5 text-amber-950" />
                <span>Hear "{currentWord.word}"</span>
              </button>

              <button
                onClick={() => speakWord(currentWord.word, true)}
                className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-white text-slate-800 font-fredoka font-bold text-base border-2 border-amber-300 shadow-sm hover:bg-amber-50 active:scale-95 transition-all"
                title="Hear word slowly"
              >
                <span className="text-2xl">🐢</span>
                <span className="hidden sm:inline">Slow</span>
              </button>
            </div>
          </div>

          {/* Previous / Next buttons */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={prevWord}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white border-2 border-amber-200 hover:bg-amber-50 font-fredoka font-bold text-slate-700 shadow-xs active:scale-95 transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-amber-600" />
              <span>Previous Word</span>
            </button>

            <button
              onClick={nextWord}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-amber-400 border-2 border-amber-500 hover:bg-amber-500 font-fredoka font-bold text-amber-950 shadow-sm active:scale-95 transition-all"
            >
              <span>Next Word</span>
              <ChevronRight className="w-5 h-5 text-amber-950" />
            </button>
          </div>
        </div>
      ) : (
        /* Grid Mode: Soundboard of all words in this category */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categoryWords.map((item, idx) => {
            const learned = progress.masteredWords.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => {
                  speakWord(item.word);
                  setActiveWordIndex(idx);
                }}
                className={`bg-white rounded-3xl p-4 border-3 transition-all cursor-pointer transform hover:-translate-y-1 active:scale-95 shadow-sm text-center relative ${
                  learned ? 'border-emerald-300 bg-emerald-50/20' : 'border-amber-200 hover:border-amber-400'
                }`}
              >
                {learned && (
                  <span className="absolute top-2 right-2 text-xs bg-emerald-500 text-white rounded-full px-1.5 py-0.5 font-bold shadow-xs">
                    ⭐
                  </span>
                )}
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center text-4xl sm:text-5xl mb-2">
                  {item.emoji}
                </div>
                <h4 className="font-fredoka text-xl font-bold text-slate-900">
                  {item.word}
                </h4>
                <p className="text-xs text-amber-700 font-semibold mt-0.5">
                  [{item.phonetic}]
                </p>

                <div className="mt-3 flex items-center justify-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(item.word, false);
                    }}
                    className="p-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors"
                    title="Pronounce"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(item.word, true);
                    }}
                    className="p-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 transition-colors text-xs"
                    title="Slow"
                  >
                    🐢
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
