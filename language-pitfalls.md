# Language-Specific Pitfalls

Review prompts for code audits, grouped by language. They are places to look, not findings: confirm each one in the source (file and line) before reporting it, and check whether the framework or a linter already prevents it. If the stack is not listed, apply **All languages** plus the closest family.

How to use: identify the stack (manifests, lockfiles, file extensions), read the matching section, run the listed tools when they are present and safe, and report only what you verified. Label anything reasoned but not demonstrated as inferred.

## All languages

- Hardcoded secrets; secrets in logs, error messages, URLs or committed configuration
- Missing input validation at trust boundaries (network, files, environment, IPC, deserialized data)
- Missing timeouts, retries with backoff, and cancellation on network and subprocess calls
- Swallowed or overly broad exception handling; errors that fail open
- Unbounded resource use (memory, CPU, file handles, connections, recursion depth, request size)
- Weak randomness for tokens, IDs and keys; weak or home-made cryptography
- Unpinned dependencies, missing lockfiles, unmaintained or typosquatted packages
- No tests for negative and boundary cases or for critical paths

## Python

- **Security:** `eval`/`exec`; `pickle`, `marshal` or `yaml.load` on untrusted data (use `yaml.safe_load`); `subprocess` with `shell=True`; SQL built with string formatting; `requests` with `verify=False`; `tempfile.mktemp`; `random` for secrets (use `secrets`); XML parsing without `defusedxml`; Flask/Django `DEBUG=True`
- **Reliability:** mutable default arguments; bare `except`; `assert` used for validation (stripped under `-O`); files and connections not closed (use `with`); `requests` without a timeout; blocking calls inside `async` code
- **Tools:** Bandit, Ruff, mypy, pip-audit, Semgrep

## JavaScript / TypeScript

- **Security:** prototype pollution; `eval`, `new Function`, string timers; `innerHTML`, `document.write` and `dangerouslySetInnerHTML` with untrusted data (XSS); `child_process.exec` with user input; open redirects; `Math.random` for tokens; secrets in client bundles or source maps; ReDoS from backtracking regexes; vulnerable transitive dependencies
- **Reliability:** unhandled promise rejections; missing `await`; `==` coercion; shared mutable state across requests; leaked event listeners and timers; `any` abuse and unchecked casts in TypeScript
- **Tools:** ESLint (with security rules), `tsc --strict`, `npm audit`, OSV-Scanner, Semgrep

## Java (and Kotlin on the JVM)

- **Security:** deserialization (`ObjectInputStream`); XXE in XML parsers (disable DTDs and external entities); SQL built by concatenation; Log4Shell-class issues (untrusted data in log lookups, outdated logging libraries); exposed Spring Boot actuator endpoints; expression-language (SpEL) injection; CSRF protection disabled without a reason
- **Reliability:** resources not closed (use try-with-resources); null handling; non-thread-safe shared state and unsynchronised collections; swallowed `InterruptedException`
- **Tools:** SpotBugs with Find Security Bugs, Error Prone, OWASP Dependency-Check, Semgrep

## C# / .NET

- **Security:** SQL built by concatenation; `BinaryFormatter` and other unsafe deserializers; weak crypto (MD5, SHA-1, DES); missing `[Authorize]` or policy gaps; model-binding over-posting; hardcoded connection strings
- **Reliability:** missing `using`/`Dispose`; `async void`; `.Result` and `.Wait()` deadlocks; dependency-injection lifetime mismatches (a scoped service captured by a singleton); nullable warnings ignored
- **Tools:** Roslyn/.NET analyzers with nullable reference types enabled, `dotnet list package --vulnerable`, Semgrep

## Go

- **Security:** `InsecureSkipVerify`; `math/rand` for secrets (use `crypto/rand`); SQL built by concatenation; path traversal on user-supplied paths; template injection
- **Reliability:** ignored errors; goroutine leaks; data races; unbounded reads (`io.ReadAll` on untrusted bodies); HTTP clients and servers without timeouts; `defer` inside loops; writes to a nil map
- **Tools:** `go vet`, staticcheck, gosec, `go test -race`, govulncheck

## PHP

- **Security:** `include`/`require` with user input (LFI/RFI); `unserialize` on untrusted data; SQL built by concatenation; type juggling with loose `==`; file-upload handling; session fixation; `display_errors` on in production
- **Tools:** PHPStan or Psalm, `composer audit`, Semgrep

## Ruby

- **Security:** `eval`, and `send`/`public_send` with user input; mass assignment (use strong parameters); `YAML.load` on untrusted data (use `YAML.safe_load`); shell calls (backticks, `system`) with interpolated input; SQL fragments built from params
- **Tools:** Brakeman (Rails), RuboCop, bundler-audit

## Rust

- **Security:** `unsafe` blocks without a documented invariant; `unwrap`, `expect` and unchecked indexing that can panic on untrusted input (denial of service); integer overflow that wraps in release builds
- **Reliability:** blocking calls inside async code; unbounded channels and queues
- **Tools:** Clippy, cargo-audit, cargo-deny, Miri (for `unsafe` code)

## C / C++

- **Security:** buffer overflows (`strcpy`, `gets`, unchecked indexing); use-after-free and double free; format-string bugs; integer overflow before allocation; uninitialised memory; time-of-check to time-of-use races on files
- **Reliability:** undefined behaviour; leaks; data races; ignored return values
- **Tools:** compiler warnings (`-Wall -Wextra`), clang-tidy, cppcheck, AddressSanitizer and UBSan, fuzzing (libFuzzer, AFL++)

## SQL and data access

- **Security:** dynamic SQL built by concatenation; application accounts with owner or DBA rights; sensitive columns unencrypted or unmasked in non-production copies
- **Reliability:** missing transactions around multi-step writes; N+1 queries; missing indexes on filter and join columns; implicit type conversions that defeat indexes; no migration rollback plan
- **Tools:** SQLFluff, the database's `EXPLAIN` plans

## Bash and PowerShell

- **Bash:** unquoted variables; missing `set -euo pipefail`; `curl | sh`; `eval`; parsing `ls` output; `rm -rf` with an unchecked variable; predictable or world-writable temp files (use `mktemp`)
- **PowerShell:** `Invoke-Expression`; plaintext secrets and `-AsPlainText` conversions; `-ExecutionPolicy Bypass` as a habit; missing `-ErrorAction Stop` with `try`/`catch`; unvalidated path input
- **Tools:** ShellCheck, PSScriptAnalyzer

## Infrastructure as code and CI

- **Dockerfile:** running as root; `latest` or unpinned base images; secrets in layers or build arguments; `curl | sh`; `ADD` from remote URLs
- **Terraform and cloud:** public buckets; wildcard IAM; secrets in state or variable files; unencrypted storage; open security groups
- **GitHub Actions and other CI:** unpinned third-party actions (pin to a commit SHA); `pull_request_target` running untrusted code; untrusted `${{ github.event.* }}` values interpolated into `run:` scripts; over-broad `GITHUB_TOKEN` permissions; secrets echoed to logs
- **Tools:** hadolint, Trivy, Checkov, actionlint
