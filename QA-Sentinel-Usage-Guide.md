# QA Sentinel - Usage Guide

Version 0.2.0. A quality-assurance and application-security toolkit for Claude: 12 skills and 4 review agents. Skills activate automatically when your request matches; you can also name one directly.

## Quick start

1. Install the plugin (see Install).
2. Describe the job in plain language. Optionally name a role to set the depth: Junior, Middle (the default), Senior, QA Lead, Automation, API or Agile.
3. Give it the material: code, a spec or OpenAPI file, a user story, or a URL you are authorised to test.
4. Read the "not verified" and "what should I check additionally" parts of the report as carefully as the findings.

## Example prompts

| Goal | Say | Used |
| --- | --- | --- |
| Full QA package | "Senior QA: generate a QA package for this user story: ..." | test-designer agent |
| Test plan | "QA Lead: risk-based test plan for the checkout migration" | risk-based-test-planning |
| Test design | "Test cases for a password field, use BVA, ECP and error guessing" | test-case-design |
| Security | "Run a security review of this repo against the OWASP Top 10, focus on auth" | security-review, security-auditor agent |
| Code defects | "Audit this Python service for bugs and unsafe patterns" | code-audit |
| API | "API tests for this OpenAPI file, include BOLA and rate-limit cases" | api-testing |
| Web UI | "QA this page: accessibility, Core Web Vitals, cross-browser" | web-ui-testing |
| Automation | "Which of these tests should be automated? Design the framework" | test-automation |
| Performance | "Load test plan and k6 script for search, p95 under 500 ms" | performance-testing |
| Bug report | "Rewrite this bug report and rate severity and priority" | bug-reporting |
| Release | "Go or no-go for release 2.14 with this evidence: ..." | release-readiness, qa-reviewer agent |
| CI/CD | "Design CI quality gates for our GitHub Actions pipeline" | ci-quality-gates |
| Check findings | "Use the finding-verifier on this report" | finding-verifier agent |

## What is included

### Skills

| Skill | Purpose |
| --- | --- |
| qa-standards | Shared rules: evidence labels, role adaptation, severity and priority, templates |
| risk-based-test-planning | Test strategy and plan, risk register, entry and exit criteria, estimation, metrics |
| test-case-design | Boundary values, equivalence classes, decision tables, state transitions, error guessing, Given-When-Then |
| security-review | OWASP Top 10, API Top 10 and ASVS; STRIDE; secrets; supply chain |
| code-audit | Language-specific defect review, with a read-only stack-detection script |
| api-testing | Contract checks, status-code matrix, authorization and BOLA, idempotency, fuzz and property tests |
| web-ui-testing | Functional, WCAG 2.2, Core Web Vitals, cross-browser, Playwright patterns |
| test-automation | Automation strategy, architecture, test data, flaky-test triage, pseudo-code |
| performance-testing | Load, stress and soak plans, a k6 sample, bottleneck analysis |
| bug-reporting | Reproducible defect reports, severity versus priority, root cause, triage |
| release-readiness | Regression scope tiers, go/no-go, rollback and post-deploy checks |
| ci-quality-gates | Shift-left and DevSecOps pipeline gates, thresholds, CI hardening |

### Agents

| Agent | Purpose |
| --- | --- |
| qa-reviewer | Independent review that ends in a ship, ship-with-conditions or do-not-ship verdict |
| security-auditor | Read-only, defensive audit based on OWASP |
| test-designer | A complete QA package from a story, feature or API |
| finding-verifier | Challenges findings for false positives and inflated severity before delivery |

## What every report contains

- Assumptions and missing information.
- Findings ranked by risk, each with evidence and an evidence label: **Verified** (seen or run), **Inferred** (reasoned) or **Assumed**.
- Tradeoffs and residual risk.
- Suggested negative, boundary and exploratory tests.
- A verdict where one applies.
- A closing "What should I check additionally?".

## Recommended tools (run in your own environment)

| Purpose | Tools |
| --- | --- |
| Static analysis | Semgrep, CodeQL |
| Secrets | gitleaks |
| Dependencies, containers and IaC | trivy, osv-scanner, npm audit, pip-audit |
| Dynamic scanning | OWASP ZAP |
| Browser, accessibility and performance | Playwright, axe-core, Lighthouse |
| Load | k6 |
| API and contract testing | Schemathesis, Pact |

## Safety and limits

- Test only systems you own or are authorised in writing to test. Scanners and tests run only when they are present, safe and authorised.
- Automated and AI-assisted review reduces risk but cannot prove the absence of defects. Verify findings and run real scanners in CI.

## Install

Open `qa-sentinel.plugin` in Claude and accept it. If that fails, unzip `qa-sentinel-source.zip` and add the folder as a local plugin. The plugin's `CHANGELOG.md` lists what changed between versions: 0.1.0 had 6 skills and the qa-reviewer agent; 0.2.0 added the shared qa-standards skill, five more skills and three more agents.
