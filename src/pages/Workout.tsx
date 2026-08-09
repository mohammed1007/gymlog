import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { CheckSquare, Square, Check, ArrowRight, RotateCcw, Target } from 'lucide-react';
import RestTimer from '../components/RestTimer';
import { db, type ExerciseSet, type CompletedExercise, type ExerciseDefinition } from '../db/db';

type WorkoutState = 'select-day' | 'general-warmup' | 'working-sets' | 'rest' | 'cooldown' | 'summary';

const WORKOUT_PLANS: Record<string, string[]> = {
  'Day A': [
    'machine-chest-press', 'pull-ups', 'chest-supported-row-machine', 'linear-hack-press',
    'mts-leg-extension', 'mts-kneeling-leg-curl', 'lateral-raise-machine', 'machine-preacher-curl',
    'triceps-press-machine', 'hanging-leg-raises'
  ],
  'Day B': [
    'incline-chest-press-machine', 'lat-pulldown-machine', 'seated-row-machine', 'leg-press-machine',
    'leg-extension-machine', 'mts-kneeling-leg-curl', 'hip-abduction', 'shoulder-press-machine',
    'reverse-pec-deck', 'machine-preacher-curl', 'triceps-press-machine'
  ],
  'Day C': [
    'machine-chest-press', 'dips', 'pull-ups', 'chest-supported-row-machine', 'linear-hack-press',
    'leg-extension-machine', 'mts-kneeling-leg-curl', 'hip-abduction', 'calf-raise-machine',
    'lateral-raise-machine', 'reverse-pec-deck', 'hanging-leg-raises'
  ]
};

export default function Workout() {
  const [currentState, setCurrentState] = useState<WorkoutState>('select-day');
  const [selectedDayKey, setSelectedDayKey] = useState<string>('Day A');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  
  const [completedDays, setCompletedDays] = useState<string[]>(() => {
    const saved = localStorage.getItem('gym_completed_days');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('gym_completed_days', JSON.stringify(completedDays));
  }, [completedDays]);
  
  const [reps, setReps] = useState<string>('');
  const [weight, setWeight] = useState<string>(''); 
  
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [currentExerciseSets, setCurrentExerciseSets] = useState<ExerciseSet[]>([]);
  const [workoutLog, setWorkoutLog] = useState<CompletedExercise[]>([]);
  
  const allExercises = useLiveQuery(() => db.exercises.toArray());
  const pastWorkouts = useLiveQuery(() => db.workoutLogs.orderBy('date').reverse().toArray());

  const exercises: ExerciseDefinition[] = allExercises 
    ? WORKOUT_PLANS[selectedDayKey]
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
    // Fire a subtle 50ms physical taptic pulse
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
      setWorkoutLog(prev => [...prev, {
        exerciseId: currentExercise.id,
        name: currentExercise.name,
        sets: updatedSets
      }]);
      
      setCurrentExerciseSets([]);
      
      if (currentExerciseIndex < exercises.length - 1) {
        setCurrentExerciseIndex(prev => prev + 1);
        setCurrentSet(1);
        setCurrentState('working-sets');
      } else {
        setCurrentState('cooldown');
      }
    }
  };

  const handleFinishWorkout = async () => {
    const durationMs = Date.now() - startTime;
    await db.workoutLogs.add({
      date: new Date().toISOString(),
      templateName: `${selectedDayKey} — Full Body`,
      durationMs,
      exercises: workoutLog
    });
    
    if (!completedDays.includes(selectedDayKey)) {
      const updated = [...completedDays, selectedDayKey];
      setCompletedDays(updated.length >= 3 ? [] : updated);
    }
    setCurrentState('summary');
  };

  const renderDaySelection = () => {
    const days = [
      { key: 'Day A', desc: 'Chest Press, Pull-Ups, Hack Squat' },
      { key: 'Day B', desc: 'Incline Press, Lat Pulldown, Leg Press' },
      { key: 'Day C', desc: 'Chest Press, Dips, Pull-Ups' },
    ];

    return (
      <div className="flex-1 flex flex-col animate-in fade-in">
        <div className="flex justify-between items-end mb-8 mt-4">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Routines</h2>
            <p className="text-white/60 text-sm mt-1">3-Day Bulk Protocol</p>
          </div>
          {completedDays.length > 0 && (
            <button 
              onClick={() => setCompletedDays([])}
              className="text-xs text-white/50 hover:text-white flex items-center gap-1 bg-white/10 backdrop-blur-xl border border-white/10 px-3 py-2 rounded-full transition-all"
            >
              <RotateCcw size={14} /> Reset ({completedDays.length}/3)
            </button>
          )}
        </div>

        <div className="space-y-4 flex-1">
          {days.map(day => {
            const isCompleted = completedDays.includes(day.key);
            return (
              <button
                key={day.key}
                onClick={() => startDay(day.key)}
                className={`w-full text-left p-6 rounded-[2rem] border transition-all flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.12)] ${
                  isCompleted 
                    ? 'bg-white/[0.02] border-white/5 opacity-50' 
                    : 'bg-white/[0.08] backdrop-blur-xl border-white/10 hover:bg-white/[0.12]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-blue-400 font-bold text-sm tracking-widest uppercase">{day.key}</span>
                    {isCompleted && (
                      <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Completed
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">Full Body</h3>
                  <p className="text-white/50 text-sm mt-1">{day.desc}</p>
                </div>
                <ArrowRight className="text-white/30" size={24} />
              </button>
            );
          })}
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
    const isBodyweight = currentExercise?.progressionType === 'bodyweight';

    let previousPerformance: ExerciseSet[] = [];
    if (pastWorkouts && currentExercise) {
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
        {/* Header */}
        <div className="mb-6 mt-4">
          <p className="text-blue-400 font-bold text-xs tracking-widest uppercase mb-2">
            Exercise {currentExerciseIndex + 1} of {exercises.length}
          </p>
          <h2 className="text-3xl font-bold text-white tracking-tight leading-tight">
            {currentExercise?.name}
          </h2>
          <p className="text-white/50 font-medium mt-2">
            Target: {currentExercise?.defaultSets} sets × {currentExercise?.minReps}–{currentExercise?.maxReps} reps
          </p>
        </div>

        <div className="flex-1 space-y-6">
          {/* THE TARGET PANEL: Shows all previous sets clearly */}
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
                      {isBodyweight ? '' : `${set.weight}kg × `}{set.reps}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Session Progress */}
          {currentExerciseSets.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3 ml-2">Today</h4>
              {currentExerciseSets.map((set, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white/5 rounded-2xl px-5 py-3">
                  <span className="text-white/50 text-sm font-medium">Set {idx + 1}</span>
                  <span className="text-white font-bold">{isBodyweight ? '' : `${set.weight}kg × `}{set.reps} reps</span>
                </div>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="bg-white/[0.08] backdrop-blur-xl border border-white/10 rounded-3xl p-5">
            <h3 className="text-white font-bold text-lg mb-4">Log Set {currentSet}</h3>
            <div className={`grid ${isBodyweight ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
              {!isBodyweight && (
                <div className="bg-black/20 rounded-2xl p-4 border border-white/5 focus-within:border-blue-500/50 transition-colors">
                  <label className="block text-[10px] text-white/50 font-bold mb-1 uppercase tracking-wider">Weight (kg)</label>
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
    <div className="p-6 pb-24 h-full flex flex-col">
      {currentState === 'select-day' && renderDaySelection()}
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