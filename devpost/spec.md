---
doc: spec
status: approved
---

# SubTrack — Technical Specification

## How it works, in plain language
SubTrack is just a web page, with no server and no account. The page itself does three things: show the form and list, store subscriptions in the browser's own storage, and recompute order and totals on every change. When a subscription is added, the page saves it, sorts it by next renewal date, and updates totals — all in the browser, on the same page. On refresh, the page reads the list back from browser storage, so data is not lost.

## Core journey through the system
PRD reference: `prd.md > Core journey`.
"User opens index.html (served locally) → page reads subscriptions from localStorage → renders summary and list in renewal order → user fills the form and clicks save → page validates fields, stores the subscription, re-sorts, re-renders summary and list → user edits, pauses or deletes → same save, sort, re-render → user refreshes → storage is read again and the same list reappears."

## Tech stack
- Plain HTML, CSS and JavaScript, no framework, no build step. Reason: one page, one afternoon, nothing to install, nothing to compile, and the demo recording records the real page.
- Browser localStorage for persistence. Documentation: MDN Web Docs, localStorage. Reason: a server is out of scope; storage persists across refresh in the same browser.
- Only a local static server to serve the page (for example `python3 -m http.server` or `npx serve`). Reason: serving over http avoids file-protocol quirks; the app itself has no backend.
- No external services, no API keys, no dependencies to install.

## Where it runs, how to try it
Runtime: any modern browser, served locally. Requirements: a browser supporting localStorage; no account, no API key.
Start command (in the project folder):
```
python3 -m http.server 8000
```
Then open http://localhost:8000/ in the browser. For the demo recording, the same page is opened in Chromium on a virtual display and recorded with ffmpeg.
Submission needs a short demo video and a public GitHub repository. Deployment is optional and is not chosen for this proof of concept; the video is the deliverable, not a live link.

## Look and feel
Colors: light neutral background, dark text, white cards; urgency shown only by color — overdue red, due within 7 days amber, paused grey. Fonts: system sans-serif, totals large and bold, list rows regular size. Density: compact list rows, several subscriptions visible on one screen. Interface copy: English. Taken from `prd.md > Look and feel`; no further design research is needed.

## Components

### Page shell (index.html)
What it does: holds the header, summary strip, form, list container and footer actions. Connects to: the app script.
PRD reference: `prd.md > Interface and layout`.

### Subscription form
What it does: collects name, amount, currency, cycle, next renewal date, category and notes; validates required fields; emits a subscription object on save; pre-fills on edit. Connects to: store and renderer.
PRD reference: `prd.md > Add subscription`.

### Subscription list renderer
What it does: sorts subscriptions (overdue first, then nearest first, paused last), computes days until renewal and urgency, renders one row per subscription with edit / pause / resume / delete actions. Connects to: store.
PRD reference: `prd.md > List and renewal sorting`, `prd.md > Edit, pause, delete`.

### Summary calculator
What it does: using only active subscriptions, computes monthly-equivalent and yearly-equivalent totals grouped by currency, active count, and count due within 30 days. Connects to: store and page shell.
PRD reference: `prd.md > Summary totals`.

### Store (localStorage)
What it does: loads the subscription array on startup, saves it on every change, provides add / update / delete / toggle-pause operations. Connects to: form, renderer and calculator.
PRD reference: `prd.md > Persistence and sample data`.

### Sample data loader
What it does: when the list is empty, offers to insert three sample subscriptions, with renewal dates falling in the overdue, due-soon and upcoming states; sample entries can be cleared. Connects to: store.
PRD reference: `prd.md > Persistence and sample data`.

## Data model
One array, stored in localStorage under key `subtrack.subscriptions.v1`, saved as JSON. Each subscription:
```
{
  "id": "string (generated, e.g. Date.now + random)",
  "name": "string, required",
  "amount": "number, > 0",
  "currency": "string, e.g. CNY",
  "cycle": "'monthly' | 'yearly'",
  "nextRenewal": "'YYYY-MM-DD'",
  "category": "string",
  "notes": "string, optional",
  "paused": "boolean",
  "isSample": "boolean"
}
```
Where it lives: only in that origin's browser localStorage. How it updates: the whole array is written back on every add / edit / pause / delete. When the user leaves and returns: the page loads the array and renders it again. Clearing that site's browser data clears subscriptions.

## File structure
```
project/
├── index.html          # Page shell: header, summary, form, list, footer
├── styles.css          # Layout, urgency colors, paused muted style
├── app.js              # Form, store, sorting, totals, rendering, sample data
├── README.md           # What it is, who it is for, how to run it, what was learned
├── devpost/            # Devpost learning workspace
│   ├── learner-profile.md   # Personal background, in .gitignore, not public
│   ├── scope.md
│   ├── prd.md
│   ├── spec.md
│   └── checklist.md
└── .gitignore          # Ignores devpost/learner-profile.md
```

## External services and dependencies
None. No APIs, no database, no hosting, no keys, no rate limits, no cost.

## Realistic failure modes
- **Browser storage unavailable or cleared** → the app shows the empty state again; the user sees the empty prompt and sample-data option, it does not crash. Because there is no server, there is no way to recover from a server.
- **Invalid form input** → saving is blocked and names which field is wrong, keeping the values already entered.
- **A past date** → treated as overdue, not rejected, because overdue subscriptions are a real state the app must show.

## Simplifications, and why
- **localStorage instead of a server database**: a server needs accounts and hosting; the proof of concept only needs data to persist across refresh.
- **Totals grouped by currency, not converted**: conversion needs an exchange-rate source that was never chosen.
- **In-page urgency highlighting instead of real reminders**: real reminders need a server and notification permissions; highlighting shows the same "due soon" information in the demo.
- **Plain JavaScript instead of a framework**: a framework would add install and build steps to a single-page proof of concept.

## Decisions and open issues
- Tech stack (plain HTML/CSS/JS, no build): chosen for a one-afternoon proof of concept; the cost is no component system, which is fine at this scale. This is an implementation recommendation, not a learner product choice.
- Served locally only, not deployed: because the video is the submission deliverable, not a live link.
- One real uncertainty: whether totals should convert currencies. Resolved: do not convert, group by currency label, see PRD.
- Open items: project name "SubTrack", English interface — confirmed by the user on 2026-10-26; submission text is in English.
