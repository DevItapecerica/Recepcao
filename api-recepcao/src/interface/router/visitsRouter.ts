import { FastifyInstance } from "fastify";

import { authJWT } from "../factories/auth/auth.factory.js";
import { checkPermissions } from "../../core/middleware/checkPermissions.js";
import { VisitController } from "../controller/visits/visitsController.js";
import { errorSchema } from "../../core/shared/schema/errorSchema.js";
import { paginationQuerySchema, uuidParamsSchema } from "../../core/shared/schema/querySchemas.js";

const visitsParams = {
  type: "object",
  required: ["visitor_uuid", "subject", "date"],
  properties: {
    visitor_uuid: {
      type: "string",
      //   example: "123e4567-e89b-12d3-a456-426614174000",
    },
    subject: {
      type: "string",
      //  example: "Reunião com assessor"
    },
    date: {
      type: "string",
      format: "date-time",
      //   example: "2023-10-01T12:00:00Z",
    },
  },
  additionalProperties: false,
};

const visitsResponse = {
  type: "object",
  properties: {
    uuid: { type: "string", example: "123e4567-e89b-12d3-a456-426614174000" },

    creator_uuid: {
      type: "string",
      example: "123e4567-e89b-12d3-a456-426614174000",
    },
    creator: {
      type: "object",
      properties: {
        uuid: { type: "string" },
        username: { type: "string" },
        role: { type: "string" },
      },
    },
    visitor_uuid: {
      type: "string",
      example: "123e4567-e89b-12d3-a456-426614174000",
    },
    visitor: {
      type: "object",
      properties: {
        uuid: {
          type: "string",
          example: "123e4567-e89b-12d3-a456-426614174000",
        },
        name: { type: "string", example: "João da Silva" },

        photo: {
          type: "string",
          nullable: true,
          example: "https://example.com/photo.jpg",
        },
      },
    },
    subject: { type: "string", example: "Reunião com assessor" },
    date: {
      type: "string",
      format: "date-time",
      example: "2023-10-01T12:00:00Z",
    },
    createdAt: {
      type: "string",
      format: "date-time",
      example: "2023-10-01T12:00:00Z",
    },

    updatedAt: {
      type: "string",
      format: "date-time",
      example: "2023-10-01T12:00:00Z",
    },
    deletedAt: {
      type: "string",
      format: "date-time",
      example: "2023-10-01T12:00:00Z",
    },
  },
};

const visitById = {
  type: "object",
  properties: {
    subject: { type: "string", example: "Reunião com assessor" },
    date: {
      type: "string",
      format: "date-time",
      example: "2023-10-01T12:00:00Z",
    },
  },
};

const dashboardVisitor = {
  type: "object",
  properties: {
    uuid: { type: "string" },
    name: { type: "string" },
    photo: { type: "string", nullable: true },
    visitCount: { type: "integer" },
  },
};

export async function visitsRouter(app: FastifyInstance) {
  app.addHook("preHandler", authJWT);
  app.addHook("preHandler", checkPermissions);
  const visitController = new VisitController();

  app.route({
    method: "GET",
    url: "/dashboard",
    config: {
      audit: {
        failureAction: "DASHBOARD",
        module: "VISITS",
        resourceType: "VISITS",
      },
    },
    schema: {
      tags: ["Visits"],
      description: "Retrieve monthly visit dashboard metrics",
      summary: "Get visits dashboard",
      querystring: {
        type: "object",
        properties: {
          dateFrom: { type: "string", format: "date" },
          dateTo: { type: "string", format: "date" },
          limit: { type: "integer", minimum: 1, maximum: 20, default: 5 },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            message: { type: "string" },
            period: {
              type: "object",
              properties: {
                dateFrom: { type: "string" },
                dateTo: { type: "string" },
              },
            },
            dashboard: {
              type: "object",
              properties: {
                totalVisits: { type: "integer" },
                uniqueVisitors: { type: "integer" },
                mostFrequentVisitor: {
                  anyOf: [dashboardVisitor, { type: "null" }],
                },
                ranking: { type: "array", items: dashboardVisitor },
                visitsByWeekday: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      label: { type: "string" },
                      count: { type: "integer" },
                    },
                  },
                },
                visitsByHour: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      label: { type: "string" },
                      count: { type: "integer" },
                    },
                  },
                },
              },
            },
          },
        },
        ...errorSchema,
      },
    },
    handler: visitController.getDashboard,
  });

  app.route({
    method: "GET",
    url: "/",
    config: {
      audit: {
        failureAction: "LIST",
        module: "VISITS",
        resourceType: "VISITS",
      },
    },
    schema: {
      tags: ["Visits"],
      description: "Retrieve a list of Visits",
      summary: "Get Visits",
      querystring: paginationQuerySchema,
      response: {
        200: {
          type: "object",
          properties: {
            message: { type: "string" },
            visits: { type: "array", items: visitsResponse },
            count: { type: "integer" },
          },
        },
        ...errorSchema,
      },
    },
    handler: visitController.getVisits,
  });

  app.route({
    method: "GET",
    url: "/visitor/:uuid",
    config: {
      audit: {
        failureAction: "LIST",
        module: "VISITS",
        resourceType: "VISITS",
      },
    },
    schema: {
      tags: ["Visits"],
      description: "Retrieve a list of Visits",
      summary: "Get Visits",
      params: uuidParamsSchema,
      response: {
        200: {
          type: "object",
          properties: {
            message: { type: "string" },
            visits: { type: "array", items: visitById },
          },
        },
        ...errorSchema,
      },
    },
    handler: visitController.getVisitsByVisitorId,
  });

  app.route({
    method: "POST",
    url: "/",
    config: {
      audit: {
        failureAction: "CREATE",
        module: "VISITS",
        resourceType: "VISITS",
      },
    },
    schema: {
      tags: ["Visits"],
      description: "Post a new Visit",
      summary: "Post Visits",
      body: visitsParams,

      response: {
        201: {
          type: "object",
          properties: {
            message: { type: "string" },
            visits: visitsResponse,
          },
        },
        ...errorSchema,
      },
    },
    handler: visitController.postVisits,
  });
}
