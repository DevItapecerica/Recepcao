import assert from "node:assert/strict";
import test from "node:test";
import { FastifyRequest } from "fastify";
import { checkPermissions } from "./checkPermissions.js";

const requestFor = (resource: string, method: string, role = "viewer") => ({
  method,
  user: { role },
  routeOptions: { config: { permission: { resource } } },
}) as FastifyRequest;

test("viewer can only read the dashboard", async () => {
  await checkPermissions(requestFor("dashboard", "GET"));
  for (const resource of ["users", "visitors", "visits", "occurrences", "subjects", "attendants"]) {
    for (const method of ["GET", "POST", "PUT", "PATCH", "DELETE"]) {
      await assert.rejects(checkPermissions(requestFor(resource, method)), { code: "FORBIDDEN" });
    }
  }
  for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
    await assert.rejects(checkPermissions(requestFor("dashboard", method)), { code: "FORBIDDEN" });
  }
});

test("existing roles can still read the dashboard", async () => {
  for (const role of ["user", "recepcionist", "admin", "superadmin"]) {
    await checkPermissions(requestFor("dashboard", "GET", role));
  }
});

test("unknown roles are forbidden", async () => {
  await assert.rejects(checkPermissions(requestFor("dashboard", "GET", "unknown")), { code: "FORBIDDEN" });
});
