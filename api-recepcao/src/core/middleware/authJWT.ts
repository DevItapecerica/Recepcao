import { FastifyRequest } from "fastify";
import { decodeToken } from "../utils/DecodeToken.js";
import { AppError } from "../types/errorTypes.js";
import { IUserRepository } from "../../domain/repositories/user/user.repository.js";

declare module "fastify" {
  interface FastifyRequest {
    user: {
      role: string;
      uuid: string;
    };
  }
}

export const createAuthJWT = (userRepository: IUserRepository) => async (request: FastifyRequest) => {

  const token: string | undefined = request.headers.authorization?.replace(
    "Bearer ",
    "",
  );

  if (!token) {
    throw new AppError("Token not provider", 401, "UNAUTHORIZED");
  }

  const tokenResult = await decodeToken(token);

  if (!tokenResult.ok) {
    throw new AppError(
      tokenResult.message,
      tokenResult.code || 401,
      "UNAUTHORIZED",
    );
  }

  const userResult = await userRepository.findUserById(
    tokenResult.uuid,
  );

  if (!userResult) {
    throw new AppError("User not found", 404, "NOT_FOUND");
  }

  request.user = {
    role: userResult.role,
    uuid: tokenResult.uuid,
  };
};
