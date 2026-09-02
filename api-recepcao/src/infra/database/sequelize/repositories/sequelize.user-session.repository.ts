import { Op } from "sequelize";

import db from "../index.js";
import { UserSessionDB } from "../models/user-session.model.js";
import {
  IUserSessionRepository,
  UserSession,
} from "../../../../domain/repositories/auth/user-session.repository.js";

export class SequelizeUserSessionRepository
  implements IUserSessionRepository
{
  private get model() {
    return db.UserSessionModel;
  }

  private toDomain(model: UserSessionDB): UserSession {
    const session = model.get({ plain: true });
    return {
      id: session.id,
      userId: session.userId,
      refreshTokenHash: session.refreshTokenHash,
      expiresAt: session.expiresAt,
      revokedAt: session.revokedAt,
    };
  }

  async replaceForUser(
    userId: string,
    refreshTokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await db.sequelize.transaction(async (transaction) => {
      await db.UserModel.findByPk(userId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      await this.model.update(
        { revokedAt: new Date() },
        { where: { userId, revokedAt: null }, transaction },
      );
      await this.model.create(
        { userId, refreshTokenHash, expiresAt, revokedAt: null },
        { transaction },
      );
    });
  }

  async findByRefreshTokenHash(
    refreshTokenHash: string,
  ): Promise<UserSession | null> {
    const session = await this.model.findOne({ where: { refreshTokenHash } });
    return session ? this.toDomain(session) : null;
  }

  async rotate(
    sessionId: number,
    currentRefreshTokenHash: string,
    newRefreshTokenHash: string,
    expiresAt: Date,
  ): Promise<boolean> {
    const [updated] = await this.model.update(
      { refreshTokenHash: newRefreshTokenHash, expiresAt },
      {
        where: {
          id: sessionId,
          refreshTokenHash: currentRefreshTokenHash,
          revokedAt: null,
          expiresAt: { [Op.gt]: new Date() },
        },
      },
    );
    return updated === 1;
  }

  async revokeByRefreshTokenHash(refreshTokenHash: string): Promise<void> {
    await this.model.update(
      { revokedAt: new Date() },
      { where: { refreshTokenHash, revokedAt: null } },
    );
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.model.update({ revokedAt: new Date() }, { where: { userId, revokedAt: null } });
  }
}
