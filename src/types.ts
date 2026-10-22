export interface AlphabetItem {
  id: string;
  letter: string;
  lowercase: string;
  word: string;
  phonics: string;
  soundExample: string;
  emoji: string;
  exampleSentence: string;
  color: string;
  bgLight: string;
  borderLight: string;
  soundDescription: string;
}

export type CategoryId = 'animals' | 'colors' | 'foods' | 'body' | 'numbers' | 'family' | 'actions';

export interface WordItem {
  id: string;
  word: string;
  category: CategoryId;
  emoji: string;
  phonetic: string;
  definition: string;
  exampleSentence: string;
  color: string;
  count?: number; // for numbers category
}

export interface SightWordItem {
  id: string;
  word: string;
  level: 'starter' | 'level1' | 'level2';
  exampleSentence: string;
}

export interface SentencePuzzle {
  id: string;
  sentence: string;
  words: string[];
  emoji: string;
  hint: string;
}

export interface StickerItem {
  id: string;
  name: string;
  emoji: string;
  requiredStars: number;
  category: 'animals' | 'magic' | 'space' | 'badges';
}

export interface PlacedSticker {
  id: string;
  stickerId: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface DailyActivity {
  date: string; // 'YYYY-MM-DD'
  dayName: string; // 'Mon', 'Tue', etc.
  lettersTraced: number;
  wordsPracticed: number;
  gamesPlayed: number;
  starsEarned: number;
}

export interface UserProgress {
  stars: number;
  tracedLetters: string[];
  masteredWords: string[];
  gamesPlayed: number;
  unlockedStickers: string[];
  placedStickers: PlacedSticker[];
  streakDays: number;
  lastPlayedDate: string;
  dailyActivities?: Record<string, DailyActivity>;
}

export interface AudioSettings {
  rate: number; // 0.8 for slow/turtle, 1.0 for normal
  pitch: number;
  soundEffects: boolean;
  voiceVoiceURI?: string;
  accent: 'en-US' | 'en-GB' | 'default';
}
