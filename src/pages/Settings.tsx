import { useRef } from 'react';
import { Download, Upload, Trash2, Moon } from 'lucide-react';
import { db } from '../db/db';

export default function Settings() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      // Pull all data from the local database
      const logs = await db.workoutLogs.toArray();
      const exercises = await db.exercises.toArray();
      const bodyweightLogs = await db.bodyweightLogs.toArray();
      
      const backupData = { logs, exercises, bodyweightLogs };
      
      // Create a downloadable JSON file
      const blob = new Blob([JSON.stringify(backupData)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gymlog-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data.");
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Restore data to IndexedDB
        if (data.logs) await db.workoutLogs.bulkPut(data.logs);
        if (data.exercises) await db.exercises.bulkPut(data.exercises);
        if (data.bodyweightLogs) await db.bodyweightLogs.bulkPut(data.bodyweightLogs);
        
        alert('Data successfully imported!');
      } catch (err) {
        console.error("Import failed:", err);
        alert('Failed to parse backup file. Please ensure it is a valid GymLog JSON backup.');
      }
      
      // Reset the input so the same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleDeleteAll = async () => {
    const confirmed = window.confirm(
      'Are you absolutely sure you want to delete all workout history? Make sure you have exported a backup first!'
    );
    
    if (confirmed) {
      await db.workoutLogs.clear();
      alert('All workout history has been wiped.');
    }
  };

  return (
    <div className="p-6 pb-24 h-full flex flex-col">
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-zinc-400 mt-1">Manage your app and data.</p>
      </header>

      <div className="space-y-6">
        {/* Appearance Section */}
        <section>
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Appearance</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Moon size={20} className="text-zinc-400" />
                <span className="text-white font-medium">Dark Mode</span>
              </div>
              <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md">
                DEFAULT
              </span>
            </div>
          </div>
        </section>

        {/* Data Management Section */}
        <section>
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Data & Backup</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            
            <button 
              onClick={handleExport}
              className="w-full flex items-center justify-between p-4 border-b border-zinc-800 active:bg-zinc-800 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Download size={20} className="text-blue-500" />
                <span className="text-white font-medium">Export Backup (JSON)</span>
              </div>
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between p-4 border-b border-zinc-800 active:bg-zinc-800 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Upload size={20} className="text-green-500" />
                <span className="text-white font-medium">Import Backup</span>
              </div>
              {/* Hidden file input triggered by the button */}
              <input 
                type="file" 
                accept=".json" 
                ref={fileInputRef} 
                onChange={handleImport} 
                className="hidden" 
              />
            </button>

            <button 
              onClick={handleDeleteAll}
              className="w-full flex items-center justify-between p-4 active:bg-zinc-800 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Trash2 size={20} className="text-red-500" />
                <span className="text-red-500 font-medium">Delete All Data</span>
              </div>
            </button>
            
          </div>
        </section>
      </div>
    </div>
  );
}