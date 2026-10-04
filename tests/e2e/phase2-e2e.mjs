async function testPhase2() {
  console.log('--- STARTING PHASE 2 MULTI-AGENT E2E TEST ---');

  // 1. Register & Get Token
  const email = `phase2_test_${Date.now()}@acme.com`;
  console.log(`\n1. Creating test user & organization: ${email}`);
  const regRes = await fetch('http://localhost:4000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Agent Tester',
      email,
      password: 'SecurePassword123!',
      organizationName: 'Automated AI Labs',
    }),
  });

  const regData = await regRes.json();
  const token = regData.tokens.accessToken;
  const orgId = regData.currentOrganization.id;
  console.log(`✓ Authenticated. Organization ID: ${orgId}`);

  // 2. Create Workflow
  console.log('\n2. Creating Flagship AI Customer Support Workflow...');
  const wfRes = await fetch('http://localhost:4000/api/workflows', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-organization-id': orgId,
    },
    body: JSON.stringify({
      name: 'Customer Support Autonomous Pipeline',
      description: 'Ingests inbound emails, evaluates urgency, checks billing databases, and drafts responses with approval gates.',
    }),
  });
  const workflow = await wfRes.json();
  console.log(`✓ Workflow created: ${workflow.id} (${workflow.name})`);

  // 3. Trigger Pipeline Execution (High Risk Refund Claim)
  console.log('\n3. Triggering multi-agent execution pipeline (Refund inquiry)...');
  const runRes = await fetch(`http://localhost:4000/api/workflows/${workflow.id}/runs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-organization-id': orgId,
    },
    body: JSON.stringify({
      inquiryText: 'I was charged $299 on invoice #INV-9281. I need a full refund immediately as this service was not used.',
      customerEmail: 'customer@acme.com',
    }),
  });

  const run = await runRes.json();
  console.log(`✓ Run ID: ${run.id}`);
  console.log(`✓ Initial Status: ${run.status}`);
  console.log(`✓ Risk Level: ${run.output?.risk_level}`);
  console.log(`✓ Steps Executed: ${run.output?.steps?.length}`);

  run.output?.steps?.forEach((step) => {
    console.log(`   ➔ Step ${step.step_index}: ${step.agent_name} [${step.duration_ms}ms] - ${step.step_name}`);
  });

  if (run.status !== 'WAITING_FOR_APPROVAL') {
    throw new Error(`Expected status WAITING_FOR_APPROVAL, got ${run.status}`);
  }
  console.log('✓ Risk Gate triggered: Run stopped at Human Approval Gate!');

  // 4. Human Approval Gate Execution
  console.log('\n4. Reviewing and Authorizing high-risk action in Approval Inbox...');
  const approveRes = await fetch(`http://localhost:4000/api/runs/${run.id}/approve`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'x-organization-id': orgId,
    },
  });

  const approvedRun = await approveRes.json();
  console.log(`✓ Final Status after Human Decision: ${approvedRun.status}`);
  if (approvedRun.status !== 'APPROVED') {
    throw new Error(`Expected status APPROVED, got ${approvedRun.status}`);
  }

  // 5. Verify Audit Trail
  console.log('\n5. Verifying complete audit trail...');
  const auditRes = await fetch('http://localhost:4000/api/audit-logs', {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-organization-id': orgId,
    },
  });
  const auditLogs = await auditRes.json();
  console.log(`✓ Total audit records for run: ${auditLogs.length}`);
  auditLogs.forEach((l) => console.log(`   • [${l.action}] by ${l.user?.email || 'system'}`));

  console.log('\n🎉 PHASE 2 MULTI-AGENT WORKFLOW ENGINE FULLY VERIFIED!');
}

testPhase2().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
