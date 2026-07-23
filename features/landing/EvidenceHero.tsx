import type { MektepDictionary } from "@/lib/products/mektep/i18n";

interface EvidenceHeroProps {
  copy: MektepDictionary["hero"];
}

export function EvidenceHero({ copy }: EvidenceHeroProps) {
  return (
    <section className="landing-hero" aria-labelledby="page-title">
      <div className="site-container landing-hero__grid">
        <div className="landing-hero__copy">
          <p className="landing-overline">
            <span>TYNYS</span>
            {copy.overline}
          </p>
          <h1 id="page-title">{copy.title}</h1>
          <p className="landing-hero__lead">{copy.lead}</p>
          <a className="primary-cta" href="#demo">
            {copy.cta}
            <span aria-hidden="true">↓</span>
          </a>
        </div>

        <aside className="premise-panel" aria-label={copy.flowAriaLabel}>
          <div className="premise-panel__heading">
            <p>{copy.premiseLabel}</p>
            <strong>{copy.productLabel}</strong>
          </div>
          <ol className="signal-flow" role="list">
            <li>
              <span>01</span>
              <div>
                <strong>{copy.signalTitle}</strong>
                <small>{copy.signalNote}</small>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>{copy.modelTitle}</strong>
                <small>{copy.modelNote}</small>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>{copy.decisionTitle}</strong>
                <small>{copy.decisionNote}</small>
              </div>
            </li>
          </ol>
        </aside>
      </div>
    </section>
  );
}
