import { useState, useEffect } from 'react';
import { Play, FastForward } from 'lucide-react';

interface RestTimerProps {
  initialSeconds: number;
  onSkip: () => void;
  onComplete: () => void;
}

export default function RestTimer({ initialSeconds, onSkip, onComplete }: RestTimerProps) {
  // Store the absolute end time so background throttling doesn't pause the countdown
  const [endTime] = useState(() => Date.now() + initialSeconds * 1000);
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Request notification permission when timer mounts
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0 && !isCompleted) {
        setIsCompleted(true);
        clearInterval(interval);
        
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([200, 100, 200, 100, 400]);
        }
        
        // Emoji-free notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification("Rest complete", { body: "Time for your next set." });
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [endTime, isCompleted]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = ((initialSeconds - timeLeft) / initialSeconds) * 100;

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in-95">
      <div className="relative w-64 h-64 flex items-center justify-center mb-12">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="none" />
          <circle 
            cx="50" cy="50" r="46" 
            stroke="#3b82f6" strokeWidth="4" fill="none" 
            strokeDasharray="289" 
            strokeDashoffset={289 - (289 * progress) / 100} 
            className="transition-all duration-500 ease-linear"
            strokeLinecap="round"
          />
        </svg>
        <div className="text-center z-10">
          <p className="text-white/50 text-sm font-bold tracking-widest uppercase mb-1">Resting</p>
          <p className="text-6xl font-bold text-white tabular-nums tracking-tighter">
            {mins}:{secs.toString().padStart(2, '0')}
          </p>
        </div>
      </div>

      <div className="w-full max-w-xs space-y-4">
        {timeLeft === 0 ? (
          <button 
            onClick={onComplete}
            className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-5 rounded-3xl flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(59,130,246,0.4)] transition-all"
          >
            <Play size={20} className="fill-white" /> Start Next Set
          </button>
        ) : (
          <button 
            onClick={onSkip}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-5 rounded-3xl flex items-center justify-center gap-2 transition-all"
          >
            <FastForward size={20} /> Skip Rest
          </button>
        )}
      </div>
    </div>
  );
}