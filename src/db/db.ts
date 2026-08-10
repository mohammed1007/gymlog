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

export interface DailyHabitsLog {
  date: string; 
  creatine: boolean;
  surplusMeals: boolean;
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
  dayKey: string; // 'Day A' | 'Day B' | 'Day C'
  exerciseIds: string[];
}

export class GymDatabase extends Dexie {
  workoutLogs!: Table<CompletedWorkout, number>;
  bodyweightLogs!: Table<BodyweightLog, number>;
  dailyHabits!: Table<DailyHabitsLog, string>;
  exercises!: Table<ExerciseDefinition, string>;
  routineTemplates!: Table<RoutineTemplate, string>;

  constructor() {
    super('GymLogDatabase');
    this.version(3).stores({
      workoutLogs: '++id, date, templateName',
      bodyweightLogs: '++id, date',
      dailyHabits: 'date',
      exercises: 'id',
      routineTemplates: 'dayKey'
    });
  }
}

export const db = new GymDatabase();