export const employeeCreatedTemplate = (
  employeeName: string,
  email: string,
  password: string,
  loginUrl: string,
): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Employee Account Created</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f7fb;padding:32px 16px;">
    <tr>
      <td align="center">

        <table width="640" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td
              style="
                background-color:#1d4ed8;
                padding:32px;
                color:#ffffff;
              "
            >
              <div
                style="
                  display:inline-block;
                  background:#3b82f6;
                  color:#ffffff;
                  padding:6px 12px;
                  border-radius:20px;
                  font-size:12px;
                  font-weight:bold;
                  text-transform:uppercase;
                "
              >
                Employee Management System
              </div>

              <h1
                style="
                  margin:20px 0 10px;
                  font-size:28px;
                  line-height:1.3;
                  color:#ffffff;
                "
              >
                Welcome to the Team
              </h1>

              <p
                style="
                  margin:0;
                  font-size:15px;
                  line-height:1.7;
                  color:#e2e8f0;
                "
              >
                Your employee account has been created successfully.
                You can now log in using the credentials below.
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px;">

              <p
                style="
                  margin:0 0 20px;
                  font-size:15px;
                  line-height:1.7;
                  color:#334155;
                "
              >
                Hello <strong>${employeeName}</strong>,
              </p>

              <p
                style="
                  margin:0 0 24px;
                  font-size:15px;
                  line-height:1.7;
                  color:#334155;
                "
              >
                An account has been created for you in the Employee Management System.
                Please use the following credentials to sign in.
              </p>

              <!-- Credentials Box -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  background:#f8fafc;
                  border:1px solid #e2e8f0;
                  border-radius:12px;
                  padding:20px;
                "
              >
                <tr>
                  <td
                    style="
                      padding:10px 0;
                      font-weight:bold;
                      color:#0f172a;
                      width:120px;
                    "
                  >
                    Email
                  </td>
                  <td
                    style="
                      padding:10px 0;
                      color:#475569;
                    "
                  >
                    ${email}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding:10px 0;
                      font-weight:bold;
                      color:#0f172a;
                    "
                  >
                    Password
                  </td>
                  <td
                    style="
                      padding:10px 0;
                      color:#475569;
                    "
                  >
                    ${password}
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  margin-top:24px;
                  background:#eff6ff;
                  border:1px solid #bfdbfe;
                  border-radius:12px;
                "
              >
                <tr>
                  <td style="padding:16px 18px;">
                    <p
                      style="
                        margin:0 0 8px;
                        color:#1d4ed8;
                        font-size:13px;
                        font-weight:bold;
                      "
                    >
                      Security Recommendation
                    </p>

                    <p
                      style="
                        margin:0;
                        font-size:13px;
                        line-height:1.7;
                        color:#475569;
                      "
                    >
                      For security reasons, please change your password
                      immediately after your first login.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Login Button -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="margin-top:28px;"
              >
                <tr>
                  <td align="center">
                    <a
                      href="${loginUrl}"
                      style="
                        display:inline-block;
                        padding:14px 36px;
                        background:#1d4ed8;
                        color:#ffffff;
                        text-decoration:none;
                        border-radius:12px;
                        font-size:15px;
                        font-weight:700;
                        box-shadow:0 12px 24px rgba(29,78,216,0.22);
                      "
                    >
                      Login to Your Account
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

        </table>

        <p
          style="
            margin:16px 0 0;
            text-align:center;
            font-size:12px;
            color:#64748b;
          "
        >
          Employee Management System • Account Notification
        </p>

      </td>
    </tr>
  </table>

</body>
</html>
`;
