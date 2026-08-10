import Dexie, { type Table } from 'dexie';

export interface ExerciseSet {
  weight: number;
  reps: number;
}

export interface CompletedExercise {
  exerciseId: string;
  name: string;
  sets: ExerciseSet[];
}

export interface CompletedWorkout {
  id?: number;
  date: string;
  templateName: string;
  durationMs: number;
  exercises: CompletedExercise[];
}

export interface BodyweightLog {
  id?: number;
  date: string; 
  weight: number;
}

// NEW: Dynamic Habit Definitions
export interface HabitDefinition {
  id: string;
  label: string;
}

// UPDATED: Now stores an array of completed habit IDs instead of hardcoded booleans
export interface DailyHabitsLog {
  date: string; 
  completedIds: string[];
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  progressionType: 'machine' | 'bodyweight';
  defaultSets: number;
  minReps: number;
  maxReps: number;
}

export interface RoutineTemplate {
  dayKey: string; 
  exerciseIds: string[];
}

export class GymDatabase extends Dexie {
  workoutLogs!: Table<CompletedWorkout, number>;
  bodyweightLogs!: Table<BodyweightLog, number>;
  dailyHabits!: Table<DailyHabitsLog, string>;
  exercises!: Table<ExerciseDefinition, string>;
  routineTemplates!: Table<RoutineTemplate, string>;
  habitDefinitions!: Table<HabitDefinition, string>; // New Table

  constructor() {
    super('GymLogDatabase');
    // Bumped to version 4 for the new habits table
    this.version(4).stores({
      workoutLogs: '++id, date, templateName',
      bodyweightLogs: '++id, date',
      dailyHabits: 'date',
      exercises: 'id',
      routineTemplates: 'dayKey',
      habitDefinitions: 'id'
    });
  }
}

export const db = new GymDatabase();