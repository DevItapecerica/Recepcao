import { Op } from "sequelize";

import db from "../index.js";
import { UserDB } from "../models/user.model.js";
import { User } from "../../../../domain/entities/User.js";
import {
  IUserRepository,
  UserListOptions,
  UserListResult,
} from "../../../../domain/repositories/user/user.repository.js";

export class SequelizeUserRepository implements IUserRepository {
  private get model() {
    return db.UserModel;
  }

  private toDomain(model: UserDB): User {
    return new User(model.get({ plain: true }));
  }

  async findUserById(uuid: string): Promise<User | null> {
    const model = await this.model.findByPk(uuid);
    return model ? this.toDomain(model) : null;
  }

  async findUserByUsername(username: string): Promise<User | null> {
    const model = await this.model.findOne({ where: { username } });
    return model ? this.toDomain(model) : null;
  }

  async findUserDuplicateByEmailOrCpf(
    email: string,
    cpf?: string | null,
    excludeUuid?: string,
  ): Promise<boolean> {
    const candidates = cpf ? [{ email }, { cpf }] : [{ email }];
    const where: Record<PropertyKey, unknown> = { [Op.or]: candidates };
    if (excludeUuid) where.uuid = { [Op.ne]: excludeUuid };
    return Boolean(await this.model.findOne({ where }));
  }

  async createNewUser(user: User): Promise<User> {
    return this.toDomain(await this.model.create(user.toPersistence()));
  }

  async listAllUserByFilter({
    search,
    offset,
    limit,
  }: UserListOptions): Promise<UserListResult> {
    const where = search
      ? {
          [Op.or]: ["first_name", "last_name", "email"].map((field) => ({
            [field]: { [Op.like]: `%${search}%` },
          })),
        }
      : {};
    const result = await this.model.findAndCountAll({
      where,
      offset,
      limit,
      order: [["createdAt", "DESC"]],
    });
    return { count: result.count, rows: result.rows.map((row: UserDB) => this.toDomain(row)) };
  }

  async updateUser(user: User): Promise<User> {
    if (!user.uuid) throw new Error("Cannot update user without uuid");
    await this.model.update(user.toPersistence(), { where: { uuid: user.uuid } });
    const updated = await this.model.findByPk(user.uuid);
    if (!updated) throw new Error("User not found after update");
    return this.toDomain(updated);
  }

  async deleteUser(uuid: string): Promise<void> {
    await this.model.destroy({ where: { uuid } });
  }

  async countByRole(role: string): Promise<number> {
    return this.model.count({ where: { role } });
  }
}

export const userRepository = new SequelizeUserRepository();
