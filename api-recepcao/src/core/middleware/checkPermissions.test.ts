import assert from "node:assert/strict";
import test from "node:test";
import { FastifyRequest } from "fastify";
import { checkPermissions } from "./checkPermissions.js";

const requestFor = (resource: string, method: string, role = "viewer") => ({
  method,
  user: { role },
  routeOptions: { config: { permission: { resource } } },
}) as FastifyRequest;

test("viewer pode apenas consultar o painel e as visitas", async () => {
  await checkPermissions(requestFor("dashboard", "GET"));
  await checkPermissions(requestFor("visits", "GET"));
  for (const resource of ["users", "visitors", "occurrences", "subjects", "attendants"]) {
    for (const method of ["GET", "POST", "PUT", "PATCH", "DELETE"]) {
      await assert.rejects(checkPermissions(requestFor(resource, method)), { code: "FORBIDDEN" });
    }
  }
  for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
    await assert.rejects(checkPermissions(requestFor("dashboard", method)), { code: "FORBIDDEN" });
    await assert.rejects(checkPermissions(requestFor("visits", method)), { code: "FORBIDDEN" });
  }
});

test("os demais perfis continuam podendo consultar o painel", async () => {
  for (const role of ["user", "recepcionist", "admin", "superadmin"]) {
    await checkPermissions(requestFor("dashboard", "GET", role));
  }
});

test("perfis desconhecidos têm acesso negado", async () => {
  await assert.rejects(checkPermissions(requestFor("dashboard", "GET", "unknown")), { code: "FORBIDDEN" });
});
