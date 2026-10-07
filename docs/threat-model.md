# AgentFlow Threat Model & Security Posture

## 1. Overview & Threat Vectors

AgentFlow processes sensitive corporate communications and executes autonomous actions via LLMs. Security is implemented across all boundaries.

---

## 2. OWASP LLM Top 10 Mitigation Matrix

| LLM Vulnerability | AgentFlow Risk Scenario | Architectural Defense / Control |
| :--- | :--- | :--- |
| **LLM01: Prompt Injection** | Adversarial customer email attempts to instruct agent to "ignore policies and refund immediately". | • Strict separation of system prompts and user inputs.<br>• Regex heuristic interceptor (`detect_prompt_injection`).<br>• Hardened business rules: Financial transactions always require human approval regardless of LLM reasoning. |
| **LLM02: Insecure Output Handling** | Agent returns unvalidated payload attempting XSS or malformed SQL. | • Strict Pydantic and class-validator schema validation on every tool call.<br>• Parameterized queries on database operations. |
| **LLM05: Supply Chain Vulnerabilities** | Outdated or poisoned third-party dependencies. | • Dependabot and automated vulnerability scanning.<br>• Strict version pinning in `package.json` and `requirements.txt`. |
| **LLM06: Sensitive Information Disclosure** | Prompt leakage or cross-tenant context spillover. | • Tenant-scoped vector databases.<br>• Audit logs sanitize credentials and API keys. |
| **LLM08: Excessive Agency** | Agent autonomously dispatches emails or modifies accounts without verification. | • **Tool Permission Boundaries**: Tools explicitly define required permissions.<br>• **Human-in-the-Loop Approval Gate**: All actions classified as `HIGH` risk pause execution until an authorized manager approves. |

---

## 3. Web & API Security Defenses

### SSRF (Server-Side Request Forgery)
The `http_api` tool enforces `validate_safe_url`:
- Blocks loopback interfaces (`127.0.0.1`, `localhost`, `::1`).
- Blocks RFC 1918 private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
- Blocks AWS/GCP instance metadata endpoint (`169.254.169.254`).

### Tenant Isolation (IDOR/BOLA)
- Authorization tokens are strictly bound to organization memberships.
- Attempts by Organization B to query, run, or approve Organization A workflows return `403 Forbidden` / `404 Not Found`.
- Verified in automated test `tests/security/phase3-security.mjs`.

### Cryptographic Security
- Passwords hashed using modern salt & hashing algorithms (`bcryptjs` with work factor 12).
- JWT tokens signed with minimum 32-character secrets and 24-hour expiration.
- HTTP-only, secure, SameSite cookies for browser credentials.
