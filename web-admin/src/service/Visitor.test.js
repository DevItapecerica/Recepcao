import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ post: vi.fn(), put: vi.fn() }));
vi.mock("@API/API", () => ({ default: api }));
import { postVisitor, putVisitor } from "./Visitor";

describe("serviço de visitantes", () => {
  beforeEach(() => { api.post.mockResolvedValue({ data: {} }); api.put.mockResolvedValue({ data: {} }); });

  it("mantém CPF somente na criação", async () => {
    const visitor = { name: "Maria", cpf: "529.982.247-25", email: "maria@example.com" };
    await postVisitor(visitor);
    await putVisitor(visitor, "visitor-uuid");

    expect(api.post.mock.calls[0][1]).toHaveProperty("cpf", visitor.cpf);
    expect(api.put.mock.calls[0][1]).not.toHaveProperty("cpf");
    expect(api.put.mock.calls[0][1]).not.toHaveProperty("uuid");
  });
});
