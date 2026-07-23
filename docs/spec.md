# Spec: TYNYS / TYNYS Mektep

Статус: **редакция 2, черновик для утверждения**
Дата: 24 июля 2026 года

## Assumptions

1. Это публичное адаптивное веб-приложение для демонстрации с ноутбука и телефона.
2. Главная цель MVP — убедительное product demo, а не полная школьная ERP.
3. Работающий продукт и честная data validation заменяют отсутствующую
   пользовательскую валидацию; тракшн не выдумывается.
4. Используются только бесплатные сервисы. База и авторизация MVP не нужны,
   поэтому Supabase не подключается.
5. Пользовательский интерфейс с первого релиза полностью доступен на казахском и
   русском языках.
6. В результат входят продукт, исходный код и техническая документация.

## Objective

Создать **TYNYS Mektep** — первый продукт бренда **TYNYS**, climate-safety
copilot для школ жарких городов.

Пользователь: директор, завуч или администратор частной школы. Он открывает
расписание на сегодня/завтра и видит, какие уличные занятия попадают в часы
высокой жары, УФ или загрязнения воздуха. TYNYS предлагает безопасный перенос или
замену на занятие в помещении и показывает изменение прозрачного индекса
экспозиции.

Product thesis:

> Обычное расписание знает учителя и кабинет, но не знает погоду. TYNYS добавляет
> климат как ограничение и перестраивает школьный день до того, как дети выйдут
> на жару.

### Архитектура бренда

- **TYNYS** — зонтичный бренд и общая технологическая платформа климатической
  безопасности для образовательных организаций.
- **TYNYS Mektep** — первый продукт и единственный vertical MVP: школьное
  расписание и климатическая экспозиция учеников.
- Общие модули получения environmental data, расчёта индекса, объяснения решений
  и локализации не содержат школьных терминов.
- Школьные сущности, ограничения расписания и тексты живут в отдельном
  product-модуле `mektep`.
- После проверки школьного MVP платформа сможет поддерживать колледжи,
  университеты, детские сады и другие образовательные учреждения без переписывания
  общего climate engine. Эти вертикали не входят в текущий MVP.

### Основная пользовательская история

1. Администратор выбирает демонстрационную школу и день.
2. Видит почасовую ленту температуры «ощущается как», УФ и AQI.
3. Видит уличное занятие в красном окне.
4. Нажимает «Сделать день безопаснее».
5. Система переносит/меняет местами занятие с более безопасным окном, объясняет
   причину и показывает снижение **смоделированной**, а не медицинской,
   экспозиции.

## Scope

### В MVP

- публичный landing с локальной проблемой, официальными цифрами и продуктовой
  гипотезой;
- live-прогноз Шымкента на 48 часов: apparent temperature, УФ, PM2.5/AQI;
- датированный локальный snapshot на случай недоступности внешнего API;
- один безотказный demo-сценарий школьного расписания;
- детерминированный оптимизатор одного школьного дня;
- сравнение «до / после», объяснение решения и confidence/source labels;
- список источников и методика индекса;
- mobile/desktop responsive UI на казахском и русском языках;
- README и техническая документация.

### Не в MVP

- медицинская диагностика или гарантии предотвращения вреда;
- реальные персональные данные детей, учителей или школьные аккаунты;
- интеграции с Kundelik/1C/внутренними школьными системами;
- полная генерация расписания для всех классов и кабинетов;
- push/SMS-уведомления;
- платёжная система;
- собственная ML-модель или ложный AI-лейбл;
- Supabase, пока не появятся пользователи, auth или сохраняемые школы.
- продукты для колледжей, университетов, детских садов и иных образовательных
  учреждений; MVP реализует только `TYNYS Mektep`.

## Functional requirements

### FR-1. Evidence-first landing

- Показать официальные факты: 302 школы, 276 466 учеников, июльский максимум
  43,7 °C, 28,8 тыс. тонн стационарных выбросов.
- У каждой цифры есть ссылка на источник и год.
- CTA «Проверить школьный день» ведёт к интерактивному демо.

### FR-2. Environmental timeline

- Серверный endpoint объединяет Open-Meteo Weather и Air Quality API.
- Для каждого часа доступны: temperature, apparent temperature, UV, PM2.5,
  US AQI, источник и timestamp.
- При ошибке или timeout используется локальный snapshot с заметной меткой
  «Демо-данные за [дата]».

### FR-3. Transparent exposure index

- Индекс 0–100 строится из нормализованных компонентов жары, УФ и AQI.
- Формула и веса находятся в коде, документированы в UI и покрыты unit-тестами.
- У результата есть уровень `low / elevated / high / extreme`.
- Термины: «индекс TYNYS», «смоделированная экспозиция», «поддержка решения».
  Запрещены «безопасно на 100%», «предотвратили заболевание» и диагнозы.

### FR-4. Schedule optimizer

- Demo day содержит минимум пять занятий, из них минимум два уличных.
- Оптимизатор ищет более низкорисковое окно в пределах школьного дня.
- Он не меняет продолжительность, число занятий и обязательный indoor/outdoor
  тип без явной рекомендации.
- Результат показывает перемещённые занятия, причину, исходный и новый индекс,
  а также изменение `exposure-points × число учеников × минуты`.
- Если приемлемого окна нет, система рекомендует помещение вместо фиктивного
  «безопасного» времени.

### FR-5. Надёжный demo-сценарий

- Основной сценарий завершается за 30–45 секунд и требует не более двух кликов.
- Все внешние запросы имеют timeout и fallback.
- Приложение не зависит от входа, API-ключей или базы.
- В UI есть кнопка «Сбросить демо».

### FR-6. Accessibility and responsive behavior

- Полная работа с клавиатуры, видимый focus, семантические headings/controls.
- Контраст текста соответствует WCAG AA.
- У графиков есть текстовый эквивалент; цвет не является единственным носителем
  риска.
- Поддерживаются 360 px, 768 px и 1440 px без горизонтального скролла.
- `prefers-reduced-motion` отключает необязательные анимации.

### FR-7. Казахско-русская локализация

- Все пользовательские строки, навигация, единицы, состояния загрузки/ошибки,
  fallback labels, metadata и ARIA labels доступны на `kk` и `ru`.
- Первый визит выбирает `kk` или `ru` по языку браузера; при отсутствии
  совпадения используется казахский.
- В header всегда виден переключатель `ҚАЗ / РУС`; выбор сохраняется локально и
  не требует аккаунта.
- Обе версии функционально равны: ни одна функция или источник не доступен только
  на одном языке.
- Словари типизированы и проверяются тестом на одинаковый набор ключей.

## Tech Stack

- Node.js 22 LTS или версия, поддерживаемая Vercel для Next.js 16.
- Next.js 16.2.11, App Router.
- React 19.2.8.
- TypeScript 7.0.2, strict mode.
- Tailwind CSS 4.3.3.
- Zod — runtime-валидация внешних API.
- Vitest 4.1.10 — unit/integration tests.
- Playwright 1.61.1 — end-to-end и responsive smoke tests.
- Vercel Hobby — hosting и serverless route handlers.
- Open-Meteo Weather/Air Quality — бесплатные live-данные без ключа для MVP.
- Локальный JSON snapshot — демонстрационный fallback.

Архитектурное решение: без базы. Supabase добавляется только после появления
сохраняемых школ, пользователей или пилота.

Архитектурное решение по продуктовой линейке: shared-модули выпускаются внутри
приложения под namespace `tynys`, а школьные сценарии — под `products/mektep`.
Это сохраняет узкий MVP, но не связывает весь бренд со школами.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run test:e2e
npm run build
npm run verify
vercel deploy --prod
```

`npm run verify` обязан последовательно выполнить lint, typecheck, unit tests и
production build.

## Project Structure

```text
app/                         Next.js routes, layout, page and API endpoint
components/                  shared bilingual UI primitives
features/mektep/             school demo, schedule and product-specific UI
lib/tynys/environment/       shared Open-Meteo client, schema and fallback
lib/tynys/exposure/          shared index formula, levels and explanations
lib/tynys/i18n/              typed kk/ru dictionaries and locale helpers
lib/products/mektep/         school constraints and deterministic optimizer
data/                        dated fallback snapshot and demo schedule
tests/                       unit and integration tests
e2e/                         Playwright demo and responsive tests
docs/                        research, spec, methodology and product docs
public/                      static brand assets only
tasks/                       approved implementation plan and task checklist
```

## Code Style

- TypeScript strict; no `any` in application code.
- Pure domain functions, I/O at module boundaries.
- `camelCase` values/functions, `PascalCase` React components/types,
  `SCREAMING_SNAKE_CASE` true constants.
- Domain units appear in names (`durationMinutes`, `pm25Micrograms`).
- External data is parsed before use; errors become typed fallback states.

```ts
export function calculateExposure(input: ExposureInput): ExposureResult {
  const components = normalizeEnvironment(input.environment);
  const score = weightedMean(components, EXPOSURE_WEIGHTS);

  return {
    score: Math.round(score),
    level: exposureLevel(score),
    source: input.environment.source,
    confidence: input.environment.source === "live" ? "medium" : "demo",
  };
}
```

## Testing Strategy

### Unit

- граничные значения heat/UV/AQI;
- монотонность: ухудшение одного фактора не уменьшает индекс;
- оптимизатор сохраняет длительность и количество занятий;
- отсутствие приемлемого окна даёт indoor-рекомендацию;
- одинаковый input даёт одинаковый output.

Цель: 90% branch coverage для `lib/exposure` и `lib/schedule`.

### Integration

- корректный ответ Open-Meteo преобразуется в доменную модель;
- malformed/timeout response включает snapshot;
- API route всегда возвращает timestamp, source и status.
- словари `kk` и `ru` содержат одинаковый набор ключей.

### E2E

- CTA → demo → optimize → видимое сравнение «до / после»;
- полный happy path отдельно на казахском и русском;
- переключение языка сохраняет состояние текущего demo;
- клавиатурный happy path;
- 360×800 и 1440×900;
- fallback demo без сети;
- отсутствие console errors и broken links в основном сценарии.

### Manual

- Chrome/Edge/Safari mobile emulation;
- slow 4G и отключённая сеть;
- экран проектора 16:9;
- репетиция демо не дольше 45 секунд.

## Boundaries

### Always

- запускать `npm run verify` до каждого продуктового коммита;
- показывать источник, дату и статус live/snapshot для внешних данных;
- валидировать внешние ответы;
- сохранять безотказный fallback;
- маркировать бизнес- и impact-цифры как факт, модель или гипотезу;
- соблюдать атрибуцию данных.

### Ask first

- подключение платного сервиса;
- добавление базы, auth или сбора персональных данных;
- расширение текущего MVP за пределы продукта `TYNYS Mektep`;
- публикация выдуманного пилота, LOI, пользователя или метрики.

### Never

- коммитить секреты и `.env*`;
- собирать данные детей;
- выдавать индекс за медицинскую рекомендацию;
- скрывать использование snapshot;
- заявлять problem validation, которой не было;
- удалять failing tests ради зелёной сборки.

## Success Criteria

1. Публичный URL открывается без авторизации и даёт интерактивный результат.
2. Demo preset за не более чем два действия показывает проблемный слот, перенос
   и численное изменение смоделированной экспозиции.
3. Live API используется при доступности; отключение сети не ломает demo.
4. Все публичные числа имеют источник и корректную квалификацию
   `fact / model / hypothesis`.
5. `npm run verify` и `npm run test:e2e` завершаются успешно.
6. Lighthouse targets на production: Performance ≥ 85, Accessibility ≥ 95,
   Best Practices ≥ 95 для desktop demo path.
7. Нет горизонтального скролла на 360 px; основной demo умещается в понятную
   последовательность на телефоне и проекторе.
8. Репозиторий GitHub содержит README, research, spec, methodology, тесты и
   воспроизводимые команды.
9. Казахская и русская версии имеют одинаковую функциональность, а переключение
   языка не сбрасывает состояние demo.
10. Общий climate engine не импортирует школьные типы и может быть повторно
    использован будущими продуктами TYNYS.
11. Production задеплоен на Vercel Hobby; commit SHA в GitHub соответствует
    задеплоенной версии.

## Open Questions

1. Подтверждает ли основатель архитектуру **TYNYS** как бренда и платформы,
   **TYNYS Mektep** как первого продукта и школы как единственный сегмент MVP?
