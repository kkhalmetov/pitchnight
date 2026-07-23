export default function HomePage() {
  return (
    <div className="site-container foundation-page">
      <section className="foundation-intro" aria-labelledby="page-title">
        <div className="foundation-intro__copy">
          <p className="eyebrow">
            <span aria-hidden="true">02</span>
            TYNYS Mektep · MVP
          </p>
          <h1 id="page-title">Климатты ескеретін оқу күні.</h1>
          <p className="foundation-intro__lead">
            Жылу, ультракүлгін және ауа сапасы туралы деректерді мектеп
            кестесімен бір түсінікті шешімде байланыстыратын сервис.
          </p>

          <ol
            className="decision-path"
            aria-label="TYNYS шешім қабылдау жолы"
            role="list"
          >
            <li role="listitem">
              <span>01</span>
              <strong>Дерек</strong>
              <small>орта жағдайы</small>
            </li>
            <li role="listitem">
              <span>02</span>
              <strong>Бағалау</strong>
              <small>ашық индекс</small>
            </li>
            <li role="listitem">
              <span>03</span>
              <strong>Әрекет</strong>
              <small>кесте шешімі</small>
            </li>
          </ol>
        </div>

        <aside className="climate-field" aria-label="TYNYS климаттық дерек қабаты">
          <div className="climate-field__graphic" aria-hidden="true">
            <span className="climate-field__sun" />
            <span className="climate-field__line climate-field__line--one" />
            <span className="climate-field__line climate-field__line--two" />
            <span className="climate-field__line climate-field__line--three" />
            <span className="climate-field__monogram">T</span>
          </div>

          <div className="climate-field__caption">
            <p>Климаттық дерек қабаты</p>
            <ul role="list">
              <li>Жылу</li>
              <li>Ультракүлгін</li>
              <li>Ауа</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}
