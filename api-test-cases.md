# API Test Case Library

A reusable, project-agnostic checklist for testing HTTP APIs, with one worked example. It is written for REST/JSON. For GraphQL or gRPC keep the intent and adapt the mechanics (for example, errors carried in the body instead of the status line).

**Priority:** H = release blocker if it fails | M = fix before the next release | L = backlog.

**Where to run:** only in a test environment you own or are authorised to test. Never run the load, race or injection cases against production or third-party APIs.

## 1. How to use

1. Build an endpoint inventory: method, path, auth scheme, roles, request and response schema, rate limit.
2. For each endpoint apply the status-code matrix (section 2), the response checks (section 3) and the cross-cutting scenarios (section 4).
3. Record each case with a stable ID using the template in section 6. Never renumber; retire an ID instead.
4. Automate the H cases first and run them on every merge (section 7).

## 2. Status-code matrix (per endpoint)

| Code | Trigger to test | Also verify |
| --- | --- | --- |
| 200 / 201 / 204 | Valid read, create, update, delete | `Location` header on 201; empty body on 204 |
| 400 | Malformed JSON, wrong type, missing required field | Error names the offending field |
| 401 | No token, expired, tampered signature, wrong audience or issuer | `WWW-Authenticate` header present |
| 403 | Valid token with insufficient role or scope; another tenant's object | One policy for 403 vs 404, applied everywhere |
| 404 | Unknown ID | Does not reveal whether an object exists for someone else |
| 405 | Wrong method | `Allow` header lists the supported methods |
| 406 / 415 | Unsupported `Accept` / wrong `Content-Type` | Body is not parsed before the type is checked |
| 409 | Duplicate unique key, version conflict | No second record is created |
| 412 / 428 | `If-Match` / `ETag` mismatch, or missing precondition where required | No lost update |
| 413 / 414 | Oversized body or URL | Rejected before being fully processed |
| 422 | Well-formed but semantically invalid (end date before start date) | Error names the rule broken |
| 429 | Burst above the rate limit | `Retry-After` header; limit is per account, IP or key as designed |
| 500 | Must never be caused by client input | No stack trace or internal detail in the body |
| 502 / 503 / 504 | Dependency down, overload, upstream timeout | Mapped from the failure, not a generic 500; `Retry-After` on 503 where useful |

## 3. Checks on every response

- Status code is the expected one.
- Body matches the schema; error bodies share one consistent shape (for example RFC 9457 problem details).
- `Content-Type` matches the body; `Cache-Control` is restrictive on sensitive responses; `X-Content-Type-Options: nosniff` and other security headers are present.
- No stack traces, internal paths, framework banners, secrets, password hashes, tokens or internal IDs in any body or header.
- Business invariants hold (totals, state transitions, ownership).
- Latency is within budget (state the percentile, for example p95).

## 4. Cross-cutting scenarios

| Area | Scenarios | OWASP API 2023 |
| --- | --- | --- |
| Authentication | Missing, expired, tampered or `alg: none` tokens; wrong audience or issuer; token reuse after logout; credentials in the query string | API2 |
| Object-level access | Swap IDs between two users and two tenants on every endpoint that takes an ID | API1 |
| Function-level access | Call admin operations with a low-privilege token; try HTTP method override | API5 |
| Property-level access | Mass assignment (`role`, `isAdmin`, `ownerId`); responses carrying fields the caller should not see | API3 |
| Resource consumption | Page size above the maximum, deeply nested JSON, large uploads, expensive filters, request bursts | API4 |
| Sensitive business flows | Scripted abuse of sign-up, purchase and reset flows; limits per account, IP and device | API6 |
| SSRF | Any parameter that makes the server fetch a URL (webhooks, imports, avatars): internal addresses, metadata IPs, redirects | API7 |
| Misconfiguration | CORS wildcard with credentials, verbose errors, unneeded methods, debug endpoints, missing security headers | API8 |
| Inventory | Old versions (`/v1`) still live, undocumented endpoints, exposed staging hosts | API9 |
| Third-party APIs | Malformed, slow or hostile upstream replies; validate their data like user input | API10 |
| Input validation | Boundaries, Unicode, injection classes (SQL, NoSQL, command, template), duplicate JSON keys, wrong content type | - |
| Lists | Pagination at 0, 1, max, max+1, negative and non-numeric; sort and filter on unknown fields; stable ordering; empty result | - |
| State and concurrency | Retry POST with the same `Idempotency-Key`; repeat PUT and DELETE; two parallel identical requests; optimistic locking | - |
| Resilience | Dependency outage, timeouts, no partial writes after a failure (rollback) | - |
| Compatibility | New optional fields tolerated by old clients; removals and renames caught by contract tests; CORS preflight | - |

## 5. Worked example: POST /api/users

Replace the endpoint, fields and limits with your own. Type: P = positive, N = negative, B = boundary, S = security.

| ID | Pri | Type | Case | Input | Expected |
| --- | --- | --- | --- | --- | --- |
| U-01 | H | P | Valid | name 'Ann', valid email | 201, `id` returned, schema valid, `Location` set |
| U-02 | H | N | Missing email | no email | 400, error names the field |
| U-03 | M | B | Name length | 0, 1, 50, 51 chars | 400, 201, 201, 400 |
| U-04 | H | N | Duplicate email | existing email | 409, no second record |
| U-05 | H | N | Duplicate, different case | `ANN@x.com` when `ann@x.com` exists | 409 (uniqueness is case-insensitive) |
| U-06 | M | B | Email format | `a@b`, ` a@b.co ` (spaces), 255 chars | 400, 201 trimmed, 400 |
| U-07 | M | P | Unicode | name 'Zoë 李雷 😀' | 201, returned unchanged |
| U-08 | H | S | Injection | name `'; DROP TABLE users--` | No 5xx; stored and returned as data; table still exists |
| U-09 | H | S | Mass assignment | body includes `"role":"admin"` | Field ignored or 400; created user is not admin |
| U-10 | H | S | Object-level access | `GET /users/{otherUserId}` as user A | 403 or 404, matching the policy used everywhere |
| U-11 | H | S | Token problems | none, expired, wrong signature | 401 each; valid token with the wrong role: 403 |
| U-12 | M | N | Wrong content type | `text/plain` body | 415 |
| U-13 | M | N | Malformed JSON | `{"name":` | 400, not 500 |
| U-14 | M | B | Oversized body | 10 MB | 413 |
| U-15 | M | N | Race | two simultaneous POSTs, same new email | Exactly one 201 and one 409 |
| U-16 | M | S | Rate limit | burst above the limit | 429 with `Retry-After` |
| U-17 | L | N | Wrong method | `DELETE /api/users` | 405 with an `Allow` header |
| U-18 | H | S | Data exposure | any user response or error | No password hash, token or stack trace in the body |
| U-19 | M | N | Idempotent retry | repeat U-01 with the same `Idempotency-Key` | One resource; same response as the first call |
| U-20 | L | S | Response headers | any response | `Content-Type` correct, `nosniff` set, no server version banner |

## 6. Case template

Copy one row per new case.

| ID | Pri | Type | Case | Preconditions | Input | Expected | Automated |
| --- | --- | --- | --- | --- | --- | --- | --- |
| X-01 | | | | | | | Y/N |

## 7. Automation sketch

```text
for each endpoint in inventory:
  for each case in matrix:
    data = factory.create(case.preconditions)
    resp = client.send(case.request, auth=case.role)
    assert resp.status == case.expected_status
    assert schema.validate(resp.body, case.schema)
    assert invariants(resp, data)
    cleanup(data)
```

Useful tools, run in your own environment: Schemathesis (schema-driven fuzzing), Postman/Newman, REST Assured, Pact (contract tests), k6 (load), OWASP ZAP (dynamic scanning).
