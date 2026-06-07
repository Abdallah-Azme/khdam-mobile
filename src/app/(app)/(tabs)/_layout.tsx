import { useLanguage } from '@/providers/language-provider';
import { useUserRole } from '@/providers/user-role-provider';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  const { role } = useUserRole();
  const { t } = useLanguage();
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: t('home') }} />
      <Tabs.Screen name="favorites" options={{ title: t('favorites'), href: role === 'seeker' ? undefined : null }} />
      <Tabs.Screen name="offices" options={{ title: t('offices'), href: role === 'seeker' ? undefined : null }} />
      <Tabs.Screen name="my-ads" options={{ title: t('myAds'), href: role === 'office' ? undefined : null }} />
      <Tabs.Screen name="subscriptions" options={{ title: t('subscriptions'), href: role === 'office' ? undefined : null }} />
      <Tabs.Screen name="profile" options={{ title: t('profile') }} />
    </Tabs>
  );
}
