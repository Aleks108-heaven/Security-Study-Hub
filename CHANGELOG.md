# Changelog

## 1.1.0 (24 October 2026)

Dataset version stays 1.0.0 (see "Content" below).

### Assessment

- Mastery rests on evidence: quiz results count towards a topic only after 5 different questions were tried, and only the latest try of each question counts. Repeating one question adds nothing; a corrected miss stops lowering the topic. Weak-area flags need the same evidence.
- Exam draw: questions are shared out across topics in proportion to the topic's size (largest-remainder rounding). Inside a topic, never-answered questions come first, then those answered longest ago. New option to restrict the pool to the ISTQB track topics.
- New progress report in Settings: Markdown with an evidence column, the latest mock exams, focus areas and a "how to read this" note. Copy it or save it as a file.

### Languages

- Ukrainian, Polish, Spanish and German for the whole interface (587 strings) and for every dataset collection. Automatic choice from the device language list, or pick one in Settings; the choice is saved with the progress and checked on import.
- Plural forms through `Intl.PluralRules` (four forms for Ukrainian and Polish); dates, numbers, sorting and weekday names follow the language.
- Dataset translations are text-only overlays keyed by record id and applied all-or-nothing per record, so an answer key can never shift. Untranslated records fall back to English.
- A notice in Settings states that the translations are AI-assisted and not reviewed by native-speaking security testers.
- `validate_i18n.py`: placeholders, plural forms, preserved numbers, Latin look-alike letters in Cyrillic words, duplicate ids and overlay shape. Its mixed-script check caught a Latin letter inside a Ukrainian word; two further typos in the Ukrainian text were fixed by hand.

### Security and delivery

- The complete page (`dist/hub-app.test.html`) carries a hash-based Content-Security-Policy (`connect-src 'none'`, `form-action 'none'`, `base-uri 'none'`). `dist/csp-header.txt` adds `frame-ancestors 'none'` for hosts that can send headers.
- The build refuses a `style` attribute, `innerHTML`, `eval`, inline handlers, string timers, remote scripts and non-allow-listed web addresses.
- GitHub: `.gitignore`, `.gitattributes`, a CI workflow (`npm run verify`, checksum check, build artifact) and a GitHub Pages workflow.
- `npm run verify` runs the dataset validators, the translation validator, the build and the three test suites.

### Interface

- Long words and tags wrap instead of overflowing at 320 px in German, Spanish, Polish and Ukrainian.

### Tests

- 180 end-to-end checks (unchanged, English), 68 language checks (new), 28 feature checks (new): exam scope and spread, least-recently-answered first, the evidence rule, the report, the CSP. See `docs/QA-REPORT-2026-10-24.md`.

### Content

- One question explanation (q-ai-08) was corrected in `security-hub-data.json`, `security-hub-data.min.json`, `data/security-hub-data.min.json` and `questions.md`. The dataset version number was not changed.

### Files

- Replaced `security-hub-study-app.html` with the new complete build; the previous page is kept as `_originals-2026-10-24/security-hub-study-app.v1.0.0.html`.
- `README (2).md` is a stale duplicate of an earlier README; it is left in place and ignored by git.

## 1.0.0 (23 October 2026)

First release: dataset, validators, single-file app, 180 end-to-end checks.
