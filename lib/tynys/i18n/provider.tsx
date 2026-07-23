"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

import { getDictionary } from "@/lib/tynys/i18n/dictionaries";
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_STORAGE_KEY,
  persistLocale,
  readStoredLocale,
  resolveInitialLocale,
} from "@/lib/tynys/i18n/locale";
import type {
  Dictionary,
  Locale,
  LocaleStorage,
} from "@/lib/tynys/i18n/types";

interface I18nContextValue {
  locale: Locale;
  dictionary: Dictionary;
  setLocale: (locale: Locale) => void;
}

interface I18nProviderProps {
  children: ReactNode;
}

const I18nContext = createContext<I18nContextValue | null>(null);
const LOCALE_CHANGE_EVENT = "tynys:locale-change";

let volatileLocale: Locale | null = null;

function getBrowserStorage(): LocaleStorage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function getBrowserLocale(): Locale {
  if (volatileLocale) {
    return volatileLocale;
  }

  const browserLanguages =
    navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language];

  return resolveInitialLocale({
    savedLocale: readStoredLocale(getBrowserStorage()),
    browserLanguages,
  });
}

function getServerLocale(): Locale {
  return DEFAULT_LOCALE;
}

function subscribeToLocale(onStoreChange: () => void): () => void {
  function handleStorage(event: StorageEvent) {
    if (event.key === LOCALE_STORAGE_KEY) {
      volatileLocale = isLocale(event.newValue) ? event.newValue : null;
      onStoreChange();
    }
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(LOCALE_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(LOCALE_CHANGE_EVENT, onStoreChange);
  };
}

function updateLocale(nextLocale: Locale): void {
  volatileLocale = nextLocale;
  persistLocale(getBrowserStorage(), nextLocale);
  document.documentElement.lang = nextLocale;
  window.dispatchEvent(new Event(LOCALE_CHANGE_EVENT));
}

export function I18nProvider({ children }: I18nProviderProps) {
  const locale = useSyncExternalStore(
    subscribeToLocale,
    getBrowserLocale,
    getServerLocale,
  );

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      dictionary: getDictionary(locale),
      setLocale: updateLocale,
    }),
    [locale],
  );

  return <I18nContext value={value}>{children}</I18nContext>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
