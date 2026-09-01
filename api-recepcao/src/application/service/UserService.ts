import bcrypt from "bcryptjs";
import {
    GenericResponse,
  GetOneUser,
  GetUser,
  UserGenericResponse,
  UserQueryParams,
  UserRequired,
} from "../dto/user/userTypes.js";
import validatorCPF from "../../core/utils/validatorCPF.js";
import { generateStrongPassword } from "../../core/utils/passwordGenerator.js";
import { sendMail } from "../../core/utils/sendMail.js";
import { APPLICATION_ENVORIMENT } from "../../core/config/env.js";

import { AppError } from "../../core/types/errorTypes.js";
import { userRepository } from "../../infra/database/sequelize/repositories/sequelize.user.repository.js";

// Função utilitária para validar role
const isValidRole = (role: string) =>
  ["admin", "user", "recepcionist", "superadmin"].includes(role);

// Função utilitária para verificar duplicidade de email/cpf
const isDuplicateUser = async (
  email: string,
  cpf?: string | null,
  excludeUuid?: string,
) => {
  return userRepository.findDuplicate(email, cpf, excludeUuid);
};

export class UserService {
  static async findUserByUsername(
    username: string,
  ): Promise<GetOneUser | null> {
    const user = await userRepository.findByUsername(username);
    return { user, message: "User Retrieved Successfully" };
  }

  static async findUserByPK(uuid: string): Promise<GetOneUser | null> {
    const user = await userRepository.findById(uuid);

    if (!user) {
      throw new AppError("User not found", 404, "NOT_FOUND");
    }

    return { user, message: "User Retrieved Successfully" };
  }

  static async CreateUser(data: UserRequired): Promise<UserGenericResponse> {
    // Validações
    if (!isValidRole(data.role)) {
      throw new AppError(
        "the field 'role' must be 'admin', 'user', 'recepcionist' or 'superadmin'",
        400,
      );
    }

    validatorCPF(data.cpf);

    // Verifica duplicidade
    if (await isDuplicateUser(data.email, data.cpf)) {
      throw new AppError("User already exists", 409, "DUPLICATE_USER");
    }

    // Define username e criptografa senha
    const username = `${data.first_name}.${data.last_name}`.toLowerCase();
    let password = null;

    password = generateStrongPassword();

    const hashPassword = await bcrypt.hash(password, 10);

    // Cria usuário
    const newUser = await userRepository.create({
      ...data,
      username: username,
      password: hashPassword,
    });

    await sendMail(
      data.email,
      "Reception Password",
      `Your password is: ${password}`,
    );

    return {
      message: "Usuário criado com sucesso.",
      user: newUser,
    };
  }

  static async alterUser(
    id: string,
    data: UserRequired,
  ): Promise<UserGenericResponse> {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new AppError("User not found", 404, "NOT_FOUND");
    }

    if (!isValidRole(data.role)) {
      throw new AppError(
        "the field 'role' must be 'admin', 'user', 'recepcionist' or 'superadmin'", 400
      )
    }

    if (await isDuplicateUser(data.email, null, id)) {
      throw new AppError("User already exists", 409, "DUPLICATE_USER");
    }

    // Atualiza campos
    user.first_name = data.first_name;
    user.last_name = data.last_name;
    user.username = `${data.first_name}.${data.last_name}`.toLowerCase();
    user.email = data.email;
    user.role = data.role;

    await userRepository.save(user);

    return {
      message: "Alterado com sucesso",
      user: user,
    };
  }

  static async listUsers(
    query: UserQueryParams,
  ): Promise<GetUser> {
    const {
      page = "0",
      limit = "10",
      search = "",
    } = query as {
      page?: string;
      limit?: string;
      search?: string;
    };

    const offset = Number(page) * Number(limit);

    const result = await userRepository.list({
      search,
      offset,
      limit: Number(limit),
    });

    return {
      message: "Usuários encontrados com sucesso",
      user: result.rows ,
      count: result.count,
    };
  }

  static async deleteUser(uuid: string): Promise<UserGenericResponse> {
    const user = await userRepository.findById(uuid);

    if (!user) {
      throw new AppError("User not found", 404, "NOT_FOUND");
    }

    await userRepository.delete(user);

    return {
      message: "user deleted successfully",
      user: user,
    };
  }

  static async alterPassword(
    uuid: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<GenericResponse> {
    const user = await userRepository.findById(uuid);

    if (!user) {
      throw new AppError("User not found", 404, "NOT_FOUND");
    }

    const valid =
      user.password && (await bcrypt.compare(oldPassword, user.password));

    if (!valid) {
      throw new AppError("Old Password Inválid", 401, "UNAUTHORIZED");
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;

    await userRepository.save(user);

    return {
      message: "Password succefull altered",
    };
  }
}
