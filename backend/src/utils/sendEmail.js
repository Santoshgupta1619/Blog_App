import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


export const sendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"The Indian Guide Technology" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Password Reset</h2>

        <p>Your OTP is:</p>

        <h1 style="letter-spacing:5px;">${otp}</h1>

        <p>This OTP is valid for <strong>10 minutes</strong>.</p>

        <p>If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
};