import nodemailer from "nodemailer"

const {
  GOOGLE_GMAIL_USER,
  GOOGLE_APP_PASSWORD,
  DOMAIN
} = process.env;

const forgotPassword = (username) => {
  return `<div style="background-color: #f2f2f2; padding: 20px;">
            <h2 style="color: #ff9900;">
              Forgot Password
            </h2>
            <p> We have received a request to reset your password. </p>
            <p> If you did not make this request, please ignore this email. </p>
            <p> To reset your password, click the link below. </p>
            <a href="${DOMAIN}/resetPassword?username=${username}">Reset Password</a>
          </div>`;
};

export const sendEmail = async (mail_to, username) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
        auth: {
          user: GOOGLE_GMAIL_USER,
          pass: GOOGLE_APP_PASSWORD
        }
    });
    const mailOptions = {
      to: mail_to,
      subject: "Reset Password Request | IdeaConnect",
      html: forgotPassword(username),
    };
    const mailResponse = await transporter.sendMail(mailOptions);
    return mailResponse;
  } catch (error) {
    throw new Error(error);
  }
}