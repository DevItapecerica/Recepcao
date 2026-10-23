import nodemailer from "nodemailer";
import { MAIL_ADRESS, MAIL_HOST, MAIL_PASSWORD, MAIL_PORT, MAIL_SECURE } from "../config/env.js";

export async function sendMail(to: string, subject: string, text: string) {

  const transporter = nodemailer.createTransport({
    host: MAIL_HOST, // servidor de email
    port: MAIL_PORT,
    secure: MAIL_SECURE,
    auth: {
      user: MAIL_ADRESS,
      pass: MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: '"Tecnologia - Itapecerica da Serra" <miguel.moraes@itapecerica.sp.gov.br>',
    to,
    subject,
    text,
  };

  return transporter.sendMail(mailOptions);
}
