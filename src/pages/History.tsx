import { useLiveQuery } from 'dexie-react-hooks';
import { Calendar, Clock, ChevronRight, Trash2 } from 'lucide-react';
import { db } from '../db/db';

export default function History() {
  const history = useLiveQuery(() => db.workoutLogs.orderBy('date').reverse().toArray());

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    return `${minutes}m`;
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      weekday: 'long' 
    });
  };

  const handleDelete = async (id: number | undefined, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents the card click from triggering
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this workout? This cannot be undone.')) {
      await db.workoutLogs.delete(id);
    }
  };

  return (
    <div className="p-6 pb-24 h-full flex flex-col">
      <header className="mb-6 mt-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">History</h1>
        <p className="text-zinc-400 mt-1">Your completed sessions.</p>
      </header>

      <div className="flex-1 overflow-y-auto space-y-4">
        {!history ? (
          <p className="text-zinc-400">Loading history...</p>
        ) : history.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
            <p className="text-zinc-400">No workouts logged yet.</p>
          </div>
        ) : (
          history.map((log) => (
            <div 
              key={log.id} 
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm active:scale-[0.98] transition-transform cursor-pointer relative group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-white font-bold text-lg">{log.templateName}</h3>
                  <div className="flex items-center gap-3 text-zinc-400 text-sm mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} /> {formatDate(log.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {formatTime(log.durationMs)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={(e) => handleDelete(log.id, e)}
                    className="p-2 text-zinc-500 hover:text-red-500 transition-colors rounded-lg hover:bg-zinc-800"
                    title="Delete Workout"
                  >
                    <Trash2 size={18} />
                  </button>
                  <ChevronRight className="text-zinc-600" size={20} />
                </div>
              </div>
              
              <div className="space-y-2 border-t border-zinc-800 pt-4">
                {log.exercises.map((ex, i) => (
                  <div key={i} className="text-sm flex justify-between">
                    <span className="text-white font-medium">{ex.name}</span>
                    <span className="text-zinc-500">
                      {ex.sets.length} sets
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}