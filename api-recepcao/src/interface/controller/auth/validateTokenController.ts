import { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../../core/types/errorTypes.js";
import { authService } from "../../factories/auth/auth.factory.js";

interface ValidateRequestBody {
  token: string | undefined;
}

export const ValidateTokenController = async (
  request: FastifyRequest<{ Body: ValidateRequestBody }>,
  reply: FastifyReply,
) => {
  const { token } = request.body;
  const formatedToken = token?.replace("Bearer ", "");

  if (!formatedToken) {
    throw new AppError("Token not provider", 401, "UNAUTHORIZED");
  }

  const tokenResult = await authService.verifyAccessToken(formatedToken);

  reply
    .status(200)
    .send({
      message: "Token is valid",
      user: {
        name: tokenResult.name,
        uuid: tokenResult.uuid,
        role: tokenResult.role,
      },
    });
};
