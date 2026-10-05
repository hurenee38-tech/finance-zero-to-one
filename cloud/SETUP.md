# Cloud sync activation checklist

Status: implementation prepared; NOT provisioned, NOT enabled in production.

1. Select/create the owner's Supabase project. Do not change an unrelated project. Confirm any billable plan before provisioning.
2. Apply `cloud/schema.sql` once. It enables RLS, revokes anonymous access and direct mutations, and exposes a validated append-only RPC. All RPC writes derive user_id from auth.uid(), never from the request.
3. Configure Email Auth and the exact Site URL and redirect URL `https://hurenee38-tech.github.io/finance-zero-to-one/` (allow its `#me` callback). Configure a mail sender that can deliver to the owner's address. Supabase's default mail sender may restrict recipients. Test delivery before activation.
4. Set only the project URL and **publishable** key in `cloud-config.js`. Never add a service-role key, database password, personal access token, session, or personal records to GitHub.
5. Validate two distinct authenticated accounts on the deployed backend: each sees only its own rows; anonymous reads/writes fail; replay is idempotent; direct update/delete fails.
6. Test one account on two devices: independent progress merges, removing a bookmark propagates, offline edits replay, note versions can be restored, and signing out returns to guest records.
7. Publish the reviewed branch and enable configuration. Confirm login mail, refresh, offline return and sync status on the actual site. Keep status disabled until these checks pass.

## Behavior

- Official Supabase SDK 2.117.2, vendored from npm. Email magic-link login; sign in to the same email on each device.
- Per-user cache and durable pending operations. Guest records keep the original v2 storage key; first login does not upload them automatically. The user explicitly imports the guest records into their account.
- Server assigns a sequence to immutable events. Per-user transactional lock ensures cursor ordering. Duplicate event IDs are ignored, so lost responses can be retried safely.
- Offline operations are replayed in local creation order. Different items merge; for the same item, last server-received operation wins. This is **not** last wall-clock edit time across devices. All note versions remain available. All answer events are retained, while the current wrong-answer view uses the latest result.
- Poll while visible every 30 seconds; also sync on focus, returning online, and after edits. No paid realtime channel required.
- Sign out waits for pending writes; guest records and account cache remain separate. Cached account records remain on that device, so use a trusted device.
- Reader mode and exam year are local preferences, not cloud records. Export backs up the current materialized learning state (no authentication tokens); cloud note history is retained in the database.

## Validation performed locally

`node tests/sync-core.test.cjs`: reducer, deletion, replay, hostile keys, pending edits.

From repository parent: `node finance-zero-to-one/tests/cloud-adapter.test.cjs`: two simulated clients, offline queue, lost-response replay, removal propagation, guest/account separation.

`tests/database.test.cjs` executes schema against PGlite PostgreSQL with mocked auth.uid/roles and checks user isolation, anonymous denial, direct mutation denial, invalid values, and idempotency. This does not substitute for live Supabase authentication and RLS tests.

Pending: actual project provisioning, email delivery, live credentials/permissions and two-device acceptance.

References:
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/reference/javascript/auth-signinwithotp
- https://supabase.com/docs/reference/javascript/auth-onauthstatechange
