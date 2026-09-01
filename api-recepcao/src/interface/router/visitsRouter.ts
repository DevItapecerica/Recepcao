import { FastifyInstance } from "fastify";

import { authJWT } from "../../core/middleware/authJWT.js";
import { checkPermissions } from "../../core/middleware/checkPermissions.js";
import {
  getVisits,
  getVisitsByVisitorId,
  postVisits,
} from "../controller/visits/visitsController.js";
import { errorSchema } from "../../core/shared/schema/errorSchema.js";

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

export async function visitsRouter(app: FastifyInstance) {
  app.addHook("preHandler", authJWT);
  app.addHook("preHandler", checkPermissions);

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
      response: {
        200: {
          type: "object",
          properties: {
            message: { type: "string" },
            visits: { type: "array", item: visitsResponse },
            count: { type: "integer" },
          },
        },
        ...errorSchema,
      },
    },
    handler: getVisits,
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
      response: {
        200: {
          type: "object",
          properties: {
            message: { type: "string" },
            visits: { type: "array", item: visitById },
          },
        },
        ...errorSchema,
      },
    },
    handler: getVisitsByVisitorId,
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
        200: {
          type: "object",
          properties: {
            message: { type: "string" },
            visits: {
              type: "array",
              items: visitsResponse,
            },
          },
        },
        ...errorSchema,
      },
    },
    handler: postVisits,
  });
}
