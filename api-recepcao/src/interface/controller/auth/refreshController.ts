import { FastifyReply, FastifyRequest } from "fastify";

import {
  REFRESH_TOKEN_COOKIE,
  refreshTokenCookieOptions,
} from "../../../core/config/authCookie.js";
import { authService } from "../../factories/auth/auth.factory.js";

export const RefreshController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const result = await authService.refresh(
    request.cookies[REFRESH_TOKEN_COOKIE],
  );

  reply
    .setCookie(
      REFRESH_TOKEN_COOKIE,
      result.refreshToken,
      refreshTokenCookieOptions,
    )
    .status(200)
    .send({ message: "Token renovado com sucesso", token: result.token });
};
