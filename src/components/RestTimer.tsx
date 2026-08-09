import { useState, useEffect } from 'react';
import { FastForward, Plus } from 'lucide-react';

interface RestTimerProps {
  initialSeconds: number;
  onSkip: () => void;
  onComplete: () => void;
}

export default function RestTimer({ initialSeconds, onSkip, onComplete }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      // 3 distinct pulses when the timer finishes
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 100, 100]); 
      }
      onComplete();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const addTime = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
    setTimeLeft(prev => prev + 30);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in-95 fade-in duration-300">
      
      {/* Glassmorphism Glowing Ring */}
      <div className="relative flex items-center justify-center w-64 h-64 bg-white/[0.03] backdrop-blur-3xl rounded-full border border-white/10 shadow-[0_0_80px_rgba(59,130,246,0.15)] mb-16 mt-8">
        {/* Animated outer rim */}
        <div className="absolute inset-0 rounded-full border border-white/5 border-t-blue-500/50 animate-[spin_4s_linear_infinite]" />
        <div className="absolute inset-4 rounded-full border border-white/5 border-b-blue-400/30 animate-[spin_3s_linear_infinite_reverse]" />
        
        <div className="flex flex-col items-center">
          <span className="text-blue-400 font-bold text-xs tracking-widest uppercase mb-2">Resting</span>
          <h2 className="text-7xl font-bold text-white tracking-tighter tabular-nums">
            {formatTime(timeLeft)}
          </h2>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 w-full px-4">
        <button 
          onClick={addTime}
          className="flex-1 bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/10 text-white font-bold py-5 rounded-3xl flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Plus size={20} /> 30s
        </button>
        <button 
          onClick={() => {
            if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
            onSkip();
          }}
          className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-bold py-5 rounded-3xl flex items-center justify-center gap-2 transition-all active:scale-95 border border-blue-500/30"
        >
          Skip <FastForward size={20} />
        </button>
      </div>
    </div>
  );
}