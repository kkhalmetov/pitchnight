import type { ReactNode } from "react";

import { BrandMark } from "@/components/BrandMark";

type AppShellProps = Readonly<{
  children: ReactNode;
}>;

const RISK_LEVELS = [
  { code: "LOW", label: "Төмен", level: "low" },
  { code: "ELEVATED", label: "Назар", level: "elevated" },
  { code: "HIGH", label: "Жоғары", level: "high" },
  { code: "EXTREME", label: "Шекті", level: "extreme" },
] as const;

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Негізгі мазмұнға өту
      </a>

      <header className="site-header">
        <div className="site-container site-header__inner">
          <BrandMark />
          <p className="site-header__context">
            Білім беру ортасына арналған
            <span>климаттық шешімдер жүйесі</span>
          </p>
        </div>
      </header>

      <main className="site-main" id="main-content" tabIndex={-1}>
        {children}
      </main>

      <footer className="site-footer">
        <div className="site-container site-footer__inner">
          <div className="site-footer__statement">
            <p className="site-footer__brand">TYNYS</p>
            <p>Дерек көрінеді. Шешім түсіндіріледі.</p>
          </div>

          <section
            className="risk-legend"
            aria-labelledby="risk-legend-title"
          >
            <h2 id="risk-legend-title">Индекс деңгейлері</h2>
            <ul role="list">
              {RISK_LEVELS.map(({ code, label, level }) => (
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
