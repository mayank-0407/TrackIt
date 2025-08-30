import { sendEmail } from "@/lib/sendEmail";

export const sendPasswordChangedConfirmation = async (
  email: string,
  baseUrl: string
) => {
  await sendEmail(
    email,
    "Your TrackIt Password Has Been Changed",
    `
  <div style="font-family: Arial, sans-serif; background-color:#f9fafb; padding:40px; text-align:center;">
    <div style="max-width:500px; margin:auto; background:#ffffff; border-radius:12px; padding:30px; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
      <h2 style="color:#111827; margin-bottom:20px;">Password Changed Successfully</h2>
      <p style="color:#374151; font-size:15px; line-height:1.6;">
        This is a confirmation that the password for your <strong>TrackIt</strong> account 
        has been successfully changed.
      </p>
      <p style="color:#6b7280; font-size:13px; margin-top:25px;">
        If you did not make this change, please <a href="${baseUrl}/forgotpassword" style="color:#2563eb; text-decoration:underline;">reset your password</a> immediately or contact our support team.
      </p>
    </div>
    <p style="color:#9ca3af; font-size:12px; margin-top:30px;">
      © ${new Date().getFullYear()} TrackIt. All rights reserved.
    </p>
  </div>
  `
  );
};
