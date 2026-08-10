import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Download, Upload, Server, Calendar, List, ChevronRight, ArrowLeft, Plus, Trash2, X } from 'lucide-react';
import { db } from '../db/db';

type SettingsView = 'main' | 'routines' | 'habits' | 'data';

export default function Settings() {
  const [view, setView] = useState<SettingsView>('main');
  const [status, setStatus] = useState<string | null>(null);

  // Data
  const routines = useLiveQuery(() => db.routineTemplates.toArray());
  const exercises = useLiveQuery(() => db.exercises.toArray());
  const habits = useLiveQuery(() => db.habitDefinitions.toArray());

  // Local State for editors
  const [newDayName, setNewDayName] = useState('');
  const [newHabitName, setNewHabitName] = useState('');
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  // --- DATA SYNC ---
  const handleExport = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
      const workoutLogs = await db.workoutLogs.toArray();
      const bodyweightLogs = await db.bodyweightLogs.toArray();
      const data = { workoutLogs, bodyweightLogs };
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gymlog-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus('Export successful!');
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      setStatus('Export failed.');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.workoutLogs) await db.workoutLogs.bulkAdd(data.workoutLogs);
        if (data.bodyweightLogs) await db.bodyweightLogs.bulkAdd(data.bodyweightLogs);
        setStatus('Import successful!');
        setTimeout(() => setStatus(null), 3000);
      } catch (err) {
        setStatus('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  // --- HABIT EDITOR ---
  const handleAddHabit = async () => {
    if (!newHabitName) return;
    const id = newHabitName.toLowerCase().replace(/\s+/g, '-');
    await db.habitDefinitions.add({ id, label: newHabitName });
    setNewHabitName('');
  };

  // --- ROUTINE EDITOR ---
  const handleAddDay = async () => {
    if (!newDayName) return;
    await db.routineTemplates.add({ dayKey: newDayName, exerciseIds: [] });
    setNewDayName('');
  };

  const handleRemoveExercise = async (dayKey: string, exerciseId: string) => {
    const template = routines?.find(r => r.dayKey === dayKey);
    if (!template) return;
    await db.routineTemplates.put({
      dayKey,
      exerciseIds: template.exerciseIds.filter(id => id !== exerciseId)
    });
  };

  const handleAddExercise = async (dayKey: string, exerciseId: string) => {
    const template = routines?.find(r => r.dayKey === dayKey);
    if (!template) return;
    if (!template.exerciseIds.includes(exerciseId)) {
      await db.routineTemplates.put({
        dayKey,
        exerciseIds: [...template.exerciseIds, exerciseId]
      });
    }
    setShowExercisePicker(false);
  };

  // --- RENDERERS ---
  if (view === 'main') {
    return (
      <div className="p-6 pb-36 h-full flex flex-col animate-in fade-in">
        <header className="mb-8 mt-4">
          <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        </header>

        <div className="space-y-3">
          <button onClick={() => setView('routines')} className="w-full bg-white/[0.06] backdrop-blur-2xl border border-white/10 p-5 rounded-3xl flex items-center justify-between transition-all active:scale-95">
            <div className="flex items-center gap-4">
              <div className="bg-black/20 p-3 rounded-xl border border-white/5"><Calendar size={20} className="text-blue-400" /></div>
              <div className="text-left"><h3 className="text-white font-bold">Manage Routines</h3><p className="text-white/50 text-xs">Add days, swap exercises.</p></div>
            </div>
            <ChevronRight className="text-white/30" />
          </button>

          <button onClick={() => setView('habits')} className="w-full bg-white/[0.06] backdrop-blur-2xl border border-white/10 p-5 rounded-3xl flex items-center justify-between transition-all active:scale-95">
            <div className="flex items-center gap-4">
              <div className="bg-black/20 p-3 rounded-xl border border-white/5"><List size={20} className="text-amber-400" /></div>
              <div className="text-left"><h3 className="text-white font-bold">Daily Protocol</h3><p className="text-white/50 text-xs">Edit your checklist.</p></div>
            </div>
            <ChevronRight className="text-white/30" />
          </button>

          <button onClick={() => setView('data')} className="w-full bg-white/[0.06] backdrop-blur-2xl border border-white/10 p-5 rounded-3xl flex items-center justify-between transition-all active:scale-95">
            <div className="flex items-center gap-4">
              <div className="bg-black/20 p-3 rounded-xl border border-white/5"><Server size={20} className="text-purple-400" /></div>
              <div className="text-left"><h3 className="text-white font-bold">Data Sync</h3><p className="text-white/50 text-xs">Export & Import backups.</p></div>
            </div>
            <ChevronRight className="text-white/30" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-36 h-full flex flex-col animate-in slide-in-from-right-4">
      <div className="flex items-center gap-3 mb-8 mt-4">
        <button onClick={() => setView('main')} className="p-2 bg-white/10 rounded-full text-white/70 hover:text-white"><ArrowLeft size={20} /></button>
        <h2 className="text-2xl font-bold text-white tracking-tight capitalize">{view}</h2>
      </div>

      {view === 'routines' && (
        <div className="space-y-6">
          {!editingDay ? (
            <>
              {routines?.map(routine => (
                <div key={routine.dayKey} className="bg-white/5 border border-white/10 p-5 rounded-3xl flex justify-between items-center">
                  <div>
                    <h4 className="text-white font-bold">{routine.dayKey}</h4>
                    <p className="text-white/50 text-xs">{routine.exerciseIds.length} exercises</p>
                  </div>
                  <button onClick={() => setEditingDay(routine.dayKey)} className="px-4 py-2 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-xl">Edit</button>
                </div>
              ))}
              <div className="flex gap-2">
                <input type="text" value={newDayName} onChange={e => setNewDayName(e.target.value)} placeholder="E.g., Day D" className="flex-1 bg-black/20 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-500/50" />
                <button onClick={handleAddDay} disabled={!newDayName} className="bg-blue-500 disabled:bg-white/10 text-white px-5 rounded-2xl font-bold"><Plus /></button>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold text-xl">{editingDay}</h3>
                <button onClick={() => setEditingDay(null)} className="text-xs text-white/50">Done</button>
              </div>
              <div className="space-y-2">
                {routines?.find(r => r.dayKey === editingDay)?.exerciseIds.map(id => {
                  const ex = exercises?.find(e => e.id === id);
                  return (
                    <div key={id} className="flex justify-between items-center bg-black/20 border border-white/5 p-4 rounded-2xl">
                      <span className="text-white font-medium">{ex?.name || id}</span>
                      <button onClick={() => handleRemoveExercise(editingDay, id)} className="text-red-400 p-2"><Trash2 size={16} /></button>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => setShowExercisePicker(true)} className="w-full mt-4 bg-white/10 border border-white/10 text-white font-bold py-4 rounded-2xl flex justify-center gap-2"><Plus size={18} /> Add Exercise</button>
            </>
          )}
        </div>
      )}

      {view === 'habits' && (
        <div className="space-y-4">
          {habits?.map(habit => (
            <div key={habit.id} className="flex justify-between items-center bg-black/20 border border-white/5 p-4 rounded-2xl">
              <span className="text-white font-medium">{habit.label}</span>
              <button onClick={() => db.habitDefinitions.delete(habit.id)} className="text-red-400 p-2"><Trash2 size={16} /></button>
            </div>
          ))}
          <div className="flex gap-2 mt-4">
            <input type="text" value={newHabitName} onChange={e => setNewHabitName(e.target.value)} placeholder="New checklist item..." className="flex-1 bg-black/20 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-amber-500/50" />
            <button onClick={handleAddHabit} disabled={!newHabitName} className="bg-amber-500 disabled:bg-white/10 text-white px-5 rounded-2xl font-bold"><Plus /></button>
          </div>
        </div>
      )}

      {view === 'data' && (
        <div className="space-y-4">
          <button onClick={handleExport} className="w-full bg-white/10 border border-white/10 text-white font-bold py-4 rounded-2xl flex justify-center gap-2"><Download size={18} /> Export Backup</button>
          <div className="relative w-full">
            <input type="file" accept=".json" onChange={handleImport} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <button className="w-full bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold py-4 rounded-2xl flex justify-center gap-2 pointer-events-none"><Upload size={18} /> Import Backup</button>
          </div>
          {status && <p className="text-center text-sm text-white/50 mt-4">{status}</p>}
        </div>
      )}

      {/* Exercise Picker Modal */}
      {showExercisePicker && editingDay && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl p-6 overflow-y-auto pb-36">
          <div className="flex justify-between items-center mb-6 mt-4">
            <h3 className="text-xl font-bold text-white">Select Exercise</h3>
            <button onClick={() => setShowExercisePicker(false)} className="p-3 bg-white/10 rounded-full"><X size={20} className="text-white" /></button>
          </div>
          <div className="space-y-2">
            {exercises?.map(ex => {
              const isAdded = routines?.find(r => r.dayKey === editingDay)?.exerciseIds.includes(ex.id);
              return (
                <button key={ex.id} disabled={isAdded} onClick={() => handleAddExercise(editingDay, ex.id)} className={`w-full flex justify-between items-center p-4 rounded-2xl border ${isAdded ? 'bg-white/5 border-white/5 opacity-50' : 'bg-white/10 border-white/10'}`}>
                  <div className="text-left"><p className="text-white font-bold">{ex.name}</p><p className="text-white/40 text-xs">{ex.muscleGroup}</p></div>
                  {!isAdded && <Plus className="text-blue-400" size={18} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}