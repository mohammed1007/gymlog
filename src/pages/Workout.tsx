import { useState, useEffect, type ChangeEvent } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { CheckSquare, Square, Check, ArrowRight, RotateCcw, Target, Zap, Info, Calculator, X, Eye, EyeOff, Play, Trash2, Clock, AlertTriangle, ArrowRightLeft, Plus } from 'lucide-react';
import RestTimer from '../components/RestTimer';
import MuscleMap from '../components/MuscleMap';
import { db, type ExerciseSet, type CompletedExercise, type ExerciseDefinition } from '../db/db';

type WorkoutState = 'select-day' | 'general-warmup' | 'working-sets' | 'rest' | 'exercise-complete' | 'cooldown' | 'summary';

export default function Workout() {
  const [currentState, setCurrentState] = useState<WorkoutState>('select-day');
  const [selectedDayKey, setSelectedDayKey] = useState<string>('Day A');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isWeighted, setIsWeighted] = useState(false);
  const [showPlateModal, setShowPlateModal] = useState(false);
  const [showMuscleMap, setShowMuscleMap] = useState(false);
  
  // Mid-Workout Swapping State
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'add' | 'swap'>('add');

  const [reps, setReps] = useState<string>('');
  const [weight, setWeight] = useState<string>(''); 
  
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [currentExerciseSets, setCurrentExerciseSets] = useState<ExerciseSet[]>([]);
  const [workoutLog, setWorkoutLog] = useState<CompletedExercise[]>([]);
  
  const currentSet = currentExerciseSets.length + 1;
  const [hasSavedSession, setHasSavedSession] = useState<any>(null);

  const [completedDays, setCompletedDays] = useState<string[]>(() => {
    const saved = localStorage.getItem('gym_completed_days');
    return saved ? JSON.parse(saved) : [];
  });

  const allExercises = useLiveQuery(() => db.exercises.toArray());
  const storedTemplates = useLiveQuery(() => db.routineTemplates.toArray());
  const pastWorkouts = useLiveQuery(() => db.workoutLogs.orderBy('date').reverse().toArray());

  const [warmup, setWarmup] = useState([
    { id: 1, text: 'Arm Swings (Chest/Back stretch) — 15 reps', done: false },
    { id: 2, text: 'Torso Twists — 10 per side', done: false },
    { id: 3, text: 'Leg Swings (Front/Back) — 10 per leg', done: false },
    { id: 4, text: 'Deep Squat Hold (Pry hips) — 30 sec', done: false },
    { id: 5, text: 'Shoulder Circles — 10 fwd / 10 bwd', done: false },
  ]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Browser Navigation / Popstate Trap
  useEffect(() => {
    const handlePopState = () => {
      if (currentState !== 'select-day' && currentState !== 'summary') {
        window.history.pushState(null, '', window.location.pathname);
        setCurrentState('select-day');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentState]);

  // Session Duration Timer
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    let interval: any;
    if (currentState !== 'select-day' && currentState !== 'summary') {
      interval = setInterval(() => setNow(Date.now()), 1000);
    }
    return () => clearInterval(interval);
  }, [currentState]);

  const elapsedMs = now - startTime;
  const elapsedMins = Math.floor(elapsedMs / 60000);
  const elapsedSecs = Math.floor((elapsedMs % 60000) / 1000);
  const isDragging = elapsedMins >= 90; 

  // Session Persistence
  useEffect(() => {
    const saved = localStorage.getItem('active_gym_session');
    if (saved && currentState === 'select-day') {
      setHasSavedSession(JSON.parse(saved));
    }
  }, [currentState]);

  useEffect(() => {
    if (currentState !== 'select-day' && currentState !== 'summary') {
      localStorage.setItem('active_gym_session', JSON.stringify({
        selectedDayKey, currentExerciseIndex, currentExerciseSets, workoutLog, startTime, currentState, warmup
      }));
    } else if (currentState === 'summary') {
      localStorage.removeItem('active_gym_session');
    }
  }, [currentState, selectedDayKey, currentExerciseIndex, currentExerciseSets, workoutLog, startTime, warmup]);

  const handleResumeSession = () => {
    if (!hasSavedSession) return;
    setSelectedDayKey(hasSavedSession.selectedDayKey);
    setCurrentExerciseIndex(hasSavedSession.currentExerciseIndex);
    setCurrentExerciseSets(hasSavedSession.currentExerciseSets);
    setWorkoutLog(hasSavedSession.workoutLog);
    setStartTime(hasSavedSession.startTime);
    setWarmup(hasSavedSession.warmup);
    setCurrentState(hasSavedSession.currentState);
    setHasSavedSession(null);
  };

  const handleDiscardSession = () => {
    localStorage.removeItem('active_gym_session');
    setHasSavedSession(null);
  };

  useEffect(() => {
    localStorage.setItem('gym_completed_days', JSON.stringify(completedDays));
  }, [completedDays]);

  const activeTemplate = storedTemplates?.find(t => t.dayKey === selectedDayKey);
  const routineItems = activeTemplate?.exercises || (activeTemplate as any)?.exerciseIds?.map((id: string) => ({ exerciseId: id, sets: 3 })) || [];
  
  const exercises: (ExerciseDefinition & { plannedSets: number })[] = [];
  if (allExercises && activeTemplate) {
    for (const item of routineItems) {
      const exId = typeof item === 'string' ? item : (item as any)?.exerciseId;
      const setCnt = typeof item === 'string' ? 3 : ((item as any)?.sets || 3);
      const exDef = allExercises.find((e: ExerciseDefinition) => e.id === exId);
      if (exDef) {
        exercises.push({ ...exDef, plannedSets: setCnt });
      }
    }
  }

  const currentExercise = exercises[currentExerciseIndex];

  // Auto-Fill & History Lookup
  useEffect(() => {
    setIsWeighted(false);
    setShowMuscleMap(false);
    
    if (currentExercise && pastWorkouts) {
      let maxHistoricalWeight = 0;
      pastWorkouts.forEach(log => {
        const exLog = log.exercises.find(e => e.exerciseId === currentExercise.id);
        if (exLog && exLog.sets.length > 0) {
          const sessionMax = Math.max(...exLog.sets.map(s => s.weight));
          if (sessionMax > maxHistoricalWeight) {
            maxHistoricalWeight = sessionMax;
          }
        }
      });
      setWeight(maxHistoricalWeight > 0 ? String(maxHistoricalWeight) : '');
      setReps('');
    }
  }, [currentExerciseIndex, currentExercise?.id, pastWorkouts]);

  const toggleWarmup = (id: number) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
    setWarmup(warmup.map(w => w.id === id ? { ...w, done: !w.done } : w));
  };

  const startDay = (dayKey: string) => {
    setSelectedDayKey(dayKey);
    setCurrentExerciseIndex(0);
    setCurrentExerciseSets([]);
    setWorkoutLog([]);
    setStartTime(Date.now());
    setWarmup(warmup.map(w => ({ ...w, done: false })));
    setCurrentState('general-warmup');
  };

  // --- MID WORKOUT ALTERATIONS ---
  const handleSelectNewExercise = async (newExerciseId: string) => {
    if (!activeTemplate) return;
    const exerciseDef = allExercises?.find(e => e.id === newExerciseId);
    const defaultSets = exerciseDef?.defaultSets || 3;
    
    const updatedItems = [...routineItems];

    if (pickerMode === 'swap') {
      updatedItems[currentExerciseIndex] = { exerciseId: newExerciseId, sets: defaultSets };
      setCurrentExerciseSets([]); 
    } else {
      updatedItems.push({ exerciseId: newExerciseId, sets: defaultSets });
    }

    await db.routineTemplates.put({
      dayKey: selectedDayKey,
      exercises: updatedItems
    });

    setShowExercisePicker(false);
  };

  const handleLogSet = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
    if (!currentExercise) return;

    const newSet: ExerciseSet = {
      weight: Number(weight) || 0,
      reps: Number(reps) || 0
    };
    
    const updatedSets = [...currentExerciseSets, newSet];
    setCurrentExerciseSets(updatedSets);
    setReps('');

    if (updatedSets.length < currentExercise.plannedSets) {
      setCurrentState('rest');
    } else {
      const updatedLog = [...workoutLog, {
        exerciseId: currentExercise.id,
        name: currentExercise.name,
        sets: updatedSets
      }];
      setWorkoutLog(updatedLog);
      setCurrentExerciseSets([]); 
      
      // Trigger Visual Confirmation
      setCurrentState('exercise-complete');
    }
  };

  const advanceFromCompletion = () => {
    const nextIncompleteIndex = exercises.findIndex(
      ex => !workoutLog.some(log => log.exerciseId === ex.id)
    );

    if (nextIncompleteIndex !== -1) {
      setCurrentExerciseIndex(nextIncompleteIndex);
      setCurrentState('working-sets');
    } else {
      setCurrentState('cooldown');
    }
  };

  const handleRemoveLoggedSet = (indexToRemove: number) => {
    setCurrentExerciseSets(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFinishWorkout = async () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([50, 50, 50]);
    const durationMs = Date.now() - startTime;
    await db.workoutLogs.add({
      date: new Date().toISOString(),
      templateName: `${selectedDayKey} Routine`,
      durationMs,
      exercises: workoutLog
    });
    
    if (!completedDays.includes(selectedDayKey)) {
      const updated = [...completedDays, selectedDayKey];
      setCompletedDays(updated);
    }
    setCurrentState('summary');
  };

  const getPlateBreakdown = (totalWeight: number) => {
    const netWeight = Math.max(0, totalWeight - 20);
    let perSide = netWeight / 2;
    const plates = [25, 20, 15, 10, 5, 2.5, 1.25];
    const breakdown: { plate: number; count: number }[] = [];
    for (const p of plates) {
      if (perSide >= p) {
        const count = Math.floor(perSide / p);
        breakdown.push({ plate: p, count });
        perSide %= p;
      }
    }
    return breakdown;
  };

  const renderGlobalTimer = () => {
    if (currentState === 'select-day' || currentState === 'summary') return null;
    return (
      <div className={`fixed top-0 left-0 right-0 z-40 p-2 flex justify-center backdrop-blur-md border-b border-white/5 ${isDragging ? 'bg-amber-500/20' : 'bg-black/20'}`}>
        <div className="flex items-center gap-2">
          {isDragging ? <AlertTriangle size={14} className="text-amber-400 animate-pulse" /> : <Clock size={14} className="text-white/50" />}
          <span className={`text-xs font-bold tabular-nums tracking-widest ${isDragging ? 'text-amber-400' : 'text-white/70'}`}>
            {elapsedMins}:{elapsedSecs.toString().padStart(2, '0')}
          </span>
        </div>
      </div>
    );
  };

  const renderDaySelection = () => {
    if (!storedTemplates) return <div className="p-6 text-white/50">Loading routines...</div>;

    return (
      <div className="flex-1 flex flex-col animate-in fade-in">
        {hasSavedSession && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-5 mb-6 flex flex-col gap-4">
            <div>
              <h3 className="text-white font-bold text-lg flex items-center gap-2"><Play size={18} className="text-blue-400 fill-blue-400" /> Session in Progress</h3>
              <p className="text-blue-200/70 text-sm mt-1">You have an unfinished {hasSavedSession.selectedDayKey} workout.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleResumeSession} className="flex-1 bg-blue-500 text-white font-bold py-3 rounded-xl text-sm">Resume</button>
              <button onClick={handleDiscardSession} className="px-4 bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 font-bold rounded-xl transition-all"><Trash2 size={18} /></button>
            </div>
          </div>
        )}

        <div className="flex justify-between items-end mb-8 mt-4">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Routines</h2>
            <p className="text-white/60 text-sm mt-1">Select your training day</p>
          </div>
          {completedDays.length > 0 && (
            <button 
              onClick={() => setCompletedDays([])}
              className="text-xs text-white/50 hover:text-white flex items-center gap-1 bg-white/10 backdrop-blur-xl border border-white/10 px-3 py-2 rounded-full transition-all"
            >
              <RotateCcw size={14} /> Reset ({completedDays.length}/{storedTemplates.length})
            </button>
          )}
        </div>

        <div className="space-y-4 flex-1">
          {storedTemplates.map(template => {
            const isCompleted = completedDays.includes(template.dayKey);
            const templateExercises = template.exercises || (template as any).exerciseIds || [];
            const templateExerciseNames = allExercises 
              ? templateExercises.map((item: any) => {
                  const id = typeof item === 'string' ? item : item.exerciseId;
                  return allExercises.find(e => e.id === id)?.name;
                }).filter(Boolean).join(', ')
              : 'Loading exercises...';

            return (
              <div 
                key={template.dayKey}
                className={`w-full p-6 rounded-3xl border transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] ${
                  isCompleted 
                    ? 'bg-white/5 border-white/5 opacity-50' 
                    : 'bg-white/10 backdrop-blur-xl border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-blue-400 font-bold text-sm tracking-widest uppercase">{template.dayKey}</span>
                    {isCompleted && (
                      <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Completed
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white">{template.dayKey} Routine</h3>
                <p className="text-white/50 text-xs mt-1 line-clamp-2">{templateExerciseNames || 'No exercises added yet.'}</p>

                <button 
                  disabled={templateExercises.length === 0}
                  onClick={() => startDay(template.dayKey)}
                  className="w-full mt-5 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all"
                >
                  Start Workout <ArrowRight size={18} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderGeneralWarmup = () => (
    <div className="flex-1 flex flex-col animate-in fade-in">
      <div className="flex items-center justify-between mb-8 mt-10">
        <button onClick={() => setCurrentState('select-day')} className="text-sm text-blue-400 font-medium">← Save & Exit</button>
        <span className="text-xs font-bold uppercase tracking-widest text-white/50">{selectedDayKey}</span>
      </div>
      <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">Warm-up</h2>
      <div className="space-y-3 flex-1">
        {warmup.map(item => (
          <button 
            key={item.id}
            onClick={() => toggleWarmup(item.id)}
            className={`flex items-center gap-4 w-full text-left p-5 rounded-3xl border transition-all duration-300 ${item.done ? 'bg-white/5 border-white/5' : 'bg-white/10 backdrop-blur-xl border-white/10 shadow-lg'}`}
          >
            {item.done ? <CheckSquare className="text-blue-400" size={24} /> : <Square className="text-white/40" size={24} />}
            <span className={`${item.done ? 'line-through text-white/30' : 'text-white/90'} text-lg font-medium`}>{item.text}</span>
          </button>
        ))}
      </div>
      {warmup.every(w => w.done) && (
        <button onClick={() => setCurrentState('working-sets')} className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold text-lg py-5 rounded-3xl shadow-[0_0_40px_rgba(59,130,246,0.3)] mt-6 transition-all">
          Begin Workout
        </button>
      )}
    </div>
  );

  const renderWorkingSets = () => {
    if (!currentExercise) return null;
    const isBodyweight = currentExercise.progressionType === 'bodyweight';

    let bestPerformance: ExerciseSet[] = [];
    let maxHistoricalWeight = 0;

    if (pastWorkouts) {
      pastWorkouts.forEach(log => {
        const exLog = log.exercises.find(e => e.exerciseId === currentExercise.id);
        if (exLog && exLog.sets.length > 0) {
          const sessionMaxWeight = Math.max(...exLog.sets.map(s => s.weight));
          if (sessionMaxWeight > maxHistoricalWeight) {
            maxHistoricalWeight = sessionMaxWeight;
            bestPerformance = exLog.sets;
          } else if (sessionMaxWeight === maxHistoricalWeight) {
            const currentBestVolume = bestPerformance.reduce((sum, s) => sum + s.reps, 0);
            const thisSessionVolume = exLog.sets.reduce((sum, s) => sum + s.reps, 0);
            if (thisSessionVolume > currentBestVolume) {
              bestPerformance = exLog.sets;
            }
          }
        }
      });
    }

    const shouldOverload = bestPerformance.length >= currentExercise.plannedSets &&
      bestPerformance.every(set => set.weight === maxHistoricalWeight && set.reps >= currentExercise.maxReps);

    const plateBreakdown = getPlateBreakdown(Number(weight) || 0);

    return (
      <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 pt-10">
        
        {/* BIG PILLS ARE BACK */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-4 mb-2 mt-2 snap-x">
          {exercises.map((ex, idx) => {
            const isDone = workoutLog.some(log => log.exerciseId === ex.id);
            const isActive = idx === currentExerciseIndex;
            return (
              <button
                key={ex.id}
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
                  setCurrentExerciseIndex(idx);
                  setCurrentExerciseSets([]);
                }}
                className={`snap-center shrink-0 px-4 py-2.5 rounded-[1.25rem] text-left transition-all border ${
                  isActive ? 'bg-blue-500 border-blue-400 shadow-lg' : isDone ? 'bg-white/5 border-white/5 opacity-50' : 'bg-white/10 border-white/10 hover:bg-white/20'
                }`}
              >
                <div className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${isActive ? 'text-blue-200' : 'text-white/40'}`}>
                  {ex.muscleGroup}
                </div>
                <div className={`text-xs font-bold flex items-center gap-1.5 ${isActive ? 'text-white' : 'text-white/70'}`}>
                  {isDone && <Check size={12} />}
                  {ex.name}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mb-6">
          <p className="text-blue-400 font-bold text-xs tracking-widest uppercase mb-2">Exercise {currentExerciseIndex + 1} of {exercises.length}</p>
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold text-white tracking-tight leading-tight">{currentExercise.name}</h2>
            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{currentExercise.equipment} • {currentExercise.progressionType}</span>
          </div>
          
          {/* MID-WORKOUT ALTERATION BUTTONS */}
          <div className="flex items-center gap-2 mt-4 mb-2">
            <button onClick={() => { setPickerMode('swap'); setShowExercisePicker(true); }} className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all">
              <ArrowRightLeft size={14}/> Swap Machine
            </button>
            <button onClick={() => { setPickerMode('add'); setShowExercisePicker(true); }} className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all">
              <Plus size={14}/> Add to Routine
            </button>
          </div>

          <div className="flex items-center justify-between mt-3">
            <p className="text-white/50 font-medium text-sm">
              Target: <span className="text-white font-bold">{currentExercise.plannedSets} sets</span> × {currentExercise.minReps}–{currentExercise.maxReps} reps
            </p>
            <button onClick={() => setShowMuscleMap(!showMuscleMap)} className="flex items-center gap-1.5 text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1.5 rounded-lg border border-purple-500/20 transition-all">
              {showMuscleMap ? <EyeOff size={14}/> : <Eye size={14}/>} {showMuscleMap ? 'Hide Anatomy' : 'Target Muscles'}
            </button>
          </div>

          {showMuscleMap && (
            <div className="mt-4 bg-black/40 border border-white/5 rounded-3xl p-4 flex justify-center animate-in zoom-in-95">
              <MuscleMap muscleGroup={currentExercise.muscleGroup} exerciseId={currentExercise.id} />
            </div>
          )}

          {currentExercise.notes && (
            <div className="mt-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3.5 flex items-start gap-3">
              <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
              <p className="text-blue-200/90 text-xs font-medium leading-relaxed">{currentExercise.notes}</p>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-6">
          {bestPerformance.length > 0 && (
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-blue-400" />
                  <h4 className="text-xs font-bold text-white/70 uppercase tracking-widest">All-Time Best</h4>
                </div>
                {shouldOverload && (
                  <span className="flex items-center gap-1.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider border border-amber-500/30 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <Zap size={12} /> Up the weight
                  </span>
                )}
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {bestPerformance.map((set, idx) => (
                  <div key={idx} className={`shrink-0 rounded-2xl px-5 py-3 border ${shouldOverload ? 'bg-amber-500/10 border-amber-500/20' : 'bg-black/20 border-white/5'}`}>
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Set {idx + 1}</div>
                    <div className={`font-bold text-lg ${shouldOverload ? 'text-amber-400' : 'text-white'}`}>
                      {set.weight > 0 ? `${set.weight}kg × ` : ''}{set.reps}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentExerciseSets.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3 ml-2">Today</h4>
              {currentExerciseSets.map((set, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white/5 rounded-2xl px-5 py-3 group relative overflow-hidden">
                  <div>
                    <span className="text-white/50 text-sm font-medium mr-4">Set {idx + 1}</span>
                    <span className="text-white font-bold">{set.weight > 0 ? `${set.weight}kg × ` : ''}{set.reps} reps</span>
                  </div>
                  <button 
                    onClick={() => handleRemoveLoggedSet(idx)} 
                    className="p-2 text-red-400/50 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold text-lg">Log Set {currentSet} of {currentExercise.plannedSets}</h3>
              <div className="flex items-center gap-2">
                {!isBodyweight && Number(weight) > 20 && (
                  <button onClick={() => setShowPlateModal(true)} className="text-xs bg-purple-500/20 border border-purple-500/30 text-purple-300 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                    <Calculator size={12} /> Plates
                  </button>
                )}
                {isBodyweight && (
                  <button onClick={() => setIsWeighted(!isWeighted)} className={`text-xs px-3 py-1 rounded-full font-bold transition-all border ${isWeighted ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/10 text-white/40'}`}>
                    {isWeighted ? 'Weighted' : '+ Weight'}
                  </button>
                )}
              </div>
            </div>

            <div className={`grid ${(!isBodyweight || isWeighted) ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
              {(!isBodyweight || isWeighted) && (
                <div className="bg-black/20 rounded-2xl p-4 border border-white/5 focus-within:border-blue-500/50 transition-colors">
                  <label className="block text-[10px] text-white/50 font-bold mb-1 uppercase tracking-wider">{isBodyweight ? 'Added Weight (kg)' : 'Weight (kg)'}</label>
                  <input 
                    type="text" 
                    inputMode="decimal"
                    value={weight} 
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setWeight(e.target.value)} 
                    className="w-full bg-transparent text-3xl font-bold text-white outline-none placeholder:text-white/25" 
                    placeholder="0" 
                  />
                </div>
              )}
              <div className="bg-black/20 rounded-2xl p-4 border border-white/5 focus-within:border-blue-500/50 transition-colors">
                <label className="block text-[10px] text-white/50 font-bold mb-1 uppercase tracking-wider">Reps</label>
                <input 
                  type="text" 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={reps} 
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setReps(e.target.value)} 
                  className="w-full bg-transparent text-3xl font-bold text-white outline-none placeholder:text-white/25" 
                  placeholder="0" 
                />
              </div>
            </div>
          </div>
        </div>

        <button disabled={!reps} onClick={handleLogSet} className="w-full mt-6 bg-blue-500 hover:bg-blue-400 disabled:bg-white/10 disabled:text-white/30 text-white font-bold text-lg py-5 rounded-3xl flex items-center justify-center gap-2 transition-all shadow-[0_0_40px_rgba(59,130,246,0.2)]">
          <Check size={24} /> Complete Set {currentSet}
        </button>

        {showExercisePicker && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl p-6 flex flex-col pb-safe">
            <div className="flex justify-between items-center mb-6 mt-4">
              <h3 className="text-xl font-bold text-white">
                {pickerMode === 'swap' ? 'Swap Machine' : 'Add Machine'}
              </h3>
              <button onClick={() => setShowExercisePicker(false)} className="p-3 bg-white/10 rounded-full"><X size={20} className="text-white" /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 hide-scrollbar pb-36">
              {allExercises?.map(ex => {
                const isAdded = exercises.some(e => e.id === ex.id);
                return (
                  <button 
                    key={ex.id}
                    disabled={isAdded && pickerMode === 'add'} 
                    onClick={() => handleSelectNewExercise(ex.id)}
                    className={`w-full flex justify-between items-center p-3 rounded-2xl border transition-all ${
                      isAdded && pickerMode === 'add' ? 'bg-white/5 border-white/5 opacity-50' : 'bg-white/10 border-white/10 hover:bg-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="bg-black/40 rounded-xl p-1 border border-white/5">
                        <MuscleMap muscleGroup={ex.muscleGroup} exerciseId={ex.id} />
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg">{ex.name}</p>
                        <p className="text-blue-400/80 font-medium text-xs tracking-widest uppercase">{ex.muscleGroup}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {showPlateModal && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl p-6 flex flex-col justify-center items-center animate-in fade-in">
            <div className="bg-white/10 border border-white/10 rounded-3xl p-6 w-full max-w-sm relative">
              <button onClick={() => setShowPlateModal(false)} className="absolute top-5 right-5 text-white/50 hover:text-white"><X size={20} /></button>
              <h3 className="text-xl font-bold text-white mb-1">Plate Breakdown</h3>
              <p className="text-white/50 text-xs mb-6">Per side (Assuming 20kg bar/sled)</p>
              <div className="space-y-2 mb-6">
                {plateBreakdown.map((item, i) => (
                  <div key={i} className="flex justify-between items-center bg-black/30 px-4 py-3 rounded-2xl border border-white/5">
                    <span className="text-white font-bold text-lg">{item.plate} kg plate</span>
                    <span className="text-blue-400 font-bold text-lg">× {item.count}</span>
                  </div>
                ))}
                {plateBreakdown.length === 0 && <p className="text-white/40 text-center py-4 text-sm">Weight too low for extra plates.</p>}
              </div>
              <button onClick={() => setShowPlateModal(false)} className="w-full bg-blue-500 text-white font-bold py-3.5 rounded-2xl">Got it</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderExerciseComplete = () => (
    <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in-95 text-center px-6 pt-10">
      <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/30 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
        <Check className="text-green-400" size={48} />
      </div>
      <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Machine Complete</h2>
      <p className="text-white/60 mb-10 text-lg">Great job on the {exercises[currentExerciseIndex]?.name}!</p>
      
      <button 
        onClick={advanceFromCompletion} 
        className="w-full max-w-xs bg-blue-500 hover:bg-blue-400 text-white font-bold text-lg py-4 rounded-3xl transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)]"
      >
        Continue Workout
      </button>
    </div>
  );

  const renderCooldown = () => (
    <div className="flex-1 flex flex-col animate-in fade-in pt-10">
      <h2 className="text-3xl font-bold text-white mb-2 mt-4 tracking-tight">Cool-down</h2>
      <p className="text-white/60 mb-8">Great job. Let's stretch the trained muscles.</p>
      <div className="space-y-4 flex-1">
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-5 rounded-3xl flex justify-between items-center shadow-lg">
          <div>
            <p className="text-white font-bold text-lg">Doorway Chest Stretch</p>
            <p className="text-white/50 font-medium mt-1">30 sec / side</p>
          </div>
        </div>
      </div>
      <button onClick={handleFinishWorkout} className="w-full bg-green-500 hover:bg-green-400 text-white font-bold text-lg py-5 rounded-3xl flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(34,197,94,0.3)] transition-all">
        Finish Workout <ArrowRight size={20} />
      </button>
    </div>
  );

  const renderSummary = () => (
    <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95">
      <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/30">
        <Check className="text-green-400" size={48} />
      </div>
      <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">{selectedDayKey} Complete</h2>
      <p className="text-white/60 mb-10 text-lg">Session saved successfully.</p>
      <button onClick={() => setCurrentState('select-day')} className="bg-white/10 backdrop-blur-xl border border-white/10 hover:bg-white/20 text-white font-bold text-lg px-10 py-4 rounded-3xl transition-all">
        Done
      </button>
    </div>
  );

  if (!allExercises) return <div className="p-6 text-white/50">Loading workout plans...</div>;

  const dynamicRestSeconds = currentExercise?.restSeconds || 90;

  return (
    <div className="p-6 min-h-full flex flex-col overflow-x-hidden">
      {renderGlobalTimer()}
      {currentState === 'select-day' && renderDaySelection()}
      {currentState === 'general-warmup' && renderGeneralWarmup()}
      {currentState === 'working-sets' && renderWorkingSets()}
      {currentState === 'exercise-complete' && renderExerciseComplete()}
      {currentState === 'rest' && (
        <div className="flex-1 flex flex-col pt-10">
          <RestTimer 
            initialSeconds={dynamicRestSeconds} 
            onSkip={() => setCurrentState('working-sets')}
            onComplete={() => setCurrentState('working-sets')}
          />
        </div>
      )}
      {currentState === 'cooldown' && renderCooldown()}
      {currentState === 'summary' && renderSummary()}
    </div>
  );
}