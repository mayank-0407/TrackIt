import { sendEmail } from "@/lib/sendEmail";

export const sendEmailVerification = async (
  email: string,
  verifyUrl: string
) => {
  await sendEmail(
    email,
    "Verify your TrackIt account",
    `
  <div style="font-family: Arial, sans-serif; background-color:#f9fafb; padding:40px; text-align:center;">
    <div style="max-width:500px; margin:auto; background:#ffffff; border-radius:12px; padding:30px; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
      <h2 style="color:#111827; margin-bottom:20px;">Welcome to TrackIt 👋</h2>
      <p style="color:#374151; font-size:15px; line-height:1.6;">
        Thanks for signing up! Please confirm your email address to activate your TrackIt account.
        <br/>This link is valid for <strong>3 minutes</strong>.
      </p>
      <a href="${verifyUrl}" 
        style="display:inline-block; margin-top:20px; padding:12px 24px; background-color:#2563eb; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:bold;">
        Verify Email
      </a>
      <p style="color:#6b7280; font-size:13px; margin-top:25px;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p style="word-break:break-all; font-size:13px; color:#2563eb;">
        ${verifyUrl}
      </p>
    </div>
    <p style="color:#9ca3af; font-size:12px; margin-top:30px;">
      © ${new Date().getFullYear()} TrackIt. All rights reserved.
    </p>
  </div>
  `
  );
};
