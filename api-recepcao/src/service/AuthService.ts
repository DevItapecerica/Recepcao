import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserService } from "./UserService.js";
import { AuthResult } from "../core/types/authTypes.js";

import { SECRET_KEY_JWT } from "../core/config/env.js";

export class Auth {
  static async Login(username: string, password: string): Promise<AuthResult> {
    const user = await UserService.findUserByUsername(username);

    if (!user) {
      return { ok: false, code: 403, message: "Usuário ou senha inválidos" };
    }

    const valid =
      user.password && (await bcrypt.compare(password, user.password));

    if (!valid) {
      return { ok: false, code: 403, message: "Usuário ou senha inválidos" };
    }

    const token = jwt.sign(
      { uuid: user.uuid, name: user.username, role: user.role },
      SECRET_KEY_JWT!,
      { expiresIn: "3h" }
    );

    const tokenResult = `Bearer ${token}`;

    return {
      ok: true,
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
