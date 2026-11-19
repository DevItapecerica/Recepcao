import assert from "node:assert/strict";
import test from "node:test";
import nodemailer from "nodemailer";

test("falha no SMTP não expõe destinatário, conteúdo ou token de ativação nos logs", async (t) => {
  // Valores fictícios: este teste não conecta ao banco nem envia e-mails.
  Object.assign(process.env, {
    NODE_ENV: "test", APPLICATION_PORT: "3000", SECRET_KEY_JWT: "teste",
    DATABASE_USER: "teste", DATABASE_KEY: "teste", DATABASE_NAME: "teste",
    DATABASE_HOST: "localhost", DATABASE_URL: "mariadb://localhost/teste",
    CORS_ORIGIN: "http://localhost:5173",
    MAIL_HOST: "smtp.example.test", MAIL_ADRESS: "remetente@example.test",
    MAIL_PASSWORD: "senha-ficticia", MAIL_PORT: "587",
  });
  const token = "token-secreto-de-teste";
  const to = "destinatario@example.test";
  const subject = "Ative sua conta";
  const text = "Defina sua senha: https://example.test/Activate?token=" + token;
  t.mock.method(nodemailer, "createTransport", () => ({
    sendMail: async () => { throw new Error(to + " " + subject + " " + text); },
  }));
  const logs: unknown[][] = [];
  t.mock.method(console, "error", (...args: unknown[]) => { logs.push(args); });
  const { sendMail } = await import("./sendMail.js");
  assert.equal(await sendMail(to, subject, text), false);
  assert.equal(logs.length, 1);
  const output = JSON.stringify(logs);
  assert.match(output, /E-MAIL NÃO ENVIADO/);
  for (const sensitive of [to, subject, text, token]) {
    assert.equal(output.includes(sensitive), false);
  }
});
