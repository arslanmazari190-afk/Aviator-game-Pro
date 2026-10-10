async function test() {
  console.log('--- 1. Testing Health Endpoint ---');
  const healthRes = await fetch('http://localhost:5000/api/health');
  const healthData = await healthRes.json();
  console.log('Health Response:', healthData);

  console.log('\n--- 2. Testing Recent Rounds Endpoint ---');
  const roundsRes = await fetch('http://localhost:5000/api/game/recent-rounds');
  const roundsData = await roundsRes.json();
  console.log('Recent rounds count:', roundsData.rounds.length);
  console.log('Sample Round Multiplier:', roundsData.rounds[0].crash_multiplier + 'x');

  console.log('\n--- 3. Testing Provably Fair Verification API ---');
  const verifyRes = await fetch('http://localhost:5000/api/game/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      serverSeed: '8cf5e640438f2e2e6b7ab4da1d980c42a56a13a7aeaf272f977ba9bee532be30',
      clientSeed: 'test_client_seed',
      nonce: 1025
    })
  });
  const verifyData = await verifyRes.json();
  console.log('Provably Fair Verification Result:', verifyData);

  console.log('\n--- 4. Testing 1-Click Demo Login ---');
  const demoLoginRes = await fetch('http://localhost:5000/api/auth/demo-login', { method: 'POST' });
  const demoLoginData = await demoLoginRes.json();
  console.log('Demo Login:', demoLoginData.user.username, 'Balance PKR:', demoLoginData.user.balance_pkr, 'Token:', demoLoginData.token.substring(0, 20) + '...');

  console.log('\n--- 5. Testing EasyPaisa Deposit ---');
  const depositRes = await fetch('http://localhost:5000/api/wallet/deposit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${demoLoginData.token}`
    },
    body: JSON.stringify({
      gateway: 'EASYPAISA',
      amount: 5000,
      currency: 'PKR',
      accountNumber: '03001234567',
      accountTitle: 'Lucky Aviator'
    })
  });
  const depositData = await depositRes.json();
  console.log('EasyPaisa Deposit Result:', depositData);

  console.log('\nAll API and Provably Fair tests completed successfully!');
}

test().catch(console.error);
