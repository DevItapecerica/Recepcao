import { FastifyInstance } from "fastify";
import { authJWT } from "../../core/middleware/authJWT.js";
import { checkPermissions } from "../../core/middleware/checkPermissions.js";
import { UserController } from "../controller/user/userController.js";
import { errorSchema } from "../../core/shared/schema/errorSchema.js";

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
  app.addHook("preHandler", authJWT);
  app.addHook("preHandler", checkPermissions);

  const userController = new UserController();

  app.route({
    method: "POST",
    url: "/",
    config: {
      audit: {
        failureAction: "CREATE",
        module: "user",
        resourceType: "user",
      },
    },
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
        ...errorSchema,
      },
    },
    handler: userController.createUserController, // Seu controlador
  });

  app.route({
    method: "PUT",
    url: "/:uuid",
    config: {
      audit: {
        failureAction: "UPDATE",
        module: "user",
        resourceType: "user",
      },
    },
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
        ...errorSchema,
      },
    },
    handler: userController.updateUserController, // Seu controlador
  });

  app.route({
    method: "GET",
    url: "/",
    config: {
      audit: {
        failureAction: "LIST",
        module: "user",
        resourceType: "user",
      },
    },
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
        ...errorSchema,
      },
    },
    handler: userController.getUsersController,
  });

  app.route({
    method: "delete",
    url: "/:uuid",
    config: {
      audit: {
        failureAction: "DELETE",
        module: "user",
        resourceType: "user",
      },
    },
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
        ...errorSchema,
      },
    },
    handler: userController.deleteUserController, // Seu controlador
  });
}
