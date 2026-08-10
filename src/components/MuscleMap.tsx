import Model from 'react-body-highlighter';

interface MuscleMapProps {
  muscleGroup: string;
}

export default function MuscleMap({ muscleGroup }: MuscleMapProps) {
  // FIX: Changed return type from string[] to any[] to bypass the strict Muscle[] check
  const getMuscles = (group: string): any[] => {
    switch (group.toLowerCase()) {
      case 'chest': return ['chest'];
      case 'back': return ['upper-back', 'lower-back'];
      case 'legs': return ['quadriceps', 'hamstring', 'calves', 'gluteal'];
      case 'shoulders': return ['front-deltoids', 'back-deltoids'];
      case 'arms': return ['biceps', 'triceps', 'forearm'];
      case 'core': return ['abs', 'obliques'];
      default: return [];
    }
  };

  const muscles = getMuscles(muscleGroup);

  // If we map to back muscles, we flip the vector to show the back of the body
  const isBack = muscleGroup.toLowerCase() === 'back';

  const data = [
    {
      name: 'Target',
      muscles: muscles,
      frequency: 1
    }
  ];

  return (
    <div className="w-12 h-16 flex items-center justify-center opacity-80 mix-blend-screen drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]">
      <Model
        data={data}
        style={{ width: '3rem', padding: 0 }}
        type={isBack ? 'posterior' : 'anterior'}
        highlightedColors={['#60a5fa']} // Tailwind blue-400 for that neon glow
        bodyColor="#ffffff10" // Faint frosted glass white for the un-highlighted body
      />
    </div>
  );
}