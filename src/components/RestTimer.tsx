import { useState, useEffect } from 'react';
import { Play, Pause, FastForward, Plus, Minus } from 'lucide-react';

interface RestTimerProps {
  initialSeconds: number;
  onComplete: () => void;
  onSkip: () => void;
}

export default function RestTimer({ initialSeconds, onComplete, onSkip }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: number | undefined;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      onComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, onComplete]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <h2 className="text-2xl font-bold text-zinc-400">REST</h2>
      
      <div className="text-7xl font-bold text-white tabular-nums tracking-tighter">
        {formatTime(timeLeft)}
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={() => setTimeLeft(t => Math.max(0, t - 30))}
          className="p-4 bg-zinc-800 rounded-full text-white active:scale-95"
        >
          <Minus size={24} />
        </button>
        
        <button 
          onClick={() => setIsActive(!isActive)}
          className="p-6 bg-blue-600 rounded-full text-white active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
        >
          {isActive ? <Pause size={32} /> : <Play size={32} />}
        </button>
        
        <button 
          onClick={() => setTimeLeft(t => t + 30)}
          className="p-4 bg-zinc-800 rounded-full text-white active:scale-95"
        >
          <Plus size={24} />
        </button>
      </div>

      <button 
        onClick={onSkip}
        className="mt-8 px-8 py-4 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-300 font-bold active:bg-zinc-800"
      >
        <div className="flex items-center gap-2">
          Skip Rest <FastForward size={20} />
        </div>
      </button>
    </div>
  );
}