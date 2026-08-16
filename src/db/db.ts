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

export interface WorkoutLog {
  id?: number;
  date: string;
  templateName: string;
  durationMs: number;
  exercises: CompletedExercise[];
}

export interface RoutineTemplate {
  dayKey: string;
  exercises: { exerciseId: string; sets: number }[];
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  defaultSets: number;
  minReps: number;
  maxReps: number;
  progressionType: 'machine' | 'bodyweight' | 'dumbbell' | 'barbell';
  restSeconds: number;
  notes?: string;
}

export interface BodyweightLog {
  id?: number;
  date: string;
  weight: number;
}

export interface HabitDefinition {
  id: string;
  label: string;
}

export interface DailyHabitLog {
  date: string;
  completedIds: string[];
}

// NEW: Schema for tracking frictionless calories
export interface NutritionLog {
  id?: number;
  date: string;
  timestamp: number;
  name: string;
  calories: number;
  protein: number;
}

export class GymDatabase extends Dexie {
  workoutLogs!: Table<WorkoutLog, number>;
  routineTemplates!: Table<RoutineTemplate, string>;
  exercises!: Table<ExerciseDefinition, string>;
  bodyweightLogs!: Table<BodyweightLog, number>;
  habitDefinitions!: Table<HabitDefinition, string>;
  dailyHabits!: Table<DailyHabitLog, string>;
  nutritionLogs!: Table<NutritionLog, number>;

  constructor() {
    super('GymLogDatabase');
    // Bumped to version 5 to safely inject the new nutritionLogs table
    this.version(5).stores({
      workoutLogs: '++id, date',
      routineTemplates: 'dayKey',
      exercises: 'id, muscleGroup',
      bodyweightLogs: '++id, date',
      habitDefinitions: 'id',
      dailyHabits: 'date',
      nutritionLogs: '++id, date, timestamp'
    });
  }
}

export const db = new GymDatabase();