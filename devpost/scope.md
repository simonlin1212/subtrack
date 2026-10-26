---
doc: scope
status: approved
---

# SubTrack

One line: a single-page subscription management assistant that shows what you pay, when it renews, and what is due next.

## Unique core
The core is not "a list of subscriptions" but "a renewal-first view": all subscriptions sorted by days until next renewal, overdue and soon-due items highlighted, and the monthly total always visible at the top. Without renewal sorting and totals, it would just be an ordinary list.

## Who it is for
People with many subscriptions — video, music, tools, cloud services — who often forget renewal dates and only notice when a charge appears. Right now they have to check each service one by one, or they do not check at all, and they have no single monthly total.

## Core loop
Open it, see subscriptions in renewal order plus the monthly total at the top; add a subscription (name, amount, cycle, next renewal date), and it immediately slots into order and the total updates. Come back before a renewal, see what is due in the next 30 days, and pause or delete what you no longer want.

## Inspiration and style
Calm, dense and practical, like a personal finance dashboard, not a marketing page. No design reference was provided by the user, so the style stays simple and lets renewal dates and totals be the most prominent things on the page.

## Why it matters to the learner
This is a real personal need (too many subscriptions, renewals always forgotten) and fits a finance background, while staying small enough to build and demonstrate in one afternoon.

## What "working" looks like
Open the app, add a subscription, and see it appear in renewal order with the monthly total changing. After loading sample data, the overdue, due-soon and upcoming states are all visible, with totals grouped by currency. The clearest proof is: add a subscription, and order, highlighting and totals change at once.

## Proof-of-concept boundary
Included:
- Add, edit, delete, pause / resume subscriptions
- List sorted by days until renewal, with overdue / due within 7 days / upcoming highlighting
- Monthly-equivalent and yearly-equivalent totals, grouped by currency
- Count of renewals due in the next 30 days
- Filter all / active / paused
- Data stored in the browser (localStorage), persisting after refresh
- Sample-data button, for first use and for the demo

## Later
- Real reminders (email / push notifications)
- Cloud sync and accounts
- Bank or email import of subscriptions
- Currency conversion
- Sharing or family view

## Explicitly cut
- Accounts and login: unnecessary for a personal proof of concept, and would eat the afternoon.
- Real payments: the app only records money paid elsewhere; it never charges anything itself.
- Push / email reminders: a local proof of concept cannot do them; this version uses "due soon" highlighting instead of reminders.
- Currency conversion: totals are grouped by currency label, not converted, because no exchange-rate source was chosen and conversion would be invented precision.
