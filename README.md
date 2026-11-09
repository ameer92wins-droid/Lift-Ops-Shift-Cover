# Shift Coverage Prototype

A **local-only demonstration** of an employee shift coverage board for approximately 50–150 employees. No branding or corporate integration yet.

## Run locally

You need Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Test the workflow

1. Select **Alex** and post a shift, or open Alex's sample shift.
2. Switch the demo user to **Jordan** and open the shift. Click **I can cover this shift**, or leave a public comment.
3. Switch back to **Alex** and look at **My activity** and the **Email preview** log.
4. Switch to **Morgan (Manager)** and open **Manager approvals**. Approve or reject an offer.
5. Check **My activity** or the shift details again to see the result.

## Scope and limitations

- Sample accounts only: selecting a name is **not** authentication.
- Data is stored in browser `localStorage`, not shared between devices.
- Email notifications are **simulated** in the Email preview tab; no emails are sent.
- Manager approvals are **not official scheduling changes**.
- No qualification verification, payroll integration, company data, or shift validation.
- No private messaging; all comments belong to a public shift thread.
- Overnight shift handling and timezone-aware scheduling need robust implementation before launch.

**Do not deploy for real employee use in its current form.**

## Next implementation milestones

1. Supabase project, database schema, migrations, secure employee sign-in.
2. Server-enforced role-based permissions (including row-level security).
3. Real shifts, offers, comments, audit trail, and atomic approval workflow preventing conflicting approvals.
4. Email service with event-specific templates, retries, and notification preferences.
5. Company approval, testing, data retention policy, and possible scheduling-system integration.
