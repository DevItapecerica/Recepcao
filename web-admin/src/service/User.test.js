import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ post: vi.fn(), put: vi.fn() }));
vi.mock("@API/API", () => ({ default: api }));
import { postUser, updateUser } from "./User";

describe("serviço de usuários", () => {
  beforeEach(() => { api.post.mockResolvedValue({ data: {} }); api.put.mockResolvedValue({ data: {} }); });

  it("envia CPF somente na criação", async () => {
    const user = { first_name: "Ana", last_name: "Silva", role: "admin", email: "ana@example.com", cpf: "529.982.247-25", auxiliary: "ignore" };
    await postUser(user);
    await updateUser(user, "user-uuid");

    expect(api.post.mock.calls[0][1]).toHaveProperty("cpf", user.cpf);
    expect(api.post.mock.calls[0][1]).not.toHaveProperty("auxiliary");
    expect(api.put).toHaveBeenCalledWith("/user/user-uuid", { first_name: "Ana", last_name: "Silva", role: "admin", email: "ana@example.com" });
  });
});
