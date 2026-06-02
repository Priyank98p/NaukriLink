import { Resend } from "resend";

const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is required to send emails");
  }

  return new Resend(process.env.RESEND_API_KEY);
};

const sendVerificationEmail = async (email, otp) => {
  try {
    const resend = getResendClient();
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: email,
      subject: "Verify Your Email - OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Your one-time password (OTP) is:</p>
          <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="letter-spacing: 5px; color: #333; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    return response;
  } catch (error) {
    console.error("Email send error:", error);
    throw new Error("Failed to send OTP email");
  }
};

const sendWelcomeEmail = async (email, username) => {
  try {
    const resend = getResendClient();
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: email,
      subject: "Welcome to NaukriLink",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2>Welcome, ${username}!</h2>
          <p>Your email has been successfully verified.</p>
          <p>You can now log in to your account and start exploring.</p>
          <a href="${process.env.FRONTEND_URL}/login" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Login Now</a>
        </div>
      `,
    });
  } catch (error) {
    console.error("Email send error:", error);
    throw new Error("Failed to send Welcome email");
  }
};

const resetPasswordEmail = async (email, resetUrl) => {
  try {
    const resend = getResendClient();
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: email,
      subject: "Reset your password",
      html: `
       <div style="font-family:Arial sans-serif; padding: 20px; color: #333;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your NaukriLink account. Click the button below to reset it:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          <p>If you did not request this, please ignore this email.</p>
          <p>This link will expire in 10 minutes.</p>
        </div>
      `,
    });
  } catch (error) {

    console.error("EMAIL_ERROR:", error);
    throw new ApiError(500, "Email could not be sent. Please try again later.");
  }
};

export { sendVerificationEmail, sendWelcomeEmail, resetPasswordEmail };
