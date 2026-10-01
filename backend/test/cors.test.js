const { test } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');

test('central CORS allows local Vite ports and preserves deployment restrictions', async () => {
  const keys = ['NODE_ENV', 'VERCEL', 'CLIENT_URL'];
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  async function preflight(origin, endpoint = 'forgot-password') {
    return fetch(`${base}/api/auth/${endpoint}`, {
      method: 'OPTIONS',
      headers: { Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' },
    });
  }
  try {
    delete process.env.NODE_ENV;
    delete process.env.VERCEL;
    process.env.CLIENT_URL = 'https://devpilot-test.vercel.app';
    for (const endpoint of ['forgot-password', 'verify-password-reset-otp', 'reset-password', 'login', 'signup', 'verify-email']) {
      const response = await preflight('http://localhost:5174', endpoint);
      assert.equal(response.status, 204);
      assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:5174');
      assert.equal(response.headers.get('access-control-allow-credentials'), 'true');
      assert.match(response.headers.get('access-control-allow-methods'), /POST/);
      assert.match(response.headers.get('access-control-allow-headers'), /content-type/i);
      assert.match(response.headers.get('vary'), /Origin/);
    }
    assert.equal((await preflight('http://localhost:5173')).headers.get('access-control-allow-origin'), 'http://localhost:5173');
    // Health avoids database access while exercising the same central origin policy.
    async function checkOrigin(origin, expected) {
      const response = await fetch(`${base}/api/health`, { headers: { Origin: origin } });
      assert.equal(response.headers.get('access-control-allow-origin'), expected);
    }
    for (const origin of ['https://untrusted.example', 'http://localhost:9999', 'http://localhost.evil.example:5174']) {
      await checkOrigin(origin, null);
    }
    process.env.NODE_ENV = 'production';
    await checkOrigin('http://localhost:5174', null);
    await checkOrigin('http://localhost:5173', null);
    await checkOrigin('https://devpilot-test.vercel.app', 'https://devpilot-test.vercel.app');
    const productionPreflight = await preflight('https://devpilot-test.vercel.app');
    assert.equal(productionPreflight.status, 204);
    assert.equal(productionPreflight.headers.get('access-control-allow-origin'), 'https://devpilot-test.vercel.app');
    delete process.env.NODE_ENV;
    process.env.VERCEL = '1';
    await checkOrigin('http://localhost:5174', null);
    await checkOrigin('https://devpilot-test.vercel.app', 'https://devpilot-test.vercel.app');
    delete process.env.CLIENT_URL;
    await checkOrigin('http://localhost:5173', null);
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
    await new Promise((resolve) => server.close(resolve));
  }
});
