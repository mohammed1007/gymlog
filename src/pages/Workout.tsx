import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { CheckSquare, Square, Check, ArrowRight, RotateCcw, Target, Shuffle } from 'lucide-react';
import RestTimer from '../components/RestTimer';
import { db, type ExerciseSet, type CompletedExercise, type ExerciseDefinition } from '../db/db';

type WorkoutState = 'select-day' | 'general-warmup' | 'working-sets' | 'rest' | 'cooldown' | 'summary';

export default function Workout() {
  const [currentState, setCurrentState] = useState<WorkoutState>('select-day');
  const [selectedDayKey, setSelectedDayKey] = useState<string>('Day A');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isWeighted, setIsWeighted] = useState(false);
  
  const [completedDays, setCompletedDays] = useState<string[]>(() => {
    const saved = localStorage.getItem('gym_completed_days');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('gym_completed_days', JSON.stringify(completedDays));
  }, [completedDays]);

  useEffect(() => {
    setIsWeighted(false);
  }, [currentExerciseIndex]);
  
  const [reps, setReps] = useState<string>('');
  const [weight, setWeight] = useState<string>(''); 
  
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [currentExerciseSets, setCurrentExerciseSets] = useState<ExerciseSet[]>([]);
  const [workoutLog, setWorkoutLog] = useState<CompletedExercise[]>([]);
  
  // Dexie Queries
  const allExercises = useLiveQuery(() => db.exercises.toArray());
  const storedTemplates = useLiveQuery(() => db.routineTemplates.toArray());
  const pastWorkouts = useLiveQuery(() => db.workoutLogs.orderBy('date').reverse().toArray());

  // Dynamically resolve exercises for selected day
  const activeTemplate = storedTemplates?.find(t => t.dayKey === selectedDayKey);
  const exercises: ExerciseDefinition[] = (allExercises && activeTemplate)
    ? activeTemplate.exerciseIds
        .map(id => allExercises.find(e => e.id === id))
        .filter((e): e is ExerciseDefinition => e !== undefined)
    : [];

  const [warmup, setWarmup] = useState([
    { id: 1, text: '5 min cardio (Treadmill/Bike)', done: false },
    { id: 2, text: 'Arm circles — 10 fwd + 10 bwd', done: false },
    { id: 3, text: 'Band pull-aparts — 15 reps', done: false },
    { id: 4, text: 'Shoulder rotations — 10/side', done: false },
  ]);

  const toggleWarmup = (id: number) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
    setWarmup(warmup.map(w => w.id === id ? { ...w, done: !w.done } : w));
  };

  const startDay = (dayKey: string) => {
    setSelectedDayKey(dayKey);
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
    setCurrentExerciseSets([]);
    setWorkoutLog([]);
    setStartTime(Date.now());
    setWarmup(warmup.map(w => ({ ...w, done: false })));
    setCurrentState('general-warmup');
  };

  const handleLogSet = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
    const currentExercise = exercises[currentExerciseIndex];
    if (!currentExercise) return;

    const newSet: ExerciseSet = {
      weight: Number(weight) || 0,
      reps: Number(reps) || 0
    };
    
    const updatedSets = [...currentExerciseSets, newSet];
    setCurrentExerciseSets(updatedSets);
    setReps('');

    if (currentSet < (currentExercise.defaultSets || 3)) {
      setCurrentState('rest');
    } else {
      const updatedLog = [...workoutLog, {
        exerciseId: currentExercise.id,
        name: currentExercise.name,
        sets: updatedSets
      }];
      setWorkoutLog(updatedLog);
      setCurrentExerciseSets([]);
      setCurrentSet(1);
      
      const nextIncompleteIndex = exercises.findIndex(
        ex => !updatedLog.some(log => log.exerciseId === ex.id)
      );

      if (nextIncompleteIndex !== -1) {
        setCurrentExerciseIndex(nextIncompleteIndex);
        setCurrentState('working-sets');
      } else {
        setCurrentState('cooldown');
      }
    }
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
      // Reset if all templates have been completed
      setCompletedDays(updated.length >= (storedTemplates?.length || 3) ? [] : updated);
    }
    setCurrentState('summary');
  };

  const renderDaySelection = () => {
    if (!storedTemplates) return <div className="p-6 text-white/50">Loading routines...</div>;

    return (
      <div className="flex-1 flex flex-col animate-in fade-in">
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
            const templateExerciseNames = allExercises 
              ? template.exerciseIds.map(id => allExercises.find(e => e.id === id)?.name).filter(Boolean).join(', ')
              : 'Loading exercises...';

            return (
              <div 
                key={template.dayKey}
                className={`w-full p-6 rounded-[2rem] border transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] ${
                  isCompleted 
                    ? 'bg-white/[0.02] border-white/5 opacity-50' 
                    : 'bg-white/[0.08] backdrop-blur-xl border-white/10'
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
                  disabled={template.exerciseIds.length === 0}
                  onClick={() => startDay(template.dayKey)}
                  className="w-full mt-5 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all"
                >
                  Start Workout <ArrowRight size={18} />
                </button>
              </div>
            );
          })}

          {storedTemplates.length === 0 && (
            <div className="p-6 text-center text-white/50 bg-white/5 border border-dashed border-white/10 rounded-3xl">
              No routines found. Go to Settings to create one.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderGeneralWarmup = () => (
    <div className="flex-1 flex flex-col animate-in fade-in">
      <div className="flex items-center justify-between mb-8 mt-4">
        <button onClick={() => setCurrentState('select-day')} className="text-sm text-blue-400 font-medium">
          ← Back
        </button>
        <span className="text-xs font-bold uppercase tracking-widest text-white/50">{selectedDayKey}</span>
      </div>
      <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">Warm-up</h2>
      <div className="space-y-3 flex-1">
        {warmup.map(item => (
          <button 
            key={item.id}
            onClick={() => toggleWarmup(item.id)}
            className={`flex items-center gap-4 w-full text-left p-5 rounded-3xl border transition-all duration-300 ${
              item.done 
                ? 'bg-white/5 border-white/5' 
                : 'bg-white/10 backdrop-blur-xl border-white/10 shadow-lg'
            }`}
          >
            {item.done ? <CheckSquare className="text-blue-400" size={24} /> : <Square className="text-white/40" size={24} />}
            <span className={`${item.done ? 'line-through text-white/30' : 'text-white/90'} text-lg font-medium`}>
              {item.text}
            </span>
          </button>
        ))}
      </div>
      {warmup.every(w => w.done) && (
        <button 
          onClick={() => setCurrentState('working-sets')}
          className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold text-lg py-5 rounded-[2rem] shadow-[0_0_40px_rgba(59,130,246,0.3)] mt-6 animate-in slide-in-from-bottom-4 transition-all"
        >
          Begin Workout
        </button>
      )}
    </div>
  );

  const renderWorkingSets = () => {
    const currentExercise = exercises[currentExerciseIndex];
    if (!currentExercise) return null;
    const isBodyweight = currentExercise.progressionType === 'bodyweight';

    let previousPerformance: ExerciseSet[] = [];
    if (pastWorkouts) {
      const lastWorkoutWithExercise = pastWorkouts.find(log => 
        log.exercises.some(ex => ex.exerciseId === currentExercise.id)
      );
      if (lastWorkoutWithExercise) {
        previousPerformance = lastWorkoutWithExercise.exercises.find(
          ex => ex.exerciseId === currentExercise.id
        )?.sets || [];
      }
    }

    return (
      <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4">
        
        {/* Dynamic Exercise Navigator */}
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
                  setCurrentSet(1);
                  setCurrentExerciseSets([]);
                }}
                className={`snap-center shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                  isActive 
                    ? 'bg-blue-500 border-blue-400 text-white shadow-lg' 
                    : isDone 
                      ? 'bg-white/5 border-white/5 text-white/30'
                      : 'bg-white/10 border-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {isDone && <Check size={12} />}
                  {ex.name}
                </div>
              </button>
            );
          })}
        </div>

        {/* Header */}
        <div className="mb-6">
          <p className="text-blue-400 font-bold text-xs tracking-widest uppercase mb-2">
            Exercise {currentExerciseIndex + 1} of {exercises.length}
          </p>
          <h2 className="text-3xl font-bold text-white tracking-tight leading-tight">
            {currentExercise.name}
          </h2>
          <p className="text-white/50 font-medium mt-2 flex items-center justify-between">
            <span>Target: {currentExercise.defaultSets} sets × {currentExercise.minReps}–{currentExercise.maxReps} reps</span>
            <button className="flex items-center gap-1 text-white/40 hover:text-white/80 bg-white/5 px-2 py-1 rounded-lg text-xs">
              <Shuffle size={12} /> Swap
            </button>
          </p>
        </div>

        <div className="flex-1 space-y-6">
          {/* Target Panel */}
          {previousPerformance.length > 0 && (
            <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Target size={16} className="text-blue-400" />
                <h4 className="text-xs font-bold text-white/70 uppercase tracking-widest">Target to Beat</h4>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {previousPerformance.map((set, idx) => (
                  <div key={idx} className="flex-shrink-0 bg-black/20 rounded-2xl px-5 py-3 border border-white/5">
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Set {idx + 1}</div>
                    <div className="text-white font-bold text-lg">
                      {set.weight > 0 ? `${set.weight}kg × ` : ''}{set.reps}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Today's Sets */}
          {currentExerciseSets.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3 ml-2">Today</h4>
              {currentExerciseSets.map((set, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white/5 rounded-2xl px-5 py-3">
                  <span className="text-white/50 text-sm font-medium">Set {idx + 1}</span>
                  <span className="text-white font-bold">{set.weight > 0 ? `${set.weight}kg × ` : ''}{set.reps} reps</span>
                </div>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="bg-white/[0.08] backdrop-blur-xl border border-white/10 rounded-3xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold text-lg">Log Set {currentSet}</h3>
              {isBodyweight && (
                <button 
                  onClick={() => setIsWeighted(!isWeighted)}
                  className={`text-xs px-3 py-1 rounded-full font-bold transition-all border ${
                    isWeighted ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/10 text-white/40'
                  }`}
                >
                  {isWeighted ? 'Weighted Calisthenics' : '+ Add Weight'}
                </button>
              )}
            </div>

            <div className={`grid ${(!isBodyweight || isWeighted) ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
              {(!isBodyweight || isWeighted) && (
                <div className="bg-black/20 rounded-2xl p-4 border border-white/5 focus-within:border-blue-500/50 transition-colors">
                  <label className="block text-[10px] text-white/50 font-bold mb-1 uppercase tracking-wider">
                    {isBodyweight ? 'Added Weight (kg)' : 'Weight (kg)'}
                  </label>
                  <input 
                    type="number" 
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-transparent text-3xl font-bold text-white outline-none placeholder:text-white/20"
                    placeholder="0"
                  />
                </div>
              )}
              
              <div className="bg-black/20 rounded-2xl p-4 border border-white/5 focus-within:border-blue-500/50 transition-colors">
                <label className="block text-[10px] text-white/50 font-bold mb-1 uppercase tracking-wider">Reps</label>
                <input 
                  type="number" 
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  className="w-full bg-transparent text-3xl font-bold text-white outline-none placeholder:text-white/20"
                  placeholder="0"
                  autoFocus
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button 
          disabled={!reps}
          onClick={handleLogSet}
          className="w-full mt-6 bg-blue-500 hover:bg-blue-400 disabled:bg-white/10 disabled:text-white/30 text-white font-bold text-lg py-5 rounded-[2rem] flex items-center justify-center gap-2 transition-all shadow-[0_0_40px_rgba(59,130,246,0.2)] disabled:shadow-none"
        >
          <Check size={24} /> Complete Set {currentSet}
        </button>
      </div>
    );
  };

  const renderCooldown = () => (
    <div className="flex-1 flex flex-col animate-in fade-in">
      <h2 className="text-3xl font-bold text-white mb-2 mt-4 tracking-tight">Cool-down</h2>
      <p className="text-white/60 mb-8">Great job. Let's stretch the trained muscles.</p>
      
      <div className="space-y-4 flex-1">
        <div className="bg-white/[0.08] backdrop-blur-xl border border-white/10 p-5 rounded-3xl flex justify-between items-center shadow-lg">
          <div>
            <p className="text-white font-bold text-lg">Doorway Chest Stretch</p>
            <p className="text-white/50 font-medium mt-1">30 sec / side</p>
          </div>
        </div>
      </div>

      <button 
        onClick={handleFinishWorkout}
        className="w-full bg-green-500 hover:bg-green-400 text-white font-bold text-lg py-5 rounded-[2rem] flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(34,197,94,0.3)] transition-all"
      >
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
      <button 
        onClick={() => setCurrentState('select-day')}
        className="bg-white/[0.1] backdrop-blur-xl border border-white/10 hover:bg-white/[0.15] text-white font-bold text-lg px-10 py-4 rounded-[2rem] transition-all"
      >
        Done
      </button>
    </div>
  );

  if (!allExercises) return <div className="p-6 text-white/50">Loading workout plans...</div>;

  return (
<div className="p-6 min-h-full flex flex-col overflow-x-hidden">      {currentState === 'select-day' && renderDaySelection()}
      {currentState === 'general-warmup' && renderGeneralWarmup()}
      {currentState === 'working-sets' && renderWorkingSets()}
      {currentState === 'rest' && (
        <RestTimer 
          initialSeconds={120} 
          onSkip={() => {
            setCurrentSet(prev => prev + 1);
            setCurrentState('working-sets');
          }}
          onComplete={() => {
            setCurrentSet(prev => prev + 1);
            setCurrentState('working-sets');
          }}
        />
      )}
      {currentState === 'cooldown' && renderCooldown()}
      {currentState === 'summary' && renderSummary()}
    </div>
  );
}