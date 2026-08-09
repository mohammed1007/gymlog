import { useLiveQuery } from 'dexie-react-hooks';
import { TrendingUp, Target } from 'lucide-react';
import { db } from '../db/db';

export default function Progress() {
  // Pull all workout logs to calculate maximums
  const logs = useLiveQuery(() => db.workoutLogs.toArray());

  // A helper function that scans your entire history to find the heaviest weight lifted for a specific exercise
  const getMaxWeight = (exerciseName: string) => {
    if (!logs || logs.length === 0) return 0;
    
    let max = 0;
    logs.forEach(log => {
      log.exercises.forEach(ex => {
        if (ex.name === exerciseName) {
          ex.sets.forEach(set => {
            if (set.weight > max) {
              max = set.weight;
            }
          });
        }
      });
    });
    return max;
  };

  // Define the exercises you want to track on the dashboard
  const personalRecords = [
    { name: 'Machine Chest Press', value: getMaxWeight('Machine Chest Press'), unit: 'kg' },
    { name: 'Linear Hack Press', value: getMaxWeight('Linear Hack Press'), unit: 'kg' },
    { name: 'Pull-Ups (Added Weight)', value: getMaxWeight('Pull-Ups'), unit: 'kg' },
  ];

  return (
    <div className="p-6 pb-24 h-full flex flex-col">
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">Progress</h1>
        <p className="text-zinc-400 mt-1">Track your strength and bulking goals.</p>
      </header>
      
      <div className="space-y-8">
        
        {/* Strength Progress Section */}
        <section>
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-500" /> Personal Records
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {personalRecords.map(pr => (
              <div key={pr.name} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between">
                <p className="text-zinc-400 text-xs font-bold uppercase mb-3 leading-tight">{pr.name}</p>
                <p className="text-3xl font-bold text-white tracking-tighter">
                  {pr.value} <span className="text-lg text-zinc-500 font-medium">{pr.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </section>
        
        {/* Bodyweight Tracking Section */}
        <section>
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Target size={18} className="text-green-500" /> Bulking Progress
          </h2>
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex justify-between items-center">
            <div>
              <p className="text-zinc-400 text-sm mb-1">Current Weight</p>
              <p className="text-2xl font-bold text-white tracking-tighter">
                68.0 <span className="text-lg text-zinc-500 font-medium">kg</span>
              </p>
            </div>
            <button className="bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white font-bold py-3 px-5 rounded-xl text-sm transition-all">
              Log Weight
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}