import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";

import { AuthResult, RefreshResult } from "../../core/types/authTypes.js";
import { AppError } from "../../core/types/errorTypes.js";
import { SECRET_KEY_JWT } from "../../core/config/env.js";
import { IUserRepository } from "../../domain/repositories/user/user.repository.js";
import { IUserSessionRepository } from "../../domain/repositories/auth/user-session.repository.js";

const ACCESS_TOKEN_DURATION = "15m";
const REFRESH_TOKEN_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export class Auth {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userSessionRepository: IUserSessionRepository,
  ) {}

  private createAccessToken(user: {
    uuid: string;
    username: string;
    role: string;
  }): string {
    const token = jwt.sign(
      { uuid: user.uuid, name: user.username, role: user.role },
      SECRET_KEY_JWT,
      { expiresIn: ACCESS_TOKEN_DURATION },
    );
    return `Bearer ${token}`;
  }

  private createRefreshToken(): string {
    return randomBytes(32).toString("base64url");
  }

  private hashRefreshToken(refreshToken: string): string {
    return createHash("sha256").update(refreshToken).digest("hex");
  }

  private refreshExpiresAt(): Date {
    return new Date(Date.now() + REFRESH_TOKEN_DURATION_MS);
  }

  async Login(username: string, password: string): Promise<AuthResult> {
    const user = await this.userRepository.findUserByUsername(username);

    if (!user) {
      throw new AppError("Usuário ou senha inválidos", 401, "UNAUTHORIZED");
    }

    const valid =
      user.passwordHash && (await bcrypt.compare(password, user.passwordHash));

    if (!valid) {
      throw new AppError("Usuário ou senha inválidos", 401, "UNAUTHORIZED");
    }

    if (!user.uuid) {
      throw new AppError("Usuário inválido", 500, "INVALID_USER");
    }

    const refreshToken = this.createRefreshToken();
    await this.userSessionRepository.replaceForUser(
      user.uuid,
      this.hashRefreshToken(refreshToken),
      this.refreshExpiresAt(),
    );

    return {
      user: {
        uuid: user.uuid,
        name: user.username,
        role: user.role,
        firstLogin: user.firstLogin,
      },
      token: this.createAccessToken({
        uuid: user.uuid,
        username: user.username,
        role: user.role,
      }),
      refreshToken,
    };
  }

  async refresh(refreshToken: string | undefined): Promise<RefreshResult> {
    if (!refreshToken) {
      throw new AppError(
        "Refresh token invÃ¡lido",
        401,
        "INVALID_REFRESH_TOKEN",
      );
    }

    const currentHash = this.hashRefreshToken(refreshToken);
    const session =
      await this.userSessionRepository.findByRefreshTokenHash(currentHash);

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt.getTime() <= Date.now()
    ) {
      throw new AppError(
        "Refresh token invÃ¡lido ou expirado",
        401,
        "INVALID_REFRESH_TOKEN",
      );
    }

    const user = await this.userRepository.findUserById(session.userId);
    if (!user?.uuid) {
      await this.userSessionRepository.revokeByRefreshTokenHash(currentHash);
      throw new AppError(
        "Refresh token invÃ¡lido",
        401,
        "INVALID_REFRESH_TOKEN",
      );
    }

    const nextRefreshToken = this.createRefreshToken();
    const rotated = await this.userSessionRepository.rotate(
      session.id,
      currentHash,
      this.hashRefreshToken(nextRefreshToken),
      this.refreshExpiresAt(),
    );

    if (!rotated) {
      throw new AppError(
        "Refresh token invÃ¡lido",
        401,
        "INVALID_REFRESH_TOKEN",
      );
    }

    return {
      token: this.createAccessToken({
        uuid: user.uuid,
        username: user.username,
        role: user.role,
      }),
      refreshToken: nextRefreshToken,
    };
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;
    await this.userSessionRepository.revokeByRefreshTokenHash(
      this.hashRefreshToken(refreshToken),
    );
  }
}
