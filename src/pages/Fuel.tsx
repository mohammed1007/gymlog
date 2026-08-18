import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Trash2, Zap, Droplet, Cookie, Minus, Calculator, Beaker, X } from 'lucide-react';
import { db } from '../db/db';

const FOOD_GROUPS = [
  {
    title: "🔥 Power Combos",
    description: "The cheat codes. Drink these when you can't chew.",
    icon: <Zap size={18} className="text-amber-400" />,
    items: [
      { name: 'Zabado Mass Shake', cal: 700, pro: 30, icon: '🥤' },
      { name: 'Classic Bulker Shake', cal: 750, pro: 25, icon: '🌪️' },
      { name: 'Greek Power Bowl', cal: 500, pro: 18, icon: '🥣' },
      { name: 'PB Sandwich', cal: 400, pro: 15, icon: '🥪' },
      { name: 'Milk & Banana', cal: 300, pro: 10, icon: '🍌' },
    ]
  },
  {
    title: "🥜 Frictionless Snacks",
    description: "Keep these on your desk while coding.",
    icon: <Cookie size={18} className="text-amber-700" />,
    items: [
      { name: 'Mixed Nuts (50g)', cal: 300, pro: 9, icon: '🥜' },
      { name: 'Peanuts (50g)', cal: 290, pro: 12, icon: '🥜' },
      { name: 'Dark Chocolate (30g)', cal: 170, pro: 3, icon: '🍫' },
      { name: 'Raisins (50g)', cal: 150, pro: 2, icon: '🍇' },
      { name: 'Dates (6 dates)', cal: 120, pro: 2, icon: '🌴' },
    ]
  },
  {
    title: "🥛 Add-Ons & Boosters",
    description: "Throw these into meals to sneak in calories.",
    icon: <Droplet size={18} className="text-blue-400" />,
    items: [
      { name: 'Avocado (1 medium)', cal: 250, pro: 4, icon: '🥑' },
      { name: 'Peanut Butter (2 tbsp)', cal: 190, pro: 8, icon: '🥜' },
      { name: 'Tahini (2 tbsp)', cal: 180, pro: 5, icon: '🍯' },
      { name: 'Cheese (50g)', cal: 175, pro: 11, icon: '🧀' },
      { name: 'Olive Oil (1 tbsp)', cal: 120, pro: 0, icon: '🫒' },
    ]
  }
];

// STAPLES FOR CUSTOM MIX BUILDER
const STAPLES = [
  { id: 'milk', name: 'Whole Milk (250ml)', cal: 150, pro: 8, icon: '🥛' },
  { id: 'oats', name: 'Oats (50g)', cal: 190, pro: 6, icon: '🌾' },
  { id: 'pb', name: 'Peanut Butter (1 tbsp)', cal: 95, pro: 4, icon: '🥜' },
  { id: 'banana', name: 'Banana (1 medium)', cal: 105, pro: 1, icon: '🍌' },
  { id: 'zabado', name: 'Zabado (Bottle)', cal: 150, pro: 12, icon: '🥤' },
  { id: 'honey', name: 'Honey (1 tbsp)', cal: 65, pro: 0, icon: '🍯' },
  { id: 'greek', name: 'Greek Yogurt (170g)', cal: 150, pro: 15, icon: '🥣' },
  { id: 'eggs', name: 'Eggs (2 boiled)', cal: 150, pro: 12, icon: '🥚' },
];

export default function Fuel() {
  const todayDate = new Date();
  const todayKey = todayDate.toISOString().split('T')[0];
  
  const [showMixer, setShowMixer] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  
  // Custom Mix State
  const [mixCounts, setMixCounts] = useState<Record<string, number>>({});
  
  // Quick Add State
  const [quickCal, setQuickCal] = useState('');
  const [quickPro, setQuickPro] = useState('');

  // 1. Fetch historical logs for the 7-day chart
  const last7DaysStart = new Date(todayDate);
  last7DaysStart.setDate(last7DaysStart.getDate() - 6);
  const startDateStr = last7DaysStart.toISOString().split('T')[0];

  const recentLogs = useLiveQuery(
    () => db.nutritionLogs.where('date').aboveOrEqual(startDateStr).toArray(),
    [startDateStr]
  );

  // 2. Process data for today's ring
  const todaysLogs = recentLogs?.filter(log => log.date === todayKey) || [];
  const totalCal = todaysLogs.reduce((acc, log) => acc + log.calories, 0);
  const totalPro = todaysLogs.reduce((acc, log) => acc + log.protein, 0);
  const targetCal = 800; 
  const progress = Math.min((totalCal / targetCal) * 100, 100);

  // 3. Process data for 7-day streak chart
  const weeklyData = useMemo(() => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(d.getDate() - i);
      const dKey = d.toISOString().split('T')[0];
      const logsForDay = recentLogs?.filter(log => log.date === dKey) || [];
      const cals = logsForDay.reduce((acc, log) => acc + log.calories, 0);
      days.push({
        label: dayNames[d.getDay()],
        cals: cals,
        hitTarget: cals >= targetCal
      });
    }
    return days;
  }, [recentLogs, todayDate, targetCal]);

  // Handlers
  const handleAddFood = async (name: string, cal: number, pro: number) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(40);
    await db.nutritionLogs.add({ date: todayKey, timestamp: Date.now(), name, calories: cal, protein: pro });
  };

  const handleDeleteLog = async (id?: number) => {
    if (!id) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
    await db.nutritionLogs.delete(id);
  };

  // Custom Mix Logic
  const handleAdjustMix = (id: string, delta: number) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
    setMixCounts(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const currentMixCal = STAPLES.reduce((acc, item) => acc + (item.cal * (mixCounts[item.id] || 0)), 0);
  const currentMixPro = STAPLES.reduce((acc, item) => acc + (item.pro * (mixCounts[item.id] || 0)), 0);

  const handleLogMix = async () => {
    if (currentMixCal === 0) return;
    await handleAddFood('Custom Mix', currentMixCal, currentMixPro);
    setShowMixer(false);
    setMixCounts({});
  };

  // Quick Add Logic
  const handleLogQuickAdd = async () => {
    const c = parseInt(quickCal);
    const p = parseInt(quickPro) || 0;
    if (isNaN(c) || c <= 0) return;
    await handleAddFood('Quick Add', c, p);
    setShowQuickAdd(false);
    setQuickCal('');
    setQuickPro('');
  };

  return (
    <div className="p-6 min-h-full flex flex-col animate-in fade-in pb-32">
      <header className="mb-6 mt-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">Fuel</h1>
        <p className="text-white/60 text-sm mt-1">Track the surplus. Ignore the rest.</p>
      </header>

      {/* Progress Ring & 7-Day Streak */}
      <div className="bg-white/6 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <div className="flex flex-col items-center">
          <div className="relative w-40 h-40 flex items-center justify-center mb-4">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
              <circle 
                cx="50" cy="50" r="44" 
                stroke="#f59e0b" strokeWidth="8" fill="none" 
                strokeDasharray="276.46" 
                strokeDashoffset={276.46 - (276.46 * progress) / 100} 
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="text-center z-10 flex flex-col items-center mt-1">
              <span className="text-4xl font-bold text-white tabular-nums tracking-tighter">{totalCal}</span>
              <span className="text-amber-400 text-[9px] font-bold tracking-widest uppercase mt-0.5">/ {targetCal} kcal Surge</span>
            </div>
          </div>
          <div className="bg-black/30 border border-white/5 rounded-2xl px-5 py-2.5 flex items-center gap-2 mb-6">
            <span className="text-white/50 text-xs font-bold uppercase tracking-widest">Protein Logged:</span>
            <span className="text-blue-400 font-bold">{totalPro}g</span>
          </div>
        </div>

        {/* Mini 7-Day Streak Chart */}
        <div className="border-t border-white/10 pt-5">
          <div className="flex justify-between items-end h-20 gap-1.5 px-2">
            {weeklyData.map((day, idx) => {
              const heightPct = Math.min((day.cals / targetCal) * 100, 100);
              return (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-full bg-white/5 rounded-md h-full relative flex items-end overflow-hidden">
                    {/* Target Line indicator */}
                    <div className="absolute top-[20%] left-0 right-0 h-px bg-white/10 border-t border-dashed border-white/20 z-0"></div>
                    <div 
                      className={`w-full rounded-md z-10 transition-all duration-700 ${day.hitTarget ? 'bg-amber-400' : 'bg-white/20'}`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className={`text-[9px] font-bold ${idx === 6 ? 'text-white' : 'text-white/40'}`}>{day.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <button onClick={() => setShowMixer(true)} className="bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-400 font-bold p-4 rounded-2xl flex items-center justify-center gap-2 transition-all">
          <Beaker size={18} /> Build a Mix
        </button>
        <button onClick={() => setShowQuickAdd(true)} className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold p-4 rounded-2xl flex items-center justify-center gap-2 transition-all">
          <Calculator size={18} className="text-white/50" /> Quick Add
        </button>
      </div>

      {/* Today's Log (Undo List) */}
      {todaysLogs && todaysLogs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3 ml-2">Today's Entries</h2>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {todaysLogs.map(log => (
              <div key={log.id} className="shrink-0 bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-4">
                <div>
                  <p className="text-white font-bold text-sm">{log.name}</p>
                  <p className="text-white/40 text-xs">{log.calories} kcal • {log.protein}g pro</p>
                </div>
                <button onClick={() => handleDeleteLog(log.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vending Machine Grids */}
      <div className="space-y-8">
        {FOOD_GROUPS.map((group, gIdx) => (
          <div key={gIdx}>
            <div className="flex items-center gap-2 mb-1 ml-1">
              {group.icon}
              <h2 className="text-xl font-bold text-white">{group.title}</h2>
            </div>
            <p className="text-white/40 text-xs mb-4 ml-1">{group.description}</p>
            
            <div className="grid grid-cols-2 gap-3">
              {group.items.map((item, iIdx) => (
                <button 
                  key={iIdx}
                  onClick={() => handleAddFood(item.name, item.cal, item.pro)}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.02] transition-all rounded-2xl p-4 text-left flex flex-col relative overflow-hidden group"
                >
                  <span className="text-3xl mb-2 block">{item.icon}</span>
                  <span className="text-white font-bold text-sm leading-tight mb-1 pr-6">{item.name}</span>
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <span className="text-amber-400">{item.cal} kcal</span>
                    <span className="text-blue-400">{item.pro}g pro</span>
                  </div>
                  <div className="absolute right-3 top-3 p-1.5 bg-white/5 rounded-full group-hover:bg-amber-500 group-hover:text-white text-white/30 transition-colors">
                    <Plus size={14} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: CUSTOM MIX BUILDER */}
      {showMixer && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-end animate-in fade-in slide-in-from-bottom-10">
          <div className="bg-[#1c1c1e] w-full rounded-t-[2.5rem] p-6 pb-safe border-t border-white/10 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2"><Beaker size={24} className="text-blue-400" /> Build a Mix</h3>
              <button onClick={() => setShowMixer(false)} className="p-2 bg-white/10 rounded-full text-white/50 hover:text-white"><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 hide-scrollbar pb-6">
              {STAPLES.map(item => {
                const count = mixCounts[item.id] || 0;
                return (
                  <div key={item.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${count > 0 ? 'bg-blue-500/10 border-blue-500/30' : 'bg-black/40 border-white/5'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="text-white font-bold text-sm">{item.name}</p>
                        <p className="text-white/40 text-xs">{item.cal} kcal • {item.pro}g pro</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-black/40 rounded-xl border border-white/5 p-1">
                      <button onClick={() => handleAdjustMix(item.id, -1)} className="p-2 text-white/50 hover:text-white"><Minus size={16} /></button>
                      <span className="text-white font-bold w-4 text-center">{count}</span>
                      <button onClick={() => handleAdjustMix(item.id, 1)} className="p-2 text-white/50 hover:text-white"><Plus size={16} /></button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-5 border-t border-white/10 mt-2">
              <div className="flex justify-between items-end mb-4 px-2">
                <div>
                  <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Total Mix</p>
                  <p className="text-3xl font-bold text-amber-400">{currentMixCal} <span className="text-lg text-white/40">kcal</span></p>
                </div>
                <div className="text-right">
                  <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Protein</p>
                  <p className="text-xl font-bold text-blue-400">{currentMixPro}g</p>
                </div>
              </div>
              <button 
                disabled={currentMixCal === 0}
                onClick={handleLogMix} 
                className="w-full bg-blue-500 disabled:bg-white/10 disabled:text-white/30 text-white font-bold py-5 rounded-2xl transition-all flex justify-center items-center gap-2"
              >
                <Zap size={20} /> Log Custom Mix
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: QUICK ADD */}
      {showQuickAdd && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-center items-center animate-in fade-in p-6">
          <div className="bg-[#1c1c1e] border border-white/10 rounded-[2.5rem] p-6 w-full max-w-sm relative shadow-2xl">
            <button onClick={() => setShowQuickAdd(false)} className="absolute top-6 right-6 text-white/50 hover:text-white"><X size={20} /></button>
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2"><Calculator size={24} className="text-amber-400" /> Quick Add</h3>
            <p className="text-white/50 text-sm mb-6">Enter raw macros for a random meal.</p>
            
            <div className="space-y-4 mb-8">
              <div className="bg-black/40 rounded-2xl p-4 border border-white/5 focus-within:border-amber-500/50 transition-colors">
                <label className="block text-[10px] text-amber-400/80 font-bold mb-1 uppercase tracking-wider">Total Calories</label>
                <input 
                  type="text" 
                  inputMode="numeric"
                  value={quickCal} 
                  onChange={(e) => setQuickCal(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-transparent text-4xl font-bold text-white outline-none placeholder:text-white/20" 
                  placeholder="0" 
                  autoFocus
                />
              </div>
              <div className="bg-black/40 rounded-2xl p-4 border border-white/5 focus-within:border-blue-500/50 transition-colors">
                <label className="block text-[10px] text-blue-400/80 font-bold mb-1 uppercase tracking-wider">Protein (g) — Optional</label>
                <input 
                  type="text" 
                  inputMode="numeric"
                  value={quickPro} 
                  onChange={(e) => setQuickPro(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-transparent text-3xl font-bold text-white outline-none placeholder:text-white/20" 
                  placeholder="0" 
                />
              </div>
            </div>

            <button 
              disabled={!quickCal}
              onClick={handleLogQuickAdd} 
              className="w-full bg-amber-500 disabled:bg-white/10 disabled:text-white/30 text-white font-bold py-4 rounded-2xl transition-all"
            >
              Add Fuel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}