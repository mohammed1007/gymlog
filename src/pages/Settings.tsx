import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Download, Upload, Server, Calendar, List, ChevronRight, ArrowLeft, Plus, Trash2, X, Minus, FileText, Eye, EyeOff } from 'lucide-react';
import { db } from '../db/db';
import MuscleMap from '../components/MuscleMap';

type SettingsView = 'main' | 'routines' | 'habits' | 'data';

export default function Settings() {
  const [view, setView] = useState<SettingsView>('main');
  const [status, setStatus] = useState<string | null>(null);

  const routines = useLiveQuery(() => db.routineTemplates.toArray());
  const exercises = useLiveQuery(() => db.exercises.toArray());
  const habits = useLiveQuery(() => db.habitDefinitions.toArray());

  const [newDayName, setNewDayName] = useState('');
  const [newHabitName, setNewHabitName] = useState('');
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      if (view !== 'main') {
        window.history.pushState(null, '', window.location.pathname);
        setView('main');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [view]);

  const getSafeExercises = (routine: any) => {
    if (!routine) return [];
    if (routine.exercises) return routine.exercises;
    if (routine.exerciseIds) return routine.exerciseIds.map((id: string) => ({ exerciseId: id, sets: 3 }));
    return [];
  };

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

  const handleExportRoutineText = () => {
    if (!routines || !exercises) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);

    let text = "🏋️ MY GYM ROUTINE PLAN\n";
    text += "========================================\n\n";

    routines.forEach(routine => {
      text += `📅 ${routine.dayKey.toUpperCase()} ${routine.isActive === false ? '(HIDDEN)' : ''}\n`;
      text += "----------------------------------------\n";

      const safeItems = getSafeExercises(routine);
      if (safeItems.length === 0) {
        text += "No exercises planned.\n";
      } else {
        safeItems.forEach((item: any, index: number) => {
          const ex = exercises.find(e => e.id === item.exerciseId);
          if (ex) {
            text += `${index + 1}. ${ex.name} (${ex.equipment})\n`;
            text += `   Target: ${item.sets} sets × ${ex.minReps}-${ex.maxReps} reps\n`;
            if (ex.notes) {
              text += `   💡 Note: ${ex.notes}\n`;
            }
          }
        });
      }
      text += "\n";
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `My_Gym_Routine.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddHabit = async () => {
    if (!newHabitName) return;
    const id = newHabitName.toLowerCase().replace(/\s+/g, '-');
    await db.habitDefinitions.add({ id, label: newHabitName });
    setNewHabitName('');
  };

  const handleAddDay = async () => {
    if (!newDayName) return;
    await db.routineTemplates.add({ dayKey: newDayName, exercises: [], isActive: true });
    setNewDayName('');
  };

  const handleDeleteDay = async (dayKey: string) => {
    if (confirm(`Are you sure you want to delete ${dayKey} entirely?`)) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([50, 100, 50]);
      await db.routineTemplates.delete(dayKey);
      setEditingDay(null);
    }
  };

  const handleToggleVisibility = async (dayKey: string, currentStatus: boolean | undefined) => {
    const template = routines?.find(r => r.dayKey === dayKey);
    if (!template) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
    
    await db.routineTemplates.put({
      ...template,
      isActive: currentStatus === false ? true : false
    });
  };

  const handleRemoveExercise = async (dayKey: string, exerciseId: string) => {
    const template = routines?.find(r => r.dayKey === dayKey);
    if (!template) return;
    const safeItems = getSafeExercises(template);
    await db.routineTemplates.put({
      ...template,
      exercises: safeItems.filter((item: any) => item.exerciseId !== exerciseId)
    });
  };

  const handleUpdateSets = async (dayKey: string, exerciseId: string, newSets: number) => {
    if (newSets < 1) return;
    const template = routines?.find(r => r.dayKey === dayKey);
    if (!template) return;
    const safeItems = getSafeExercises(template);
    await db.routineTemplates.put({
      ...template,
      exercises: safeItems.map((item: any) => item.exerciseId === exerciseId ? { ...item, sets: newSets } : item)
    });
  };

  const handleAddExercise = async (dayKey: string, exerciseId: string) => {
    const template = routines?.find(r => r.dayKey === dayKey);
    if (!template) return;
    const exerciseDef = exercises?.find(e => e.id === exerciseId);
    const defaultSets = exerciseDef?.defaultSets || 3;
    const safeItems = getSafeExercises(template);

    if (!safeItems.some((item: any) => item.exerciseId === exerciseId)) {
      await db.routineTemplates.put({
        ...template,
        exercises: [...safeItems, { exerciseId, sets: defaultSets }]
      });
    }
    setShowExercisePicker(false);
  };

  if (view === 'main') {
    return (
      <div className="p-6 pb-36 min-h-full flex flex-col animate-in fade-in">
        <header className="mb-8 mt-4">
          <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        </header>

        <div className="space-y-3">
          <button onClick={() => setView('routines')} className="w-full bg-white/5 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl flex items-center justify-between transition-all active:scale-95 hover:bg-white/10">
            <div className="flex items-center gap-4">
              <div className="bg-black/20 p-3 rounded-xl border border-white/5"><Calendar size={20} className="text-blue-400" /></div>
              <div className="text-left"><h3 className="text-white font-bold">Manage Routines</h3><p className="text-white/50 text-xs">Add days, swap exercises & set visibility.</p></div>
            </div>
            <ChevronRight className="text-white/30" />
          </button>

          <button onClick={() => setView('habits')} className="w-full bg-white/5 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl flex items-center justify-between transition-all active:scale-95 hover:bg-white/10">
            <div className="flex items-center gap-4">
              <div className="bg-black/20 p-3 rounded-xl border border-white/5"><List size={20} className="text-amber-400" /></div>
              <div className="text-left"><h3 className="text-white font-bold">Daily Protocol</h3><p className="text-white/50 text-xs">Edit your checklist.</p></div>
            </div>
            <ChevronRight className="text-white/30" />
          </button>

          <button onClick={() => setView('data')} className="w-full bg-white/5 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl flex items-center justify-between transition-all active:scale-95 hover:bg-white/10">
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
    <div className="p-6 pb-36 min-h-full flex flex-col animate-in slide-in-from-right-4">
      <div className="flex items-center gap-3 mb-8 mt-4">
        <button onClick={() => setView('main')} className="p-2 bg-white/10 rounded-full text-white/70 hover:text-white"><ArrowLeft size={20} /></button>
        <h2 className="text-2xl font-bold text-white tracking-tight capitalize">{view}</h2>
      </div>

      {view === 'routines' && (
        <div className="space-y-6">
          {!editingDay ? (
            <>
              {routines?.map(routine => {
                const safeItems = getSafeExercises(routine);
                const isHidden = routine.isActive === false;
                
                return (
                  <div key={routine.dayKey} className={`bg-white/5 border p-5 rounded-3xl flex justify-between items-center transition-all ${isHidden ? 'border-white/5 opacity-50' : 'border-white/10'}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-bold">{routine.dayKey}</h4>
                        {isHidden && <span className="bg-white/10 text-white/50 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Hidden</span>}
                      </div>
                      <p className="text-white/50 text-xs mt-0.5">{safeItems.length} exercises</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleToggleVisibility(routine.dayKey, routine.isActive)} className="p-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-xl transition-all">
                        {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button onClick={() => setEditingDay(routine.dayKey)} className="px-4 py-2 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-xl">Edit</button>
                    </div>
                  </div>
                );
              })}
              <div className="flex gap-2 mb-6">
                <input type="text" value={newDayName} onChange={e => setNewDayName(e.target.value)} placeholder="E.g., Upper Body" className="flex-1 bg-black/20 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-500/50" />
                <button onClick={handleAddDay} disabled={!newDayName} className="bg-blue-500 disabled:bg-white/10 text-white px-5 rounded-2xl font-bold"><Plus /></button>
              </div>

              <div className="pt-6 border-t border-white/10">
                <button onClick={handleExportRoutineText} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 rounded-2xl flex justify-center items-center gap-2 transition-all">
                  <FileText size={18} className="text-white/50" /> Export Routines as Text
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold text-xl">{editingDay}</h3>
                <div className="flex gap-3 items-center">
                  <button onClick={() => handleDeleteDay(editingDay)} className="p-2 text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all"><Trash2 size={18} /></button>
                  <button onClick={() => setEditingDay(null)} className="text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all">Done</button>
                </div>
              </div>
              <div className="space-y-3">
                {(() => {
                  const currentRoutine = routines?.find(r => r.dayKey === editingDay);
                  const safeItems = getSafeExercises(currentRoutine);
                  
                  return safeItems.map((item: any) => {
                    const ex = exercises?.find(e => e.id === item.exerciseId);
                    return (
                      <div key={item.exerciseId} className="flex justify-between items-center bg-black/20 border border-white/5 p-4 rounded-2xl">
                        <div>
                          <span className="text-white font-medium block">{ex?.name || item.exerciseId}</span>
                          <span className="text-white/40 text-xs">{item.sets} sets planned</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                            <button onClick={() => handleUpdateSets(editingDay, item.exerciseId, item.sets - 1)} className="p-1.5 text-white/60 hover:text-white"><Minus size={14} /></button>
                            <span className="text-white font-bold text-xs px-2">{item.sets}</span>
                            <button onClick={() => handleUpdateSets(editingDay, item.exerciseId, item.sets + 1)} className="p-1.5 text-white/60 hover:text-white"><Plus size={14} /></button>
                          </div>
                          <button onClick={() => handleRemoveExercise(editingDay, item.exerciseId)} className="text-red-400 p-2"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    );
                  });
                })()}
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

      {showExercisePicker && editingDay && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl p-6 flex flex-col pb-safe">
          <div className="flex justify-between items-center mb-6 mt-4">
            <h3 className="text-xl font-bold text-white">Select Exercise</h3>
            <button aria-label="Close" onClick={() => setShowExercisePicker(false)} className="p-3 bg-white/10 rounded-full"><X size={20} className="text-white" /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 hide-scrollbar pb-36">
            {exercises?.map(ex => {
              const routine = routines?.find(r => r.dayKey === editingDay);
              const safeItems = getSafeExercises(routine);
              const isAdded = safeItems.some((item: any) => item.exerciseId === ex.id);
              
              return (
                <button 
                  key={ex.id} 
                  disabled={isAdded} 
                  onClick={() => handleAddExercise(editingDay, ex.id)} 
                  className={`w-full flex justify-between items-center p-3 rounded-2xl border transition-all ${
                    isAdded ? 'bg-white/5 border-white/5 opacity-50' : 'bg-white/10 border-white/10 hover:bg-white/20 hover:scale-[1.02]'
                  }`}
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="bg-black/40 rounded-xl p-1 border border-white/5">
                      <MuscleMap muscleGroup={ex.muscleGroup} exerciseId={ex.id} />
                    </div>
                    
                    <div>
                      <p className="text-white font-bold text-lg">{ex.name}</p>
                      <p className="text-blue-400/80 font-medium text-xs tracking-widest uppercase">{ex.muscleGroup}</p>
                      <p className="text-white/40 text-[10px] mt-0.5">{ex.equipment}</p>
                    </div>
                  </div>
                  
                  {!isAdded && (
                    <div className="p-2 bg-blue-500/20 rounded-full mr-2">
                      <Plus className="text-blue-400" size={18} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}