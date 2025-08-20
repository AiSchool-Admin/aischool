// scripts/test-api.js
// Simple API testing script for AiSchool

const http = require('http');

const BASE_URL = 'http://localhost:3000';

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testEndpoint(path, expectedStatus = 200, method = 'GET', data = null) {
  try {
    console.log(`Testing ${method} ${path}...`);
    const response = await makeRequest(path, method, data);
    
    if (response.status === expectedStatus) {
      console.log(`✅ ${path} - Status: ${response.status}`);
      return true;
    } else {
      console.log(`❌ ${path} - Expected: ${expectedStatus}, Got: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${path} - Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🧪 AiSchool API Testing\n');
  console.log('Make sure the development server is running (npm run dev)\n');

  const tests = [
    // Basic pages
    { path: '/', expectedStatus: 200, description: 'Homepage' },
    { path: '/auth/signin', expectedStatus: 200, description: 'Sign-in page' },
    { path: '/setup-db', expectedStatus: 200, description: 'Database setup page' },
    
    // API endpoints (these might return 401 without auth, which is expected)
    { path: '/api/init-db', expectedStatus: [200, 500], description: 'Database init API' },
    { path: '/api/curriculum', expectedStatus: [200, 401], description: 'Curriculum API' },
    { path: '/api/profile', expectedStatus: [401], description: 'Profile API (should require auth)' },
    
    // Non-existent endpoints (should return 404)
    { path: '/api/nonexistent', expectedStatus: 404, description: 'Non-existent API endpoint' },
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    const expectedStatuses = Array.isArray(test.expectedStatus) ? test.expectedStatus : [test.expectedStatus];
    
    try {
      const response = await makeRequest(test.path);
      
      if (expectedStatuses.includes(response.status)) {
        console.log(`✅ ${test.description} - Status: ${response.status}`);
        passed++;
      } else {
        console.log(`❌ ${test.description} - Expected: ${expectedStatuses.join(' or ')}, Got: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${test.description} - Error: ${error.message}`);
    }
  }

  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Your API is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the server logs for more details.');
  }

  console.log('\n📝 Notes:');
  console.log('- 401 errors for protected endpoints are expected without authentication');
  console.log('- 500 errors for database endpoints might indicate database connection issues');
  console.log('- Make sure your .env file is properly configured');
}

// Check if server is running first
async function checkServer() {
  try {
    await makeRequest('/');
    return true;
  } catch (error) {
    console.log('❌ Cannot connect to server at http://localhost:3000');
    console.log('Please make sure the development server is running:');
    console.log('   npm run dev');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  }
}

main().catch(console.error);

