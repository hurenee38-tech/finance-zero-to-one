# BHOB cloud learning sync

The public site uses only a Supabase publishable key. Personal learning records are stored in `bhob_learning_records`, protected by authenticated owner policies. The RPC runs as SECURITY INVOKER and takes user identity from auth.uid(), never from caller data.

Email login uses Supabase magic-link emails. The app also accepts the project's verification URL pasted into its login form, so login can finish without relying on a redirect or opening a browser outside the installed PWA. Default Supabase email delivery is restricted to project members. Broader access requires an SMTP provider and appropriate Auth configuration in the Supabase dashboard. Do not commit SMTP credentials or secret/service-role keys.

Records sync individually; removals are tombstones. Larger changed_at wins, with atomic conflict handling in Postgres. Existing local records enter the first migration at a baseline timestamp, allowing established cloud records to win. Browser clocks affect concurrent edits, so substantially wrong device clocks can affect ordering. Login to the same email on all devices. Unsynced local operations still require local storage until network sync succeeds. Logout is blocked while pending changes remain; after successful logout, local personal records are cleared to avoid mixing accounts. Export remains available as a backup.

The SDK is bundled locally, pinned in package-lock.json. Rebuild with `npm ci` then `npm run bundle:supabase`. Schema reference: `supabase/bhob-learning-schema.sql`; deployment is tracked in Supabase migration history. Do not rerun schema blindly.

Validation: JavaScript syntax, simulated migration/removal/multi-device/offline retry, actual database RLS isolation and stale-write tests in a rolled-back transaction, and Supabase security advisors. End-to-end email login must be verified by the account owner; no login emails are sent automatically during deployment.
