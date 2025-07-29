import { FastifyInstance } from "fastify";
import {
  createVisitorController,
  getVisitorsController,
  deleteVisitorController
} from "../controller/visitors/visitorsController.js";

const visitorParams = {
  type: "object",
  required: ["name", "cpf"],
  properties: {
    name: { type: "string" },
    cpf: { type: "string" },
    photo: { type: "string", nullable: true },
    email: { type: "string", nullable: true },
    phone: { type: "string", nullable: true },
    address: { type: "string", nullable: true },
    city: { type: "string", nullable: true },
    state: { type: "string", nullable: true },
    zipCode: { type: "string", nullable: true },
  },
  additionalProperties: false,
};

const visitorResponse = {
  type: "object",
  properties: {
    uuid: { type: "string", example: "123e4567-e89b-12d3-a456-426614174000" },
    name: { type: "string", example: "João da Silva" },

    email: { type: "string", nullable: true, example: "kadoia@gmail.com" },
    phone: { type: "string", nullable: true, example: "11987654321" },
    address: { type: "string", nullable: true, example: "Rua Exemplo, 123" },
    city: { type: "string", nullable: true, example: "São Paulo" },
    state: { type: "string", nullable: true, example: "SP" },
    zipCode: { type: "string", nullable: true, example: "01000-000" },

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
  },
};

export async function visitorRouter(app: FastifyInstance) {
  app.route({
    method: "GET",
    url: "/",
    schema: {
      tags: ["Visitor"],
      description: "Retrieve a list of Visitors",
      summary: "Get Visitors",
      response: {
        200: {
          type: "object",
          properties: {
            message: { type: "string" },
            visitor: {
              type: "array",
              items: visitorResponse,
            },
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
    handler: getVisitorsController,
  });

  app.route({
    method: "POST",
    url: "/",
    schema: {
      tags: ["Visitor"],
      description: "Create a new Visitor",
      summary: "Create Visitor",
      body: visitorParams,

      response: {
        201: {
          type: "object",
          properties: {
            message: { type: "string" },
            visitor: visitorResponse,
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
    handler: createVisitorController,
  });

  app.route({
    method: "DELETE",
    url: "/:uuid",
    schema: {
      tags: ["Visitor"],
      description: "Delete a Visitor",
      summary: "Delete Visitor",
      response: {
        200: {
          type: "object",
          properties: {
            message: { type: "string" },
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
    handler: deleteVisitorController,
  });
}
