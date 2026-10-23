import assert from "node:assert/strict";
import test from "node:test";
import { User } from "./User.js";
import { Visitor } from "./Visitor.js";

test("validates CPF in user and visitor entities", () => {
  const validCpf = "529.982.247-25";
  const user = new User({
    first_name: "Ana", last_name: "Silva", username: "ana.silva",
    email: "ana@example.com", cpf: validCpf, password: "hash", role: "user",
  });

  assert.equal(user.isValidCpf(), true);
  assert.equal(Visitor.create({ name: "Ana", cpf: validCpf }).isValidCpf(), true);
  assert.equal(Visitor.create({ name: "Ana", cpf: "111.111.111-11" }).isValidCpf(), false);
});
