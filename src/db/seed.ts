import { db } from './db';

export async function seedDatabase() {
  const count = await db.exercises.count();
  if (count === 0) {
    await db.exercises.bulkAdd([
      // --- CHEST ---
      { id: 'machine-chest-press', name: 'Machine Chest Press', muscleGroup: 'Chest', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine' },
      { id: 'incline-chest-press-machine', name: 'Incline Chest Press', muscleGroup: 'Chest', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine' },
      { id: 'dips', name: 'Dips (Wide/Chest)', muscleGroup: 'Chest', equipment: 'Bodyweight', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'bodyweight' },
      { id: 'push-ups', name: 'Push-Ups', muscleGroup: 'Chest', equipment: 'Bodyweight', defaultSets: 3, minReps: 10, maxReps: 25, progressionType: 'bodyweight' },

      // --- BACK ---
      { id: 'pull-ups', name: 'Pull-Ups', muscleGroup: 'Back', equipment: 'Bodyweight', defaultSets: 3, minReps: 6, maxReps: 10, progressionType: 'bodyweight' },
      { id: 'chin-ups', name: 'Chin-Ups', muscleGroup: 'Back', equipment: 'Bodyweight', defaultSets: 3, minReps: 6, maxReps: 10, progressionType: 'bodyweight' },
      { id: 'lat-pulldown-machine', name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine' },
      { id: 'chest-supported-row-machine', name: 'Chest-Supported Row', muscleGroup: 'Back', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine' },
      { id: 'seated-row-machine', name: 'Seated Cable Row', muscleGroup: 'Back', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine' },
      { id: 'inverted-rows', name: 'Inverted Rows (Smith Bar)', muscleGroup: 'Back', equipment: 'Bodyweight', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'bodyweight' },

      // --- LEGS ---
      { id: 'linear-hack-press', name: 'Linear Hack Press', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine' },
      { id: 'hack-squat-machine', name: 'Hack Squat Machine', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 4, minReps: 8, maxReps: 10, progressionType: 'machine' },
      { id: 'leg-press-machine', name: 'Leg Press', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine' },
      { id: 'bulgarian-split-squats', name: 'Bulgarian Split Squats', muscleGroup: 'Legs', equipment: 'Bodyweight', defaultSets: 3, minReps: 8, maxReps: 10, progressionType: 'bodyweight' },
      { id: 'leg-extension-machine', name: 'Leg Extension', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 12, maxReps: 15, progressionType: 'machine' },
      { id: 'mts-leg-extension', name: 'MTS Leg Extension', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 10, maxReps: 15, progressionType: 'machine' },
      { id: 'seated-leg-curl', name: 'Seated Leg Curl', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 10, maxReps: 15, progressionType: 'machine' },
      { id: 'mts-kneeling-leg-curl', name: 'Kneeling Leg Curl', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 10, maxReps: 15, progressionType: 'machine' },
      { id: 'hip-abduction', name: 'Hip Abduction', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 12, maxReps: 15, progressionType: 'machine' },
      { id: 'calf-raise-machine', name: 'Calf Raise', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 12, maxReps: 20, progressionType: 'machine' },

      // --- SHOULDERS ---
      { id: 'shoulder-press-machine', name: 'Shoulder Press', muscleGroup: 'Shoulders', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine' },
      { id: 'lateral-raise-machine', name: 'Lateral Raise Machine', muscleGroup: 'Shoulders', equipment: 'Machine', defaultSets: 3, minReps: 12, maxReps: 15, progressionType: 'machine' },
      { id: 'reverse-pec-deck', name: 'Reverse Pec Deck', muscleGroup: 'Shoulders', equipment: 'Machine', defaultSets: 3, minReps: 12, maxReps: 15, progressionType: 'machine' },
      { id: 'pike-push-ups', name: 'Pike Push-Ups', muscleGroup: 'Shoulders', equipment: 'Bodyweight', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'bodyweight' },

      // --- ARMS (BICEPS, TRICEPS, FOREARMS) ---
      { id: 'machine-preacher-curl', name: 'Preacher Curl Machine', muscleGroup: 'Arms', equipment: 'Machine', defaultSets: 3, minReps: 10, maxReps: 12, progressionType: 'machine' },
      { id: 'triceps-press-machine', name: 'Triceps Press', muscleGroup: 'Arms', equipment: 'Machine', defaultSets: 3, minReps: 10, maxReps: 12, progressionType: 'machine' },
      { id: 'bench-dips', name: 'Bench Dips', muscleGroup: 'Arms', equipment: 'Bodyweight', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'bodyweight' },
      { id: 'dead-hangs', name: 'Dead Hangs (Grip)', muscleGroup: 'Arms', equipment: 'Bodyweight', defaultSets: 3, minReps: 45, maxReps: 60, progressionType: 'bodyweight' }, // Reps acting as seconds here

      // --- CORE ---
      { id: 'hanging-leg-raises', name: 'Hanging Leg Raises', muscleGroup: 'Core', equipment: 'Bodyweight', defaultSets: 3, minReps: 10, maxReps: 15, progressionType: 'bodyweight' },
      { id: 'front-planks', name: 'Front Planks', muscleGroup: 'Core', equipment: 'Bodyweight', defaultSets: 3, minReps: 45, maxReps: 60, progressionType: 'bodyweight' },
      { id: 'side-planks', name: 'Side Planks', muscleGroup: 'Core', equipment: 'Bodyweight', defaultSets: 3, minReps: 30, maxReps: 45, progressionType: 'bodyweight' }
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