import { FastifyInstance } from "fastify";
import {
  createUserController,
  deleteUserController,
  getUsersController,
  updateUserController,
} from "../controller/user/userController.js";

import { authJWT } from "../core/middleware/authJWT.js";
import { checkPermissions } from "../core/middleware/checkPermissions.js";
import { APPLICATION_ENVORIMENT } from "../core/config/env.js";

const userSchema = {
  type: "object",
  required: ["first_name", "last_name", "role", "email", "cpf"],
  properties: {
    first_name: { type: "string" },
    last_name: { type: "string" },
    role: { type: "string" },
    email: { type: "string", format: "email" },
    password: { type: "string" },
    cpf: { type: "string" },
  },
  additionalProperties: false,
};

const userUpdateSchema = {
  type: "object",
  required: ["first_name", "last_name", "role", "email"],
  properties: {
    first_name: { type: "string" },
    last_name: { type: "string" },
    role: { type: "string" },
    email: { type: "string", format: "email" },
  },
  additionalProperties: false,
};

const responseUserSchema = {
  type: "object",
  properties: {
    uuid: { type: "string" },
    first_name: { type: "string" },
    last_name: { type: "string" },
    role: { type: "string" },
    email: { type: "string" },
    username: { type: "string" },
  },
};

export async function userRouter(app: FastifyInstance) {
  if (APPLICATION_ENVORIMENT != "dev") {
    app.addHook("preHandler", authJWT);
    app.addHook("preHandler", checkPermissions);
  }

  // app.addHook("preHandler", authJWT);
  // app.addHook("preHandler", checkPermissions);

  app.route({
    method: "POST",
    url: "/",
    schema: {
      tags: ["User"],
      description:
        "Let you create new Users to login and usage the application",
      summary: "Create New User",
      body: userSchema,
      response: {
        201: {
          description: "User created successfully",
          type: "object",
          properties: {
            message: { type: "string" },
            newUser: responseUserSchema,
          },
        },
        400: {
          description: "Bad Request",
          type: "object",
          properties: {
            message: { type: "string", example: "Invalid input data" },
          },
        },
        401: {
          description: "Unauthorized",
          type: "object",
          properties: {
            message: { type: "string", example: "Unauthorized" },
          },
        },
        403: {
          description: "Forbidden",
          type: "object",
          properties: {
            message: { type: "string", example: "User already exists" },
          },
        },
        500: {
          description: "Internal Server Error",
          type: "object",
          properties: {
            message: { type: "string", example: "Impossible create user" },
          },
        },
      },
    },
    handler: createUserController, // Seu controlador
  });

  app.route({
    method: "PUT",
    url: "/:uuid",
    schema: {
      tags: ["User"],
      description: "Let you update Users and usage the application",
      summary: "Update New User",
      body: userUpdateSchema,
      response: {
        200: {
          description: "User created successfully",
          type: "object",
          properties: {
            message: { type: "string" },
            user: responseUserSchema,
          },
        },
        400: {
          description: "Bad Request",
          type: "object",
          properties: {
            message: { type: "string", example: "Invalid input data" },
          },
        },
        401: {
          description: "Unauthorized",
          type: "object",
          properties: {
            message: { type: "string", example: "Unauthorized" },
          },
        },
        403: {
          description: "Forbidden",
          type: "object",
          properties: {
            message: { type: "string", example: "User already exists" },
          },
        },
        404: {
          description: "Not Found",
          type: "object",
          properties: {
            message: { type: "string", example: "User not found" },
          },
        },
        500: {
          description: "Internal Server Error",
          type: "object",
          properties: {
            message: { type: "string", example: "Impossible create user" },
          },
        },
      },
    },
    handler: updateUserController, // Seu controlador
  });

  app.route({
    method: "GET",
    url: "/",
    schema: {
      tags: ["User"],
      description: "Get all users",
      summary: "Get Users",
      response: {
        200: {
          description: "List of users",
          type: "object",
          properties: {
            user: {
              type: "array",
              items: responseUserSchema,
            },
            count: { type: "integer" },
            message: { type: "string" },
          },
        },
        401: {
          description: "Unauthorized",
          type: "object",
          properties: {
            message: { type: "string", example: "Unauthorized" },
          },
        },
        500: {
          description: "Internal Server Error",
          type: "object",
          properties: {
            message: { type: "string", example: "Impossible list users" },
          },
        },
      },
    },
    handler: getUsersController,
  });

  app.route({
    method: "delete",
    url: "/:uuid",
    schema: {
      tags: ["User"],
      description: "Let you Delete Users in the application",
      summary: "Delete Users",
      response: {
        200: {
          description: "User Delete successfully",
          type: "object",
          properties: {
            message: { type: "string", example: "user deleted successfully" },
          },
        },
        401: {
          description: "Unauthorized",
          type: "object",
          properties: {
            message: { type: "string", example: "Unauthorized" },
          },
        },
        404: {
          description: "Not Found",
          type: "object",
          properties: {
            message: { type: "string", example: "User not found" },
          },
        },
        500: {
          description: "Internal Server Error",
          type: "object",
          properties: {
            message: { type: "string", example: "Impossible Delete user" },
          },
        },
      },
    },
    handler: deleteUserController, // Seu controlador
  });
}
