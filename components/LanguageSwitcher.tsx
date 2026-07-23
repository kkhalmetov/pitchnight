"use client";

import { useI18n } from "@/lib/tynys/i18n/provider";
import type { Locale } from "@/lib/tynys/i18n/types";

const OPTIONS: ReadonlyArray<{ locale: Locale; longLabel: string }> = [
  { locale: "kk", longLabel: "Қазақша" },
  { locale: "ru", longLabel: "Русский" },
];

export function LanguageSwitcher() {
  const { dictionary, locale, setLocale } = useI18n();

  return (
    <div
      className="language-switcher"
      role="group"
      aria-label={dictionary.common.localeSwitcherLabel}
    >
      {OPTIONS.map((option) => (
        <button
          aria-label={option.longLabel}
          aria-pressed={locale === option.locale}
          key={option.locale}
          onClick={() => setLocale(option.locale)}
          type="button"
        >
          {option.locale === "kk"
            ? dictionary.common.kazakhShort
            : dictionary.common.russianShort}
        </button>
      ))}
    </div>
  );
}
