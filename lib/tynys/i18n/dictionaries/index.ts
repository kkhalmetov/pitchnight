import { kk } from "@/lib/tynys/i18n/dictionaries/kk";
import { ru } from "@/lib/tynys/i18n/dictionaries/ru";
import type { Dictionary, Locale } from "@/lib/tynys/i18n/types";

export const dictionaries = {
  kk,
  ru,
} satisfies Record<Locale, Dictionary>;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
