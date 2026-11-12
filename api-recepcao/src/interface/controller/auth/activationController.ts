import { FastifyReply, FastifyRequest } from "fastify";
import { activationService } from "../../factories/auth/auth.factory.js";

export const ActivationController = async (
  request: FastifyRequest<{ Body: { token: string; password: string } }>,
  reply: FastifyReply,
) => {
  await activationService.activate(request.body.token, request.body.password);
  reply.status(200).send({ message: "Conta ativada com sucesso" });
};
