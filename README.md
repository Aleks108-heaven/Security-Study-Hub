# Security Testing and Cybersecurity Study Hub

App version 1.1.0, dataset version 1.0.0, as of 24 October 2026. This folder holds the study dataset and the single-file study app built from it.

The app is plain HTML, CSS and JavaScript with no runtime dependencies and no framework. Its content comes from `data/security-hub-data.min.json`, which is embedded into the page at build time. It runs in English, Ukrainian, Polish, Spanish and German.

## Use it

| How | What to do |
| --- | --- |
| Locally | Open `security-hub-study-app.html` in a browser. It is one complete page and needs no server. Progress is saved in that browser. |
| Online (GitHub Pages) | Push to `main`; `.github/workflows/pages.yml` publishes the page. Switch it on once under Settings > Pages > Source: GitHub Actions. |
| Online (claude.ai artifact) | Run `python build_app.py` and publish `dist/hub-app.html`, the fragment form. The optional private sync and file downloads work only there. |

## What the app does

- **Roadmap, modules and dashboard** with a study plan driven by your weekly hours.
- **Flashcards** with Leitner-box spaced repetition (207 cards).
- **Practice quiz** (126 questions, K1 to K4) with immediate feedback and explanations.
- **Exam simulator** for ISTQB CT-STE and CT-SEC: a countdown that survives reloads, a flag-for-review grid, optional 25% extra time. Questions are shared out across the topics in proportion to their number (not a random clump), and within a topic the ones you answered longest ago come first. You can restrict the pool to the ISTQB track topics.
- **Evidence-aware mastery.** Quiz results count towards a topic only after 5 different questions were tried, and only the latest try of each question counts, so repeating one question adds nothing and a corrected miss stops hurting. Topics with too little evidence are shown as such, not as weak or strong.
- **Progress report** (Settings): a Markdown summary with an evidence column and focus areas, to copy or save and share with a mentor.
- **Glossary, test-case library, reference tables, labs, tools and resources.**
- **Languages.** Follows the device language list, or choose one in Settings. See "Translations" below.
- **Data control.** Export and import progress as validated JSON; reset with confirmation.

## What is inside

### Dataset package

| File | What it is |
| --- | --- |
| `security-hub-data.json` | The complete dataset, pretty-printed (about 300 KB). |
| `security-hub-data.min.json` | The same data, minified, for shipping (about 255 KB). |
| `security-hub-data.schema.json` | JSON Schema (draft 2020-12) describing every collection. |
| `validate_dataset.py` | Standard-library checks: references, duplicates, answer keys, option quality, placeholders. Exit code 1 on errors. |
| `test_validator.py` | 20 negative tests proving the validator and schema reject broken data. |
| `APP_BUILD_SPEC.md` | Requirements, algorithms, tests and risks for building a study app on the dataset. |
| `glossary.md` | 226 terms by topic. |
| `flashcards.md` | 207 flashcards by topic, with difficulty. |
| `flashcards-anki.tsv` | The same cards for import into Anki (tab-separated, with a tags column). |
| `questions.md` | 126 practice questions with answer keys and explanations. |
| `security-test-cases.md`, `security-test-cases.csv` | 46 reusable security test cases for common web features. |
| `SHA256SUMS.txt` | Checksums of the dataset package files, including this README. |

### App source

| Path | Purpose |
| --- | --- |
| `src/head.html`, `src/body.html`, `src/style.css` | Page head, body shell and all styles. Colours are tokens with light and dark themes. |
| `src/js/*.js` | Fourteen script parts, concatenated in file-name order: core helpers, translation layer, data and progress state, study logic (Leitner boxes, mastery, exam draw), progress report, shared UI, then one file per view group, then boot. |
| `src/i18n/ui/*.json` | The interface catalogue: English text mapped to Ukrainian, Polish, Spanish and German (587 entries). |
| `data/i18n/<lang>/*.json` | Dataset translations, text only and keyed by record id, for `uk`, `pl`, `es` and `de`. |
| `data/security-hub-data.min.json` | The copy of the dataset that the build reads. It is identical to the root copy. To update the content, replace both with a newer export of the same shape. |
| `build_app.py` | Builds `dist/hub-app.html` (the fragment for claude.ai), `dist/hub-app.test.html` (a complete page with a content security policy), `dist/app.js` and `dist/csp-header.txt`. |
| `validate_i18n.py` | Checks the catalogue and the dataset translations against the English source (see "Translations"). |
| `contrast.py` | Prints contrast ratios for every text and surface colour pair in both themes. Any `LOW` line needs attention. |
| `test/e2e.cjs` | 180 end-to-end checks (Playwright), run in English. |
| `test/i18n.cjs` | 68 checks of language detection, switching, plural forms, translated answer keys, English fallback and the 320 px layout in every language. |
| `test/features.cjs` | 28 checks of the exam draw, the evidence rule, the report and the content security policy. |
| `test/shots.cjs` | Screenshots of every screen at desktop and phone width in light and dark, plus an axe-core accessibility scan. |
| `test/counts.cjs`, `test/smoke.cjs` | Small sanity scripts. |

## Contents of the dataset

14 topics grouped into 4 study tracks, a 6-stage roadmap (about 410 hours for stages 0 to 4) with 5 specialisations, 9 certification entries, 14 study modules, 226 glossary terms, 207 flashcards, 126 practice questions (K1 to K4), 46 security test cases, 17 tool rows, 17 labs, 32 resources, 19 reference tables (OWASP Top 10:2025, API Top 10:2023, LLM Top 10:2025, WSTG, frameworks and more) and two ISTQB exam profiles.

## Quick start: validate the dataset

```bash
python3 validate_dataset.py security-hub-data.json        # expect: 0 error(s), 0 warning(s)
python3 test_validator.py security-hub-data.json security-hub-data.schema.json
sha256sum -c SHA256SUMS.txt
```

Load it in JavaScript:

```js
const data = await (await fetch('security-hub-data.min.json')).json();
const q = data.questions[0];
console.log(q.stem, q.options[q.answer]);   // the answer index is valid for the stored option order
```

## Build the app

You need Python 3.

```bash
python build_app.py
```

The build stops with an error if the source uses `innerHTML`, `eval`, inline event handlers, string timers, remote scripts, a `style` attribute or any web address outside a short allow-list (the SVG namespace and the search address used for labs that have no stored link). It also checks that the embedded data round-trips exactly.

`dist/hub-app.test.html` carries a Content-Security-Policy in a meta tag. The build hashes the one inline script and the inline styles and allows only those hashes; the page can make no network request (`connect-src 'none'`). The one outside dependency is the Google Fonts stylesheet and font files; if they are blocked, system fonts are used. `dist/csp-header.txt` has the same policy plus `frame-ancestors 'none'` for hosts that can send headers (a meta tag cannot carry `frame-ancestors`).

## Test the app

You need Node 18 or later and Python 3.

```bash
npm ci
npx playwright install chromium
npm run verify        # dataset checks, translation checks, build, then all three test suites
```

`npm run verify` runs, in order: `validate_dataset.py` and `test_validator.py`, `validate_i18n.py`, `build_app.py`, `test/e2e.cjs`, `test/i18n.cjs` and `test/features.cjs`. Run the others by hand:

```bash
node test/shots.cjs       # screenshots plus the axe-core scan
python contrast.py        # colour contrast in both themes
```

`npm ci` installs Playwright 1.63.0 and axe-core 4.10.2 (see `package.json`). Where a browser is already installed, point Playwright at it instead of downloading one. Set `ONLY=desktop-light,mobile-dark` to limit `shots.cjs` to some configurations, and `NOAXE=1` to skip the accessibility scan. Screenshots go to `test/shots/`.

Results on 24 October 2026 (headless Chromium on Windows 11): 180 of 180 end-to-end checks, 68 of 68 language checks and 28 of 28 feature checks passed; the dataset validator reported 0 errors and 0 warnings, the translation validator 0 errors (47 warnings, see below); the axe scan found no violations in four English configurations, and no colour pair is below the contrast limit. Details are in `docs/QA-REPORT-2026-10-24.md`.

## Translations

Ukrainian, Polish, Spanish and German cover the whole interface and every dataset collection: tracks, topics, the roadmap, modules, glossary, flashcards, questions, test cases, certifications, tools, labs, resources, reference tables and exam notes.

**They were prepared with AI assistance and have not been reviewed by a native-speaking security tester.** The settings page says so. The English text is the reference for ISTQB exam preparation, and glossary terms keep the English term in brackets so you can match it with the exam wording.

How it is kept safe:

- A translation overlay can change text only. A translated question must have a stem, an explanation and exactly four options in the stored order, so the answer key cannot point at the wrong option. A record that fails the check is shown in English.
- `python validate_i18n.py` compares every translation with the English source: same placeholders, plural forms present, numbers preserved (an error for questions and flashcards, a warning elsewhere), no Latin look-alike letters inside Cyrillic words, no duplicate ids. `python validate_i18n.py --list` prints every interface string found in the source with the files that use it, and `--missing` prints a JSON skeleton of the interface strings that have no catalogue entry yet.
- The remaining 47 warnings are about options that are proper nouns or code and so contain no Cyrillic letters (for example a tool name), not defects.

To add or fix a translation, edit the JSON under `src/i18n/ui/` or `data/i18n/<lang>/`, run `python validate_i18n.py`, then rebuild. A native-speaker review of the `questions` and `modules` files is the most valuable next step.

## Put it on GitHub

The repository is `https://github.com/Aleks108-heaven/Security-Study-Hub`. Nothing in this folder pushes by itself. From this folder:

```bash
git init -b main
git remote add origin https://github.com/Aleks108-heaven/Security-Study-Hub.git
git add .
git status                       # check the list before the first commit
git commit -m "Study hub 1.1.0: assessment features, five languages, CSP, CI"
git push -u origin main
```

`.gitignore` leaves out `node_modules`, `dist/` (CI rebuilds it), screenshots, the backup folder `_originals-2026-10-24/`, the stale duplicate `README (2).md` and the `.plugin` and `.skill` bundles. The committed `security-hub-study-app.html` is the ready-to-open complete page. The `CI` workflow runs `npm run verify` and the checksum check on every push and pull request and keeps the build as a downloadable artifact; the `Publish to GitHub Pages` workflow publishes the page.

## Deep links

`#home`, `#plan`, `#modules`, `#cards`, `#quiz`, `#exam`, `#glossary`, `#tests`, `#reference`, `#labs`, `#prefs`, plus `#mod-<module id>` (for example `#mod-web`), `#g-<term id>` and `#ref-<table key>` (for example `#ref-owaspTop10_2025`).

## Conventions

- Every record has a stable `id`; never use array position as an identifier.
- Questions store their options already shuffled. If you reshuffle, recompute `answer` from the option text.
- `verify: true` marks an item that rests on a fact the hub did not re-check against a primary source on the as-of date. Show it to learners, and re-check before relying on it for an exam. The app shows these items as "Check this".
- "authorization" means access control; "authorisation" with an s means permission to test.
- `core: true` marks the four flashcards and two questions per topic that are printed in the hub document.

## Known limits

- Not tested on real phones, in Safari or Firefox, with screen readers, or in Windows high-contrast mode. Automated scans find only part of the accessibility problems, and the axe scan ran in English only.
- The translations are unreviewed (see above).
- The mock exam shares questions across topics but does not follow the real exams' K-level weighting, and it scores one point per question. The question bank has 126 items, so a 40-question mock reuses questions after about three attempts; treat repeated scores as a measure of recall, not of fresh exam skill.
- Mastery and the report come from one browser's local storage and are self-reported practice results, not a certified assessment.
- 15 of the 17 labs have no stored web address, so the app offers a web-search link for them.
- Items marked "Check this" were not re-verified against a primary source.
- The page loads a Google Fonts stylesheet. If that is blocked, system fonts are used.
- The complete page is about 1.4 MB because it carries all four translations.

## Notice

This is original study material written for personal learning. It paraphrases public standards and syllabi and does not reproduce them. It is not official ISTQB or exam content and does not guarantee a pass. ISTQB, OWASP, NIST, MITRE, CIS and other names belong to their owners. Verify current exam details on the ISTQB website before booking.

Run the security test cases and labs only on systems you own or are authorised in writing to test.
