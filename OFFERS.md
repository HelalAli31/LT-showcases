# Luxury Tech private offers and contracts

The project now runs on **Next.js**, with the existing React public landing page preserved and statically rendered. All private backend routes run as Node.js Vercel Functions in the same deployment. MongoDB Atlas is the persistent database; there is no local SQLite dependency or separate backend host.

## Routes

- `/` — existing public site, unchanged navigation and assets; server-rendered metadata and public page content.
- `/admin` — password-protected dashboard.
- `/admin/offers`, `/admin/offers/new`, `/admin/offers/:id` — search, drafts, detailed offer builder, preview, publish, copy link, share-ready WhatsApp text, revoke and duplicate/revise.
- `/admin/pricing` — ecommerce/management catalogs and global commitment discounts.
- `/admin/contracts`, `/admin/contracts/:id` — search/filter, PDF download, evidence/audit, notification status/retry, manual payment/service status and non-sensitive CSV export.
- `/admin/contract-templates` — six initial draft templates, new immutable versions and review approval for each exact version.
- `/admin/settings` — supplier identity, admin recipients, privacy and retention policy, consent and readiness.
- `/offer/:token` — verified-email private customer offer, authorized selections, exact totals, full agreement, explicit consents, signature canvas and deliberate confirmation.
- `/contract-access/:id` — fresh email OTP to retrieve a signed copy, independently of offer expiration.
- `/api/cron/notifications` — authenticated retry worker.
- `/api/webhooks/whatsapp` — Meta subscription verification and HMAC-authenticated delivery updates.

## Deployment to the existing Vercel project

1. Commit the reviewed changes to the existing repository and connect the existing Vercel project. Use the **Next.js** framework preset, `npm install`/`npm ci`, `npm run build`, `.next`, Node 22+ and this repository root. Remove any old Vite build/output overrides in the Vercel dashboard. Production deployment changes the existing live site; inspect a preview first.
2. Create a dedicated MongoDB Atlas database/user restricted to `LT_Proposals`. Set `MONGODB_URI` and `MONGODB_DB=LT_Proposals` in Vercel. The Atlas connection string, not the Atlas explorer page URL, is required. Transactions require an Atlas replica set (supported by Atlas). Configure the network access policy for the actual Vercel outbound networking plan.
3. Configure `.env.example` values directly in Vercel. `APP_ORIGIN` must exactly match the domain used to log in, including scheme and `www`. Set separate values for each preview environment when testing. Unknown origins are rejected for all browser mutations.
4. Generate a unique admin password of at least 14 characters. Set `ADMIN_PASSWORD` temporarily in your terminal environment, run `npm run admin:password`, and save the printed salt:hash to `ADMIN_PASSWORD_HASH` in Vercel. Delete the temporary plaintext environment variable. There is no public admin registration or hardcoded login password. The admin login is `/admin`.
5. Generate `DATA_ENCRYPTION_KEY` using `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Generate a separate `CRON_SECRET` similarly. Keep an offline secure backup of the encryption key; changing or losing it makes existing PDFs, signatures and sealed offers unreadable. Do not rotate it without a versioned re-encryption migration.
6. Configure a newly issued SMTP account/app password. `MAIL_FROM` must be an allowed address for that account. Gmail can rewrite an unapproved sender; do not reuse a different business's From identity. No OTP bypass is present in production, even in test signing mode. Without SMTP, verification explicitly reports that it is unconfigured.
7. Set `CHROMIUM_PACK_URL` to a trusted, pinned **Linux x64 pack** matching the installed `@sparticuz/chromium-min` version (see its official release assets). The serverless binary is unpacked only to ephemeral `/tmp`; persistent agreements are never stored there. The Hebrew Noto Sans Hebrew font is bundled with its OFL license. Inspect the real Vercel PDF before production signing. The function has a 60-second execution limit; choose a supported Vercel plan and increase it if cold browser startup needs more time.
8. The API initializes collections, indexes and default catalogs/templates on first request. `/api/health` checks database availability. Open `/admin`, complete supplier identity, notification recipients and the privacy/retention policies. Initial admin WhatsApp recipient is **+972543596761**. No other project's recipient is used.
9. Keep `BINDING_SIGNATURES_ENABLED=false` during preview and acceptance testing. Approve legal text only after an Israeli commercial lawyer reviews the exact templates, per-project legal terms, signature evidence process and privacy/consumer-law applicability. In `/admin/contract-templates`, record the reviewer for each exact version. In `/admin/settings`, record system/privacy/retention approval. Publish fresh offers using these approved versions. Only then set `BINDING_SIGNATURES_ENABLED=true` and redeploy. Previously frozen unapproved offers remain blocked from production signing.
10. Review the preview site, check all public-page images, language switch, mobile navigation, contact links and SEO, then promote the reviewed deployment to the production project/domain. No real payment collection is implemented or enabled; payment receipt is manually recorded.

## WhatsApp configuration

Create a Meta-approved utility template with one body parameter for the opaque contract ID. For example: `נחתם הסכם חדש ב־Luxury Tech. מזהה: {{1}}. לצפייה מאובטחת יש להיכנס למערכת הניהול.` No signed-PDF URL or private customer data is sent in the template. Admins open the authenticated dashboard to download documents.

Set the newly issued token, phone-number ID, supported Graph API version, exact approved template name and language. `META_SEND_ENABLED=true` explicitly enables outbound sends; the admin recipient must separately consent in settings. Test-mode signatures never send WhatsApp. Missing/disabled configuration is recorded as `not_configured`, not successful delivery.

Use `META_WHATSAPP_ACCESS_TOKEN` (or the existing `META_TOKEN`) for a token authorized for WhatsApp messaging. `META_PAGE_ACCESS_TOKEN` and `META_PAGE_ID` are not automatically used as WhatsApp credentials. Set `META_GRAPH_VERSION=v25.0` for this setup. The app ID is not needed for sending these WhatsApp template messages.

Configure Meta's callback as `https://www.luxurytech.org/api/webhooks/whatsapp`, with a new random verify token and the Meta app secret. Subscribe to message status events. POST signatures are verified over the raw request body before processing. Statuses distinguish provider acceptance, sent, delivered, read and failure. Email status means SMTP acceptance, not verified inbox delivery.

The callback accepts `META_VERIFY_TOKEN`, with `META_WEBHOOK_VERIFY_TOKEN` retained as a fallback. If both are set, `META_VERIFY_TOKEN` takes precedence. The GET handshake works without a database connection; signed delivery events still require MongoDB. Save real credentials only in Vercel's server environment variables. Editing `.env.example` does not configure a deployed Vercel Function.

## Creating and sending an offer

1. Edit default prices/features and global duration discounts in Pricing. STARTER/PRO prices are editable and CUSTOM prices are starting points only.
2. Create an offer and specify the intended recipient email; only that email can obtain access through OTP. Choose ecommerce or management and the approved tiers. Catalog defaults are loaded into the builder.
3. Override setup/monthly prices, durations/discounts, features, quantities, exclusions, support, scope, milestones, timeline, payment/cancellation, third-party costs, IP, data export and project-specific liability/jurisdiction. CUSTOM requires explicit individual approval.
4. Disable a duration by unchecking it. Override per-tier percentages independently. Add a custom duration when necessary. Zero percentages create an offer without a discount. Setup discounts require explicit opt-in.
5. Configure tax treatment/rate and mandatory renewal terms. Add one-time extras and approved PDF scope appendices (2MB/30 pages each). Appendices are encrypted privately, included in the frozen digest and appended to the signed PDF. Internal notes remain admin-only.
6. Save and preview exact tier/duration pricing and the full agreement. Publishing requires the preview digest still to match the draft and current catalog/template settings. Published prices, terms, features, legal text and appendix hashes are frozen. Copy the private link or use the share-ready WhatsApp message. This opens a share composer; it does not automatically message the customer.
7. A change to a sent/signed offer requires duplication into a new draft, publication and fresh acceptance. Revocation stops unsigned offer access; it cannot change an already signed agreement.

## Customer signing flow

The recipient enters their email, receives a six-digit code valid for five minutes and verifies it. Codes are single-use and limited to five verification attempts. Customer sessions are bound to the offer and recipient, expire after eight hours and use HTTP-only Secure SameSite cookies in production. All sensitive operations check server-side authorization.

The customer chooses only enabled tiers/durations. The browser immediately displays **server-computed frozen quotes** and never supplies authoritative monetary values. The full agreement includes the chosen pricing, scope, legal version, appendices and privacy notice. The customer confirms reading, completes necessary identity/company authority fields, independently accepts agreement and privacy terms, draws a signature and deliberately confirms.

The server revalidates access, expiration, revocation, selected terms, review digest, consents, signature image and legal readiness. It renders the full Hebrew PDF first, appends approved PDFs and encrypts the result. A MongoDB transaction then atomically stores the immutable contract, encrypted PDF reference/payload, SHA-256/HMAC evidence, offer signed state, payment state, audit event and notification outbox jobs. Retries with the same idempotency key return the same contract; concurrent different attempts cannot create another contract. If PDF generation or persistence fails, the offer is not marked signed.

The success screen appears only after storage commits. The customer can download their own PDF using the verified session, and later reauthenticate at `/contract-access/:id`. Signed documents are not downloadable with the tokenized offer link alone. Admins separately authenticate for downloads. Notifications run after persistence and cannot roll it back.

## Financial rules

Money is stored as integer agorot. Discounts/tax are integer basis points, calculated with BigInt and half-up rounding. Default rules: 12 months = 0%, 24 = 10%, 36 = 15%. Precedence: tier > offer > global. Each discounted monthly charge is rounded once to an agora, then multiplied by duration; setup is undiscounted unless explicitly authorized. One-time add-ons are not discounted. Exclusive tax is rounded once on the total subtotal; inclusive prices already contain the configured tax; exempt prices add no tax. Savings are shown on the same basis before additional exclusive tax and are labeled accordingly.

The discount applies for the full commitment. Renewal terms must be expressly provided and are frozen. PRO at ₪349/month, 10% over 24 months, plus ₪2,490 setup gives ₪314.10/month, ₪10,028.40 total, ₪837.60 savings (before any additional exclusive tax).

## Persistence and integrity

Collections: `catalog`, `settings`, `templates`, `clients`, `offers` (drafts and linked immutable revisions), `sessions`, `challenges`, `limits`, `attachments`, `contracts`, `contractStates`, `jobs`, `audit`. Random opaque IDs, unique offer-token hashes, unique contract per offer, unique outbox keys and TTL indexes are initialized automatically. Expiration is checked explicitly; TTL deletion timing is not relied upon for authorization.

Published snapshots have a keyed integrity MAC. Signed payloads and PDFs use AES-256-GCM; evidence binds the exact snapshot, quote, legal version, signature hash, consents, verified email/timestamp, server UTC timestamp and hashes of request IP/user agent. Evidence has a SHA-256 digest and keyed HMAC. Raw IP addresses, passwords, OTPs, signatures and PDFs are never logged. Displayed operational dates use Asia/Jerusalem; database timestamps use UTC.

By default encrypted PDF bytes live in the private `contracts` document with an enforced 4MB PDF limit to stay below Vercel's 4.5MB response limit and MongoDB's 16MB document limit. Optional private S3-compatible object storage is supported via environment variables; objects are app-encrypted and accessed only through authenticated API routes. Enable bucket Block Public Access and versioning/Object Lock as appropriate. Interrupted S3 uploads can leave unreferenced encrypted objects; use a periodic inventory against committed artifact keys for cleanup. Never expire referenced contract objects through a generic bucket lifecycle rule.

Signed payload/evidence/artifact records have no application update/delete API; manual payment/service changes are in `contractStates`. Database operators retain privileged access, so database backup access and administrative roles must be restricted. For stronger retention protection use private S3 Object Lock and independent audit backups. A drawn electronic signature alone is not a guarantee of legal enforceability.

## Notifications, backups and retention

Vercel `waitUntil` starts jobs after a successful sign response; durable jobs survive invocation failures. Jobs use atomic leases and bounded exponential retries. Provider delivery is at-least-once: a crash after provider acceptance but before status persistence can cause a duplicate notification; stable email Message-ID helps but is not a delivery guarantee. Cron is set to once daily for compatibility with basic Vercel scheduling; adjust the schedule on a plan that supports more frequent retries, or run the worker manually from Contracts. Set `CRON_SECRET`; never make the worker public.

Enable Atlas backups/PITR where supported, private object-store versioning, separate encryption-key backup and restore drills. Keep legal/operational access restricted. Sessions, OTPs and rate-limit counters automatically expire. Signed records are not automatically deleted: the business must approve retention periods, data subject procedures and lawful exceptions with counsel before enabling production. Record these in settings and respond to deletion/export requests according to that policy. Admins can export reporting CSVs without contact information and provide authenticated contract copies. Do not delete evidence needed for retention obligations merely to satisfy a generic automatic cleanup policy.

## Verification

- `npm ci`
- `npm test` — isolated real MongoDB replica-set integration tests and pricing tests; no production accounts are used.
- `npm run typecheck`
- `npm run build`
- `npm run test:e2e` — built Next app, isolated database and local test SMTP; browser checks public/admin/customer screens, real OTP flow, signing and PDF download. Requires `npx playwright install chromium` for local testing.
- `npm audit` — review dependency changes.

External production credentials, Meta template approval, Vercel/Atlas access and legal review cannot be manufactured by the application. They must be configured before claiming live delivery or enabling binding signatures. No deployment is claimed until a live deployment has actually been verified.
