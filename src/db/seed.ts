import { db } from './db';

export async function seedDatabase() {
  const masterExercises = [
    // --- CHEST ---
    { id: 'machine-chest-press', name: 'Machine Chest Press', muscleGroup: 'Chest', equipment: 'Machine', defaultSets: 3, minReps: 6, maxReps: 12, progressionType: 'machine', restSeconds: 90, notes: 'Keep shoulder blades retracted and pinned against pad. Do not flare elbows.' },
    { id: 'incline-chest-press-machine', name: 'Incline Chest Press', muscleGroup: 'Chest', equipment: 'Machine', defaultSets: 3, minReps: 6, maxReps: 10, progressionType: 'machine', restSeconds: 90, notes: 'Set seat height so handles align with upper chest/clavicle.' },
    { id: 'machine-chest-fly', name: 'Machine Chest Fly', muscleGroup: 'Chest', equipment: 'Machine', defaultSets: 2, minReps: 10, maxReps: 15, progressionType: 'machine', restSeconds: 60, notes: 'Keep a slight bend in the elbows. Focus on squeezing the chest at the center.' },
    { id: 'pec-deck-machine', name: 'Pec Deck Machine', muscleGroup: 'Chest', equipment: 'Machine', defaultSets: 2, minReps: 10, maxReps: 15, progressionType: 'machine', restSeconds: 60, notes: 'Keep chest up and elbows slightly bent. Squeeze at the midline.' },
    { id: 'seated-dip-machine', name: 'Seated Dip Machine', muscleGroup: 'Chest', equipment: 'Machine', defaultSets: 2, minReps: 8, maxReps: 12, progressionType: 'machine', restSeconds: 90, notes: 'Keep chest proud and lean slightly forward. Press down to lock out triceps.' },

    // --- BACK ---
    { id: 'lat-pulldown-machine', name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Machine', defaultSets: 3, minReps: 6, maxReps: 12, progressionType: 'machine', restSeconds: 90, notes: 'Use solid straight bar. Lean back slightly, pull to upper chest.' },
    { id: 'underhand-lat-pulldown', name: 'Underhand Lat Pulldown', muscleGroup: 'Back', equipment: 'Machine', defaultSets: 3, minReps: 6, maxReps: 10, progressionType: 'machine', restSeconds: 90, notes: 'Palms facing you. Drive elbows straight down toward your ribs to heavily bias the lower lats.' },
    { id: 'chest-supported-row-machine', name: 'Chest-Supported Row', muscleGroup: 'Back', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine', restSeconds: 90, notes: 'Keep chest glued to pad at all times. Squeeze shoulder blades together.' },
    { id: 'seated-row-machine', name: 'Seated Machine Row', muscleGroup: 'Back', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine', restSeconds: 90, notes: 'Maintain a slight arch in lower back, avoid excessive torso momentum.' },
    { id: 'machine-back-extension', name: 'Machine Back Extension', muscleGroup: 'Back', equipment: 'Machine', defaultSets: 3, minReps: 6, maxReps: 10, progressionType: 'machine', restSeconds: 90, notes: 'Hinge at the hips. Focus on the hamstrings and glutes for the posterior chain.' },

    // --- LEGS ---
    { id: 'linear-hack-press', name: 'Linear Hack Press', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine', restSeconds: 120, notes: 'Full depth without lower back lifting off the pad. Push through mid-foot.' },
    { id: 'hack-squat-machine', name: 'Hack Squat', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 6, maxReps: 10, progressionType: 'machine', restSeconds: 120, notes: 'Keep entire foot flat on platform. Control the eccentric descent.' },
    { id: 'leg-press-machine', name: 'Leg Press', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine', restSeconds: 120, notes: 'Do not lock out knees completely at the top.' },
    { id: 'leg-extension-machine', name: 'Leg Extension', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 2, minReps: 10, maxReps: 15, progressionType: 'machine', restSeconds: 60, notes: 'Pause for 1 second at full knee extension contraction.' },
    { id: 'seated-leg-curl', name: 'Seated Leg Curl', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 15, progressionType: 'machine', restSeconds: 60, notes: 'Keep thighs securely strapped down to prevent lifting.' },
    { id: 'calf-raise-machine', name: 'Standing Calf Raise', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 10, maxReps: 15, progressionType: 'machine', restSeconds: 60, notes: 'Full deep stretch at the bottom, hard contraction at the top.' },

    // --- SHOULDERS ---
    { id: 'shoulder-press-machine', name: 'Machine Shoulder Press', muscleGroup: 'Shoulders', equipment: 'Machine', defaultSets: 2, minReps: 8, maxReps: 12, progressionType: 'machine', restSeconds: 90, notes: 'Keep wrists stacked directly over elbows.' },
    { id: 'lateral-raise-machine', name: 'Machine Lateral Raise', muscleGroup: 'Shoulders', equipment: 'Machine', defaultSets: 3, minReps: 12, maxReps: 20, progressionType: 'machine', restSeconds: 60, notes: 'Lead with elbows slightly, controlled negative.' },
    { id: 'reverse-pec-deck', name: 'Reverse Pec Deck', muscleGroup: 'Shoulders', equipment: 'Machine', defaultSets: 2, minReps: 12, maxReps: 20, progressionType: 'machine', restSeconds: 60, notes: 'Target rear delts. Keep arms mostly straight with soft elbows.' },

    // --- ARMS ---
    { id: 'machine-preacher-curl', name: 'Preacher Curl Machine', muscleGroup: 'Arms', equipment: 'Machine', defaultSets: 2, minReps: 8, maxReps: 15, progressionType: 'machine', restSeconds: 60, notes: 'Armpits flat over top of pad, full arm extension at bottom.' },
    { id: 'machine-biceps-curl', name: 'Machine Biceps Curl', muscleGroup: 'Arms', equipment: 'Machine', defaultSets: 2, minReps: 10, maxReps: 15, progressionType: 'machine', restSeconds: 60, notes: 'Keep elbows locked into the pad and squeeze at the top.' },
    { id: 'triceps-press-machine', name: 'Triceps Press Machine', muscleGroup: 'Arms', equipment: 'Machine', defaultSets: 2, minReps: 10, maxReps: 15, progressionType: 'machine', restSeconds: 60, notes: 'Keep elbows locked in place, full lockout squeeze.' },
    { id: 'machine-overhead-triceps-extension', name: 'Machine Overhead Triceps', muscleGroup: 'Arms', equipment: 'Machine', defaultSets: 2, minReps: 10, maxReps: 15, progressionType: 'machine', restSeconds: 60, notes: 'Focus on the deep stretch at the bottom of the movement.' },

    // --- CORE ---
    { id: 'ab-crunch-machine', name: 'Ab Crunch Machine', muscleGroup: 'Core', equipment: 'Machine', defaultSets: 3, minReps: 10, maxReps: 15, progressionType: 'machine', restSeconds: 60, notes: 'Round your back slightly; focus on shortening the distance between ribs and pelvis.' },
    { id: 'hanging-leg-raises', name: 'Hanging Leg Raises', muscleGroup: 'Core', equipment: 'Bodyweight', defaultSets: 3, minReps: 10, maxReps: 15, progressionType: 'bodyweight', restSeconds: 60, notes: 'Avoid swinging; posteriorly tilt pelvis at the top.' },
    { id: 'front-planks', name: 'Front Planks', muscleGroup: 'Core', equipment: 'Bodyweight', defaultSets: 3, minReps: 45, maxReps: 60, progressionType: 'bodyweight', restSeconds: 45, notes: 'Squeeze glutes and tuck pelvis under.' }
  ];
  
  await db.exercises.bulkPut(masterExercises as any);

  await db.routineTemplates.bulkPut([
    {
      dayKey: 'Day A',
      exercises: [
        { exerciseId: 'incline-chest-press-machine', sets: 3 },
        { exerciseId: 'lat-pulldown-machine', sets: 3 },
        { exerciseId: 'chest-supported-row-machine', sets: 3 },
        { exerciseId: 'hack-squat-machine', sets: 3 },
        { exerciseId: 'leg-extension-machine', sets: 2 },
        { exerciseId: 'shoulder-press-machine', sets: 2 },
        { exerciseId: 'lateral-raise-machine', sets: 3 },
        { exerciseId: 'pec-deck-machine', sets: 2 },
        { exerciseId: 'machine-preacher-curl', sets: 2 },
        { exerciseId: 'machine-overhead-triceps-extension', sets: 2 },
        { exerciseId: 'ab-crunch-machine', sets: 3 }
      ]
    },
    {
      dayKey: 'Day B',
      exercises: [
        { exerciseId: 'machine-chest-press', sets: 3 },
        { exerciseId: 'underhand-lat-pulldown', sets: 3 }, // Swapped from pull-ups
        { exerciseId: 'chest-supported-row-machine', sets: 3 },
        { exerciseId: 'machine-back-extension', sets: 3 },
        { exerciseId: 'seated-leg-curl', sets: 3 },
        { exerciseId: 'leg-press-machine', sets: 2 },
        { exerciseId: 'lateral-raise-machine', sets: 3 },
        { exerciseId: 'reverse-pec-deck', sets: 2 },
        { exerciseId: 'machine-chest-fly', sets: 2 },
        { exerciseId: 'machine-biceps-curl', sets: 2 },
        { exerciseId: 'machine-overhead-triceps-extension', sets: 2 }
      ]
    },
    {
      dayKey: 'Day C',
      exercises: [
        { exerciseId: 'machine-chest-press', sets: 3 },
        { exerciseId: 'lat-pulldown-machine', sets: 3 },
        { exerciseId: 'seated-row-machine', sets: 3 },
        { exerciseId: 'leg-press-machine', sets: 3 },
        { exerciseId: 'seated-leg-curl', sets: 2 },
        { exerciseId: 'seated-dip-machine', sets: 2 }, // Swapped from bodyweight dips
        { exerciseId: 'lateral-raise-machine', sets: 3 },
        { exerciseId: 'reverse-pec-deck', sets: 2 },
        { exerciseId: 'calf-raise-machine', sets: 3 },
        { exerciseId: 'machine-preacher-curl', sets: 2 },
        { exerciseId: 'triceps-press-machine', sets: 2 },
        { exerciseId: 'hanging-leg-raises', sets: 3 }
      ]
    }
  ]);

  const habitCount = await db.habitDefinitions.count();
  if (habitCount === 0) {
    await db.habitDefinitions.bulkAdd([
      { id: 'creatine', label: 'Creatine Monohydrate (5g)' },
      { id: 'vitamins', label: 'Daily Vitamins' },
      { id: 'magnesium', label: 'Magnesium' }
    ]);
  }
}