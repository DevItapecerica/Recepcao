import { FastifyReply, FastifyRequest } from "fastify";
import { decodeToken } from "../../../core/utils/DecodeToken.js";
import { AppError } from "../../../core/types/errorTypes.js";

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

  const tokenResult = await decodeToken(formatedToken);

  if (!tokenResult.ok) {
    const error: any = new Error(tokenResult.message);
    error.statusCode = tokenResult.code || 401;
    throw error;
  }

  reply
    .status(200)
    .send({
      message: tokenResult.message,
      token: {
        name: tokenResult.name,
        uuid: tokenResult.uuid,
        role: tokenResult.role,
      },
    });
};
