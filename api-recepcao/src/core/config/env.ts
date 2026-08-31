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

export const APPLICATION_ENVORIMENT = must("NODE_ENV");

export const PORT = must("APPLICATION_PORT");

export const SECRET_KEY_JWT = must("SECRET_KEY_JWT");

export const SECRET_EMAIL = must("SECRET_EMAIL");
export const SECRET_PASSWORD = must("SECRET_PASSWORD");

export const DATABASE_USER = must("DATABASE_USER");
export const DATABASE_KEY = must("DATABASE_KEY");
export const DATABASE_NAME = must("DATABASE_NAME");
export const DATABASE_HOST = must("DATABASE_HOST");

export const DATABASE_URL = must("DATABASE_URL");
