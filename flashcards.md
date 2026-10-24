# Flashcards

207 cards. Difficulty 1 = easy, 3 = hard. "Core" cards are the four per topic printed in the hub. † marks a card whose fact was not re-checked on 2026-10-23.

## Cybersecurity foundations (hub section 3)

| Question | Answer | Difficulty | Core |
| --- | --- | --- | --- |
| What does the CIA triad stand for? | Confidentiality, integrity and availability: the three core properties every security test traces back to. | 1 | yes |
| What is risk in its simplest form? | Likelihood multiplied by impact, judged per scenario rather than per vulnerability. | 1 | yes |
| What is the difference between a threat and a vulnerability? | A threat is a potential cause of harm (actor, capability, intent). A vulnerability is a weakness a threat can use. | 1 | yes |
| Name the four risk-treatment options. | Mitigate, transfer, avoid or accept. What remains afterwards is residual risk. | 1 | yes |
| What does AAA stand for? | Authentication (who are you), authorization (what may you do) and accounting (what did you do). | 1 |  |
| What is the attack surface? | The sum of entry points an attacker can reach: endpoints, ports, forms, files, integrations and staff. | 1 |  |
| What is defence in depth? | Several independent layers of control, so one failure is not a breach. | 1 |  |
| What do least privilege and separation of duties require? | Each account gets only what its job needs, and no single person can complete a sensitive action alone. | 2 |  |
| What does 'fail securely' mean? | On error the system denies access instead of granting it (fails closed), and the safe setting is the default. | 2 |  |
| What is complete mediation? | Every access is checked every time, on the server. | 2 |  |
| What does zero trust say about network location? | Never grant access because of where a request comes from; verify identity, device and context per request (NIST SP 800-207). | 2 |  |
| How does a security audit differ from a security test? | An audit checks conformance to a policy or standard; a test tries to show whether controls resist an attack scenario. They complement each other. | 2 |  |
| Which six sub-characteristics does ISO/IEC 25010:2023 list under security? | Confidentiality, integrity, non-repudiation, accountability, authenticity and resistance. | 3 |  |
| How many tactics does MITRE ATT&CK Enterprise have in v20, and what changed in v19? | 15 tactics. Version 19 split Defense Evasion into Stealth and Defense Impairment. | 3 |  |
| How many stages has the Lockheed Martin Cyber Kill Chain? | Seven linear stages, from reconnaissance to actions on objectives. † | 2 |  |
| Which algorithms are recommended for password storage? | Argon2id, scrypt or bcrypt, with unique salts. | 2 |  |

## ISTQB security testing core (hub section 4)

| Question | Answer | Difficulty | Core |
| --- | --- | --- | --- |
| Which ISTQB certificates succeed the single 2016 CT-SEC syllabus? | CT-STE (Security Test Engineer, launched February 2025) and a planned CT-STA (Security Test Analyst, scheduled for 2026 but unconfirmed in October 2026). | 2 | yes |
| What are the CT-STE exam numbers? | 40 questions, 43 points, 28 points to pass (65%), 75 minutes. | 1 | yes |
| What are the CT-SEC exam numbers? | 45 questions, 80 points, 52 points to pass (65%), 120 minutes. | 1 | yes |
| What do K1, K2, K3 and K4 stand for? | K1 remember, K2 understand, K3 apply, K4 analyse. | 1 | yes |
| What is the prerequisite for CT-STE? | The ISTQB Certified Tester Foundation Level (CTFL). | 1 |  |
| What is the prerequisite for CT-SEC? | CTFL plus three years of relevant experience. | 1 |  |
| How much extra exam time do non-native-language candidates get? | 25% more. | 1 |  |
| At which K-level are keywords and security domain terms examinable in CT-STE? | K1 (remember). | 2 |  |
| Which CT-SEC theme has no dedicated CT-STE chapter? | Human factors in security testing (CT-SEC chapter 6). | 2 |  |
| Which CT-STE chapter covers the security test process? | Chapter 3, The Security Test Process (120 minutes). | 2 |  |
| What are the five stages of the security test process in the 2016 syllabus? | Planning, design, execution, evaluation and maintenance. | 1 |  |
| Does ISTQB grandfather CT-SEC holders into CT-STE or CT-STA? | No. ISTQB states that no grandfathering applies; holders must pass the new exam to hold those titles. | 2 |  |
| Which CTAL-TTA section covers security testing? | Section 4.3 Security Testing, with two K2 objectives and no objective on techniques or tools. | 3 |  |
| How does CTFL v4.0.1 treat security? | As one of the non-functional quality characteristics that testers evaluate. | 2 |  |
| What do standards give a security tester? | Test oracles (what 'correct' means), a shared vocabulary and audit evidence. | 2 |  |
| What should test depth follow, according to ISTQB's security paradigms? | Asset value and information sensitivity: protection level follows them, so test effort should too. | 2 |  |
| What does the hub read into CT-STE section 8.3 about hiding versus avoiding a weakness? | Hiding puts a barrier in front of a weakness (a filter) and buys time; avoiding changes design or code so the weakness no longer exists. This is the hub's reading; confirm it in the syllabus. † | 3 |  |

## Security test process and risk-based planning (hub sections 5 and 18)

| Question | Answer | Difficulty | Core |
| --- | --- | --- | --- |
| Name the five stages of the security test process. | Plan, design, execute, evaluate, maintain. | 1 | yes |
| What must exist before the first security test runs? | Written authorisation from someone entitled to give it, with scope, time windows and an emergency contact (rules of engagement). | 1 | yes |
| What is risk-based security testing? | Spending test effort where likelihood and impact are highest: rank scenarios, then assign test depth, techniques and tools. | 1 | yes |
| How do you write a security scenario? | As actor, goal, path and asset, for example a customer reads another customer's invoice by changing an ID. | 2 | yes |
| Give example entry criteria for a security test. | Signed authorisation, scope list, representative non-production data, one test account per role, an identified build and a baseline scan. | 2 |  |
| Give example exit criteria for a security test. | Every high-priority scenario executed; no open critical or high finding without documented risk acceptance; fixes retested; report reviewed by the system owner. | 2 |  |
| What is security coverage measured against? | Something concrete: threat-model elements, security requirements and abuse cases, ASVS or Top 10 items, attack-surface items; for white-box work, code paths and CWE classes. | 2 |  |
| How do you apply boundary value analysis to security? | Probe limits of length, size, rate and time: lockout at N and N+1 failures, upload limit plus one byte, token expiry plus or minus one second. | 2 |  |
| How do you apply state transition testing to security? | Attack out-of-order or replayed steps: reuse a reset link after the password changed, skip a checkout step, reuse an old session. | 2 |  |
| How do you apply decision tables to access control? | Cover every role x action x object cell of the access-control matrix with an allowed and a denied case. | 2 |  |
| What is an abuse case? | A use case mirrored from the attacker's side, for example 'As an attacker I reuse a one-time link'. | 1 |  |
| What is an attack tree? | A decomposition of an attacker's goal into sub-goals. Root 'take over account' with leaves such as credential stuffing, reset-flow flaw and session theft. | 2 |  |
| Name safety rails for executing security tests. | Approved environment and window; stop condition and emergency contact; dedicated accounts and snapshots; throttled, non-destructive tests; every action logged; evidence stored securely. | 2 |  |
| Why is 'one happy path plus one stock payload per field' weak test design? | It misses authorization, state, logic and boundary failures. Security tests should state the secure expected behaviour for each risk. | 2 |  |
| What is the common pitfall in the Plan stage? | Testing production by default or without written permission. | 1 |  |
| What is the common pitfall in the Evaluate stage? | Severity inflated or played down without a rationale. | 2 |  |

## SDLC and DevSecOps (hub section 6)

| Question | Answer | Difficulty | Core |
| --- | --- | --- | --- |
| What is shift-left security testing? | Moving security checks earlier (requirements, design, code, CI) so defects are caught where they are introduced; pair it with shift-right controls such as monitoring. | 1 | yes |
| What does SAST analyse, and what does it miss? | Source code or bytecode. It finds injection patterns, hard-coded secrets and unsafe APIs early, but misses business-logic flaws and runtime configuration and gives many false positives. | 2 | yes |
| What does SCA find and not find? | Known vulnerable versions and licence issues in third-party components. It cannot find unknown flaws or tell you whether the vulnerable code is reachable. | 2 | yes |
| What does DAST test, and where does it struggle? | The running application from outside: misconfiguration, missing headers, reflected injection, exposed endpoints. It struggles with deep authenticated flows and authorization or logic flaws. | 2 | yes |
| What is IAST? | Interactive testing with an agent inside the running application, giving precise findings with code location during functional tests; it needs instrumentation. | 2 |  |
| What is an SBOM, and which two formats are common? | A list of the components inside software. SPDX (ISO/IEC 5962:2021) and CycloneDX (ECMA-424). † | 2 |  |
| What is SLSA? | Levels for the build integrity and provenance of software artifacts. † | 2 |  |
| What are the four SSDF practice groups? | Prepare the Organization, Protect the Software, Produce Well-Secured Software, Respond to Vulnerabilities. | 2 |  |
| What is OWASP SAMM? | A maturity model scored across five business functions: governance, design, implementation, verification and operations. † | 2 |  |
| How does BSIMM differ from SAMM? | BSIMM is observational: it describes what real organisations do (governance, intelligence, SSDL touchpoints, deployment). SAMM is a model you score yourself against. † | 3 |  |
| How do teams keep pipeline gates from being switched off? | Gate on new findings in changed code, not the whole backlog, and block only on high-confidence, high-severity results. | 2 |  |
| Give three results that should block a pipeline. | A detected secret, a critical vulnerability with an available fix, an unsigned artifact. Warn on the rest. | 2 |  |
| Which three threat-modelling methods does the hub name? | STRIDE, PASTA and LINDDUN (for privacy). † | 2 |  |
| What does the OWASP Top 10 CI/CD Security Risks list treat as an attack target? | The pipeline itself: runners, tokens, third-party actions and build caches. | 2 |  |
| Name two DevSecOps failure modes. | Treating scanner output as the test; securing the application but not the pipeline; findings with no owner; exceptions that never expire; shift-left only. | 2 |  |
| What is policy as code? | Release rules written as code and enforced by admission and policy checks, for example with Open Policy Agent or Kyverno. | 2 |  |

## Web application security (hub section 7)

| Question | Answer | Difficulty | Core |
| --- | --- | --- | --- |
| List OWASP Top 10:2025 A01 to A10. | A01 Broken Access Control; A02 Security Misconfiguration; A03 Software Supply Chain Failures; A04 Cryptographic Failures; A05 Injection; A06 Insecure Design; A07 Authentication Failures; A08 Software or Data Integrity Failures; A09 Security Logging and Alerting Failures; A10 Mishandling of Exceptional Conditions. | 2 | yes |
| What are the different jobs of the Top 10, ASVS and WSTG? | Top 10 raises awareness of the biggest risk categories; ASVS lists requirements to verify; WSTG explains how to test. | 1 | yes |
| What changed from the 2021 Top 10 to 2025? | Security Misconfiguration rose from 5th to 2nd, Cryptographic Failures fell 2nd to 4th, Injection 3rd to 5th, Insecure Design 4th to 6th; supply chain widened 'vulnerable components'; SSRF merged into Broken Access Control; A10 is new. | 3 | yes |
| What data underlies the 2025 Top 10? | More than 2.8 million applications across 589 CWEs, plus a practitioner survey for risks that automated data under-represents. | 3 | yes |
| When was ASVS 5.0.0 published and how many levels does it define? | 30 May 2025; three verification levels. Version 5.0 made Level 1 easier to reach and expanded Level 3 to roughly 90 requirements. | 2 |  |
| Which weakness tops the 2025 CWE Top 25, and which follow? | CWE-79 cross-site scripting, then CWE-89 SQL injection, CWE-352 CSRF, CWE-862 missing authorization and CWE-787 out-of-bounds write. | 3 |  |
| Which WSTG category covers authorization testing? | 4.5 Authorization Testing (ATHZ): path traversal, privilege escalation, insecure object references. | 2 |  |
| Which WSTG category covers business logic and file upload? | 4.10 Business Logic Testing (BUSL). | 3 |  |
| Which flags should a session cookie carry? | Secure, HttpOnly and a suitable SameSite value. | 1 |  |
| Which response headers are quick checks? | Strict-Transport-Security, Content-Security-Policy, X-Content-Type-Options, Referrer-Policy and cache controls on sensitive pages. | 2 |  |
| How do you prevent SQL injection? | Parameterised queries, with validation as defence in depth and least-privilege database accounts. | 1 |  |
| How do you prevent cross-site scripting? | Context-aware output encoding, plus validation and a Content-Security-Policy as further layers. | 1 |  |
| Where does SSRF sit in the 2025 Top 10? | Inside A01 Broken Access Control. | 2 |  |
| What does A10 Mishandling of Exceptional Conditions cover? | Poor error handling, logic errors and failing open. Test by forcing timeouts, malformed input and dependency failures and confirm the system fails closed without leaking details. | 2 |  |
| How should uploaded files be handled? | Type-checked on the server by content, not only name; stored outside the web root; never executed. | 2 |  |
| What does A03 Software Supply Chain Failures cover? | Compromised or vulnerable dependencies, build systems and distribution paths. | 2 |  |

## API security (hub section 8)

| Question | Answer | Difficulty | Core |
| --- | --- | --- | --- |
| What is API1:2023? | Broken Object Level Authorization: a user reaches other users' objects by changing an identifier. Hard-to-guess IDs are not a control. | 1 | yes |
| What is API3:2023? | Broken Object Property Level Authorization: responses expose too many fields, or writes accept fields the user must not set (mass assignment). | 2 | yes |
| What is API5:2023? | Broken Function Level Authorization: ordinary users reach administrative functions by changing the method or path. | 2 | yes |
| What is API6:2023? | Unrestricted Access to Sensitive Business Flows: automation abuses a legitimate flow at scale, such as vouchers or sign-ups. | 2 | yes |
| List the OWASP API Security Top 10 (2023) names. | API1 BOLA, API2 Broken Authentication, API3 BOPLA, API4 Unrestricted Resource Consumption, API5 BFLA, API6 Sensitive Business Flows, API7 SSRF, API8 Security Misconfiguration, API9 Improper Inventory Management, API10 Unsafe Consumption of APIs. | 3 |  |
| What is API10:2023? | Unsafe Consumption of APIs: the API trusts data from third-party services. Treat upstream data as untrusted. | 2 |  |
| How do you test for BOLA? | With two accounts, request each object type, including list, search, export and batch endpoints, using the other account's IDs. | 2 |  |
| How do you get systematic coverage of API authorization? | Build a role x endpoint x object matrix (a decision table) and automate it with scripts or a proxy extension such as Autorize. | 2 |  |
| Which tools generate negative and boundary API tests from a specification? | Schemathesis (property-based) and RESTler (stateful fuzzing). | 2 |  |
| Which GraphQL issues should you check? | Introspection and verbose errors in production, query depth and complexity limits, batching and aliasing used to dodge rate limits, and field-level authorization. | 2 |  |
| What should you check on JWTs and OAuth 2.0? | Signature validation and an algorithm allow-list; issuer, audience and expiry; short access tokens and refresh rotation; PKCE for public clients; exact redirect-URI matching; least-privilege scopes. | 2 |  |
| How do you secure webhooks? | Verify signatures and prevent replay with timestamps or nonces. | 2 |  |
| Which version of the API Top 10 is current in October 2026? | The 2023 edition; the OWASP site lists only 2023 and 2019. | 2 |  |

## Security mechanisms (hub section 9)

| Question | Answer | Difficulty | Core |
| --- | --- | --- | --- |
| What password length rules does NIST SP 800-63B-4 set? | At least 15 characters when the password is the only factor, 8 when it is one factor among several, and support for at least 64 characters. | 2 | yes |
| What else does SP 800-63B-4 say about passwords? | No composition rules, no forced periodic changes, a blocklist check against compromised passwords, and password managers and paste must work. | 2 | yes |
| Which password lengths do you test at the boundaries? | 7, 8, 14, 15, 64 and 65 characters, plus spaces and Unicode, a known breached password and paste. | 2 | yes |
| What should happen to a session at login and logout? | A new unpredictable ID at login and privilege change; server-side invalidation at logout and password change; idle and absolute timeouts. | 2 | yes |
| What is the difference between horizontal and vertical authorization tests? | Horizontal: the same role on someone else's data. Vertical: a lower role on a higher-privilege function. | 1 |  |
| Which TLS versions are acceptable? | TLS 1.2 or later with 1.3 preferred (RFC 8446). TLS 1.0 and 1.1 are deprecated (RFC 8996). † | 2 |  |
| Name common cryptography misuse patterns. | ECB mode, repeated nonces or IVs, MD5 or SHA-1 for security purposes, home-made algorithms and certificate validation switched off in code. | 2 |  |
| What is the EICAR file for? | A harmless antivirus test file used to check malware scanning at upload, mail and endpoint. | 1 |  |
| How do you test an intrusion-detection rule? | Run agreed, harmless attack simulations in a lab (for example Atomic Red Team) and check the rule fires, the alert is routed and someone responds. | 2 |  |
| Why test egress as well as ingress? | Unrestricted outbound traffic is how stolen data leaves. | 2 |  |
| What does 'effective' mean for a security mechanism? | A test shows it works. ISTQB asks testers to check effectiveness, not merely existence. | 1 |  |
| How do you test data obfuscation? | Inspect non-production data and logs, try re-identification by combining fields, and check reversibility and key handling. | 2 |  |
| How strong must MFA recovery be? | No weaker than the main login, otherwise attackers use recovery. | 2 |  |
| What does hardening testing compare against? | A baseline such as a CIS Benchmark or a vendor guide. | 1 |  |
| How do you test for account enumeration? | Compare messages and response timing for known and unknown users on login and reset; they must be identical. | 2 |  |

## Mobile, cloud, containers and infrastructure (hub section 10)

| Question | Answer | Difficulty | Core |
| --- | --- | --- | --- |
| What is OWASP MASVS? | The Mobile Application Security Verification Standard, with eight control groups. MASTG is the matching testing guide. | 1 | yes |
| Where should a mobile app keep credentials and tokens? | In the platform keystore, not in preferences, files, logs or backups. | 1 | yes |
| When do root and jailbreak detection tests matter? | Only for apps whose threat model needs them; test them against that model, not by default. | 2 | yes |
| What do you do first in cloud testing? | Read the provider's penetration-testing policy, then start with identity: who can assume which role, old keys, wildcard permissions and administrator MFA. | 2 | yes |
| How does the shared responsibility model help a tester? | It places each finding as provider-owned, customer-configured or application-level. | 2 |  |
| Why is the instance metadata service a target? | If it allows unauthenticated token retrieval, an attacker who reaches it can steal workload credentials. | 2 |  |
| Why should cloud logs go to a separate account? | So the workload cannot alter them. | 2 |  |
| What do you check in container images? | Known vulnerabilities and unwanted contents; prefer minimal base images and non-root users. | 1 |  |
| Which runtime settings do you review for containers? | No privileged containers, dropped capabilities, read-only file systems where possible and resource limits. | 2 |  |
| Which Kubernetes areas do you review? | RBAC, network policies, secret handling, Pod Security Admission levels and admission-control policies. | 2 |  |
| What is configuration drift and how do you find it? | The deployed state diverging from the infrastructure-as-code definition; compare deployed state with the code. | 2 |  |
| How should you test operational technology? | Prefer passive observation and agreed maintenance windows; active scanning can stop equipment. | 2 |  |
| How do you test network segmentation? | Try to cross each zone boundary from the less-trusted side, with default deny in mind. | 2 |  |
| Which standards guide container and OT security? | NIST SP 800-190 and the CIS Kubernetes Benchmark for containers; IEC 62443 and MITRE ATT&CK for ICS for operational technology. | 3 |  |

## AI and LLM security (hub section 11)

| Question | Answer | Difficulty | Core |
| --- | --- | --- | --- |
| Why does LLM security differ from classic application security? | Text is both data and instruction, so anyone who controls text the model reads may steer it. Test the whole system, not only the model. | 1 | yes |
| List the OWASP Top 10 for LLM Applications (2025). | LLM01 Prompt Injection, 02 Sensitive Information Disclosure, 03 Supply Chain, 04 Data and Model Poisoning, 05 Improper Output Handling, 06 Excessive Agency, 07 System Prompt Leakage, 08 Vector and Embedding Weaknesses, 09 Misinformation, 10 Unbounded Consumption. | 3 | yes |
| What controls reduce prompt-injection impact? | Separate privileges, treat model output as untrusted and require human approval for high-impact actions. | 2 | yes |
| What is improper output handling (LLM05)? | Downstream code interprets model output such as markup or commands. Encode and validate it like any untrusted input. | 2 | yes |
| What is excessive agency (LLM06)? | The agent has tools or permissions beyond what is needed or beyond the caller's own rights. Use least privilege, narrow tools, user-scoped credentials and a human in the loop. | 2 |  |
| Why report a success rate for LLM attacks? | Outputs vary, so run each attack many times and report a rate; keep the set as a regression suite across model and prompt versions. | 2 |  |
| Name three tools for LLM red teaming. | garak, PyRIT and promptfoo. | 1 |  |
| Which frameworks apply to AI systems? | MITRE ATLAS, NIST AI RMF with the Generative AI Profile (AI 600-1), ISO/IEC 42001 and the EU AI Act. † | 2 |  |
| What is the control for system prompt leakage (LLM07)? | Keep secrets out of prompts and enforce rules outside the prompt. | 2 |  |
| How do you test vector stores and retrieval? | Test cross-tenant retrieval, injected documents and leakage from embeddings; enforce access control on the vector store. | 2 |  |
| How did the Digital Omnibus change EU AI Act dates? | Annex III high-risk obligations move from 2 August 2026 to 2 December 2027 and Annex I obligations to 2 August 2028. Parliament approved it on 16 June 2026; confirm the final text. | 3 |  |
| What AI techniques did ATT&CK v20 add? | Direct and indirect prompt injection and AI-enabled exfiltration, among others. | 3 |  |

## Human factors and social engineering (hub section 12)

| Question | Answer | Difficulty | Core |
| --- | --- | --- | --- |
| Why do attackers target people? | Persuading a person is cheaper than defeating a technical control. | 1 | yes |
| Name the persuasion levers social engineers use. | Authority, urgency, scarcity, social proof, reciprocity, liking and commitment. | 1 | yes |
| What controls reduce phishing? | Mail filtering, phishing-resistant MFA, a report button and training. | 1 | yes |
| What is vishing and how is it controlled? | Voice phishing, including help-desk impersonation. Use call-back verification and scripted identity checks. | 2 | yes |
| What is baiting? | A lure such as a found USB stick or QR code. Controls: port control, device policy and awareness. | 1 |  |
| What is tailgating and what must a physical test carry? | Following an authorised person through a door. Physical tests need a signed authorisation letter carried at all times. | 2 |  |
| What is business email compromise and how do you control it? | An impersonated executive or supplier asks for a payment or data. Use out-of-band verification and dual approval. | 2 |  |
| What is MFA fatigue and how do you control it? | Repeated push prompts until someone approves. Use number matching, rate limits and phishing-resistant MFA; test the configuration, not the staff. | 2 |  |
| How do you test deepfake risk ethically? | With a tabletop exercise, using verification codes and call-back procedures as controls. | 2 |  |
| Which metrics show whether awareness training works? | Behaviour: report rate and time to report matter more than click rate; compare before and after and track repeat failures. | 2 |  |
| What are the rules for testing people? | Written leadership approval (legal and HR involved), defined data collection, aggregate reporting, no name and shame, no lures that exploit real distress, stop conditions and a debrief. | 2 |  |
| Which controls limit insider risk? | Least privilege, separation of duties, activity logging, data-loss prevention and a leaver process. | 2 |  |

## Penetration testing and scoring (hub section 13)

| Question | Answer | Difficulty | Core |
| --- | --- | --- | --- |
| How does a penetration test differ from a vulnerability assessment? | An assessment is broad and mostly automated; a penetration test is deep within scope, time-boxed and proves impact. | 1 | yes |
| How does a red team differ from a purple team? | A red team is goal-based and often covert and tests detection and response; a purple team is collaborative, attackers and defenders sharing each step. | 2 | yes |
| What are the penetration-test phases in NIST SP 800-115? | Planning, discovery, attack and reporting. | 2 | yes |
| What are the PTES phases? | Pre-engagement, intelligence gathering, threat modelling, vulnerability analysis, exploitation, post-exploitation and reporting. † | 2 | yes |
| What is OSSTMM? | ISECOM's metrics-driven method across human, physical, wireless, telecommunications and data-network channels. † | 3 |  |
| What are the CVSS v4.0 metric groups and score names? | Base, Threat, Environmental and Supplemental; scores are named CVSS-B, CVSS-BT, CVSS-BE and CVSS-BTE. | 2 |  |
| What changed in CVSS v4.0 compared with 3.1? | Adds Attack Requirements, splits User Interaction into passive and active, retires Scope and rates impact for the vulnerable system and subsequent systems separately. | 3 |  |
| What are the CVSS qualitative bands? | None 0.0, low 0.1 to 3.9, medium 4.0 to 6.9, high 7.0 to 8.9, critical 9.0 to 10.0. | 2 |  |
| What does EPSS estimate? | The probability that a vulnerability is exploited within 30 days. | 1 |  |
| What is the CISA KEV catalogue? | A list of vulnerabilities with observed exploitation. | 1 |  |
| What is the difference between CVE and CWE? | A CVE names one specific disclosed vulnerability; a CWE names a type of weakness. CWE classifies and does not set priority. | 1 |  |
| Why should you not prioritise by CVSS Base score alone? | It is not risk and ignores your environment. Combine severity, likelihood (EPSS), observed exploitation (KEV), asset criticality and exposure. | 2 |  |
| What is a security.txt file? | A file giving security contact details for researchers, defined in RFC 9116. † | 2 |  |
| Which standards describe vulnerability disclosure and handling? | ISO/IEC 29147 (disclosure) and ISO/IEC 30111 (handling). † | 3 |  |
| What belongs in a good penetration test report? | Executive summary and scope and method; per finding a title, description, evidence, affected assets, impact, likelihood, CVSS vector and score, CWE, remediation and references. | 2 |  |
| What are the stages of an engagement? | Pre-engagement, information gathering and analysis, exploitation and post-exploitation, clean-up, then reporting and retest. | 2 |  |

## Blue team and incident response (hub section 14)

| Question | Answer | Difficulty | Core |
| --- | --- | --- | --- |
| Name the links of the detection chain. | Telemetry, collection and integrity, detection rules, triage and response, and tooling health. | 1 | yes |
| What should a security log record carry? | Actor, time, target and result, with no secrets. | 1 | yes |
| What are the logging hygiene rules? | No secrets or full personal data, neutralise user input before logging (log injection), add correlation IDs, keep security logs apart from debug noise. | 2 | yes |
| What is Sigma? | A shared, vendor-neutral format for detection rules, often mapped to ATT&CK techniques. | 2 | yes |
| What is Atomic Red Team used for? | Running small, harmless simulations of techniques in a lab to check that detection rules fire. | 2 |  |
| What is NIST SP 800-61 Rev. 3? | Incident response guidance published 3 April 2025 as a CSF 2.0 community profile; it supersedes Rev. 2 (2012). | 2 |  |
| What are the classic incident-response phases of Rev. 2? | Preparation; detection and analysis; containment, eradication and recovery; post-incident activity. | 1 |  |
| How does response map to CSF 2.0 in the hub's reading? | Response work sits mostly in Detect, Respond and Recover, with Govern, Identify and Protect supporting preparation. | 3 |  |
| List the vulnerability management cycle. | Inventory, assess, prioritise, remediate or mitigate, verify and report. | 1 |  |
| What is the 3-2-1 backup idea? | Three copies, two media types, one off-site, with at least one copy offline or immutable. | 1 |  |
| When does a backup count? | Only after a restore has worked. Schedule restore drills and record the result. | 1 |  |
| What are RPO and RTO? | Recovery point objective is the most data you can lose; recovery time objective is the longest downtime you can accept. Test against them. | 2 |  |
| Which blue-team metrics are worth tracking? | Mean time to detect and contain, ATT&CK techniques with a tested detection, false-positive rate, fix-by compliance and restore success rate. | 2 |  |
| Why hold a blameless post-incident review? | To find root causes (5 Whys separates symptoms from causes) and turn them into tracked fixes and new detections. | 2 |  |
| How do you test tooling health? | Alert when a log source goes silent and retest after upgrades. | 2 |  |

## Governance, risk and compliance (hub section 15)

| Question | Answer | Difficulty | Core |
| --- | --- | --- | --- |
| Which six functions make up NIST CSF 2.0? | Govern, Identify, Protect, Detect, Respond and Recover (published February 2024). | 1 | yes |
| How do ISO/IEC 27001 and 27002 differ? | 27001 holds the certifiable ISMS requirements; 27002 is the control catalogue (93 controls in 2022). † | 2 | yes |
| What are the CIS Controls v8.1? | Eighteen prioritised controls with implementation groups, a practical baseline. | 2 | yes |
| Which NIST SP 800-53 controls cover testing? | CA-8 penetration testing, RA-5 vulnerability scanning and SA-11 developer testing. Identifiers not re-checked. † | 3 | yes |
| What does PCI DSS requirement 11 ask for? | Regular scans, penetration tests at least annually and after significant change, and segmentation tests. † | 3 |  |
| What do GDPR Articles 32 and 33 say? | Article 32 expects security appropriate to the risk, including regular testing of its effectiveness; Article 33 sets 72-hour breach notification to the regulator. † | 2 |  |
| What are the NIS2 incident reporting steps? | An early warning within 24 hours, a notification at 72 hours and a final report after one month. † | 2 |  |
| What does DORA require for testing? | A resilience testing programme, with threat-led penetration testing for designated entities at least every three years. DORA has applied since 17 January 2025. † | 3 |  |
| What does the EU Cyber Resilience Act require from 11 September 2026? | Manufacturers must report actively exploited vulnerabilities and severe incidents: early warning in 24 hours, notification in 72 hours, final report 14 days after a fix (or one month for severe incidents). | 2 |  |
| What is SOC 2? | An AICPA attestation against the trust services criteria. | 1 |  |
| Why is compliance 'the floor'? | Passing a checklist shows conformance, not resistance, and testing only the checklist gives false assurance. | 1 |  |
| What does a risk register hold? | For each risk an owner, a treatment, a target date and the residual risk. | 1 |  |
| How do test results feed the ISMS? | As inputs to the risk register: a finding is a risk statement, not just a defect. ISO/IEC 27001 asks the organisation to improve its ISMS from such results. | 2 |  |
| What evidence will an auditor ask for? | Test plan, scope approval, results, defects and retest proof. | 1 |  |
| Why test that detection and escalation meet legal clocks? | Breach and vulnerability reporting windows start when you become aware of an event. | 2 |  |

## Security tools and labs (hub sections 16 and 17)

| Question | Answer | Difficulty | Core |
| --- | --- | --- | --- |
| Which categories does ISTQB use for security tools? | White-box, black-box or grey-box, and static or dynamic. | 1 | yes |
| How should you select a security tool? | From documented needs: risks, technologies and test levels; fit; quality of results (false positives and negatives on your own code, in a proof of concept); open-source risks; vendor capabilities; cost and skills. | 2 | yes |
| Name two intercepting web proxies. | Burp Suite and OWASP ZAP. | 1 | yes |
| What are the common rollout traps for security tools? | Every rule on at once; unauthenticated scans; scans that disrupt fragile systems; the tool itself as a supply-chain target; treating output as a verdict instead of a lead. | 2 | yes |
| Which tools scan for secrets? | Gitleaks, TruffleHog and detect-secrets. | 1 |  |
| Which tools generate or scan SBOMs and dependencies? | Syft generates SBOMs; Grype, Trivy, OSV-Scanner and OWASP Dependency-Check find known vulnerable components. | 2 |  |
| Which tools check TLS and hardening? | testssl.sh and SSLyze for TLS; Lynis and OpenSCAP for hardening against baselines. | 2 |  |
| Name three fuzzers. | AFL++, libFuzzer and Jazzer. | 2 |  |
| Which tools support mobile testing? | MobSF, jadx, apktool, Frida and objection. | 2 |  |
| Which tools check cloud posture? | Prowler, ScoutSuite and Steampipe. | 2 |  |
| How do you run OWASP Juice Shop safely on your machine? | With Docker bound to localhost: docker run --rm -p 127.0.0.1:3000:3000 bkimminich/juice-shop. | 2 |  |
| Name the lab-safety rules. | Isolated network, bind labs to localhost, snapshots, treat downloaded VMs and images as untrusted, separate attack VM, stay inside platform rules and never aim lab techniques at systems you do not own. | 2 |  |
| Which two labs did the hub check in October 2026, and what did it find? | PortSwigger Web Security Academy is described on its site as 100% free; OWASP Juice Shop is MIT-licensed, version 20.2.0. | 2 |  |
| Which lab is a deliberately vulnerable API? | OWASP crAPI. | 2 |  |
