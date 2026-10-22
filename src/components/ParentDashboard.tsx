import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  Volume2,
  Award,
  Sparkles,
  RotateCcw,
  CheckCircle,
  Sliders,
  TrendingUp,
  Calendar,
  Flame,
  Star,
  Activity,
} from 'lucide-react';
import { AudioSettings, UserProgress } from '../types.ts';
import { soundEffects, speakText } from '../utils/audio.ts';
import { getLast7DaysActivity, ChartActivityItem } from '../utils/activity.ts';

interface ParentDashboardProps {
  progress: UserProgress;
  onResetProgress: () => void;
  audioSettings: AudioSettings;
  setAudioSettings: React.Dispatch<React.SetStateAction<AudioSettings>>;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border-2 border-amber-200 text-xs font-semibold text-slate-700 min-w-[170px] animate-pop-in">
        <p className="font-fredoka text-sm font-bold text-slate-900 border-b border-amber-100 pb-1.5 mb-2 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
            7-Day History
          </span>
        </p>
        <div className="space-y-1.5">
          {payload.map((entry, index) => {
            let icon = '📊';
            if (entry.dataKey === 'lettersTraced') icon = '✍️';
            if (entry.dataKey === 'wordsPracticed') icon = '📚';
            if (entry.dataKey === 'gamesPlayed') icon = '🎮';
            if (entry.dataKey === 'starsEarned') icon = '⭐';
            if (entry.dataKey === 'totalActivities') icon = '🎯';

            return (
              <div key={`item-${index}`} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span>{icon}</span>
                  <span className="capitalize">{entry.name}:</span>
                </span>
                <span className="font-fredoka font-bold text-slate-900 text-sm" style={{ color: entry.color }}>
                  {entry.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  progress,
  onResetProgress,
  audioSettings,
  setAudioSettings,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [learnerName, setLearnerName] = useState('Little Explorer');
  const [chartMetric, setChartMetric] = useState<'breakdown' | 'total' | 'stars'>('breakdown');

  // Compute 7-day chart data
  const chartData: ChartActivityItem[] = useMemo(() => {
    return getLast7DaysActivity(progress);
  }, [progress]);

  // Summary statistics for the 7 days
  const weeklyStats = useMemo(() => {
    const totalExercises = chartData.reduce((acc, curr) => acc + curr.totalActivities, 0);
    const totalWeeklyStars = chartData.reduce((acc, curr) => acc + curr.starsEarned, 0);
    const avgDaily = Math.round((totalExercises / 7) * 10) / 10;
    
    // Find most active day
    let bestDay = chartData[0];
    chartData.forEach((item) => {
      if (item.totalActivities > bestDay.totalActivities) {
        bestDay = item;
      }
    });

    return { totalExercises, totalWeeklyStars, avgDaily, bestDay };
  }, [chartData]);

  const testVoice = (speed: number, accent: 'en-US' | 'en-GB' | 'default') => {
    soundEffects.click(audioSettings.soundEffects);
    speakText(`Hello ${learnerName}! Welcome to WonderWords English Academy. Great learning today!`, {
      rate: speed,
      pitch: audioSettings.pitch,
      accent,
    });
  };

  const lettersTracedPercent = Math.min(100, Math.round((progress.tracedLetters.length / 26) * 100));
  const wordsMasteredPercent = Math.min(100, Math.round((progress.masteredWords.length / 45) * 100));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border-2 border-amber-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 border border-sky-300 flex items-center justify-center text-2xl">
            👨‍👩‍👧
          </div>
          <div>
            <h2 className="font-fredoka text-2xl font-bold text-slate-800">
              Parents & Teachers Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold">
              Track your child's English milestones, inspect 7-day learning trends, and tune audio settings.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Cards Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stars */}
        <div className="bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-sm text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center text-2xl mb-2">
            ⭐
          </div>
          <span className="text-3xl sm:text-4xl font-fredoka font-extrabold text-amber-950">
            {progress.stars}
          </span>
          <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
            Stars Earned
          </p>
        </div>

        {/* Letters Traced */}
        <div className="bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-sm text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl mb-2">
            ✍️
          </div>
          <span className="text-3xl sm:text-4xl font-fredoka font-extrabold text-emerald-700">
            {progress.tracedLetters.length} / 26
          </span>
          <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
            Letters Traced ({lettersTracedPercent}%)
          </p>
        </div>

        {/* Words Mastered */}
        <div className="bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-sm text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-sky-100 flex items-center justify-center text-2xl mb-2">
            📚
          </div>
          <span className="text-3xl sm:text-4xl font-fredoka font-extrabold text-sky-700">
            {progress.masteredWords.length}
          </span>
          <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
            Words Mastered
          </p>
        </div>

        {/* Games Played */}
        <div className="bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-sm text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-violet-100 flex items-center justify-center text-2xl mb-2">
            🎮
          </div>
          <span className="text-3xl sm:text-4xl font-fredoka font-extrabold text-violet-700">
            {progress.gamesPlayed}
          </span>
          <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
            Games Completed
          </p>
        </div>
      </div>

      {/* NEW: RECHARTS 7-DAY LEARNING ACTIVITY BAR CHART */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border-2 border-amber-200 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800 border border-amber-300">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-fredoka text-xl font-bold text-slate-800 flex items-center gap-2">
                <span>Learning Activity Over the Last 7 Days</span>
                <span className="hidden sm:inline-block text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Active Habit
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Daily bar chart breakdown of alphabet tracing, vocabulary practice, and games.
              </p>
            </div>
          </div>

          {/* Metric View Switcher */}
          <div className="flex items-center bg-amber-50 p-1 rounded-2xl border border-amber-200 text-xs font-fredoka font-bold">
            <button
              onClick={() => {
                setChartMetric('breakdown');
                soundEffects.click(audioSettings.soundEffects);
              }}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                chartMetric === 'breakdown'
                  ? 'bg-amber-400 text-amber-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Activity Breakdown
            </button>
            <button
              onClick={() => {
                setChartMetric('total');
                soundEffects.click(audioSettings.soundEffects);
              }}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                chartMetric === 'total'
                  ? 'bg-amber-400 text-amber-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Total Daily Actions
            </button>
            <button
              onClick={() => {
                setChartMetric('stars');
                soundEffects.click(audioSettings.soundEffects);
              }}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                chartMetric === 'stars'
                  ? 'bg-amber-400 text-amber-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⭐ Stars Earned
            </button>
          </div>
        </div>

        {/* 7-Day Highlight Mini Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              7-Day Exercises
            </span>
            <span className="text-xl font-fredoka font-bold text-amber-950 mt-0.5 block">
              {weeklyStats.totalExercises} Completed
            </span>
          </div>

          <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Daily Average
            </span>
            <span className="text-xl font-fredoka font-bold text-emerald-800 mt-0.5 block">
              ~{weeklyStats.avgDaily} / day
            </span>
          </div>

          <div className="bg-sky-50/70 p-3 rounded-2xl border border-sky-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Best Day
            </span>
            <span className="text-xl font-fredoka font-bold text-sky-800 mt-0.5 block truncate">
              {weeklyStats.bestDay.day} ({weeklyStats.bestDay.totalActivities})
            </span>
          </div>

          <div className="bg-purple-50/70 p-3 rounded-2xl border border-purple-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Weekly Stars
            </span>
            <span className="text-xl font-fredoka font-bold text-purple-800 mt-0.5 block">
              +{weeklyStats.totalWeeklyStars} ⭐
            </span>
          </div>
        </div>

        {/* Recharts Bar Chart Container */}
        <div className="w-full h-72 sm:h-80 pt-2 pb-1 bg-amber-50/30 rounded-2xl border border-amber-100 p-2 sm:p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                tick={{ fill: '#475569', fontSize: 12, fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600, fontFamily: 'Nunito, sans-serif' }}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Legend
                wrapperStyle={{
                  paddingTop: '12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  fontFamily: 'Fredoka, Nunito, sans-serif',
                }}
              />

              {chartMetric === 'breakdown' && (
                <>
                  <Bar
                    dataKey="lettersTraced"
                    name="Letters Traced"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={38}
                  />
                  <Bar
                    dataKey="wordsPracticed"
                    name="Words Practiced"
                    fill="#0284c7"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={38}
                  />
                  <Bar
                    dataKey="gamesPlayed"
                    name="Games Won"
                    fill="#8b5cf6"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={38}
                  />
                </>
              )}

              {chartMetric === 'total' && (
                <Bar
                  dataKey="totalActivities"
                  name="Total English Activities"
                  fill="#f97316"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={50}
                />
              )}

              {chartMetric === 'stars' && (
                <Bar
                  dataKey="starsEarned"
                  name="Stars Earned"
                  fill="#f59e0b"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={50}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
          <div className="flex items-center gap-1 text-emerald-700 font-bold">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>Consistency: 7 active days! Daily practice reinforces phonemic awareness.</span>
          </div>
          <span className="text-[11px] text-slate-400">Updates live as exercises are completed</span>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-amber-200 space-y-4">
        <h3 className="font-fredoka text-lg font-bold text-slate-800">
          Core English Curriculum Milestones
        </h3>

        {/* Letters Mastery */}
        <div>
          <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
            <span>Phonics & Alphabet Writing</span>
            <span>{progress.tracedLetters.length} of 26 letters</span>
          </div>
          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${lettersTracedPercent}%` }}
            />
          </div>
        </div>

        {/* Vocabulary Mastery */}
        <div>
          <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
            <span>Vocabulary Retention</span>
            <span>{progress.masteredWords.length} of 45+ words</span>
          </div>
          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${wordsMasteredPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Audio & Speech Tuning */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-amber-200 space-y-5">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-amber-600" />
          <h3 className="font-fredoka text-lg font-bold text-slate-800">
            Pronunciation & Speech Settings
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Speech Rate Slider */}
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Speech Speed:</span>
              <span className="text-amber-800">
                {audioSettings.rate <= 0.8 ? '🐢 Slow (Turtle)' : '🐇 Normal Pacing'} ({audioSettings.rate}x)
              </span>
            </div>
            <input
              type="range"
              min="0.65"
              max="1.15"
              step="0.05"
              value={audioSettings.rate}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setAudioSettings((prev) => ({ ...prev, rate: val }));
              }}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 font-semibold">
              Tip: Beginners benefit from 0.75x–0.85x speed for clearer phonics distinction.
            </p>
          </div>

          {/* Accent Selection */}
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
            <span className="text-xs font-bold text-slate-700 block">Accent Preference:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setAudioSettings((prev) => ({ ...prev, accent: 'en-US' }))}
                className={`flex-1 py-2 px-3 rounded-xl font-fredoka text-xs font-bold border transition-all ${
                  audioSettings.accent === 'en-US'
                    ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                🇺🇸 US English
              </button>
              <button
                onClick={() => setAudioSettings((prev) => ({ ...prev, accent: 'en-GB' }))}
                className={`flex-1 py-2 px-3 rounded-xl font-fredoka text-xs font-bold border transition-all ${
                  audioSettings.accent === 'en-GB'
                    ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                🇬🇧 UK English
              </button>
            </div>
            <button
              onClick={() => testVoice(audioSettings.rate, audioSettings.accent)}
              className="w-full py-1.5 px-3 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors mt-2"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Test Pronunciation Sound</span>
            </button>
          </div>
        </div>
      </div>

      {/* Child's Learning Certificate Preview */}
      <div className="bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 rounded-3xl p-6 sm:p-8 border-4 border-amber-300 shadow-md text-center relative overflow-hidden">
        <div className="absolute top-2 left-2 text-2xl opacity-40">⭐</div>
        <div className="absolute top-2 right-2 text-2xl opacity-40">⭐</div>
        <div className="absolute bottom-2 left-2 text-2xl opacity-40">⭐</div>
        <div className="absolute bottom-2 right-2 text-2xl opacity-40">⭐</div>

        <div className="inline-block p-3 rounded-full bg-white shadow-sm border border-amber-300 mb-2">
          <Award className="w-10 h-10 text-amber-500" />
        </div>

        <h3 className="font-fredoka text-2xl sm:text-3xl font-extrabold text-amber-950 tracking-wide uppercase">
          Certificate of Achievement
        </h3>
        <p className="text-xs sm:text-sm font-bold text-amber-800 mt-0.5">
          WonderWords English Explorer
        </p>

        <div className="my-4 max-w-sm mx-auto">
          <label className="text-xs font-bold text-slate-600 block mb-1">
            Child's Name:
          </label>
          <input
            type="text"
            value={learnerName}
            onChange={(e) => setLearnerName(e.target.value)}
            className="w-full px-4 py-2 rounded-2xl bg-white border-2 border-amber-300 text-center font-fredoka font-bold text-lg text-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <p className="text-sm text-slate-700 font-semibold max-w-md mx-auto leading-relaxed">
          This certifies that <strong className="text-amber-950 font-bold">{learnerName}</strong> has practiced English alphabet sounds, learned new words, and earned <span className="font-bold text-amber-900">{progress.stars} Stars</span>!
        </p>

        <div className="mt-4 flex items-center justify-center gap-6 text-xs font-bold text-amber-900">
          <div>
            <span className="block text-lg">🔤</span>
            <span>{progress.tracedLetters.length} Letters</span>
          </div>
          <div>
            <span className="block text-lg">📚</span>
            <span>{progress.masteredWords.length} Words</span>
          </div>
          <div>
            <span className="block text-lg">🏆</span>
            <span>{progress.unlockedStickers.length} Badges</span>
          </div>
        </div>
      </div>

      {/* Reset Progress Danger Zone */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div>
          <h4 className="font-fredoka font-bold text-slate-700 text-sm">
            Reset Progress
          </h4>
          <p className="text-xs text-slate-400 font-semibold">
            Clear stars and learning records to start fresh.
          </p>
        </div>

        {showResetConfirm ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-rose-600">Are you sure?</span>
            <button
              onClick={() => {
                onResetProgress();
                setShowResetConfirm(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-fredoka font-bold text-xs shadow-xs"
            >
              Yes, Reset
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-fredoka font-bold text-xs"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-3.5 py-1.5 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 font-fredoka font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data</span>
          </button>
        )}
      </div>
    </div>
  );
};
