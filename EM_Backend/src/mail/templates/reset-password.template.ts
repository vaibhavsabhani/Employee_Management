export const passwordResetTemplate = (resetLink: string): string => `
  <div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden;box-shadow:0 16px 40px rgba(15,23,42,0.08);">
        <div style="padding:32px 32px 24px;background:linear-gradient(135deg,#0f172a 0%,#1d4ed8 55%,#38bdf8 100%);color:#ffffff;">
          <div style="display:inline-block;padding:6px 12px;border-radius:999px;background:rgba(255,255,255,0.15);font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
            Employee Management System
          </div>
          <h1 style="margin:18px 0 8px;font-size:28px;line-height:1.2;">Reset your password</h1>
          <p style="margin:0;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.92);">
            We received a request to reset your account password. Use the button below to choose a new one.
          </p>
        </div>

        <div style="padding:32px;">
          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#334155;">
            If you did not request this, you can safely ignore this email. Your current password will remain unchanged.
          </p>

          <div style="text-align:center;margin:28px 0;">
            <a href="${resetLink}" style="display:inline-block;padding:14px 28px;background:#1d4ed8;color:#ffffff;text-decoration:none;border-radius:12px;font-size:15px;font-weight:700;box-shadow:0 12px 24px rgba(29,78,216,0.22);">
              Reset Password
            </a>
          </div>

          <div style="padding:16px 18px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#0f172a;">This link expires in 15 minutes.</p>
            <p style="margin:0;font-size:13px;line-height:1.7;color:#475569;word-break:break-all;">
              If the button does not work, copy and paste this URL into your browser:<br />
              <a href="${resetLink}" style="color:#1d4ed8;">${resetLink}</a>
            </p>
          </div>
        </div>
      </div>

      <p style="margin:16px 0 0;text-align:center;font-size:12px;line-height:1.6;color:#64748b;">
        Employee Management System • Security notification
      </p>
    </div>
  </div>
`;
