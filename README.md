# AgentFlow — AI Multi-Agent Business Automation Platform

> **A controlled enterprise AI workflow automation platform featuring specialized agent pipelines, tool permission sandboxing, human-in-the-loop approval gates, complete auditability, and multi-tenant RBAC.**

[![CI Pipeline](https://github.com/code-haseeb/AgentFlow/actions/workflows/ci.yml/badge.svg)](.github/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-ea2849)](https://nestjs.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16_pgvector-336791)](https://www.postgresql.org/)

---

## 🏗️ Architecture Overview

AgentFlow is engineered as a production-grade enterprise B2B SaaS platform isolating deterministic business state machines from AI reasoning:

```text
                         ┌───────────────────────────────┐
                         │       Next.js 15 Web UI       │
                         │  Builder / Approvals / Shell  │
                         │    (Ctrl+K Command Palette)   │
                         └──────────────┬────────────────┘
                                        │
                         HTTPS / x-request-id Tracing
                                        │
                         ┌──────────────▼────────────────┐
                         │        NestJS REST API        │
                         │  Auth / 5-Tier RBAC / Tenant  │
                         │   LoggingTraceInterceptor     │
                         └──────────────┬────────────────┘
                                        │
               ┌────────────────────────┼────────────────────────┐
               │                        │                        │
        ┌──────▼──────┐          ┌──────▼──────┐          ┌──────▼──────┐
        │ PostgreSQL  │          │    Redis    │          │ Audit Logs  │
        │  pgvector   │          │ Cache/Queue │          │  Timeline   │
        └─────────────┘          └──────┬──────┘          └─────────────┘
                                        │
                                Asynchronous Event
                                        │
                         ┌──────────────▼────────────────┐
                         │       FastAPI AI Service      │
                         │ (Triage / Research / Response)│
                         │   Policy Gate / Sandboxed     │
                         │       Tool Registry           │
                         └───────────────────────────────┘
```

---

## 🎯 Flagship Workflow: Customer Support Escalations

```text
Customer Inquiry / Webhook
          ↓
┌───────────────────────┐
│     Triage Agent      │  Assess Urgency & Category (Technical, Billing, Policy)
└──────────┬────────────┘
          ↓
┌───────────────────────┐
│    Research Agent     │  Grounded context retrieval against verified knowledge
└──────────┬────────────┘
          ↓
┌───────────────────────┐
│    Response Agent     │  Draft empathetic resolution & calculate risk score
└──────────┬────────────┘
          ↓
┌───────────────────────┐
│   Risk Policy Gate    │
└──────────┬────────────┘
           │
     ┌─────┴─────────────────────────┐
     │                               │
[LOW RISK]                      [HIGH RISK]
     │                               │
Auto-Execute Tool         WAITING_FOR_APPROVAL
     │                               │
     │                    Manager Reviews & Decides
     │                               │
     │                    [APPROVED] │ [REJECTED]
     │                               ▼
     └─────────────┬─────────────────┘
                   │
         Sandboxed Tool Execution
       (`email_send` / `db_query`)
                   │
                   ▼
       Immutable Audit Trail Log
```

---

## 🚀 Key Features by Phase

### Phase 1: Foundation & SaaS Core
- **Multi-Tenant Data Isolation:** Tenant boundary enforced at the database query layer via Organization IDs.
- **Server-Side RBAC (5 Tiers):** `OWNER` > `ADMIN` > `MANAGER` > `ANALYST` > `VIEWER` with guard decorators and zero client-side trust.
- **Dual-Token Authentication:** Secure JWT authentication with HTTP-only cookies and Bearer token compatibility.
- **Calm B2B Design System:** Built with Next.js 15 App Router, Tailwind CSS, Lucide icons, dynamic theme switching, and accessible empty/loading states.
- **Database & Cache Cluster:** PostgreSQL 16 (`pgvector`) and Redis 7 containerized via Docker Compose.

### Phase 2: Autonomous Agents & Workflow Engine
- **FastAPI AI Service (`apps/ai-service` on port 8000):** Python 3.12 microservice with Pydantic structured schemas.
- **Specialized Multi-Agent Pipeline:**
  - `TriageAgent`: Inquiry classification, priority assignment, confidence scoring.
  - `ResearchAgent`: Fact grounding, SLA verification, policy compliance check.
  - `ResponseAgent`: Structured draft generation, tone calibration, risk level scoring.
- **Deterministic Risk Policy Gate:** Automatically halts high-risk actions (refunds > $100, sensitive escalations) at `WAITING_FOR_APPROVAL`.
- **Human Approval Inbox:** Interactive review UI at `/approvals` with side-by-side agent traces, parameters, and one-click authorization.
- **Visual Graph & Live Pipeline Runner:** Interactive pipeline visualizer on `/workflows/[id]` displaying real-time step traces, latency metrics, and execution history.

### Phase 3: Controlled Tools & Security Hardening
- **Sandboxed Tool Registry:**
  - `email_send`: High-risk transactional delivery tool requiring manager sign-off.
  - `db_query`: Internal query tool with table allowlists and mutation escalation.
  - `search_knowledge`: Low-risk grounded knowledge retrieval.
  - `http_api`: External webhook integration with SSRF security perimeter.
- **SSRF Defense Architecture:** Hardened destination resolver strictly blocking loopbacks (`127.0.0.1`), private RFC 1918 subnets, and cloud instance metadata (`169.254.169.254`).
- **Prompt Injection Defense:** Perimeter input scanner intercepting adversarial system prompt overrides and jailbreak attempts.
- **Approval Resumption Engine:** Approving a run dispatches the sandboxed tool, marks status `COMPLETED`, and appends an immutable audit event.

### Phase 4: Production Polish, Observability & DevOps
- **Distributed Request Tracing:** End-to-end `x-request-id` propagation across web UI, NestJS API, and FastAPI AI service with latency logs.
- **Command Palette (`Ctrl+K` / `Cmd+K`):** Global quick navigation, action shortcuts, and theme switcher.
- **Production Dockerization:** Multi-stage Dockerfiles (`infrastructure/docker/`) and `docker-compose.prod.yml` ready for deployment.
- **CI/CD Pipeline:** GitHub Actions workflow (`.github/workflows/ci.yml`) automating linting, Jest tests, Pytest suites, security hardening tests, and E2E validation.
- **Portfolio Documentation Suite:** Comprehensive enterprise documentation in [`docs/`](docs/):
  - [Architecture Specification](docs/architecture.md)
  - [Threat Model & Security Hardening](docs/threat-model.md)
  - [API Reference](docs/api.md)
  - [AI Evaluation Benchmark](docs/ai-evaluation.md)

---

## 📊 Measured Benchmarks & Metrics

| Metric | Target | Measured Result | Verification Test |
| :--- | :--- | :--- | :--- |
| **Low-Risk Pipeline Latency** | < 2500ms | **43ms** (mock) / **850ms** (LLM) | `tests/e2e/phase4-full-system.mjs` |
| **High-Risk Gate Accuracy** | 100% deterministic | **100%** (0 false negatives) | `tests/e2e/phase2-e2e.mjs` |
| **Tenant Isolation (IDOR/BOLA)** | Zero data leakage | **100% blocked** (403/404) | `tests/security/phase3-security.mjs` |
| **SSRF Defense** | Block all private/meta IPs | **4/4 targets blocked** (100%) | `tests/security/phase3-security.mjs` |
| **Prompt Injection Filter** | Perimeter rejection | **100% intercepted** | `tests/security/phase3-security.mjs` |
| **Automated Test Pass Rate** | 100% | **23/23 tests passing** | Jest + Pytest + E2E Suites |

---

## 💼 Resume Bullet

> **Built AgentFlow, a multi-tenant AI workflow automation platform using Next.js, NestJS, FastAPI, PostgreSQL, Redis and LLM tool calling, implementing RBAC, human approval gates, secure tool execution, asynchronous workflows, audit logging and automated security/E2E testing.**

---

## 📦 Project Structure

```text
AgentFlow/
├── apps/
│   ├── web/               # Next.js 15 App Router Frontend (Dashboard, Workflows, Approvals, Palette)
│   ├── api/               # NestJS API Backend (Auth, RBAC, Workflows, Audit, Trace Interceptor)
│   └── ai-service/        # FastAPI Python 3.12 AI Microservice (Agents, Orchestrator, Sandboxed Tools)
│
├── packages/
│   └── types/             # Shared TypeScript models, enums & interfaces
│
├── infrastructure/
│   └── docker/            # Production multi-stage Dockerfiles (Dockerfile.api, web, ai-service)
│
├── docs/
│   ├── architecture.md    # System architecture, data flow & component topology
│   ├── threat-model.md    # STRIDE threat model, OWASP Top 10 & LLM mitigations
│   ├── api.md             # REST API endpoint reference & schemas
│   └── ai-evaluation.md   # AI accuracy, latency, and safety evaluation results
│
├── tests/
│   ├── e2e/               # phase2-e2e.mjs, phase4-full-system.mjs
│   └── security/          # phase3-security.mjs (IDOR, RBAC, SSRF, Injection)
│
├── .github/workflows/
│   └── ci.yml             # Automated CI/CD pipeline
│
├── docker-compose.yml     # Local Postgres + pgvector + Redis
├── docker-compose.prod.yml# Production cluster compose
└── README.md
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: `v20+` (Tested on `v24.20.0`)
- **pnpm**: `v9+`
- **Docker & Docker Compose**
- **Python**: `3.12+`

### 2. Start Core Infrastructure
```bash
docker compose up -d
```

### 3. Run Automated Verification Tests
```bash
# 1. API Jest Unit Tests
pnpm --filter @agentflow/api test

# 2. Python AI Service Unit Tests
cd apps/ai-service && pytest

# 3. Security Hardening Suite (IDOR, SSRF, RBAC, Injection)
node tests/security/phase3-security.mjs

# 4. Full System End-to-End Suite
node tests/e2e/phase4-full-system.mjs
```

### 4. Run Development Servers
```bash
# Terminal 1: Python AI Service
cd apps/ai-service && uvicorn src.main:app --port 8000 --reload

# Terminal 2: NestJS API
cd apps/api && npm run dev

# Terminal 3: Next.js Web UI
cd apps/web && npm run dev
```

- **Web Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:4000/api](http://localhost:4000/api)
- **AI Microservice:** [http://localhost:8000](http://localhost:8000)

---

## 📜 License
MIT License. Built with precision for production multi-agent automation.
