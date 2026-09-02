import assert from "node:assert/strict";
import test from "node:test";
import bcrypt from "bcryptjs";

import { User } from "../../domain/entities/User.js";
import { IUserRepository } from "../../domain/repositories/user/user.repository.js";
import {
  IUserSessionRepository,
  UserSession,
} from "../../domain/repositories/auth/user-session.repository.js";
import { AppError } from "../../core/types/errorTypes.js";
import { Auth } from "./AuthService.js";

const userUuid = "31a36d5d-0bd3-45a0-bdde-9229497f870f";

const createUser = async () =>
  new User({
    uuid: userUuid,
    first_name: "Ana",
    last_name: "Silva",
    username: "ana.silva",
    email: "ana@example.com",
    cpf: "529.982.247-25",
    password: await bcrypt.hash("secret123", 4),
    role: "admin",
  });

class MemorySessionRepository implements IUserSessionRepository {
  session: UserSession | null = null;
  nextId = 1;

  async replaceForUser(
    userId: string,
    refreshTokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    if (this.session) this.session.revokedAt = new Date();
    this.session = {
      id: this.nextId++,
      userId,
      refreshTokenHash,
      expiresAt,
      revokedAt: null,
    };
  }

  async findByRefreshTokenHash(hash: string): Promise<UserSession | null> {
    return this.session?.refreshTokenHash === hash ? { ...this.session } : null;
  }

  async rotate(
    sessionId: number,
    currentHash: string,
    newHash: string,
    expiresAt: Date,
  ): Promise<boolean> {
    if (
      !this.session ||
      this.session.id !== sessionId ||
      this.session.refreshTokenHash !== currentHash ||
      this.session.revokedAt ||
      this.session.expiresAt <= new Date()
    ) {
      return false;
    }
    this.session.refreshTokenHash = newHash;
    this.session.expiresAt = expiresAt;
    return true;
  }

  async revokeByRefreshTokenHash(hash: string): Promise<void> {
    if (this.session?.refreshTokenHash === hash) {
      this.session.revokedAt = new Date();
    }
  }
}

const createService = async () => {
  const user = await createUser();
  const users = {
    findUserByUsername: async (username: string) =>
      username === user.username ? user : null,
    findUserById: async (uuid: string) => (uuid === user.uuid ? user : null),
  } as unknown as IUserRepository;
  const sessions = new MemorySessionRepository();
  return { service: new Auth(users, sessions), sessions };
};

test("login preserves its response and replaces the active session", async () => {
  const { service, sessions } = await createService();
  const first = await service.Login("ana.silva", "secret123");
  const firstSessionId = sessions.session?.id;
  const second = await service.Login("ana.silva", "secret123");

  assert.match(first.token, /^Bearer /);
  assert.equal(first.user.uuid, userUuid);
  assert.notEqual(first.refreshToken, second.refreshToken);
  assert.notEqual(sessions.session?.id, firstSessionId);
});

test("refresh rotates the token and rejects the previous value", async () => {
  const { service } = await createService();
  const login = await service.Login("ana.silva", "secret123");
  const refreshed = await service.refresh(login.refreshToken);

  assert.match(refreshed.token, /^Bearer /);
  assert.notEqual(refreshed.refreshToken, login.refreshToken);
  await assert.rejects(
    () => service.refresh(login.refreshToken),
    (error: AppError) => error.code === "INVALID_REFRESH_TOKEN",
  );
});

test("refresh rejects expired and revoked sessions", async () => {
  const { service, sessions } = await createService();
  const login = await service.Login("ana.silva", "secret123");
  sessions.session!.expiresAt = new Date(Date.now() - 1);

  await assert.rejects(
    () => service.refresh(login.refreshToken),
    (error: AppError) => error.statusCode === 401,
  );

  const active = await service.Login("ana.silva", "secret123");
  await service.logout(active.refreshToken);
  await assert.rejects(
    () => service.refresh(active.refreshToken),
    (error: AppError) => error.code === "INVALID_REFRESH_TOKEN",
  );
});

test("logout without a cookie is idempotent", async () => {
  const { service } = await createService();
  await assert.doesNotReject(() => service.logout(undefined));
});
