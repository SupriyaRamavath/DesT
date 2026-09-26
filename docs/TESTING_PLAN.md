# DesT Testing Plan

**Status:** Test design and execution checklist  
**Last inspected:** 2026-09-25  
**Scope:** `server/`, `client/`, and the currently registered Express/React routes.  
**Execution status convention:** `PASS` means the observed behavior meets the expected output; `FAIL` means it does not; `BLOCKED` means the test cannot run because a prerequisite is unavailable; `NOT RUN` is the initial status.

## 1. Test environment and data

1. Start MongoDB using the URI in `server/.env` (the default is `mongodb://127.0.0.1:27017/decisiontrace`).
2. Start the API with `npm --prefix server run dev` (default base URL: `http://localhost:5000`).
3. Start the UI with `npm --prefix client run dev` (default URL: `http://localhost:5173`).
4. Use a disposable mailbox and unique values for `email`, application name, and `externalDecisionId`.
5. Keep the registration response token as `{{authToken}}`; keep the created application ID as `{{applicationId}}` and decision ID as `{{decisionId}}`.
6. Never commit real tokens, passwords, database credentials, or production data.

### Canonical fixtures

```json
{
  "user": {
    "name": "QA Developer",
    "email": "qa+decisiontrace@example.test",
    "password": "CorrectHorseBattery9!",
    "role": "developer"
  },
  "application": {
    "name": "QA Eligibility Model",
    "description": "Disposable test application",
    "environment": "development"
  },
  "decision": {
    "externalDecisionId": "qa-unique-001",
    "input": { "income": 72000, "country": "US" },
    "output": { "decision": "approved" },
    "status": "completed",
    "confidence": 0.92,
    "riskLevel": "low",
    "riskFlags": [],
    "model": { "provider": "TestProvider", "name": "eligibility", "version": "1.0.0" },
    "startedAt": "2026-09-25T10:00:00.000Z",
    "completedAt": "2026-09-25T10:00:01.000Z"
  }
}
```

## 2. Implementation inventory and test boundaries

### Implemented API routes

| Route | Auth | Notes |
|---|---|---|
| `GET /` | No | Welcome response |
| `GET /api/health` | No | Health response |
| `POST /api/auth/register` | No | Returns JWT and serialized user |
| `POST /api/auth/login` | No | Returns JWT and serialized user |
| `GET /api/auth/me` | Bearer JWT | Current user |
| `POST /api/auth/logout` | No | Returns `{success:true}`; token invalidation is not server-side |
| `GET /api/applications` | Bearer JWT | Owner's applications and decision counts |
| `POST /api/applications` | Bearer JWT | Returns the generated API key once |
| `PATCH /api/applications/:id` | Bearer JWT | Owner-only update |
| `DELETE /api/applications/:id` | Bearer JWT | Also deletes that application's decisions |
| `GET /api/decisions` | Bearer JWT | Owner's decisions |
| `POST /api/decisions/ingest` | Bearer JWT | Creates a decision for an owned application |
| `GET /api/decisions/:id` | Bearer JWT | Owner-only decision detail |

### UI/service routes not registered by the current server

These are referenced by client service modules or pages but currently have no matching Express route. They must be tested as planned/blocked behavior and must **not** be presented as working API examples:

* `POST /api/auth/forgot-password`
* `POST /api/auth/reset-password/:token`
* `GET /api/applications/:id`
* `PATCH /api/applications/:id/activate`
* `PATCH /api/applications/:id/deactivate`
* `GET /api/applications/:id/stats`
* `PATCH /api/decisions/:id`
* `DELETE /api/decisions/:id`
* `GET /api/decisions/:id/replay`
* `GET /api/decisions/:id/events`
* `POST /api/decisions/:id/events`
* `GET /api/decisions/stats`
* `POST /api/decisions/:id/flag-review`
* all `/api/reviews/*`, `/api/audit-logs/*`, `/api/analytics/*`, and `/api/notifications/*` endpoints

The React router currently exposes pages for these concepts, but page availability is not evidence that a backend capability exists.

## 3. Unit tests

Run with the project's chosen JS test runner when one is introduced. Until then, these are executable unit-test specifications; status is `NOT RUN`.

| Test ID | Feature | Input | Expected output | Result criteria |
|---|---|---|---|---|
| UT-AUTH-001 | Registration validation | Missing name, email, or password under 8 characters | Controller returns HTTP 400 and the documented validation message | No user is persisted; response has `success:false` |
| UT-AUTH-002 | Email normalization | Register with `" QA@Example.COM "` | User email is stored lowercase/trimmed; response includes JWT and user without password hash | Stored email equals `qa@example.com`; password hash is never serialized |
| UT-AUTH-003 | Duplicate registration | Register an existing normalized email | HTTP 409 with duplicate-account message | Exactly one user remains |
| UT-AUTH-004 | Password hashing | Valid registration | Persisted `passwordHash` is a bcrypt hash, not the clear-text password | `bcrypt.compare` succeeds and raw password is absent from the document |
| UT-AUTH-005 | Login authentication | Correct and incorrect credentials | Correct credentials return 200/token; incorrect credentials return 401 | No invalid login leaks whether email exists |
| UT-AUTH-006 | Bearer middleware | Missing, malformed, expired, and valid JWTs | 401 for first three; valid token populates `req.user` | Protected handler is called only for valid active users |
| UT-APP-001 | Application creation | Blank name, then valid name/environment | Blank returns 400; valid returns 201 and one-time `apiKey` | API key is `dt_` plus 40 hex characters; only hash is persisted |
| UT-APP-002 | Application ownership | User A requests User B's ID | 404 “Application not found.” | No cross-owner data is returned or modified |
| UT-APP-003 | Application deletion cascade | Delete an application with decisions | 200; decisions for that application are removed | Other applications and decisions remain |
| UT-DEC-001 | Decision defaults | Ingest without optional fields | Defaults external ID, completed status, low risk, empty flags, and timestamps | Persisted document matches schema defaults |
| UT-DEC-002 | Decision validation | Confidence `-0.1`/`1.1`, invalid status, invalid risk level | Error middleware returns 400 with field details | No invalid decision is persisted |
| UT-DEC-003 | Decision ownership | Ingest or fetch using another user's application/decision | 404 | No object from another owner is exposed |
| UT-ERR-001 | Error mapping | Mongoose validation, duplicate key, cast error, unknown error | 400/409/400/500 mapping respectively | Production 500 response does not expose internal message |
| UT-API-001 | CORS and body limits | Allowed client origin; JSON body over 1 MB | Allowed origin succeeds; oversized body is rejected | CORS and parser behavior match server configuration |

## 4. API and integration tests

Use the Postman collection in `docs/postman/DesT.postman_collection.json`. Run requests in order: health, register (or login), create application, list applications, ingest decision, list/detail decisions, then cleanup.

| Test ID | Feature | Input | Expected output | Result criteria |
|---|---|---|---|---|
| API-001 | Health check | `GET /api/health` | 200, `success:true`, running message | Response is JSON within the agreed timeout |
| API-002 | Register | Canonical user fixture | 201 with `token` and `user` | Save token; no `passwordHash` in response |
| API-003 | Login | Same email/password | 200 with token/user | Token can authenticate `/api/auth/me` |
| API-004 | Current user | Bearer `authToken` | 200 with matching id/name/email/role | Identity matches the registered user |
| API-005 | Protected route without token | `GET /api/applications` without Authorization | 401 authentication-required message | No database data is returned |
| API-006 | Create application | Canonical application fixture | 201 with application and one-time API key | Save ID; key starts `dt_` |
| API-007 | List applications | Authenticated `GET /api/applications` | 200 array with `decisions` count | New application appears and count is numeric |
| API-008 | Ingest decision | Application ID plus canonical decision fixture | 201 with persisted decision | IDs, status, confidence, risk, model, and timestamps match |
| API-009 | List decisions | Authenticated `GET /api/decisions` | 200 array populated with application name | Ingested decision appears only for its owner |
| API-010 | Decision detail | `GET /api/decisions/{{decisionId}}` | 200 with populated application name | Detail equals the list record |
| API-011 | Invalid application ingest | Nonexistent/malformed application ID | 404 for nonexistent; 400 for malformed ID | No decision is created |
| API-012 | Invalid payload | Missing application, invalid confidence/status/risk | 400 (or documented CastError mapping) | Error has `success:false`; database unchanged |
| API-013 | Not-found route | `GET /api/does-not-exist` | 404 error response | Message identifies method/path without HTML |
| API-014 | Logout semantics | `POST /api/auth/logout`, then reuse token | 200 logout; token still works today | Record as a security/product decision: current implementation does not revoke JWTs |
| API-015 | Delete cascade | `DELETE /api/applications/{{applicationId}}` after ingest | 200; application and its decisions no longer list | Verify with list endpoints |
| API-NI-001 | Unimplemented service endpoint | `GET /api/applications/{{applicationId}}` | 404 route-not-found | Mark `NOT IMPLEMENTED`, not a regression of an implemented route |
| API-NI-002 | Unimplemented reviews | `GET /api/reviews` | 404 route-not-found | Mark blocked until a reviews router is mounted |

## 5. Frontend tests

Use browser/component tests with mocked Axios responses for deterministic states, and one browser smoke run against the live API.

| Test ID | Feature | Input | Expected output | Result criteria |
|---|---|---|---|---|
| FE-AUTH-001 | Login form | Valid credentials | Navigates to `/dashboard`; token/user stored under configured storage keys | Protected layout renders and no credentials appear in DOM |
| FE-AUTH-002 | Login error | Invalid credentials or rejected request | Error message is visible; user stays on login | No partial authenticated state is stored |
| FE-AUTH-003 | Registration | Valid form and duplicate/invalid variants | Success authenticates or error is shown | Client validation and server error are distinguishable |
| FE-AUTH-004 | Protected route | Visit `/dashboard` without token | Redirects to `/login` | No protected data request is made before auth |
| FE-NAV-001 | Navigation | Click dashboard, decisions, applications, reviews, analytics, audit logs, notifications, profile | Correct React route renders | Active navigation state and page heading match route |
| FE-NAV-002 | Unknown route | Visit `/not-a-real-page` | NotFound page renders | No uncaught error |
| FE-APP-001 | Application list/create | Mock list then submit valid form | Card/table updates with new application | Loading, empty, success, and error states are usable |
| FE-APP-002 | Application update/delete | Edit and delete an owned application | UI reflects response and deletion | Destructive action requires intended confirmation if designed |
| FE-DEC-001 | Decision list/detail | Mock decisions and click a row/card | Detail page displays status, confidence, risk, model, and timestamps | Missing/null optional fields do not crash rendering |
| FE-DEC-002 | Decision filters | Search/status/risk changes | Visible results change or empty state appears | Debounced/filter controls do not issue stale updates |
| FE-RESP-001 | API failure | Axios 401/404/500/timeout | User sees actionable error/loading state | Console logging does not expose tokens/passwords |
| FE-RESP-002 | Responsive layout | 320 px, 768 px, 1440 px viewports | No horizontal overflow; sidebar/nav remains usable | Key actions remain keyboard and touch accessible |
| FE-A11Y-001 | Keyboard/accessibility | Keyboard-only navigation; screen-reader inspection | Focus is visible, labels are associated, modal focus is trapped/restored | No critical axe/WCAG A/AA violations |
| FE-NI-001 | Reviews/analytics/audit/notification pages | Open pages whose APIs are not mounted | Page may render shell, but data request failure is clearly handled | Mark `NOT IMPLEMENTED` backend; do not report as passing data integration |

## 6. Manual exploratory and release tests

| Test ID | Feature | Input | Expected output | Result criteria |
|---|---|---|---|---|
| MAN-001 | Fresh install/startup | Clean environment, valid MongoDB, start server/client | Both services start and health endpoint responds | No startup errors; browser loads |
| MAN-002 | End-to-end happy path | Register → create app → ingest → list/detail → delete | Complete trace is visible and cleanup succeeds | All IDs and counts remain consistent |
| MAN-003 | Session expiry | Replace token with expired/invalid token | API returns 401 and UI returns to login or shows session error | No infinite request loop |
| MAN-004 | Data isolation | Two users and two applications | Each user sees only owned apps/decisions | No IDOR/cross-tenant leakage |
| MAN-005 | Boundary values | Name lengths 1/2/120/121, description 1000/1001, confidence 0/1/out-of-range | Schema accepts documented boundaries and rejects invalid values | Error feedback identifies the field |
| MAN-006 | Risk/status matrix | Every allowed risk level and decision status | Values persist and render with correct label/badge | Case normalization behaves consistently |
| MAN-007 | Duplicate identifiers | Same external decision ID twice in one application | Observe current behavior and document expected product decision | Do not assume uniqueness: schema has a non-unique compound index |
| MAN-008 | Large/sensitive payload | Nested input/output, null output, 1 MB boundary | Supported payload persists; oversize is rejected | No sensitive payload is logged or rendered unexpectedly |
| MAN-009 | Browser refresh/deep links | Refresh `/decisions/:id`, `/applications/:id`, protected pages | Vite fallback and auth restoration behave as intended | No blank page or accidental public access |
| MAN-010 | Accessibility/usability | Keyboard, zoom 200%, contrast, mobile viewport | Core journeys remain usable | Record defects with route, viewport, and reproduction steps |
| MAN-011 | Operational failure | Stop MongoDB/API during a request | UI shows recoverable error; server logs concise diagnostic | No process crash or secret disclosure |
| MAN-012 | Security sanity | Inspect response/local storage/network logs | Password hashes/API key hashes are absent; HTTPS is required outside local dev | Any leaked credential is release-blocking |

## 7. Exit criteria and defect reporting

Release testing is complete when all implemented-route tests are `PASS`, no critical/high defects remain, API and UI builds/lints pass, and every `NOT IMPLEMENTED` item is either intentionally accepted or tracked with an owner. A test result must include date, environment, build/commit, tester, evidence (request/response or screenshot), and defect ID where applicable.

