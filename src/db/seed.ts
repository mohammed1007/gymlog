import { db } from './db';

export async function seedDatabase() {
  const count = await db.exercises.count();
  if (count === 0) {
    await db.exercises.bulkAdd([
      { id: 'machine-chest-press', name: 'Machine Chest Press', muscleGroup: 'Chest', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine' },
      { id: 'pull-ups', name: 'Pull-Ups', muscleGroup: 'Back', equipment: 'Bodyweight', defaultSets: 3, minReps: 6, maxReps: 10, progressionType: 'bodyweight' },
      { id: 'chest-supported-row-machine', name: 'Chest-Supported Row', muscleGroup: 'Back', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine' },
      { id: 'linear-hack-press', name: 'Linear Hack Press', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine' },
      { id: 'mts-leg-extension', name: 'Leg Extension', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 10, maxReps: 15, progressionType: 'machine' },
      { id: 'mts-kneeling-leg-curl', name: 'Leg Curl', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 10, maxReps: 15, progressionType: 'machine' },
      { id: 'lateral-raise-machine', name: 'Lateral Raise Machine', muscleGroup: 'Shoulders', equipment: 'Machine', defaultSets: 3, minReps: 12, maxReps: 15, progressionType: 'machine' },
      { id: 'machine-preacher-curl', name: 'Preacher Curl', muscleGroup: 'Arms', equipment: 'Machine', defaultSets: 3, minReps: 10, maxReps: 12, progressionType: 'machine' },
      { id: 'triceps-press-machine', name: 'Triceps Press', muscleGroup: 'Arms', equipment: 'Machine', defaultSets: 3, minReps: 10, maxReps: 12, progressionType: 'machine' },
      { id: 'hanging-leg-raises', name: 'Hanging Leg Raises', muscleGroup: 'Core', equipment: 'Bodyweight', defaultSets: 3, minReps: 10, maxReps: 15, progressionType: 'bodyweight' },
      { id: 'incline-chest-press-machine', name: 'Incline Chest Press', muscleGroup: 'Chest', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine' },
      { id: 'lat-pulldown-machine', name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine' },
      { id: 'seated-row-machine', name: 'Seated Row', muscleGroup: 'Back', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine' },
      { id: 'leg-press-machine', name: 'Leg Press', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine' },
      { id: 'leg-extension-machine', name: 'Leg Extension', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 10, maxReps: 15, progressionType: 'machine' },
      { id: 'hip-abduction', name: 'Hip Abduction', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 12, maxReps: 15, progressionType: 'machine' },
      { id: 'shoulder-press-machine', name: 'Shoulder Press', muscleGroup: 'Shoulders', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine' },
      { id: 'reverse-pec-deck', name: 'Reverse Pec Deck', muscleGroup: 'Shoulders', equipment: 'Machine', defaultSets: 3, minReps: 12, maxReps: 15, progressionType: 'machine' },
      { id: 'dips', name: 'Dips', muscleGroup: 'Chest', equipment: 'Bodyweight', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'bodyweight' },
      { id: 'calf-raise-machine', name: 'Calf Raise', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 12, maxReps: 20, progressionType: 'machine' }
    ]);
  }

  const templateCount = await db.routineTemplates.count();
  if (templateCount === 0) {
    await db.routineTemplates.bulkAdd([
      {
        dayKey: 'Day A',
        exerciseIds: [
          'machine-chest-press', 'pull-ups', 'chest-supported-row-machine', 'linear-hack-press',
          'mts-leg-extension', 'mts-kneeling-leg-curl', 'lateral-raise-machine', 'machine-preacher-curl',
          'triceps-press-machine', 'hanging-leg-raises'
        ]
      },
      {
        dayKey: 'Day B',
        exerciseIds: [
          'incline-chest-press-machine', 'lat-pulldown-machine', 'seated-row-machine', 'leg-press-machine',
          'leg-extension-machine', 'mts-kneeling-leg-curl', 'hip-abduction', 'shoulder-press-machine',
          'reverse-pec-deck', 'machine-preacher-curl', 'triceps-press-machine'
        ]
      },
      {
        dayKey: 'Day C',
        exerciseIds: [
          'machine-chest-press', 'dips', 'pull-ups', 'chest-supported-row-machine', 'linear-hack-press',
          'leg-extension-machine', 'mts-kneeling-leg-curl', 'hip-abduction', 'calf-raise-machine',
          'lateral-raise-machine', 'reverse-pec-deck', 'hanging-leg-raises'
        ]
      }
    ]);
  }
  const habitCount = await db.habitDefinitions.count();
  if (habitCount === 0) {
    await db.habitDefinitions.bulkAdd([
      { id: 'creatine', label: 'Creatine Monohydrate (5g)' },
      { id: 'vitamins', label: 'Daily Vitamins' },
      { id: 'magnesium', label: 'Magnesium' }
    ]);
  }
}