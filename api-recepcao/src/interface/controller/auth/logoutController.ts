import { FastifyReply, FastifyRequest } from "fastify";

import {
  REFRESH_TOKEN_COOKIE,
  refreshTokenCookieOptions,
} from "../../../core/config/authCookie.js";
import { authService } from "../../factories/auth/auth.factory.js";

export const LogoutController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  await authService.logout(request.cookies[REFRESH_TOKEN_COOKIE]);

  reply
    .clearCookie(REFRESH_TOKEN_COOKIE, refreshTokenCookieOptions)
    .status(200)
    .send({ message: "Logout realizado com sucesso" });
};
