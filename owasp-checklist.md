# OWASP Security Checklist

A review aid for web applications, APIs and LLM-based features. Use it to choose what to test, to map a finding to a standard category, and to check that controls exist. It is a prompt for investigation, not proof: label every result **Verified** (seen or reproduced), **Inferred** (reasoned, not demonstrated) or **Assumed**, and never report a category as clean unless you actually tested it.

Editions used: OWASP Top 10:2025 (web), OWASP API Security Top 10:2023, OWASP Top 10 for LLM Applications 2025. OWASP revises these lists, so check owasp.org for the current edition before citing one in a report. Test only systems you own or are authorised in writing to test.

## 1. OWASP Top 10:2025 (web)

| ID | Category | What to check | Typical controls |
| --- | --- | --- | --- |
| A01 | Broken Access Control | IDOR/BOLA (swap object IDs between two accounts and tenants); missing function-level checks; forced browsing; permissive CORS; path traversal; SSRF (server-side fetch of user-supplied URLs, cloud metadata addresses) | Deny by default; enforce per object and per function on the server; central access checks; allow-list outbound destinations |
| A02 | Security Misconfiguration | Default accounts and consoles; directory listing; debug endpoints and verbose errors; missing security headers; over-broad cloud permissions; open storage | Hardened baselines; minimal features; automated configuration checks |
| A03 | Software Supply Chain Failures | Unpinned or vulnerable dependencies; no lockfile; compromised build or CI; unsigned artifacts; dependency confusion; third-party scripts without SRI | SBOM; pinned and verified dependencies; hardened CI/CD with least-privilege tokens; signed artifacts; update policy |
| A04 | Cryptographic Failures | Clear-text transport or storage; weak hashing (MD5, SHA-1, unsalted); hard-coded keys; ECB mode; disabled TLS verification; predictable tokens | TLS everywhere; modern algorithms; key management; Argon2id, bcrypt or scrypt for passwords |
| A05 | Injection | SQL, NoSQL, OS, LDAP and template injection; XSS (reflected, stored, DOM); header and log injection | Parameterised queries; context-aware output encoding; validation as defence in depth; least-privilege database accounts |
| A06 | Insecure Design | No rate limits; trust in client-side state; business-logic abuse (skipped steps, replay, negative quantities, races); no threat model | Threat modelling; abuse-case requirements; limits on sensitive flows |
| A07 | Authentication Failures | Weak password or reset flows; no MFA; no lockout or throttling; session fixation; tokens not invalidated on logout; user enumeration; tokens in URLs | MFA; breached-password checks; secure session management; uniform error messages |
| A08 | Software or Data Integrity Failures | Unsigned updates or plugins; insecure deserialization; unsigned client-controlled data; unverified auto-update | Signed code and data; integrity checks on updates and pipelines; avoid deserializing untrusted data |
| A09 | Security Logging and Alerting Failures | No record of login failures, access violations or admin actions; secrets or personal data in logs; no alerting | Log security events with context; protect log integrity; alert on defined conditions and test the alerts |
| A10 | Mishandling of Exceptional Conditions | Failing open; unhandled exceptions; leaked stack traces; resource exhaustion; inconsistent error handling | Central error handling; fail closed; resource limits; tests for failure paths |

Changes from the 2021 list: SSRF is now part of A01; A03 widens "Vulnerable and Outdated Components" to the whole software supply chain; A10 is new; A09 now says "Alerting".

## 2. OWASP API Security Top 10:2023

| ID | Name | Quick test |
| --- | --- | --- |
| API1 | Broken Object Level Authorization | Swap object IDs across users and tenants on every endpoint that takes an ID |
| API2 | Broken Authentication | Tamper with, expire and replay tokens; check brute-force limits and reset flows |
| API3 | Broken Object Property Level Authorization | Mass assignment (`role`, `isAdmin`); responses carrying fields the caller should not see |
| API4 | Unrestricted Resource Consumption | Rate limits, page-size caps, payload size and depth, expensive operations |
| API5 | Broken Function Level Authorization | Call admin functions with a low-privilege token |
| API6 | Unrestricted Access to Sensitive Business Flows | Automate sign-up, purchase and reset flows; check per-account limits |
| API7 | Server Side Request Forgery | Point URL-accepting parameters at internal addresses |
| API8 | Security Misconfiguration | CORS, security headers, verbose errors, unneeded methods |
| API9 | Improper Inventory Management | Old API versions, undocumented endpoints, non-production hosts |
| API10 | Unsafe Consumption of APIs | Hostile, slow or malformed replies from third-party APIs; validate their data like user input |

## 3. OWASP Top 10 for LLM Applications 2025

| ID | Risk | Quick test |
| --- | --- | --- |
| LLM01 | Prompt Injection | Hide instructions in documents, web pages, emails and tool output the system ingests; check whether it obeys them against policy |
| LLM02 | Sensitive Information Disclosure | Probe for other users' data, secrets in context and memorised data; check retrieval permissions |
| LLM03 | Supply Chain | Inventory models, datasets, plugins and libraries; verify provenance and file formats |
| LLM04 | Data and Model Poisoning | Review how training, fine-tuning and embedding data are collected and approved |
| LLM05 | Improper Output Handling | Make the model emit markup or command-like strings and see whether downstream code interprets them |
| LLM06 | Excessive Agency | List the tools and permissions; try to make the agent act beyond the caller's own rights |
| LLM07 | System Prompt Leakage | Try to extract hidden instructions; look for credentials or internal rules inside them |
| LLM08 | Vector and Embedding Weaknesses | Test cross-tenant retrieval, injected documents and leakage from embeddings |
| LLM09 | Misinformation | Run grounded-answer and citation checks on domain question sets |
| LLM10 | Unbounded Consumption | Test long inputs, runaway agent loops, rate limits and cost caps |

## 4. Controls checklist

- [ ] Authorization is enforced on the server for every request, denies by default, and checks the object's owner or tenant
- [ ] Queries are parameterised (or use ORM binding); output is encoded for its context; a Content-Security-Policy is set
- [ ] Passwords use Argon2id, bcrypt or scrypt; MFA is available; throttling or lockout exists; reset tokens are single-use and short-lived
- [ ] Cookies are `HttpOnly`, `Secure` and `SameSite`; the session is rotated on login; idle and absolute timeouts exist
- [ ] TLS 1.2 or later (prefer 1.3) and HSTS; headers set: `X-Content-Type-Options`, CSP `frame-ancestors`, `Referrer-Policy`, `Permissions-Policy`
- [ ] Secrets live in a vault or secret manager, are rotated, and never appear in the repository, images or logs
- [ ] File uploads: type allow-list, size limit, renamed files, stored outside the web root, scanned
- [ ] Outbound requests: host allow-list, link-local and metadata addresses blocked, redirects disabled or revalidated
- [ ] Logging records who, what, when and result; no secrets or personal data; tamper-resistant; alerts on abuse
- [ ] Supply chain: pinned dependencies and lockfiles, SBOM, signed artifacts, least-privilege CI tokens, CI actions pinned to a commit SHA

## 5. See also

OWASP ASVS (verification requirements), OWASP Web Security Testing Guide (test procedures), and the CWE Top 25 (weakness identifiers for findings).
