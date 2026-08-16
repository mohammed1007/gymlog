import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Trash2, Zap, Droplet, Cookie } from 'lucide-react';
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
      { name: 'Oats (50g)', cal: 190, pro: 6, icon: '🌾' },
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
      { name: 'Zabado (Bottle)', cal: 150, pro: 12, icon: '🥛' },
      { name: 'Whole Milk (250ml)', cal: 150, pro: 8, icon: '🥛' },
      { name: 'Eggs (2 boiled)', cal: 150, pro: 12, icon: '🥚' },
      { name: 'Olive Oil (1 tbsp)', cal: 120, pro: 0, icon: '🫒' },
    ]
  }
];

export default function Fuel() {
  const todayKey = new Date().toISOString().split('T')[0];
  
  const todaysLogs = useLiveQuery(
    () => db.nutritionLogs.where('date').equals(todayKey).toArray(),
    [todayKey]
  );

  const totalCal = todaysLogs?.reduce((acc, log) => acc + log.calories, 0) || 0;
  const totalPro = todaysLogs?.reduce((acc, log) => acc + log.protein, 0) || 0;
  
  // Your daily surplus target
  const targetCal = 800; 
  const progress = Math.min((totalCal / targetCal) * 100, 100);

  const handleAddFood = async (name: string, cal: number, pro: number) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(40);
    await db.nutritionLogs.add({
      date: todayKey,
      timestamp: Date.now(),
      name,
      calories: cal,
      protein: pro
    });
  };

  const handleDeleteLog = async (id?: number) => {
    if (!id) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
    await db.nutritionLogs.delete(id);
  };

  return (
    <div className="p-6 min-h-full flex flex-col animate-in fade-in pb-32">
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">Fuel</h1>
        <p className="text-white/60 text-sm mt-1">Track the surplus. Ignore the rest.</p>
      </header>

      {/* Progress Ring */}
      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 mb-8 flex flex-col items-center shadow-lg">
        <div className="relative w-48 h-48 flex items-center justify-center mb-4">
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
          <div className="text-center z-10 flex flex-col items-center">
            <span className="text-5xl font-bold text-white tabular-nums tracking-tighter">{totalCal}</span>
            <span className="text-amber-400 text-[10px] font-bold tracking-widest uppercase mt-1">/ {targetCal} kcal Surge</span>
          </div>
        </div>
        <div className="bg-black/30 border border-white/5 rounded-2xl px-5 py-2.5 flex items-center gap-2">
          <span className="text-white/50 text-xs font-bold uppercase tracking-widest">Protein Logged:</span>
          <span className="text-blue-400 font-bold">{totalPro}g</span>
        </div>
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
                  <span className="text-white font-bold text-sm leading-tight mb-1">{item.name}</span>
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
    </div>
  );
}