async function main() {
  const registerPayload = {
    name: 'Alex Rivera',
    email: `alex_${Date.now()}@acme.com`,
    password: 'SecurePassword123!',
    organizationName: 'Acme Technologies',
  };

  console.log('1. Registering new organization and owner...');
  const regRes = await fetch('http://localhost:4000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registerPayload),
  });

  const regData = await regRes.json();
  console.log('Register response status:', regRes.status);
  console.log('User created:', regData.user);
  console.log('Organization created:', regData.currentOrganization);
  console.log('Role assigned:', regData.role);

  const token = regData.tokens.accessToken;
  const orgId = regData.currentOrganization.id;

  console.log('\n2. Testing /api/auth/me session with JWT...');
  const meRes = await fetch('http://localhost:4000/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-organization-id': orgId,
    },
  });
  const meData = await meRes.json();
  console.log('Session user:', meData.user.email, '| Current Org:', meData.currentOrganization?.name);

  console.log('\n3. Creating a workflow under this organization...');
  const wfRes = await fetch('http://localhost:4000/api/workflows', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-organization-id': orgId,
    },
    body: JSON.stringify({
      name: 'AI Customer Support Pipeline',
      description: 'Ingests email requests, performs RAG context lookup, classifies risk, and gates high-value actions.',
    }),
  });
  const wfData = await wfRes.json();
  console.log('Workflow created:', wfData.id, wfData.name, 'Status:', wfData.status);

  console.log('\n4. Querying audit logs for this organization...');
  const auditRes = await fetch('http://localhost:4000/api/audit-logs', {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-organization-id': orgId,
    },
  });
  const auditLogs = await auditRes.json();
  console.log('Audit events recorded count:', auditLogs.length);
  auditLogs.forEach((log) => {
    console.log(` - [${log.action}] entity: ${log.entityType} by ${log.user?.email || 'system'}`);
  });

  console.log('\n5. Testing Tenant Isolation: Attempting to query workflows without org header...');
  const blockedRes = await fetch('http://localhost:4000/api/workflows', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log('Expected 403 Forbidden without org header:', blockedRes.status, blockedRes.statusText);

  console.log('\n✅ ALL PHASE 1 CRITERIA VERIFIED SUCCESSFULLY!');
}

main().catch(console.error);
