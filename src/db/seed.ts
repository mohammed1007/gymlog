import { db } from './db';

export async function seedDatabase() {
  const count = await db.exercises.count();
  if (count > 0) return;

  await db.exercises.bulkAdd([
    {
      id: 'machine-chest-press',
      name: 'Machine Chest Press',
      muscleGroup: 'Chest',
      equipment: 'Machine',
      defaultSets: 3,
      minReps: 6,
      maxReps: 10,
      progressionType: 'weight'
    },
    {
      id: 'pull-ups',
      name: 'Pull-Ups',
      muscleGroup: 'Back',
      equipment: 'Bodyweight',
      defaultSets: 3,
      minReps: 6,
      maxReps: 10,
      progressionType: 'bodyweight'
    },
    {
      id: 'linear-hack-press',
      name: 'Linear Hack Press',
      muscleGroup: 'Legs',
      equipment: 'Machine',
      defaultSets: 3,
      minReps: 6,
      maxReps: 10,
      progressionType: 'weight'
    }
  ]);
}