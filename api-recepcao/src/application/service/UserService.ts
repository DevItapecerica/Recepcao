import bcrypt from "bcryptjs";
import {
  GenericResponse,
  GetOneUser,
  GetUser,
  UserGenericResponse,
  UserQueryParams,
  UserRequired,
  UserUpdate,
} from "../dto/user/userTypes.js";

import { AppError } from "../../core/types/errorTypes.js";
import { UserPolicyDomainService } from "../../domain/services/user/userPolicy.domain.service.js";
import { IUserRepository } from "../../domain/repositories/user/user.repository.js";
import { User } from "../../domain/entities/User.js";
import { parsePagination } from "../../core/utils/pagination.js";
import { randomBytes } from "node:crypto";
import { ActivationService } from "./ActivationService.js";
import { IUserSessionRepository } from "../../domain/repositories/auth/user-session.repository.js";
import { assertStrongPassword } from "../../core/utils/passwordPolicy.js";

// Função utilitária para validar role

export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userPolicy: UserPolicyDomainService,
    private readonly activationService?: ActivationService,
    private readonly sessions?: IUserSessionRepository,
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

  async CreateUser(data: UserRequired, actorRole?: string): Promise<UserGenericResponse> {
    // Validações
    if (!this.userPolicy.isValidRole(data.role)) {
      throw new AppError(
        "the field 'role' must be 'admin', 'user', 'recepcionist' or 'superadmin'",
        400,
      );
    }

    if (actorRole === "admin" && !["user", "recepcionist"].includes(data.role)) {
      throw new AppError("Administrador não pode atribuir este papel", 403, "ROLE_ESCALATION");
    }

    const username = `${data.first_name}.${data.last_name}`.toLowerCase();

    const hashPassword = await bcrypt.hash(randomBytes(48).toString("base64url"), 12);

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

    const activationSent = newUser.uuid && this.activationService
      ? await this.activationService.issue(newUser.uuid)
      : false;

    return {
      message: "Usuário criado com sucesso.",
      user: newUser,
      activationSent,
    };
  }

  async alterUser(
    id: string,
    data: UserUpdate,
    actorRole?: string,
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
    if (actorRole === "admin" && !["user", "recepcionist"].includes(data.role)) {
      throw new AppError("Administrador não pode atribuir este papel", 403, "ROLE_ESCALATION");
    }
    if (actorRole === "admin" && ["admin", "superadmin"].includes(user.role)) {
      throw new AppError("Administrador não pode gerenciar este usuário", 403, "ROLE_ESCALATION");
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
    const { search, offset, limit } = parsePagination(query);

    const result = await this.userRepository.listAllUserByFilter({
      search,
      offset,
      limit,
    });

    return {
      message: "Usuários encontrados com sucesso",
      user: result.rows,
      count: result.count,
    };
  }

  async resendActivation(uuid: string, actorRole: string): Promise<{ message: string; activationSent: boolean }> {
    const user = await this.userRepository.findUserById(uuid);
    if (!user) throw new AppError("Usuário não encontrado", 404, "NOT_FOUND");
    if (!user.firstLogin) throw new AppError("Usuário já está ativo", 409, "USER_ALREADY_ACTIVE");
    if (actorRole === "admin" && !["user", "recepcionist"].includes(user.role)) {
      throw new AppError("Administrador não pode gerenciar este papel", 403, "ROLE_ESCALATION");
    }
    if (!this.activationService) throw new AppError("Ativação indisponível", 500, "ACTIVATION_UNAVAILABLE");
    const activationSent = await this.activationService.issue(uuid);
    return { message: activationSent ? "Link de ativação enviado" : "Link gerado, mas o e-mail não pôde ser enviado", activationSent };
  }

  async deleteUser(uuid: string, actorUuid?: string): Promise<UserGenericResponse> {
    const user = await this.userRepository.findUserById(uuid);

    if (!user) {
      throw new AppError("User not found", 404, "NOT_FOUND");
    }

    if (uuid === actorUuid) throw new AppError("Você não pode excluir o próprio usuário", 409, "SELF_DELETE");
    if (user.role === "superadmin" && await this.userRepository.countByRole("superadmin") <= 1) {
      throw new AppError("O último superadministrador não pode ser excluído", 409, "LAST_SUPERADMIN");
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
    assertStrongPassword(newPassword);
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
    if (this.sessions) await this.sessions.revokeAllForUser(uuid);

    return {
      message: "Password succefull altered",
    };
  }
}
