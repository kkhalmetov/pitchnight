export const SUPPORTED_LOCALES = ["kk", "ru"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export interface Dictionary {
  common: {
    localeSwitcherLabel: string;
    kazakhShort: string;
    russianShort: string;
  };
  levels: {
    low: string;
    elevated: string;
    high: string;
    extreme: string;
  };
}

export interface LocaleStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
