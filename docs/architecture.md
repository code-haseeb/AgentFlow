# AgentFlow System Architecture & Design

## 1. High-Level System Architecture

```text
                                 ┌─────────────────────────┐
                                 │    Next.js 15 Client    │
                                 │  (Dashboard / Builder)  │
                                 └────────────┬────────────┘
                                              │ HTTPS / JSON
                                              │
                                 ┌────────────▼────────────┐
                                 │     NestJS API Layer    │
                                 │  (Auth, RBAC, Multi-Org)│
                                 └────────────┬────────────┘
                                              │
              ┌───────────────────────────────┼──────────────────────────────┐
              │                               │                              │
     ┌────────▼────────┐             ┌────────▼────────┐            ┌────────▼────────┐
     │  PostgreSQL 16  │             │     Redis 7     │            │    FastAPI AI   │
     │  w/ pgvector    │             │  Queue & Cache  │            │  Microservice   │
     └─────────────────┘             └─────────────────┘            └────────┬────────┘
                                                                             │
                                              ┌──────────────────────────────┼──────────────────────────────┐
                                              │                              │                              │
                                     ┌────────▼────────┐            ┌────────▼────────┐            ┌────────▼────────┐
                                     │  Triage Agent   │            │ Research Agent  │            │ Response Agent  │
                                     └─────────────────┘            └─────────────────┘            └────────┬────────┘
                                                                                                            │
                                                                                                   ┌────────▼────────┐
                                                                                                   │  Risk Gate &    │
                                                                                                   │  Tool Registry  │
                                                                                                   └─────────────────┘
```

---

## 2. Multi-Tenant Isolation Model

Tenant isolation is enforced strictly on the server:
1. **Tenant Interceptor**: Extracts and verifies `x-organization-id` header or membership context on all protected routes.
2. **Database Scoping**: Every query against `Workflow`, `WorkflowRun`, and `AuditLog` includes a mandatory `WHERE organizationId = :orgId` condition.
3. **Cross-Tenant Prevention**: Validated via automated IDOR/BOLA security tests (`tests/security/phase3-security.mjs`).

---

## 3. Server-Side RBAC Hierarchy

| Role | Hierarchy Score | Privileges |
| :--- | :---: | :--- |
| **OWNER** | 100 | Full organization ownership, member deletions, organization deletion |
| **ADMIN** | 80 | Member role updates, organization settings, workflow creation |
| **MANAGER** | 60 | Approval decisions (`approveRun`, `rejectRun`), workflow executions |
| **ANALYST** | 40 | Triggering workflow executions, audit log analytics |
| **VIEWER** | 20 | Read-only access to workflows, executions, and dashboards |

---

## 4. Multi-Agent Pipeline State Machine

```text
[CREATED]
    │
    ▼
[RUNNING] ──▶ Node 1: Triage Agent (Classification & Urgency Evaluation)
    │
    ▼
[AGENT_EXECUTING] ──▶ Node 2: Research Agent (Vector Search & Policy Fact Verification)
    │
    ▼
[AGENT_EXECUTING] ──▶ Node 3: Response Agent (Resolution Draft & Risk Assessment)
    │
    ├────────────────────────┬────────────────────────┐
    │ (Risk = LOW)           │ (Risk = HIGH / Mutate) │
    ▼                        ▼                        ▼
[COMPLETED]        [WAITING_FOR_APPROVAL]         [FAILED]
                             │
                     Human Decision
                             ├───────────────┐
                             ▼               ▼
                        [APPROVED]      [REJECTED]
                             │
                     Tool Execution
                             │
                             ▼
                        [COMPLETED]
```
