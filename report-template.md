<!-- Template. Replace the placeholders and delete the guidance text before issuing. If you use the system-app-auditor plugin, scripts/render_report.py produces this structure from findings.json. -->
# System Application Audit Report

| Field | Value |
| --- | --- |
| Report ID and version | ... / 1.0 |
| Host / OS | ... |
| Date (and time zone) | ... |
| Auditor | ... |
| Privilege level | ... (standard user, administrator or root) |
| Mode | read-only |
| Classification | Confidential: contains host names, user names and paths |

## 1. Executive summary

Overall verdict (Healthy / Needs attention / At risk), the top 3 issues in one line each, and the single most important next action.

## 2. Scope and limits

- **Checked:** what was inspected.
- **Not checked:** what was not, and why (missing tools, no root or administrator rights, sandbox, timeouts).
- **Assumptions:** anything taken as given.
- **Methods and tools:** collector or commands used, tool versions, time window.

## 3. Findings overview

Severity is impact (1-5) times likelihood (1-5): Critical 20-25, High 12-19, Medium 6-11, Low 2-5, Info 0-1. Confidence (High / Medium / Low) is reported separately and does not change severity.

| ID | Severity | Area | Title | Confidence |
| --- | --- | --- | --- | --- |

## 4. Detailed findings

### F-01 Title (Severity, Confidence)

- **Area / checklist item:** ...
- **Score:** impact x likelihood = ... (state any exposure or compensating-control adjustment)
- **Evidence:** command + trimmed, redacted output (secrets masked; give the location, never the value)
- **Root cause (hypothesis):** immediate vs underlying
- **Alternative explanations:** benign or competing explanations considered
- **Impact / risk:** security, reliability, performance
- **Suggested fix (NOT executed):** command(s)
- **Fix risk / rollback:** side effects, downtime, how to undo
- **Verification:** how to confirm the fix worked
- **References:** real identifiers only (CWE, CVE, vendor advisory)

## 5. What looked healthy

Areas checked with nothing to report. A clean area is reported as clean.

## 6. Tradeoffs and recommendations

Fixes ordered by severity and effort, noting anything that needs a reboot, downtime or a change window.

## 7. Suggested follow-up tests (negative, boundary, exploratory)

## 8. What should I check additionally?
