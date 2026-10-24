# Study app build specification

Applies to dataset version 1.0.0 (as of 23 October 2026) from the Security Testing and Cybersecurity Study Hub.
Use it to build a study web app on top of `security-hub-data.json`. It is written so that a developer, or an AI coding assistant, can build and test the app without reading the hub first.

## 1. Purpose, users and scope

A QA engineer wants to learn security testing and cybersecurity, with ISTQB CT-STE and CT-SEC preparation as one of four tracks. The app turns the dataset into a self-paced study tool: a roadmap, short modules, flashcards with spaced repetition, practice questions, a timed exam simulator, a glossary, a security test-case library and reference tables.

In scope: a client-only app that loads the dataset, stores progress on the device and works offline after the first load.
Out of scope: accounts, servers, official exam questions, any attack tooling, and anything that tests systems the learner does not own.

Assumptions (state them to the product owner before building):

- One learner per browser profile; no sign-in. Progress is private to that browser.
- English (en-GB) is the reference language; Ukrainian, Polish, Spanish and German are available as AI-assisted translations (section 13). The dataset uses British spelling except for the technical term "authorization" (access control); "authorisation" with an s means permission to test.
- The dataset is the single source of truth. The app never edits it.
- Facts marked `verify: true` are shown with a visible "check this" marker.

## 2. Inputs

| File | Use |
| --- | --- |
| `security-hub-data.json` | The dataset (pretty-printed). `security-hub-data.min.json` is the same data for shipping. |
| `security-hub-data.schema.json` | JSON Schema (draft 2020-12). Validate on build, and optionally at load. |
| `validate_dataset.py`, `test_validator.py` | Referential and quality checks, and negative tests for them. Run in CI. |
| `*.md`, `*.csv`, `flashcards-anki.tsv` | Ready-made exports for reading, import into test tools and into Anki. |

Load the JSON once at start. Reject it with a clear message if `meta.datasetVersion` has a different major version than the app supports.

## 3. Data model

All collections are arrays of records with a stable string `id`. Never use array position as an identifier.

| Collection | Key fields | Notes |
| --- | --- | --- |
| `topics` (14) | `id`, `name`, `sections[]`, `scope`, `module` | The spine: every other record points at a topic. |
| `tracks` (4) | `id`, `name`, `topics[]` | QA to security testing; ISTQB exam prep; broad cybersecurity; AppSec and DevSecOps. |
| `roadmap.stages` (6) | `id`, `name`, `hours`, `focus`, `gate`, `topics[]` | Stage 5 has `hours: null` (ongoing). `roadmap.totalHours` sums the rest. |
| `roadmap.specialisations` (5) | `id`, `name`, `topics[]`, `portfolioProject` | Choose one after stage 3. |
| `certifications` (9) | `name`, `stage`, `fits`, `notes`, `verify` | `verify` true when the hub did not check the entry. |
| `modules` (14) | `topic`, `title`, `estimatedMinutes`, `objectives[{k,text}]`, `keyPoints[]`, `practice[]` | One per topic. |
| `glossary` (226) | `term`, `definition`, `topic`, `verify` | Sort case-insensitively. |
| `flashcards` (207) | `q`, `a`, `topic`, `difficulty` 1 to 3, `core`, `verify` | `core` = four per topic. |
| `questions` (126) | `stem`, `options[4]`, `answer` (index), `explanation`, `k`, `topic`, `core`, `verify` | Options are already shuffled; the answer index is correct for the stored order. Do not reshuffle without recomputing it. |
| `testcases` (46) | `id`, `group`, `feature`, `type`, `test`, `expected`, `refs[]` | Types: positive, negative, boundary, exploratory. |
| `tools` (17), `labs` (17), `resources` (32) | see schema | Resources always carry an HTTPS URL. A lab's `url` may be `null` (15 of 17 labs in v1.0.0 have no stored address because it was not re-checked): render the lab name as plain text and, if you like, offer a web-search link. Open every link with `rel="noopener noreferrer"`. |
| `reference` (19 tables) | `columns[{key,label}]`, `rows[]` | Render generically; OWASP Top 10:2025, API Top 10:2023, LLM Top 10:2025, WSTG and others. |
| `exams` | `questions`, `points`, `passPoints`, `minutes` | Profiles `ct-ste` and `ct-sec`. |

Relationships: `topics[].module` -> `modules[].id`; every record with a `topic` field points at `topics[].id`; `roadmap.stages[].topics`, `tracks[].topics` and `specialisations[].topics` list topic ids; `labs[].sections` are hub section numbers.

## 4. Functional requirements

Each requirement has acceptance criteria written so that they can be turned into test cases.

### F1 Dashboard

- Shows: cards due today, overall mastery %, questions answered and accuracy %, study streak in days, progress per track, and one "next step" suggestion.
- Next step rule, in order: (1) an exam in progress, (2) cards due today, (3) the weakest topic with at least 5 answered questions (accuracy below 70%), (4) the first incomplete module, (5) the next unchecked roadmap gate.
- Empty state (new learner): explains the four tracks and offers "Start with orientation".

### F2 Roadmap

- Lists stages 0 to 5 with hours, focus and gate. The learner ticks a gate when done; ticking is reversible.
- A weekly-hours input (1 to 40, default 6) and a start date give a projected finish date per stage: cumulative hours divided by weekly hours, in weeks, added to the start date. Stage 5 shows "ongoing".
- Shows the certification table and highlights entries with `verify: true`. Shows specialisations; the learner picks one.
- Boundary cases: 1 hour per week gives a long plan and must not overflow the layout; 40 hours per week gives a plan of about 10 weeks.

### F3 Modules

- One page per module: summary, objectives with K-level badges, key points, practice tasks, a "mark complete" toggle, and links to that topic's flashcards, questions and glossary terms.
- Shows the hub section number so the learner can open the matching section of the hub document.

### F4 Flashcards (spaced repetition, Leitner)

- Five boxes with intervals in days `[0, 1, 3, 7, 14]` (from `app.leitner`). New cards start in box 1, due today.
- Answering "I knew it" moves a card up one box (maximum 5); "I missed it" returns it to box 1. The next due date is today plus the interval of the new box, using local calendar days.
- A session draws due cards only, filtered by topic and difficulty, in random order, with a session cap (default 20). Shows remaining count and a box distribution chart.
- Keyboard: Space or Enter flips; Left means missed, Right means knew it; Escape ends the session.
- Mastery for a card is `(box - 1) / 4` if seen and 0 if unseen.
- Edge cases: no cards due (show the next due date); the device clock moves backwards (cards simply become due later; never crash); the same card answered twice in one second (ignore the second event).

### F5 Practice quiz

- Choose topics (multi-select), K-levels, and length (10, 20, all). Questions are drawn without repetition, unseen first.
- Immediate feedback after each answer: correct or wrong, the right option, the explanation, and a "check this" marker if `verify` is true. Answers cannot be changed after submission.
- A summary at the end lists wrong answers with explanations and offers "retry wrong ones".
- Tracks `seen`, `ok` and `lastOk` per question; accuracy per topic feeds the dashboard.

### F6 Exam simulator

- Profiles from `exams`: CT-STE (40 questions, 75 minutes) and CT-SEC (45 questions, 120 minutes). A 25% extra-time option exists for non-native speakers, as in the ISTQB rules.
- Scope: all topics, or only the topics of the ISTQB exam-preparation track. The pool is shown next to the choice.
- Draw: the profile's question count is split over the topics in proportion to their pool size (largest-remainder rounding, so the quotas add up exactly and never exceed a topic's pool). Within a topic, questions never answered come first, then those answered longest ago, ties broken randomly, so repeated mocks work through the bank before a question returns. If the pool has fewer questions than the profile, draw all and say so. The drawn order is shuffled.
- Timer: store an absolute deadline timestamp and compute the remainder from it, so hidden tabs, sleep and reloads do not drift. Warn at 10 minutes and 1 minute remaining. At zero, submit automatically.
- Navigation: previous, next, a numbered jump grid, a flag for review, and a count of unanswered questions before submitting. Answers may be changed until submission.
- Resume: an exam in progress is saved after every answer and offered on the next visit.
- Scoring: one point per question; pass at 65% of questions (rounded up). This is an approximation, because the real exams weight questions by K-level. The result page says so.
- Result page: score, percentage, pass or fail, breakdown by topic and by K-level, and a full review with explanations.

### F7 Glossary

- Instant search over term and definition, topic filter, alphabetical order, deep link by term id, and a marker for `verify: true`.
- Empty search result shows a clear message and a reset button.

### F8 Test-case library

- Filters: feature, type, free text. Each case has a "done" tick that persists and a copy button.
- Export the filtered list as Markdown or CSV (see `security-test-cases.csv` for the column order).
- Always show a safety line: run only on systems you are authorised to test.

### F9 Reference tables

- A selector for the 19 tables; generic table rendering with a sticky header on wide screens and a stacked card layout on phones; in-table search.

### F10 Labs, tools and resources

- Labs with cost and level filters; the tools matrix; resources grouped by `kind`, each with a "last checked" note taken from `verified`.

### F11 Settings and data control

- Theme: system, light, dark. Language: automatic (follows the device's language list), English, Ukrainian, Polish, Spanish or German; the choice is saved with the progress. Reset progress (with confirmation). Export progress as JSON text and import it back; import is validated, size-limited and rejected with a message if the shape is wrong.
- Progress report: a Markdown summary written in the interface language (overall figures, mastery by topic with an evidence column, the latest ten mock exams, focus areas and a "how to read this" note). It can be copied or saved as a file, so a learner can share it with a mentor without sharing the raw progress file.

## 5. State and persistence

Keep one JSON document under the key `sechub.progress.v1`:

```json
{
  "v": 1,
  "settings": { "theme": "system", "hoursPerWeek": 6, "startDate": "2026-11-01", "extraTime": false },
  "roadmap": { "gates": { "0": true }, "specialisation": "appsec-devsecops" },
  "modules": { "mod-foundations": { "done": true, "at": "2026-11-03T18:20:00Z" } },
  "cards": { "fc-foundations-01": { "box": 2, "due": "2026-11-04", "seen": 3, "ok": 2, "last": "2026-11-03" } },
  "questions": { "q-foundations-01": { "seen": 2, "ok": 1, "lastOk": true } },
  "exams": [ { "profile": "ct-ste", "finished": "2026-11-10T09:00:00Z", "correct": 29, "total": 40, "passed": true, "byTopic": {} } ],
  "testcases": { "LOGIN-01": true },
  "activity": { "2026-11-03": 14 },
  "examInProgress": null
}
```

Rules:

- Wrap every storage read and write in try/catch. If storage is blocked or full, keep working in memory and show a one-line notice that progress will not be saved.
- Identify records by dataset id. On load, drop progress entries whose ids no longer exist in the dataset, and ignore unknown fields.
- Write at most once per user action; debounce bulk updates. Cap the `exams` array at 50 entries.
- Never store personal data, tokens or anything secret.

## 6. Algorithms

- Topic mastery = mean card mastery over the topic's cards (unseen cards count as zero), blended 50/50 with question performance once at least 5 different questions of that topic have been tried; before that, card mastery only. Question performance is the share of those questions that were right on their latest try, so repeating one question adds no evidence and an old miss stops counting once it is corrected. Overall accuracy across every attempt is shown for information only.
- A topic is flagged as weak only when it has enough evidence (5 different questions) and the latest-try share is below 70%. Topics with fewer questions are reported as "too few to rate", not as weak or strong.
- Track progress = mean topic mastery across the track's topics.
- Readiness for an exam profile = mean topic mastery weighted equally, shown as a band: below 50% "early", 50 to 70% "building", 70% and above "ready to try a mock exam". Label it as a self-study indicator, not a prediction.
- Streak = consecutive local days with at least one study action, counting back from today (or from yesterday if today has none yet).
- Question draw for quizzes: unseen first, then lowest accuracy, ties broken randomly.

## 7. Non-functional requirements

- Accessibility (WCAG 2.2 AA): full keyboard use, visible focus, contrast of at least 4.5:1 in both themes, labels for all controls, live-region announcement of answer feedback, no meaning conveyed by colour alone, and `prefers-reduced-motion` respected.
- Responsive: works from 320 px width; no horizontal page scroll; touch targets of at least 44 px; wide tables become stacked cards.
- Performance: the minified dataset is about 250 KB. Render long lists in pages or on demand; first meaningful paint under 2 seconds on a mid-range phone; no layout shift when the dataset loads.
- Offline: after first load the app works without a network, apart from opening external links.
- Privacy: no analytics, no third-party scripts, no cookies. External links open in a new tab with `rel="noopener noreferrer"`.

## 8. Security requirements for the app itself

The app teaches security, so it must not teach by bad example.

- Insert every dataset string with `textContent` or an escaping template, never as HTML. Treat imported progress JSON and URL fragments as untrusted input.
- Serve with a strict Content-Security-Policy (no inline event handlers, no `eval`, no remote scripts). If the host cannot set headers, add the policy in a meta tag. The build computes SHA-256 hashes of the one inline script and the inline styles and writes them into the policy (`script-src` and `style-src` allow only those hashes, plus the Google Fonts hosts for the stylesheet and font files), on top of `default-src 'none'`, with `connect-src 'none'`, `form-action 'none'` and `base-uri 'none'`. `dist/csp-header.txt` holds the same policy plus `frame-ancestors`, which only works as an HTTP header and is not allowed in a meta tag.
- The build fails when the source uses `innerHTML`, `eval`, inline event handlers, string timers, remote scripts, a `style` attribute (it would need `unsafe-inline`) or a web address outside the allow-list.
- Validate imported progress against the shape in section 5 and cap its size (for example 1 MB).
- Do not put real vulnerable code, working exploit payloads or attack scripts in the app; the dataset contains test ideas only.
- Pin and verify any third-party build dependency; prefer none for a single-file build.

## 9. Risks, edge cases and failure scenarios

| Risk | Scenario | Mitigation |
| --- | --- | --- |
| Stale facts | A standard or date changes after the as-of date | Show `meta.asOf`; mark `verify` items; link to the source resource |
| Biased questions | The correct option tends to be the longest or in one position | Keep `validate_dataset.py` in CI; it flags both |
| Wrong answer key after reshuffle | Options reordered without updating the index | Never reshuffle, or recompute `answer` from the option text |
| Lost progress | Storage cleared or blocked | Export/import; in-memory fallback with a notice |
| Corrupt progress | Hand-edited or truncated JSON | Validate on load, fall back to defaults, keep a copy of the bad blob for export |
| Timer drift | Tab hidden, laptop sleeps | Absolute deadline timestamp |
| Double submit | Fast double-click on an answer | Disable controls after the first event |
| Clock changes | Time zone travel, manual clock edits | Local calendar dates; tolerate negative intervals |
| Over-trust | The learner treats the simulator pass mark as the real one | Prominent approximation notice |
| Misuse | The test-case library used on systems the learner does not own | Safety line on every test page |
| Dataset drift | A new dataset removes ids that progress refers to | Drop unknown ids silently; bump the major version for breaking changes |

## 10. Test approach (ISTQB-style, risk based)

Risk ranking (highest first): wrong answer keys, lost or corrupt progress, exam timer and scoring, spaced-repetition scheduling, accessibility, then layout.

Test conditions and example cases:

- Equivalence partitions: exam profiles (ct-ste, ct-sec), card boxes (1, 2 to 4, 5), question types by K-level (K1 to K4), topics (14).
- Boundary values: weekly hours 0, 1, 40, 41; exam with 0, 1, 39, 40 answered; timer at 10:00, 1:00 and 0:00; box 1 wrong answer, box 5 correct answer; 0 cards due; 1 card due; session cap 20 with 19, 20 and 21 due cards.
- Negative tests: import progress JSON that is empty, not JSON, too large, has a wrong `v`, has a card box of 9 or a due date of "yesterday-ish"; open the app with storage blocked; load a dataset with a missing `answer`.
- State transitions: not started, in progress, paused by reload, submitted, reviewed; flashcard box transitions; module not done, done, not done.
- Exploratory charters: "Break the exam timer with sleep, tab switching and reloads"; "Find a way to answer a quiz question twice"; "Corrupt the progress blob and see how the app recovers"; "Use only the keyboard for a whole study session".
- Data checks (automated): run `validate_dataset.py` and `test_validator.py` and validate against the JSON Schema on every build; fail the build on any error.
- UI automation (for example Playwright): navigation across all views; quiz answer and feedback; flashcard flip and grading; exam start, timeout and submit; persistence across reload; import and export round trip; 375 px and 1280 px widths; light and dark themes; an accessibility scan.
- CI/CD: run data checks and UI smoke tests on every pull request; publish only when green; keep the dataset version in the build output.

## 11. Acceptance checklist

1. Every requirement F1 to F11 passes its criteria on a phone-width and a desktop-width viewport.
2. The dataset passes the validator, the negative tests and the schema.
3. Every interactive element works by keyboard, and no colour-only signalling remains.
4. Progress survives a reload, can be exported and imported, and degrades gracefully when storage is blocked.
5. No dataset string is inserted as HTML; the app has no remote scripts; the complete page carries a hash-based CSP.
6. The exam simulator states that its scoring is an approximation of the real exams.
7. The safety line is visible on the test-case and lab pages.

## 12. Build options and trade-offs

| Option | Benefits | Drawbacks |
| --- | --- | --- |
| Single-file HTML with the dataset inlined | One file to host or open offline; no build chain; smallest attack surface | Harder to test in parts; large file; updates mean redeploying the file |
| Static site with a framework (Vite plus React or Svelte) | Components, unit tests, code splitting | Needs a build chain and dependency hygiene |
| Anki deck from `flashcards-anki.tsv` | Mature spaced-repetition engine and mobile apps | No quiz, roadmap or exam simulator; cards only |
| Notion or spreadsheet import of the CSV files | Fast to start; collaborative | No scheduling, timing or scoring logic |

## 13. Languages

English is the reference. The app also ships Ukrainian, Polish, Spanish and German. Treat these as AI-assisted translations that a native-speaking security tester has not reviewed; the settings page says so, and the English text stays the reference for ISTQB exam preparation.

- **Interface.** Every visible string goes through `__('English text', args)`; the catalogue (`src/i18n/ui/*.json`) is keyed by the English string, with `{0}` placeholders. Counts use `plural(n, 'noun')`, which relies on `Intl.PluralRules` and a four-form entry (`one`, `few`, `many`, `other`) for Ukrainian and Polish. Dates, numbers, sorting and weekday names use the active locale.
- **Content.** The dataset stays English. A per-language overlay (`data/i18n/<lang>/*.json`) holds text only, keyed by record id: nothing structural can change. An overlay record is applied all-or-nothing: a question needs a stem, an explanation and exactly four options in the stored order, so `answer` can never point at the wrong option; a module needs arrays of equal length. A record that fails the check shows in English. Glossary terms are written "Localised term (English term)" so a learner can still find the English wording used in exams.
- **Choice.** Setting `settings.lang` is `auto` (first supported language in `navigator.languages`, else English) or one of `en`, `uk`, `pl`, `es`, `de`, and is saved with the progress.
- **Checks.** `validate_i18n.py` verifies the catalogue and the overlays against the English source: identical `{n}` placeholders, plural forms, numbers kept (an error for questions and flashcards, a warning elsewhere), no Latin look-alike letters inside Cyrillic words, no duplicate ids, and the overlay shape. `node test/i18n.cjs` covers detection, switching, plural forms, answer keys in a translated exam, English fallback and the 320 px layout in every language.
- **Open limit.** A translation can still be wrong in a way no script detects (a mistranslated technical nuance, for example). Have a native speaker review `questions` and `modules` first.

Reversibility: all options read the same dataset, so switching later costs only the user interface.
