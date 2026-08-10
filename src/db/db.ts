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

export interface HabitDefinition {
  id: string;
  label: string;
}

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
  restSeconds?: number;
  notes?: string; // <-- NEW: Posture & Setup Reminders
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
  habitDefinitions!: Table<HabitDefinition, string>;

  constructor() {
    super('GymLogDatabase');
    // Bumped to version 5 for exercise notes
    this.version(5).stores({
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