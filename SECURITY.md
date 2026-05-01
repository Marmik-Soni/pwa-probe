# Security Policy

## Supported versions

| Version          | Supported |
| ---------------- | --------- |
| Latest on `main` | ✅        |
| Older commits    | ❌        |

PWA Probe has no versioned releases yet. Security fixes are applied to `main` and deployed immediately.

---

## Reporting a vulnerability

**Please do not report security vulnerabilities via public GitHub issues.**

Send details to: **marmiksoni777@gmail.com**

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- (Optional) Suggested fix

You'll receive an acknowledgement within **48 hours** and a status update within **7 days**.

---

## Scope

### In scope

- Authentication bypasses or session issues (Supabase Auth integration)
- Data exposure — other users' scan records accessible without a valid share token
- XSS via scan results or shareable report pages
- CSRF vulnerabilities
- Injection vulnerabilities in any server-side code

### Out of scope

- The detection engine itself (`src/engine/`) — it runs entirely in the user's browser and has no access to server resources
- Theoretical vulnerabilities with no practical exploit path
- Issues in third-party dependencies (report those upstream)
- Rate limiting / DoS — not currently in scope for this project stage

---

## Notes on architecture

The detection engine is **client-side only** — it probes the user's own browser APIs and has no network access during a scan. Scan results are optionally persisted to Supabase after the scan completes, authenticated via Supabase Auth. Share tokens are random UUIDs generated server-side.

Environment variables with `NEXT_PUBLIC_` prefix are intentionally public (embedded in the client bundle). Variables without that prefix (`SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`) must never be exposed to the client.
