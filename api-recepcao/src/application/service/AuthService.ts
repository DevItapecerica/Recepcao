import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { AuthResult } from "../../core/types/authTypes.js";
import { AppError } from "../../core/types/errorTypes.js";
import { SECRET_KEY_JWT } from "../../core/config/env.js";
import { userRepository } from "../../infra/database/sequelize/repositories/sequelize.user.repository.js";

export class Auth {
  static async Login(username: string, password: string): Promise<AuthResult> {
    const user = await userRepository.findUserByUsername(username);

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

    const token = jwt.sign(
      { uuid: user.uuid, name: user.username, role: user.role },
      SECRET_KEY_JWT,
      { expiresIn: "3h" },
    );

    const tokenResult = `Bearer ${token}`;

    return {
      user: {
        uuid: user.uuid,
        name: user.username,
        role: user.role,
        firstLogin: user.firstLogin,
      },
      token: tokenResult,
    };
  }
}
