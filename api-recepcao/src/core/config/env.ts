// config/env.ts
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

function must(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Env ${name} is missing`);
  return val;
}

function optionalBoolean(name: string, fallback: boolean): boolean {
  const value = process.env[name];
  if (!value) return fallback;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`Env ${name} must be "true" or "false"`);
}

export const APPLICATION_ENVORIMENT = must("NODE_ENV");

export const PORT = must("APPLICATION_PORT");

export const SECRET_KEY_JWT = must("SECRET_KEY_JWT");

export const DATABASE_USER = must("DATABASE_USER");
export const DATABASE_KEY = must("DATABASE_KEY");
export const DATABASE_NAME = must("DATABASE_NAME");
export const DATABASE_HOST = must("DATABASE_HOST");

export const DATABASE_URL = must("DATABASE_URL");

export const CORS_ORIGIN = must("CORS_ORIGIN");
export const TRUSTED_PROXIES = (process.env.TRUSTED_PROXIES || "loopback").split(",").map((value) => value.trim()).filter(Boolean);


export const MAIL_ADRESS = must("MAIL_ADRESS");
export const MAIL_PASSWORD = must("MAIL_PASSWORD");
export const MAIL_HOST = must("MAIL_HOST");
export const MAIL_PORT = Number.parseInt(must("MAIL_PORT"), 10);
export const MAIL_SECURE = MAIL_PORT === 465;
