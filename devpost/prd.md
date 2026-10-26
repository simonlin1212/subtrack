---
doc: prd
status: approved
---

# SubTrack — Product Requirements

One line: a single-page subscription management assistant that lets people with many subscriptions see renewal order and monthly totals at a glance.
Sources: `scope.md > Unique core`, `scope.md > Core loop`, `scope.md > Proof-of-concept boundary`.

## Core journey
1. Open the app. If there is no data yet, see an empty state with two clear actions: add a subscription, or load sample data.
2. Add a subscription: enter name, amount, currency, billing cycle (monthly or yearly), next renewal date, category and optional notes, then save.
3. The subscription appears in the list, sorted by days until renewal, and the monthly-equivalent total updates immediately.
4. The summary strip at the top shows at a glance: monthly-equivalent total, yearly-equivalent total, active count, and count due within 30 days.
5. Narrow the list with the filter (All / Active / Paused); edit a subscription to change amount or renewal date, pause one that is temporarily unused, delete one that was cancelled.
6. Refresh the page and the data is still there — it is stored in the browser.
7. Success looks like: adding a subscription visibly changes order, highlighting and totals in one step, so the demo can be explained in under a minute.

## Interface and layout
A single page, no page navigation:
- Header: app name and a one-line explanation.
- Summary strip: monthly-equivalent total, yearly-equivalent total, active count, count due within 30 days. With multiple currencies, totals are grouped by currency.
- Add / edit form: above or beside the list; editing reuses the same form.
- Subscription list: one row per subscription, sorted by days until renewal.
- Footer actions: load sample data, clear sample data (only shown when sample data exists).

## Look and feel
Calm and dense, like a finance dashboard. Renewal urgency is shown only with color and text, not decoration: overdue red, due within 7 days amber, other items neutral. Totals are larger and bolder than list rows. Interface copy is in English. There is no full design system — renewal dates and totals must be the most prominent things on the page.

## Features and behavior

### Add subscription
- Fields: name (required), amount (required, a number greater than 0), currency (text label, form default CNY, editable), billing cycle (monthly or yearly), next renewal date (required, date picker), category (presets: Streaming, Music, Tools, Cloud, Other), notes (optional).
- After saving, the subscription appears in the list in renewal order and totals update immediately.
- Validation: missing name, amount not greater than 0, or missing renewal date blocks saving and names which field is wrong; it never fails silently.

### List and renewal sorting
- Each row shows: name, category, amount with currency and cycle, next renewal date, days until renewal ("Overdue by N days", "Due in N days", "Due today"), and status (Active / Paused).
- Sorting: overdue first (most overdue first), then nearest first; paused subscriptions come after active ones.
- Highlighting: overdue rows red, due within 7 days amber, paused rows muted.

### Summary totals
- Monthly-equivalent total: monthly subscriptions count at face value, yearly subscriptions count as amount / 12.
- Yearly-equivalent total: yearly subscriptions count at face value, monthly subscriptions count as amount × 12.
- Totals are grouped by currency label; no conversion is performed.
- Paused subscriptions are excluded from totals and from the 30-day due count.
- Due-within-30-days count: active subscriptions whose next renewal is within 0–30 days (overdue counts as due).

### Edit, pause, delete
- Edit opens the same form pre-filled; after saving, the row, order and totals update immediately.
- Pause marks a subscription as paused: it stays in the list, goes muted, and is excluded from totals; resume returns it to active.
- Delete requires an in-page confirm step first, not an irreversible one-click delete; after confirming, the row is removed and totals update.

### Filter
- Filter buttons: All, Active, Paused. Filtering does not change the underlying data or totals.

### Persistence and sample data
- Every change saves all subscriptions to browser localStorage; refresh restores them.
- "Load sample data" adds three sample subscriptions (a streaming service, a music service, a developer tool), with renewal dates falling in the overdue, due-soon and upcoming states respectively. It is only offered when the list is empty.
- Sample data can be cleared; clearing removes only sample entries.

## States and boundaries
- **First use / empty state**: a short explanation, with "Add subscription" and "Load sample data" actions. No fake data is shown without the user asking.
- **Normal use**: list, summary and form are all visible on the same page.
- **Error state**: invalid form input names which field is wrong and keeps the values already entered.
- **Persistence**: data persists across refresh in the same browser; it does not sync across devices or accounts. Clearing browser data clears subscriptions.
- **Assumption**: amounts in different currencies are not converted; totals are grouped by currency label.

## Product decisions
- Single page, no account: so a proof of concept fits in one afternoon, and personal subscription data stays local.
- Renewal-first sorting: because the problem is forgetting renewals, not lacking a list.
- localStorage only: because a server, accounts and sync are out of scope.
- Sample-data button: so first use and the demo can show all three urgency states at once without inventing the user's real subscriptions.

## In scope this time
Everything in Features and behavior above, on one page, with localStorage persistence, for the demo video and the public repository.

## Out of scope this time
- Real reminders (email / push): need a server and notification permissions; in-page "due soon" highlighting is the substitute.
- Cloud sync and accounts: need a backend and authentication.
- Bank / email import: need external integrations and credentials.
- Currency conversion: need an exchange-rate source.

## Possible later
- A "mark as renewed" action: push the renewal date forward by one cycle.
- A chart of monthly spend over time.
- CSV export.

## Non-goals
- The app never charges, pays for, or cancels any real subscription.
- The app never stores or sends data to any server.
- The app never claims to send reminders outside the page.

## Open questions
- Project name "SubTrack" and English interface: confirmed by the user on 2026-10-26; submission text is in English, as required by the Devpost rules.
