PROJECT BRIEF (READ EVERY TIME)

I’m building a mobile app called CleanSwift with Expo + TypeScript + Supabase + Stripe.

Constraints:

My navigation structure, screen list, flows, and design system are already decided in my head and in my design file.

We’ll derive the DB schema one time from my existing flows, then that schema is locked and must not be changed unless I explicitly say so.

Do not invent new architectures, navigation patterns, or redesign the UI. Your job is implementation and debugging.

Workflow I want (War Map style):

Use Plan / Ultra-Think before coding: give me a checklist of steps and files.

Then implement only a small part of the plan, I test on device, we read logs, and we fix.

Use Supabase MCP from inside Cursor to create tables, push schema, enable RLS, and adjust policies.

Use Expo Go on my iPhone for live testing.

Use Stripe only inside my existing Payment / OrderSummary flow, no new screens.

When you write code:

Always say which files you’ll edit and show complete content of those files.

Make the smallest possible change that solves the problem.

Never silently change route names, table names, or design tokens.

First, confirm you understand and restate these constraints in your own words.