import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import { CORS_ORIGIN } from "../../core/config/env.js";
import { AppError } from "../../core/types/errorTypes.js";
import { assertStrongPassword } from "../../core/utils/passwordPolicy.js";
import { sendMail } from "../../core/utils/sendMail.js";
import { IUserActivationRepository } from "../../domain/repositories/auth/user-activation.repository.js";
import { IUserRepository } from "../../domain/repositories/user/user.repository.js";

const ACTIVATION_DURATION_MS = 24 * 60 * 60 * 1000;

export class ActivationService {
  constructor(private readonly users: IUserRepository, private readonly activations: IUserActivationRepository) {}

  async issue(userId: string): Promise<boolean> {
    const user = await this.users.findUserById(userId);
    if (!user) throw new AppError("Usuário não encontrado", 404, "NOT_FOUND");
    const token = randomBytes(32).toString("base64url");
    const hash = createHash("sha256").update(token).digest("hex");
    await this.activations.replaceForUser(userId, hash, new Date(Date.now() + ACTIVATION_DURATION_MS));
    const frontendUrl = CORS_ORIGIN.split(",")[0].trim().replace(/\/$/, "");
    try {
      await sendMail(user.email, "Ative seu acesso à Recepção", `Defina sua senha em: ${frontendUrl}/Activate?token=${encodeURIComponent(token)}\n\nEste link expira em 24 horas.`);
      return true;
    } catch(error) {
      throw new AppError("Ativação indisponível", 500, "ACTIVATION_UNAVAILABLE", error);
    }
  }

  async activate(token: string, password: string): Promise<void> {
    assertStrongPassword(password);
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const passwordHash = await bcrypt.hash(password, 12);
    const userId = await this.activations.consume(tokenHash, passwordHash);
    if (!userId) throw new AppError("Link de ativação inválido ou expirado", 400, "INVALID_ACTIVATION_TOKEN");
  }
}
