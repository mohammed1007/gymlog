import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { TrendingUp, Activity, Dumbbell, Flame, Scale, Plus, CheckSquare, Square, Target, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { db } from '../db/db';

export default function Progress() {
  const pastWorkouts = useLiveQuery(() => db.workoutLogs.toArray());
  const bodyweightHistory = useLiveQuery(() => db.bodyweightLogs.orderBy('date').reverse().toArray());
  const allExercises = useLiveQuery(() => db.exercises.toArray());
  
  const todayKey = new Date().toISOString().split('T')[0];
  const allHabits = useLiveQuery(() => db.habitDefinitions.toArray());
  const todayHabitsLog = useLiveQuery(() => db.dailyHabits.get(todayKey), [todayKey]);

  const [weightInput, setWeightInput] = useState('');

  if (!pastWorkouts || !bodyweightHistory || !allExercises) {
    return <div className="p-6 text-white/50">Loading metrics...</div>;
  }

  const totalSessions = pastWorkouts.length;
  let totalVolume = 0;
  
  const muscleBalance: Record<string, number> = {
    Chest: 0, Back: 0, Legs: 0, Shoulders: 0, Arms: 0, Core: 0
  };

  pastWorkouts.forEach(log => {
    log.exercises.forEach(exLog => {
      exLog.sets.forEach(set => {
        const weightToUse = set.weight > 0 ? set.weight : 1; 
        totalVolume += (set.reps * weightToUse);
      });

      const exerciseDef = allExercises.find(e => e.id === exLog.exerciseId);
      if (exerciseDef && muscleBalance[exerciseDef.muscleGroup] !== undefined) {
        muscleBalance[exerciseDef.muscleGroup] += exLog.sets.length;
      }
    });
  });

  const radarData = Object.keys(muscleBalance).map(key => ({
    muscle: key,
    sets: muscleBalance[key]
  }));

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

  // --- THEORETICAL 1RM (Brzycki Formula) ---
  const calculateEstimated1RM = (weight: number, reps: number) => {
    if (weight <= 0 || reps <= 0) return 0;
    if (reps >= 37) return weight;
    return Math.round(weight * (36 / (37 - reps)));
  };

  const getEstimatedMax1RM = (exerciseId: string) => {
    let highest1RM = 0;
    pastWorkouts.forEach(log => {
      const exercise = log.exercises.find(ex => ex.exerciseId === exerciseId);
      if (exercise) {
        exercise.sets.forEach(set => {
          const est = calculateEstimated1RM(set.weight, set.reps);
          if (est > highest1RM) highest1RM = est;
        });
      }
    });
    return highest1RM;
  };

  const keyLifts = [
    { name: 'Machine Chest Press', max: getMaxWeight('machine-chest-press'), est1RM: getEstimatedMax1RM('machine-chest-press') },
    { name: 'Linear Hack Press', max: getMaxWeight('linear-hack-press'), est1RM: getEstimatedMax1RM('linear-hack-press') },
    { name: 'Lat Pulldown', max: getMaxWeight('lat-pulldown-machine'), est1RM: getEstimatedMax1RM('lat-pulldown-machine') },
  ];

  const handleLogWeight = async () => {
    if (!weightInput) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
    await db.bodyweightLogs.add({ date: new Date().toISOString(), weight: Number(weightInput) });
    setWeightInput('');
  };

  const toggleHabit = async (habitId: string) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
    const currentLog = todayHabitsLog || { date: todayKey, completedIds: [] };
    
    let updatedIds;
    if (currentLog.completedIds.includes(habitId)) {
      updatedIds = currentLog.completedIds.filter(id => id !== habitId);
    } else {
      updatedIds = [...currentLog.completedIds, habitId];
    }
    
    await db.dailyHabits.put({ ...currentLog, completedIds: updatedIds });
  };

  const formatDate = (isoString: string) => new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const chartData = [...bodyweightHistory].reverse().map(log => ({ date: formatDate(log.date), weight: log.weight }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1c1c1e]/80 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-xl">
          <p className="text-white/50 text-xs mb-1 font-medium">{label}</p>
          <p className="text-white font-bold text-lg tabular-nums">{payload[0].value} kg</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 min-h-full flex flex-col animate-in fade-in">
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">Progress</h1>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-3xl p-5">
          <div className="flex items-center gap-2 mb-3"><Activity size={16} className="text-blue-400" /><h3 className="text-xs font-bold text-white/50 uppercase">Sessions</h3></div>
          <p className="text-4xl font-bold text-white">{totalSessions}</p>
        </div>
        <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-3xl p-5">
          <div className="flex items-center gap-2 mb-3"><Flame size={16} className="text-orange-400" /><h3 className="text-xs font-bold text-white/50 uppercase">Volume</h3></div>
          <p className="text-4xl font-bold text-white">{totalVolume > 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : totalVolume}</p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Target className="text-blue-400" size={20}/> Training Balance</h2>
      <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-3xl p-5 mb-8 flex flex-col gap-2">
        <p className="text-white/50 text-xs mb-2">Total working sets per muscle group.</p>
        {totalSessions > 0 ? (
          <div className="h-56 w-full -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="muscle" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 2']} tick={false} axisLine={false} />
                <Radar name="Sets" dataKey="sets" stroke="#60a5fa" strokeWidth={2} fill="#60a5fa" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center border border-dashed border-white/10 rounded-2xl">
            <p className="text-white/30 text-sm">Complete a workout to see balance.</p>
          </div>
        )}
      </div>

      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Flame className="text-amber-400" size={20}/> Daily Protocol</h2>
      <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-3xl p-5 mb-8 space-y-3">
        {allHabits?.map(habit => {
          const isDone = todayHabitsLog?.completedIds.includes(habit.id);
          return (
            <button key={habit.id} onClick={() => toggleHabit(habit.id)} className="flex items-center gap-4 w-full text-left p-3 rounded-2xl bg-black/20 border border-white/5">
              {isDone ? <CheckSquare className="text-blue-400" size={22} /> : <Square className="text-white/30" size={22} />}
              <span className={`text-sm font-medium ${isDone ? 'text-white line-through opacity-50' : 'text-white'}`}>{habit.label}</span>
            </button>
          );
        })}
        {allHabits?.length === 0 && <p className="text-white/30 text-xs">Add items in Settings.</p>}
      </div>

      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Scale className="text-purple-400" size={20}/> Mass Tracker</h2>
      <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-3xl p-5 mb-8 flex flex-col gap-6">
        <div className="flex gap-3">
          <div className="flex-1 bg-black/20 rounded-2xl p-3 border border-white/5">
            <label className="block text-[10px] text-white/50 font-bold mb-1 uppercase">Morning Weight (kg)</label>
            <input type="number" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} className="w-full bg-transparent text-2xl font-bold text-white outline-none" placeholder="0.0" />
          </div>
          <button disabled={!weightInput} onClick={handleLogWeight} className="bg-purple-500 disabled:bg-white/10 text-white font-bold px-6 rounded-2xl flex items-center justify-center"><Plus size={24} /></button>
        </div>
        {chartData.length > 0 && (
          <div className="h-48 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={10} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="weight" stroke="#a855f7" strokeWidth={3} dot={{ r: 4, fill: '#a855f7' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><TrendingUp className="text-green-400" size={20}/> All-Time Max Lifts & Estimated 1RM</h2>
      <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-3xl p-5 space-y-5">
        {keyLifts.map((lift, i) => (
          <div key={i} className="flex justify-between items-center group border-b border-white/5 pb-4 last:border-0 last:pb-0">
            <div className="flex items-center gap-3">
              <div className="bg-black/20 p-2 rounded-xl border border-white/5"><Dumbbell size={16} className="text-white/50" /></div>
              <div>
                <span className="text-white font-medium block">{lift.name}</span>
                <span className="text-white/40 text-xs flex items-center gap-1 mt-0.5">
                  <Award size={12} className="text-amber-400" /> Est. 1RM: <strong className="text-white/70">{lift.est1RM > 0 ? `${lift.est1RM} kg` : '--'}</strong>
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-white tabular-nums">{lift.max > 0 ? lift.max : '--'}</span>
              <span className="text-white/50 text-xs ml-1">kg max</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}