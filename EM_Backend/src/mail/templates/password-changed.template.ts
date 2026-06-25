export const passwordChangedTemplate = (
  name: string,
  email: string,
  newPassword: string,
): string => `
  <div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden;box-shadow:0 16px 40px rgba(15,23,42,0.08);">

        <div style="padding:32px 32px 24px;background:linear-gradient(135deg,#0f172a 0%,#1d4ed8 55%,#38bdf8 100%);color:#ffffff;">
          <div style="display:inline-block;padding:6px 12px;border-radius:999px;background:rgba(255,255,255,0.15);font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
            Employee Management System
          </div>
          <h1 style="margin:18px 0 8px;font-size:28px;line-height:1.2;">Password Changed</h1>
          <p style="margin:0;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.92);">
            Your account password has been updated successfully.
          </p>
        </div>

        <div style="padding:32px;">
          <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#334155;">
            Hi <strong>${name}</strong>,
          </p>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#334155;">
            This is a confirmation that your password was successfully changed. Here are your updated login credentials:
          </p>

          <div style="padding:20px 24px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;width:110px;">Email</td>
                <td style="padding:8px 0;font-size:14px;color:#0f172a;font-family:monospace;">${email}</td>
              </tr>
              <tr style="border-top:1px solid #e2e8f0;">
                <td style="padding:8px 0;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">New Password</td>
                <td style="padding:8px 0;font-size:14px;color:#0f172a;font-family:monospace;font-weight:700;letter-spacing:0.08em;">${newPassword}</td>
              </tr>
            </table>
          </div>

          <div style="padding:16px 18px;background:#fef2f2;border:1px solid #fecaca;border-radius:14px;margin-bottom:24px;">
            <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#991b1b;">Wasn't you?</p>
            <p style="margin:0;font-size:13px;line-height:1.7;color:#7f1d1d;">
              If you did not make this change, please contact your administrator immediately.
            </p>
          </div>
        </div>
      </div>

      <p style="margin:16px 0 0;text-align:center;font-size:12px;line-height:1.6;color:#64748b;">
        Employee Management System &bull; Security notification
      </p>
    </div>
  </div>
`;
