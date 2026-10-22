import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, RotateCcw, Trophy, Sparkles, CheckCircle2, HelpCircle, ArrowRight, Play } from 'lucide-react';
import { AudioSettings, UserProgress, WordItem } from '../types.ts';
import { VOCABULARY_DATA } from '../data/vocabularyData.ts';
import { SIGHT_WORDS_DATA } from '../data/sightWordsData.ts';
import { SENTENCE_PUZZLES } from '../data/sentenceData.ts';
import { speakText, soundEffects } from '../utils/audio.ts';
import { recordActivity } from '../utils/activity.ts';

interface GamesHubProps {
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
  audioSettings: AudioSettings;
}

type ActiveGame = 'spelling' | 'quiz' | 'balloons' | 'sentences';

export const GamesHub: React.FC<GamesHubProps> = ({
  progress,
  onUpdateProgress,
  audioSettings,
}) => {
  const [activeGame, setActiveGame] = useState<ActiveGame>('spelling');

  // ---------- 1. SPELLING ADVENTURE STATE ----------
  // Filter 3 to 6 letter words for friendly spelling
  const spellingWordPool = useMemo(() => {
    return VOCABULARY_DATA.filter((w) => w.word.length >= 3 && w.word.length <= 6);
  }, []);

  const [spellIndex, setSpellIndex] = useState(0);
  const currentSpellWord = spellingWordPool[spellIndex] || spellingWordPool[0];
  const targetWord = currentSpellWord.word.toUpperCase();
  const [placedLetters, setPlacedLetters] = useState<(string | null)[]>([]);
  const [availableTiles, setAvailableTiles] = useState<{ id: string; letter: string; isUsed: boolean }[]>([]);
  const [isWordSpelled, setIsWordSpelled] = useState(false);

  // Initialize spelling tiles
  const initSpellingRound = useCallback((wordObj: WordItem) => {
    const letters = wordObj.word.toUpperCase().split('');
    // Scramble letters
    const tiles = letters
      .map((letter, idx) => ({ id: `tile-${idx}-${letter}`, letter, isUsed: false }))
      .sort(() => Math.random() - 0.5);

    setAvailableTiles(tiles);
    setPlacedLetters(new Array(letters.length).fill(null));
    setIsWordSpelled(false);

    speakText(`Can you spell ${wordObj.word}?`, {
      rate: audioSettings.rate,
      pitch: audioSettings.pitch,
    });
  }, [audioSettings.pitch, audioSettings.rate]);

  useEffect(() => {
    if (activeGame === 'spelling') {
      initSpellingRound(currentSpellWord);
    }
  }, [activeGame, spellIndex, initSpellingRound, currentSpellWord]);

  // Handle tile tap
  const handleTileTap = (tileId: string, letter: string) => {
    if (isWordSpelled) return;
    soundEffects.click(audioSettings.soundEffects);
    speakText(letter, { rate: 1.0, pitch: audioSettings.pitch });

    // Find first empty slot
    const emptyIndex = placedLetters.findIndex((slot) => slot === null);
    if (emptyIndex === -1) return;

    const newPlaced = [...placedLetters];
    newPlaced[emptyIndex] = letter;
    setPlacedLetters(newPlaced);

    // Mark tile as used
    setAvailableTiles((prev) =>
      prev.map((t) => (t.id === tileId ? { ...t, isUsed: true } : t))
    );

    // Check if word is complete
    const filledString = newPlaced.join('');
    if (newPlaced.every((s) => s !== null)) {
      if (filledString === targetWord) {
        // Correct!
        soundEffects.correct(audioSettings.soundEffects);
        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
        setIsWordSpelled(true);
        onUpdateProgress((prev) => {
          const updated = {
            ...prev,
            stars: prev.stars + 3,
            gamesPlayed: prev.gamesPlayed + 1,
          };
          return recordActivity(updated, 'game', 3);
        });
        speakText(`Super! You spelled ${currentSpellWord.word}!`, {
          rate: audioSettings.rate,
          pitch: audioSettings.pitch,
        });
      } else {
        // Try again
        soundEffects.tryAgain(audioSettings.soundEffects);
        speakText('Oops, let us try again!', { rate: audioSettings.rate });
      }
    }
  };

  // Remove placed letter on tap
  const handleSlotTap = (slotIndex: number) => {
    if (isWordSpelled) return;
    const letter = placedLetters[slotIndex];
    if (!letter) return;

    soundEffects.click(audioSettings.soundEffects);

    const newPlaced = [...placedLetters];
    newPlaced[slotIndex] = null;
    setPlacedLetters(newPlaced);

    // Free up first used matching tile
    let freed = false;
    setAvailableTiles((prev) =>
      prev.map((t) => {
        if (!freed && t.isUsed && t.letter === letter) {
          freed = true;
          return { ...t, isUsed: false };
        }
        return t;
      })
    );
  };

  const nextSpellWord = () => {
    setSpellIndex((prev) => (prev + 1) % spellingWordPool.length);
  };

  // ---------- 2. PICTURE & SOUND MATCH QUIZ STATE ----------
  const [quizScore, setQuizScore] = useState(0);
  const [quizRound, setQuizRound] = useState(0);
  const [quizTarget, setQuizTarget] = useState<WordItem | null>(null);
  const [quizOptions, setQuizOptions] = useState<WordItem[]>([]);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);

  const initQuizRound = useCallback(() => {
    setQuizFeedback(null);
    const pool = [...VOCABULARY_DATA].sort(() => Math.random() - 0.5);
    const target = pool[0];
    const distractors = pool.slice(1, 4);
    const options = [target, ...distractors].sort(() => Math.random() - 0.5);

    setQuizTarget(target);
    setQuizOptions(options);

    speakText(`Which one is the ${target.word}?`, {
      rate: audioSettings.rate,
      pitch: audioSettings.pitch,
    });
  }, [audioSettings.pitch, audioSettings.rate]);

  useEffect(() => {
    if (activeGame === 'quiz') {
      initQuizRound();
    }
  }, [activeGame, quizRound, initQuizRound]);

  const handleQuizChoice = (chosen: WordItem) => {
    if (quizFeedback === 'correct') return;

    if (chosen.id === quizTarget?.id) {
      soundEffects.correct(audioSettings.soundEffects);
      setQuizFeedback('correct');
      setQuizScore((prev) => prev + 1);

      try {
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
      } catch {
        // ignore
      }

      onUpdateProgress((prev) => {
        const updated = {
          ...prev,
          stars: prev.stars + 2,
          gamesPlayed: prev.gamesPlayed + 1,
        };
        return recordActivity(updated, 'game', 2);
      });

      speakText(`Yes! That is the ${chosen.word}!`, {
        rate: audioSettings.rate,
        pitch: audioSettings.pitch,
      });
    } else {
      soundEffects.tryAgain(audioSettings.soundEffects);
      setQuizFeedback('wrong');
      speakText(`That is ${chosen.word}. Let's find ${quizTarget?.word}!`, {
        rate: audioSettings.rate,
        pitch: audioSettings.pitch,
      });
    }
  };

  // ---------- 3. SIGHT WORD BALLOON POP STATE ----------
  const [balloonRound, setBalloonRound] = useState(0);
  const [targetSightWord, setTargetSightWord] = useState(SIGHT_WORDS_DATA[0]);
  const [balloonOptions, setBalloonOptions] = useState<string[]>([]);
  const [poppedWords, setPoppedWords] = useState<string[]>([]);
  const [balloonScore, setBalloonScore] = useState(0);

  const BALLOON_COLORS = [
    'from-rose-400 to-red-500 shadow-rose-200',
    'from-sky-400 to-blue-500 shadow-sky-200',
    'from-amber-400 to-yellow-500 shadow-amber-200',
    'from-emerald-400 to-teal-500 shadow-emerald-200',
    'from-purple-400 to-indigo-500 shadow-purple-200',
  ];

  const initBalloonRound = useCallback(() => {
    const shuffled = [...SIGHT_WORDS_DATA].sort(() => Math.random() - 0.5);
    const target = shuffled[0];
    const distractors = shuffled.slice(1, 5).map((w) => w.word);
    const choices = [target.word, ...distractors].sort(() => Math.random() - 0.5);

    setTargetSightWord(target);
    setBalloonOptions(choices);
    setPoppedWords([]);

    speakText(`Pop the balloon that says: ${target.word}!`, {
      rate: audioSettings.rate,
      pitch: audioSettings.pitch,
    });
  }, [audioSettings.pitch, audioSettings.rate]);

  useEffect(() => {
    if (activeGame === 'balloons') {
      initBalloonRound();
    }
  }, [activeGame, balloonRound, initBalloonRound]);

  const handleBalloonPop = (word: string) => {
    if (poppedWords.includes(word)) return;

    if (word === targetSightWord.word) {
      soundEffects.pop(audioSettings.soundEffects);
      setPoppedWords((prev) => [...prev, word]);
      setBalloonScore((prev) => prev + 1);

      try {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.5 } });
      } catch {
        // ignore
      }

      onUpdateProgress((prev) => {
        const updated = {
          ...prev,
          stars: prev.stars + 2,
          gamesPlayed: prev.gamesPlayed + 1,
        };
        return recordActivity(updated, 'game', 2);
      });

      speakText(`Pop! Great reading! You found ${word}!`, {
        rate: audioSettings.rate,
        pitch: audioSettings.pitch,
      });
    } else {
      soundEffects.tryAgain(audioSettings.soundEffects);
      speakText(`That is ${word}. Try popping ${targetSightWord.word}!`, {
        rate: audioSettings.rate,
      });
    }
  };

  // ---------- 4. SENTENCE BUILDER PUZZLE STATE ----------
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const currentSentence = SENTENCE_PUZZLES[sentenceIndex] || SENTENCE_PUZZLES[0];
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableSentenceWords, setAvailableSentenceWords] = useState<{ id: string; word: string; isUsed: boolean }[]>([]);
  const [isSentenceComplete, setIsSentenceComplete] = useState(false);

  const initSentenceRound = useCallback((puzzle: typeof currentSentence) => {
    const tiles = puzzle.words
      .map((w, i) => ({ id: `word-${i}-${w}`, word: w, isUsed: false }))
      .sort(() => Math.random() - 0.5);

    setAvailableSentenceWords(tiles);
    setSelectedWords([]);
    setIsSentenceComplete(false);

    speakText(`Build the sentence: ${puzzle.sentence}`, {
      rate: audioSettings.rate,
      pitch: audioSettings.pitch,
    });
  }, [audioSettings.pitch, audioSettings.rate]);

  useEffect(() => {
    if (activeGame === 'sentences') {
      initSentenceRound(currentSentence);
    }
  }, [activeGame, sentenceIndex, initSentenceRound, currentSentence]);

  const handleWordTap = (tileId: string, word: string) => {
    if (isSentenceComplete) return;
    soundEffects.click(audioSettings.soundEffects);
    speakText(word, { rate: 1.0 });

    const newSelected = [...selectedWords, word];
    setSelectedWords(newSelected);

    setAvailableSentenceWords((prev) =>
      prev.map((t) => (t.id === tileId ? { ...t, isUsed: true } : t))
    );

    // Check sentence
    if (newSelected.length === currentSentence.words.length) {
      if (newSelected.join(' ') === currentSentence.sentence) {
        soundEffects.fanfare(audioSettings.soundEffects);
        try {
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
        } catch {
          // ignore
        }
        setIsSentenceComplete(true);
        onUpdateProgress((prev) => {
          const updated = {
            ...prev,
            stars: prev.stars + 4,
            gamesPlayed: prev.gamesPlayed + 1,
          };
          return recordActivity(updated, 'game', 4);
        });
        speakText(`Fantastic reading! ${currentSentence.sentence}!`, {
          rate: audioSettings.rate,
        });
      } else {
        soundEffects.tryAgain(audioSettings.soundEffects);
        speakText('Almost there! Tap words to reset and try again.', { rate: audioSettings.rate });
      }
    }
  };

  const handleSentenceReset = () => {
    soundEffects.click(audioSettings.soundEffects);
    initSentenceRound(currentSentence);
  };

  const nextSentence = () => {
    setSentenceIndex((prev) => (prev + 1) % SENTENCE_PUZZLES.length);
  };

  return (
    <div className="space-y-6">
      {/* Game Selector Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border-2 border-amber-200">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">🎮</span>
            <div>
              <h2 className="font-fredoka text-xl sm:text-2xl font-bold text-slate-800">
                Kids English Game Arcade
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold">
                Play games, learn English sounds and words, and win star trophies!
              </p>
            </div>
          </div>
        </div>

        {/* 4 Big Game Buttons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {[
            { id: 'spelling' as const, label: 'Spell-a-Word', emoji: '🔠', color: 'from-amber-400 to-orange-400' },
            { id: 'quiz' as const, label: 'Picture Match', emoji: '🔍', color: 'from-cyan-400 to-blue-500' },
            { id: 'balloons' as const, label: 'Balloon Pop', emoji: '🎈', color: 'from-pink-400 to-rose-500' },
            { id: 'sentences' as const, label: 'Sentence Reader', emoji: '🧩', color: 'from-emerald-400 to-teal-500' },
          ].map((game) => {
            const isActive = activeGame === game.id;
            return (
              <button
                key={game.id}
                onClick={() => {
                  setActiveGame(game.id);
                  soundEffects.click(audioSettings.soundEffects);
                }}
                className={`p-3 sm:p-4 rounded-2xl font-fredoka font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all active:scale-95 border-2 ${
                  isActive
                    ? `bg-gradient-to-r ${game.color} text-white shadow-md border-transparent scale-102 ring-4 ring-amber-200`
                    : 'bg-amber-50 hover:bg-amber-100 text-slate-700 border-amber-200'
                }`}
              >
                <span className="text-xl sm:text-2xl">{game.emoji}</span>
                <span>{game.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* GAME 1: SPELL-A-WORD */}
      {activeGame === 'spelling' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-md border-3 border-amber-300 text-center space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-900 rounded-full border border-amber-200">
              Word {spellIndex + 1} of {spellingWordPool.length}
            </span>
            <button
              onClick={() => speakText(`Spell the word: ${currentSpellWord.word}`, { rate: audioSettings.rate })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              <span>Hear Word</span>
            </button>
          </div>

          {/* Picture Clue */}
          <div 
            onClick={() => speakText(currentSpellWord.word)}
            className="w-28 h-28 sm:w-32 sm:h-32 mx-auto rounded-3xl bg-amber-50 border-3 border-amber-200 flex items-center justify-center text-5xl sm:text-6xl shadow-inner cursor-pointer hover:scale-105 transition-transform"
          >
            <span className="animate-wiggle">{currentSpellWord.emoji}</span>
          </div>

          <p className="text-sm font-bold text-slate-500">
            Tap letters below in order to spell the word!
          </p>

          {/* Target Slots */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            {placedLetters.map((letter, idx) => (
              <div
                key={idx}
                onClick={() => handleSlotTap(idx)}
                className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl flex items-center justify-center font-fredoka text-2xl sm:text-3xl font-extrabold border-3 transition-all cursor-pointer ${
                  letter
                    ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-md transform scale-105'
                    : 'bg-slate-100 border-dashed border-slate-300 text-transparent'
                }`}
                title={letter ? 'Tap to remove letter' : 'Empty letter slot'}
              >
                {letter || '_'}
              </div>
            ))}
          </div>

          {/* Jumbled Letter Bubbles */}
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap">
            {availableTiles.map((tile) => (
              <button
                key={tile.id}
                disabled={tile.isUsed}
                onClick={() => handleTileTap(tile.id, tile.letter)}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl font-fredoka text-xl sm:text-2xl font-bold transition-all border-2 ${
                  tile.isUsed
                    ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed scale-90 opacity-40'
                    : 'bg-white hover:bg-amber-100 text-amber-950 border-amber-300 shadow-sm active:scale-90 hover:scale-105'
                }`}
              >
                {tile.letter}
              </button>
            ))}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={() => initSpellingRound(currentSpellWord)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-fredoka font-bold text-sm hover:bg-slate-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Word</span>
            </button>

            {isWordSpelled ? (
              <button
                onClick={nextSpellWord}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-fredoka font-bold text-base shadow-md hover:brightness-105 transition-all animate-bounce"
              >
                <span>Next Word! ➔</span>
              </button>
            ) : (
              <button
                onClick={nextSpellWord}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-100 text-amber-900 font-fredoka font-bold text-sm hover:bg-amber-200 transition-colors"
              >
                <span>Skip</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* GAME 2: PICTURE & SOUND MATCH QUIZ */}
      {activeGame === 'quiz' && quizTarget && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-md border-3 border-amber-300 text-center space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-3 py-1 bg-cyan-100 text-cyan-900 rounded-full border border-cyan-200">
              Round Score: {quizScore} ⭐
            </span>
            <button
              onClick={() => speakText(`Which one is the ${quizTarget.word}?`, { rate: audioSettings.rate })}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-100 hover:bg-cyan-200 text-cyan-900 text-xs font-bold transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              <span>Replay Question</span>
            </button>
          </div>

          {/* Big Question Prompt */}
          <div>
            <h3 className="font-fredoka text-2xl sm:text-3xl font-bold text-slate-800">
              Can you find the <span className="text-cyan-600 underline decoration-cyan-400">{quizTarget.word}</span>?
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-1">
              Tap the right picture below!
            </p>
          </div>

          {/* 4 Choices */}
          <div className="grid grid-cols-2 gap-4">
            {quizOptions.map((opt) => {
              const isSelectedTarget = quizFeedback === 'correct' && opt.id === quizTarget.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => handleQuizChoice(opt)}
                  className={`p-6 rounded-3xl border-3 transition-all cursor-pointer transform hover:scale-102 active:scale-95 text-center ${
                    isSelectedTarget
                      ? 'bg-emerald-50 border-emerald-400 ring-4 ring-emerald-200 shadow-md'
                      : 'bg-white hover:bg-amber-50/50 border-amber-200 shadow-sm'
                  }`}
                >
                  <div className="text-5xl sm:text-6xl mb-2">{opt.emoji}</div>
                  <h4 className="font-fredoka text-lg sm:text-xl font-bold text-slate-800">
                    {opt.word}
                  </h4>
                </div>
              );
            })}
          </div>

          {/* Next Button */}
          {quizFeedback === 'correct' && (
            <div className="pt-2 animate-pop-in">
              <button
                onClick={() => {
                  setQuizRound((prev) => prev + 1);
                }}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-fredoka font-bold text-base shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto"
              >
                <span>Awesome! Next Question ➔</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* GAME 3: SIGHT WORD BALLOON POP */}
      {activeGame === 'balloons' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-md border-3 border-amber-300 text-center space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-3 py-1 bg-pink-100 text-pink-900 rounded-full border border-pink-200">
              Pops: {balloonScore} 🎈
            </span>
            <button
              onClick={() => speakText(`Pop the balloon that says: ${targetSightWord.word}!`, { rate: audioSettings.rate })}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-900 text-xs font-bold transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              <span>Hear Target Word</span>
            </button>
          </div>

          <div>
            <h3 className="font-fredoka text-2xl sm:text-3xl font-bold text-slate-800">
              Pop the balloon with: <span className="text-rose-600 uppercase underline decoration-rose-300">"{targetSightWord.word}"</span>!
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
              Sight words help us read stories fast!
            </p>
          </div>

          {/* Floating Balloons */}
          <div className="py-6 px-2 min-h-[260px] bg-gradient-to-b from-sky-100 via-amber-50 to-emerald-50 rounded-3xl border-2 border-dashed border-sky-300 flex items-center justify-center gap-3 sm:gap-4 flex-wrap relative overflow-hidden">
            {balloonOptions.map((word, index) => {
              const isPopped = poppedWords.includes(word);
              const colorClass = BALLOON_COLORS[index % BALLOON_COLORS.length];
              return (
                <div
                  key={word}
                  onClick={() => handleBalloonPop(word)}
                  className={`relative cursor-pointer transition-all ${
                    isPopped
                      ? 'scale-0 opacity-0 pointer-events-none duration-300'
                      : 'hover:scale-105 active:scale-95 duration-200 animate-float'
                  }`}
                  style={{ animationDelay: `${index * 0.4}s` }}
                >
                  {/* Balloon oval */}
                  <div className={`w-24 h-32 sm:w-28 sm:h-36 rounded-[50%/60%_60%_40%_40%] bg-gradient-to-b ${colorClass} text-white font-fredoka font-bold text-xl sm:text-2xl shadow-lg flex items-center justify-center p-2 text-center border-2 border-white/40`}>
                    <span className="drop-shadow-sm">{word}</span>
                  </div>
                  {/* Balloon knot and string */}
                  <div className="w-2 h-2 mx-auto bg-slate-400 rotate-45 -mt-1 rounded-xs" />
                  <div className="w-0.5 h-7 mx-auto bg-slate-300" />
                </div>
              );
            })}
          </div>

          {/* Next Round Button */}
          {poppedWords.includes(targetSightWord.word) && (
            <div className="pt-2 animate-pop-in">
              <button
                onClick={() => setBalloonRound((prev) => prev + 1)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-fredoka font-bold text-base shadow-md hover:brightness-105 active:scale-95 transition-all mx-auto flex items-center gap-2"
              >
                <span>Pop More Balloons! ➔</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* GAME 4: SENTENCE BUILDER */}
      {activeGame === 'sentences' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-md border-3 border-amber-300 text-center space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full border border-emerald-200">
              Puzzle {sentenceIndex + 1} of {SENTENCE_PUZZLES.length}
            </span>
            <button
              onClick={() => speakText(currentSentence.sentence, { rate: audioSettings.rate })}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              <span>Hear Sentence</span>
            </button>
          </div>

          {/* Picture Hint */}
          <div className="w-24 h-24 mx-auto rounded-3xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-5xl shadow-inner">
            <span>{currentSentence.emoji}</span>
          </div>

          <div>
            <h3 className="font-fredoka text-xl sm:text-2xl font-bold text-slate-800">
              Build the Sentence!
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
              Tap the word blocks in the right order.
            </p>
          </div>

          {/* Sentence Target Line */}
          <div className="min-h-[64px] p-3 bg-amber-50/80 rounded-2xl border-2 border-dashed border-amber-300 flex items-center justify-center gap-2 flex-wrap">
            {selectedWords.length === 0 ? (
              <span className="text-sm font-bold text-slate-400 italic">
                Your words will appear here...
              </span>
            ) : (
              selectedWords.map((word, i) => (
                <span
                  key={i}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 text-amber-950 font-fredoka font-bold text-base sm:text-lg shadow-sm border border-amber-500"
                >
                  {word}
                </span>
              ))
            )}
          </div>

          {/* Scrambled Word Tiles */}
          <div className="flex items-center justify-center gap-2.5 flex-wrap pt-2">
            {availableSentenceWords.map((tile) => (
              <button
                key={tile.id}
                disabled={tile.isUsed}
                onClick={() => handleWordTap(tile.id, tile.word)}
                className={`px-4 py-2.5 rounded-2xl font-fredoka text-base sm:text-lg font-bold border-2 transition-all ${
                  tile.isUsed
                    ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed opacity-40 scale-90'
                    : 'bg-white hover:bg-amber-100 text-slate-800 border-amber-300 shadow-sm active:scale-95'
                }`}
              >
                {tile.word}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={handleSentenceReset}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-fredoka font-bold text-sm hover:bg-slate-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>

            {isSentenceComplete ? (
              <button
                onClick={nextSentence}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-fredoka font-bold text-base shadow-md hover:brightness-105 active:scale-95 transition-all animate-bounce"
              >
                <span>Next Sentence! ➔</span>
              </button>
            ) : (
              <button
                onClick={nextSentence}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-100 text-amber-900 font-fredoka font-bold text-sm hover:bg-amber-200 transition-colors"
              >
                <span>Skip</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
