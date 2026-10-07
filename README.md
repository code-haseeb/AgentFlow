# AgentFlow — AI Multi-Agent Business Automation Platform

> **A controlled AI workflow automation platform featuring specialized agent pipelines, tool permissions, human-in-the-loop approval gates, complete auditability, and multi-tenant RBAC.**

---

## 🏗️ Architecture Overview

AgentFlow is built as a production-grade enterprise B2B SaaS platform:

```text
                         ┌──────────────────────┐
                         │   Next.js 15 Web UI  │
                         │ Dashboard / Builder  │
                         └──────────┬───────────┘
                                    │
                             HTTPS / WebSocket
                                    │
                         ┌──────────▼───────────┐
                         │   NestJS REST API    │
                         │  Auth / RBAC / Orgs  │
                         └──────────┬───────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
       ┌──────▼──────┐      ┌───────▼──────┐      ┌──────▼──────┐
       │ PostgreSQL  │      │    Redis     │      │ Audit Logs  │
       │  pgvector   │      │ Cache/Queue  │      │  Timeline   │
       └─────────────┘      └───────┬──────┘      └─────────────┘
                                    │
                             Job / Event Queue
                                    │
                         ┌──────────▼───────────┐
                         │   FastAPI AI Service │
                         │ (Triage/Research/    │
                         │      Response)       │
                         └──────────────────────┘
```

---

## 🚀 Key Features Built

### Phase 1: Foundation + SaaS Core
- **Organization Multi-Tenancy & Isolation:** Every query, workflow, and action is strictly isolated by organization ID.
- **Server-Side RBAC:** 5-tier role hierarchy (`OWNER`, `ADMIN`, `MANAGER`, `ANALYST`, `VIEWER`) enforced via guards and decorators.
- **Dual-Token Authentication:** Secure JWT authentication with HTTP-only cookies and Bearer token compatibility.
- **Audit Trails:** Complete immutable logging of registration, organization changes, member permissions, and workflow events.
- **B2B UI System:** Minimalist, calm, and high-density interface built with Next.js 15, Tailwind CSS, Lucide icons, supporting dynamic light/dark modes.
- **Database & Queue Infrastructure:** Docker Compose cluster running PostgreSQL 16 with `pgvector` and Redis 7.

### Phase 2: Agents + Workflow Engine
- **FastAPI AI Service (`apps/ai-service` on port 8000):** Python 3.12 microservice running specialized autonomous agents with Pydantic structured schemas.
- **Triage Agent:** Classifies incoming inquiries, assesses urgency, and detects financial or security escalation triggers.
- **Research Agent:** Grounded context retrieval and policy compliance verification against internal databases.
- **Response Agent:** Synthesizes verified context into empathetic professional resolution drafts with tone control and risk classification.
- **Risk Policy Gate:** Automatically halts high-risk actions (e.g. $100+ refund issuance, sensitive overrides) at the **Human Approval Gate** (`WAITING_FOR_APPROVAL`).
- **Human Approval Inbox:** Interactive review UI on `/approvals` where authorized reviewers can inspect exact agent parameters and approve/reject executions.
- **Visual Graph & Live Execution:** Interactive pipeline graph on `/workflows/[id]` with real-time step traces, latency metrics, and run history.

### Phase 3: Tools + Approvals + Security Hardening
- **Controlled Tool Execution Layer:** Sandboxed tools with strictly enforced Pydantic schemas, permissions, and timeout controls:
  - `email_send`: High-risk transactional communication tool requiring manager approval.
  - `db_query`: Internal database query tool with table allowlists and mutation risk escalation.
  - `search_knowledge`: Low-risk grounded knowledge base retrieval.
  - `http_api`: Third-party integration tool with strict SSRF defense.
- **SSRF Defense Architecture:** Validates destinations to block internal hostnames, loopbacks (`127.0.0.1`), RFC 1918 private subnets, and cloud instance metadata services (`169.254.169.254`).
- **Prompt Injection Defense:** Scans arguments and prompts against adversarial injection heuristics (e.g. instruction overrides, jailbreak tokens) to halt attacks at the perimeter.
- **Human Decision Resumption:** Approving an action in the approval inbox automatically executes the permitted tool, updates status to `COMPLETED`, and appends immutable audit records.
- **Certified Security Test Suite:** Automated IDOR/BOLA, cross-tenant isolation, server-side RBAC, SSRF, and prompt-injection verification (`tests/security/phase3-security.mjs`).

---

## 📦 Project Structure

```text
agentflow/
├── apps/
│   ├── web/               # Next.js 15 App Router Frontend
│   │   ├── src/app/       # Routes (dashboard, workflows, settings, audit-logs, login, register)
│   │   ├── src/components/# UI primitives, Shell, Sidebar, Header, OrgSwitcher
│   │   └── src/context/   # Auth & Multi-tenant context
│   └── api/               # NestJS API Backend
│       ├── src/modules/   # Auth, Organizations, Workflows, Audit
│       ├── src/common/    # Guards (JWT, Roles), Decorators, Interceptors
│       └── prisma/        # Prisma schema & migrations
│
├── packages/
│   └── types/             # Shared TypeScript models, enums & interfaces
│
├── docker-compose.yml     # PostgreSQL + pgvector + Redis
└── pnpm-workspace.yaml    # Monorepo configuration
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: `v20+` (Tested on `v24.20.0`)
- **pnpm**: `v9+` (Tested on `v12.9.1`)
- **Docker & Docker Compose** (Running Docker Desktop)
- **Python**: `3.12+`

### 2. Start Infrastructure
```bash
docker compose up -d
```

### 3. Install Dependencies & Generate Database Client
```bash
pnpm install
cd apps/api
pnpm prisma:migrate
```

### 4. Run Development Servers
```bash
pnpm dev
```
- **Web Dashboard:** `http://localhost:3000`
- **Backend API:** `http://localhost:4000/api`
