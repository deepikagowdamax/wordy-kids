import { AudioSettings, PlacedSticker, UserProgress } from '../types.ts';

const PROGRESS_KEY = 'wonderwords_kids_progress_v1';
const AUDIO_SETTINGS_KEY = 'wonderwords_audio_settings_v1';

const DEFAULT_PROGRESS: UserProgress = {
  stars: 10, // give kids 10 starting stars so they can immediately feel celebrated and unlock their first stickers!
  tracedLetters: [],
  masteredWords: [],
  gamesPlayed: 0,
  unlockedStickers: ['stk-lion', 'stk-star', 'stk-puppy'],
  placedStickers: [
    { id: 'placed-1', stickerId: 'stk-lion', emoji: '🦁', x: 25, y: 55, scale: 1.2, rotation: -5 },
    { id: 'placed-2', stickerId: 'stk-star', emoji: '⭐', x: 75, y: 25, scale: 1.1, rotation: 10 },
  ],
  streakDays: 1,
  lastPlayedDate: new Date().toISOString().split('T')[0],
};

const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  rate: 0.95,
  pitch: 1.15,
  soundEffects: true,
  accent: 'en-US',
};

export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROGRESS, ...parsed };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('Could not save progress to localStorage', e);
  }
}

export function loadAudioSettings(): AudioSettings {
  if (typeof window === 'undefined') return DEFAULT_AUDIO_SETTINGS;
  try {
    const raw = localStorage.getItem(AUDIO_SETTINGS_KEY);
    if (!raw) return DEFAULT_AUDIO_SETTINGS;
    return { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_AUDIO_SETTINGS;
  }
}

export function saveAudioSettings(settings: AudioSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Could not save audio settings', e);
  }
}
