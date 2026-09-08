# AuthFort

**Passwordless, adaptive authentication platform built with NestJS, MongoDB, Redis, and Next.js.**

AuthFort provides a secure authentication foundation centered around passwordless authentication, adaptive risk-based challenges, passkeys, Google OAuth, trusted-device fingerprinting, session protection, and refresh-token reuse detection.

The repository is structured as a **pnpm monorepo** containing the authentication API and the Next.js web application.

---

## Architecture

```text
authFort/
├── api/                         # NestJS authentication API
│   ├── src/
│   │   ├── core/
│   │   ├── config/
│   │   ├── database/
│   │   ├── redis/
│   │   ├── email/
│   │   ├── security/
│   │   └── modules/
│   │       └── auth/
│   │           ├── controllers/
│   │           ├── services/
│   │           ├── repositories/
│   │           ├── dto/
│   │           └── schemas/
│   └── test/
│
├── web/                         # Next.js frontend + BFF
│   ├── src/
│   │   ├── app/
│   │   │   └── api/             # BFF routes
│   │   ├── modules/
│   │   │   └── auth/
│   │   ├── lib/
│   │   └── middleware.ts
│   └── e2e/
│
├── api contract.md
├── frontend.contract.md
├── database.contract.md
├── implementation.contract.md
└── README.md
```

---

## Core principles

AuthFort is designed around the following principles:

* Passwordless authentication by default.
* Adaptive authentication based on authentication risk.
* Backend-controlled authentication challenges.
* HttpOnly authentication cookies.
* Server-side token handling through the Next.js BFF.
* Refresh-token rotation with reuse detection.
* Replay and session-hijacking protection.
* Cryptographically strong authentication challenges.
* Short-lived protocol-specific credentials.
* Request correlation through request IDs.
* Security-event auditing.
* Same-origin and CSRF protection for BFF mutations.
* Passkeys/WebAuthn as a phishing-resistant authentication mechanism.
* No authentication tokens stored in browser localStorage or sessionStorage.

---

# Authentication capabilities

## Signup

Users can register using:

* Magic link
* Google OAuth

The backend owns signup state and determines whether additional verification is required.

After authentication, the backend can trigger a passkey-registration prompt.

---

## Passwordless login

AuthFort does not rely on traditional passwords.

Depending on risk and account state, login can use:

* Magic link
* OTP
* Passkey
* Trusted fingerprint/device

The frontend does not independently choose a security downgrade.

The backend returns the permitted authentication challenge and the frontend renders the corresponding UX.

```text
Login request
     │
     ▼
Risk evaluation
     │
     ├── Low risk ──────► Magic link / trusted device
     │
     ├── Medium risk ───► OTP
     │
     └── High risk ─────► Passkey / stronger challenge
```

---

# Adaptive risk engine

Authentication is evaluated using contextual signals.

Potential signals include:

* Authentication history
* Device/fingerprint trust
* Session state
* Challenge history
* Request characteristics
* Failed authentication attempts
* Replay indicators
* Token reuse
* Suspicious session activity

The risk engine produces an authentication decision that determines which authentication protocols can be used.

The frontend must not bypass this decision.

---

# Magic links

Magic links are:

* Cryptographically random.
* Short-lived.
* Single-use.
* Stored/validated through the authentication protocol boundary.
* Protected against replay.
* Associated with the intended authentication transaction.

A consumed or expired link cannot be reused.

---

# OTP

OTP authentication supports:

* Secure generation.
* Expiration.
* Attempt limits.
* Rate limiting.
* Verification tracking.
* Replay prevention.

OTP state is maintained independently from other authentication protocols.

---

# Google OAuth

Google OAuth is integrated through a backend-controlled authorization flow.

The flow uses:

```text
Browser
   │
   ▼
Next.js BFF
   │
   ▼
Google authorization
   │
   ▼
OAuth callback
   │
   ▼
AuthFort API
   │
   ▼
User authentication
   │
   ▼
Session issuance
```

OAuth state is:

* Cryptographically random.
* Short-lived.
* Stored in a secure cookie.
* Single-use.
* Validated before code exchange.

OAuth return URLs are restricted to internal relative paths to prevent open redirects.

---

# Passkeys / WebAuthn

AuthFort supports WebAuthn/passkeys.

The backend controls:

* Registration options.
* Authentication options.
* Challenge generation.
* Challenge expiration.
* Credential validation.
* Credential persistence.
* Authentication orchestration.

The frontend detects:

* WebAuthn availability.
* Platform authenticator availability.
* Conditional mediation support.

Passkey registration can be prompted by the backend after authentication.

---

# Account recovery

Account recovery is also adaptive.

Supported recovery mechanisms include:

* OTP
* Recovery code

Recovery codes are designed for one-time use and must not be treated as permanent authentication credentials.

Recovery actions are audited as security-sensitive events.

---

# Sessions

Authentication sessions are server-controlled.

Session security includes:

* Session identifiers.
* Device/fingerprint context.
* Expiration.
* Logout/revocation.
* Replay detection.
* Suspicious-session detection.
* Security-event auditing.

The frontend does not store authentication tokens in:

```text
localStorage
sessionStorage
IndexedDB
```

---

# Refresh-token rotation

Refresh tokens are rotated on every successful refresh.

```text
Refresh token A
       │
       ▼
   Refresh API
       │
       ├── revoke A
       │
       └── issue B
```

If a previously consumed refresh token is presented again:

```text
Refresh token A
       │
       ▼
Reuse detected
       │
       ├── invalidate token family
       ├── revoke affected sessions
       └── record security event
```

Redis is used for fast state, replay detection, rate limiting, and rotation coordination.

---

# Security boundary

The Next.js application acts as a **Backend-for-Frontend (BFF)**.

```text
┌──────────────┐
│   Browser    │
└──────┬───────┘
       │
       │ HttpOnly cookies
       ▼
┌──────────────┐
│   Next.js    │
│     BFF      │
└──────┬───────┘
       │
       │ server-side request
       │ access/refresh credentials
       ▼
┌──────────────┐
│   AuthFort   │
│     API      │
└──────┬───────┘
       │
       ├──────────────► MongoDB
       │
       ├──────────────► Redis
       │
       └──────────────► SMTP
```

The browser never needs direct access to the authentication API's token credentials.

---

# Secure cookies

Authentication cookies are created and managed by the Next.js server.

Production cookies should use:

```text
HttpOnly
Secure
SameSite
Path
```

Access and refresh credentials must never be exposed through client-side JavaScript.

---

# CSRF protection

State-changing BFF requests require CSRF validation.

The BFF validates:

```text
x-csrf-token
        ==
csrf-token cookie
```

Additionally, state-changing requests are checked against the request origin.

GET/HEAD/OPTIONS requests are treated as safe methods.

---

# Request IDs

AuthFort propagates request IDs across the authentication boundary.

```text
Browser
   │
   │ x-request-id
   ▼
Next.js BFF
   │
   │ x-request-id
   ▼
AuthFort API
   │
   ▼
Security events / logs
```

Request IDs make authentication failures and security events traceable across services.

---

# Fingerprint propagation

The BFF derives a privacy-preserving request fingerprint and forwards it to the API using:

```text
x-auth-fingerprint
```

The fingerprint can participate in:

* Trusted-device decisions.
* Adaptive risk evaluation.
* Session validation.
* Suspicious-session detection.

A fingerprint is not treated as a standalone authentication factor.

---

# Security-event auditing

Security-sensitive actions generate auditable events.

Examples include:

```text
SIGNUP_STARTED
SIGNUP_COMPLETED

LOGIN_STARTED
LOGIN_SUCCEEDED
LOGIN_FAILED

MAGIC_LINK_CREATED
MAGIC_LINK_CONSUMED
MAGIC_LINK_REPLAYED

OTP_CREATED
OTP_VERIFIED
OTP_FAILED
OTP_REPLAYED

PASSKEY_REGISTERED
PASSKEY_AUTHENTICATED
PASSKEY_FAILED

GOOGLE_AUTH_STARTED
GOOGLE_AUTH_COMPLETED
GOOGLE_AUTH_FAILED

ACCOUNT_RECOVERY_STARTED
RECOVERY_CODE_USED

SESSION_CREATED
SESSION_REVOKED
LOGOUT_COMPLETED

REFRESH_ROTATED
REFRESH_REUSE_DETECTED

FINGERPRINT_TRUSTED
FINGERPRINT_REJECTED

CSRF_REJECTED
OAUTH_STATE_REJECTED
```

Security events should include correlation/request information where available.

---

# Technology stack

## API

* NestJS
* TypeScript
* Mongoose
* MongoDB
* Redis
* Nodemailer
* SMTP
* WebAuthn
* Google OAuth

## Web

* Next.js
* React
* TypeScript
* Server-side cookies
* Next.js BFF
* Lucide React
* Form validation
* Client-side authentication state management

## Repository

* pnpm workspaces
* Monorepo architecture

---

# MongoDB

MongoDB is the primary persistent datastore.

Mongoose schemas are used for domain persistence.

Authentication protocols have independent persistence boundaries where appropriate.

Examples include:

```text
User
AuthenticationAttempt
MagicLink
OtpChallenge
PasskeyCredential
RecoveryCode
Session
RefreshTokenFamily
SecurityEvent
FingerprintTrust
```

Protocol-specific expiration/TTL indexes are used where appropriate.

---

# Redis

Redis provides high-speed ephemeral authentication state.

Typical uses include:

* OTP state
* Magic-link state
* Rate limiting
* Authentication-attempt throttling
* Refresh-token rotation state
* Refresh-token reuse detection
* Replay prevention
* Challenge state
* Distributed locks
* Temporary OAuth state
* Risk-engine state

Redis is an abstraction behind the API's Redis module so application services do not depend directly on a Redis client implementation.

---

# Email

The email module is SMTP/Nodemailer based.

The design uses a pluggable sending service so authentication services do not directly depend on Nodemailer.

Conceptually:

```text
Authentication service
        │
        ▼
Email service
        │
        ▼
Email provider interface
        │
        ▼
Nodemailer / SMTP
```

The email system supports messages such as:

* Signup magic links.
* Login magic links.
* OTP codes.
* Recovery instructions.
* Security notifications.

---

# Configuration

Secrets and environment-specific configuration belong in environment variables.

Typical configuration includes:

```text
NODE_ENV

MONGODB_URI
REDIS_URL

SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASSWORD
SMTP_FROM

GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL

AUTHFORT_API_URL

SESSION_SECRET
```

Never commit production secrets to the repository.

---

# API contract

The API contract is the authoritative boundary between the frontend BFF and authentication API.

It defines authentication endpoints, request DTOs, response DTOs, authentication challenges, session behavior, and error semantics.

The frontend must consume the API contract rather than duplicating authentication logic.

---

# Frontend contract

The frontend contract defines the BFF and browser-facing authentication interface.

The browser communicates with:

```text
/api/auth/*
```

rather than directly depending on internal API authentication implementation details.

This allows the API and browser security boundaries to evolve independently.

---

# Project conventions

Every API authentication module follows:

```text
module/
├── controllers/
├── services/
├── repositories/
├── dto/
└── schemas/
```

Controllers handle HTTP concerns.

DTOs define validation and transport contracts.

Services contain application/domain orchestration.

Repositories contain persistence access.

Schemas define MongoDB/Mongoose persistence models.

Security-sensitive operations must not be implemented directly in controllers.

---

# API authentication flow

A typical login flow looks like:

```text
                   ┌───────────────┐
                   │    Browser    │
                   └───────┬───────┘
                           │
                           ▼
                   ┌───────────────┐
                   │   Next.js     │
                   │      BFF      │
                   └───────┬───────┘
                           │
                           ▼
                   ┌───────────────┐
                   │ Auth API      │
                   │               │
                   │ Risk Engine   │
                   └───────┬───────┘
                           │
                ┌──────────┴──────────┐
                ▼                     ▼
         Challenge selected       Reject
                │
       ┌────────┼────────┐
       ▼        ▼        ▼
     Magic     OTP    Passkey
      Link
       │        │        │
       └────────┼────────┘
                ▼
       Authentication success
                │
                ▼
          Session service
                │
                ▼
       Access + refresh session
                │
                ▼
           Secure BFF cookies
```

---

# Frontend authentication flow

The frontend authentication UX supports:

* Login.
* Signup.
* Magic-link verification.
* OTP verification.
* Google OAuth.
* Passkey authentication.
* Account recovery.
* Recovery-code authentication.
* Onboarding.
* Session hydration.
* Session-expiry handling.
* Authenticated route protection.

Adaptive challenges are rendered based on the backend response.

---

# Route protection

The Next.js middleware performs an early authentication-cookie check for protected routes.

Protected areas include:

```text
/dashboard
/onboarding
/account
```

Middleware protection is only an early boundary.

The presence of an authentication cookie does **not** constitute final authentication.

Server-side BFF/API validation remains authoritative.

---

# OAuth hardening

OAuth callbacks validate:

* Authorization code presence.
* State presence.
* State equality.
* State expiration.
* Single-use state.
* Safe internal return URL.

External return URLs are rejected.

Example of an allowed return URL:

```text
/dashboard
```

Example of a rejected return URL:

```text
https://example.com
```

---

# Testing

Authentication is security-sensitive and should be tested at multiple levels.

## Unit tests

Cover:

* Risk scoring.
* Token generation.
* Token verification.
* OTP verification.
* Magic-link consumption.
* Replay detection.
* Refresh rotation.
* Refresh-token reuse.
* Fingerprint trust.
* OAuth state validation.
* Passkey challenge validation.

## Integration tests

Cover:

* MongoDB repositories.
* Redis state.
* Email service.
* Authentication orchestration.
* Session lifecycle.
* Refresh-token lifecycle.

## End-to-end tests

The web application includes E2E coverage for:

* Login.
* Signup.
* Recovery.
* Route protection.
* CSRF validation.
* OAuth callback hardening.
* OAuth open-redirect protection.
* Request-ID propagation.
* Session hydration.
* Authentication expiration.

---

# Running the project

Install dependencies from the repository root:

```bash
pnpm install
```

Start the API:

```bash
pnpm --filter api dev
```

Start the web application:

```bash
pnpm --filter web dev
```

Run tests:

```bash
pnpm test
```

Run frontend E2E tests:

```bash
pnpm --filter web test:e2e
```

The exact scripts should follow the repository's package-manager configuration.

---

# Local infrastructure

AuthFort requires:

```text
MongoDB
Redis
SMTP server/provider
Google OAuth credentials
```

For local development, MongoDB and Redis can be run through the developer's preferred infrastructure tooling.

SMTP can be replaced by a local SMTP development service.

---

# Environment separation

Use separate configuration for:

```text
development
test
staging
production
```

Never reuse production OAuth credentials, SMTP credentials, Redis instances, or MongoDB databases in development/testing.

---

# Security requirements

Before production deployment:

* Use HTTPS.
* Enable Secure cookies.
* Keep authentication cookies HttpOnly.
* Configure restrictive SameSite policies.
* Configure production CORS explicitly.
* Configure trusted proxy behavior correctly.
* Configure Redis authentication/TLS where required.
* Protect MongoDB credentials.
* Rotate OAuth and SMTP secrets.
* Configure rate limits.
* Monitor security events.
* Monitor refresh-token reuse events.
* Monitor authentication failures.
* Keep dependencies updated.
* Disable verbose authentication errors in production.
* Ensure logs do not contain authentication tokens, OTPs, magic-link values, recovery codes, or secrets.

---

# Threat model

AuthFort is specifically designed to mitigate common passwordless authentication threats.

| Threat                            | Mitigation                        |
| --------------------------------- | --------------------------------- |
| Credential stuffing               | Passwordless authentication       |
| Magic-link replay                 | Single-use + expiration           |
| OTP brute force                   | TTL + attempts + rate limiting    |
| Refresh-token theft               | Rotation + reuse detection        |
| Session hijacking                 | Session/fingerprint validation    |
| OAuth CSRF                        | Cryptographic OAuth state         |
| OAuth open redirect               | Relative-path validation          |
| BFF CSRF                          | CSRF + origin validation          |
| Token exposure                    | HttpOnly server-side cookies      |
| Authentication replay             | Protocol-specific challenge state |
| Passkey phishing                  | WebAuthn                          |
| Suspicious login                  | Adaptive risk engine              |
| Excessive authentication attempts | Redis rate limiting               |
| Undetected security incidents     | Security-event auditing           |
| Distributed race conditions       | Redis coordination/locking        |

---

# Important design rule

**The frontend is not the security authority.**

The API remains authoritative for:

* Identity.
* Authentication.
* Risk.
* Challenge selection.
* Credential validation.
* Session issuance.
* Session revocation.
* Refresh-token rotation.
* Reuse detection.
* Recovery authorization.

The Next.js BFF is the browser security boundary and token-handling layer.

---

# Development workflow

When implementing new authentication functionality:

1. Update the API contract.
2. Update the frontend contract if the browser-facing behavior changes.
3. Update the database contract if persistence changes.
4. Update the implementation contract if architecture changes.
5. Implement API schemas/repositories.
6. Implement services.
7. Implement controllers/DTOs.
8. Update the BFF.
9. Update frontend services/state.
10. Update UX.
11. Add unit/integration tests.
12. Add E2E coverage.
13. Verify security boundaries.

---

# File-generation conventions

New project files should be marked:

```text
NEW
```

Existing files that are modified should be marked:

```text
UPDATED
```

Contract files are maintained separately from implementation files.

The project should not generate ZIP archives or downloadable project bundles.

---

# Contract hierarchy

AuthFort uses four primary contracts:

```text
api contract.md
       │
       ├── API endpoints
       ├── DTOs
       ├── authentication protocols
       └── API responses
       
frontend.contract.md
       │
       ├── BFF
       ├── browser-facing auth
       ├── cookies
       └── frontend behavior

database.contract.md
       │
       ├── MongoDB
       ├── schemas
       ├── indexes
       └── TTL requirements

implementation.contract.md
       │
       ├── modules
       ├── services
       ├── repositories
       ├── boundaries
       └── architectural rules
```

Implementation should remain consistent with all four contracts.

---

# Status

AuthFort currently contains the architecture for:

* Passwordless signup.
* Passwordless login.
* Magic links.
* OTP.
* Google OAuth.
* WebAuthn/passkeys.
* Adaptive authentication.
* Account recovery.
* Recovery codes.
* Session management.
* Refresh-token rotation.
* Refresh-token reuse detection.
* Fingerprint trust.
* Security-event auditing.
* Redis-backed security state.
* SMTP/Nodemailer email delivery.
* Next.js BFF.
* Secure server-side cookies.
* CSRF protection.
* OAuth callback hardening.
* Request-ID propagation.
* Frontend authentication state.
* Protected routes.
* Session-expiry handling.
* Authentication E2E tests.

