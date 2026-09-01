import { FastifyReply, FastifyRequest } from "fastify";
import {
  UserParams,
  UserQueryParams,
  UserRequired,
} from "../../../core/types/userTypes.js";
import { UserService } from "../../../application/service/UserService.js";


export const createUserController = async (
  request: FastifyRequest<{ Body: UserRequired }>,
  reply: FastifyReply,
) => {
  const data = request.body;

  const result = await UserService.CreateUser(data);

  if (!result.ok) {
    return reply.status(result.code).send({ message: result.message });
  }

  reply
    .status(result.code || 201)
    .send({ message: result.message, newUser: result.user });
};

export const getUsersController = async (
  request: FastifyRequest<{ Querystring: UserQueryParams }>,
  reply: FastifyReply,
) => {
  const query = request.query;

  const response = await UserService.listUsers(query);

  if (!response.ok) {
    return reply.status(response.code).send({ message: response.message });
  }

  reply.status(200).send({
    message: response.message,
    user: response.user,
    count: response.count,
  });
};

export const updateUserController = async (
  request: FastifyRequest<{ Params: UserParams; Body: UserRequired }>,
  reply: FastifyReply,
) => {
  const data = request.body;
  const { uuid } = request.params;

  const result = await UserService.alterUser(uuid, data);

  if (!result.ok) {
    return reply.status(result.code).send({ message: result.message });
  }

  reply
    .status(result.code || 201)
    .send({ message: result.message, user: result.user });
};

export const deleteUserController = async (
  request: FastifyRequest<{ Params: UserParams }>,
  reply: FastifyReply,
) => {
  const { uuid } = request.params;

  const result = await UserService.deleteUser(uuid);

  reply.status(result.code || 200).send({ message: result.message });
};
