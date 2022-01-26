import nodemailer from "nodemailer";

export const notify = async (email: string, text: string, subject: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",

    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      // if google's app password didn't work try your account's password
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: "email@website.com",
    to: email,
    text,
    subject,
  };

  const result = await transporter.sendMail(mailOptions);
  if (result) {
    return "Email sent";
  } else {
    return "Couldn't send email";
  }
};
