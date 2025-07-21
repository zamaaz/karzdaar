import { DebtDetailScreen } from '@/src/screens';
import { useLocalSearchParams } from 'expo-router';

export default function DebtDetail() {
  const { id } = useLocalSearchParams();
  
  return <DebtDetailScreen debtId={id as string} />;
}
