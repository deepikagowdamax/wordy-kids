import React, { useState, useRef, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, Sparkles, RotateCcw, CheckCircle2, ChevronLeft, ChevronRight, Award, Palette } from 'lucide-react';
import { AlphabetItem, AudioSettings, UserProgress } from '../types.ts';
import { ALPHABET_DATA } from '../data/alphabetData.ts';
import { speakText, soundEffects } from '../utils/audio.ts';
import { recordActivity } from '../utils/activity.ts';

interface AlphabetSafariProps {
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
  audioSettings: AudioSettings;
}

const BRUSH_COLORS = [
  { name: 'Sky Blue', hex: '#0284c7', class: 'bg-sky-500' },
  { name: 'Sunny Amber', hex: '#f59e0b', class: 'bg-amber-500' },
  { name: 'Berry Rose', hex: '#e11d48', class: 'bg-rose-500' },
  { name: 'Forest Green', hex: '#16a34a', class: 'bg-emerald-600' },
  { name: 'Magic Purple', hex: '#9333ea', class: 'bg-purple-600' },
];

export const AlphabetSafari: React.FC<AlphabetSafariProps> = ({
  progress,
  onUpdateProgress,
  audioSettings,
}) => {
  const [selectedLetterId, setSelectedLetterId] = useState<string>('a');
  const [brushColor, setBrushColor] = useState<string>('#0284c7');
  const [brushWidth, setBrushWidth] = useState<number>(18);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);
  const [isTracingCompleted, setIsTracingCompleted] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const currentItem = ALPHABET_DATA.find((item) => item.id === selectedLetterId) || ALPHABET_DATA[0];
  const currentIndex = ALPHABET_DATA.findIndex((item) => item.id === selectedLetterId);
  const isTraced = progress.tracedLetters.includes(currentItem.letter);

  // Play phonics sound
  const playLetterSound = (slow = false) => {
    soundEffects.click(audioSettings.soundEffects);
    const rate = slow ? 0.75 : audioSettings.rate;
    const textToSpeak = `${currentItem.letter}. ${currentItem.phonics}. ${currentItem.word}.`;
    speakText(textToSpeak, {
      rate,
      pitch: audioSettings.pitch,
      accent: audioSettings.accent,
    });
  };

  const playSentence = () => {
    soundEffects.click(audioSettings.soundEffects);
    speakText(currentItem.exampleSentence, {
      rate: audioSettings.rate,
      pitch: audioSettings.pitch,
      accent: audioSettings.accent,
    });
  };

  // Draw the letter outline background on the canvas
  const drawGuideLetter = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, item: AlphabetItem) => {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Subtle kid-friendly ruled lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    
    // Top line
    ctx.beginPath();
    ctx.moveTo(30, height * 0.22);
    ctx.lineTo(width - 30, height * 0.22);
    ctx.stroke();

    // Middle dash line
    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(30, height * 0.55);
    ctx.lineTo(width - 30, height * 0.55);
    ctx.stroke();

    // Baseline
    ctx.strokeStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(30, height * 0.85);
    ctx.lineTo(width - 30, height * 0.85);
    ctx.stroke();

    ctx.setLineDash([]);

    // Dotted large guide letter in center
    ctx.fillStyle = '#e2e8f0';
    ctx.font = `bold ${Math.floor(height * 0.65)}px 'Fredoka', 'Nunito', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${item.letter} ${item.lowercase}`, width / 2, height * 0.55);

    // Dotted outline for kids to trace over
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    ctx.strokeText(`${item.letter} ${item.lowercase}`, width / 2, height * 0.55);

    ctx.restore();
  }, []);

  const resetCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawGuideLetter(ctx, canvas.width, canvas.height, currentItem);
    setHasDrawn(false);
    setIsTracingCompleted(false);
  }, [currentItem, drawGuideLetter]);

  // Redraw guide whenever selected letter changes
  useEffect(() => {
    resetCanvas();
  }, [selectedLetterId, resetCanvas]);

  // Canvas drawing touch & mouse handlers
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    isDrawingRef.current = true;
    const coords = getCanvasCoords(e);
    lastPosRef.current = coords;
    setHasDrawn(true);
    soundEffects.click(audioSettings.soundEffects);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !lastPosRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPos = getCanvasCoords(e);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = brushColor;
    ctx.shadowBlur = 4;
    ctx.stroke();
    ctx.restore();

    lastPosRef.current = currentPos;
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  };

  // Check and submit trace
  const handleCheckTrace = () => {
    if (!hasDrawn) {
      speakText('Trace the letter first!', { rate: audioSettings.rate });
      return;
    }

    soundEffects.fanfare(audioSettings.soundEffects);
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // confetti fallback
    }

    setIsTracingCompleted(true);

    // Award stars and add to traced list if not already added
    onUpdateProgress((prev) => {
      const alreadyTraced = prev.tracedLetters.includes(currentItem.letter);
      const newStars = alreadyTraced ? prev.stars + 1 : prev.stars + 3;
      const newTraced = alreadyTraced ? prev.tracedLetters : [...prev.tracedLetters, currentItem.letter];
      const withTrace = {
        ...prev,
        stars: newStars,
        tracedLetters: newTraced,
      };
      return recordActivity(withTrace, 'letter', alreadyTraced ? 1 : 3);
    });

    speakText(`Wonderful! You traced letter ${currentItem.letter}!`, {
      rate: audioSettings.rate,
      pitch: audioSettings.pitch,
    });
  };

  // Next / Previous letter navigation
  const goToNextLetter = () => {
    const nextIdx = (currentIndex + 1) % ALPHABET_DATA.length;
    setSelectedLetterId(ALPHABET_DATA[nextIdx].id);
    soundEffects.click(audioSettings.soundEffects);
  };

  const goToPrevLetter = () => {
    const prevIdx = (currentIndex - 1 + ALPHABET_DATA.length) % ALPHABET_DATA.length;
    setSelectedLetterId(ALPHABET_DATA[prevIdx].id);
    soundEffects.click(audioSettings.soundEffects);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with letter track */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border-2 border-amber-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">🔤</span>
            <div>
              <h2 className="font-fredoka text-xl sm:text-2xl font-bold text-slate-800">
                Alphabet & Phonics Safari
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold">
                Tap any letter to listen, learn phonics, and trace!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 rounded-full text-xs sm:text-sm font-bold text-amber-900 border border-amber-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{progress.tracedLetters.length} / 26 Traced</span>
          </div>
        </div>

        {/* Letter Selector Carousel */}
        <div className="flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
          {ALPHABET_DATA.map((item) => {
            const isSelected = item.id === selectedLetterId;
            const completed = progress.tracedLetters.includes(item.letter);
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedLetterId(item.id);
                  soundEffects.click(audioSettings.soundEffects);
                }}
                className={`relative shrink-0 w-11 h-14 sm:w-13 sm:h-16 rounded-2xl flex flex-col items-center justify-center font-fredoka font-bold transition-all transform active:scale-95 ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-400 to-orange-500 text-white shadow-lg scale-105 border-2 border-amber-500 ring-4 ring-amber-200'
                    : 'bg-amber-50/80 hover:bg-amber-100 text-slate-700 border-2 border-amber-200'
                }`}
              >
                <span className="text-lg sm:text-xl">{item.letter}</span>
                <span className="text-[10px] sm:text-xs opacity-80 -mt-1">{item.lowercase}</span>
                {completed && (
                  <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white rounded-full p-0.5 shadow-sm text-[10px]">
                    ⭐
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Big Letter Card & Phonics & Word (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className={`rounded-3xl p-6 sm:p-7 border-4 ${currentItem.borderLight} ${currentItem.bgLight} shadow-sm transition-all relative overflow-hidden`}>
            {/* Background decorative bubble */}
            <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/40 blur-xl pointer-events-none" />

            <div className="flex items-start justify-between relative z-10">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm text-xs font-bold text-slate-700 border border-slate-200 shadow-xs mb-2">
                  Phonics sound: <span className="text-amber-700 font-bold">{currentItem.phonics}</span>
                </span>
                <h3 className="font-fredoka text-6xl sm:text-7xl font-extrabold tracking-tight text-slate-900">
                  {currentItem.letter}{currentItem.lowercase}
                </h3>
              </div>

              {/* Big Word Emoji */}
              <div 
                onClick={() => playLetterSound(false)}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white shadow-md border-2 border-amber-200 flex items-center justify-center text-4xl sm:text-5xl cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                title="Tap to hear word!"
              >
                {currentItem.emoji}
              </div>
            </div>

            {/* Word and Sound explanation */}
            <div className="mt-4 relative z-10">
              <div className="flex items-center gap-2">
                <span className="font-fredoka text-2xl sm:text-3xl font-bold text-slate-900">
                  {currentItem.word}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-white/70 text-slate-600 font-bold">
                  {currentItem.soundExample}
                </span>
              </div>
              <p className="text-slate-600 text-sm mt-1 font-semibold leading-relaxed">
                {currentItem.soundDescription}
              </p>
            </div>

            {/* Listen buttons */}
            <div className="flex flex-wrap gap-2.5 mt-5 relative z-10">
              <button
                onClick={() => playLetterSound(false)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-amber-950 font-fredoka font-bold text-base shadow-md hover:brightness-105 active:scale-95 transition-all"
              >
                <Volume2 className="w-5 h-5 text-amber-950" />
                <span>Hear Sound</span>
              </button>

              <button
                onClick={() => playLetterSound(true)}
                title="Slow motion pronunciation"
                className="flex items-center justify-center gap-1.5 py-3 px-3.5 rounded-2xl bg-white text-slate-800 font-fredoka font-bold text-base border-2 border-amber-300 shadow-sm hover:bg-amber-50 active:scale-95 transition-all"
              >
                <span className="text-xl">🐢</span>
                <span className="text-xs sm:text-sm">Slow</span>
              </button>
            </div>

            {/* Example sentence card */}
            <div className="mt-4 p-3.5 bg-white/90 rounded-2xl border border-amber-200/80 shadow-xs relative z-10 flex items-center justify-between gap-3">
              <p className="text-xs sm:text-sm text-slate-700 font-semibold italic">
                "{currentItem.exampleSentence}"
              </p>
              <button
                onClick={playSentence}
                className="shrink-0 p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-colors"
                title="Read sentence aloud"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Previous & Next Navigation */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={goToPrevLetter}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-white border-2 border-amber-200 hover:bg-amber-50 font-fredoka font-bold text-slate-700 shadow-xs active:scale-95 transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-amber-600" />
              <span>Previous Letter</span>
            </button>

            <button
              onClick={goToNextLetter}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-amber-400 border-2 border-amber-500 hover:bg-amber-500 font-fredoka font-bold text-amber-950 shadow-sm active:scale-95 transition-all"
            >
              <span>Next Letter</span>
              <ChevronRight className="w-5 h-5 text-amber-950" />
            </button>
          </div>
        </div>

        {/* Right Column: Finger & Stylus Tracing Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 shadow-sm border-2 border-amber-200 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-fredoka font-bold text-lg text-slate-800">
                  Trace & Write: {currentItem.letter} {currentItem.lowercase}
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Follow the dotted lines with your finger or mouse!
                </p>
              </div>
            </div>

            {/* Brush color palette */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              {BRUSH_COLORS.map((col) => (
                <button
                  key={col.hex}
                  onClick={() => {
                    setBrushColor(col.hex);
                    soundEffects.click(audioSettings.soundEffects);
                  }}
                  title={col.name}
                  className={`w-7 h-7 rounded-xl transition-all ${col.class} ${
                    brushColor === col.hex ? 'scale-110 ring-2 ring-slate-800 shadow-sm' : 'opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Interactive Tracing Canvas */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-white rounded-2xl overflow-hidden border-3 border-dashed border-amber-300 shadow-inner">
            <canvas
              ref={canvasRef}
              width={600}
              height={380}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-full cursor-crosshair touch-none"
            />

            {/* Success Overlay after checking trace */}
            {isTracingCompleted && (
              <div className="absolute inset-0 bg-white/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 animate-pop-in">
                <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-3xl mb-2 animate-bounce">
                  ⭐
                </div>
                <h4 className="font-fredoka text-2xl font-bold text-emerald-800">
                  Super Tracing Star!
                </h4>
                <p className="text-sm font-semibold text-slate-600 mt-1 mb-4">
                  You earned +3 Stars for practicing Letter {currentItem.letter}!
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={resetCanvas}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-fredoka font-bold text-sm hover:bg-slate-200 transition-colors"
                  >
                    Trace Again
                  </button>
                  <button
                    onClick={goToNextLetter}
                    className="px-5 py-2 rounded-xl bg-amber-400 text-amber-950 font-fredoka font-bold text-sm shadow-md hover:bg-amber-500 transition-colors"
                  >
                    Next Letter ➔
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tracing Controls: Clear, Thickness, Check Trace */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={resetCanvas}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-fredoka font-bold text-xs sm:text-sm transition-colors border border-slate-200 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clear Canvas</span>
              </button>

              {/* Brush size buttons */}
              <div className="hidden sm:flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-xl text-xs font-bold text-slate-600">
                <span>Pen:</span>
                <button
                  onClick={() => setBrushWidth(12)}
                  className={`px-2 py-1 rounded-lg ${brushWidth === 12 ? 'bg-white shadow-xs text-amber-700' : ''}`}
                >
                  Thin
                </button>
                <button
                  onClick={() => setBrushWidth(18)}
                  className={`px-2 py-1 rounded-lg ${brushWidth === 18 ? 'bg-white shadow-xs text-amber-700' : ''}`}
                >
                  Medium
                </button>
                <button
                  onClick={() => setBrushWidth(26)}
                  className={`px-2 py-1 rounded-lg ${brushWidth === 26 ? 'bg-white shadow-xs text-amber-700' : ''}`}
                >
                  Thick
                </button>
              </div>
            </div>

            {/* Check Trace Button */}
            <button
              onClick={handleCheckTrace}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-fredoka font-bold text-sm sm:text-base shadow-md hover:brightness-105 active:scale-95 transition-all"
            >
              <Award className="w-5 h-5" />
              <span>Check Trace & Earn Stars! ⭐</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
