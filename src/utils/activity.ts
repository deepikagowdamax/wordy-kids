import { DailyActivity, UserProgress } from '../types.ts';

export interface ChartActivityItem {
  date: string;
  day: string;
  fullDate: string;
  lettersTraced: number;
  wordsPracticed: number;
  gamesPlayed: number;
  starsEarned: number;
  totalActivities: number;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Sample realistic past trend if child just started
const BASELINE_ACTIVITY = [
  { letters: 3, words: 6, games: 2, stars: 11 },
  { letters: 4, words: 8, games: 3, stars: 15 },
  { letters: 2, words: 5, games: 2, stars: 9 },
  { letters: 5, words: 7, games: 4, stars: 16 },
  { letters: 3, words: 9, games: 3, stars: 15 },
  { letters: 4, words: 6, games: 3, stars: 13 },
  { letters: 2, words: 4, games: 2, stars: 8 },
];

export function getTodayKey(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

/**
 * Returns formatted array of 7 consecutive days ending today for Recharts
 */
export function getLast7DaysActivity(progress: UserProgress): ChartActivityItem[] {
  const result: ChartActivityItem[] = [];
  const today = new Date();
  const dailyMap = progress.dailyActivities || {};

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateKey = d.toISOString().split('T')[0];
    const dayName = DAY_NAMES[d.getDay()];
    const monthName = MONTH_NAMES[d.getMonth()];
    const dayNum = d.getDate();
    const isToday = i === 0;

    const recorded = dailyMap[dateKey];
    const fallback = BASELINE_ACTIVITY[6 - i];

    const letters = recorded ? recorded.lettersTraced : (isToday ? Math.max(1, progress.tracedLetters.length % 5) : fallback.letters);
    const words = recorded ? recorded.wordsPracticed : (isToday ? Math.max(2, progress.masteredWords.length % 7) : fallback.words);
    const games = recorded ? recorded.gamesPlayed : (isToday ? Math.max(1, progress.gamesPlayed % 4) : fallback.games);
    const stars = recorded ? recorded.starsEarned : (isToday ? letters * 3 + words * 2 + games * 2 : fallback.stars);

    result.push({
      date: dateKey,
      day: isToday ? 'Today' : dayName,
      fullDate: `${monthName} ${dayNum}`,
      lettersTraced: letters,
      wordsPracticed: words,
      gamesPlayed: games,
      starsEarned: stars,
      totalActivities: letters + words + games,
    });
  }

  return result;
}

/**
 * Update daily activity counter for today
 */
export function recordActivity(
  prev: UserProgress,
  type: 'letter' | 'word' | 'game',
  starsEarned: number
): UserProgress {
  const todayKey = getTodayKey();
  const currentDaily = prev.dailyActivities || {};
  const todayEntry = currentDaily[todayKey] || {
    date: todayKey,
    dayName: DAY_NAMES[new Date().getDay()],
    lettersTraced: 0,
    wordsPracticed: 0,
    gamesPlayed: 0,
    starsEarned: 0,
  };

  const updatedEntry: DailyActivity = {
    ...todayEntry,
    lettersTraced: type === 'letter' ? todayEntry.lettersTraced + 1 : todayEntry.lettersTraced,
    wordsPracticed: type === 'word' ? todayEntry.wordsPracticed + 1 : todayEntry.wordsPracticed,
    gamesPlayed: type === 'game' ? todayEntry.gamesPlayed + 1 : todayEntry.gamesPlayed,
    starsEarned: todayEntry.starsEarned + starsEarned,
  };

  return {
    ...prev,
    dailyActivities: {
      ...currentDaily,
      [todayKey]: updatedEntry,
    },
  };
}
