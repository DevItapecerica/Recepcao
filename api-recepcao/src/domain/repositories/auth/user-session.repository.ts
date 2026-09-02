export interface UserSession {
  id: number;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
}

export interface IUserSessionRepository {
  replaceForUser(
    userId: string,
    refreshTokenHash: string,
    expiresAt: Date,
  ): Promise<void>;
  findByRefreshTokenHash(refreshTokenHash: string): Promise<UserSession | null>;
  rotate(
    sessionId: number,
    currentRefreshTokenHash: string,
    newRefreshTokenHash: string,
    expiresAt: Date,
  ): Promise<boolean>;
  revokeByRefreshTokenHash(refreshTokenHash: string): Promise<void>;
}
