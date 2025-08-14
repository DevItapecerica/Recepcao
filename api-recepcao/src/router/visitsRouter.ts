import { FastifyInstance } from "fastify";

import { authJWT } from "../middleware/authJWT.js";
import { checkPermissions } from "../middleware/checkPermissions.js";
import {
  getVisits,
  getVisitsByVisitorId,
  postVisits,
} from "../controller/visits/visitsController.js";

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
        500: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
    handler: getVisits,
  });

  app.route({
    method: "GET",
    url: "/visitor/:uuid",
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
        500: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
    handler: getVisitsByVisitorId,
  });

  app.route({
    method: "POST",
    url: "/",
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
        500: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
    handler: postVisits,
  });
}
