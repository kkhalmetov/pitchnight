import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { EvidenceGrid } from "@/features/landing/EvidenceGrid";
import { EvidenceHero } from "@/features/landing/EvidenceHero";
import {
  LANDING_FACTS,
  getMektepDictionary,
} from "@/lib/products/mektep/i18n";
import type { Locale } from "@/lib/tynys/i18n/types";

const LOCALES: Locale[] = ["kk", "ru"];

describe("TYNYS Mektep landing contract", () => {
  it("keeps the four approved official facts canonical", () => {
    expect(LANDING_FACTS).toHaveLength(4);
    expect(LANDING_FACTS.map(({ value }) => value)).toEqual([
      "302",
      "276 466",
      "43,7 °C",
      "28,8",
    ]);
    expect(LANDING_FACTS.every(({ year, sourceUrl }) => year && sourceUrl))
      .toBe(true);
  });

  it.each(LOCALES)("renders all evidence and source links in %s", (locale) => {
    const dictionary = getMektepDictionary(locale);
    const html = renderToStaticMarkup(
      createElement(EvidenceGrid, {
        copy: dictionary.evidence,
      }),
    );

    expect(html.match(/class="evidence-card"/g) ?? []).toHaveLength(4);
    expect(html.match(/class="evidence-card__source"/g) ?? []).toHaveLength(4);
    expect(html).toContain("2025–2026");
    expect(html).toContain("2025");
    expect(html).toContain("302");
    expect(html).toContain("276 466");
    expect(html).toContain("43,7");
    expect(html).toContain("28,8");
    expect(html).toContain(dictionary.evidence.sourceLabel);
  });

  it.each(LOCALES)("renders the brand hierarchy and demo CTA in %s", (locale) => {
    const dictionary = getMektepDictionary(locale);
    const html = renderToStaticMarkup(
      createElement(EvidenceHero, { copy: dictionary.hero }),
    );

    expect(html).toContain("TYNYS");
    expect(html).toContain("TYNYS Mektep");
    expect(html).toContain(dictionary.hero.title);
    expect(html).toContain(`href="#demo"`);
    expect(html).toContain(dictionary.hero.cta);
  });

  it("keeps Kazakh and Russian product dictionaries structurally aligned", () => {
    const kazakh = getMektepDictionary("kk");
    const russian = getMektepDictionary("ru");

    expect(Object.keys(kazakh)).toEqual(Object.keys(russian));
    expect(Object.keys(kazakh.evidence.items)).toEqual(
      Object.keys(russian.evidence.items),
    );
  });
});
