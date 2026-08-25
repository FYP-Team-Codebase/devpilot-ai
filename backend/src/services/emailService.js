const nodemailer = require("nodemailer");

const isTrue = (value) => ["true", "1", "yes"].includes(String(value).toLowerCase());

const createTransporter = () => {
  const port = Number(process.env.EMAIL_PORT || 587);
  const secure =
    process.env.EMAIL_SECURE === undefined ? port === 465 : isTrue(process.env.EMAIL_SECURE);

  if (
    !process.env.EMAIL_HOST ||
    !port ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASSWORD ||
    !process.env.EMAIL_FROM
  ) {
    throw new Error("Email service is not configured");
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port,
    secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

const escapeHtml = (value) => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const buildVerificationEmail = ({ name, verificationCode, expiresInMinutes }) => {
  const safeName = escapeHtml(name || "there");
  const safeCode = escapeHtml(verificationCode);
  const safeExpiry = escapeHtml(expiresInMinutes);

  return {
    subject: "Verify your DevPilot AI account",
    text: [
      `Hello ${name || "there"},`,
      "",
      "Welcome to DevPilot AI by CodeNova.",
      "",
      `Your 6-digit verification code is: ${verificationCode}`,
      "",
      `This code will expire in ${expiresInMinutes} minutes.`,
      "",
      "Enter this code on the DevPilot AI email verification page to finish creating your account.",
      "",
      "If you did not create this account, you can ignore this email.",
      "",
      "CodeNova",
      "DevPilot AI",
    ].join("\n"),
    html: `
      <div style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#111111;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#f5f5f5;">
          <tr>
            <td align="center" style="padding:32px 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;border-collapse:collapse;background:#ffffff;border:1px solid #dfdfdf;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:28px 30px 18px;border-bottom:1px solid #eeeeee;">
                    <div style="font-size:13px;line-height:1.2;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#111111;">CodeNova</div>
                    <div style="margin-top:6px;font-size:22px;line-height:1.25;font-weight:700;color:#111111;">DevPilot AI email verification</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px 30px 30px;">
                    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#333333;">Hello ${safeName},</p>
                    <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#333333;">Use this 6-digit code to verify your email address and finish creating your DevPilot AI account.</p>
                    <div style="margin:24px 0;padding:18px 20px;border:1px solid #111111;border-radius:10px;background:#fafafa;text-align:center;">
                      <div style="font-family:Consolas,Menlo,monospace;font-size:34px;line-height:1.1;font-weight:700;letter-spacing:10px;color:#111111;">${safeCode}</div>
                    </div>
                    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#555555;">This code expires in ${safeExpiry} minutes. Request a new code if it expires.</p>
                    <p style="margin:0;font-size:13px;line-height:1.6;color:#777777;">If you did not create this account, you can ignore this email.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `,
  };
};

const sendVerificationEmail = async ({
  recipient,
  name,
  verificationCode,
  expiresInMinutes,
}) => {
  const transporter = createTransporter();
  const message = buildVerificationEmail({
    name,
    verificationCode,
    expiresInMinutes,
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: recipient,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
};

module.exports = {
  sendVerificationEmail,
};
