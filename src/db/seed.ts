import { db } from './db';

export async function seedDatabase() {
  const masterExercises = [
    // --- CHEST ---
    { id: 'machine-chest-press', name: 'Machine Chest Press', muscleGroup: 'Chest', equipment: 'Machine', defaultSets: 3, minReps: 6, maxReps: 10, progressionType: 'machine', restSeconds: 90, notes: 'Keep shoulder blades retracted. Focus on the stretch.' },
    { id: 'incline-chest-press-machine', name: 'Incline Chest Press', muscleGroup: 'Chest', equipment: 'Machine', defaultSets: 3, minReps: 6, maxReps: 10, progressionType: 'machine', restSeconds: 90, notes: 'Align handles with upper chest.' },
    { id: 'machine-chest-fly', name: 'Machine Chest Fly', muscleGroup: 'Chest', equipment: 'Machine', defaultSets: 2, minReps: 10, maxReps: 15, progressionType: 'machine', restSeconds: 60 },
    { id: 'pec-deck-machine', name: 'Pec Deck Machine', muscleGroup: 'Chest', equipment: 'Machine', defaultSets: 2, minReps: 10, maxReps: 15, progressionType: 'machine', restSeconds: 60 },
    { id: 'seated-dip-machine', name: 'Seated Dip Machine', muscleGroup: 'Chest', equipment: 'Machine', defaultSets: 2, minReps: 8, maxReps: 12, progressionType: 'machine', restSeconds: 90 },

    // --- BACK ---
    { id: 'lat-pulldown-machine', name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine', restSeconds: 90 },
    { id: 'lat-pulldown-alt-grip', name: 'Lat Pulldown (Alt Grip)', muscleGroup: 'Back', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine', restSeconds: 90, notes: 'Use a neutral or reverse grip to hit different areas of the lats and bias the biceps.' },
    { id: 'underhand-lat-pulldown', name: 'Underhand Lat Pulldown', muscleGroup: 'Back', equipment: 'Machine', defaultSets: 3, minReps: 6, maxReps: 10, progressionType: 'machine', restSeconds: 90 },
    { id: 'chest-supported-row-machine', name: 'Chest-Supported Row', muscleGroup: 'Back', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine', restSeconds: 90 },
    { id: 'seated-row-machine', name: 'Seated Cable Row', muscleGroup: 'Back', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine', restSeconds: 90 },
    { id: 'machine-back-extension', name: 'Machine Back Extension', muscleGroup: 'Back', equipment: 'Machine', defaultSets: 3, minReps: 6, maxReps: 10, progressionType: 'machine', restSeconds: 90 },

    // --- LEGS ---
    { id: 'linear-hack-press', name: 'Linear Hack Press', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine', restSeconds: 120 },
    { id: 'hack-squat-machine', name: 'Hack Squat', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 6, maxReps: 10, progressionType: 'machine', restSeconds: 120 },
    { id: 'leg-press-machine', name: 'Leg Press', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine', restSeconds: 120 },
    { id: 'leg-extension-machine', name: 'Leg Extension', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 2, minReps: 12, maxReps: 15, progressionType: 'machine', restSeconds: 60 },
    { id: 'seated-leg-curl', name: 'Seated Leg Curl', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 10, maxReps: 15, progressionType: 'machine', restSeconds: 60 },
    { id: 'calf-raise-machine', name: 'Calf Raises', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 12, maxReps: 20, progressionType: 'machine', restSeconds: 60 },

    // --- SHOULDERS ---
    { id: 'shoulder-press-machine', name: 'Machine Shoulder Press', muscleGroup: 'Shoulders', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine', restSeconds: 90 },
    { id: 'lateral-raise-machine', name: 'Machine Lateral Raise', muscleGroup: 'Shoulders', equipment: 'Machine', defaultSets: 3, minReps: 12, maxReps: 20, progressionType: 'machine', restSeconds: 60 },
    { id: 'reverse-pec-deck', name: 'Rear-Delt Machine', muscleGroup: 'Shoulders', equipment: 'Machine', defaultSets: 3, minReps: 12, maxReps: 20, progressionType: 'machine', restSeconds: 60 },

    // --- ARMS ---
    { id: 'machine-preacher-curl', name: 'Machine Preacher Curl', muscleGroup: 'Arms', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine', restSeconds: 60 },
    { id: 'single-arm-biceps-curl', name: 'Single-Arm Biceps Curl', muscleGroup: 'Arms', equipment: 'Cable/Machine', defaultSets: 2, minReps: 10, maxReps: 15, progressionType: 'machine', restSeconds: 60, notes: 'Focus on the stretch. Do prescribed reps on each arm.' },
    { id: 'hammer-curl-machine', name: 'Hammer Curl', muscleGroup: 'Arms', equipment: 'Cable/Machine', defaultSets: 3, minReps: 10, maxReps: 15, progressionType: 'machine', restSeconds: 60, notes: 'Use rope attachment or neutral grips to target brachialis.' },
    { id: 'triceps-press-machine', name: 'Triceps Press Machine', muscleGroup: 'Arms', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine', restSeconds: 60 },
    { id: 'single-arm-triceps-extension', name: 'Single-Arm Triceps Extension', muscleGroup: 'Arms', equipment: 'Cable', defaultSets: 2, minReps: 10, maxReps: 15, progressionType: 'machine', restSeconds: 60, notes: 'Keep the elbow locked in place.' },
    { id: 'cable-triceps-extension', name: 'Cable Triceps Extension', muscleGroup: 'Arms', equipment: 'Cable', defaultSets: 3, minReps: 10, maxReps: 15, progressionType: 'machine', restSeconds: 60 },
    { id: 'machine-overhead-triceps-extension', name: 'Machine Overhead Triceps', muscleGroup: 'Arms', equipment: 'Machine', defaultSets: 2, minReps: 10, maxReps: 15, progressionType: 'machine', restSeconds: 60 },

    // --- CORE ---
    { id: 'ab-crunch-machine', name: 'Ab Crunch Machine', muscleGroup: 'Core', equipment: 'Machine', defaultSets: 3, minReps: 10, maxReps: 15, progressionType: 'machine', restSeconds: 60, notes: 'Crunch downward with the abs, do not pull with arms.' },
    { id: 'captains-chair-leg-raises', name: 'Captain\'s Chair Leg Raises', muscleGroup: 'Core', equipment: 'Bodyweight', defaultSets: 3, minReps: 10, maxReps: 15, progressionType: 'bodyweight', restSeconds: 60, notes: 'Keep core tight, tilt pelvis upward at the top.' }
  ];
  
  await db.exercises.bulkPut(masterExercises as any);

  // Inject into the new Program Architecture
  const programId = 'arm-focus-hypertrophy';
  await db.workoutPrograms.put({
    id: programId,
    name: 'Arm-Focused Hypertrophy',
    isActive: true
  });

  await db.routineTemplates.bulkPut([
    {
      dayKey: 'Day A (Arms, Chest, Back, Quads)',
      programId: programId,
      isActive: true,
      exercises: [
        { exerciseId: 'machine-preacher-curl', sets: 3 },
        { exerciseId: 'triceps-press-machine', sets: 3 },
        { exerciseId: 'machine-chest-press', sets: 3 },
        { exerciseId: 'lat-pulldown-machine', sets: 3 },
        { exerciseId: 'single-arm-biceps-curl', sets: 2 },
        { exerciseId: 'single-arm-triceps-extension', sets: 2 },
        { exerciseId: 'leg-press-machine', sets: 3 }
      ]
    },
    {
      dayKey: 'Day B (Shoulders, Chest, Back, Hams, Core)',
      programId: programId,
      isActive: true,
      exercises: [
        { exerciseId: 'shoulder-press-machine', sets: 3 },
        { exerciseId: 'lateral-raise-machine', sets: 3 },
        { exerciseId: 'incline-chest-press-machine', sets: 3 },
        { exerciseId: 'seated-row-machine', sets: 3 },
        { exerciseId: 'cable-triceps-extension', sets: 3 },
        { exerciseId: 'seated-leg-curl', sets: 3 },
        { exerciseId: 'calf-raise-machine', sets: 3 },
        { exerciseId: 'ab-crunch-machine', sets: 3 }
      ]
    },
    {
      dayKey: 'Day C (Back, Biceps, Shoulders, Quads, Core)',
      programId: programId,
      isActive: true,
      exercises: [
        { exerciseId: 'chest-supported-row-machine', sets: 3 },
        { exerciseId: 'lat-pulldown-alt-grip', sets: 3 },
        { exerciseId: 'machine-preacher-curl', sets: 3 },
        { exerciseId: 'hammer-curl-machine', sets: 3 },
        { exerciseId: 'reverse-pec-deck', sets: 3 },
        { exerciseId: 'linear-hack-press', sets: 3 },
        { exerciseId: 'leg-extension-machine', sets: 2 },
        { exerciseId: 'captains-chair-leg-raises', sets: 3 }
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