import bcrypt from "bcryptjs";
import {
  GenericResponse,
  GetOneUser,
  GetUser,
  UserGenericResponse,
  UserQueryParams,
  UserRequired,
} from "../dto/user/userTypes.js";
import { generateStrongPassword } from "../../core/utils/passwordGenerator.js";
import { sendMail } from "../../core/utils/sendMail.js";

import { AppError } from "../../core/types/errorTypes.js";
import { UserPolicyDomainService } from "../../domain/services/user/userPolicy.domain.service.js";
import { IUserRepository } from "../../domain/repositories/user/user.repository.js";
import { User } from "../../domain/entities/User.js";

// Função utilitária para validar role

export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userPolicy: UserPolicyDomainService,
  ) {}

  async findUserByUsername(username: string): Promise<GetOneUser> {
    const user = await this.userRepository.findUserByUsername(username);
    return { user, message: "User Retrieved Successfully" };
  }

  async findUserByPK(uuid: string): Promise<GetOneUser | null> {
    const user = await this.userRepository.findUserById(uuid);

    if (!user) {
      throw new AppError("User not found", 404, "NOT_FOUND");
    }

    return { user, message: "User Retrieved Successfully" };
  }

  async CreateUser(data: UserRequired): Promise<UserGenericResponse> {
    // Validações
    if (!this.userPolicy.isValidRole(data.role)) {
      throw new AppError(
        "the field 'role' must be 'admin', 'user', 'recepcionist' or 'superadmin'",
        400,
      );
    }

    const username = `${data.first_name}.${data.last_name}`.toLowerCase();

    let password = generateStrongPassword();
    const hashPassword = await bcrypt.hash(password, 10);

    const user = new User({ ...data, username, password: hashPassword });

    if (!user.isValidCpf()) {
      throw new AppError("CPF inválido", 400, "INVALID_CPF");
    }

    // Verifica duplicidade
    if (await this.userPolicy.isDuplicateUser(user.email, user.cpf)) {
      throw new AppError("User already exists", 409, "DUPLICATE_USER");
    }

    // Cria usuário
    const newUser = await this.userRepository.createNewUser(user);

    await sendMail(
      user.email,
      "Reception Password",
      `Your password is: ${password}`,
    );

    return {
      message: "Usuário criado com sucesso.",
      user: newUser,
    };
  }

  async alterUser(
    id: string,
    data: UserRequired,
  ): Promise<UserGenericResponse> {
    const user = await this.userRepository.findUserById(id);

    if (!user) {
      throw new AppError("User not found", 404, "NOT_FOUND");
    }

    if (!this.userPolicy.isValidRole(data.role)) {
      throw new AppError(
        "the field 'role' must be 'admin', 'user', 'recepcionist' or 'superadmin'",
        400,
      );
    }

    if (await this.userPolicy.isDuplicateUser(data.email, null, id)) {
      throw new AppError("User already exists", 409, "DUPLICATE_USER");
    }

    // Atualiza campos
    user.first_name = data.first_name;
    user.last_name = data.last_name;
    user.username = `${data.first_name}.${data.last_name}`.toLowerCase();
    user.email = data.email;
    user.role = data.role;

    await this.userRepository.updateUser(user);

    return {
      message: "Alterado com sucesso",
      user: user,
    };
  }

  async listUsers(query: UserQueryParams): Promise<GetUser> {
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

    const result = await this.userRepository.listAllUserByFilter({
      search,
      offset,
      limit: Number(limit),
    });

    return {
      message: "Usuários encontrados com sucesso",
      user: result.rows,
      count: result.count,
    };
  }

  async deleteUser(uuid: string): Promise<UserGenericResponse> {
    const user = await this.userRepository.findUserById(uuid);

    if (!user) {
      throw new AppError("User not found", 404, "NOT_FOUND");
    }

    await this.userRepository.deleteUser(uuid);

    return {
      message: "user deleted successfully",
      user: user,
    };
  }

  async alterPassword(
    uuid: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<GenericResponse> {
    const user = await this.userRepository.findUserById(uuid);

    if (!user) {
      throw new AppError("User not found", 404, "NOT_FOUND");
    }

    const valid =
      user.passwordHash && (await bcrypt.compare(oldPassword, user.passwordHash));

    if (!valid) {
      throw new AppError("Old Password Inválid", 401, "UNAUTHORIZED");
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.changePassword(hashPassword);

    await this.userRepository.updateUser(user);

    return {
      message: "Password succefull altered",
    };
  }
}
