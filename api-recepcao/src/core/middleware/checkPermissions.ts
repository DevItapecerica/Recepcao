
import { FastifyRequest } from "fastify";
import { AppError } from "../types/errorTypes.js";

const permissions = {
  users: {
    user: [],
    recepcionist: [],
    admin: ["GET", "POST", "PUT"],
    superadmin: ["GET", "POST", "PUT", "DELETE"],
  },

  visitors: {
    user: ["GET", "POST", "PUT"],
    recepcionist: ["GET", "POST", "PUT"],
    admin: ["GET", "POST", "PUT"],
    superadmin: ["GET", "POST", "PUT", "DELETE"],
  },

  visits: {
    user: ["GET", "POST"],
    recepcionist: ["GET", "POST"],
    admin: ["GET", "POST"],
    superadmin: ["GET", "POST", "PUT", "DELETE"],
  },

  occurrences: {
    user: ["GET"],
    recepcionist: ["GET", "POST", "PUT", "DELETE"],
    admin: ["GET", "POST", "PUT", "DELETE"],
    superadmin: ["GET", "POST", "PUT", "DELETE"],
  },

  subjects: {
    user: ["GET"],
    recepcionist: ["GET"],
    admin: ["GET", "POST", "PUT"],
    superadmin: ["GET", "POST", "PUT", "DELETE"],
  },

  attendants: {
    user: ["GET"],
    recepcionist: ["GET"],
    admin: ["GET", "POST", "PUT"],
    superadmin: ["GET", "POST", "PUT", "DELETE"],
  },
} as const;

export async function checkPermissions(
  request: FastifyRequest,
): Promise<void> {
  const resource = request.routeOptions.config.permission?.resource;
  const role = request.user?.role as
    | "user"
    | "recepcionist"
    | "admin"
    | "superadmin";

  const allowed =
    resource && role && resource in permissions
      ? permissions[resource as keyof typeof permissions][role]
      : [];

  if (!(allowed as readonly string[]).includes(request.method)) {
    throw new AppError("Permissão negada", 403, "FORBIDDEN");
  }
}
