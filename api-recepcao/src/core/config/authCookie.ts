import { APPLICATION_ENVORIMENT } from "./env.js";

export const REFRESH_TOKEN_COOKIE = "refresh_token";

export const refreshTokenCookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: APPLICATION_ENVORIMENT === "production",
  path: "/api/v1/login",
  maxAge: 7 * 24 * 60 * 60,
};
