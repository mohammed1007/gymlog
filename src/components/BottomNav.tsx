import { NavLink } from 'react-router-dom';
import { Dumbbell, History, LineChart, Settings } from 'lucide-react';

export default function BottomNav() {
  const navItems = [
    { path: '/', icon: Dumbbell, label: 'Workout' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/progress', icon: LineChart, label: 'Progress' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50">
      <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] px-6 py-2.5 flex justify-between items-center shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-16 gap-1 transition-all duration-300 ${
                isActive 
                  ? 'text-white scale-105' 
                  : 'text-white/40 hover:text-white/60'
              }`
            }
          >
            <item.icon size={26} strokeWidth={2.5} />
            <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}