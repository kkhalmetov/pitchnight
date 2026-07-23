import {
  SUPPORTED_LOCALES,
  type Locale,
  type LocaleStorage,
} from "@/lib/tynys/i18n/types";

export const DEFAULT_LOCALE: Locale = "kk";
export const LOCALE_STORAGE_KEY = "tynys.locale";

interface ResolveInitialLocaleInput {
  savedLocale: string | null;
  browserLanguages: readonly string[];
}

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" &&
    SUPPORTED_LOCALES.includes(value as Locale)
  );
}

function localeFromLanguageTag(languageTag: string): Locale | null {
  const baseLanguage = languageTag.trim().toLowerCase().split(/[-_]/)[0];
  return isLocale(baseLanguage) ? baseLanguage : null;
}

export function resolveInitialLocale({
  savedLocale,
  browserLanguages,
}: ResolveInitialLocaleInput): Locale {
  const savedChoice =
    savedLocale === null ? null : localeFromLanguageTag(savedLocale);
  if (savedChoice) {
    return savedChoice;
  }

  for (const languageTag of browserLanguages) {
    const browserLocale = localeFromLanguageTag(languageTag);
    if (browserLocale) {
      return browserLocale;
    }
  }

  return DEFAULT_LOCALE;
}

export function readStoredLocale(storage: LocaleStorage | null): Locale | null {
  if (!storage) {
    return null;
  }

  try {
    const storedLocale = storage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(storedLocale) ? storedLocale : null;
  } catch {
    return null;
  }
}

export function persistLocale(
  storage: LocaleStorage | null,
  locale: Locale,
): boolean {
  if (!storage) {
    return false;
  }

  try {
    storage.setItem(LOCALE_STORAGE_KEY, locale);
    return true;
  } catch {
    return false;
  }
}
