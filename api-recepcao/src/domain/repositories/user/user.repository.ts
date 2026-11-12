import { User } from "../../entities/User.js";

export interface UserListOptions {
  search?: string;
  offset: number;
  limit: number;
}

export interface UserListResult {
  rows: User[];
  count: number;
}

export interface IUserRepository {
  findUserById(uuid: string): Promise<User | null>;
  findUserByUsername(username: string): Promise<User | null>;
  findUserDuplicateByEmailOrCpf(email: string, cpf?: string | null, excludeUuid?: string): Promise<boolean>;
  createNewUser(user: User): Promise<User>;
  listAllUserByFilter(options: UserListOptions): Promise<UserListResult>;
  updateUser(user: User): Promise<User>;
  deleteUser(uuid: string): Promise<void>;
  countByRole(role: string): Promise<number>;
}
