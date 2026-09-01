import { FastifyReply, FastifyRequest } from "fastify";
import {
  UserParams,
  UserQueryParams,
  UserRequired,
} from "../../../application/dto/user/userTypes.js";
import { UserService } from "../../../application/service/UserService.js";


export const createUserController = async (
  request: FastifyRequest<{ Body: UserRequired }>,
  reply: FastifyReply,
) => {
  const data = request.body;

  const result = await UserService.CreateUser(data);

  reply
    .status( 201)
    .send({ message: result.message, newUser: result.user });
};

export const getUsersController = async (
  request: FastifyRequest<{ Querystring: UserQueryParams }>,
  reply: FastifyReply,
) => {
  const query = request.query;

  const response = await UserService.listUsers(query);

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

  reply
    .status(200)
    .send({ message: result.message, user: result.user });
};

export const deleteUserController = async (
  request: FastifyRequest<{ Params: UserParams }>,
  reply: FastifyReply,
) => {
  const { uuid } = request.params;

  const result = await UserService.deleteUser(uuid);

  reply.status(200).send({ message: result.message, user: result.user });
};
