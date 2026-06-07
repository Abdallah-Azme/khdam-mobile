import { storageKeys } from '@/services/storage/keys';
import { preferenceStorage } from '@/services/storage/preference-storage';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type Language = 'en' | 'ar';

const messages = {
  en: {
    appName: 'Khadam',
    migrationInProgress: 'Native migration in progress',
    signIn: 'Sign in',
    phone: 'Phone number',
    email: 'Email address',
    password: 'Password',
    countryId: 'Country ID',
    phoneLogin: 'Phone',
    emailLogin: 'Email',
    loginFailed: 'Unable to sign in',
    developmentAccess: 'Development access',
    continueAsSeeker: 'Continue as seeker',
    continueAsOffice: 'Continue as office',
    signOut: 'Sign out',
    home: 'Home',
    favorites: 'Favorites',
    offices: 'Offices',
    myAds: 'My Ads',
    subscriptions: 'Subscriptions',
    profile: 'Profile',
  },
  ar: {
    appName: 'خدم',
    migrationInProgress: 'جاري نقل التطبيق إلى النسخة الأصلية',
    signIn: 'تسجيل الدخول',
    phone: 'رقم الهاتف',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    countryId: 'رمز الدولة',
    phoneLogin: 'الهاتف',
    emailLogin: 'البريد',
    loginFailed: 'تعذر تسجيل الدخول',
    developmentAccess: 'دخول التطوير',
    continueAsSeeker: 'المتابعة كباحث',
    continueAsOffice: 'المتابعة كمكتب',
    signOut: 'تسجيل الخروج',
    home: 'الرئيسية',
    favorites: 'المفضلة',
    offices: 'المكاتب',
    myAds: 'إعلاناتي',
    subscriptions: 'الاشتراكات',
    profile: 'الملف الشخصي',
  },
} as const;

type MessageKey = keyof (typeof messages)['en'];

type LanguageContextValue = {
  language: Language;
  isRtl: boolean;
  setLanguage: (language: Language) => Promise<void>;
  t: (key: MessageKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<Language>('ar');

  useEffect(() => {
    preferenceStorage.get(storageKeys.language).then((stored) => {
      if (stored === 'en' || stored === 'ar') setLanguageState(stored);
    });
  }, []);

  const setLanguage = async (nextLanguage: Language) => {
    await preferenceStorage.set(storageKeys.language, nextLanguage);
    setLanguageState(nextLanguage);
  };

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      isRtl: language === 'ar',
      setLanguage,
      t: (key) => messages[language][key] ?? key,
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLanguage must be used within LanguageProvider');
  return value;
}
