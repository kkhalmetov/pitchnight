# Task Checklist: TYNYS / TYNYS Mektep MVP

Источник требований: `docs/spec.md`.
Порядок задач обязателен, кроме явно отмеченных возможностей параллельной работы.

## Working Agreement

- Сначала тест для нового доменного поведения, затем реализация.
- Каждый task заканчивается своей verification и атомарным коммитом.
- Не более пяти намеренно изменяемых файлов на task; generated lock/type files
  не считаются самостоятельной логикой.
- На checkpoint выполняется полный `npm run verify`.
- Продуктовые формулировки не заявляют медицинский эффект, пользователей или
  problem validation.

## Task 1: Bootstrap minimal deployable shell

**Description:** Зафиксировать версии, команды и минимальный Next.js App Router
shell, который уже можно собрать на Vercel, но который ещё не содержит продуктовой
логики.

**Acceptance criteria:**

- [x] Dependencies и scripts из spec закреплены в `package.json` и lockfile.
- [x] TypeScript strict включён; `/` рендерит минимальную семантическую страницу.
- [x] Проект не требует env, базы или API-ключей для build.

**Verification:**

- [x] `npm install`
- [x] `npm run typecheck`
- [x] `npm run build`

**Dependencies:** None.

**Files likely touched:**

- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `app/layout.tsx`
- `app/page.tsx`

**Estimated scope:** Medium, 5 files plus framework-generated type metadata.

## Task 2: Establish the TYNYS visual shell

**Description:** Добавить responsive visual foundation бренда TYNYS: базовую
типографику, климатические цветовые токены, container/grid правила, focus styles
и простой app shell без stock/AI-шаблонной эстетики.

**Acceptance criteria:**

- [x] Layout имеет единый header/main/footer и корректную семантику.
- [x] Design tokens поддерживают risk levels без зависимости только от цвета.
- [x] Страница не имеет горизонтального скролла на 360 px и 1440 px.

**Verification:**

- [x] `npm run build`
- [x] Manual check: 360×800, 768×1024 и 1440×900.
- [x] Manual check: видимый keyboard focus и `prefers-reduced-motion`.

**Dependencies:** Task 1.

**Files likely touched:**

- `app/globals.css`
- `postcss.config.mjs`
- `app/layout.tsx`
- `components/AppShell.tsx`
- `components/BrandMark.tsx`

**Estimated scope:** Medium, 5 files.

## Task 3: Add the verification harness

**Description:** Настроить lint, unit/integration и browser smoke tests так,
чтобы дальнейшие vertical slices имели одинаковую локальную quality gate.

**Acceptance criteria:**

- [x] `lint`, `typecheck`, `test`, `test:coverage`, `test:e2e`, `build`, `verify`
  являются исполняемыми scripts.
- [x] Unit smoke test и Playwright smoke test проходят на минимальном shell.
- [x] `verify` останавливается при сбое любого обязательного шага.

**Verification:**

- [x] `npm run lint`
- [x] `npm run test`
- [x] `npm run test:e2e -- e2e/smoke.spec.ts`
- [x] `npm run verify`

**Dependencies:** Tasks 1–2.

**Files likely touched:**

- `eslint.config.mjs`
- `vitest.config.ts`
- `playwright.config.ts`
- `tests/smoke.test.ts`
- `e2e/smoke.spec.ts`

**Estimated scope:** Medium, 5 files.

## Checkpoint A

- [x] `npm run verify`
- [x] Fresh-install build documented in commit notes.
- [x] No secrets or untracked build output.

## Task 4: Define the environment contract and dated snapshot

**Description:** Test-first определить provider-independent contract
`EnvironmentHour`, Zod-схемы входных provider-ответов и проверенный локальный
snapshot для воспроизводимого demo.

**Acceptance criteria:**

- [x] Contract содержит time, temperature, apparent temperature, UV, PM2.5,
  US AQI, source и fetched timestamp.
- [x] Valid fixtures принимаются, malformed/partial payloads отклоняются.
- [x] Snapshot имеет дату, provenance и минимум 48 последовательных часов.

**Verification:**

- [x] `npm run test -- tests/environment-schema.test.ts`
- [x] `npm run typecheck`
- [x] Manual check: snapshot явно помечен как historical demo data.

**Dependencies:** Task 3.

**Files likely touched:**

- `lib/tynys/environment/types.ts`
- `lib/tynys/environment/schema.ts`
- `data/environment-snapshot.json`
- `tests/environment-schema.test.ts`

**Estimated scope:** Medium, 4 files.

## Task 5: Deliver live environment API with fallback

**Description:** Реализовать `/api/environment`, который параллельно получает
Weather/Air Quality data, нормализует их, кеширует результат и автоматически
возвращает snapshot при timeout, network error или schema error.

**Acceptance criteria:**

- [ ] Live success возвращает 48 часов в contract Task 4 со статусом `live`.
- [ ] Timeout/malformed provider response возвращает тот же contract со статусом
  `snapshot` и объясняющим warning.
- [ ] Endpoint не принимает произвольный URL и не раскрывает внутренние ошибки.

**Verification:**

- [ ] `npm run test -- tests/environment-route.test.ts`
- [ ] `npm run typecheck`
- [ ] Manual check: live request и принудительный fallback имеют HTTP 200 и
  различимые source labels.

**Dependencies:** Task 4.

**Files likely touched:**

- `lib/tynys/environment/client.ts`
- `lib/tynys/environment/fallback.ts`
- `app/api/environment/route.ts`
- `tests/environment-route.test.ts`

**Estimated scope:** Medium, 4 files.

## Task 6: Build the transparent exposure engine

**Description:** Test-first реализовать чистый TYNYS exposure engine, уровни
`low/elevated/high/extreme`, component breakdown и документированную формулу без
медицинских утверждений.

**Acceptance criteria:**

- [ ] Score детерминирован, ограничен 0–100 и показывает вклад heat/UV/AQI.
- [ ] Ухудшение одного input при фиксированных остальных не уменьшает score.
- [ ] Методология объясняет веса, пороги, единицы, ограничения и source links.

**Verification:**

- [ ] `npm run test:coverage -- tests/exposure.test.ts`
- [ ] Branch coverage `lib/tynys/exposure` ≥ 90%.
- [ ] Manual language review: только «индекс», «модель» и «поддержка решения».

**Dependencies:** Task 4.

**Files likely touched:**

- `lib/tynys/exposure/types.ts`
- `lib/tynys/exposure/index.ts`
- `tests/exposure.test.ts`
- `docs/methodology.md`

**Estimated scope:** Medium, 4 files.

## Checkpoint B

- [ ] `npm run verify`
- [ ] Live and snapshot contracts match.
- [ ] Forced provider failure still yields usable 48-hour data.
- [ ] Exposure coverage and monotonicity requirements pass.

## Task 7: Add typed Kazakh/Russian localization

**Description:** Создать dependency-light i18n core с типизированными словарями,
browser-locale detection, `kk` fallback и client switch, который сохраняет выбор
без аккаунта.

**Acceptance criteria:**

- [ ] `kk` и `ru` dictionaries имеют одинаковый типизированный набор ключей.
- [ ] Initial locale: saved choice → browser language → `kk`.
- [ ] Locale может меняться in-place, а выбранное значение переживает reload.

**Verification:**

- [ ] `npm run test -- tests/i18n.test.ts`
- [ ] `npm run typecheck`
- [ ] Manual check: unsupported browser locale открывает `kk`.

**Dependencies:** Task 3.

**Files likely touched:**

- `lib/tynys/i18n/types.ts`
- `lib/tynys/i18n/dictionaries/kk.ts`
- `lib/tynys/i18n/dictionaries/ru.ts`
- `lib/tynys/i18n/provider.tsx`
- `tests/i18n.test.ts`

**Estimated scope:** Medium, 5 files.

## Task 8: Ship the bilingual evidence-first landing

**Description:** Собрать первый видимый vertical slice: локальная проблема,
официальные факты, source links, TYNYS/TYNYS Mektep brand hierarchy и CTA к demo
на обоих языках.

**Acceptance criteria:**

- [ ] Landing показывает четыре утверждённых факта с годом и рабочей ссылкой.
- [ ] Весь текст, CTA, source labels и ARIA доступны на `kk` и `ru`.
- [ ] Language switch меняет страницу без reload; CTA переводит к `#demo`.

**Verification:**

- [ ] `npm run build`
- [ ] Manual check: обе локали и все четыре source links.
- [ ] Manual check: landing читаем на 360 px и projector viewport.

**Dependencies:** Tasks 2 and 7.

**Files likely touched:**

- `app/page.tsx`
- `features/landing/EvidenceHero.tsx`
- `features/landing/EvidenceGrid.tsx`
- `components/LanguageSwitcher.tsx`
- `app/globals.css`

**Estimated scope:** Medium, 5 files.

## Task 9: Build the deterministic Mektep optimizer

**Description:** Test-first реализовать школьный adapter: demo schedule, его
ограничения и поиск перестановки, минимизирующей modeled exposure уличных занятий.

**Acceptance criteria:**

- [ ] Demo day содержит ≥5 занятий и ≥2 outdoor lessons.
- [ ] Optimizer сохраняет занятия, длительность и тип; результат воспроизводим.
- [ ] Если улучшение невозможно, возвращается явная indoor recommendation.

**Verification:**

- [ ] `npm run test:coverage -- tests/optimizer.test.ts`
- [ ] Branch coverage `lib/products/mektep` ≥ 90%.
- [ ] Manual check: default hot-day fixture даёт ненулевое улучшение.

**Dependencies:** Tasks 6–7.

**Files likely touched:**

- `lib/products/mektep/types.ts`
- `lib/products/mektep/optimizer.ts`
- `data/demo-schedule.ts`
- `tests/optimizer.test.ts`

**Estimated scope:** Medium, 4 files.

## Checkpoint C

- [ ] `npm run verify`
- [ ] Landing parity verified on `kk` and `ru`.
- [ ] Optimizer constraints and no-safe-window branch pass.
- [ ] Shared `lib/tynys` imports no `mektep` types.

## Task 10: Show the environmental timeline

**Description:** Подключить demo shell к `/api/environment` и показать
accessible 48-hour timeline, current conditions, risk components, source/time
labels и переключение `Demo scenario / Live`.

**Acceptance criteria:**

- [ ] Loading, live, snapshot, stale and recoverable error states понятны.
- [ ] Timeline имеет visual и текстовый эквивалент, source и fetched timestamp.
- [ ] Переключение режима не маскирует происхождение данных.

**Verification:**

- [ ] `npm run build`
- [ ] Manual check: live и forced snapshot path на `kk` и `ru`.
- [ ] Manual check: timeline понятен без различения цветов.

**Dependencies:** Tasks 5–8.

**Files likely touched:**

- `features/mektep/DemoShell.tsx`
- `features/mektep/EnvironmentTimeline.tsx`
- `features/mektep/useEnvironment.ts`
- `components/SourceBadge.tsx`
- `app/page.tsx`

**Estimated scope:** Medium, 5 files.

## Task 11: Deliver interactive schedule optimization

**Description:** Завершить основной product loop: исходное расписание, выбор
дня/режима, одна optimize action, объяснимое before/after сравнение и reset.

**Acceptance criteria:**

- [ ] Default path за ≤2 действия показывает risky slot и лучшее расписание.
- [ ] Delta использует `score × students × durationMinutes` и помечен как model.
- [ ] Locale switch сохраняет выбранный режим и optimization result; reset
  возвращает исходное состояние.

**Verification:**

- [ ] `npm run test`
- [ ] `npm run build`
- [ ] Manual rehearsal: полный path ≤45 секунд на `kk` и `ru`.

**Dependencies:** Tasks 9–10.

**Files likely touched:**

- `features/mektep/DemoShell.tsx`
- `features/mektep/ScheduleBoard.tsx`
- `features/mektep/OptimizationSummary.tsx`
- `components/RiskBadge.tsx`
- `lib/products/mektep/presentation.ts`

**Estimated scope:** Medium, 5 files.

## Task 12: Harden accessibility and responsive states

**Description:** Провести product UI pass для keyboard flow, focus, contrast,
reduced motion, 360/768/1440 layouts и degraded-state clarity.

**Acceptance criteria:**

- [ ] Все actions достижимы клавиатурой с логичным focus order.
- [ ] Risk имеет icon/text label; charts имеют screen-reader description.
- [ ] Нет horizontal scroll или перекрытий на целевых viewports.

**Verification:**

- [ ] `npm run build`
- [ ] Manual keyboard-only path on `kk` and `ru`.
- [ ] Manual 360×800, 768×1024, 1440×900 and reduced-motion review.

**Dependencies:** Task 11.

**Files likely touched:**

- `features/mektep/DemoShell.tsx`
- `features/mektep/EnvironmentTimeline.tsx`
- `features/mektep/ScheduleBoard.tsx`
- `components/AccessibleChartDescription.tsx`
- `app/globals.css`

**Estimated scope:** Medium, 5 files.

## Checkpoint D

- [ ] `npm run verify`
- [ ] CTA → optimize → reset passes on keyboard.
- [ ] Offline/snapshot demo remains complete.
- [ ] Main flow fits mobile and projector viewports.

## Task 13: Cover production journeys in Playwright

**Description:** Автоматизировать критические product paths: обе локали,
сохранение state, fallback, keyboard controls и responsive smoke.

**Acceptance criteria:**

- [ ] Happy path проходит отдельно на `kk` и `ru`.
- [ ] API failure test доказывает complete snapshot demo.
- [ ] Tests проверяют locale state, reset, 360 px and 1440 px layouts и console.

**Verification:**

- [ ] `npm run test:e2e`
- [ ] Повторный запуск suite проходит без flaky retries.
- [ ] `npm run verify`

**Dependencies:** Tasks 3 and 12.

**Files likely touched:**

- `e2e/demo.spec.ts`
- `e2e/locales.spec.ts`
- `e2e/fallback.spec.ts`
- `playwright.config.ts`

**Estimated scope:** Medium, 4 files.

## Task 14: Finish technical documentation and attribution

**Description:** Сделать репозиторий воспроизводимым и честным: setup,
архитектура TYNYS/Mektep, data flow, источники, лицензии, методология и
ограничения модели.

**Acceptance criteria:**

- [ ] README содержит команды, architecture summary, demo modes и no-env setup.
- [ ] Все live/snapshot/fact источники и требуемые атрибуции перечислены.
- [ ] Документация ограничена продуктовым и техническим содержанием.

**Verification:**

- [ ] Fresh-reader check: README достаточно для install/run/test/build.
- [ ] Manual link check for every source and provider policy.
- [ ] `npm run verify`

**Dependencies:** Tasks 5–8 and 13.

**Files likely touched:**

- `README.md`
- `docs/data-sources.md`
- `docs/methodology.md`

**Estimated scope:** Medium, 3 files.

## Task 15: Verify and release the exact production commit

**Description:** Завершить production readiness, зафиксировать чистый SHA в
GitHub, связать Vercel Hobby, развернуть именно этот source state и проверить
production user journey.

**Acceptance criteria:**

- [ ] Full local gate и Lighthouse targets из spec выполнены.
- [ ] GitHub `main` clean; deployed Vercel build соответствует записанному SHA.
- [ ] Production проходит `kk`/`ru`, live и forced-fallback desktop/mobile smoke.

**Verification:**

- [ ] `npm run verify`
- [ ] `npm run test:e2e`
- [ ] `git status --short --branch`
- [ ] `git push origin main`
- [ ] `vercel deploy --prod`
- [ ] Manual production smoke and Lighthouse evidence recorded.

**Dependencies:** Tasks 12–14.

**Files likely touched:**

- `README.md` (stable production URL only)
- external Vercel project configuration; `.vercel/` remains ignored.

**Estimated scope:** Small, 1 tracked file plus deployment state.

## Checkpoint E

- [ ] Every task acceptance criterion is checked.
- [ ] `npm run verify` and `npm run test:e2e` pass from a clean tree.
- [ ] All spec Success Criteria have evidence.
- [ ] GitHub and production SHAs match.
- [ ] Production URL is ready for user handoff.
