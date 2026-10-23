import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { cpf as cpfValidator } from "cpf-cnpj-validator";
import { QueryInterface } from "sequelize";
import { assertStrongPassword } from "../../../../core/utils/passwordPolicy.js";

const requiredEnv = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Env ${name} is required to seed the initial administrator`);
  return value;
};

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const username = requiredEnv("ADMIN_USERNAME");
    const email = requiredEnv("ADMIN_EMAIL").toLowerCase();
    const password = requiredEnv("ADMIN_PASSWORD");
    const cpf = requiredEnv("ADMIN_CPF");

    if (username.length > 50) throw new Error("ADMIN_USERNAME must have at most 50 characters");
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) throw new Error("ADMIN_EMAIL is invalid");
    if (!cpfValidator.isValid(cpf)) throw new Error("ADMIN_CPF is invalid");
    assertStrongPassword(password);

    const passwordHash = await bcrypt.hash(password, 12);
    const now = new Date();

    await queryInterface.sequelize.transaction(async (transaction) => {
      const existingUuid = await queryInterface.rawSelect(
        "users",
        { where: { username }, transaction },
        "uuid",
      );

      if (existingUuid) {
        await queryInterface.bulkUpdate(
          "users",
          {
            password: passwordHash,
            role: "superadmin",
            firstLogin: false,
            deletedAt: null,
            updatedAt: now,
          },
          { username },
          { transaction },
        );
        await queryInterface.bulkUpdate(
          "user_sessions",
          { revoked_at: now, updated_at: now },
          { user_id: existingUuid, revoked_at: null },
          { transaction },
        );
        await queryInterface.bulkUpdate(
          "user_activation_tokens",
          { consumed_at: now, updated_at: now },
          { user_id: existingUuid, consumed_at: null },
          { transaction },
        );
        return;
      }

      await queryInterface.bulkInsert(
        "users",
        [{
          uuid: randomUUID(),
          first_name: "admin",
          last_name: "admin",
          username,
          email,
          cpf,
          password: passwordHash,
          role: "superadmin",
          firstLogin: false,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        }],
        { transaction },
      );
    });
  },

  // O rollback não remove nem desativa uma conta administrativa existente.
  down: async (): Promise<void> => undefined,
};
