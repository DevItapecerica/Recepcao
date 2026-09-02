import { FastifyRequest, FastifyReply } from "fastify";
import { authService } from "../../factories/auth/auth.factory.js";


interface LoginRequestBody {
  username: string;
  password: string;
}

export const loginController = async (
  req: FastifyRequest<{ Body: LoginRequestBody }>,
  reply: FastifyReply
) => {
  const { username, password } = req.body;
  const result = await authService.Login(username, password);

  reply.status(200).send({
    message: "Login bem‑sucedido",
    token: result.token,
    user: result.user,
    ip: req.ip,
  });
};
