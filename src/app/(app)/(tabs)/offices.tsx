import { PhasePlaceholder } from '@/components/phase-placeholder';
import { useLanguage } from '@/providers/language-provider';

export default function OfficesScreen() {
  const { t } = useLanguage();
  return <PhasePlaceholder title={t('offices')} />;
}
