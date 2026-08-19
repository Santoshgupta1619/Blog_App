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

export const sendVerificationEmail = async (email, token) => {
  // console.log("EMAIL:", email);
  // console.log("VERIFICATION TOKEN:", token);

  const verificationUrl =
    `${process.env.FRONTEND_URL}/verify-email/${token}`;

  await transporter.sendMail({
    from: `"The Indian Guide Technology" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email - The Indian Guide Technology",
    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 30px;
        color: #1b2820;
      ">

        <h2>Welcome to The Indian Guide Technology!</h2>

        <p>
          Thank you for creating your account.
          Please verify your email address to complete your registration.
        </p>

        <div style="margin: 30px 0;">
          <a
            href="${verificationUrl}"
            style="
              display: inline-block;
              padding: 13px 24px;
              background: #214d35;
              color: white;
              text-decoration: none;
              border-radius: 7px;
              font-weight: bold;
            "
          >
            Verify Email
          </a>
        </div>

        <p>
          This verification link will expire in
          <strong>24 hours</strong>.
        </p>

        <p>
          If you did not create this account, you can safely ignore this email.
        </p>

        <p>
          — The Indian Guide Technology
        </p>

      </div>
    `,
  });
};