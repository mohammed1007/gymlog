import { useLiveQuery } from 'dexie-react-hooks';
import { TrendingUp, Activity, Dumbbell, Flame } from 'lucide-react';
import { db } from '../db/db';

export default function Progress() {
  const pastWorkouts = useLiveQuery(() => db.workoutLogs.toArray());

  // Wait for database to load
  if (!pastWorkouts) {
    return <div className="p-6 text-white/50">Loading metrics...</div>;
  }

  // --- STAT CALCULATIONS ---
  const totalSessions = pastWorkouts.length;
  
  // Calculate total volume (reps * weight) across all time
  let totalVolume = 0;
  pastWorkouts.forEach(log => {
    log.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        // If bodyweight, we just count the reps for the volume visualization
        const weightToUse = set.weight > 0 ? set.weight : 1; 
        totalVolume += (set.reps * weightToUse);
      });
    });
  });

  // Helper to find the absolute max weight ever lifted for a specific exercise ID
  const getMaxWeight = (exerciseId: string) => {
    let max = 0;
    pastWorkouts.forEach(log => {
      const exercise = log.exercises.find(ex => ex.exerciseId === exerciseId);
      if (exercise) {
        exercise.sets.forEach(set => {
          if (set.weight > max) max = set.weight;
        });
      }
    });
    return max;
  };

  const keyLifts = [
    { name: 'Machine Chest Press', max: getMaxWeight('machine-chest-press') },
    { name: 'Linear Hack Press', max: getMaxWeight('linear-hack-press') },
    { name: 'Lat Pulldown', max: getMaxWeight('lat-pulldown-machine') },
  ];

  return (
    <div className="p-6 pb-24 h-full flex flex-col animate-in fade-in">
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">Progress</h1>
        <p className="text-white/60 mt-1">Your journey in numbers.</p>
      </header>

      {/* Top Level Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={16} className="text-blue-400" />
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest">Sessions</h3>
          </div>
          <p className="text-4xl font-bold text-white">{totalSessions}</p>
        </div>

        <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={16} className="text-orange-400" />
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest">Volume</h3>
          </div>
          <p className="text-4xl font-bold text-white">
            {totalVolume > 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : totalVolume}
          </p>
        </div>
      </div>

      {/* Progressive Overload Tracker */}
      <h2 className="text-xl font-bold text-white mb-4 mt-2 tracking-tight flex items-center gap-2">
        <TrendingUp className="text-green-400" size={20}/> Lifetime PRs
      </h2>
      
      <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-lg space-y-5">
        {keyLifts.map((lift, i) => (
          <div key={i} className="flex justify-between items-center group">
            <div className="flex items-center gap-3">
              <div className="bg-black/20 p-2 rounded-xl border border-white/5">
                <Dumbbell size={16} className="text-white/50" />
              </div>
              <span className="text-white font-medium">{lift.name}</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-white">
                {lift.max > 0 ? lift.max : '--'}
              </span>
              <span className="text-white/50 text-xs ml-1">kg</span>
            </div>
          </div>
        ))}
      </div>

      {totalSessions === 0 && (
        <div className="mt-8 text-center text-white/40 text-sm p-6 bg-white/5 rounded-3xl border border-white/5 border-dashed">
          Complete your first workout to start generating insights.
        </div>
      )}
    </div>
  );
}