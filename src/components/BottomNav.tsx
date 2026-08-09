import { NavLink, useLocation } from 'react-router-dom';
import { Dumbbell, LineChart, History, Settings } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { to: '/', icon: Dumbbell, label: 'Workout' },
    { to: '/progress', icon: LineChart, label: 'Progress' },
    { to: '/history', icon: History, label: 'History' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-[#1c1c1e]/60 backdrop-blur-3xl border-t border-white/[0.08] pb-safe z-50">
      <div className="flex justify-around items-center h-20 px-2 pb-2">
        {navItems.map(({ to, icon: Icon, label }) => {
          // Safely check if this specific tab is currently active
          const isActive = location.pathname === to;
          
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${
                isActive ? 'text-blue-500 scale-105' : 'text-zinc-500 hover:text-zinc-400'
              }`}
            >
              <Icon size={26} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium tracking-wide">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}