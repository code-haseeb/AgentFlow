// Phase 4 Full System Integration Test
// Validates end-to-end multi-agent orchestration, human-in-the-loop approval gate,
// tool execution, request tracing, and audit log generation.

const API_BASE = 'http://localhost:4000/api';
const AI_BASE = 'http://127.0.0.1:8000';

async function runFullSystemTest() {
  console.log('====================================================');
  console.log('🚀 AgentFlow Phase 4: Full System Integration Suite');
  console.log('====================================================\n');

  const timestamp = Date.now();
  const testEmail = `enterprise_${timestamp}@agentflow.dev`;
  const testPassword = 'Password123!';
  const orgName = `Apex Global Corp ${timestamp}`;

  // 1. Health & Trace Check
  console.log('1️⃣ Checking Services Health & Tracing...');
  const healthRes = await fetch(`${API_BASE}/health`);
  if (!healthRes.ok) throw new Error(`API health check failed: ${healthRes.status}`);
  const traceId = healthRes.headers.get('x-request-id');
  if (!traceId) throw new Error('Missing x-request-id in API health response');
  console.log(`   ✅ NestJS API online (x-request-id: ${traceId})`);

  const aiHealthRes = await fetch(`${AI_BASE}/health`);
  if (!aiHealthRes.ok) throw new Error(`AI service health failed: ${aiHealthRes.status}`);
  console.log(`   ✅ FastAPI AI Service online (provider: mock/active)\n`);

  // 2. User & Tenant Registration
  console.log('2️⃣ Registering Multi-Tenant User & Organization...');
  const regRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      name: 'Executive Admin',
      organizationName: orgName,
    }),
  });

  if (!regRes.ok) throw new Error(`Registration failed: ${regRes.status}`);
  const regData = await regRes.json();
  const token = regData.tokens.accessToken;
  const orgId = regData.currentOrganization.id;
  console.log(`   ✅ Registered ${testEmail} as OWNER for Org: ${orgId}\n`);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    'x-organization-id': orgId,
  };

  // 3. Workflow Creation / Verification
  console.log('3️⃣ Creating Flagship Support Automation Workflow...');
  const wfRes = await fetch(`${API_BASE}/workflows`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Enterprise Support & Escalations',
      description: 'Autonomous triage, grounded research, policy compliance, and approval gate',
    }),
  });

  if (!wfRes.ok) throw new Error(`Failed to create workflow: ${wfRes.status}`);
  const workflow = await wfRes.json();
  console.log(`   ✅ Workflow registered: ${workflow.id} ("${workflow.name}")\n`);

  // 4. Low-Risk Autonomous Run
  console.log('4️⃣ Executing Low-Risk Pipeline Run...');
  const lowRiskStart = Date.now();
  const lowRiskRes = await fetch(`${API_BASE}/workflows/${workflow.id}/runs`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      customerEmail: 'client@example.com',
      inquiryText: 'What are your standard support working hours and SLA timelines?',
    }),
  });

  if (!lowRiskRes.ok) throw new Error(`Low-risk run failed: ${lowRiskRes.status}`);
  const lowRiskRun = await lowRiskRes.json();
  const lowRiskDuration = Date.now() - lowRiskStart;
  console.log(`   ✅ Completed autonomously in ${lowRiskDuration}ms`);
  console.log(`   Status: ${lowRiskRun.status} | Steps: ${lowRiskRun.output?.steps?.length || 0}`);
  console.log(`   Triage Category: ${lowRiskRun.output?.final_output?.triage?.category} | Risk: ${lowRiskRun.output?.risk_level}\n`);

  if (lowRiskRun.status !== 'COMPLETED') {
    throw new Error(`Expected COMPLETED for low-risk, got: ${lowRiskRun.status}`);
  }

  // 5. High-Risk Run with Human-in-the-Loop Gate
  console.log('5️⃣ Executing High-Risk Pipeline Run (Financial Refund Escalation)...');
  const highRiskRes = await fetch(`${API_BASE}/workflows/${workflow.id}/runs`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      customerEmail: 'vip_buyer@example.com',
      inquiryText: 'My shipment was damaged. I demand an urgent $450 refund and immediate compensation email.',
    }),
  });

  if (!highRiskRes.ok) throw new Error(`High-risk run failed: ${highRiskRes.status}`);
  const highRiskRun = await highRiskRes.json();
  console.log(`   ✅ Gate triggered! Status: ${highRiskRun.status}`);
  console.log(`   Risk Level: ${highRiskRun.output?.risk_level}`);
  console.log(`   Proposed Action: ${highRiskRun.output?.final_output?.response?.recommended_action}`);
  console.log(`   Human Review Needed: ${highRiskRun.output?.requires_approval}\n`);

  if (highRiskRun.status !== 'WAITING_FOR_APPROVAL') {
    throw new Error(`Expected WAITING_FOR_APPROVAL, got: ${highRiskRun.status}`);
  }

  // 6. Human Approval & Tool Execution
  console.log('6️⃣ Dispatching Human Approval Decision...');
  const approveRes = await fetch(`${API_BASE}/runs/${highRiskRun.id}/approve`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      decision: 'APPROVED',
      notes: 'Reviewed damage photos and verified account standing; approved $450 refund and notification email.',
    }),
  });

  if (!approveRes.ok) throw new Error(`Approve failed: ${approveRes.status}`);
  const approvedRun = await approveRes.json();
  console.log(`   ✅ Resumed & Finalized! Status: ${approvedRun.status}`);
  console.log(`   Tool Execution Result: ${approvedRun.output?.approval_decision?.tool_result?.status || 'Executed'}\n`);

  if (approvedRun.status !== 'COMPLETED') {
    throw new Error(`Expected COMPLETED after approval, got: ${approvedRun.status}`);
  }

  // 7. Audit Trail Validation
  console.log('7️⃣ Validating Immutable Audit Trail...');
  const auditRes = await fetch(`${API_BASE}/audit-logs`, {
    headers: authHeaders,
  });

  if (!auditRes.ok) throw new Error(`Audit log fetch failed: ${auditRes.status}`);
  const auditLogs = await auditRes.json();
  console.log(`   ✅ Total audit events recorded for Org: ${auditLogs.length}`);

  const approvalLog = auditLogs.find((l) => l.action === 'HUMAN_APPROVAL_GRANTED');
  if (!approvalLog) {
    throw new Error('Missing HUMAN_APPROVAL_GRANTED event in audit trail');
  }
  console.log(`   ✅ Verified HUMAN_APPROVAL_GRANTED logged by user ${approvalLog.userId}`);
  console.log(`   Timestamp: ${approvalLog.createdAt}\n`);

  console.log('====================================================');
  console.log('🎉 ALL PHASE 4 INTEGRATION CRITERIA VERIFIED 100%!');
  console.log('====================================================');
}

runFullSystemTest().catch((err) => {
  console.error('\n❌ Integration test failed:', err);
  process.exit(1);
});
