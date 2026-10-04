# AgentFlow --- AI Multi-Agent Business Automation Platform

> **Project goal:** Build a production-quality SaaS platform where
> organizations create AI-powered workflows composed of specialized
> agents, controlled tools, approval gates, and complete auditability.
>
> **Primary portfolio goal:** Demonstrate strong full-stack engineering,
> AI integration, backend architecture, security, testing, DevOps, and
> polished product design.
>
> **Design principle:** Minimalist, fast, calm, and professional. The
> product should feel like a serious modern B2B SaaS---not an AI demo.

------------------------------------------------------------------------

## 1. Product Definition

### Core problem

Businesses repeatedly perform workflows such as:

-   reading customer requests
-   categorizing tickets
-   researching information
-   drafting responses
-   querying internal data
-   escalating risky actions
-   requesting human approval
-   executing approved actions
-   recording what happened

AgentFlow automates these workflows while keeping humans in control of
sensitive operations.

### Initial flagship workflow

**AI Customer Support Automation**

``` text
Customer Email
      ↓
Triage Agent
      ↓
Research Agent
      ↓
Response Agent
      ↓
Risk / Policy Agent
      ↓
┌───────────────┐
│ Low Risk      │──→ Execute
│ High Risk     │──→ Human Approval → Execute
└───────────────┘
      ↓
Audit Log
```

### Product positioning

AgentFlow is **not** a generic chatbot.

It is:

> **A controlled AI workflow automation platform with tool permissions,
> human approval, observability, and auditability.**

------------------------------------------------------------------------

# 2. Core Requirements

## Functional requirements

-   User authentication
-   Organization/workspace support
-   Role-based access control
-   Agent creation and configuration
-   Workflow creation
-   Workflow execution
-   Agent orchestration
-   Tool calling
-   Tool permission management
-   Human approval gates
-   Workflow execution history
-   Real-time execution status
-   Audit logs
-   Integration management
-   AI-generated outputs
-   Error/retry handling
-   Usage and cost tracking
-   Search/filtering
-   Dark/light mode

## Non-functional requirements

-   Secure by default
-   Responsive UI
-   Accessible UI
-   Fast perceived performance
-   Strong API validation
-   Structured AI outputs
-   Deterministic business logic around AI
-   Observable background jobs
-   Automated testing
-   CI/CD
-   Dockerized development and deployment
-   Clear architecture documentation

------------------------------------------------------------------------

# 3. Technology Stack

Use one coherent stack rather than introducing unnecessary technologies.

## Frontend

-   Next.js
-   TypeScript
-   Tailwind CSS
-   shadcn/ui or similarly accessible component primitives
-   React Query/TanStack Query
-   React Hook Form
-   Zod
-   WebSockets/SSE for live workflow execution

## Backend

-   NestJS
-   TypeScript
-   REST API
-   WebSockets where real-time updates are required
-   Zod/class-validator for input validation

## AI service

-   Python
-   FastAPI
-   LLM provider abstraction
-   Structured output / JSON schema
-   Tool calling
-   Agent orchestration
-   Optional LangGraph-style state-machine architecture if it genuinely
    simplifies orchestration

Do not make the entire backend dependent on an agent framework. Business
logic and security controls remain under application control.

## Data

-   PostgreSQL
-   pgvector
-   Redis
-   Object storage for uploaded files if needed

## Async execution

-   Redis-backed job queue
-   Worker processes
-   Retry with exponential backoff
-   Dead-letter handling for permanently failed jobs

## Infrastructure

-   Docker
-   Docker Compose for local development
-   GitHub Actions
-   Cloud deployment
-   HTTPS
-   Secrets managed through environment/secret management

## Testing

-   Vitest/Jest
-   React Testing Library
-   Playwright
-   Pytest
-   API integration tests
-   Security tests
-   AI evaluation tests

------------------------------------------------------------------------

# 4. High-Level Architecture

``` text
                         ┌──────────────────────┐
                         │      Next.js UI      │
                         │ Dashboard / Builder  │
                         └──────────┬───────────┘
                                    │
                             HTTPS / WebSocket
                                    │
                         ┌──────────▼───────────┐
                         │      API Layer       │
                         │    NestJS Backend    │
                         └──────────┬───────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
       ┌──────▼──────┐      ┌───────▼──────┐      ┌──────▼──────┐
       │ PostgreSQL  │      │    Redis     │      │ Auth / RBAC │
       │ Persistent  │      │ Cache/Queue  │      │ Permissions  │
       │ Data        │      │              │      │             │
       └─────────────┘      └───────┬──────┘      └─────────────┘
                                    │
                              Job / Event Queue
                                    │
                         ┌──────────▼───────────┐
                         │   Agent Orchestrator │
                         │      FastAPI         │
                         └──────────┬───────────┘
                                    │
               ┌────────────────────┼────────────────────┐
               │                    │                    │
        ┌──────▼──────┐      ┌──────▼──────┐      ┌─────▼───────┐
        │ Triage      │      │ Research    │      │ Response    │
        │ Agent       │      │ Agent       │      │ Agent       │
        └──────┬──────┘      └──────┬──────┘      └─────┬───────┘
               │                    │                    │
               └────────────────────┼────────────────────┘
                                    │
                           Tool Permission Layer
                                    │
                 ┌──────────────────┼───────────────────┐
                 │                  │                   │
             Email Tool        Database Tool       Search Tool
                 │                  │                   │
                 └──────────────────┼───────────────────┘
                                    │
                            Human Approval Gate
                                    │
                              Final Execution
                                    │
                               Audit Log
```

------------------------------------------------------------------------

# 5. Architectural Rules

1.  The browser never talks directly to the AI provider.
2.  The AI service never bypasses application authorization.
3.  Agents cannot directly execute arbitrary external actions.
4.  Every tool call passes through a permission-controlled tool layer.
5.  Sensitive actions require explicit approval.
6.  Every important agent/tool/action event is auditable.
7.  AI output is treated as untrusted input.
8.  Business rules must not depend solely on LLM reasoning.
9.  Long-running workflows execute asynchronously.
10. Every workflow execution has a traceable run ID.
11. Every external integration uses scoped credentials.
12. Secrets are never stored in plaintext.
13. Tenant data must remain isolated.
14. Failed jobs must be retryable and observable.
15. UI state must clearly communicate running, waiting, failed,
    approved, and completed states.

------------------------------------------------------------------------

# 6. Data Model

Core tables/entities:

``` text
users
organizations
organization_members
roles
permissions

agents
agent_tools
agent_versions

workflows
workflow_nodes
workflow_edges
workflow_versions

workflow_runs
tasks
task_attempts

tool_definitions
tool_calls

integrations
integration_credentials

approvals

messages
knowledge_documents
knowledge_chunks

audit_logs
usage_records
api_keys
notifications
```

### Important relationships

``` text
Organization
 ├── Members
 ├── Agents
 ├── Workflows
 ├── Integrations
 ├── Knowledge
 ├── Workflow Runs
 └── Audit Logs
```

A workflow belongs to an organization.

A workflow run belongs to a workflow.

Every task belongs to a workflow run.

Every tool call belongs to a task/run.

Every approval belongs to an action that is waiting for authorization.

------------------------------------------------------------------------

# 7. Agent Model

Start with three agents.

## Triage Agent

Responsibilities:

-   classify incoming request
-   determine priority
-   detect category
-   identify whether escalation is needed
-   produce structured output

Example output:

``` json
{
  "category": "refund_request",
  "priority": "high",
  "requires_human": true,
  "reason": "Refund exceeds automatic approval limit"
}
```

## Research Agent

Responsibilities:

-   search approved sources
-   retrieve internal knowledge
-   query permitted data
-   provide evidence
-   never invent unsupported facts

## Response Agent

Responsibilities:

-   generate response draft
-   use verified context
-   follow organization tone
-   produce structured draft
-   never directly send sensitive communication

------------------------------------------------------------------------

# 8. Agent Orchestrator

The orchestrator controls:

-   state
-   agent sequence
-   context
-   tool access
-   retries
-   timeouts
-   token/cost limits
-   approval gates
-   failures
-   final state

Example state machine:

``` text
CREATED
   ↓
RUNNING
   ↓
AGENT_EXECUTING
   ↓
TOOL_EXECUTING
   ↓
AGENT_EXECUTING
   ↓
WAITING_FOR_APPROVAL
   ↓
APPROVED / REJECTED
   ↓
EXECUTING
   ↓
COMPLETED / FAILED
```

Never allow uncontrolled recursive agent loops.

Set:

-   maximum steps
-   maximum execution time
-   maximum retries
-   maximum token budget
-   maximum tool calls

------------------------------------------------------------------------

# 9. Tool Architecture

Agents request tools through a controlled interface.

``` text
Agent
  ↓
Tool Request
  ↓
Schema Validation
  ↓
Permission Check
  ↓
Risk Classification
  ↓
Approval Check
  ↓
Tool Executor
  ↓
External API
  ↓
Result
  ↓
Audit Log
```

Initial tools:

1.  Email
2.  Internal database query
3.  Web/search
4.  HTTP API

Later:

-   Slack
-   GitHub
-   Google Drive
-   Calendar
-   CRM

Each tool must define:

``` text
name
description
input_schema
output_schema
required_permissions
risk_level
approval_required
timeout
```

------------------------------------------------------------------------

# 10. Human Approval System

Actions are classified by risk.

### Low risk

Can execute automatically:

-   classify email
-   summarize document
-   search knowledge
-   generate draft

### Medium risk

May require organization policy:

-   send customer email
-   update CRM
-   create support ticket

### High risk

Require explicit human approval:

-   issue refund
-   delete data
-   change account permissions
-   modify important records
-   send sensitive external communication

Approval screen must show:

-   agent
-   action
-   target
-   exact parameters
-   reason
-   evidence/context
-   timestamp
-   approve/reject controls

Never hide the actual action behind vague text such as "AI wants to
perform an action."

------------------------------------------------------------------------

# 11. Security Architecture

Security is a first-class feature, not a final phase.

## Authentication

-   secure session handling
-   password hashing using modern password hashing
-   email verification
-   optional MFA
-   session expiration
-   secure cookie configuration

## Authorization

Use organization-aware RBAC.

Example roles:

``` text
OWNER
ADMIN
MANAGER
ANALYST
VIEWER
```

Check authorization on the server for every protected resource.

Never trust frontend role checks.

## Tenant isolation

Every organization-owned database query must be scoped by organization
ID.

Test explicitly for cross-tenant access.

## Secrets

-   never commit secrets
-   never log API keys
-   encrypt integration credentials at rest
-   rotate credentials
-   use environment/secret manager
-   expose only minimum required permissions

## AI security

Defend against:

-   prompt injection
-   indirect prompt injection
-   data exfiltration
-   malicious tool arguments
-   excessive agency
-   unbounded loops
-   sensitive data leakage
-   insecure generated code
-   tool permission abuse

Treat retrieved documents and external web content as **untrusted
data**, not instructions.

## API security

Implement:

-   rate limiting
-   request validation
-   output validation
-   CORS policy
-   CSRF protection where applicable
-   secure headers
-   request size limits
-   pagination limits
-   timeout controls

## Auditability

Record:

``` text
who
what
when
organization
workflow
run
agent
tool
arguments/hash
result/status
approval
IP/device metadata where appropriate
```

Never store sensitive secrets in audit logs.

------------------------------------------------------------------------

# 12. UI/UX Direction

## Design objective

The UI should feel like:

> **Linear + Vercel + modern enterprise SaaS**

Avoid:

-   excessive rounded cards
-   neon AI aesthetics
-   gradients everywhere
-   glowing borders
-   oversized dashboards
-   unnecessary animations
-   visual clutter
-   "AI magic" gimmicks

Use:

-   sharp/soft-minimal geometry
-   generous whitespace
-   subtle borders
-   restrained shadows
-   clear hierarchy
-   excellent typography
-   keyboard-friendly interactions
-   fast transitions
-   meaningful loading states

## Layout

Desktop:

``` text
┌─────────────────────────────────────────────────────┐
│ Logo       Search                 Help   User       │
├───────────┬─────────────────────────────────────────┤
│           │                                         │
│ Dashboard │                                         │
│ Agents    │              Main Content               │
│ Workflows │                                         │
│ Runs      │                                         │
│ Approvals │                                         │
│ Integrate │                                         │
│ Settings  │                                         │
│           │                                         │
└───────────┴─────────────────────────────────────────┘
```

Mobile must use a responsive navigation pattern rather than simply
shrinking the desktop layout.

## Color system

Use semantic design tokens rather than hard-coded colors.

### Light mode

``` text
Background:       #FAFAF9
Surface:          #FFFFFF
Surface subtle:   #F5F5F4
Border:           #E7E5E4
Text primary:     #18181B
Text secondary:   #71717A
Accent:           #2563EB
Success:          #16A34A
Warning:          #D97706
Danger:           #DC2626
```

### Dark mode

``` text
Background:       #09090B
Surface:          #111113
Surface subtle:   #18181B
Border:           #27272A
Text primary:     #FAFAFA
Text secondary:   #A1A1AA
Accent:           #60A5FA
Success:          #4ADE80
Warning:          #FBBF24
Danger:           #F87171
```

Accent colors should be used sparingly.

Do not make every button, icon, border, and heading blue.

## Typography

Recommended:

-   Inter
-   Geist
-   system sans-serif fallback

Use clear size hierarchy:

``` text
Page title
Section title
Body
Secondary text
Metadata
```

## Accessibility

Target WCAG 2.2 AA where practical.

Required:

-   keyboard navigation
-   visible focus states
-   semantic HTML
-   accessible dialogs
-   accessible forms
-   sufficient contrast
-   reduced-motion support
-   screen-reader labels
-   no color-only status indicators

------------------------------------------------------------------------

# 13. UX States

Every asynchronous operation must have a meaningful state.

``` text
Idle
Loading
Running
Waiting
Success
Partial Success
Failed
Retrying
Cancelled
```

Example workflow execution:

``` text
✓ Triage Agent        Completed
✓ Research Agent      Completed
● Response Agent      Running
○ Risk Check          Waiting
○ Approval            Pending
```

Never leave the user staring at a generic spinner.

------------------------------------------------------------------------

# 14. Four-Phase Development Plan

# PHASE 1 --- Foundation + SaaS Core

### Goal

Build a polished, secure SaaS foundation before introducing complex
agents.

### Build

Frontend:

-   application shell
-   sidebar
-   top navigation
-   dashboard
-   login/signup
-   organization switcher
-   settings
-   dark/light mode
-   responsive layout
-   design system

Backend:

-   NestJS project
-   PostgreSQL
-   migrations
-   authentication
-   organizations
-   members
-   RBAC
-   API validation
-   error handling

Infrastructure:

-   Docker Compose
-   PostgreSQL
-   Redis
-   local development environment
-   environment configuration
-   GitHub repository
-   CI skeleton

### Testing

-   unit tests for auth logic
-   API validation tests
-   RBAC tests
-   organization isolation tests
-   frontend component tests
-   Playwright login flow

### Security

-   secure cookies
-   password hashing
-   input validation
-   rate limiting
-   RBAC
-   tenant isolation
-   secret management
-   security headers

### Phase 1 acceptance criteria

-   User can register/login/logout.
-   User can create/switch organizations.
-   Users cannot access another organization's data.
-   RBAC is enforced server-side.
-   Light/dark mode works.
-   UI is responsive.
-   CI runs tests automatically.
-   Core authentication has automated tests.

------------------------------------------------------------------------

# PHASE 2 --- Agents + Workflow Engine

### Goal

Build the actual AI execution system.

### Build

AI service:

-   FastAPI
-   LLM abstraction
-   structured outputs
-   agent definitions
-   Triage Agent
-   Research Agent
-   Response Agent

Orchestration:

-   workflow model
-   workflow nodes
-   workflow edges
-   workflow execution
-   task state
-   Redis queue
-   workers
-   retry logic
-   timeout handling
-   execution IDs

Frontend:

-   agent management
-   workflow builder
-   execution screen
-   live execution updates
-   execution history

### Testing

-   agent unit tests
-   schema validation tests
-   workflow state-machine tests
-   queue/worker tests
-   retry tests
-   timeout tests
-   AI structured-output tests
-   mock LLM tests
-   Playwright workflow creation test

### Security

-   tool allowlists
-   agent permission model
-   maximum execution steps
-   token/cost limits
-   prompt injection defenses
-   output validation
-   no direct AI-to-database access

### Phase 2 acceptance criteria

A complete workflow can execute:

``` text
Trigger
 → Triage Agent
 → Research Agent
 → Response Agent
 → Final Result
```

The UI displays execution progress in real time.

Failures are visible and retryable.

Every run has a unique trace/run ID.

------------------------------------------------------------------------

# PHASE 3 --- Tools + Approvals + Security Hardening

### Goal

Turn the agent engine into a controlled automation platform.

### Build

Tools:

-   email tool
-   database tool
-   search tool
-   HTTP/API tool

Permission system:

-   tool permissions
-   organization policies
-   risk levels
-   approval rules

Approval system:

-   approval inbox
-   approve/reject
-   approval comments
-   approval expiration
-   workflow resume after approval

Audit:

-   audit event pipeline
-   execution timeline
-   tool call history
-   approval history

Integrations:

-   first external integration
-   encrypted credentials
-   connection testing

### Security testing

Perform:

-   authentication testing
-   authorization testing
-   IDOR/BOLA testing
-   tenant-isolation testing
-   prompt-injection testing
-   tool-abuse testing
-   secret-leak testing
-   rate-limit testing
-   malicious input testing
-   dependency vulnerability scanning

Use OWASP ASVS and OWASP Top 10 as security references.

### AI evaluation

Create a fixed evaluation dataset covering:

-   correct classification
-   hallucination
-   prompt injection
-   malformed tool requests
-   unsafe actions
-   ambiguous requests
-   sensitive information requests

Track:

``` text
accuracy
tool-call correctness
unsafe-action rate
hallucination rate
latency
token usage
cost per workflow
```

### Phase 3 acceptance criteria

The system must prevent an unauthorized agent from executing a
restricted tool.

High-risk actions must stop at an approval gate.

Every important action is auditable.

Cross-tenant access tests pass.

Prompt-injection tests do not result in unauthorized tool execution.

------------------------------------------------------------------------

# PHASE 4 --- Production Polish + Observability + Deployment

### Goal

Make the project portfolio-grade and production-oriented.

### Build

UI polish:

-   empty states
-   skeleton loading
-   optimistic UI where safe
-   keyboard shortcuts
-   command/search interface
-   responsive mobile views
-   accessibility improvements
-   error recovery
-   notification system

Observability:

-   structured logs
-   request IDs
-   workflow trace IDs
-   metrics
-   error tracking
-   execution latency
-   agent/token usage
-   tool failure rates

Performance:

-   database indexes
-   pagination
-   caching
-   queue optimization
-   frontend code splitting
-   API response optimization

DevOps:

-   production Docker images
-   CI/CD
-   automated migrations
-   staging environment
-   production environment
-   health checks
-   backup strategy
-   HTTPS
-   environment secrets

Documentation:

-   README
-   architecture.md
-   threat-model.md
-   API documentation
-   database schema
-   setup instructions
-   deployment guide
-   AI evaluation report

### Testing

Final test layers:

``` text
Unit
  ↓
Integration
  ↓
API
  ↓
Security
  ↓
AI Evaluation
  ↓
E2E
  ↓
Production smoke tests
```

Add:

-   regression suite
-   accessibility tests
-   performance tests
-   failure recovery tests
-   concurrent workflow tests

### Phase 4 acceptance criteria

-   Production deployment works from a clean environment.
-   CI blocks broken builds.
-   Critical workflows have E2E coverage.
-   Security tests pass.
-   Application has health checks.
-   Errors are observable.
-   Documentation allows another developer to run the project.
-   UI works in light and dark mode.
-   Lighthouse/performance and accessibility issues are reviewed.
-   No critical secrets or vulnerabilities remain.

------------------------------------------------------------------------

# 15. Testing Strategy

Testing is part of development, not Phase 4 only.

## Unit

Test:

-   permission functions
-   workflow state transitions
-   validation
-   tool authorization
-   risk classification
-   agent parsing
-   business rules

## Integration

Test:

-   database
-   Redis
-   worker
-   AI service
-   API
-   integrations

## E2E

Critical journey:

``` text
Signup
 ↓
Create organization
 ↓
Create agent
 ↓
Create workflow
 ↓
Run workflow
 ↓
Agent executes
 ↓
Approval requested
 ↓
User approves
 ↓
Tool executes
 ↓
Run completes
 ↓
Audit log visible
```

## Security

At minimum:

-   broken access control
-   IDOR/BOLA
-   tenant isolation
-   injection
-   authentication bypass
-   rate limiting
-   secret exposure
-   malicious tool calls
-   prompt injection

------------------------------------------------------------------------

# 16. Error Handling

Never expose raw internal errors to users.

Use structured error responses.

Example:

``` json
{
  "error": {
    "code": "WORKFLOW_EXECUTION_FAILED",
    "message": "The workflow could not complete.",
    "requestId": "req_123"
  }
}
```

User sees:

> Workflow failed. Retry or inspect the execution details.

Developer logs contain the actual diagnostic information.

------------------------------------------------------------------------

# 17. Observability

Every request gets:

``` text
request_id
organization_id
user_id
```

Every workflow gets:

``` text
workflow_run_id
```

Every task gets:

``` text
task_id
```

Every tool call gets:

``` text
tool_call_id
```

This creates a trace:

``` text
Request
 ↓
Workflow Run
 ↓
Task
 ↓
Agent
 ↓
Tool Call
 ↓
External API
```

------------------------------------------------------------------------

# 18. Performance Targets

Treat these as engineering goals, not fake guaranteed numbers.

Aim for:

-   fast initial dashboard load
-   immediate visual feedback for actions
-   paginated large datasets
-   WebSocket/SSE updates instead of polling where appropriate
-   background processing for long AI tasks
-   indexed database queries
-   bounded AI execution
-   graceful degradation if an AI provider is unavailable

Track real measurements after deployment.

------------------------------------------------------------------------

# 19. Git Strategy

Recommended structure:

``` text
agentflow/
├── apps/
│   ├── web/
│   ├── api/
│   └── ai-service/
│
├── packages/
│   ├── ui/
│   ├── types/
│   ├── config/
│   └── validation/
│
├── infrastructure/
│   ├── docker/
│   └── deployment/
│
├── docs/
│   ├── architecture.md
│   ├── threat-model.md
│   ├── api.md
│   └── ai-evaluation.md
│
├── tests/
│   ├── e2e/
│   └── security/
│
├── docker-compose.yml
├── README.md
└── AGENTS.md
```

Commit style:

``` text
feat: add workflow execution engine
feat: add human approval gates
fix: prevent cross-tenant workflow access
test: add workflow authorization tests
security: restrict database tool permissions
refactor: isolate agent orchestration
docs: add threat model
```

------------------------------------------------------------------------

# 20. Definition of Done

A feature is not complete until:

-   [ ] UI implemented
-   [ ] responsive behavior verified
-   [ ] loading state implemented
-   [ ] error state implemented
-   [ ] backend validation implemented
-   [ ] authorization implemented
-   [ ] database migration added
-   [ ] unit tests added
-   [ ] integration tests added where appropriate
-   [ ] E2E coverage added for critical paths
-   [ ] security implications reviewed
-   [ ] logs/observability added where needed
-   [ ] documentation updated
-   [ ] CI passes

------------------------------------------------------------------------

# 21. Portfolio / Resume Deliverables

The final project should contain:

1.  Live production deployment
2.  Public GitHub repository
3.  High-quality README
4.  Architecture diagram
5.  Threat model
6.  API documentation
7.  Database schema
8.  AI evaluation results
9.  Automated test suite
10. CI/CD pipeline
11. Docker setup
12. Short demo video

### Resume bullet target

> **Built AgentFlow, a multi-tenant AI workflow automation platform
> using Next.js, NestJS, FastAPI, PostgreSQL, Redis and LLM tool
> calling, implementing RBAC, human approval gates, secure tool
> execution, asynchronous workflows, audit logging and automated
> security/E2E testing.**

Only claim metrics such as latency, accuracy, cost reduction, or test
coverage after measuring them.

------------------------------------------------------------------------

# 22. Ruthless Project Rules

### Do NOT build

-   generic ChatGPT clone
-   generic AI chat interface
-   fake multi-agent conversations
-   agents that only pass text between prompts
-   unrestricted AI tool access
-   dashboard full of meaningless charts
-   15 integrations before the core workflow works
-   excessive animations
-   UI that looks like an AI landing-page template

### DO build

-   deterministic workflow execution
-   real tool calls
-   permission boundaries
-   human approval
-   failure recovery
-   audit trails
-   tenant isolation
-   automated tests
-   security evaluation
-   real deployment
-   polished UX

------------------------------------------------------------------------

# 23. Final Build Order

``` text
PHASE 1
SaaS Foundation
Auth → Organizations → RBAC → UI → Database
                    ↓
PHASE 2
AI Engine
Agents → Orchestrator → Workflows → Queue → Live Runs
                    ↓
PHASE 3
Automation + Security
Tools → Permissions → Approvals → Audit → Security Tests
                    ↓
PHASE 4
Production
UX Polish → Observability → Performance → E2E → CI/CD → Deploy
```

## Final success criterion

The strongest demonstration is a live workflow where:

> A customer request enters AgentFlow → multiple specialized agents
> analyze it → the system retrieves verified information → the response
> is generated → a risky action is blocked by policy → a human approves
> it → the permitted tool executes → the complete execution is visible
> in a traceable audit timeline.

That single flow should be the centerpiece of the portfolio demo.
