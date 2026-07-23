import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { dictionaries, getDictionary } from "@/lib/tynys/i18n/dictionaries";
import {
  LOCALE_STORAGE_KEY,
  persistLocale,
  readStoredLocale,
  resolveInitialLocale,
} from "@/lib/tynys/i18n/locale";
import {
  I18nProvider,
  useI18n,
} from "@/lib/tynys/i18n/provider";
import type { LocaleStorage } from "@/lib/tynys/i18n/types";

function dictionaryKeys(value: object, prefix = ""): string[] {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof child === "object" && child !== null
      ? dictionaryKeys(child as object, path)
      : [path];
  });
}

function createMemoryStorage(): LocaleStorage {
  const values = new Map<string, string>();

  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
}

describe("typed dictionaries", () => {
  it("keeps Kazakh and Russian dictionaries at exact key parity", () => {
    expect(dictionaryKeys(dictionaries.ru)).toEqual(
      dictionaryKeys(dictionaries.kk),
    );
  });

  it("returns the requested dictionary without a language-only feature gap", () => {
    expect(getDictionary("kk").common.kazakhShort).toBe("ҚАЗ");
    expect(getDictionary("ru").common.russianShort).toBe("РУС");
    expect(getDictionary("kk").levels.extreme).not.toBe("");
    expect(getDictionary("ru").levels.extreme).not.toBe("");
  });
});

describe("initial locale resolution", () => {
  it("prioritizes a saved choice over browser languages", () => {
    expect(
      resolveInitialLocale({
        savedLocale: "ru",
        browserLanguages: ["kk-KZ"],
      }),
    ).toBe("ru");
  });

  it("uses the first supported browser language", () => {
    expect(
      resolveInitialLocale({
        savedLocale: null,
        browserLanguages: ["en-US", "RU-ru", "kk-KZ"],
      }),
    ).toBe("ru");
  });

  it("falls back to Kazakh for unsupported or malformed values", () => {
    expect(
      resolveInitialLocale({
        savedLocale: "not-a-locale",
        browserLanguages: ["en-US", "", "de-DE"],
      }),
    ).toBe("kk");
  });
});

describe("locale persistence", () => {
  it("restores an in-place selection on the next initialization", () => {
    const storage = createMemoryStorage();

    expect(persistLocale(storage, "ru")).toBe(true);
    expect(storage.getItem(LOCALE_STORAGE_KEY)).toBe("ru");
    expect(readStoredLocale(storage)).toBe("ru");
    expect(
      resolveInitialLocale({
        savedLocale: readStoredLocale(storage),
        browserLanguages: ["kk-KZ"],
      }),
    ).toBe("ru");
  });

  it("ignores unavailable browser storage without breaking the fallback", () => {
    const unavailableStorage: LocaleStorage = {
      getItem() {
        throw new DOMException("Blocked", "SecurityError");
      },
      setItem() {
        throw new DOMException("Blocked", "SecurityError");
      },
    };

    expect(readStoredLocale(unavailableStorage)).toBeNull();
    expect(persistLocale(unavailableStorage, "ru")).toBe(false);
    expect(
      resolveInitialLocale({
        savedLocale: readStoredLocale(unavailableStorage),
        browserLanguages: ["unsupported"],
      }),
    ).toBe("kk");
  });
});

describe("I18nProvider", () => {
  it("provides a hydration-safe Kazakh default and an in-place setter", () => {
    function LocaleProbe() {
      const { dictionary, locale, setLocale } = useI18n();

      return createElement(
        "span",
        { "data-locale": locale, "data-setter": typeof setLocale },
        dictionary.levels.low,
      );
    }

    const html = renderToStaticMarkup(
      createElement(
        I18nProvider,
        null,
        createElement(LocaleProbe),
      ),
    );

    expect(html).toContain('data-locale="kk"');
    expect(html).toContain('data-setter="function"');
    expect(html).toContain("Төмен");
  });

  it("fails clearly when the hook is used outside the provider", () => {
    function MissingProviderProbe() {
      useI18n();
      return null;
    }

    expect(() =>
      renderToStaticMarkup(createElement(MissingProviderProbe)),
    ).toThrow("useI18n must be used within I18nProvider");
  });
});
