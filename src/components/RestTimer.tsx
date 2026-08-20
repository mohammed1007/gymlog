import { useState, useEffect } from 'react';
import { Play, FastForward, Plus, Minus } from 'lucide-react';

interface RestTimerProps {
  initialSeconds: number;
  onSkip: () => void;
  onComplete: () => void;
}

export default function RestTimer({ initialSeconds, onSkip, onComplete }: RestTimerProps) {
  const [totalDuration, setTotalDuration] = useState(initialSeconds);
  const [endTime, setEndTime] = useState(() => Date.now() + initialSeconds * 1000);
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0 && !isCompleted) {
        setIsCompleted(true);
        clearInterval(interval);
        
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([200, 100, 200, 100, 400]);
        }
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification("Rest complete", { body: "Time for your next set." });
        }
      }
    }, 250);

    return () => clearInterval(interval);
  }, [endTime, isCompleted]);

  // Dynamic Time Adjustment Handlers
  const handleAddSeconds = (delta: number) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
    const newRemaining = Math.max(5, timeLeft + delta);
    setTotalDuration(prev => Math.max(prev + delta, newRemaining));
    setEndTime(Date.now() + newRemaining * 1000);
    setIsCompleted(false);
  };

  const handleSetPreset = (seconds: number) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
    setTotalDuration(seconds);
    setEndTime(Date.now() + seconds * 1000);
    setTimeLeft(seconds);
    setIsCompleted(false);
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = Math.min(100, Math.max(0, ((totalDuration - timeLeft) / totalDuration) * 100));

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in-95">
      {/* Timer Circle */}
      <div className="relative w-60 h-60 flex items-center justify-center mb-6">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.05)" strokeWidth="5" fill="none" />
          <circle 
            cx="50" cy="50" r="45" 
            stroke="#3b82f6" strokeWidth="5" fill="none" 
            strokeDasharray="282.7" 
            strokeDashoffset={282.7 - (282.7 * progress) / 100} 
            className="transition-all duration-300 ease-linear"
            strokeLinecap="round"
          />
        </svg>
        <div className="text-center z-10 flex flex-col items-center">
          <p className="text-white/60 text-[10px] font-bold tracking-widest uppercase mb-1">Rest Interval</p>
          <p className="text-5xl font-bold text-white tabular-nums tracking-tighter">
            {mins}:{secs.toString().padStart(2, '0')}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <button 
              onClick={() => handleAddSeconds(-15)} 
              className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all"
              title="-15 seconds"
            >
              <Minus size={12} />
            </button>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Adjust</span>
            <button 
              onClick={() => handleAddSeconds(30)} 
              className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all"
              title="+30 seconds"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Preset Pills */}
      <div className="flex gap-2 mb-8">
        {[60, 90, 120, 180].map((sec) => (
          <button
            key={sec}
            onClick={() => handleSetPreset(sec)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
              totalDuration === sec
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            {sec >= 60 ? `${sec / 60}m` : `${sec}s`}
          </button>
        ))}
      </div>

      {/* Main Actions */}
      <div className="w-full max-w-xs space-y-3">
        {timeLeft === 0 ? (
          <button 
            onClick={onComplete}
            className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all"
          >
            <Play size={18} className="fill-white" /> Start Next Set
          </button>
        ) : (
          <button 
            onClick={onSkip}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            <FastForward size={18} /> Skip Rest
          </button>
        )}
      </div>
    </div>
  );
}