const { test } = require('node:test');
const assert = require('node:assert/strict');
const nodemailer = require('nodemailer');
const { sendVerificationEmail, sendPasswordResetEmail, getSafeEmailError } = require('../src/services/emailService');

test('reset and verification reuse identical SMTP configuration; diagnostics exclude sensitive data', async () => {
  const keys = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_SECURE', 'EMAIL_USER', 'EMAIL_PASSWORD', 'EMAIL_FROM'];
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  const original = nodemailer.createTransport;
  const configurations = [];
  const messages = [];
  try {
    Object.assign(process.env, {
      EMAIL_HOST: 'smtp.example.invalid', EMAIL_PORT: '587', EMAIL_SECURE: 'false',
      EMAIL_USER: 'test-only', EMAIL_PASSWORD: 'test-only', EMAIL_FROM: 'sender@example.invalid',
    });
    nodemailer.createTransport = (configuration) => {
      configurations.push(configuration);
      return { sendMail: async (message) => { messages.push(message); return { accepted: [message.to] }; } };
    };
    await sendVerificationEmail({ recipient: 'test@example.invalid', name: 'Test', verificationCode: '123456', expiresInMinutes: 10 });
    const delivery = await sendPasswordResetEmail({ recipient: 'test@example.invalid', name: 'Test', otp: '123456', expiresInMinutes: 10 });
    assert.deepEqual(configurations[0], configurations[1]);
    assert.equal(messages[0].from, messages[1].from);
    assert.equal(messages[0].to, messages[1].to);
    assert.deepEqual(delivery, { accepted: true });
    assert.deepEqual(getSafeEmailError({ code: 'EAUTH', responseCode: 535, message: 'sensitive', response: 'sensitive', command: 'sensitive' }), {
      code: 'EAUTH', reason: 'SMTP authentication failed', smtpCode: 535,
    });
    assert.equal(JSON.stringify(getSafeEmailError({ code: 'sensitive' })).includes('sensitive'), false);
    delete process.env.EMAIL_PASSWORD;
    await assert.rejects(sendPasswordResetEmail({}), { code: 'ECONFIG' });
  } finally {
    nodemailer.createTransport = original;
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
});
