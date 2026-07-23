"use client";

import { DemoIntro } from "@/features/landing/DemoIntro";
import { EvidenceGrid } from "@/features/landing/EvidenceGrid";
import { EvidenceHero } from "@/features/landing/EvidenceHero";
import { getMektepDictionary } from "@/lib/products/mektep/i18n";
import { useI18n } from "@/lib/tynys/i18n/provider";

export default function HomePage() {
  const { locale } = useI18n();
  const dictionary = getMektepDictionary(locale);

  return (
    <>
      <EvidenceHero copy={dictionary.hero} />
      <EvidenceGrid copy={dictionary.evidence} />
      <DemoIntro copy={dictionary.demo} />
    </>
  );
}
