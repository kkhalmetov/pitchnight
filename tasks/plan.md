# Implementation Plan: TYNYS / TYNYS Mektep MVP

Статус: **утверждён 24 июля 2026 года**
Основание: `docs/spec.md`, утверждена 24 июля 2026 года.

## Overview

Создать и развернуть двуязычный (`kk`/`ru`) веб-MVP `TYNYS Mektep`: сервис
климатической поддержки решений для школ, который объединяет прогноз жары, УФ и
качества воздуха, рассчитывает прозрачный индекс экспозиции и предлагает
детерминированную перестановку уличного занятия в менее рискованное окно.

План сохраняет `TYNYS` как общую платформу: environmental data, exposure engine
и локализация не зависят от школьных типов; школьное расписание и оптимизатор
изолированы в продукте `mektep`.

## Definition of Done

Задача считается завершённой только когда:

- выполнены её acceptance criteria и verification;
- новые доменные правила сначала покрыты тестами;
- внешние данные валидируются и имеют явный `live`/`snapshot` статус;
- `npm run verify` остаётся зелёным на каждом checkpoint;
- изменения не содержат секретов, персональных данных или неподтверждённых
  медицинских/traction-заявлений;
- завершённый инкремент зафиксирован отдельным атомарным коммитом.

Проект считается завершённым после выполнения всех Success Criteria из
`docs/spec.md`, production smoke test и подтверждения, что Vercel обслуживает
точный commit SHA из GitHub.

## Architecture Decisions

1. **Без базы и auth.** MVP не сохраняет школы или персональные данные, поэтому
   Supabase не нужен.
2. **Shared core + product adapter.** `lib/tynys/*` содержит provider-agnostic
   climate engine; `lib/products/mektep/*` содержит только школьные ограничения.
3. **Один server endpoint.** `/api/environment` параллельно запрашивает Weather
   и Air Quality API, проверяет ответы через Zod, нормализует их в один контракт
   и возвращает snapshot при timeout или ошибке.
4. **Два честных режима.** `Live` показывает текущие 48 часов; основной
   `Demo scenario` использует датированный жаркий snapshot, чтобы эффект
   оптимизации был воспроизводимым в любую погоду. Режим всегда виден пользователю.
5. **Не медицинская модель.** Exposure index — детерминированный индекс поддержки
   решений с открытой формулой, источниками и confidence labels.
6. **Локализация без отдельного backend.** Типизированные словари `kk` и `ru`
   работают через client locale context. Первый язык определяется по браузеру,
   fallback — `kk`; переключение происходит без навигации и не сбрасывает demo.
7. **Минимум UI-зависимостей.** Tailwind и семантические React-компоненты;
   графики строятся доступным HTML/SVG без тяжёлой chart-библиотеки.
8. **Fail-safe deployment.** Внешний API никогда не является единственной
   зависимостью demo; snapshot входит в репозиторий и production bundle.

## Data Flow

```text
Open-Meteo Weather ─┐
                    ├─> /api/environment ─> Zod ─> EnvironmentHour[]
Open-Meteo AQI ─────┘             │
                                  └─> dated snapshot on failure

EnvironmentHour[] ─> TYNYS exposure engine ─> ExposureResult[]
                                              │
Demo schedule ─> Mektep optimizer <───────────┘
                         │
                         └─> before/after + explanation + modeled delta

Typed kk/ru dictionaries ─> every visible string and ARIA label
```

## Dependency Graph

```text
T1 Bootstrap
 └─> T2 Visual shell
      └─> T3 Verification harness
           ├─> T4 Environment contract ─> T5 Live API + fallback
           │                         └───> T6 Exposure engine
           └─> T7 i18n core ────────────> T8 Evidence landing

T6 + T7 ─> T9 Mektep optimizer
T5 + T6 + T7 + T8 ─> T10 Environment timeline
T9 + T10 ─> T11 Interactive optimization
T11 ─> T12 Accessibility/responsive hardening
T3 + T12 ─> T13 E2E suite
T5 + T6 + T7 + T8 ─> T14 Documentation
T12 + T13 + T14 ─> T15 Production release
```

## Task List

Полные acceptance criteria, команды проверки и файлы приведены в
`tasks/todo.md`.

### Phase 1: Reproducible foundation

- [x] Task 1: Bootstrap a minimal deployable Next.js shell.
- [x] Task 2: Establish the TYNYS visual shell and responsive tokens.
- [x] Task 3: Add lint, unit, build and browser verification harness.

### Checkpoint A: Foundation

- [x] `npm run verify` проходит в чистом checkout.
- [x] Минимальная страница запускается и production build собирается.
- [x] Unit и browser smoke tests выполняются локально.

### Phase 2: Trusted climate core

- [ ] Task 4: Define and test the normalized environment contract and snapshot.
- [ ] Task 5: Deliver the live `/api/environment` path with automatic fallback.
- [ ] Task 6: Build the transparent exposure engine and methodology.

### Checkpoint B: Data and model

- [ ] Live и snapshot ответы имеют один проверенный контракт.
- [ ] Отказ внешней сети не ломает endpoint.
- [ ] Exposure engine проходит boundary и monotonicity tests с нужным coverage.

### Phase 3: Product foundations

- [ ] Task 7: Add typed Kazakh/Russian localization infrastructure.
- [ ] Task 8: Ship the bilingual evidence-first landing slice.
- [ ] Task 9: Build and test the deterministic Mektep optimizer.

### Checkpoint C: Product skeleton

- [ ] Landing полностью доступен на `kk` и `ru`, источники открываются.
- [ ] Locale switch не требует перезагрузки.
- [ ] Оптимизатор сохраняет расписание и даёт воспроизводимый результат.

### Phase 4: End-to-end demo

- [ ] Task 10: Show the live/snapshot environmental timeline.
- [ ] Task 11: Deliver interactive before/after schedule optimization.
- [ ] Task 12: Harden accessibility, responsive behavior and degraded states.

### Checkpoint D: Core user journey

- [ ] CTA → demo → optimize → reset работает за не более чем два действия.
- [ ] Источник и время данных видны во всех состояниях.
- [ ] Основной путь работает клавиатурой на 360 px и 1440 px.

### Phase 5: Release confidence

- [ ] Task 13: Cover bilingual, fallback and responsive journeys in Playwright.
- [ ] Task 14: Finish reproducibility, methodology and attribution docs.
- [ ] Task 15: Verify, push and deploy the exact production commit to Vercel.

### Checkpoint E: Complete

- [ ] `npm run verify` и `npm run test:e2e` проходят.
- [ ] Все project Success Criteria отмечены доказательствами.
- [ ] GitHub `main` чистый и соответствует production SHA.
- [ ] Production URL проходит desktop/mobile smoke test.
- [ ] План готов к итоговому review.

## Verification Strategy

| Layer | Primary proof |
|---|---|
| Domain | Vitest unit tests for schema, exposure and optimizer |
| Integration | Route tests for success, malformed data, timeout and fallback |
| UI | Playwright flows in `kk` and `ru`, keyboard and viewport checks |
| Reliability | Forced network failure still completes demo from snapshot |
| Accessibility | Semantic/keyboard review, contrast, reduced motion, text equivalents |
| Release | `npm run verify`, production build, Vercel smoke and SHA comparison |

## Requirements Traceability

| Spec requirement | Delivery tasks | Final evidence |
|---|---|---|
| FR-1 Evidence-first landing | T7–T8 | Bilingual landing, cited facts and working CTA |
| FR-2 Environmental timeline | T4–T5, T10 | Validated 48-hour live/snapshot contract and UI |
| FR-3 Exposure index | T6, T10–T11, T14 | Unit coverage, component breakdown and methodology |
| FR-4 Schedule optimizer | T9, T11 | Constraint tests and before/after product loop |
| FR-5 Reliable demo | T4–T5, T10–T13 | Reproducible snapshot and fallback E2E |
| FR-6 Accessibility/responsive | T2, T10–T13 | Keyboard and target-viewport evidence |
| FR-7 Kazakh/Russian parity | T7–T8, T10–T13 | Dictionary parity and two-locale E2E |
| Repository/release criteria | T3, T14–T15 | Reproducible commands, GitHub SHA and Vercel smoke |

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Open-Meteo unavailable or slow during demo | High | Short timeout, server cache, bundled dated snapshot, visible source badge |
| Live weather is not risky enough to show optimization | High | Default reproducible hot-day scenario plus optional clearly labelled Live mode |
| AQI global resolution suggests false school-level precision | High | Present it as city-level forecast, show confidence/source and avoid map-level claims |
| Exposure index is read as medical advice | High | Neutral terminology, methodology page, disclaimer and no health-outcome claims |
| Optimizer appears to be a full timetable ERP | Medium | Limit scope to one demo day and document preserved constraints/non-goals |
| Kazakh and Russian versions drift | Medium | Typed dictionaries, key-parity test and E2E happy path in both locales |
| Next.js/TypeScript version incompatibility | Medium | Pin versions and lockfile in Task 1; fail fast with build before feature work |
| UI becomes too dense for a short demo | Medium | One primary CTA, progressive detail and a 30–45 second rehearsal checkpoint |
| Vercel cannot reach live provider | Medium | Production route smoke test and the same server-side snapshot fallback |

## Parallelization Opportunities

Implementation is safe sequentially on `main`. If future work is explicitly
delegated, these groups may run in short-lived isolated branches after their
contracts are frozen:

- after Task 4: Task 6 (exposure engine) and Task 7 (i18n) are independent;
- after Task 6: Task 8 (landing) and Task 9 (optimizer) are independent;
- after Task 12: Task 13 (E2E) and Task 14 (documentation) are independent.

Tasks 1–5, 10–12 and 15 remain sequential because they share build, API or
interactive state contracts.

## Open Questions

- Нет блокирующих продуктовых вопросов. Перед реализацией требуется только
  утверждение этого плана.
