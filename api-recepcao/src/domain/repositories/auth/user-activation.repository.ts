export interface UserActivationToken {
  id: number;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  consumedAt: Date | null;
}

export interface IUserActivationRepository {
  replaceForUser(userId: string, tokenHash: string, expiresAt: Date): Promise<void>;
  hasPendingForUser(userId: string): Promise<boolean>;
  consume(tokenHash: string, passwordHash: string): Promise<string | null>;
}
