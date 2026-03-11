// Test script to verify API endpoints are accessible
const http = require('http');
const https = require('https');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function testAPIEndpoints() {
  console.log('🔧 Testing API Endpoints...\n');

  const baseUrl = 'http://localhost:3000';
  const endpoints = [
    '/api/admin/content/drafts/all',
    '/api/admin/content/drafts',
    '/api/admin/content/drafts?status=pending_approval',
    '/api/admin/content/drafts?status=approved',
    '/api/admin/content/drafts?status=rejected',
    '/api/admin/content/drafts?status=draft'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Testing: ${endpoint}`);
      
      const response = await makeRequest(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(`   Status: ${response.status}`);
      
      if (response.status === 200) {
        try {
          const data = JSON.parse(response.data);
          console.log(`   ✅ Success: ${data.success ? 'true' : 'false'}`);
          console.log(`   📊 Drafts count: ${data.drafts ? data.drafts.length : 0}`);
        } catch (parseError) {
          console.log(`   ⚠️  Response not JSON: ${response.data.substring(0, 100)}...`);
        }
      } else if (response.status === 401) {
        console.log(`   🔐 Authentication required (expected)`);
      } else if (response.status === 500) {
        console.log(`   ❌ Server Error: ${response.data.substring(0, 200)}...`);
      } else {
        console.log(`   ❓ Unexpected status: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Request failed: ${error.message}`);
    }
    
    console.log('');
  }

  console.log('📋 Test Summary:');
  console.log('• If you see 401 errors, the endpoints are working but require authentication');
  console.log('• If you see 500 errors, check the server logs for details');
  console.log('• If you see 200 errors, the endpoints are working correctly');
}

// Only run if server is running
testAPIEndpoints().catch(console.error);
