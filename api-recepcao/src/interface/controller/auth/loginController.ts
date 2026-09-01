import { FastifyRequest, FastifyReply } from "fastify";
import { Auth } from "../../../application/service/AuthService.js";


interface LoginRequestBody {
  username: string;
  password: string;
}

export const loginController = async (
  req: FastifyRequest<{ Body: LoginRequestBody }>,
  reply: FastifyReply
) => {
  const { username, password } = req.body;
  const result = await Auth.Login(username, password);

  reply.status(200).send({
    message: "Login bem‑sucedido",
    token: result.token,
    user: result.user,
    ip: req.ip,
  });
};
