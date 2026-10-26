# SubTrack — Subscription Management Assistant

A single-page subscription management assistant: see how much you pay each month, what renews next, and what is due soon.

## Who it is for
People with many subscriptions — streaming, music, tools, cloud services — who often forget renewal dates and only notice when a charge appears.

## What it can do
- Add, edit, delete, pause / resume subscriptions
- Sort by days until renewal: overdue first, due within 7 days highlighted, overdue red, due-soon amber
- Monthly-equivalent and yearly-equivalent totals, grouped by currency (no currency conversion)
- Count of renewals due within 30 days, All / Active / Paused filter
- Data stored in browser localStorage, persisting after refresh; sample data loads and clears with one click

## How to run
In the project folder, run:

```
python3 -m http.server 8000
```

Then open http://localhost:8000/ in the browser.

No account, no API key, no server. Data is stored only in this browser and is never sent to any server.
SubTrack never charges, pays for, or cancels any real subscription.

## Demo video
The demo records the real running app (Chromium on a virtual display + ffmpeg screen recording), not an AI-generated fake demo:
open `?demo=1` and it automatically demonstrates: empty state → load sample data → add a cloud storage subscription → pause a music subscription → filter paused → back to all.

## What was learned
- Starting from an empty folder and working step by step through scope → PRD → spec → code with the skill pack is a rhythm that fits in one afternoon.
- The hardest part was not writing code, but cutting scope to exactly what matters: renewal sorting and totals are the core; reminders, sync and conversion can come later.
- The demo must record the real app: reviewers will not clone and run the code, so the video itself has to show that it really works.

## Planning documents
`devpost/scope.md`, `devpost/prd.md`, `devpost/spec.md` (all approved). The personal background file `devpost/learner-profile.md` is in `.gitignore` and is not public.
