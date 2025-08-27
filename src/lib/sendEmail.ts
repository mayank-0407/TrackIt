import nodemailer from "nodemailer";

export async function sendEmail(to: string, subject: string, html: string) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  console.log(transporter);
  try {
    await transporter.sendMail(
      {
        from: "TrackIt",
        to,
        subject,
        html,
      },
      (error, info) => {
        if (error) {
          console.log("error", error);
        } else {
          console.log("Email sent: " + info.response);
        }
      }
    );
  } catch (e) {
    console.log("Error In SendEmail : ", e);
  }
}
