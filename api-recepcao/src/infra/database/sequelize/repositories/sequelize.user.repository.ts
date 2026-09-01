import { Op } from "sequelize";
import { IUserRepository, UserListOptions, UserListResult } from "../../../../core/repositories/user.repository.js";
import { UserRequired } from "../../../../application/dto/user/userTypes.js";
import db from "../index.js";
import { UserDB } from "../models/user.model.js";

export class SequelizeUserRepository implements IUserRepository {
  private get model() {
    return db.UserModel;
  }

  async findById(uuid: string): Promise<UserDB | null> {
    return this.model.findByPk(uuid);
  }

  async findByUsername(username: string): Promise<UserDB | null> {
    return this.model.findOne({ where: { username } });
  }

  async findDuplicate(email: string, cpf?: string | null, excludeUuid?: string): Promise<UserDB | null> {
    const candidates = cpf ? [{ email }, { cpf }] : [{ email }];
    const where: Record<PropertyKey, unknown> = { [Op.or]: candidates };
    if (excludeUuid) where.uuid = { [Op.ne]: excludeUuid };
    return this.model.findOne({ where });
  }

  async create(data: UserRequired & { username: string; password: string }): Promise<UserDB> {
    return this.model.create(data);
  }

  async list({ search, offset, limit }: UserListOptions): Promise<UserListResult> {
    const where = search
      ? { [Op.or]: ["first_name", "last_name", "email"].map((field) => ({ [field]: { [Op.like]: `%${search}%` } })) }
      : {};
    return this.model.findAndCountAll({
      where,
      attributes: { exclude: ["password", "cpf"] },
      offset,
      limit,
      order: [["createdAt", "DESC"]],
    });
  }

  async save(user: UserDB): Promise<UserDB> {
    return user.save();
  }

  async delete(user: UserDB): Promise<void> {
    await user.destroy();
  }
}

export const userRepository = new SequelizeUserRepository();
