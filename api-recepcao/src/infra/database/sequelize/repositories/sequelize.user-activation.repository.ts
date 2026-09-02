import { Op } from "sequelize";
import db from "../index.js";
import { IUserActivationRepository } from "../../../../domain/repositories/auth/user-activation.repository.js";

export class SequelizeUserActivationRepository implements IUserActivationRepository {
  private get model() { return db.UserActivationModel; }

  async replaceForUser(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await db.sequelize.transaction(async (transaction) => {
      await db.UserModel.findByPk(userId, { transaction, lock: transaction.LOCK.UPDATE });
      await this.model.update({ consumedAt: new Date() }, { where: { userId, consumedAt: null }, transaction });
      await this.model.create({ userId, tokenHash, expiresAt, consumedAt: null }, { transaction });
    });
  }

  async hasPendingForUser(userId: string): Promise<boolean> {
    return Boolean(await this.model.findOne({ where: { userId, consumedAt: null } }));
  }

  async consume(tokenHash: string, passwordHash: string): Promise<string | null> {
    return db.sequelize.transaction(async (transaction) => {
      const token = await this.model.findOne({
        where: { tokenHash, consumedAt: null, expiresAt: { [Op.gt]: new Date() } },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!token) return null;
      const [updatedUsers] = await db.UserModel.update({ password: passwordHash, firstLogin: false }, { where: { uuid: token.userId }, transaction });
      if (updatedUsers !== 1) return null;
      await this.model.update({ consumedAt: new Date() }, { where: { userId: token.userId, consumedAt: null }, transaction });
      return token.userId;
    });
  }
}
