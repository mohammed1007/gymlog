interface MuscleMapProps {
  muscleGroup: string;
  exerciseId?: string; // We add exerciseId for precise mapping
}

// Maps specific exercises to their exact target muscles
const exactMuscleTargets: Record<string, string[]> = {
  // Chest
  'machine-chest-press': ['chest', 'front-delts', 'triceps'],
  'incline-chest-press-machine': ['upper-chest', 'front-delts', 'triceps'],
  'dips': ['chest', 'triceps', 'front-delts'],
  'push-ups': ['chest', 'triceps', 'front-delts'],
  
  // Back
  'pull-ups': ['lats', 'biceps', 'rear-delts'],
  'chin-ups': ['lats', 'biceps'],
  'lat-pulldown-machine': ['lats', 'biceps'],
  'chest-supported-row-machine': ['lats', 'traps', 'rear-delts', 'biceps'],
  'seated-row-machine': ['lats', 'traps', 'rear-delts', 'biceps'],
  'inverted-rows': ['lats', 'traps', 'rear-delts', 'biceps'],
  
  // Legs (High Precision)
  'linear-hack-press': ['quads', 'glutes'],
  'hack-squat-machine': ['quads', 'glutes'],
  'leg-press-machine': ['quads', 'glutes'],
  'bulgarian-split-squats': ['quads', 'glutes'],
  'leg-extension-machine': ['quads'],
  'mts-leg-extension': ['quads'],
  'seated-leg-curl': ['hamstrings'],
  'mts-kneeling-leg-curl': ['hamstrings'],
  'hip-abduction': ['glutes'],
  'calf-raise-machine': ['calves'],
  
  // Shoulders
  'shoulder-press-machine': ['front-delts', 'side-delts', 'triceps'],
  'lateral-raise-machine': ['side-delts'],
  'reverse-pec-deck': ['rear-delts', 'traps'],
  'pike-push-ups': ['front-delts', 'side-delts', 'triceps'],
  
  // Arms
  'machine-preacher-curl': ['biceps'],
  'triceps-press-machine': ['triceps'],
  'bench-dips': ['triceps', 'front-delts'],
  
  // Core
  'hanging-leg-raises': ['abs'],
  'front-planks': ['abs'],
  'side-planks': ['obliques']
};

export default function MuscleMap({ muscleGroup, exerciseId }: MuscleMapProps) {
  // Determine which sub-muscles to highlight
  const targets = exerciseId && exactMuscleTargets[exerciseId] 
    ? exactMuscleTargets[exerciseId] 
    : [muscleGroup.toLowerCase()]; // Fallback to broad group if exercise isn't mapped

  const isTargeted = (muscle: string) => targets.includes(muscle) ? '#a855f7' : '#3f3f46'; // Purple highlight, Gray default

  return (
    <div className="flex gap-4 items-center justify-center p-2">
      {/* FRONT BODY */}
      <svg width="60" height="120" viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
        <title>Front Muscles</title>
        {/* Head & Neck */}
        <circle cx="50" cy="20" r="12" fill="#27272a" />
        
        {/* Chest / Upper Chest */}
        <path d="M35,45 Q50,45 65,45 L65,60 Q50,65 35,60 Z" fill={isTargeted('chest') || isTargeted('upper-chest') ? '#a855f7' : '#3f3f46'} />
        
        {/* Abs */}
        <rect x="40" y="62" width="20" height="35" rx="5" fill={isTargeted('abs') ? '#a855f7' : '#3f3f46'} />
        <rect x="35" y="65" width="4" height="30" rx="2" fill={isTargeted('obliques') ? '#a855f7' : '#3f3f46'} />
        <rect x="61" y="65" width="4" height="30" rx="2" fill={isTargeted('obliques') ? '#a855f7' : '#3f3f46'} />

        {/* Front Delts / Side Delts */}
        <circle cx="30" cy="45" r="7" fill={isTargeted('front-delts') || isTargeted('side-delts') ? '#a855f7' : '#3f3f46'} />
        <circle cx="70" cy="45" r="7" fill={isTargeted('front-delts') || isTargeted('side-delts') ? '#a855f7' : '#3f3f46'} />

        {/* Biceps */}
        <ellipse cx="25" cy="65" rx="6" ry="12" fill={isTargeted('biceps') ? '#a855f7' : '#3f3f46'} />
        <ellipse cx="75" cy="65" rx="6" ry="12" fill={isTargeted('biceps') ? '#a855f7' : '#3f3f46'} />
        
        {/* Forearms */}
        <ellipse cx="20" cy="90" rx="4" ry="10" fill="#3f3f46" />
        <ellipse cx="80" cy="90" rx="4" ry="10" fill="#3f3f46" />

        {/* Quads (Thighs) */}
        <ellipse cx="40" cy="120" rx="9" ry="25" fill={isTargeted('quads') ? '#a855f7' : '#3f3f46'} />
        <ellipse cx="60" cy="120" rx="9" ry="25" fill={isTargeted('quads') ? '#a855f7' : '#3f3f46'} />

        {/* Calves (Front Shin) */}
        <ellipse cx="40" cy="165" rx="6" ry="18" fill="#3f3f46" />
        <ellipse cx="60" cy="165" rx="6" ry="18" fill="#3f3f46" />
      </svg>

      {/* BACK BODY */}
      <svg width="60" height="120" viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
        <title>Back Muscles</title>
        {/* Head & Neck */}
        <circle cx="50" cy="20" r="12" fill="#27272a" />
        
        {/* Traps */}
        <path d="M38,35 L50,45 L62,35 Z" fill={isTargeted('traps') ? '#a855f7' : '#3f3f46'} />
        
        {/* Lats */}
        <path d="M35,45 L50,90 L65,45 Q50,70 35,45 Z" fill={isTargeted('lats') ? '#a855f7' : '#3f3f46'} />

        {/* Rear Delts */}
        <circle cx="30" cy="45" r="7" fill={isTargeted('rear-delts') || isTargeted('side-delts') ? '#a855f7' : '#3f3f46'} />
        <circle cx="70" cy="45" r="7" fill={isTargeted('rear-delts') || isTargeted('side-delts') ? '#a855f7' : '#3f3f46'} />

        {/* Triceps */}
        <ellipse cx="25" cy="65" rx="6" ry="12" fill={isTargeted('triceps') ? '#a855f7' : '#3f3f46'} />
        <ellipse cx="75" cy="65" rx="6" ry="12" fill={isTargeted('triceps') ? '#a855f7' : '#3f3f46'} />

        {/* Forearms */}
        <ellipse cx="20" cy="90" rx="4" ry="10" fill="#3f3f46" />
        <ellipse cx="80" cy="90" rx="4" ry="10" fill="#3f3f46" />

        {/* Glutes */}
        <ellipse cx="40" cy="100" rx="10" ry="12" fill={isTargeted('glutes') ? '#a855f7' : '#3f3f46'} />
        <ellipse cx="60" cy="100" rx="10" ry="12" fill={isTargeted('glutes') ? '#a855f7' : '#3f3f46'} />

        {/* Hamstrings */}
        <ellipse cx="40" cy="125" rx="8" ry="20" fill={isTargeted('hamstrings') ? '#a855f7' : '#3f3f46'} />
        <ellipse cx="60" cy="125" rx="8" ry="20" fill={isTargeted('hamstrings') ? '#a855f7' : '#3f3f46'} />

        {/* Calves (Back) */}
        <ellipse cx="40" cy="165" rx="7" ry="15" fill={isTargeted('calves') ? '#a855f7' : '#3f3f46'} />
        <ellipse cx="60" cy="165" rx="7" ry="15" fill={isTargeted('calves') ? '#a855f7' : '#3f3f46'} />
      </svg>
    </div>
  );
}