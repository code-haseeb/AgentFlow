# AgentFlow REST API Specification

**Base URL:** `http://localhost:4000/api`

---

## 1. Authentication Endpoints

### Register New User & Workspace
* **POST** `/auth/register`
* **Request:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@company.com",
    "password": "SecurePassword123!",
    "organizationName": "Acme Technologies"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "tokens": { "accessToken": "eyJhbG...", "expiresIn": 86400 },
    "user": { "id": "uuid", "email": "jane@company.com", "name": "Jane Doe" },
    "currentOrganization": { "id": "uuid", "name": "Acme Technologies", "slug": "acme-1234" },
    "role": "OWNER"
  }
  ```

### User Login
* **POST** `/auth/login`
* **Request:**
  ```json
  { "email": "jane@company.com", "password": "SecurePassword123!" }
  ```

### Active Session Context
* **GET** `/auth/me`
* **Headers:** `Authorization: Bearer <token>`, `x-organization-id: <orgId>`

---

## 2. Workflows & Execution Runs

### List Organization Workflows
* **GET** `/workflows`
* **Headers:** `Authorization: Bearer <token>`, `x-organization-id: <orgId>`
* **Access:** `VIEWER+`

### Create Workflow
* **POST** `/workflows`
* **Headers:** `Authorization: Bearer <token>`, `x-organization-id: <orgId>`
* **Access:** `MANAGER+`
* **Request:**
  ```json
  {
    "name": "AI Customer Support Pipeline",
    "description": "Multi-agent classification, RAG lookup, and policy gate"
  }
  ```

### Trigger Pipeline Execution
* **POST** `/workflows/:id/runs`
* **Headers:** `Authorization: Bearer <token>`, `x-organization-id: <orgId>`
* **Access:** `ANALYST+`
* **Request:**
  ```json
  {
    "inquiryText": "I was charged $299 on invoice #INV-9281. Please refund immediately.",
    "customerEmail": "customer@acme.com"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "id": "run-uuid",
    "status": "WAITING_FOR_APPROVAL",
    "output": {
      "risk_level": "HIGH",
      "steps": [ ... ],
      "final_output": { ... }
    }
  }
  ```

### Human Approval Decision
* **POST** `/runs/:id/approve`
* **Headers:** `Authorization: Bearer <token>`, `x-organization-id: <orgId>`
* **Access:** `MANAGER+`
* **Request:**
  ```json
  { "comment": "Approved per 30-day money back guarantee" }
  ```

### Reject Execution
* **POST** `/runs/:id/reject`
* **Access:** `MANAGER+`
* **Request:**
  ```json
  { "reason": "Refund limit exceeded without executive approval" }
  ```

---

## 3. Auditing & Tools

### Query Organization Audit Trail
* **GET** `/audit-logs?limit=50`
* **Access:** `ANALYST+`

### List Permitted Tools
* **GET** `/tools`
* **Access:** `VIEWER+`
