import { FastifyReply, FastifyRequest } from "fastify";
import { UserDB } from "../../infra/db/sequelize/models/user.js";
import {
  UserParams,
  UserQueryParams,
  UserRequired,
} from "../../core/types/userTypes.js";

import { UserService } from "../../service/UserService.js";

export const createUserController = async (
  request: FastifyRequest<{ Body: UserRequired }>,
  reply: FastifyReply
): Promise<void> => {
  try {
    const data = request.body;
    const user: UserRequired = {
      first_name: data.first_name.toLowerCase(),
      last_name: data.last_name.toLowerCase(),
      email: data.email.toLowerCase(),
      cpf: data.cpf.toLowerCase(),
      password: data.password,
      role: data.role,
    };
    const result = await UserService.CreateUser(user);

    if (!result.ok) {
      throw { ok: false, code: result.code, message: result.message };
    }

    reply
      .status(result.code || 201)
      .send({ message: result.message, newUser: result.user });
  } catch (error: any) {
    throw {
      ok: error.ok,
      code: error.code || 500,
      message: error.message || "Impossible create user",
    };
  }
};

export const getUsersController = async (
  request: FastifyRequest<{ Querystring: UserQueryParams }>,
  reply: FastifyReply
): Promise<void> => {
  try {
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
  } catch (error: any) {
    throw {
      ok: error.ok,
      code: error.code || 500,
      message: error.message || "Impossível listar os usuários",
    };
  }
};

export const updateUserController = async (
  request: FastifyRequest<{ Params: UserParams; Body: UserRequired }>,
  reply: FastifyReply
) => {
  try {
    const data = request.body;
    const { uuid } = request.params;

    const user: UserRequired = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      cpf: data.cpf,
      role: data.role,
    };

    const result = await UserService.alterUser(uuid, user);

    if (!result.ok) {
      throw { ok: false, code: result.code, message: result.message };
    }

    reply
      .status(result.code || 201)
      .send({ message: result.message, user: result.user });
  } catch (error: any) {
    throw {
      ok: error.ok,
      code: error.code || 500,
      message: error.message || "Impossível atualizar o usuário",
    };
  }
};

export const deleteUserController = async (
  request: FastifyRequest<{ Params: UserParams }>,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { uuid } = request.params;

    const result = await UserService.deleteUser(uuid);

    if (!result.ok) {
      throw { ok: false, code: result.code, message: result.message };
    }

    reply.status(result.code || 200).send({ message: result.message });
  } catch (error: any) {
    throw {
      ok: error.ok,
      code: error.code || 500,
      message: error.message || "Impossível deletar o usuário",
    };
  }
};
