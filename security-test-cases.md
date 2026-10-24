# Security test case library

46 reusable, non-destructive test cases for common web features. Run them only on systems you are authorised to test. References: A01 to A10 are OWASP Top 10:2025 categories; CWE identifiers name weakness types.

## Authentication, recovery and sessions

| ID | Type | Test | Expected secure result | Ref |
| --- | --- | --- | --- | --- |
| LOGIN-01 | positive | Log in with valid credentials | Success; a new session ID is issued; no secrets shown | A07, ASVS V6 |
| LOGIN-02 | negative | Log in with a wrong password, then with an unknown user | Same message and similar timing for both; no account enumeration | A07, CWE-203 |
| LOGIN-03 | boundary | Fail the login N-1, N and N+1 times, where N is the lockout threshold | Throttling or lockout starts at the defined threshold; the real user can recover; lockout cannot be abused for easy denial of service | A07, CWE-307 |
| LOGIN-04 | boundary | Set passwords of 7, 8, 14, 15, 64 and 65 characters, with spaces and Unicode | Rules match the policy (SP 800-63B-4: 15 minimum for single factor, 8 with MFA, 64 or more accepted); no composition rules | A07, NIST 800-63B-4 |
| LOGIN-05 | negative | Set a password from a public breach list | Rejected with a clear message | A07, NIST 800-63B-4 |
| LOGIN-06 | negative | Send credentials over plain HTTP, then check redirects and headers | No credentials accepted over HTTP; HTTPS enforced; HSTS present | A04, CWE-319 |
| LOGIN-07 | negative | With MFA on, request a post-login page directly without completing the second step | Access denied until the second factor is done | A07, CWE-306 |
| RESET-01 | positive | Request a reset for a valid account and for an unknown one | Identical generic response; single-use, time-limited link | A07 |
| RESET-02 | negative | Reuse a reset link; use an expired one; use one issued before the password changed | Rejected each time | A07, CWE-640 |
| RESET-03 | negative | Alter the token or the user identifier inside the reset link | Rejected; no information about the account | A07, CWE-640 |
| RESET-04 | exploratory | Request many resets for one account, then for many accounts | Rate limited; older tokens invalidated; user notified | A07 |
| SESS-01 | positive | Log in and inspect the session cookie | Secure, HttpOnly and SameSite set; unpredictable value | ASVS V7 |
| SESS-02 | negative | Reuse an old session ID after logout and after a password change | Rejected: invalidation happens on the server | ASVS V7, CWE-613 |
| SESS-03 | boundary | Act one minute before and one minute after the idle and absolute timeouts | Session ends at the configured limits | ASVS V7 |
| SESS-04 | negative | Set a known session ID before login, then log in | A new ID is issued at login; the old one is invalid | CWE-384 |
| SESS-05 | negative | Send a state-changing request from another origin without the anti-CSRF defence | Request refused | CWE-352 |

## Access control and APIs

| ID | Type | Test | Expected secure result | Ref |
| --- | --- | --- | --- | --- |
| AC-01 | negative | As user A, request user B's record by changing the identifier | 403 or 404; no data returned | A01, API1, CWE-639 |
| AC-02 | negative | As a low-privilege user, call an administrative function through the UI route and the API | 403; action not performed; attempt logged | A01, API5, CWE-862 |
| AC-03 | negative | Without logging in, request protected pages and files directly | 401 or redirect; no content | A01, CWE-306 |
| AC-04 | negative | Add unexpected fields such as role, isAdmin or price to a profile update | Ignored or rejected; stored values unchanged | API3 |
| AC-05 | exploratory | Check export, search, reports, attachments, caches and WebSockets for another user's or tenant's objects | Same authorization as the main path | A01, API1 |
| AC-06 | negative | Downgrade a user's role, then replay a request made under the old role | Denied immediately | ASVS V8 |
| API-01 | boundary | Send one request more than the rate limit allows | 429 with a retry hint; limit applies per user or key | API4, CWE-770 |
| API-02 | negative | Modify the payload of a signed token and send it | 401; signature and claims validated | API2, CWE-347 |
| API-03 | negative | Call an older API version or an undocumented endpoint seen in traffic | Disabled, or protected like the current version | API9 |
| API-04 | negative | Send the wrong content type, wrong JSON types, a huge array and duplicate keys | Clean 4xx error; no stack trace; no crash | API8, A10 |

## Input handling, files and payments

| ID | Type | Test | Expected secure result | Ref |
| --- | --- | --- | --- | --- |
| INP-01 | boundary | In every text field try empty, 1 character, maximum length, maximum plus one, very long, Unicode and mixed encodings | Server-side validation; clean error; no silent truncation or corruption | CWE-20 |
| INP-02 | negative | Enter quote, angle-bracket, template and path-style characters in each field and watch responses and rendered output | Treated as data; no interpreter errors; output encoded for its context | A05, CWE-79, CWE-89 |
| INP-03 | negative | Store a harmless marker string with markup characters in names and comments, then view it as another user | Shown as text, never executed | A05, CWE-79 |
| INP-04 | negative | In a lab, give URL-type parameters (webhook, import, image fetch) local and internal addresses | Blocked by an allow-list | API7, CWE-918 |
| FILE-01 | positive | Upload a valid file exactly at the size limit | Accepted and stored safely | A06 |
| FILE-02 | boundary | Upload the limit plus one byte, and a zero-byte file | Rejected with a clear error | CWE-434, CWE-770 |
| FILE-03 | negative | Upload a disallowed type, a double extension and a file whose content does not match its declared type | Rejected on the server by content, not only by name | A06, CWE-434 |
| FILE-04 | negative | Upload the harmless EICAR antivirus test file | Detected and quarantined | Malware scanning |
| FILE-05 | negative | Fetch an uploaded file by direct URL as another user, and check that it is not executed | Authorization applies; served as data | A01 |
| PAY-01 | negative | Change price, quantity, currency or discount in the request | The server recalculates from trusted data; mismatches rejected | A06 |
| PAY-02 | negative | Replay a payment confirmation, skip a step, submit twice at once | Each order paid once; step order enforced | A06 |
| PAY-03 | boundary | Use quantity 0, -1, maximum and maximum plus one, and amounts with many decimals | Rejected or handled per business rule | A06 |

## Configuration, errors and logging

| ID | Type | Test | Expected secure result | Ref |
| --- | --- | --- | --- | --- |
| CFG-01 | negative | Request default, admin and debug pages, directory listings and sample files | Not exposed | A02 |
| CFG-02 | positive | Inspect response headers on key pages | HSTS, CSP, X-Content-Type-Options and Referrer-Policy present; no version banners | A02 |
| CFG-03 | negative | Scan the TLS configuration | TLS 1.2 or later only; strong ciphers; valid certificate chain | A04 |
| ERR-01 | negative | Force errors with malformed requests and a dependency timeout | Generic message plus a request ID; no stack trace | A10, CWE-209 |
| ERR-02 | negative | Make the authorization check itself fail, for example by making the policy service unavailable | Access denied: the system fails closed | A10, CWE-636 |
| LOG-01 | positive | Perform a failed login, an access denial, a role change and an admin action | Each is logged with actor, time, source and result; no secrets | A09, CWE-778 |
| LOG-02 | negative | Put newline and control characters in a field that gets logged | Neutralised in the log | A09, CWE-117 |
| LOG-03 | positive | Trigger a defined alert condition, such as ten failed logins | The alert reaches the on-call person within the target time | A09 |
