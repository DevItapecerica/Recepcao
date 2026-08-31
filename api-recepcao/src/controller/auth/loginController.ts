import { FastifyRequest, FastifyReply } from "fastify";

import { Auth } from "../../service/AuthService.js";
import { AuthResult } from "../../core/types/authTypes.js";

interface LoginRequestBody {
  username: string;
  password: string;
}

export const loginController = async (
  req: FastifyRequest<{ Body: LoginRequestBody }>,
  reply: FastifyReply
): Promise<void> => {
  const { username, password } = req.body;
  const result: AuthResult = await Auth.Login(username, password);

  if (!result.ok) {
    reply.status(result.code).send({ message: result.message });
    return;
  }

  reply.status(200).send({
    message: "Login bem‑sucedido",
    token: result.token,
    user: result.user,
    ip: req.ip,
  });
};
