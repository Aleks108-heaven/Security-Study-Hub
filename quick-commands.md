# Quick-Check Commands (read-only)

A short set of commands for a first look at the health and security posture of a machine. They only read system state: none of them installs, changes or deletes anything. Run them on machines you own or are authorised to inspect.

## Before you start

- Some commands return partial data without elevated rights (root, `sudo` or an administrator shell). Record the privilege level you ran with, and treat missing output as "not checked", not as healthy.
- A few commands contact the network (`softwareupdate -l`, package-index checks). They stay read-only for the system but make outbound requests.
- Output can contain host names, user names, paths and sometimes secrets. Review and redact it before sharing.
- Run the commands one at a time, so a failure in one does not hide the others.

## Linux

```bash
systemctl --failed                                         # failed units
ps aux --sort=-%cpu | head -10                             # top CPU consumers
free -h                                                    # memory
df -h                                                      # disk space
ss -tulpn                                                  # listening sockets (run with sudo to see owning processes)
sudo ufw status                                            # firewall; without ufw use `sudo nft list ruleset` or `sudo iptables -S`
journalctl -p err --since "24 hours ago" --no-pager | tail -50
apt list --upgradable 2>/dev/null | head                   # Debian/Ubuntu; on RHEL/Fedora use `dnf check-update`
python3 --version                                          # runtimes in use: check for end-of-life versions
node -v
```

## Windows (PowerShell)

```powershell
Get-Service | Where-Object { $_.Status -eq 'Stopped' -and $_.StartType -eq 'Automatic' }
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10 Name, Id, CPU
Get-PSDrive -PSProvider FileSystem                         # free space per drive
Get-NetTCPConnection -State Listen | Sort-Object LocalPort
Get-NetFirewallProfile | Select-Object Name, Enabled
Get-MpComputerStatus                                       # Microsoft Defender; may need an elevated shell, absent if another AV is primary
Get-WinEvent -FilterHashtable @{ LogName = 'System','Application'; Level = 1,2; StartTime = (Get-Date).AddDays(-1) } -MaxEvents 50
```

The Security event log needs an elevated shell and is not queried here.

## macOS

```bash
launchctl list | awk '$2 != 0'                             # jobs whose last exit status was non-zero
ps aux -r | head -10                                       # top CPU consumers
df -h                                                      # disk space
lsof -iTCP -sTCP:LISTEN -n -P                              # listening TCP sockets
/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
csrutil status                                             # System Integrity Protection
spctl --status                                             # Gatekeeper
softwareupdate -l                                          # pending updates (contacts Apple's servers)
log show --last 24h --predicate 'messageType == error' | tail -50   # can be slow; try --last 1h first
```

## Reading the results

- A failed unit, a stopped automatic service or a non-zero exit status is a lead, not a verdict. Record the command, the real output and your privilege level, and weigh a benign explanation before rating it.
- Rate issues by impact (1-5) times likelihood (1-5): Critical 20-25, High 12-19, Medium 6-11, Low 2-5, Info 0-1. Report what you could not check.
- Signs of active compromise (unknown persistence, unexplained outbound connections): preserve the evidence, isolate the host and involve incident response. Do not clean up.
