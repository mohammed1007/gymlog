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

// NEW: Program Folder Schema
export interface WorkoutProgram {
  id: string;
  name: string;
  isActive: boolean;
}

export interface RoutineTemplate {
  dayKey: string;
  programId?: string; // Links this day to a specific Program Folder
  isActive?: boolean;
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
  workoutPrograms!: Table<WorkoutProgram, string>; // IF THIS IS MISSING, THE APP CRASHES

  constructor() {
    super('GymLogDatabase');
    
    this.version(5).stores({
      workoutLogs: '++id, date',
      routineTemplates: 'dayKey',
      exercises: 'id, muscleGroup',
      bodyweightLogs: '++id, date',
      habitDefinitions: 'id',
      dailyHabits: 'date',
      nutritionLogs: '++id, date, timestamp'
    });

    // Version 6: Injects the Programs table and safely migrates old days
    this.version(6).stores({
      workoutPrograms: 'id',
      routineTemplates: 'dayKey, programId'
    }).upgrade(async tx => {
      await tx.table('workoutPrograms').add({
        id: 'default-program',
        name: 'My Routine',
        isActive: true
      });
      await tx.table('routineTemplates').toCollection().modify(routine => {
        routine.programId = 'default-program';
        routine.isActive = true;
      });
    });
  }
}

export const db = new GymDatabase();