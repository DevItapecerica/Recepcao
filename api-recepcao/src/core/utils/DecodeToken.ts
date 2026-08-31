import jwt from "jsonwebtoken";
import { SECRET_KEY_JWT } from "../config/env.js";

interface TokenSuccess {
  ok: true;
  name: string
  message: string;
  role: string;
  uuid: string;
}
interface TokenFail {
  ok: false;
  code?: number;
  message: string;
}

type TokenResult = TokenSuccess | TokenFail

export async function decodeToken(token: string): Promise<TokenResult> {
  if (!token) {
    return {
      ok: false,
      code: 401,
      message: "Unauthorized - No token provided",
    };
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY_JWT) as jwt.JwtPayload;

    return {
      ok: true,
      role: decoded.role,
      uuid: decoded.uuid,
      name: decoded.name,
      message: "Token is valid",
    };
  } catch (err) {
    return {
      ok: false,
      code: 401,
      message: "Unauthorized - Invalid token",
    };
  }
}
