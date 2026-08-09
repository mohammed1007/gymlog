import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Workout from './pages/Workout';
import History from './pages/History';
import Settings from './pages/Settings';
import Progress from './pages/Progress';

export default function App() {
  return (
    <BrowserRouter>
      {/* Replaced the broken radial gradient with a safe, dark linear gradient */}
      <div className="flex flex-col h-[100dvh] bg-gradient-to-b from-zinc-900 to-black text-zinc-100 font-sans selection:bg-blue-500/30">
        <main className="flex-1 overflow-y-auto pb-24">
          <Routes>
            <Route path="/" element={<Workout />} />
            <Route path="/workout" element={<Navigate to="/" replace />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}