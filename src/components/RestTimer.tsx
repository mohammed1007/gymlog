import { useState, useEffect } from 'react';
import { Timer, Bell, BellRing, ArrowRight } from 'lucide-react';

interface RestTimerProps {
  initialSeconds: number;
  onSkip: () => void;
  onComplete: () => void;
}

export default function RestTimer({ initialSeconds, onSkip, onComplete }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [endTime] = useState(() => Date.now() + initialSeconds * 1000);
  const [permission, setPermission] = useState(Notification.permission);

  const requestNotify = () => {
    if (typeof Notification !== 'undefined') {
      Notification.requestPermission().then(p => setPermission(p));
    }
  };

  useEffect(() => {
    // Check permission on mount
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      requestNotify();
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        
        // Trigger Lock-Screen Notification
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('Rest Complete ⚡️', { 
            body: 'Time to crush your next set!',
            icon: '/icon.png' // Add your PWA icon here if you have one
          });
        }
        
        // Trigger Haptics
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([200, 100, 200, 100, 200]);
        }
        onComplete();
      }
    }, 500); // Check twice a second for higher precision when backgrounded

    return () => clearInterval(interval);
  }, [endTime, onComplete]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = ((initialSeconds - timeLeft) / initialSeconds) * 100;

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in-95">
      <div className="relative w-64 h-64 flex items-center justify-center mb-10">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="48" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
          <circle 
            cx="50" cy="50" r="48" 
            stroke="#60a5fa" strokeWidth="4" fill="none" 
            strokeDasharray="301.59" 
            strokeDashoffset={301.59 - (301.59 * progress) / 100} 
            className="transition-all duration-500 ease-linear"
          />
        </svg>
        <div className="text-center z-10">
          <Timer className="mx-auto mb-2 text-blue-400" size={32} />
          <span className="text-6xl font-bold text-white tabular-nums tracking-tighter">
            {mins}:{secs.toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {permission !== 'granted' && typeof Notification !== 'undefined' && (
        <button onClick={requestNotify} className="mb-8 flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-400/10 px-4 py-2 rounded-full border border-amber-400/20">
          <Bell size={14} /> Enable Rest Notifications
        </button>
      )}

      {permission === 'granted' && (
        <p className="mb-8 flex items-center gap-1.5 text-xs font-bold text-blue-400 opacity-50">
          <BellRing size={12} /> Background Notifications Active
        </p>
      )}

      <button 
        onClick={onSkip}
        className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-lg py-5 px-10 rounded-[2rem] flex items-center justify-center gap-2 transition-all"
      >
        Skip Rest <ArrowRight size={20} />
      </button>
    </div>
  );
}