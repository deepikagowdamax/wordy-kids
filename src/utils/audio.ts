/**
 * Kid-friendly Audio & Speech Engine
 * Uses Web Speech API for clear English pronunciation and Web Audio API for bubbly sound effects.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Sound Effects Synthesizer using Web Audio API
export const soundEffects = {
  // Bubbly balloon pop sound
  pop(enabled = true) {
    if (!enabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Ignore audio context errors if browser blocked
    }
  },

  // Cheerful correct answer chime (Major 3rd / 5th chord)
  correct(enabled = true) {
    if (!enabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.25);
      });
    } catch {
      // Audio error
    }
  },

  // Sparkly Star reward sound
  star(enabled = true) {
    if (!enabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const freqs = [784, 988, 1175, 1318, 1568];
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.05);

        gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + i * 0.05);
        osc.stop(ctx.currentTime + i * 0.05 + 0.3);
      });
    } catch {
      // Ignore
    }
  },

  // Soft wooden block click for letter taps
  click(enabled = true) {
    if (!enabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Ignore
    }
  },

  // Gentle, supportive "try again" sound (never harsh)
  tryAgain(enabled = true) {
    if (!enabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const freqs = [440, 392]; // A4 down to G4
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.12 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.2);
      });
    } catch {
      // Ignore
    }
  },

  // Grand celebration fanfare for winning a game or unlocking a sticker
  fanfare(enabled = true) {
    if (!enabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const melody = [
        { f: 523.25, d: 0.12, t: 0 },
        { f: 523.25, d: 0.12, t: 0.14 },
        { f: 523.25, d: 0.12, t: 0.28 },
        { f: 659.25, d: 0.25, t: 0.42 },
        { f: 783.99, d: 0.35, t: 0.68 },
        { f: 1046.5, d: 0.5, t: 1.05 },
      ];
      melody.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, ctx.currentTime + note.t);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + note.t);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.t + note.d);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + note.t);
        osc.stop(ctx.currentTime + note.t + note.d);
      });
    } catch {
      // Ignore
    }
  }
};

/**
 * Speech synthesis with kid-friendly pitch & pacing
 */
let cachedVoices: SpeechSynthesisVoice[] = [];

function getVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  if (cachedVoices.length === 0) {
    cachedVoices = window.speechSynthesis.getVoices();
  }
  return cachedVoices;
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

export function speakText(
  text: string,
  options?: {
    rate?: number; // 0.8 = slow/turtle, 1.0 = normal
    pitch?: number; // ~1.1 for friendly voice
    onEnd?: () => void;
    accent?: 'en-US' | 'en-GB' | 'default';
  }
) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  try {
    // Cancel ongoing speech to avoid overlapping
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const rate = options?.rate ?? 0.95;
    const pitch = options?.pitch ?? 1.15; // slightly higher pitch sounds warm & cheerful for children

    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.lang = options?.accent === 'en-GB' ? 'en-GB' : 'en-US';

    const voices = getVoices();
    // Prioritize natural English voices
    const preferredVoice = voices.find((v) => {
      const name = v.name.toLowerCase();
      const isEnglish = v.lang.startsWith('en');
      if (options?.accent === 'en-GB') {
        return isEnglish && v.lang.includes('GB') && (name.includes('natural') || name.includes('child') || name.includes('google') || name.includes('samantha'));
      }
      return isEnglish && (name.includes('natural') || name.includes('kid') || name.includes('samantha') || name.includes('google') || name.includes('victoria') || name.includes('zira'));
    }) || voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    if (options?.onEnd) {
      utterance.onend = () => options.onEnd?.();
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis failed:', err);
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
