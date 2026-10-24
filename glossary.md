# Glossary

226 terms from the Security Testing and Cybersecurity Study Hub, grouped by topic. † marks a term whose underlying fact was not re-checked on 2026-10-23.

## Cybersecurity foundations (hub section 3)

| Term | Definition |
| --- | --- |
| Accounting | Recording what each actor did so that actions can be traced to one actor; also called accountability. |
| Asset | Anything of value to the organisation: data, services, reputation and people's time. |
| Attack surface | All entry points an attacker can reach, such as endpoints, ports, forms, files, integrations and staff. |
| Authentication | Proving who or what an actor is. |
| Authenticity | Assurance that an actor or a piece of data is genuine. |
| Authorization | Deciding what an authenticated actor may do (access control). In this hub, 'authorisation' with an s means permission to test. |
| Availability | Legitimate users can still use the system and its data when they need to. |
| Complete mediation | Every access is checked every time, on the server. |
| Confidentiality | Only authorised parties can read the information. |
| Cyber Kill Chain † | Lockheed Martin model of seven linear attack stages, from reconnaissance to actions on objectives. |
| Defence in depth | Several independent layers of control, so that one failure is not a breach. |
| Exploit | A way of using a vulnerability. |
| Fail securely | On error the system denies access (fails closed) instead of granting it. |
| Integrity | Information and systems cannot change without authorisation or without detection. |
| Least privilege | Each account gets only the access its job needs. |
| MITRE ATT&CK | Knowledge base of adversary tactics, techniques and sub-techniques seen in real incidents; Enterprise v20 has 15 tactics. |
| Non-repudiation | An actor cannot credibly deny having performed an action. |
| Residual risk | The risk that remains after a treatment has been applied. |
| Risk | The chance and cost of a specific scenario; in its simplest form likelihood multiplied by impact, judged per scenario. |
| Risk treatment | The choice to mitigate, transfer, avoid or accept a risk. |
| Secure by default | The safe setting is the one you get without configuring anything. |
| Security audit | A check of conformance to a policy or standard. |
| Security by obscurity | Relying on the secrecy of a design for protection. Assume the design is known and keep only keys and secrets secret. |
| Security test | An attempt to show whether controls withstand an attack scenario. |
| Separation of duties | No single person can complete a sensitive action alone. |
| STRIDE † | Threat categories: spoofing, tampering, repudiation, information disclosure, denial of service, elevation of privilege. |
| Threat | A potential cause of harm, described by actor, capability and intent. |
| Threat modelling † | Structured analysis of what can go wrong in a design, using methods such as STRIDE, PASTA or LINDDUN. |
| Vulnerability | A weakness that a threat can use. |
| Zero trust | Never grant access because of network location; verify identity, device and context for each request (NIST SP 800-207). |

## ISTQB security testing core (hub section 4)

| Term | Definition |
| --- | --- |
| Black-box testing | Testing with no knowledge of the internals of the system. |
| Confirmation testing | Re-running a test to check that a fix worked. |
| CT-SEC | The legacy 2016 ISTQB Security Tester certificate; its content is being split into CT-STE and a planned CT-STA. |
| CT-STE | ISTQB Certified Tester Security Test Engineer, launched February 2025; requires CTFL. |
| Dynamic testing | Running the system and observing its behaviour. |
| Entry criteria | Conditions that must hold before testing can start. |
| Exit criteria | Conditions that must hold before testing can stop. |
| False negative | A real weakness that testing failed to report. |
| False positive | A reported finding that is not a real weakness. |
| Grey-box testing | Testing with partial internal knowledge, such as test accounts and API documentation. |
| ISMS | Information security management system: the policies, processes and controls an organisation manages, for example under ISO/IEC 27001. |
| K-level | ISTQB cognitive level of a learning objective: K1 remember, K2 understand, K3 apply, K4 analyse. |
| Regression testing | Checking that a change did not break or reopen something that worked. |
| Risk-based testing | Directing test effort by the likelihood and impact of risks. |
| Static testing | Inspecting code, configuration or design without running the system. |
| Test basis | The information tests are derived from, such as requirements, policies, standards and threat models. |
| Test oracle | A source of the expected result, that is, what 'correct' means for a test. |
| White-box testing | Testing with full knowledge of the internals, such as source code. |

## Security test process and risk-based planning (hub sections 5 and 18)

| Term | Definition |
| --- | --- |
| Abuse case | A use case seen from the attacker's side, such as reusing a one-time link. |
| Access-control matrix | A grid of roles, actions and objects stating what is allowed or denied; the basis for authorization tests. |
| Attack tree | A decomposition of an attacker's goal into sub-goals, down to leaves such as credential stuffing. |
| Boundary value analysis | Testing at and around limits, for example a lockout threshold N at N-1, N and N+1 failed logins. |
| Combinatorial testing | Covering combinations of configuration values, such as TLS version x cipher x client. |
| Decision table testing | Covering combinations of conditions; in security, every role x action x object cell of the access-control matrix. |
| Equivalence partitioning | Splitting inputs into classes that should behave alike; in security, valid, malformed and hostile classes. |
| Error guessing | Choosing tests from known weakness lists and experience, such as the OWASP Top 10. |
| Evidence | Logs, requests and responses, and screenshots that support a finding; sanitise them and store them securely. |
| Exploratory testing | Time-boxed, charter-driven testing in which learning and test design happen together. |
| Fuzzing | Feeding malformed or semi-valid inputs at scale to find crashes and unhandled cases. |
| Rules of engagement | The agreed rules for a test: scope, allowed techniques, windows, rate limits, contacts and data handling. |
| State transition testing | Testing allowed and forbidden transitions; in security, replayed or out-of-order steps. |
| Written authorisation | Signed permission from someone entitled to give it, naming the tester, targets and dates. No test runs without it. |

## SDLC and DevSecOps (hub section 6)

| Term | Definition |
| --- | --- |
| BSIMM † | Building Security In Maturity Model, built from what real organisations actually do. |
| DAST | Dynamic application security testing: probes the running application from outside. |
| Dependency confusion | Tricking a build into fetching a malicious public package instead of the internal package of the same name. |
| DevSecOps | Building security checks and ownership into the development and operations pipeline. |
| IaC scanning | Checking infrastructure-as-code templates for misconfigurations before deployment. |
| IAST | Interactive application security testing: an agent inside the running application reports findings with code locations. |
| OWASP SAMM † | Software Assurance Maturity Model, scored across five business functions: governance, design, implementation, verification, operations. |
| Pipeline gate | An automated check that can stop a build or release. |
| Policy as code | Deployment and security rules written as code and enforced automatically, for example with Open Policy Agent or Kyverno. |
| SAST | Static application security testing: analyses source code or bytecode without running it. |
| SBOM | Software bill of materials: a list of the components inside software; formats include SPDX and CycloneDX. |
| SCA | Software composition analysis: finds known vulnerable versions and licence issues in third-party components. |
| Secret scanning | Searching repositories and their history for keys and tokens committed by mistake. |
| Shift left | Moving security activities earlier in the lifecycle, so defects are caught where they are introduced. |
| Shift right | Adding production-side controls such as monitoring, a disclosure channel and bug bounty. |
| SLSA † | Supply-chain Levels for Software Artifacts: levels for build integrity and provenance. |
| Software supply chain | Everything that goes into building and delivering software: dependencies, build systems, signing and distribution. |
| SSDF | NIST Secure Software Development Framework (SP 800-218): Prepare the Organization, Protect the Software, Produce Well-Secured Software, Respond to Vulnerabilities. |

## Web application security (hub section 7)

| Term | Definition |
| --- | --- |
| ASVS | OWASP Application Security Verification Standard: requirements at three levels; version 5.0.0 was published on 30 May 2025. |
| Business logic flaw | A weakness in the intended workflow, such as skipped steps, replay or price manipulation, rather than in code syntax. |
| Clickjacking | Tricking a user into clicking a hidden element in a framed page. |
| Cookie flags | Secure sends the cookie only over HTTPS, HttpOnly hides it from script, SameSite limits cross-site sending. |
| CORS | Cross-origin resource sharing: server rules for which origins may read responses. Permissive rules are a misconfiguration. |
| Cross-site scripting (XSS) | Attacker-controlled script runs in another user's browser; prevented with context-aware output encoding. |
| CSP | Content-Security-Policy: a response header limiting where scripts and other content may load from. |
| CSRF | Cross-site request forgery: a victim's browser is made to send a state-changing request; defended with anti-CSRF tokens and SameSite cookies. |
| CWE | Common Weakness Enumeration: a catalogue of weakness types. It classifies; it does not rank. |
| CWE Top 25 | Yearly ranking of the most dangerous software weaknesses; the 2025 list puts cross-site scripting (CWE-79) first. |
| HSTS | Strict-Transport-Security: a response header telling browsers to use HTTPS only for the site. |
| IDOR | Insecure direct object reference: reaching another user's object by changing an identifier; in API terms BOLA. |
| Injection | Untrusted input is interpreted as code or commands, for example SQL, operating-system commands, templates or script. |
| Insecure deserialization | Unsafe handling of serialized data that lets an attacker alter program behaviour. |
| OWASP Top 10 | Awareness list of the ten biggest web application risk categories; the 2025 edition runs A01 to A10. |
| Path traversal | Using sequences such as ../ to reach files outside the intended directory. |
| Race condition | The outcome depends on the timing of concurrent requests, for example a voucher used twice. |
| Same-origin policy | The browser rule restricting how documents and scripts from one origin interact with another. |
| Session fixation | The attacker sets a known session ID before login; the defence is to issue a new ID at login. |
| SQL injection | Injection into database queries; prevented with parameterised queries. |
| SSRF | Server-side request forgery: the server fetches a URL the attacker controls. In OWASP Top 10:2025 it sits inside A01. |
| WSTG | OWASP Web Security Testing Guide: explains how to test, in categories 4.1 to 4.12 on the latest branch. |

## API security (hub section 8)

| Term | Definition |
| --- | --- |
| BFLA | Broken Function Level Authorization (API5): ordinary users reach administrative functions. |
| BOLA | Broken Object Level Authorization (API1): a user reaches other users' objects by changing an identifier. |
| GraphQL introspection | A query feature that lists the schema; verbose in production it helps attackers map the API. |
| JWT | JSON Web Token: a signed token carrying claims. Validate signature, algorithm, issuer, audience and expiry. |
| Mass assignment | A write request sets properties the user must not set, such as role or price; API3 covers it as property-level authorization. |
| OAuth 2.0 † | Authorization framework for delegated access; current guidance is the Security Best Current Practice, RFC 9700. |
| OpenAPI | A machine-readable description of a REST API, compared with real traffic to find undocumented endpoints. |
| OpenID Connect | An identity layer on top of OAuth 2.0 used for single sign-on. |
| PKCE | Proof Key for Code Exchange: protects the OAuth authorization-code flow for public clients. |
| Rate limiting | Capping how often a user, key or source may call a function. |
| SAML | XML-based single sign-on standard; validate signature, issuer, audience and expiry. |
| Webhook | A callback request from one system to another; verify signatures and prevent replay with timestamps or nonces. |

## Security mechanisms (hub section 9)

| Term | Definition |
| --- | --- |
| Account enumeration | Learning which accounts exist from different messages or timing. |
| Argon2id | A memory-hard password hashing algorithm, recommended alongside scrypt and bcrypt. |
| Certificate pinning | Accepting only expected certificates or keys for a server, where the threat model needs it. |
| Credential stuffing | Trying stolen username and password pairs at scale against other services. |
| Data obfuscation | Hiding real values by masking, tokenisation or anonymisation so those who should not see them cannot recover them. |
| Digital signature | Proof of origin and integrity made with a private key and checked with the public key. |
| Egress filtering | Controlling outbound traffic, which limits how stolen data can leave. |
| EICAR test file | A harmless standard file that antivirus products detect, used to test malware scanning. |
| Encryption | Reversible protection with a key; symmetric uses one key, asymmetric a key pair. |
| Hardening | Reducing the attack surface by removing services, setting secure defaults and patching, compared with a baseline such as a CIS Benchmark. |
| Hashing | One-way fingerprinting of data; for passwords use a slow, salted algorithm. |
| IDS and IPS | Intrusion detection systems raise alerts; intrusion prevention systems also block. |
| MFA | Multi-factor authentication: two or more independent factors. |
| Network segmentation | Dividing a network into zones with controlled flows between them, default deny. |
| NIST SP 800-63B-4 | Authentication guideline, final 31 July 2025: 15-character minimum for single-factor passwords, no composition rules, breached-password check. |
| Phishing-resistant MFA | An authenticator bound to the real site so a lookalike cannot capture it; SP 800-63B-4 requires one at AAL3. |
| Salt | A unique random value added before hashing so identical passwords do not hash identically. |
| TLS | Transport Layer Security protects data in transit; use 1.2 or later, with 1.3 preferred. |

## Mobile, cloud, containers and infrastructure (hub section 10)

| Term | Definition |
| --- | --- |
| Configuration drift | The deployed state diverging from its infrastructure-as-code definition. |
| Container image scanning | Checking images for known vulnerabilities and unwanted contents. |
| IAM | Identity and access management: cloud identities, roles and permissions. |
| Infrastructure as code | Defining infrastructure in version-controlled templates, which can be scanned before deployment. |
| Instance metadata service | A cloud endpoint that hands credentials and data to workloads; exposure can allow token theft. |
| Kubernetes RBAC | Role-based access control for cluster resources. |
| MASVS | OWASP Mobile Application Security Verification Standard with eight control groups; MASTG is the testing guide. |
| Operational technology | Systems that control physical processes; prefer passive observation when testing them. |
| Pod Security Admission | The Kubernetes admission controller that enforces Pod Security Standards levels. |
| Shared responsibility model | The split of security duties between cloud provider and customer, used to place each finding. |

## AI and LLM security (hub section 11)

| Term | Definition |
| --- | --- |
| AI red teaming | Adversarial testing of AI systems with attack prompts and evaluations, using tools such as garak, PyRIT and promptfoo. |
| Data and model poisoning | Tampering with training, fine-tuning or embedding data (LLM04). |
| Evaluation harness | Curated attack prompts, automated runners and assertions on outputs and actions, kept as a regression suite. |
| Excessive agency | The model or agent has more tools, permissions or autonomy than it needs (LLM06). |
| Improper output handling | Downstream code trusts model output; encode and validate it like any untrusted input (LLM05). |
| MITRE ATLAS † | Knowledge base of adversary tactics and techniques against AI systems, modelled on ATT&CK. |
| Prompt injection | Instructions hidden in text the model reads, directly or indirectly, steer it against policy (LLM01). |
| System prompt leakage | Extraction of hidden instructions, which should never hold secrets (LLM07). |
| Unbounded consumption | Excessive resource or cost use through long inputs, runaway loops or missing caps (LLM10). |
| Vector and embedding weaknesses | Access-control and isolation flaws in retrieval stores (LLM08). |

## Human factors and social engineering (hub section 12)

| Term | Definition |
| --- | --- |
| Baiting | Leaving a lure, such as a found USB stick or QR code, to tempt use. |
| Business email compromise | An impersonated executive or supplier asks for a payment or data. |
| Deepfake | Synthetic voice or video used to impersonate a trusted person. |
| Insider threat | Risk from people with legitimate access, whether malicious or careless. |
| MFA fatigue | Repeated push prompts until someone approves one. |
| Persuasion levers | Authority, urgency, scarcity, social proof, reciprocity, liking and commitment. |
| Phishing | Deceptive messages that push a click or a credential entry. |
| Pretexting | Inventing a believable scenario to obtain information or access. |
| Smishing | Phishing by SMS text message. |
| Social engineering | Manipulating people into disclosing information or performing actions. |
| Spear-phishing | Phishing tailored to a specific person or group. |
| Tailgating | Following an authorised person through a controlled door. |
| Vishing | Voice phishing by phone, including help-desk impersonation. |

## Penetration testing and scoring (hub section 13)

| Term | Definition |
| --- | --- |
| Bug bounty | A programme that pays outside researchers for valid reports within a defined scope. |
| CISA KEV | The CISA catalogue of vulnerabilities with observed exploitation. |
| Coordinated disclosure | Reporter and vendor agree a fix period before the details are published. |
| CVE | An identifier for one specific, publicly disclosed vulnerability. |
| CVSS | Common Vulnerability Scoring System; v4.0 has Base, Threat, Environmental and Supplemental metric groups. |
| EPSS | Exploit Prediction Scoring System: the probability that a vulnerability is exploited within 30 days. |
| NIST SP 800-115 | Technical guide to security testing; its penetration-test phases are planning, discovery, attack and reporting. |
| NVD | The US National Vulnerability Database, which enriches CVE records. |
| OSSTMM † | ISECOM's metrics-driven methodology across human, physical, wireless, telecommunications and data-network channels. |
| Penetration test | An authorised, time-boxed attempt to exploit weaknesses inside a defined scope and show real impact. |
| Post-exploitation | Activity after initial access; use the minimum needed to prove impact. |
| PTES † | Penetration Testing Execution Standard: pre-engagement through reporting in seven phases. |
| Purple team | A collaborative exercise in which attackers and defenders share each step. |
| Red team | A goal-based, often covert exercise that tests detection and response as well as prevention. |
| security.txt † | A standard file (RFC 9116) giving security contact details. |
| TIBER-EU | The EU framework for threat-intelligence-based red-team testing in finance. |
| Vulnerability assessment | Broad, mostly automated identification of weaknesses and their severity. |
| Vulnerability disclosure policy | Tells researchers how to report a vulnerability safely. |

## Blue team and incident response (hub section 14)

| Term | Definition |
| --- | --- |
| 3-2-1 backup | Three copies, two media types, one off-site; keep at least one copy offline or immutable. |
| 5 Whys | Asking why repeatedly to separate symptoms from causes. |
| Atomic Red Team | A library of small, harmless technique simulations used to test whether detections fire. |
| Blameless review | A post-incident analysis that looks for root causes and fixes, not fault. |
| Containment | Limiting the spread and impact of an incident. |
| Correlation ID | An identifier that ties together all log records of one request. |
| EDR | Endpoint detection and response: telemetry and response actions on endpoints. |
| Eradication | Removing the cause of an incident from the environment. |
| Incident response | Organised handling of a security incident from preparation to lessons learned. |
| Log injection | Control characters in input that forge or corrupt log entries; neutralise user input before logging. |
| MTTD and MTTC | Mean time to detect and mean time to contain. |
| RPO and RTO | Recovery point objective is the most data you can lose; recovery time objective is the longest downtime you can accept. |
| SIEM | Security information and event management: collects and correlates logs and raises alerts. |
| Sigma | A shared, vendor-neutral format for detection rules, mapped to ATT&CK techniques. |
| Tabletop exercise | A discussion-based rehearsal of an incident scenario. |
| Telemetry | Records from endpoints, identity, network, cloud control plane, applications and email. |
| Vulnerability management | The cycle of inventory, assess, prioritise, remediate or mitigate, verify and report. |

## Governance, risk and compliance (hub section 15)

| Term | Definition |
| --- | --- |
| CIS Controls | Eighteen prioritised controls (version 8.1), made up of safeguards and grouped into three implementation groups. |
| Compliance | Meeting a required standard. It is the floor: it shows conformance, not resistance. |
| DORA † | EU Regulation 2022/2554 on digital operational resilience for financial entities, applying from 17 January 2025. |
| EU AI Act | Risk-based regulation of AI systems; the Digital Omnibus postpones the high-risk dates. |
| EU Cyber Resilience Act | Cybersecurity requirements for products with digital elements; vulnerability reporting starts 11 September 2026. |
| GDPR † | EU data-protection regulation; Article 32 expects security appropriate to risk, Article 33 sets 72-hour breach notification. |
| ISO/IEC 27001 | Certifiable requirements for an information security management system. |
| ISO/IEC 27002 † | The control catalogue that supports 27001; 93 controls in the 2022 edition. |
| Mandatory and voluntary standards | Mandatory ones come from regulation or contract; voluntary ones are chosen as good practice. |
| NIS2 † | EU Directive 2022/2555 for essential and important entities, with 24-hour, 72-hour and one-month incident reporting steps. |
| NIST CSF 2.0 | Voluntary framework published in February 2024 with six functions: Govern, Identify, Protect, Detect, Respond, Recover. |
| NIST SP 800-53 † | Catalogue of security and privacy controls, including penetration testing and vulnerability scanning. |
| PCI DSS † | Payment card data security standard; requirement 11 covers regular scans and penetration tests. |
| Risk register | A list of risks, each with an owner, a treatment, a target date and the residual risk. |
| SOC 2 | AICPA attestation against the trust services criteria. |

## Security tools and labs (hub sections 16 and 17)

| Term | Definition |
| --- | --- |
| Burp Suite | A web proxy and testing toolkit from PortSwigger for intercepting, replaying and scanning requests; the Community edition is free. |
| Capture the flag | A competition or puzzle format for practising security skills. |
| Exploitation framework | A tool such as Metasploit for validating exploitability; authorised use only. |
| Home lab | An isolated environment with an attacker machine and deliberately vulnerable targets. |
| Intercepting proxy | A tool between browser and server that inspects, replays and modifies traffic, such as Burp Suite or ZAP. |
| OWASP ZAP | An open-source intercepting proxy and web scanner (Zed Attack Proxy) whose automation framework can run in a CI pipeline. |
| Port scanner | A tool such as Nmap that discovers open ports and services. |
| Semgrep | A pattern-based static-analysis tool whose rules look like the code they find; suited to fast checks in pull requests. |
| Trivy | An open-source scanner for container images, file systems and infrastructure-as-code that reports vulnerable packages, misconfigurations and secrets. |
| Vulnerability scanner | An automated tool that checks systems for known weaknesses. |
| Wireshark | A packet analyser that shows network traffic frame by frame; used to inspect protocols and TLS handshakes. |
