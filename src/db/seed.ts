import { db } from './db';

export async function seedDatabase() {
  // 1. SMART SYNC EXERCISES
  // By using bulkPut without a count check, we ensure your exercise dictionary 
  // is always up-to-date with new app updates without ever deleting your history.
  const masterExercises = [
    { id: 'machine-chest-press', name: 'Machine Chest Press', muscleGroup: 'Chest', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine', restSeconds: 90, notes: 'Keep shoulder blades retracted and pinned against pad. Do not flare elbows.' },
    { id: 'incline-chest-press-machine', name: 'Incline Chest Press', muscleGroup: 'Chest', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine', restSeconds: 90, notes: 'Set seat height so handles align with upper chest/clavicle.' },
    { id: 'dips', name: 'Dips (Wide/Chest)', muscleGroup: 'Chest', equipment: 'Bodyweight', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'bodyweight', restSeconds: 90, notes: 'Lean forward slightly to bias lower chest. Flare elbows out gently.' },
    { id: 'push-ups', name: 'Push-Ups', muscleGroup: 'Chest', equipment: 'Bodyweight', defaultSets: 3, minReps: 10, maxReps: 25, progressionType: 'bodyweight', restSeconds: 60, notes: 'Core braced tight, full lockout at the top.' },

    { id: 'pull-ups', name: 'Pull-Ups', muscleGroup: 'Back', equipment: 'Bodyweight', defaultSets: 3, minReps: 6, maxReps: 10, progressionType: 'bodyweight', restSeconds: 90, notes: 'Initiate by depressing scapula downward before pulling with arms.' },
    { id: 'chin-ups', name: 'Chin-Ups', muscleGroup: 'Back', equipment: 'Bodyweight', defaultSets: 3, minReps: 6, maxReps: 10, progressionType: 'bodyweight', restSeconds: 90, notes: 'Palms facing you, drive elbows straight down toward ribs.' },
    { id: 'lat-pulldown-machine', name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine', restSeconds: 90, notes: 'Use solid straight bar. Lean back slightly, pull to upper chest.' },
    { id: 'chest-supported-row-machine', name: 'Chest-Supported Row', muscleGroup: 'Back', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine', restSeconds: 90, notes: 'Keep chest glued to pad at all times. Squeeze shoulder blades together.' },
    { id: 'seated-row-machine', name: 'Seated Cable Row', muscleGroup: 'Back', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine', restSeconds: 90, notes: 'Maintain a slight arch in lower back, avoid excessive torso momentum.' },
    { id: 'inverted-rows', name: 'Inverted Rows (Smith Bar)', muscleGroup: 'Back', equipment: 'Bodyweight', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'bodyweight', restSeconds: 75, notes: 'Set bar at waist height. Pull chest to bar.' },

    { id: 'linear-hack-press', name: 'Linear Hack Press', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine', restSeconds: 120, notes: 'Full depth without lower back lifting off the pad. Push through mid-foot.' },
    { id: 'hack-squat-machine', name: 'Hack Squat Machine', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 4, minReps: 8, maxReps: 10, progressionType: 'machine', restSeconds: 120, notes: 'Keep entire foot flat on platform. Control the eccentric descent.' },
    { id: 'leg-press-machine', name: 'Leg Press', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine', restSeconds: 120, notes: 'Do not lock out knees completely at the top.' },
    { id: 'bulgarian-split-squats', name: 'Bulgarian Split Squats', muscleGroup: 'Legs', equipment: 'Bodyweight', defaultSets: 3, minReps: 8, maxReps: 10, progressionType: 'bodyweight', restSeconds: 90, notes: 'Torso upright for quad focus, slight forward lean for glute focus.' },
    { id: 'leg-extension-machine', name: 'Leg Extension', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 12, maxReps: 15, progressionType: 'machine', restSeconds: 60, notes: 'Pause for 1 second at full knee extension contraction.' },
    { id: 'mts-leg-extension', name: 'MTS Leg Extension', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 10, maxReps: 15, progressionType: 'machine', restSeconds: 60, notes: 'Align knee joint with machine pivot axis.' },
    { id: 'seated-leg-curl', name: 'Seated Leg Curl', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 10, maxReps: 15, progressionType: 'machine', restSeconds: 60, notes: 'Keep thighs securely strapped down to prevent lifting.' },
    { id: 'mts-kneeling-leg-curl', name: 'Kneeling Leg Curl', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 10, maxReps: 15, progressionType: 'machine', restSeconds: 60, notes: 'Keep hips square and locked against pad.' },
    { id: 'hip-abduction', name: 'Hip Abduction', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 12, maxReps: 15, progressionType: 'machine', restSeconds: 60, notes: 'Lean slightly forward into pad for optimal glute activation.' },
    { id: 'calf-raise-machine', name: 'Calf Raise', muscleGroup: 'Legs', equipment: 'Machine', defaultSets: 3, minReps: 12, maxReps: 20, progressionType: 'machine', restSeconds: 60, notes: 'Full deep stretch at the bottom, hard contraction at the top.' },

    { id: 'shoulder-press-machine', name: 'Shoulder Press', muscleGroup: 'Shoulders', equipment: 'Machine', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'machine', restSeconds: 90, notes: 'Keep wrists stacked directly over elbows.' },
    { id: 'lateral-raise-machine', name: 'Lateral Raise Machine', muscleGroup: 'Shoulders', equipment: 'Machine', defaultSets: 3, minReps: 12, maxReps: 15, progressionType: 'machine', restSeconds: 60, notes: 'Lead with elbows slightly, controlled negative.' },
    { id: 'reverse-pec-deck', name: 'Reverse Pec Deck', muscleGroup: 'Shoulders', equipment: 'Machine', defaultSets: 3, minReps: 12, maxReps: 15, progressionType: 'machine', restSeconds: 60, notes: 'Target rear delts. Keep arms mostly straight with soft elbows.' },
    { id: 'pike-push-ups', name: 'Shoulder Pike Push-Ups', muscleGroup: 'Shoulders', equipment: 'Bodyweight', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'bodyweight', restSeconds: 75, notes: 'Elevate hips high, lower head forward in triangle path.' },

    { id: 'machine-preacher-curl', name: 'Preacher Curl Machine', muscleGroup: 'Arms', equipment: 'Machine', defaultSets: 3, minReps: 10, maxReps: 12, progressionType: 'machine', restSeconds: 60, notes: 'Armpits flat over top of pad, full arm extension at bottom.' },
    { id: 'triceps-press-machine', name: 'Triceps Press', muscleGroup: 'Arms', equipment: 'Machine', defaultSets: 3, minReps: 10, maxReps: 12, progressionType: 'machine', restSeconds: 60, notes: 'Keep elbows locked in place, full lockout squeeze.' },
    { id: 'bench-dips', name: 'Bench Dips', muscleGroup: 'Arms', equipment: 'Bodyweight', defaultSets: 3, minReps: 8, maxReps: 12, progressionType: 'bodyweight', restSeconds: 60, notes: 'Keep back close to the bench to protect shoulders.' },
    { id: 'dead-hangs', name: 'Dead Hangs (Grip)', muscleGroup: 'Arms', equipment: 'Bodyweight', defaultSets: 3, minReps: 45, maxReps: 60, progressionType: 'bodyweight', restSeconds: 45, notes: 'Active shoulder engagement or passive stretch.' },

    // --- CORE EXERCISES ---
    { id: 'ab-crunch-machine', name: 'Ab Crunch Machine', muscleGroup: 'Core', equipment: 'Machine', defaultSets: 3, minReps: 12, maxReps: 15, progressionType: 'machine', restSeconds: 60, notes: 'Round your back slightly; focus on shortening the distance between ribs and pelvis.' },
    { id: 'hanging-leg-raises', name: 'Hanging Leg Raises', muscleGroup: 'Core', equipment: 'Bodyweight', defaultSets: 3, minReps: 10, maxReps: 15, progressionType: 'bodyweight', restSeconds: 60, notes: 'Avoid swinging; posteriorly tilt pelvis at the top.' },
    { id: 'front-planks', name: 'Front Planks', muscleGroup: 'Core', equipment: 'Bodyweight', defaultSets: 3, minReps: 45, maxReps: 60, progressionType: 'bodyweight', restSeconds: 45, notes: 'Squeeze glutes and tuck pelvis under.' },
    { id: 'side-planks', name: 'Side Planks', muscleGroup: 'Core', equipment: 'Bodyweight', defaultSets: 3, minReps: 30, maxReps: 45, progressionType: 'bodyweight', restSeconds: 45, notes: 'Stack hips vertically, keep core rigid.' }
  ];
  
  // This will overwrite/update existing exercises and add missing ones silently
  await db.exercises.bulkPut(masterExercises as any);

  // 2. ROUTINE TEMPLATES (Only run if empty, to protect custom user edits)
  const templateCount = await db.routineTemplates.count();
  if (templateCount === 0) {
    await db.routineTemplates.bulkAdd([
      {
        dayKey: 'Day A',
        exercises: [
          { exerciseId: 'machine-chest-press', sets: 3 },
          { exerciseId: 'pull-ups', sets: 3 },
          { exerciseId: 'chest-supported-row-machine', sets: 3 },
          { exerciseId: 'linear-hack-press', sets: 3 },
          { exerciseId: 'mts-leg-extension', sets: 3 },
          { exerciseId: 'mts-kneeling-leg-curl', sets: 3 },
          { exerciseId: 'lateral-raise-machine', sets: 3 },
          { exerciseId: 'machine-preacher-curl', sets: 3 },
          { exerciseId: 'triceps-press-machine', sets: 3 },
          { exerciseId: 'hanging-leg-raises', sets: 3 },
          { exerciseId: 'front-planks', sets: 3 }
        ]
      },
      {
        dayKey: 'Day B',
        exercises: [
          { exerciseId: 'incline-chest-press-machine', sets: 3 },
          { exerciseId: 'lat-pulldown-machine', sets: 3 },
          { exerciseId: 'seated-row-machine', sets: 3 },
          { exerciseId: 'leg-press-machine', sets: 3 },
          { exerciseId: 'leg-extension-machine', sets: 3 },
          { exerciseId: 'mts-kneeling-leg-curl', sets: 3 },
          { exerciseId: 'hip-abduction', sets: 3 },
          { exerciseId: 'shoulder-press-machine', sets: 3 },
          { exerciseId: 'reverse-pec-deck', sets: 3 },
          { exerciseId: 'machine-preacher-curl', sets: 3 },
          { exerciseId: 'triceps-press-machine', sets: 3 },
          { exerciseId: 'ab-crunch-machine', sets: 3 }
        ]
      },
      {
        dayKey: 'Day C',
        exercises: [
          { exerciseId: 'machine-chest-press', sets: 3 },
          { exerciseId: 'dips', sets: 3 },
          { exerciseId: 'pull-ups', sets: 3 },
          { exerciseId: 'chest-supported-row-machine', sets: 3 },
          { exerciseId: 'linear-hack-press', sets: 3 },
          { exerciseId: 'leg-extension-machine', sets: 3 },
          { exerciseId: 'mts-kneeling-leg-curl', sets: 3 },
          { exerciseId: 'hip-abduction', sets: 3 },
          { exerciseId: 'calf-raise-machine', sets: 3 },
          { exerciseId: 'lateral-raise-machine', sets: 3 },
          { exerciseId: 'reverse-pec-deck', sets: 3 },
          { exerciseId: 'hanging-leg-raises', sets: 3 }
        ]
      }
    ]);
  }

  // 3. HABITS (Only run if empty, to protect custom user edits)
  const habitCount = await db.habitDefinitions.count();
  if (habitCount === 0) {
    await db.habitDefinitions.bulkAdd([
      { id: 'creatine', label: 'Creatine Monohydrate (5g)' },
      { id: 'vitamins', label: 'Daily Vitamins' },
      { id: 'magnesium', label: 'Magnesium' }
    ]);
  }
}