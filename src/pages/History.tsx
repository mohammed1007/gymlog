import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Calendar, Clock, Dumbbell, ChevronDown, ChevronUp } from 'lucide-react';
import { db } from '../db/db';

export default function History() {
  const pastWorkouts = useLiveQuery(() => db.workoutLogs.orderBy('date').reverse().toArray());
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const toggleExpand = (id: number) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    return `${minutes} min`;
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (!pastWorkouts) {
    return <div className="p-6 text-white/50">Loading history...</div>;
  }

  return (
    <div className="p-6 pb-36 min-h-full flex flex-col animate-in fade-in">
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">History</h1>
        <p className="text-white/60 text-sm mt-1">Review your past performance.</p>
      </header>

      {pastWorkouts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center border border-dashed border-white/10 rounded-3xl p-6">
          <p className="text-white/30 text-center text-sm">No workouts recorded yet.<br/>Go crush a session!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pastWorkouts.map((workout, index) => {
            // We use index as a fallback key if id is undefined, but Dexie auto-increments it
            const workoutId = workout.id ?? index;
            const isExpanded = expandedIds.includes(workoutId);

            return (
              <div 
                key={workoutId} 
                className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden transition-all shadow-lg"
              >
                {/* Header Summary */}
                <button 
                  onClick={() => toggleExpand(workoutId)}
                  className="w-full p-5 text-left flex items-center justify-between hover:bg-white/5 active:bg-white/10 transition-colors"
                >
                  <div>
                    <h3 className="text-white font-bold text-lg">{workout.templateName}</h3>
                    <div className="flex items-center gap-4 mt-2 text-white/50 text-xs font-medium uppercase tracking-wider">
                      <span className="flex items-center gap-1.5"><Calendar size={14} className="text-blue-400" /> {formatDate(workout.date)}</span>
                      <span className="flex items-center gap-1.5"><Clock size={14} className="text-amber-400" /> {formatDuration(workout.durationMs)}</span>
                    </div>
                  </div>
                  <div className="bg-black/20 p-2 rounded-full border border-white/5">
                    {isExpanded ? <ChevronUp size={18} className="text-white/50" /> : <ChevronDown size={18} className="text-white/50" />}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-2 border-t border-white/10 bg-black/20 animate-in slide-in-from-top-2">
                    <div className="space-y-5 mt-4">
                      {workout.exercises.map((ex, i) => (
                        <div key={i}>
                          <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                            <Dumbbell size={16} className="text-purple-400" />
                            {ex.name}
                          </h4>
                          
                          {/* Sets List */}
                          <div className="space-y-2 pl-6 border-l-2 border-white/5 ml-1.5">
                            {ex.sets.map((set, setIdx) => (
                              <div key={setIdx} className="flex justify-between items-center text-xs">
                                <span className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Set {setIdx + 1}</span>
                                <span className="text-white font-bold tabular-nums text-sm">
                                  {set.weight > 0 ? `${set.weight} kg × ` : ''}{set.reps} <span className="text-white/40 text-[10px] uppercase">reps</span>
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}