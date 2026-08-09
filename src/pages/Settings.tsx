import { useState } from 'react';
import { Download, Upload, Server } from 'lucide-react';
import { db } from '../db/db';

export default function Settings() {
  const [status, setStatus] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
      const workoutLogs = await db.workoutLogs.toArray();
      const bodyweightLogs = await db.bodyweightLogs.toArray();
      
      const data = { workoutLogs, bodyweightLogs };
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gymlog-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setStatus('Export successful!');
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      console.error(err);
      setStatus('Export failed.');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = event.target?.result as string;
        const data = JSON.parse(json);
        
        if (data.workoutLogs && Array.isArray(data.workoutLogs)) {
          // Clear current tables before importing to prevent duplicates
          await db.workoutLogs.clear();
          await db.workoutLogs.bulkAdd(data.workoutLogs);
        }
        
        if (data.bodyweightLogs && Array.isArray(data.bodyweightLogs)) {
          await db.bodyweightLogs.clear();
          await db.bodyweightLogs.bulkAdd(data.bodyweightLogs);
        }

        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 100, 100]);
        setStatus('Import successful! Data synced.');
        setTimeout(() => setStatus(null), 3000);
      } catch (err) {
        console.error(err);
        setStatus('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 pb-24 h-full flex flex-col animate-in fade-in">
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-white/60 mt-1">Manage your data and preferences.</p>
      </header>

      <div className="space-y-6">
        <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-black/20 p-3 rounded-xl border border-white/5">
              <Server size={20} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Database Sync</h2>
              <p className="text-white/50 text-xs">Export data from computer to phone.</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={handleExport}
              className="w-full bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Download size={18} /> Export Backup File
            </button>
            
            <div className="relative w-full">
              <input 
                type="file" 
                accept=".json"
                onChange={handleImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] pointer-events-none">
                <Upload size={18} /> Import Backup File
              </button>
            </div>
          </div>

          {status && (
            <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10 text-center text-sm font-medium text-white/80 animate-in fade-in zoom-in-95">
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}