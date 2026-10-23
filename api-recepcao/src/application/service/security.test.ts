import assert from "node:assert/strict";
import test from "node:test";
import bcrypt from "bcryptjs";
import { User } from "../../domain/entities/User.js";
import { IUserRepository } from "../../domain/repositories/user/user.repository.js";
import { UserPolicyDomainService } from "../../domain/services/user/userPolicy.domain.service.js";
import { UserService } from "./UserService.js";
import { ActivationService } from "./ActivationService.js";
import { IUserActivationRepository } from "../../domain/repositories/auth/user-activation.repository.js";
import { IUserSessionRepository } from "../../domain/repositories/auth/user-session.repository.js";

const uuid = "31a36d5d-0bd3-45a0-bdde-9229497f870f";
const makeUser = async (role: "user" | "admin" | "superadmin" = "user") => new User({
  uuid, first_name: "Ana", last_name: "Silva", username: "ana.silva",
  email: "ana@example.com", cpf: "529.982.247-25", password: await bcrypt.hash("SenhaAntiga1!", 4), role,
});

const repositoryFor = (user: User | null, superadmins = 1) => ({
  findUserById: async () => user,
  findUserByUsername: async () => user,
  findUserDuplicateByEmailOrCpf: async () => false,
  createNewUser: async (value: User) => value,
  listAllUserByFilter: async () => ({ rows: user ? [user] : [], count: user ? 1 : 0 }),
  updateUser: async (value: User) => value,
  deleteUser: async () => undefined,
  countByRole: async () => superadmins,
}) as IUserRepository;

test("admin cannot create privileged roles", async () => {
  const repository = repositoryFor(null);
  const service = new UserService(repository, new UserPolicyDomainService(repository));
  await assert.rejects(() => service.CreateUser({ first_name: "Aline", last_name: "Souza", email: "aline@example.com", cpf: "529.982.247-25", role: "superadmin" }, "admin"), (error: any) => error.code === "ROLE_ESCALATION");
});

test("prevents self deletion and deletion of the last superadmin", async () => {
  const user = await makeUser("superadmin");
  const repository = repositoryFor(user);
  const service = new UserService(repository, new UserPolicyDomainService(repository));
  await assert.rejects(() => service.deleteUser(uuid, uuid), (error: any) => error.code === "SELF_DELETE");
  await assert.rejects(() => service.deleteUser(uuid, "another-user"), (error: any) => error.code === "LAST_SUPERADMIN");
});

test("activation hashes the password and rejects token reuse", async () => {
  let available = true;
  let receivedTokenHash = "";
  let receivedPasswordHash = "";
  const activations = {
    replaceForUser: async () => undefined,
    hasPendingForUser: async () => available,
    consume: async (tokenHash: string, passwordHash: string) => {
      receivedTokenHash = tokenHash; receivedPasswordHash = passwordHash;
      if (!available) return null; available = false; return uuid;
    },
  } as IUserActivationRepository;
  const service = new ActivationService(repositoryFor(await makeUser()), activations);
  await service.activate("opaque-activation-token", "SenhaForte1!");
  assert.equal(receivedTokenHash.length, 64);
  assert.equal(await bcrypt.compare("SenhaForte1!", receivedPasswordHash), true);
  await assert.rejects(() => service.activate("opaque-activation-token", "SenhaForte1!"));
});

test("password change revokes every active session", async () => {
  const user = await makeUser();
  let revokedUserId = "";
  const sessions = {
    revokeAllForUser: async (userId: string) => { revokedUserId = userId; },
  } as IUserSessionRepository;
  const repository = repositoryFor(user);
  const service = new UserService(repository, new UserPolicyDomainService(repository), undefined, sessions);
  await service.alterPassword(uuid, "SenhaAntiga1!", "SenhaNovaForte2@");
  assert.equal(revokedUserId, uuid);
});
