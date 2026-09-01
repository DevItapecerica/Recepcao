import { UserDB } from "../../infra/database/sequelize/models/user.model.js";
import { UserRequired } from "../../application/dto/user/userTypes.js";

export interface UserListOptions {
  search?: string;
  offset: number;
  limit: number;
}

export interface UserListResult {
  rows: UserDB[];
  count: number;
}

export interface IUserRepository {
  findById(uuid: string): Promise<UserDB | null>;
  findByUsername(username: string): Promise<UserDB | null>;
  findDuplicate(email: string, cpf?: string | null, excludeUuid?: string): Promise<UserDB | null>;
  create(data: UserRequired & { username: string; password: string }): Promise<UserDB>;
  list(options: UserListOptions): Promise<UserListResult>;
  save(user: UserDB): Promise<UserDB>;
  delete(user: UserDB): Promise<void>;
}
