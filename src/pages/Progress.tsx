import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { TrendingUp, Activity, Dumbbell, Flame, Scale, Plus, ArrowUpRight, ArrowDownRight, CheckSquare, Square, PieChart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { db } from '../db/db';

export default function Progress() {
  const pastWorkouts = useLiveQuery(() => db.workoutLogs.toArray());
  const bodyweightHistory = useLiveQuery(() => db.bodyweightLogs.orderBy('date').reverse().toArray());
  
  const todayKey = new Date().toISOString().split('T')[0];
  const todayHabits = useLiveQuery(() => db.dailyHabits.get(todayKey), [todayKey]);

  const [weightInput, setWeightInput] = useState('');

  if (!pastWorkouts || !bodyweightHistory) {
    return <div className="p-6 text-white/50">Loading metrics...</div>;
  }

  // --- STAT CALCULATIONS ---
  const totalSessions = pastWorkouts.length;
  
  let totalVolume = 0;
  pastWorkouts.forEach(log => {
    log.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        const weightToUse = set.weight > 0 ? set.weight : 1; 
        totalVolume += (set.reps * weightToUse);
      });
    });
  });

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

  const handleLogWeight = async () => {
    if (!weightInput) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
    
    await db.bodyweightLogs.add({
      date: new Date().toISOString(),
      weight: Number(weightInput)
    });
    setWeightInput('');
  };

  const toggleHabit = async (field: 'creatine' | 'surplusMeals') => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
    const current = todayHabits || { date: todayKey, creatine: false, surplusMeals: false };
    const updated = { ...current, [field]: !current[field] };
    await db.dailyHabits.put(updated);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const chartData = [...bodyweightHistory].reverse().map(log => ({
    date: formatDate(log.date),
    weight: log.weight
  }));

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
    <div className="p-6 pb-24 h-full flex flex-col animate-in fade-in">
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">Progress</h1>
        <p className="text-white/60 mt-1">Mass, volume, and daily protocols.</p>
      </header>

      {/* Top Level Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={16} className="text-blue-400" />
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest">Sessions</h3>
          </div>
          <p className="text-4xl font-bold text-white tabular-nums">{totalSessions}</p>
        </div>

        <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={16} className="text-orange-400" />
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest">Volume</h3>
          </div>
          <p className="text-4xl font-bold text-white tabular-nums">
            {totalVolume > 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : totalVolume}
          </p>
        </div>
      </div>

      {/* Daily Mass-Building Checklist */}
      <h2 className="text-xl font-bold text-white mb-4 tracking-tight flex items-center gap-2">
        <Flame className="text-amber-400" size={20}/> Daily Surplus Checklist
      </h2>
      <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-lg mb-8 space-y-3">
        <button 
          onClick={() => toggleHabit('creatine')}
          className="flex items-center gap-4 w-full text-left p-3 rounded-2xl bg-black/20 border border-white/5 transition-all"
        >
          {todayHabits?.creatine ? <CheckSquare className="text-blue-400" size={22} /> : <Square className="text-white/30" size={22} />}
          <span className={`text-sm font-medium ${todayHabits?.creatine ? 'text-white line-through opacity-50' : 'text-white'}`}>
            Creatine Monohydrate (5g)
          </span>
        </button>

        <button 
          onClick={() => toggleHabit('surplusMeals')}
          className="flex items-center gap-4 w-full text-left p-3 rounded-2xl bg-black/20 border border-white/5 transition-all"
        >
          {todayHabits?.surplusMeals ? <CheckSquare className="text-blue-400" size={22} /> : <Square className="text-white/30" size={22} />}
          <span className={`text-sm font-medium ${todayHabits?.surplusMeals ? 'text-white line-through opacity-50' : 'text-white'}`}>
            High-Calorie Whole Foods (Oats, Eggs, Areesh)
          </span>
        </button>
      </div>

      {/* Bodyweight Tracker & Graph */}
      <h2 className="text-xl font-bold text-white mb-4 tracking-tight flex items-center gap-2">
        <Scale className="text-purple-400" size={20}/> Mass Tracker
      </h2>
      <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-lg mb-8 flex flex-col gap-6">
        <div className="flex gap-3">
          <div className="flex-1 bg-black/20 rounded-2xl p-3 border border-white/5 focus-within:border-purple-500/50 transition-colors">
            <label className="block text-[10px] text-white/50 font-bold mb-1 uppercase tracking-wider">Morning Weight (kg)</label>
            <input 
              type="number" 
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              className="w-full bg-transparent text-2xl font-bold text-white outline-none placeholder:text-white/20"
              placeholder="0.0"
            />
          </div>
          <button 
            disabled={!weightInput}
            onClick={handleLogWeight}
            className="bg-purple-500 hover:bg-purple-400 disabled:bg-white/10 disabled:text-white/30 text-white font-bold px-6 rounded-2xl flex items-center justify-center transition-all active:scale-95"
          >
            <Plus size={24} />
          </button>
        </div>

        {chartData.length > 0 ? (
          <div className="h-48 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={10} tickMargin={10} minTickGap={20}/>
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="weight" stroke="#a855f7" strokeWidth={3} dot={{ r: 4, fill: '#a855f7' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center border border-dashed border-white/10 rounded-2xl">
            <p className="text-white/30 text-sm">Log your weight to see the trend.</p>
          </div>
        )}
      </div>

      {/* Lifetime PRs */}
      <h2 className="text-xl font-bold text-white mb-4 tracking-tight flex items-center gap-2">
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
              <span className="text-xl font-bold text-white tabular-nums">
                {lift.max > 0 ? lift.max : '--'}
              </span>
              <span className="text-white/50 text-xs ml-1">kg</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}