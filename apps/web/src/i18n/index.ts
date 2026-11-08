import i18next, { type i18n } from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/common.json';
import it from './locales/it/common.json';

export const SUPPORTED_LOCALES = ['en', 'it'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_STORAGE_KEY = 'locale';

export const resources = {
  en: { common: en },
  it: { common: it },
} as const;

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/** A stored choice wins; otherwise the browser language when it is Italian; otherwise English. */
export function detectLocale(
  storage: Pick<Storage, 'getItem'> | null,
  browserLanguage?: string | undefined,
): Locale {
  try {
    const stored = storage?.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    // storage blocked
  }
  const short = browserLanguage?.slice(0, 2).toLowerCase();
  if (isLocale(short)) return short;
  return DEFAULT_LOCALE;
}

export function createI18n(lng: Locale = DEFAULT_LOCALE): i18n {
  const instance = i18next.createInstance();
  void instance.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: DEFAULT_LOCALE,
    defaultNS: 'common',
    ns: ['common'],
    interpolation: { escapeValue: false },
    returnNull: false,
  });
  return instance;
}

export function applyLocale(
  instance: i18n,
  locale: Locale,
  storage: Pick<Storage, 'setItem'> | null,
) {
  void instance.changeLanguage(locale);
  try {
    storage?.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // storage blocked
  }
  if (typeof document !== 'undefined') document.documentElement.lang = locale;
}
