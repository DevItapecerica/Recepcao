import { FastifyReply, FastifyRequest } from "fastify";
import { decodeToken } from "../../core/utils/DecodeToken.js";
import { request } from "http";

interface ValidateRequestBody {
  token: string | undefined;
}

export const ValidateTokenController = async (
  request: FastifyRequest<{ Body: ValidateRequestBody }>,
  reply: FastifyReply
) => {
  // const token: string | undefined = request.headers.authorization?.replace(
  //   "Bearer ",
  //   ""
  // );
  const { token } = request.body;
  const formatedToken = token?.replace("Bearer ", "");

  if (!formatedToken) {
    throw { ok: false, code: 401, message: "Token not provider" };
  }

  const tokenResult = await decodeToken(formatedToken);

  if (!tokenResult.ok) {
    const error: any = new Error(tokenResult.message);
    error.statusCode = tokenResult.code || 401;
    throw error;
  }

  reply.status(200).send({message: tokenResult.message, name: tokenResult.name, uuid: tokenResult.uuid, role: tokenResult.role, ok: true});
};
