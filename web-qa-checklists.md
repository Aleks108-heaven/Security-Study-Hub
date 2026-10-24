# Web UI QA Checklists

Checklists for testing a web page or application. Tick an item only when you have verified it; record anything you could not test as **Not tested**, never as passed. Automated scanners find only part of the issues in the accessibility, performance and security sections, so pair them with manual passes.

Sections: 1 Functional | 2 Accessibility (WCAG 2.2 AA) | 3 Performance | 4 Compatibility | 5 Client-side security | 6 Privacy | 7 Native desktop app UI

## 1. Functional

- [ ] Forms: required and optional fields, maximum length, whitespace trimming, paste, autofill, double submit; client-side and server-side validation messages agree
- [ ] Navigation: deep links, back and forward, refresh mid-flow, multiple tabs, 404 and 500 pages
- [ ] State: session expiry (with a warning or a way to continue), logout in another tab, cookies disabled, offline and slow network
- [ ] Errors: 4xx and 5xx shown in plain language with a way to retry; rate-limit messages; no raw error text or stack traces
- [ ] Content: long text, Unicode and emoji, right-to-left, empty states, large datasets, time zones, date and number formats
- [ ] Destructive actions: confirmation or undo; no accidental duplicate creation

## 2. Accessibility (WCAG 2.2 AA)

Success criteria are in brackets; "new in 2.2" marks the additions in WCAG 2.2.

- [ ] Keyboard (2.1.1, 2.1.2, 2.4.3): every control reachable and operable, logical tab order, no keyboard trap, Esc closes dialogs
- [ ] Focus (2.4.7, 2.4.11 new in 2.2): focus is visible and not hidden behind sticky headers or banners
- [ ] Semantics (1.3.1, 4.1.2): one `h1`, landmarks, labels tied to inputs, button versus link, table headers and captions; custom controls expose name, role and state
- [ ] Text alternatives (1.1.1): meaningful alt text; decorative images hidden from assistive technology
- [ ] Contrast (1.4.3, 1.4.11): 4.5:1 for text (3:1 for large text); 3:1 for UI component boundaries and meaningful graphics
- [ ] Color (1.4.1): no meaning conveyed by color alone
- [ ] Resize and reflow (1.4.4, 1.4.10): text resizes to 200%; content reflows at 320 CSS px wide (400% zoom) without two-dimensional scrolling
- [ ] ARIA (4.1.2, 4.1.3): used only where native HTML is insufficient; status messages are announced without moving focus (live regions)
- [ ] Pointer (2.5.8 and 2.5.7, both new in 2.2): targets at least 24x24 CSS px (with exceptions); every drag has a non-drag alternative
- [ ] Forms (3.3.1, 3.3.2, 3.3.7 new in 2.2): errors identified in text and tied to their fields; labels or instructions present; users are not asked to re-enter information they already gave
- [ ] Authentication (3.3.8 new in 2.2): login does not depend on a cognitive test (memorising or transcribing); paste and password managers work
- [ ] Help (3.2.6 new in 2.2): help or a contact route is in the same place on every page
- [ ] Timing (2.2.1): time limits can be extended, or users are warned before they expire
- [ ] Motion (2.3.1): nothing flashes more than 3 times a second; also respect `prefers-reduced-motion` (good practice beyond AA)
- [ ] Tools: axe-core, Lighthouse and WAVE catch only part of the issues, so also do a manual keyboard pass and a screen-reader pass (NVDA, VoiceOver)

## 3. Performance budgets

Typical targets, measured at the 75th percentile of real-user data. Use lab runs to catch regressions, and test on a throttled mobile profile as well as on desktop.

LCP <= 2.5 s | INP <= 200 ms | CLS <= 0.1 | TTFB <= 800 ms | JS bundle: investigate above about 170 KB gzipped on mobile (a rule of thumb, not a standard)

## 4. Compatibility matrix (pairwise)

Cover every pair of values across these dimensions rather than every combination.

- Browsers: Chromium, Firefox, WebKit
- Viewports: 360, 768, 1280, 1920
- OS: Windows, macOS, Android, iOS
- Locales: en, de, ar (RTL), ja
- Display: light and dark, `prefers-contrast`, forced colors

## 5. Client-side security

- [ ] A Content-Security-Policy is present
- [ ] No secrets in the bundle or source maps
- [ ] Cookies are `HttpOnly`, `Secure` and `SameSite`
- [ ] No open redirects
- [ ] HTML is sanitized before `innerHTML` or equivalent use
- [ ] Subresource Integrity (SRI) on third-party scripts
- [ ] Mixed content is blocked
- [ ] Framing is blocked (`frame-ancestors`)
- [ ] `postMessage` handlers check the sender's origin
- [ ] No tokens in `localStorage` unless the risk is accepted

## 6. Privacy

- [ ] Non-essential cookies and trackers load only after consent, where consent is required
- [ ] No personal data or tokens in URLs, referrers or analytics events
- [ ] Every third-party script is listed and justified
- [ ] Data export or deletion works, if the product promises it

## 7. Native desktop app UI

Use when the target is a desktop application rather than a page.

- [ ] Keyboard: Tab reaches every control (on macOS, with Full Keyboard Access on); the standard shortcuts work (open Settings, close window, quit); Esc dismisses popovers and dialogs; menu items show shortcuts where they exist
- [ ] Screen reader (VoiceOver, Narrator or NVDA, Orca): every control has a name; tabs and switches announce their selected or on state; the tray or menu-bar item has a label and value (for example "AppName, on, 2 jobs paused"); table rows read as a whole
- [ ] Appearance: light and dark; increased contrast or Windows contrast themes; reduced transparency and reduced motion; the system accent color and text scaling if the app follows them
- [ ] Windows and displays: resizable where it makes sense, remembers size and position, works on a second display, in full screen and at high DPI
- [ ] Tray and menu-bar apps: the item can be hidden when the bar is crowded (including notched MacBook displays), so every action is also reachable another way (settings window, relaunching the app)
- [ ] Lifecycle: first launch; launch at login (including any OS approval step); quit restores everything the app changed; one instance only; sleep and wake; crash then relaunch; install, update and uninstall leave no orphaned background items
- [ ] Text: strings 30% longer than English (German) and right-to-left text still fit; nothing is truncated without a tooltip or full view
