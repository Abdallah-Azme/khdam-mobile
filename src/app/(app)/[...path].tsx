import { PhasePlaceholder } from '@/components/phase-placeholder';
import { useLocalSearchParams } from 'expo-router';

export default function AppPlaceholder() {
  const { path } = useLocalSearchParams<{ path: string[] }>();
  return <PhasePlaceholder title={path?.join(' / ') ?? 'Khadam'} />;
}
