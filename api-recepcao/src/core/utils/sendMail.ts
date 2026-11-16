import nodemailer from "nodemailer";
import { MAIL_ADRESS, MAIL_HOST, MAIL_PASSWORD, MAIL_PORT, MAIL_SECURE } from "../config/env.js";

export async function sendMail(to: string, subject: string, text: string): Promise<boolean> {
  try {
    if (!MAIL_HOST || !MAIL_ADRESS || !MAIL_PASSWORD || !Number.isInteger(MAIL_PORT) || MAIL_PORT < 1 || MAIL_PORT > 65535) {
      throw new Error("SMTP sem configuração válida. Confira MAIL_HOST, MAIL_ADRESS, MAIL_PASSWORD e MAIL_PORT.");
    }

    const transporter = nodemailer.createTransport({
      host: MAIL_HOST,
      port: MAIL_PORT,
      secure: MAIL_SECURE,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      auth: {
        user: MAIL_ADRESS,
        pass: MAIL_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `"Tecnologia - Itapecerica da Serra" <${MAIL_ADRESS}>`,
      to,
      subject,
      text,
    });

    if (info.rejected.length > 0 || info.accepted.length === 0) {
      throw new Error("O servidor SMTP rejeitou o destinatário.");
    }

    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha desconhecida no SMTP";
    console.error(`[E-MAIL NÃO ENVIADO] ${message}`);
    console.error(`[ACESSO PELO TERMINAL]\nDestinatário: ${to}\nAssunto: ${subject}\n${text}`);
    return false;
  }
}
