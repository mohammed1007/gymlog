interface MuscleMapProps {
  muscleGroup: string;
  exerciseId?: string;
}

const exactMuscleTargets: Record<string, string[]> = {
  // Chest
  'machine-chest-press': ['chest', 'front-delts', 'triceps'],
  'incline-chest-press-machine': ['upper-chest', 'front-delts', 'triceps'],
  'machine-chest-fly': ['chest', 'upper-chest'],
  'dips': ['chest', 'triceps', 'front-delts'],
  'push-ups': ['chest', 'triceps', 'front-delts'],
  
  // Back
  'pull-ups': ['lats', 'biceps', 'rear-delts'],
  'chin-ups': ['lats', 'biceps'],
  'lat-pulldown-machine': ['lats', 'biceps'],
  'chest-supported-row-machine': ['lats', 'traps', 'rear-delts', 'biceps'],
  'seated-row-machine': ['lats', 'traps', 'rear-delts', 'biceps'],
  'inverted-rows': ['lats', 'traps', 'rear-delts', 'biceps'],
  'machine-back-extension': ['hamstrings', 'glutes'],
  
  // Legs
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
  'machine-biceps-curl': ['biceps'],
  'triceps-press-machine': ['triceps'],
  'machine-overhead-triceps-extension': ['triceps'],
  'bench-dips': ['triceps', 'front-delts'],
  
  // Core
  'ab-crunch-machine': ['abs'],
  'hanging-leg-raises': ['abs'],
  'front-planks': ['abs'],
  'side-planks': ['obliques']
};

export default function MuscleMap({ muscleGroup, exerciseId }: MuscleMapProps) {
  const targets = exerciseId && exactMuscleTargets[exerciseId] 
    ? exactMuscleTargets[exerciseId] 
    : [muscleGroup.toLowerCase()]; 

  const isTargeted = (...muscles: string[]) => muscles.some(m => targets.includes(m));
  const getFill = (...muscles: string[]) => isTargeted(...muscles) ? '#a855f7' : 'rgba(255,255,255,0.02)';
  const getStroke = (...muscles: string[]) => isTargeted(...muscles) ? '#d8b4fe' : 'rgba(255,255,255,0.1)';

  return (
    <div className="flex gap-4 items-center justify-center p-2">
      {/* FRONT BODY */}
      <svg width="60" height="120" viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
        <title>Front Muscles</title>
        <circle cx="50" cy="20" r="12" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        
        {/* Chest */}
        <path d="M35,45 Q50,45 65,45 L65,60 Q50,65 35,60 Z" fill={getFill('chest', 'upper-chest')} stroke={getStroke('chest', 'upper-chest')} strokeWidth="1" />
        
        {/* Abs */}
        <rect x="40" y="62" width="20" height="35" rx="5" fill={getFill('abs')} stroke={getStroke('abs')} strokeWidth="1" />
        <rect x="35" y="65" width="4" height="30" rx="2" fill={getFill('obliques')} stroke={getStroke('obliques')} strokeWidth="1" />
        <rect x="61" y="65" width="4" height="30" rx="2" fill={getFill('obliques')} stroke={getStroke('obliques')} strokeWidth="1" />

        {/* Delts */}
        <circle cx="30" cy="45" r="7" fill={getFill('front-delts', 'side-delts')} stroke={getStroke('front-delts', 'side-delts')} strokeWidth="1" />
        <circle cx="70" cy="45" r="7" fill={getFill('front-delts', 'side-delts')} stroke={getStroke('front-delts', 'side-delts')} strokeWidth="1" />

        {/* Biceps */}
        <ellipse cx="25" cy="65" rx="6" ry="12" fill={getFill('biceps')} stroke={getStroke('biceps')} strokeWidth="1" />
        <ellipse cx="75" cy="65" rx="6" ry="12" fill={getFill('biceps')} stroke={getStroke('biceps')} strokeWidth="1" />
        
        {/* Forearms */}
        <ellipse cx="20" cy="90" rx="4" ry="10" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <ellipse cx="80" cy="90" rx="4" ry="10" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

        {/* Quads */}
        <ellipse cx="40" cy="120" rx="9" ry="25" fill={getFill('quads')} stroke={getStroke('quads')} strokeWidth="1" />
        <ellipse cx="60" cy="120" rx="9" ry="25" fill={getFill('quads')} stroke={getStroke('quads')} strokeWidth="1" />

        {/* Calves (Front Shin) */}
        <ellipse cx="40" cy="165" rx="6" ry="18" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <ellipse cx="60" cy="165" rx="6" ry="18" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      </svg>

      {/* BACK BODY */}
      <svg width="60" height="120" viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
        <title>Back Muscles</title>
        <circle cx="50" cy="20" r="12" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        
        {/* Traps */}
        <path d="M38,35 L50,45 L62,35 Z" fill={getFill('traps')} stroke={getStroke('traps')} strokeWidth="1" />
        
        {/* Lats */}
        <path d="M35,45 L50,90 L65,45 Q50,70 35,45 Z" fill={getFill('lats')} stroke={getStroke('lats')} strokeWidth="1" />

        {/* Rear Delts */}
        <circle cx="30" cy="45" r="7" fill={getFill('rear-delts', 'side-delts')} stroke={getStroke('rear-delts', 'side-delts')} strokeWidth="1" />
        <circle cx="70" cy="45" r="7" fill={getFill('rear-delts', 'side-delts')} stroke={getStroke('rear-delts', 'side-delts')} strokeWidth="1" />

        {/* Triceps */}
        <ellipse cx="25" cy="65" rx="6" ry="12" fill={getFill('triceps')} stroke={getStroke('triceps')} strokeWidth="1" />
        <ellipse cx="75" cy="65" rx="6" ry="12" fill={getFill('triceps')} stroke={getStroke('triceps')} strokeWidth="1" />

        {/* Forearms */}
        <ellipse cx="20" cy="90" rx="4" ry="10" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <ellipse cx="80" cy="90" rx="4" ry="10" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

        {/* Glutes */}
        <ellipse cx="40" cy="100" rx="10" ry="12" fill={getFill('glutes')} stroke={getStroke('glutes')} strokeWidth="1" />
        <ellipse cx="60" cy="100" rx="10" ry="12" fill={getFill('glutes')} stroke={getStroke('glutes')} strokeWidth="1" />

        {/* Hamstrings */}
        <ellipse cx="40" cy="125" rx="8" ry="20" fill={getFill('hamstrings')} stroke={getStroke('hamstrings')} strokeWidth="1" />
        <ellipse cx="60" cy="125" rx="8" ry="20" fill={getFill('hamstrings')} stroke={getStroke('hamstrings')} strokeWidth="1" />

        {/* Calves (Back) */}
        <ellipse cx="40" cy="165" rx="7" ry="15" fill={getFill('calves')} stroke={getStroke('calves')} strokeWidth="1" />
        <ellipse cx="60" cy="165" rx="7" ry="15" fill={getFill('calves')} stroke={getStroke('calves')} strokeWidth="1" />
      </svg>
    </div>
  );
}