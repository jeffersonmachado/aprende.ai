import { Progress } from '../ui/index.js';

export default function JourneyProgressBar({ progress }) {
  return <Progress value={progress} max={100} tone="xp" showValue className="mb-4" />;
}
