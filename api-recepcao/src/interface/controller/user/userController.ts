import { FastifyReply, FastifyRequest } from "fastify";
import {
  UserParams,
  UserQueryParams,
  UserRequired,
  UserUpdate,
} from "../../../application/dto/user/userTypes.js";
import { UserFactory } from "../../factories/user/user.factory.js";
import { presentUser } from "../../presenters/user.presenter.js";

export class UserController {
  private readonly userService = new UserFactory().userService()

  createUserController = async (
    request: FastifyRequest<{ Body: UserRequired }>,
    reply: FastifyReply,
  ) => {
    const data = request.body;

    const result = await this.userService.CreateUser(data, request.user.role);

    reply.status(201).send({ message: result.message, newUser: presentUser(result.user), activationSent: result.activationSent });
  };

  getUsersController = async (
    request: FastifyRequest<{ Querystring: UserQueryParams }>,
    reply: FastifyReply,
  ) => {
    const query = request.query;

    const response = await this.userService.listUsers(query);

    reply.status(200).send({
      message: response.message,
      user: response.user?.map(presentUser) ?? [],
      count: response.count,
    });
  };

  updateUserController = async (
    request: FastifyRequest<{ Params: UserParams; Body: UserUpdate }>,
    reply: FastifyReply,
  ) => {
    const data = request.body;
    const { uuid } = request.params;

    const result = await this.userService.alterUser(uuid, data, request.user.role);

    reply.status(200).send({ message: result.message, user: presentUser(result.user) });
  };

  deleteUserController = async (
    request: FastifyRequest<{ Params: UserParams }>,
    reply: FastifyReply,
  ) => {
    const { uuid } = request.params;

    const result = await this.userService.deleteUser(uuid, request.user.uuid);

    reply.status(200).send({ message: result.message, user: presentUser(result.user) });
  };

  resendActivationController = async (
    request: FastifyRequest<{ Params: UserParams }>,
    reply: FastifyReply,
  ) => {
    const result = await this.userService.resendActivation(request.params.uuid, request.user.role);
    reply.status(200).send(result);
  };
}
