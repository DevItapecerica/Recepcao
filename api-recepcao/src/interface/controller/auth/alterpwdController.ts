import { FastifyReply, FastifyRequest } from "fastify";
import { UserFactory } from "../../factories/user/user.factory.js";

const userService = new UserFactory().userService();

export const AlterPwdController = async (
  request: FastifyRequest<{
    Body: { old_password: string; new_password: string };
  }>,
  reply: FastifyReply,
) => {
  const { old_password, new_password } = request.body;

  const result = await userService.alterPassword(
    request.user.uuid,
    old_password,
    new_password,
  );

  reply.status(200).send({ message: result.message});
};
