import type { MektepDictionary } from "@/lib/products/mektep/i18n";

interface DemoIntroProps {
  copy: MektepDictionary["demo"];
}

export function DemoIntro({ copy }: DemoIntroProps) {
  return (
    <section className="demo-intro" id="demo" aria-labelledby="demo-title">
      <div className="site-container demo-intro__grid">
        <div className="section-heading section-heading--light">
          <p className="landing-overline">{copy.overline}</p>
          <h2 id="demo-title">{copy.title}</h2>
          <p>{copy.intro}</p>
        </div>
        <div>
          <ol className="demo-steps" aria-label={copy.stepsAriaLabel}>
            {copy.steps.map((step) => (
              <li key={step.number}>
                <span>{step.number}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.note}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="demo-intro__note">{copy.note}</p>
        </div>
      </div>
    </section>
  );
}
