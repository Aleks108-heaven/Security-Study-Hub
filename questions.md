# Practice questions

126 original single-answer questions, tagged with topic and ISTQB knowledge level (K1 to K4). Not real exam questions. Each topic ends with its answer key. † marks an item whose fact was not re-checked on 2026-10-23.

## Cybersecurity foundations (hub section 3)

**1. [K1]** An attacker changes the total on an order in transit and nobody notices. Which security property was violated?

- A. Availability
- B. Confidentiality
- C. Integrity
- D. Accountability

**2. [K2]** Which statement correctly distinguishes a threat from a vulnerability?

- A. A threat is a weakness in software; a vulnerability is the attacker who uses it.
- B. A threat is a confirmed breach; a vulnerability is a possible breach.
- C. They mean the same thing; vulnerability is only the technical term.
- D. A threat is a potential cause of harm; a vulnerability is a weakness a threat can use.

**3. [K3]** A login form answers 'Unknown user' for a name that does not exist and 'Wrong password' for one that does. Which property is mainly weakened?

- A. Integrity, because an attacker can then alter the stored password records
- B. Availability, because the two messages make logins slower
- C. Confidentiality, because the response reveals which accounts exist
- D. Non-repudiation, because user actions can no longer be traced

**4. [K2]** Which design principle says that when a component fails, access is denied rather than granted?

- A. Security by obscurity
- B. Complete mediation
- C. Least privilege
- D. Fail securely

**5. [K3]** In a finance tool, one clerk can both create and approve refunds. Which principle is violated?

- A. Separation of duties
- B. Fail securely
- C. Complete mediation
- D. Defence in depth

**6. [K2]** How do a security audit and a security test relate?

- A. They complement each other: audits check conformance, tests check resistance
- B. An audit replaces testing whenever the standard is mandatory for the whole system
- C. A test replaces an audit, because testing is more technical and finds more
- D. They are the same activity, and the two names come from different teams

**7. [K1]** In the AAA trio, which element records what an actor did?

- A. Authentication
- B. Accounting
- C. Availability
- D. Authorization

**8. [K4]** A company has a strong perimeter firewall but a flat internal network. One phished laptop leads to the customer database. Which missing idea best explains how far the attack spread?

- A. Defence in depth, with verification inside the network as zero trust asks
- B. Security by obscurity, hiding the internal hosts from view
- C. Fail securely, so that a crashed component never grants access
- D. Non-repudiation, proving which user performed each action

**9. [K2]** Which expression gives risk in its simplest form?

- A. The technical severity score of the vulnerability on its own
- B. Likelihood multiplied by impact for a specific scenario
- C. The number of vulnerabilities found by the latest scan
- D. The total cost of the security controls in the budget

### Answers: Cybersecurity foundations

| # | Answer | Why |
| --- | --- | --- |
| 1 | C | Integrity means information cannot change without authorisation or without detection. An order total altered in transit is an attack on integrity, not on confidentiality (reading) or availability (use). |
| 2 | D | A threat is described by actor, capability and intent; a vulnerability is the weakness it can use, and an exploit is the way of using it. |
| 3 | C | This is account enumeration: the difference leaks information about users. The expected result is the same message and similar timing for both cases. |
| 4 | D | Failing securely means failing closed. Complete mediation is about checking every access, not about error behaviour. |
| 5 | A | Separation of duties means no single person can complete a sensitive action alone. One clerk who both creates and approves a refund can commit fraud unseen, so approval should need a second person. |
| 6 | A | An audit checks conformance to a policy; a test tries to show whether controls resist an attack scenario. |
| 7 | B | Authentication is who you are, authorization is what you may do, accounting is what you did. |
| 8 | A | Once past the perimeter there was no independent internal layer. Zero trust says not to grant access because of network location. |
| 9 | B | Risk is judged per scenario, not per vulnerability, and combines how likely and how costly it is. |

## ISTQB security testing core (hub section 4)

**1. [K1]** Which ISTQB certificate launched in February 2025 as a successor to the 2016 Security Tester syllabus?

- A. CT-STE, Security Test Engineer
- B. CTFL v4.0.1, Foundation Level
- C. CTAL-TM, Advanced Level Test Manager
- D. CT-AI, Certified Tester AI Testing

**2. [K1]** How many points are needed to pass the CT-STE exam?

- A. 26 of 40 points (65%)
- B. 52 of 80 points (65%)
- C. 28 of 43 points (65%)
- D. 30 of 43 points (70%)

**3. [K2]** Which statement about holders of the legacy CT-SEC certificate is correct?

- A. They are automatically awarded CT-STE because the new syllabus covers the same content
- B. They keep CT-SEC and automatically receive CT-STA as soon as that exam is released
- C. There is no grandfathering: they must pass the CT-STE or CT-STA exam to hold those titles
- D. They receive CT-STE after paying a conversion fee and submitting their old CT-SEC certificate

**4. [K1]** What is the prerequisite for taking the CT-STE exam?

- A. The ISTQB Certified Tester Foundation Level (CTFL)
- B. CTFL plus three years of security experience
- C. An advanced-level ISTQB certificate
- D. CISSP

**5. [K2]** Which theme has its own chapter in the 2016 CT-SEC syllabus but not in CT-STE v1.0.1?

- A. Standards and best practices
- B. Human factors in security testing
- C. Reporting security test results
- D. Security testing tools

**6. [K1]** At which K-level are keywords and security domain-specific terms examinable in CT-STE?

- A. K4, analyse
- B. K2, understand
- C. K1, remember
- D. K3, apply

**7. [K2]** What do standards primarily give a security tester, in ISTQB's view?

- A. Guaranteed protection against attacks for every system that follows them
- B. A mandatory list of tools that every tester has to purchase and install
- C. Test oracles (what correct means), a shared vocabulary and audit evidence
- D. Legal immunity while testing, as long as the standard is cited in the plan

**8. [K3]** A CT-STE candidate has 75 minutes for 40 questions. Which plan fits?

- A. Answer the sure ones first, flag the rest and budget about 1.9 minutes per question
- B. Spend five minutes on each question and skip whatever is left at the end
- C. Read every question twice before answering any, then start from the last one
- D. Answer only the K1 questions and leave the other levels blank

**9. [K2]** Which five stages does the 2016 CT-SEC syllabus define for the security test process?

- A. Planning, design, execution, evaluation and maintenance
- B. Discovery, exploitation, escalation, persistence and reporting
- C. Identify, protect, detect, respond and recover
- D. Preparation, detection, containment, eradication and recovery

### Answers: ISTQB security testing core

| # | Answer | Why |
| --- | --- | --- |
| 1 | A | CT-STE launched in February 2025 and, together with a planned CT-STA, replaces the 2016 CT-SEC syllabus. CTFL is the Foundation prerequisite, not a security successor. |
| 2 | C | CT-STE has 40 questions worth 43 points in 75 minutes. 26 of 40 is the CTFL pass mark and 52 of 80 is the CT-SEC pass mark. |
| 3 | C | ISTQB states there is no grandfathering. CT-SEC holders keep their CT-SEC certificate, but nothing converts automatically, so they must pass the CT-STE or CT-STA exam to hold those titles. |
| 4 | A | CT-STE requires the Foundation Level (CTFL). The extra three years of experience belonged to the older CT-SEC requirement and does not apply here. |
| 5 | B | CT-SEC chapter 6 covers human factors; CT-STE has no dedicated chapter for it. |
| 6 | C | CT-STE makes all keywords and security domain-specific terms examinable at K1. |
| 7 | C | Standards define 'correct'. Mandatory ones come from regulation or contract, voluntary ones are chosen as good practice. |
| 8 | A | 75 minutes divided by 40 questions is about 1.9 minutes each; flagging protects the time. |
| 9 | A | The others are a penetration-test lifecycle, the older five CSF functions and the incident-response lifecycle. |

## Security test process and risk-based planning (hub sections 5 and 18)

**1. [K1]** Which order shows the stages of the security test process?

- A. Scan, exploit, report, retest, close
- B. Plan, design, execute, evaluate, maintain
- C. Plan, execute, design, report, close
- D. Design, plan, execute, maintain, evaluate

**2. [K2]** Why does the Plan stage decide whether the later stages are legal and safe?

- A. It selects the scanner, and a bought scanner makes later tests legal
- B. It is where the exploit code is written and approved by management
- C. It is the only stage that produces evidence for the final report
- D. It produces the signed authorisation, scope and rules of engagement

**3. [K3]** A test lead ranks four scenarios. Which should get the deepest testing first? Invoice read by another customer (likelihood high, impact high); credential stuffing (high, medium); stored script in a comment field (medium, medium); outdated library with a known flaw (medium, medium).

- A. A stored script in a comment field
- B. A customer reads another customer's invoice
- C. An outdated library with a known flaw
- D. Credential stuffing on login

**4. [K3]** The lockout threshold is 5 failed logins. Which tests best apply boundary value analysis?

- A. 1, 10 and 100 failed logins
- B. 5 failed logins spread over five accounts
- C. 6 failed logins only
- D. 4, 5 and 6 consecutive failed logins

**5. [K3]** Which ISTQB technique best finds a flaw where a password-reset link still works after the password was changed?

- A. Statement coverage
- B. Equivalence partitioning
- C. Boundary value analysis
- D. State transition testing

**6. [K2]** Which is the best example of an exit criterion for a security test?

- A. The scanner reports zero findings on its last run against the test environment
- B. The planned number of test days has passed, whatever was covered by then
- C. All high-priority scenarios executed; no critical finding open without risk acceptance
- D. All executed tests passed on the first run, so no retest was needed

**7. [K3]** A tester must show that each role can or cannot perform each action on each object type. Which technique fits?

- A. Decision table testing
- B. Equivalence partitioning of passwords
- C. Fuzzing
- D. Exploratory testing

**8. [K3]** During execution a tester finds real customer records in the test environment. What is the best response?

- A. Keep using them, because real data makes the test results more realistic
- B. Paste a few of the records into the report as proof of the exposure
- C. Stop using them, report it and continue with masked or synthetic data
- D. Copy them to a personal spreadsheet and anonymise them there first

**9. [K4]** A report lists 80 'critical' findings copied from a scanner, none manually verified. Which weakness in the Evaluate stage does this show?

- A. Tool output was treated as a verdict, without verification or a severity rationale
- B. The report was marked too confidential for the stakeholders to act on it
- C. The scanner was open source, so its findings cannot be trusted
- D. Too few of the tests were automated, so the scanner covered too little

**10. [K2]** Against what is security test coverage measured?

- A. Lines of code executed by the functional test suite, as for any other test type
- B. The number of security tools run in the pipeline and how often they ran
- C. Concrete items: threat-model elements, requirements, ASVS or Top 10 categories
- D. The number of hours the testers spent on the system during the project

### Answers: Security test process and risk-based planning

| # | Answer | Why |
| --- | --- | --- |
| 1 | B | The process runs plan, design, execute, evaluate, maintain. Planning comes first because it fixes scope, approvals and risks, and maintain closes the loop by keeping the tests current. |
| 2 | D | Without signed written authorisation naming the tester, targets and dates, no test should run. The Plan stage also fixes scope and rules of engagement, so it decides whether later stages are legal and safe. |
| 3 | B | Risk-based testing ranks scenarios by likelihood and impact. The invoice read is rated high on both, so it gets the deepest testing first; credential stuffing is high likelihood but only medium impact. |
| 4 | D | Boundary tests sit at N-1, N and N+1, and also confirm that the real user can recover. |
| 5 | D | A reset link that survives a password change breaks the intended order of states. State transition testing attacks out-of-order, replayed and reused steps, which techniques working on input values (equivalence partitioning, boundary values) do not target. |
| 6 | C | Exit criteria tie to risk coverage and the handling of findings, not to the tool or the calendar. |
| 7 | A | A role x action x object matrix is a decision table; automate it for regression. |
| 8 | C | Real customer data in a test environment is a privacy and compliance problem: stop using it, report it and continue with masked or synthetic data, without copying it anywhere else. |
| 9 | A | Tool output is a lead, not a verdict. Verify each finding and justify severity. |
| 10 | C | Without a concrete reference, 'coverage' cannot show what was left untested. |

## SDLC and DevSecOps (hub section 6)

**1. [K1]** Which test type probes the running application from outside?

- A. SAST
- B. Secret scanning
- C. SCA
- D. DAST

**2. [K2]** Which defect is a SAST tool least likely to find?

- A. A call to an unsafe or deprecated library function
- B. A business-logic flaw such as skipping a checkout step
- C. A SQL query string built by concatenating raw user input
- D. A hard-coded password stored in a source code file

**3. [K2]** What does software composition analysis report?

- A. How the running application behaves when it is attacked
- B. Weak or reused passwords in the production user database
- C. Business-logic flaws in the code your own team wrote
- D. Known-vulnerable third-party components and their licence issues

**4. [K3]** Developers ignore a pipeline gate that fails on every old finding in the backlog. Which change keeps the gate useful?

- A. Lower the severity of every old finding so the gate stops failing
- B. Block only on new, high-confidence, high-severity findings in changed code
- C. Run the gate only once a month instead of on every single change, to reduce noise
- D. Disable scanning in feature branches and scan only the main branch

**5. [K2]** What is an SBOM?

- A. A signed approval that allows the team to run security tests
- B. A machine-readable list of the components inside software
- C. A summary report of all penetration tests done on the system
- D. A backup copy of the source code kept in a separate location

**6. [K3]** Which security activity belongs at the Design stage?

- A. Dependency scanning of the nightly build
- B. Threat modelling and secure design review
- C. Authenticated DAST against the staging site
- D. Applying emergency patches in production

**7. [K2]** Which is an example of a shift-right control?

- A. A security requirements workshop with the product owner
- B. Pre-commit secret scanning on every developer laptop
- C. Threat modelling during the design stage of a feature
- D. Production monitoring with a disclosure channel and bug bounty

**8. [K4]** A team runs SAST, SCA and DAST in CI and sees no serious findings, yet a penetration test shows users reading each other's invoices. What best explains the gap?

- A. The penetration tester used a faster scanner with newer detection rules
- B. Invoices are outside the OWASP Top 10, so scanners never look at them
- C. Scanners rarely detect authorization flaws and role-by-object tests were missing
- D. SAST must have been disabled, because DAST alone would catch this flaw

**9. [K2]** Which framework is a maturity model scored across five business functions?

- A. CIS Controls
- B. NIST SSDF
- C. OWASP SAMM
- D. SLSA

### Answers: SDLC and DevSecOps

| # | Answer | Why |
| --- | --- | --- |
| 1 | D | DAST (dynamic application security testing) sends requests to the running application from outside. SAST and SCA analyse code and components without running anything, and secret scanning searches repositories. |
| 2 | B | SAST reads code patterns such as concatenated SQL, hard-coded secrets and unsafe APIs. A business-logic flaw like skipping a checkout step belongs to the workflow, which needs design review, dynamic tests and manual testing. |
| 3 | D | Software composition analysis matches your component inventory against vulnerability databases and licence data. It does not find flaws in your own code or in runtime behaviour. |
| 4 | B | A gate that fails on every old finding is always red and gets switched off. Gate on new findings in changed code, block only on high-confidence, high-severity results, and work the backlog separately. |
| 5 | B | An SBOM is a machine-readable inventory of the components in software, in formats such as SPDX or CycloneDX, so you can find affected products quickly when a component is disclosed as vulnerable. |
| 6 | B | At the Design stage, threat modelling and secure design review find flaws before any code exists. Check that each threat has a mitigation and each mitigation has a test. |
| 7 | D | Shift-right adds controls after release; shift-left alone is a listed failure mode. |
| 8 | C | Treating scanner output as the test is a named failure mode; keep scripted and manual authorization tests. |
| 9 | C | SAMM scores governance, design, implementation, verification and operations. † |

## Web application security (hub section 7)

**1. [K1]** Which category is first in OWASP Top 10:2025?

- A. A04 Cryptographic Failures
- B. A02 Security Misconfiguration
- C. A01 Broken Access Control
- D. A05 Injection

**2. [K2]** Where was server-side request forgery placed in the 2025 Top 10?

- A. Merged into A02 Security Misconfiguration
- B. Merged into A01 Broken Access Control
- C. Kept as its own A10
- D. Merged into A05 Injection

**3. [K1]** Which OWASP resource explains how to test web applications?

- A. The Web Security Testing Guide (WSTG)
- B. The Top 10, the list of the most critical risks
- C. ASVS, the Application Security Verification Standard
- D. SAMM, the Software Assurance Maturity Model

**4. [K3]** A tester changes /invoice/1001 to /invoice/1002 and sees another customer's invoice. Which Top 10:2025 category is this?

- A. A01 Broken Access Control
- B. A04 Cryptographic Failures
- C. A05 Injection
- D. A07 Authentication Failures

**5. [K3]** A session cookie lacks the HttpOnly flag. Which risk increases?

- A. The cookie can be sent over plain HTTP connections
- B. The cookie is also sent along with requests to other sites
- C. The cookie never expires, even after the user logs out
- D. Script injected through XSS can read the cookie

**6. [K3]** A query is built by concatenating user input. Which fix addresses the root cause?

- A. A longer input length limit
- B. Parameterised queries
- C. Hiding database error messages
- D. Blocking the word SELECT

**7. [K2]** What does ASVS provide?

- A. A catalogue of common weakness types with numbered identifiers
- B. A ranked list of the ten most common application risks
- C. Testable requirements grouped into three verification levels
- D. A step-by-step guide for running each type of scan

**8. [K3]** An upload form accepts invoice.pdf.php and stores it in the web root where it can be requested. Which controls address this?

- A. Check the file extension in client-side JavaScript before the upload
- B. Rename uploaded files to lower case and keep them in the web root
- C. Check content type on the server, store outside the web root, never execute uploads
- D. Raise the maximum upload size so that legitimate invoices are accepted

**9. [K3]** The application lets requests through when its policy service is unavailable. Which Top 10:2025 category fits best?

- A. A08 Software or Data Integrity Failures
- B. A10 Mishandling of Exceptional Conditions
- C. A09 Security Logging and Alerting Failures
- D. A07 Authentication Failures

**10. [K2]** Which change did the 2025 Top 10 make compared with 2021?

- A. Injection moved up from third place to first place
- B. Cryptographic Failures rose from second place to first place
- C. Insecure Design was removed from the list altogether
- D. Security Misconfiguration rose from fifth to second place

### Answers: Web application security

| # | Answer | Why |
| --- | --- | --- |
| 1 | C | Broken Access Control is A01 in the 2025 list, as in 2021. Security Misconfiguration rose to A02, while Cryptographic Failures fell to A04 and Injection to A05. |
| 2 | B | In the 2025 list SSRF is no longer its own category: it was folded into A01 Broken Access Control. A10 in 2025 is the new Mishandling of Exceptional Conditions. |
| 3 | A | Top 10 raises awareness, ASVS lists requirements, WSTG explains how to test. |
| 4 | A | Changing an identifier to read someone else's record is an insecure direct object reference, which is an access-control failure (A01); in API terms it is BOLA. No authentication or injection flaw is involved. |
| 5 | D | HttpOnly hides the cookie from script; Secure and SameSite address the other risks. |
| 6 | B | Parameterised queries keep data and code apart, which removes the root cause. Length limits, hidden errors and keyword blocking are weak, bypassable layers at best. |
| 7 | C | ASVS lists testable requirements at three verification levels; choose a level per application from its risk. It is not a scan guide (that is WSTG), a weakness catalogue (CWE) or the Top 10 list. |
| 8 | C | Client-side checks can be bypassed, so the server must decide: check the content, store files outside the web root and never execute uploads. A double extension such as .pdf.php is the classic trick. |
| 9 | B | Failing open is a classic exceptional-condition flaw; the secure behaviour is to fail closed. |
| 10 | D | Injection fell from third to fifth and Cryptographic Failures from second to fourth. |

## API security (hub section 8)

**1. [K1]** What is API1:2023?

- A. Broken Object Level Authorization
- B. Server Side Request Forgery
- C. Broken Authentication
- D. Unrestricted Resource Consumption

**2. [K3]** A profile update accepts a role field set to admin and the user becomes an administrator. Which API risk is this?

- A. API9 Improper Inventory Management
- B. API3 Broken Object Property Level Authorization
- C. API5 Broken Function Level Authorization
- D. API1 Broken Object Level Authorization

**3. [K3]** An ordinary user can successfully call an administrative delete endpoint. Which API risk is this?

- A. API5 Broken Function Level Authorization
- B. API3 Broken Object Property Level Authorization
- C. API4 Unrestricted Resource Consumption
- D. API7 Server Side Request Forgery

**4. [K2]** Why are random UUID object identifiers not a fix for BOLA?

- A. Unguessable IDs are not access control; each handler must still check ownership
- B. UUIDs are slower to compare, which opens a timing side channel
- C. UUIDs are not permitted in REST URLs under the OWASP guidance
- D. UUIDs can be decrypted back into the underlying database row numbers

**5. [K3]** A script books thousands of appointments through a legitimate flow to block competitors. Which API risk is this?

- A. API2 Broken Authentication, because the script logs in repeatedly
- B. API8 Security Misconfiguration of the booking service
- C. API10 Unsafe Consumption of APIs from third-party providers
- D. API6 Unrestricted Access to Sensitive Business Flows

**6. [K3]** A webhook-setup parameter makes the server request an internal address supplied by the caller. Which risk is being tested?

- A. API4 Unrestricted Resource Consumption
- B. API7 Server Side Request Forgery
- C. API9 Improper Inventory Management
- D. API8 Security Misconfiguration

**7. [K2]** Which approach gives systematic coverage of API authorization?

- A. A review of the OpenAPI file alone, without sending requests
- B. One smoke test per endpoint using a single admin account
- C. A DAST scan run with default settings and no test accounts
- D. A role x endpoint x object matrix, automated with scripts

**8. [K2]** Which checks belong to JWT validation?

- A. Only that the token is Base64 encoded and under 4 KB
- B. Only the expiry, because a signed token cannot be forged or replayed
- C. Only the issuer, because the other claims are advisory
- D. Signature, algorithm allow-list, issuer, audience and expiry

**9. [K3]** A GraphQL endpoint allows 500 login attempts in one request by aliasing the same mutation. Which control helps most?

- A. Disable HTTPS between the gateway and the API for speed
- B. Limit batching, aliasing and query complexity, and rate-limit by cost
- C. Allow introspection in production so that clients can adapt
- D. Increase the page size so that clients need fewer requests

### Answers: API security

| # | Answer | Why |
| --- | --- | --- |
| 1 | A | API1:2023 is Broken Object Level Authorization (BOLA), the first entry in the 2023 API list. SSRF is API7, Broken Authentication is API2 and Unrestricted Resource Consumption is API4. |
| 2 | B | Setting a protected property such as role through an update is mass assignment, covered by API3 Broken Object Property Level Authorization. Writes must accept only allow-listed fields. |
| 3 | A | Calling an administrative function as an ordinary user is Broken Function Level Authorization (API5). The server must check the role for each function, not merely hide the button. |
| 4 | A | IDs leak through lists, logs and shared links; the server must check access. |
| 5 | D | Abusing a legitimate flow at scale, such as booking slots to block competitors, is API6 Unrestricted Access to Sensitive Business Flows. Identify the sensitive flows, then limit and monitor them. |
| 6 | B | Making the server fetch a caller-supplied internal address is API7 Server Side Request Forgery. Control it with destination allow-lists and by blocking internal address ranges. |
| 7 | D | A role x endpoint x object matrix is a decision table: it covers every combination systematically, and scripts or a proxy extension make it repeatable. A default scan or one smoke test per endpoint misses object-level checks. |
| 8 | D | Validate every claim you rely on: the signature, an algorithm allow-list, the issuer, the audience and the expiry. Checking only one of them leaves forged or misdirected tokens working. |
| 9 | B | Aliasing and batching let an attacker pack many attempts into one request and dodge request-based rate limits. Limit them, bound query complexity and rate-limit by cost. |

## Security mechanisms (hub section 9)

**1. [K2]** Which password policy is consistent with NIST SP 800-63B-4 for single-factor use?

- A. Minimum 15 characters, no composition rules, breached-password check
- B. A maximum length of 12 characters so that users can remember it
- C. Minimum 8 characters with upper, lower, digit and symbol required
- D. Forced rotation every 90 days, with a new password of at least 12 characters

**2. [K3]** The policy requires at least 15 characters for single-factor passwords. Which two inputs best test the minimum?

- A. A 14-character and a 15-character password
- B. A 14-character and a 16-character password
- C. A 1-character and a 100-character password
- D. An 8-character and a 16-character password

**3. [K3]** After logout, the old session ID still returns the account page. Which check failed?

- A. Idle timeout boundary on the session cookie
- B. Cookie flag check for Secure and HttpOnly
- C. Server-side session invalidation on logout
- D. CSRF defence on the logout request

**4. [K2]** Why test egress traffic as well as ingress?

- A. Unrestricted outbound traffic is how stolen data leaves
- B. Ingress rules cannot be tested without access to the provider
- C. Egress traffic is slower, so it needs separate performance tests
- D. Regulators only audit egress rules, never ingress rules

**5. [K3]** A server still negotiates TLS 1.0. What is the right finding?

- A. A finding only for servers that sit on the internal network
- B. No finding at all as long as strong ciphers are negotiated
- C. A deprecated protocol: disable it and require TLS 1.2 or later
- D. A finding only if the certificate has also expired or is self-signed

**6. [K2]** What is the EICAR file used for?

- A. A real ransomware sample used for analyst training
- B. A tool for fuzzing file-upload endpoints with random bytes
- C. A test certificate for checking TLS client handling
- D. A harmless test file to check that malware scanning works

**7. [K3]** A detection rule fires correctly, but the alert goes to a mailbox nobody reads. Which link of the detection chain failed?

- A. Detection rules
- B. Collection and integrity
- C. Telemetry
- D. Triage and response

**8. [K2]** Which is a cryptography misuse pattern?

- A. Using TLS 1.3
- B. Reusing a nonce or IV with the same key
- C. Using AES-GCM with unique nonces
- D. Hashing passwords with Argon2id and unique salts

**9. [K2]** What is a vertical authorization test?

- A. Using the same role to reach another user's data record
- B. Checking only that tenants cannot see each other's data
- C. Using a lower-privileged role on a higher-privilege function
- D. Testing which TLS ciphers a server will negotiate with clients

**10. [K4]** Test-data masking replaced customer names but kept birth date, postcode and gender. What is the best analysis?

- A. Quasi-identifiers allow re-identification, so the masking is not effective
- B. Only names count as personal data, so the remaining fields are all harmless
- C. Masking is effective, because the direct identifiers have been removed
- D. Masking is effective as long as the masked database is also encrypted

### Answers: Security mechanisms

| # | Answer | Why |
| --- | --- | --- |
| 1 | A | NIST SP 800-63B-4 asks for at least 15 characters for single-factor passwords, forbids composition rules and forced periodic changes, and requires a check against breached passwords. |
| 2 | A | Boundary value analysis tests on both sides of the limit: 14 characters must be rejected and 15 accepted. The other pairs do not straddle the boundary. |
| 3 | C | Reusing an old session ID after logout and password change must be rejected. |
| 4 | A | Stolen data and command-and-control traffic leave through outbound paths, so default-deny egress filtering limits them. Ingress and egress rules are both testable, so test both. |
| 5 | C | TLS 1.0 and 1.1 are deprecated, so negotiating them is a finding whatever the certificate or cipher quality. Disable them, require TLS 1.2 or later and prefer 1.3. † |
| 6 | D | The EICAR file is a harmless standard string that antivirus engines detect, so it shows that upload, mail and endpoint scanning works without using live malware. |
| 7 | D | The rule fired, so telemetry and detection worked; the failure is in triage and response, because nobody reads the mailbox. A control that alerts nobody has failed. |
| 8 | B | Other misuse patterns: ECB mode, MD5 or SHA-1 for security, home-made algorithms and disabled certificate validation. |
| 9 | C | A vertical test uses a lower-privileged role on a higher-privilege function. A horizontal test uses the same role on someone else's data. |
| 10 | A | Birth date, postcode and gender are quasi-identifiers: combined they can single out a person, so the data is still personal. Test obfuscation by attempting re-identification across fields. |

## Mobile, cloud, containers and infrastructure (hub section 10)

**1. [K2]** What is OWASP MASVS?

- A. A verification standard for mobile apps with eight control groups
- B. A catalogue of mobile malware families seen in app stores
- C. A benchmark for hardening cloud accounts and services
- D. A container runtime for running mobile app test builds

**2. [K3]** A mobile app stores its login token in a plain preferences file. Which control is missing?

- A. A longer minimum password length
- B. Storage in the platform keystore
- C. Certificate pinning for API calls
- D. Root and jailbreak detection

**3. [K2]** What should you do first when testing a customer's cloud environment?

- A. Test the provider's own management plane for design weaknesses and exposure
- B. Read the provider's testing policy, confirm authorisation, then start with identity
- C. Scan the provider's whole public address range to map the customer's tenant
- D. Run exploit frameworks against the provider's shared services to gauge impact

**4. [K3]** A storage bucket is publicly readable because the customer configured it so. In the shared responsibility model this finding is...

- A. Not a finding
- B. Application-level
- C. Provider-owned
- D. Customer-configured

**5. [K3]** A container runs privileged as root with no resource limits. Which review area covers this?

- A. Network segmentation
- B. Image vulnerability scan
- C. Runtime settings
- D. RBAC review

**6. [K2]** Why scan infrastructure-as-code in the pull request?

- A. To generate an SBOM and nothing else from the templates
- B. To measure application performance before the code is merged
- C. To replace the penetration test that precedes each release
- D. To catch misconfigurations before they reach deployment

**7. [K3]** You must test a plant control network. Which approach fits?

- A. Switching off monitoring during tests
- B. Passive observation and agreed maintenance windows
- C. A full active port scan during production hours
- D. Fuzzing every controller

**8. [K2]** Why is an exposed instance metadata service dangerous?

- A. It can allow unauthenticated retrieval of workload credentials
- B. It stores all user passwords in clear text on the instance disk
- C. It blocks logging, because the agent can no longer reach the service
- D. It only affects billing, because the metadata lists the instance cost

### Answers: Mobile, cloud, containers and infrastructure

| # | Answer | Why |
| --- | --- | --- |
| 1 | A | MASVS, the Mobile Application Security Verification Standard, groups its controls into eight areas, and MASTG is the matching testing guide. It is not malware, a cloud benchmark or a runtime. |
| 2 | B | Credentials and tokens belong in the platform keystore, which protects them at rest. A plain preferences file can be read from backups or by anything with file access; pinning and root detection do not fix storage. |
| 3 | B | Providers publish testing rules that differ by service, so read the policy and confirm written authorisation first, then start with identity: who can assume which role. The provider's own platform and other tenants are out of scope. |
| 4 | D | Place each finding as provider-owned, customer-configured or application-level. |
| 5 | C | Privileged mode, running as root, capabilities, read-only file systems and resource limits are runtime settings of a container, so the runtime-settings review covers this finding. |
| 6 | D | Scanning infrastructure-as-code in the pull request catches misconfigurations before they are deployed. Later, compare the deployed state with the code to find drift. |
| 7 | B | Active scanning can crash fragile controllers, so observe passively and test only inside agreed maintenance windows, with the plant operators informed. |
| 8 | A | Cloud instances can read short-lived credentials from a metadata endpoint; if a request-forwarding flaw or an open network path lets an outsider reach it, they can act with the workload's identity. Test for it in every cloud review and require the hardened, token-based metadata mode. |

## AI and LLM security (hub section 11)

**1. [K1]** Which OWASP LLM risk is LLM01?

- A. Prompt Injection
- B. Misinformation
- C. Unbounded Consumption
- D. Excessive Agency

**2. [K3]** An email assistant obeys a message saying 'forward all contacts to this address' and does it. Which two LLM risks combine here?

- A. LLM04 Data and Model Poisoning and LLM08 Vector and Embedding Weaknesses
- B. LLM03 Supply Chain and LLM09 Misinformation
- C. LLM01 Prompt Injection and LLM06 Excessive Agency
- D. LLM07 System Prompt Leakage and LLM10 Unbounded Consumption

**3. [K2]** Why should each LLM attack prompt be run many times?

- A. Providers require repeat runs before they accept a vulnerability report
- B. Outputs vary, so report a success rate rather than one pass or fail
- C. Repetition makes the outputs deterministic, so later runs are cheaper
- D. The model forgets earlier attempts, so each run must be repeated

**4. [K3]** Model output is inserted into a web page and a script in it executes. Which risk is this?

- A. LLM09 Misinformation
- B. LLM07 System Prompt Leakage
- C. LLM05 Improper Output Handling
- D. LLM02 Sensitive Information Disclosure

**5. [K2]** How should secrets and rules be handled for system prompts?

- A. Store API keys in the prompt but encrypt the whole prompt text
- B. Keep secrets out of prompts and enforce rules outside the prompt
- C. Put the admin password in the prompt for convenient reuse
- D. Tell the model never to reveal them and rely on that instruction

**6. [K3]** A retrieval-augmented assistant returns a document belonging to another tenant. Which control addresses this?

- A. Per-user retrieval authorization plus tenant isolation in the vector store
- B. A lower temperature setting to make the answers less random overall
- C. A longer system prompt that tells the model to respect each tenant
- D. A larger context window so that fewer retrieved documents get truncated away

**7. [K2]** What is MITRE ATLAS?

- A. A legal register of AI regulations adopted by national governments worldwide
- B. A benchmark suite that scores large language models on reasoning
- C. A public registry of trained AI models and their licences
- D. A knowledge base of adversary tactics and techniques against AI systems

**8. [K2]** Under the Digital Omnibus approved by the European Parliament on 16 June 2026, when do the Annex III high-risk obligations apply?

- A. 2 August 2028
- B. 2 August 2026
- C. 1 January 2030
- D. 2 December 2027

### Answers: AI and LLM security

| # | Answer | Why |
| --- | --- | --- |
| 1 | A | LLM01 in the 2025 list is Prompt Injection, the top-ranked risk. LLM06 is Excessive Agency, LLM09 Misinformation and LLM10 Unbounded Consumption. |
| 2 | C | The hidden instruction is an indirect prompt injection (LLM01), and the assistant acting on it without approval is Excessive Agency (LLM06). Limit the agent's tools and require human approval for high-impact actions. |
| 3 | B | Model outputs vary between runs, so one pass or fail proves little. Report a success rate over many runs and keep the prompts as a regression suite across model and prompt versions. |
| 4 | C | Model output is untrusted data. When it is inserted into a page and a script runs, the risk is LLM05 Improper Output Handling; encode and validate it like any untrusted input. |
| 5 | B | Prompts can leak, so a prompt cannot be the security control. Keep secrets out of it and enforce rules in code, permissions and filters outside the model. |
| 6 | A | Cross-tenant leakage in retrieval is an access-control failure in the data layer. Apply per-user authorization at retrieval time and isolate tenants in the vector store; test cross-tenant queries and injected documents. |
| 7 | D | ATLAS is modelled on MITRE ATT&CK and catalogues tactics, techniques and real case studies for attacks on machine-learning and AI systems. It is a knowledge base, not a regulation, a benchmark or a model registry. † |
| 8 | D | Annex III high-risk obligations move to 2 December 2027, and Annex I obligations to 2 August 2028. Confirm the final published text. † |

## Human factors and social engineering (hub section 12)

**1. [K2]** Which metric best shows that awareness training changed behaviour?

- A. Course attendance and completion rates
- B. The number of simulated phishing emails sent
- C. Click rate on simulated phishing emails alone
- D. Report rate and time to report suspicious messages

**2. [K3]** An email that seems to come from the CEO asks finance to wire money urgently. Which control is most effective?

- A. A longer minimum length in the password policy
- B. Switching off spell-check in the mail client
- C. Blocking all external email at the mail gateway
- D. Out-of-band verification and dual approval for payments

**3. [K3]** A user receives dozens of push prompts at 3 a.m. and eventually approves one. Which control best reduces this?

- A. Disabling MFA for staff who work the night shift
- B. Number matching, rate limits and phishing-resistant MFA
- C. Sending the approval prompt by SMS text message instead of the app
- D. Stricter password complexity rules for every account

**4. [K2]** Which rule applies to phishing simulations?

- A. Report results in aggregate and do not name and shame individuals
- B. Use lures about layoffs and bonuses to make the test feel realistic
- C. Collect the real passwords that users type, for later analysis
- D. Publish click lists to line managers to motivate the team

**5. [K2]** What must a physical tailgating test carry?

- A. A cloned badge made from a real employee's card
- B. A verbal OK from the security guard on duty
- C. A signed authorisation letter carried at all times
- D. Nothing at all, so that the test stays as realistic as possible

**6. [K1]** Which of these is a persuasion lever used in social engineering?

- A. Encryption
- B. Segmentation
- C. Rate limiting
- D. Urgency

**7. [K2]** Which test approach suits deepfake and business email compromise risks?

- A. Live voice-cloning calls to executives without approval
- B. A tabletop exercise or process walkthrough
- C. Network port scanning
- D. Mass phishing of all staff

**8. [K2]** Which controls limit insider risk?

- A. Least privilege, separation of duties and a leaver process
- B. Longer passwords as the only control for insiders
- C. Removing audit logging to protect staff privacy
- D. Shared administrator accounts for the whole team

### Answers: Human factors and social engineering

| # | Answer | Why |
| --- | --- | --- |
| 1 | D | Measure behaviour, not attendance: a rising report rate and a shorter time to report show that people act on suspicious messages. Compare before and after, and use more than one metric. |
| 2 | D | This is business email compromise (CEO fraud). The strongest defence is a process control that does not depend on spotting the fake: out-of-band verification, such as a call-back, plus dual approval. |
| 3 | B | This is MFA fatigue. Number matching, rate limits and phishing-resistant authenticators remove the habit of tapping approve; test the configuration, not the staff. |
| 4 | A | Report simulation results in aggregate and never name and shame individuals. Also avoid lures that exploit real distress, and never collect real passwords. |
| 5 | C | A physical test needs signed written approval carried at all times, so the tester can prove authorisation to guards or police. A verbal OK or a cloned badge is not acceptable. |
| 6 | D | Others: authority, scarcity, social proof, reciprocity, liking and commitment. |
| 7 | B | Deepfake and business-email-compromise risk lives in processes and verification steps, so test them with a tabletop exercise or walkthrough. Unapproved voice cloning or mass phishing is not an acceptable test. |
| 8 | A | Least privilege, separation of duties and a leaver process limit what an insider can do and for how long. Add activity logging and data-loss prevention. |

## Penetration testing and scoring (hub section 13)

**1. [K2]** Which assessment is goal-based, often covert and tests detection and response?

- A. Red team
- B. Vulnerability assessment
- C. Bug bounty
- D. Purple team

**2. [K1]** Which CVSS qualitative band covers scores 7.0 to 8.9?

- A. Medium
- B. Critical
- C. Low
- D. High

**3. [K2]** What does EPSS estimate?

- A. The number of hosts in the estate that are affected
- B. The technical severity of the vulnerability itself
- C. The date on which the vendor will release a patch
- D. The probability of exploitation in the next 30 days

**4. [K3]** CVE A: CVSS 9.8, low EPSS, not in the KEV catalogue, isolated lab server. CVE B: CVSS 7.5, in the KEV catalogue, internet-facing production. Which first?

- A. CVE A, because its Base score is higher than CVE B's
- B. CVE B, because exploitation is observed and exposure is high
- C. Both equally, because both are above the high severity threshold
- D. Neither, until the EPSS score of CVE B is also high

**5. [K2]** Which are the penetration-test phases in NIST SP 800-115?

- A. Scan, exploit, persist and exfiltrate
- B. Preparation, containment, eradication and recovery
- C. Identify, protect, detect, respond and recover
- D. Planning, discovery, attack and reporting

**6. [K2]** What does a CWE identifier tell you?

- A. The patch priority
- B. The exploitation probability
- C. A specific disclosed vulnerability
- D. The type of weakness

**7. [K3]** Before testing a client application hosted by a cloud provider, which item must be settled?

- A. Only a verbal agreement from the application owner's line manager
- B. Written authorisation covering the app and its hosting providers
- C. A Base score assigned for each finding expected in advance
- D. Permission from the tester's own manager and nobody else

**8. [K2]** What does the name CVSS-BTE mean?

- A. A score using the Base, Threat and Environmental groups
- B. A score using Base, Time and Exploit metric groups
- C. A score using the Base and Temporal metric groups
- D. A bug-tracking entry format that is used in scoring reports

**9. [K2]** What is security.txt?

- A. A signed penetration-test report
- B. A scanner configuration
- C. A file giving researchers security contact details
- D. A list of known exploited vulnerabilities

**10. [K4]** A penetration-test report includes screenshots with real customer personal data and a full database dump as an appendix. What is wrong?

- A. Nothing is wrong, because more evidence always makes the report stronger
- B. Evidence should be minimal and sanitised, and the report treated as confidential
- C. The screenshots should be in colour so that reviewers can read the data
- D. The report should be made public so that other teams can learn from it

### Answers: Penetration testing and scoring

| # | Answer | Why |
| --- | --- | --- |
| 1 | A | A red team is goal-based and often covert, testing detection and response as well as prevention. A purple team is collaborative, and a vulnerability assessment is broad and mostly automated. |
| 2 | D | CVSS qualitative bands: Low 0.1 to 3.9, Medium 4.0 to 6.9, High 7.0 to 8.9 and Critical 9.0 to 10.0. |
| 3 | D | EPSS estimates the probability that a vulnerability is exploited in the next 30 days. CVSS rates severity, and the KEV catalogue lists vulnerabilities with observed exploitation. |
| 4 | B | Combine severity, likelihood, observed exploitation and exposure. CVE B is in the KEV catalogue and internet-facing, so it is being attacked now; CVE A's higher Base score sits on an isolated lab server with low EPSS. |
| 5 | D | NIST SP 800-115 describes planning, discovery, attack and reporting. The other sequences are an incident-response lifecycle, the CSF functions and an attacker's activities. |
| 6 | D | A CWE identifier names a type of weakness, such as CWE-79 for cross-site scripting. A CVE names one specific disclosed vulnerability; CWE says nothing about patch priority or exploitation probability. |
| 7 | B | Written authorisation must come from someone entitled to give it and must also cover third parties, because cloud and hosting providers often have their own testing rules. |
| 8 | A | CVSS v4.0 names scores by the groups used: CVSS-B, CVSS-BT, CVSS-BE and CVSS-BTE, where B is Base, T is Threat and E is Environmental. |
| 9 | C | security.txt (RFC 9116) is a small text file, usually served at /.well-known/security.txt, that tells researchers whom to contact and how to report a vulnerability. It is a disclosure aid, not a report, a scanner setting or a vulnerability list. † |
| 10 | B | Evidence should prove impact with the minimum necessary data: sanitise screenshots, never bulk-copy real sensitive data, and handle the report itself as confidential. |

## Blue team and incident response (hub section 14)

**1. [K2]** Which detection-chain link is tested by alerting when a log source goes silent?

- A. Tooling health
- B. Detection rules
- C. Telemetry
- D. Triage and response

**2. [K3]** Failed-login logs contain the password the user typed. Which rule is broken?

- A. Extend retention
- B. Synchronise clocks
- C. Add correlation IDs
- D. Do not log secrets

**3. [K2]** Which is the classic NIST SP 800-61 Rev. 2 phase order?

- A. Govern; identify; protect; detect; respond; recover, as in the CSF 2.0 core
- B. Preparation; detection and analysis; containment, eradication and recovery; post-incident activity
- C. Detection and analysis; preparation; recovery; containment and eradication; lessons learned
- D. Reconnaissance; weaponisation; delivery; exploitation; installation; command and control; actions on objectives

**4. [K3]** A team has nightly backups but has never restored one. What is the correct assessment?

- A. Backups are verified well enough by comparing the file sizes each night
- B. Nightly backups guarantee recovery, so no further checks are needed
- C. A backup counts only after a restore has worked, so run restore drills
- D. Restore tests are needed only after a ransomware attack has happened

**5. [K2]** Which backup property protects against ransomware that encrypts every reachable copy?

- A. Compression
- B. At least one offline or immutable copy
- C. A second copy on the same server
- D. A longer file-name prefix

**6. [K1]** What is the first step of the vulnerability management cycle in the hub?

- A. Close all findings
- B. Patch everything
- C. Inventory assets and their owners
- D. Scan with an exploit framework

**7. [K2]** What is Sigma?

- A. An EDR product
- B. A penetration-test methodology
- C. A shared format for detection rules
- D. A log shipping protocol

**8. [K4]** A SOC receives thousands of alerts a day and nearly all are false positives. Which metric and action fit best?

- A. Track the false-positive rate and tune the rules
- B. Track attendance and add staff
- C. Investigate only critical alerts indefinitely
- D. Disable the SIEM

**9. [K2]** Why hold a blameless post-incident review?

- A. To identify which employee was at fault and record it in their file
- B. To find root causes and turn them into tracked fixes and detections
- C. To satisfy a legal hold and for no other operational purpose
- D. To avoid having to write the formal incident report afterwards

### Answers: Blue team and incident response

| # | Answer | Why |
| --- | --- | --- |
| 1 | A | A silent log source is a failure of tooling health: the data pipeline is broken, so detection rules cannot fire even though they are correct. Test it by stopping a source on purpose and checking that an alert is raised, and repeat the check after every upgrade. |
| 2 | D | Logging hygiene means never writing secrets or full personal data to logs. A typed password in a failed-login record turns the log store into a credential database. |
| 3 | B | NIST SP 800-61 Rev. 2 lists preparation; detection and analysis; containment, eradication and recovery; post-incident activity. Rev. 3 treats response as part of risk management and maps to CSF 2.0. |
| 4 | C | A backup counts only once a restore has worked. Run restore drills, record the result and compare it with the recovery objectives (RPO and RTO). |
| 5 | B | Ransomware encrypts every copy it can reach, so keep at least one offline or immutable copy. This is the off-site and offline part of the 3-2-1 idea. |
| 6 | C | Vulnerability management starts with an inventory of assets and their owners; you cannot assess, prioritise or patch what you do not know exists. |
| 7 | C | Sigma is a vendor-neutral format for writing a detection rule once and converting it for many SIEMs; rules are often mapped to ATT&CK techniques. It is neither a product nor a log protocol. |
| 8 | A | A flood of false positives hides real incidents. Track the false-positive rate (and the alert-to-incident ratio) and tune the rules rather than ignoring alerts or only adding staff. |
| 9 | B | A blameless review looks for root causes, for example with the 5 Whys, and turns them into tracked fixes and new detections. Blame makes people hide information. |

## Governance, risk and compliance (hub section 15)

**1. [K1]** Which functions does NIST CSF 2.0 define?

- A. Govern, Identify, Protect, Detect, Respond, Recover
- B. Plan, Do, Check, Act
- C. Prepare, Prevent, Detect, Contain, Learn
- D. Identify, Protect, Detect, Respond, Recover only

**2. [K2]** Within what time must a personal data breach normally be notified to the regulator under the GDPR?

- A. 7 days
- B. 72 hours
- C. 24 hours
- D. 30 days

**3. [K2]** Which incident-reporting steps does NIS2 use?

- A. Early warning at 12 hours, notification at 48 hours and a final report after seven days
- B. Early warning at 24 hours, notification at 72 hours and a final report after one month
- C. One consolidated report each year, covering every incident of the previous twelve months
- D. A single notification within 14 days of the incident, with no follow-up report

**4. [K2]** What does DORA require for designated financial entities?

- A. A public bug bounty programme that runs all year round
- B. Only quarterly vulnerability scanning, with no penetration testing
- C. Threat-led penetration testing at least every three years
- D. A tabletop exercise once a year and no technical testing

**5. [K3]** From 11 September 2026 a manufacturer learns that a vulnerability in its product sold in the EU is being actively exploited. What is the first reporting step?

- A. Notify customers only
- B. Wait for a patch, then notify
- C. Send the final report within 14 days of discovery
- D. Send an early warning within 24 hours

**6. [K2]** How do ISO/IEC 27001 and 27002 differ?

- A. 27001 is a control catalogue, and 27002 is the certification scheme
- B. They are regional versions of one standard, used in Europe and Asia
- C. 27002 replaced 27001 in 2022 and is now the only certifiable ISO standard
- D. 27001 sets certifiable ISMS requirements; 27002 is the control catalogue

**7. [K3]** An organisation meets every item of a compliance checklist and is still breached. Which statement explains this?

- A. The auditor must have been wrong
- B. Compliance tests are always automated
- C. Checklists are illegal
- D. Compliance shows conformance, not resistance

**8. [K2]** What distinguishes mandatory from voluntary standards?

- A. Mandatory ones are free to use; voluntary ones are sold by standards bodies
- B. Mandatory ones apply nationally only; voluntary ones are always international in scope
- C. Voluntary standards cannot be audited, so no one can certify against them
- D. Mandatory ones stem from law or contract; voluntary ones are adopted by choice

**9. [K2]** What should a risk register entry include?

- A. An owner, a treatment, a target date and the residual risk
- B. Only a severity colour, which is enough to rank all of the risks
- C. The name of the scanner that first detected the issue
- D. A list of the staff passwords that relate to the risk

### Answers: Governance, risk and compliance

| # | Answer | Why |
| --- | --- | --- |
| 1 | A | NIST CSF 2.0 has six functions. Govern is the one added in version 2.0 to the original five. † |
| 2 | B | GDPR Article 33 requires notifying the supervisory authority without undue delay and, where feasible, within 72 hours of becoming aware of the breach. † |
| 3 | B | NIS2 uses three steps: an early warning within 24 hours, an incident notification within 72 hours and a final report after one month. National transposition can vary. † |
| 4 | C | DORA has applied since 17 January 2025. It requires threat-led penetration testing at least every three years for the financial entities that authorities designate, within a wider resilience testing programme. † |
| 5 | D | The Cyber Resilience Act sets 24 hours, 72 hours and a final report 14 days after a fix is available. |
| 6 | D | ISO/IEC 27001 sets the certifiable requirements for an ISMS, and ISO/IEC 27002 is the control catalogue that supports it. The control numbers were not re-checked in this hub. † |
| 7 | D | Compliance shows conformance to a checklist, not resistance to an attacker. Testing only the checklist gives false assurance, so also test how the controls hold up. |
| 8 | D | Mandatory standards come from law, regulation or contract, and voluntary ones are adopted as good practice. The choice changes how strictly you must test against them. |
| 9 | A | A usable risk entry names an owner, the chosen treatment, a target date and the residual risk. Test findings are risk statements, not only defects. |

## Security tools and labs (hub sections 16 and 17)

**1. [K2]** How should a security tool be selected, in ISTQB's view?

- A. From documented needs and a trial, not from a vendor demo
- B. By picking the tool that is most popular among the competitors
- C. By choosing the cheapest licence that is available
- D. By counting the number of features that each vendor lists

**2. [K3]** An unauthenticated DAST scan finds almost nothing. What is the most likely reason?

- A. It could not get past the login page; configure test accounts per role
- B. The application is perfectly secure, so there was simply nothing to find
- C. The scanner ran too fast for the application to respond to it
- D. HTTPS encryption prevents scanners from sending any requests

**3. [K2]** What distinguishes static from dynamic security tools?

- A. Static tools are free, while dynamic tools always need a licence
- B. Dynamic tools never use a network, while static tools always do
- C. Static tools test only mobile apps; dynamic tools test only web applications
- D. Static tools inspect without running the system; dynamic tools run it

**4. [K3]** Which tool class finds a leaked API key in a repository's history?

- A. DAST, which crawls and attacks the running web application
- B. Fuzzing, which sends mutated inputs to a parser or service
- C. TLS scanners, which check protocol versions and certificates
- D. Secret scanning, for example Gitleaks or TruffleHog

**5. [K2]** How should scanner output be treated?

- A. As legal evidence once the scan has been archived
- B. As proof of compliance with the standard being tested
- C. As a lead to be verified manually, not as a verdict
- D. As a final verdict that can go straight into the report

**6. [K3]** You run Juice Shop locally and want only your own machine to reach it. Which setting achieves this?

- A. Bind to 0.0.0.0
- B. Turn off the firewall
- C. Use host networking on a shared network
- D. Bind the published port to 127.0.0.1

**7. [K2]** Why verify checksums or signatures of downloaded security tools?

- A. Security tools are themselves a supply-chain target
- B. To make the download complete faster on slow links
- C. To unlock free licences for the paid tool editions
- D. To avoid having to install updates for the tool later

**8. [K2]** What is a sensible first step when rolling out a SAST tool?

- A. Start with a high-confidence rule subset and expand
- B. Fail every build on any finding, whatever its severity
- C. Run it only once, just before each major release
- D. Enable every rule at once to maximise the coverage

### Answers: Security tools and labs

| # | Answer | Why |
| --- | --- | --- |
| 1 | A | ISTQB advises selecting tools from documented needs: weigh fit, result quality (false positives and negatives on your own code, in a proof of concept), open-source risks, vendor capabilities and cost. |
| 2 | A | An unauthenticated DAST scan sees only the public surface, so most of the application is never exercised. Configure test accounts for each role and verify that the scanner stays logged in. |
| 3 | D | Static tools inspect code or configuration without running the system, while dynamic tools exercise the running system. ISTQB also classes tools as white-box, black-box or grey-box. |
| 4 | D | Secret scanning tools such as Gitleaks and TruffleHog search the whole history of a repository for keys and tokens. Run them pre-commit and as a history scan. |
| 5 | C | Scanners produce candidates, including false positives and missed issues. Treat output as a lead, verify each finding manually, add a severity rationale, and only then report it. |
| 6 | D | Binding the published port to 127.0.0.1 keeps the deliberately vulnerable app off the network, for example docker run --rm -p 127.0.0.1:3000:3000 bkimminich/juice-shop. Binding to 0.0.0.0 would expose it to everyone who can reach the host. |
| 7 | A | Security tools run with high privileges and are themselves a supply-chain target, so download them from official sources, verify checksums or signatures and pin versions. |
| 8 | A | Turning on every rule at once buries teams in noise and they stop reading results. Start with a high-confidence rule subset, fix or triage, then expand. |
