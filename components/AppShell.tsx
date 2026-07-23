"use client";

import type { ReactNode } from "react";

import { BrandMark } from "@/components/BrandMark";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getMektepDictionary } from "@/lib/products/mektep/i18n";
import { useI18n } from "@/lib/tynys/i18n/provider";

type AppShellProps = Readonly<{
  children: ReactNode;
}>;

export function AppShell({ children }: AppShellProps) {
  const { dictionary, locale } = useI18n();
  const productDictionary = getMektepDictionary(locale);
  const riskLevels = [
    { code: "LOW", label: dictionary.levels.low, level: "low" },
    {
      code: "ELEVATED",
      label: dictionary.levels.elevated,
      level: "elevated",
    },
    { code: "HIGH", label: dictionary.levels.high, level: "high" },
    {
      code: "EXTREME",
      label: dictionary.levels.extreme,
      level: "extreme",
    },
  ] as const;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        {productDictionary.shell.skipLink}
      </a>

      <header className="site-header">
        <div className="site-container site-header__inner">
          <BrandMark ariaLabel={productDictionary.shell.brandHomeLabel} />
          <p className="site-header__context">
            {productDictionary.shell.context}
            <span>{productDictionary.shell.contextStrong}</span>
          </p>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="site-main" id="main-content" tabIndex={-1}>
        {children}
      </main>

      <footer className="site-footer">
        <div className="site-container site-footer__inner">
          <div className="site-footer__statement">
            <p className="site-footer__brand">TYNYS</p>
            <p>{productDictionary.shell.footerStatement}</p>
          </div>

          <section
            className="risk-legend"
            aria-labelledby="risk-legend-title"
          >
            <h2 id="risk-legend-title">
              {productDictionary.shell.riskLegendTitle}
            </h2>
            <ul role="list">
              {riskLevels.map(({ code, label, level }) => (
                <li data-risk={level} key={level} role="listitem">
                  <span className="risk-legend__marker" aria-hidden="true" />
                  <span className="risk-legend__label">{label}</span>
                  <span className="risk-legend__code">{code}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </footer>
    </div>
  );
}
