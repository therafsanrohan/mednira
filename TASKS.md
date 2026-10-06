# MedNira Implementation Tasks & Roadmap

## Sprint 0 — Foundation
- [x] Turborepo monorepo initialized
- [x] `apps/api` — NestJS / Next.js API route skeleton with module structure
- [x] `apps/web` — Next.js skeleton with route structure
- [x] `packages/types`, `packages/validation` created
- [x] Docker Compose: PostgreSQL + Redis + API + Web
- [x] Prisma ORM configured; migration system operational
- [x] `.env.example` with all required variables documented
- [x] GitHub Actions CI: lint + typecheck + unit tests + build
- [x] Structured logging with correlation ID

## Sprint 1 — Identity + Member Profile
- [x] `auth` module: register, login, logout, OAuth
- [x] JWT access token + hashed refresh token
- [x] Uniform auth error responses
- [x] `member` module: GET /me, POST /profile
- [x] `consent` module: basic terms + privacy consent on registration
- [x] Unit tests: auth business logic, token generation

## Sprint 2 — Emergency Profile
- [x] `emergency-profile` module: blood group, allergies, conditions, medications, instructions
- [x] Visibility enum enforced on all medical entities (EMERGENCY, TRUSTED, PRIVATE)
- [x] Verification status & profile readiness tracking
- [x] Unit tests: visibility logic & DTO privacy filtering
- [x] Integration tests: profile CRUD endpoints

## Sprint 3 — Contacts + Devices
- [x] `contacts` module: CRUD, priority management
- [x] `devices` module: activate, freeze, unfreeze, revoke, replace
- [x] Token generation: 256-bit entropy, URL-safe crypto tokens (`mn_tok_...`)
- [x] QR code generation & multi-device support
- [x] Audit events: device status change & access logging
- [x] Unit tests: token generation, device state machine

## Sprint 4 — Emergency Read
- [x] `emergency-read` module: token resolution, visibility policy, DTO construction
- [x] Frozen/revoked device rejection with safe errors
- [x] Async scan event recording (non-blocking)
- [x] Active incident detection
- [x] First responder view (`/e/[token]`)
- [x] Rate limiting & privacy shielding

## Sprint 5 — Incident + Notifications
- [x] `incident` module: creation, state machine, event timeline
- [x] Emergency incident declaration & duplicate incident detection
- [x] `notifications` module: SMS (Twilio) + Email (Resend) dispatch
- [x] Notification state tracking & error logs
- [x] Incident contact alerts & acknowledgement flow

## Sprint 6 — Escalation + Guardian
- [x] Location sharing: lat, lng & address logging
- [x] Incident resolution & cancellation
- [x] "Responding" state on responder page
- [x] Escalation & multi-contact alerts

## Sprint 7 — Trust + Vault + Admin
- [x] `verification` module: schema & state machine
- [x] `AuditLog` & `AccessLog` security tracking
- [x] Profile readiness score (0-100%)

## Sprint 8 — Hardening + Pilot Preparation
- [x] Typecheck verification (`npm run typecheck`)
- [x] Security & DTO privacy tests (`npm test`)
- [x] Production build optimization (`npm run build`)
- [x] Documentation & SECURITY.md policies
