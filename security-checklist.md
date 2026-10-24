# Security Checklist (map findings to these)

Host and application hardening checks for Linux, macOS and Windows. Cite the item number when you report a finding. Items without a platform tag apply everywhere; **mac** = macOS, **lin** = Linux, **win** = Windows.

Every command here only inspects state. Run them on systems you own or are authorised to audit, record the privilege level you used, and report missing privileges as coverage gaps, never as passes.

## Reporting a finding

Give: the checklist item number, severity, evidence, confidence and the fix.

- **Severity:** Critical / High / Medium / Low / Info, computed as impact (1-5) times likelihood (1-5): Critical 20-25, High 12-19, Medium 6-11, Low 2-5, Info 0-1. Raise likelihood for internet exposure, lower it for localhost-only exposure or a verified compensating control, and say which adjustment you applied.
- **Evidence:** the command and its real output, trimmed, with secrets masked.
- **Confidence:** High (observed directly), Medium (strong indicators, a benign explanation not fully excluded) or Low (weak indicator, needs verification). Confidence does not change severity. Anything you did not examine goes under "Not checked", not in the findings.
- **Fix:** the exact change, its risk, how to roll it back and how to verify it. Suggest it; do not execute it.

Indicators are not proof: always weigh benign explanations and state confidence. Signs of active compromise (unknown persistence, unexplained outbound connections): preserve evidence, isolate the host and involve incident response. Do not clean up.

## Checklist

### 1. Patching

Look for: pending OS and application updates; end-of-life OS or runtimes; known CVEs for installed versions (cross-check vendor advisories, NVD and `osv-scanner`).

- mac: `softwareupdate -l`
- lin: `apt list --upgradable` or `dnf check-update`
- win: Windows Update status; `Get-HotFix` lists installed updates only, not pending ones

### 2. Network exposure

Look for: services listening on 0.0.0.0 that should be local; unexpected ports; unauthenticated admin interfaces (databases, Docker API, Redis, Jupyter).

- lin: `ss -tulpn`
- mac: `lsof -iTCP -sTCP:LISTEN -n -P`; Sharing settings (Remote Login, Screen Sharing, File Sharing)
- win: `Get-NetTCPConnection -State Listen`

### 3. Authentication

Look for: default or empty credentials, password SSH, root login, shared accounts.

- lin: `sshd -T | grep -Ei 'permitrootlogin|passwordauthentication'` (needs root)
- mac: automatic login on, no password after screen lock, a shared admin account
- win: accounts with blank passwords, a shared local administrator account

### 4. Privilege

Look for: broad sudo rights; services running as root or SYSTEM unnecessarily.

- lin/mac: SUID/SGID oddities, writable service binaries or paths, `NOPASSWD` in sudoers
- mac: unexpected helpers in `/Library/PrivilegedHelperTools`
- win: unquoted service paths

### 5. Persistence

Look for: unfamiliar entries that run at login or boot; new `authorized_keys`.

- mac: LaunchAgents and LaunchDaemons, Login Items and Background Items (`sfltool dumpbtm`), cron
- lin: cron, systemd timers (`systemctl list-timers`)
- win: scheduled tasks (`Get-ScheduledTask`), Run keys, startup commands

### 6. Integrity

Look for: unsigned, ad-hoc signed or unusual-location binaries; hash mismatches against the package manager.

- mac: `codesign --verify --deep --strict`, `spctl -a -vv`
- lin: `debsums`, `rpm -V`
- win: `Get-AuthenticodeSignature`, `sfc /verifyonly`

### 7. Protection controls

Look for: firewall, antivirus or EDR, disk encryption.

- mac: SIP (`csrutil status`), Gatekeeper (`spctl --status`), FileVault (`fdesetup status`), Apple silicon startup security
- lin: AppArmor or SELinux, Secure Boot, firewall status (`ufw status`, `nft list ruleset`)
- win: BitLocker (`Get-BitLockerVolume`, elevated), Defender (`Get-MpComputerStatus`), firewall profiles (`Get-NetFirewallProfile`)

### 8. Secrets

Look for: plaintext credentials in environment variables, configuration files, `.env` files, shell history and git history. A secret scanner such as gitleaks can cover repositories. Report the location only and mask the values.

### 9. Logging

Look for: auditing enabled, log rotation, retention long enough to investigate, and exposure to tampering.

- lin: journald and auditd settings, logrotate configuration
- win: audit policy (`auditpol /get /category:*`, elevated), event log sizes
- mac: unified logging; whether logs are forwarded off the host

### 10. Supply chain

Look for: unpinned dependencies, missing lockfiles, untrusted repositories, PPAs and taps, typosquatted packages, installers that pipe `curl` into a shell, unsigned or un-notarized downloads.

### 11. Privacy permissions (mac)

Look for: Full Disk Access, Accessibility, Screen Recording and Input Monitoring granted to apps that do not need them (System Settings > Privacy & Security).

### 12. Backups and recovery

Look for: backups exist, are encrypted, are stored apart from the host, and a restore has been tested.

### 13. Containers and virtualization

Look for: the Docker socket (`/var/run/docker.sock`) mounted into containers or the daemon exposed on TCP; privileged containers; containers running as root; unpinned or `latest` images; secrets in environment variables or image layers; no resource limits.

- Any platform with Docker: `docker ps`, and `docker inspect --format '{{.Name}} privileged={{.HostConfig.Privileged}} user={{.Config.User}}' <container>`
