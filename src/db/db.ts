import Dexie, { type Table } from 'dexie';

// --- TYPESCRIPT INTERFACES ---

export interface ExerciseSet {
  weight: number;      // For bodyweight, this can be 0 or represent added/assisted weight
  reps: number;
  rir?: number;        // Reps in Reserve (optional)
  isWarmup?: boolean; 
}

export interface CompletedExercise {
  exerciseId: string;  
  name: string;        // Storing name so history remains intact if exercise library changes
  sets: ExerciseSet[];
  notes?: string;
}

export interface WorkoutLog {
  id?: number;         // Auto-incremented by Dexie
  date: string;        // ISO string (e.g., "2026-08-09T17:24:53")
  templateName: string; // e.g., "Day A — Full Body"
  durationMs: number;  // Total workout time in milliseconds
  exercises: CompletedExercise[];
  notes?: string;
}

export interface ExerciseDefinition {
  id: string;          // e.g., "machine-chest-press"
  name: string;
  muscleGroup: string;
  equipment: string;
  defaultSets: number;
  minReps: number;
  maxReps: number;
  progressionType: 'weight' | 'bodyweight' | 'assisted';
}

export interface BodyweightLog {
  id?: number;
  date: string;
  weight: number;
}

// --- DATABASE INITIALIZATION ---

export class GymDatabase extends Dexie {
  workoutLogs!: Table<WorkoutLog, number>;
  exercises!: Table<ExerciseDefinition, string>;
  bodyweightLogs!: Table<BodyweightLog, number>;

  constructor() {
    super('GymLogDB');
    
    // Define the tables and their indexed properties
    this.version(1).stores({
      workoutLogs: '++id, date, templateName',
      exercises: 'id, muscleGroup, progressionType',
      bodyweightLogs: '++id, date'
    });

    // Bump to version 2 to cleanly seed the full routine exercises into existing or new environments
    this.version(2).stores({
      workoutLogs: '++id, date, templateName',
      exercises: 'id, muscleGroup, progressionType',
      bodyweightLogs: '++id, date'
    }).upgrade(async tx => {
      // Clear or sync if upgrading from v1
      await tx.table('exercises').clear();
      await populateExercises(tx.table('exercises'));
    });

    // Populate hook for brand-new database instances
    this.on('populate', async () => {
      await populateExercises(this.exercises);
    });
  }
}

async function populateExercises(exercisesTable: Table<ExerciseDefinition, string>) {
  await exercisesTable.bulkAdd([
    // --- DAY A ---
    { id: 'machine-chest-press', name: 'Machine Chest Press', muscleGroup: 'Chest', equipment: 'Machine', defaultSets: 3, minReps: 6, maxReps: 10, progressionType: 'weight' },
    { id: 'pull-ups', name: 'Pull-Ups', muscleGroup: 'Back', equipment: 'Bodyweight', defaultSets: 3, minReps: 6, maxReps: 10, progressionType: 'bodyweight' },
    { id: 'chest-supported-row-machine', name: 'Chest-Supported Row Machine', muscleGroup: 'Back', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'weight' },
    { id: 'linear-hack-press', name: 'Linear Hack Press', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 6, maxReps: 10, progressionType: 'weight' },
    { id: 'mts-leg-extension', name: 'MTS Leg Extension', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 10, maxReps: 15, progressionType: 'weight' },
    { id: 'mts-kneeling-leg-curl', name: 'MTS Kneeling Leg Curl', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 10, maxReps: 15, progressionType: 'weight' },
    { id: 'lateral-raise-machine', name: 'Lateral Raise Machine', muscleGroup: 'Shoulders', equipment: 'Machine', defaultSets: 3, minReps: 12, maxReps: 20, progressionType: 'weight' },
    { id: 'machine-preacher-curl', name: 'Machine Preacher Curl', muscleGroup: 'Arms', equipment: 'Machine', defaultSets: 2, minReps: 8, maxReps: 12, progressionType: 'weight' },
    { id: 'triceps-press-machine', name: 'Triceps Press Machine', muscleGroup: 'Arms', equipment: 'Machine', defaultSets: 2, minReps: 10, maxReps: 15, progressionType: 'weight' },
    { id: 'hanging-leg-raises', name: 'Hanging Leg Raises', muscleGroup: 'Core', equipment: 'Bodyweight', defaultSets: 3, minReps: 10, maxReps: 15, progressionType: 'bodyweight' },

    // --- DAY B ADDITIONS ---
    { id: 'incline-chest-press-machine', name: 'Incline Chest Press Machine', muscleGroup: 'Chest', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'weight' },
    { id: 'lat-pulldown-machine', name: 'Lat Pulldown Machine', muscleGroup: 'Back', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'weight' },
    { id: 'seated-row-machine', name: 'Seated Row Machine', muscleGroup: 'Back', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'weight' },
    { id: 'leg-press-machine', name: 'Leg Press Machine', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'weight' },
    { id: 'leg-extension-machine', name: 'Leg Extension Machine', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 10, maxReps: 15, progressionType: 'weight' },
    { id: 'hip-abduction', name: 'Hip Abduction', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 2, minReps: 12, maxReps: 20, progressionType: 'weight' },
    { id: 'shoulder-press-machine', name: 'Shoulder Press Machine', muscleGroup: 'Shoulders', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'weight' },
    { id: 'reverse-pec-deck', name: 'Reverse Pec Deck', muscleGroup: 'Shoulders', equipment: 'Machine', defaultSets: 2, minReps: 12, maxReps: 20, progressionType: 'weight' },

    // --- DAY C ADDITIONS ---
    { id: 'dips', name: 'Dips', muscleGroup: 'Chest', equipment: 'Bodyweight', defaultSets: 2, minReps: 8, maxReps: 12, progressionType: 'bodyweight' },
    { id: 'calf-raise-machine', name: 'Calf Raise Machine', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 10, maxReps: 15, progressionType: 'weight' }
  ]);
}

// Export a single instance of the database to use throughout the app
export const db = new GymDatabase();