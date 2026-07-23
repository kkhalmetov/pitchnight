import {
  LANDING_FACTS,
  type MektepDictionary,
} from "@/lib/products/mektep/i18n";

interface EvidenceGridProps {
  copy: MektepDictionary["evidence"];
}

function displayValue(
  fact: (typeof LANDING_FACTS)[number],
  suffix?: string,
): string {
  if (fact.id !== "emissions") {
    return fact.value;
  }

  return `${fact.value} ${suffix ?? ""}`.trim();
}

export function EvidenceGrid({ copy }: EvidenceGridProps) {
  return (
    <section className="evidence-section" aria-labelledby="evidence-title">
      <div className="site-container">
        <div className="section-heading">
          <p className="landing-overline">{copy.overline}</p>
          <h2 id="evidence-title">{copy.title}</h2>
          <p>{copy.intro}</p>
        </div>

        <ul className="evidence-grid" role="list">
          {LANDING_FACTS.map((fact, index) => {
            const item = copy.items[fact.id];

            return (
              <li className="evidence-card" key={fact.id}>
                <div className="evidence-card__index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <p className="evidence-card__value">
                  {displayValue(fact, item.valueSuffix)}
                </p>
                <h3>{item.label}</h3>
                <p className="evidence-card__note">{item.note}</p>
                <div className="evidence-card__meta">
                  <time>{fact.year}</time>
                  <a
                    className="evidence-card__source"
                    href={fact.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${copy.sourceAriaPrefix} ${item.source}`}
                  >
                    <span>{copy.sourceLabel}</span>
                    {item.source}
                    <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
