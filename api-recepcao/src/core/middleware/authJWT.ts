import { FastifyRequest } from "fastify";
import { decodeToken } from "../utils/DecodeToken.js";
import { UserService } from "../../service/UserService.js";

declare module "fastify" {
  interface FastifyRequest {
    user: {
      role: string;
      uuid: string;
    };
  }
}

export const authJWT = async (request: FastifyRequest) => {
  const token: string | undefined = request.headers.authorization?.replace(
    "Bearer ",
    ""
  );

  if (!token) {
    throw { ok: false, code: 401, message: "Token not provider" };
  }

  const tokenResult = await decodeToken(token);

  if (!tokenResult.ok) {
    throw {
      message: tokenResult.message || "Invalid Token",
      code: tokenResult.code || 401,
      ok: false,
    };
  }

  const userResult = await UserService.findUserByPK(tokenResult.uuid);

  if (!userResult) {
    throw { message: "User Inválid", code: 401, ok: false };
  }

  request.user = {
    role: userResult.role,
    uuid: tokenResult.uuid,
  };
};
