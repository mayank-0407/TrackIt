import { sendEmail } from "@/lib/sendEmail";

export const sendForgotPasswordEmail = async (
  email: string,
  resetUrl: string
) => {
  await sendEmail(
    email,
    "Reset your TrackIt Account Password",
    `
  <div style="font-family: Arial, sans-serif; background-color:#f9fafb; padding:40px; text-align:center;">
    <div style="max-width:500px; margin:auto; background:#ffffff; border-radius:12px; padding:30px; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
      <h2 style="color:#111827; margin-bottom:20px;">Reset Your Password</h2>
      <p style="color:#374151; font-size:15px; line-height:1.6;">
        We received a request to reset the password for your TrackIt account.
        <br/>Click the button below to set a new password. This link is valid for <strong>3 minutes</strong>.
      </p>
      <a href="${resetUrl}" 
        style="display:inline-block; margin-top:20px; padding:12px 24px; background-color:#2563eb; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:bold;">
        Reset Password
      </a>
      <p style="color:#6b7280; font-size:13px; margin-top:25px;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p style="word-break:break-all; font-size:13px; color:#2563eb;">
        ${resetUrl}
      </p>
      <p style="color:#6b7280; font-size:13px; margin-top:25px;">
        If you did not request a password reset, please ignore this email. Your account is safe.
      </p>
    </div>
    <p style="color:#9ca3af; font-size:12px; margin-top:30px;">
      © ${new Date().getFullYear()} TrackIt. All rights reserved.
    </p>
  </div>
  `
  );
};
