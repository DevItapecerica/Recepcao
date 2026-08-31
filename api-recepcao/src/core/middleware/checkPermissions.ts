// middlewares/checkPermissions.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { validatePermission } from "../utils/validatePermission.js";

export async function checkPermissions(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const method = request.method;
  const routePath = request.url; // Ex: "/api/user/:uuid"

  const module = routePath.split("/")[3].split("?")[0] as
    | "user"
    | "visitors"
    | "visits";

  const role = request.user?.role as "user" | "admin" | "superadmin"; // JWT deve ter injetado isso antes
  if (!role || !module) {
    return reply.code(403).send({ ok: false, message: "Permissão negada" });
  }

  const validation = validatePermission(
    request.body as object,
    role,
    method,
    module
  );

  if (!validation.ok) {
    return reply.code(403).send({ ok: false, message: validation.message });
  }
}
