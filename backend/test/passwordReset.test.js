const { test, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');
const User = require('../src/models/User');
const emailService = require('../src/services/emailService');

// Exercise the actual router/controllers and bcrypt without real accounts or SMTP.
let user;
let sent;
let failEmail;
let failDatabase;
const originals = { findOne: User.findOne, findOneAndUpdate: User.findOneAndUpdate, updateOne: User.updateOne, rawFind: User.collection.findOne, send: emailService.sendPasswordResetEmail };
const previousSecret = process.env.JWT_SECRET;
process.env.JWT_SECRET = 'password-reset-test-only-secret';
function matches(filter) {
  return user && Object.entries(filter).every(([key, value]) => {
    if (key === '$or') return value.some(matches);
    const actual = user[key];
    if (value && typeof value === 'object' && !(value instanceof Date)) {
      return Object.entries(value).every(([operator, expected]) => ({
        $gt: actual > expected, $lte: actual <= expected, $lt: actual < expected, $ne: actual !== expected,
      })[operator]);
    }
    return value === null ? actual == null : actual === value;
  });
}
function query(result) {
  const promise = Promise.resolve(result);
  promise.select = () => promise;
  return promise;
}
User.findOne = (filter) => {
  if (failDatabase) throw new Error('private database detail');
  return query(matches(filter) ? { ...user } : null);
};
User.findOneAndUpdate = (filter, update) => {
  if (failDatabase) throw new Error('private database detail');
  if (!matches(filter)) return query(null);
  Object.assign(user, update.$set || {});
  for (const [key, value] of Object.entries(update.$inc || {})) user[key] += value;
  return query({ ...user });
};
User.updateOne = async (filter, update) => {
  if (failDatabase) throw new Error('private database detail');
  if (!matches(filter)) return { modifiedCount: 0 };
  Object.assign(user, update.$set);
  return { modifiedCount: 1 };
};
User.collection.findOne = async () => ({ isEmailVerified: user.isEmailVerified });
emailService.sendPasswordResetEmail = async (message) => {
  if (failEmail) throw new Error('private SMTP detail');
  sent.push(message);
};
const app = express();
app.use(express.json());
app.use('/api/auth', require('../src/routes/authRoutes'));
app.get('/protected', require('../src/middleware/authMiddleware'), (_req, res) => res.json({ success: true }));
const server = app.listen(0, '127.0.0.1');
async function post(path, body) {
  if (!server.listening) await new Promise((resolve) => server.once('listening', resolve));
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  return { status: response.status, data: await response.json() };
}
async function authorize() {
  await post('forgot-password', { email: user.email });
  return post('verify-password-reset-otp', { email: user.email, otp: sent.at(-1).otp });
}
beforeEach(async () => {
  failEmail = false;
  failDatabase = false;
  sent = [];
  user = { _id: 'test-user', email: 'test@example.com', name: 'Test', password: await bcrypt.hash('old-password', 10), isEmailVerified: true, verificationCode: 'separate-email-code' };
});
after(async () => {
  await new Promise((resolve) => server.close(resolve));
  Object.assign(User, { findOne: originals.findOne, findOneAndUpdate: originals.findOneAndUpdate, updateOne: originals.updateOne });
  User.collection.findOne = originals.rawFind;
  emailService.sendPasswordResetEmail = originals.send;
  if (previousSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = previousSecret;
});

test('complete reset, hash storage, token isolation, login and single-use state', async () => {
  await post('forgot-password', { email: ' TEST@EXAMPLE.COM ' });
  const otp = sent[0].otp;
  assert.match(otp, /^\d{6}$/);
  assert.notEqual(user.passwordResetOtpHash, otp);
  assert.ok(await bcrypt.compare(otp, user.passwordResetOtpHash));
  assert.ok(user.passwordResetOtpExpiresAt - Date.now() <= 600000);
  const verified = await post('verify-password-reset-otp', { email: user.email, otp });
  assert.equal(verified.status, 200);
  const token = verified.data.resetToken;
  assert.match(token, /^[a-f0-9]{64}$/);
  assert.notEqual(user.passwordResetTokenHash, token);
  const protectedResponse = await fetch(`http://127.0.0.1:${server.address().port}/protected`, { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(protectedResponse.status, 401);
  assert.equal((await post('verify-password-reset-otp', { email: user.email, otp })).status, 400);
  assert.equal((await post('reset-password', { resetToken: token, newPassword: 'new-password' })).status, 200);
  assert.ok(await bcrypt.compare('new-password', user.password));
  assert.equal(await bcrypt.compare('old-password', user.password), false);
  for (const field of ['passwordResetOtpHash', 'passwordResetOtpExpiresAt', 'passwordResetTokenHash', 'passwordResetTokenExpiresAt', 'passwordResetSentAt']) assert.equal(user[field], null);
  assert.equal(user.verificationCode, 'separate-email-code');
  assert.equal((await post('reset-password', { resetToken: token, newPassword: 'other-password' })).status, 400);
  assert.equal((await post('login', { email: user.email, password: 'old-password' })).status, 401);
  const login = await post('login', { email: user.email, password: 'new-password' });
  assert.equal(login.status, 200);
  assert.equal(jwt.verify(login.data.token, process.env.JWT_SECRET).userId, user._id);
  assert.equal(login.data.user.password, undefined);
});

test('generic response for absent accounts, cooldown, delivery and database failures', async () => {
  const known = await post('forgot-password', { email: user.email });
  const absent = await post('forgot-password', { email: 'absent@example.com' });
  assert.deepEqual(known, absent);
  assert.equal(sent.length, 1);
  assert.deepEqual(await post('forgot-password', { email: user.email }), known);
  assert.equal(sent.length, 1);
  user.passwordResetSentAt = null;
  failEmail = true;
  assert.deepEqual(await post('forgot-password', { email: user.email }), known);
  assert.equal(user.passwordResetOtpHash, null);
  failDatabase = true;
  assert.deepEqual(await post('forgot-password', { email: user.email }), known);
});

test('attempt limit, expiration and replacement invalidate codes and authorizations', async () => {
  await post('forgot-password', { email: user.email });
  const otp = sent[0].otp;
  for (let i = 0; i < 5; i++) assert.equal((await post('verify-password-reset-otp', { email: user.email, otp: '000000' })).status, 400);
  assert.equal((await post('verify-password-reset-otp', { email: user.email, otp })).status, 400);
  user.passwordResetSentAt = null;
  await post('forgot-password', { email: user.email });
  user.passwordResetOtpExpiresAt = new Date(0);
  assert.equal((await post('verify-password-reset-otp', { email: user.email, otp: sent.at(-1).otp })).status, 400);
  user.passwordResetSentAt = null;
  const authorized = await authorize();
  user.passwordResetTokenExpiresAt = new Date(0);
  assert.equal((await post('reset-password', { resetToken: authorized.data.resetToken, newPassword: 'new-password' })).status, 400);
  user.passwordResetSentAt = null;
  const next = await authorize();
  user.passwordResetSentAt = null;
  await post('forgot-password', { email: user.email });
  assert.equal((await post('reset-password', { resetToken: next.data.resetToken, newPassword: 'new-password' })).status, 400);
});

test('malformed input and bypasses fail safely; policy matches signup', async () => {
  for (const email of [null, {}, 123, 'invalid']) assert.equal((await post('forgot-password', { email })).status, 400);
  assert.equal((await post('verify-password-reset-otp', { email: {}, otp: {} })).status, 400);
  assert.equal((await post('reset-password', { email: user.email, newPassword: 'new-password' })).status, 400);
  const authorized = await authorize();
  for (const newPassword of [null, {}, '', 'short']) assert.equal((await post('reset-password', { resetToken: authorized.data.resetToken, newPassword })).status, 400);
  assert.equal((await post('reset-password', { resetToken: authorized.data.resetToken, newPassword: '12345678' })).status, 200);
});

test('concurrent verification and reset each have only one successful consumer', async () => {
  await post('forgot-password', { email: user.email });
  const verify = () => post('verify-password-reset-otp', { email: user.email, otp: sent[0].otp });
  const results = await Promise.all([verify(), verify()]);
  assert.deepEqual(results.map((result) => result.status).sort(), [200, 400]);
  const token = results.find((result) => result.status === 200).data.resetToken;
  const reset = () => post('reset-password', { resetToken: token, newPassword: 'new-password' });
  const resets = await Promise.all([reset(), reset()]);
  assert.deepEqual(resets.map((result) => result.status).sort(), [200, 400]);
});

test('reset preserves email verification requirement and returns safe database errors', async () => {
  user.isEmailVerified = false;
  const authorized = await authorize();
  failDatabase = true;
  const failure = await post('reset-password', { resetToken: authorized.data.resetToken, newPassword: 'new-password' });
  assert.equal(failure.status, 500);
  assert.equal(JSON.stringify(failure).includes('private'), false);
  failDatabase = false;
  assert.equal((await post('reset-password', { resetToken: authorized.data.resetToken, newPassword: 'new-password' })).status, 200);
  assert.equal(user.isEmailVerified, false);
  const login = await post('login', { email: user.email, password: 'new-password' });
  assert.equal(login.status, 403);
  assert.equal(login.data.requiresEmailVerification, true);
});

test('app rejects malformed reset JSON without leaking parser details', async () => {
  const actualServer = require('../src/app').listen(0, '127.0.0.1');
  await new Promise((resolve) => actualServer.once('listening', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${actualServer.address().port}/api/auth/reset-password`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{invalid',
    });
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { success: false, message: 'Invalid request body.' });
  } finally {
    await new Promise((resolve) => actualServer.close(resolve));
  }
});
