import assert from "node:assert/strict";
import test from "node:test";
import { Visitor } from "../../domain/entities/Visitor.js";
import { IVisitorRepository } from "../../domain/repositories/visitor/visitor.repository.js";
import { VisitorPolicyDomainService } from "../../domain/services/visitor/visitorPolicy.domain.service.js";
import { VisitorsService } from "./VisitorService.js";

test("updates a visitor without changing its CPF", async () => {
  const visitor = Visitor.create({
    uuid: "31a36d5d-0bd3-45a0-bdde-9229497f870f",
    name: "Old name",
    cpf: "529.982.247-25",
  });
  const repository = {
    findById: async () => visitor,
    save: async (value: Visitor) => value,
  } as unknown as IVisitorRepository;
  const service = new VisitorsService(
    repository,
    new VisitorPolicyDomainService(repository),
  );

  const result = await service.updateVisitor(visitor.uuid!, {
    name: "New name",
    email: "new@example.com",
  });

  assert.equal(result.visitor?.name, "New name");
  assert.equal(result.visitor?.cpf, "529.982.247-25");
});
