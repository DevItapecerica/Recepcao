import { FastifyInstance } from "fastify";
import { loginController } from "../controller/auth/loginController.js";
import { ValidateTokenController } from "../controller/auth/validateTokenController.js";
import { AlterPwdController } from "../controller/auth/alterpwdController.js";
import { authJWT } from "../middleware/authJWT.js";

export async function loginRouter(app: FastifyInstance) {
  app.route({
    method: "POST",
    url: "/",
    schema: {
      tags: ["Login"],
      description: "Let you make login using username and password",
      summary: "Do login into application",
      body: {
        type: "object",
        required: ["username", "password"],
        properties: {
          username: {
            type: "string",
          },
          password: {
            type: "string",
          },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            message: { type: "string", example: "Login sucess" },
            token: { type: "string" },
            user: {
              type: "object",
              properties: {
                uuid: { type: "string" },
                name: { type: "string" },
                role: { type: "string" },
                firstLogin: { type: "boolean" },
              },
            },
            ip: { type: "string" },
          },
          required: ["message", "token", "user", "ip"],
        },
      },
    },
    handler: loginController,
  });

  app.route({
    method: "POST",
    url: "/verify",
    schema: {
      tags: ["Login"],
      summary: "Verify the Token's integrity",
      description: "Route to verify a token integrity",
      body: {
        type: "object",
        properties: { token: { type: "string" } },
        required: ["token"],
      },
      response: {
        200: {
          properties: {
            uuid: { type: "string" },
            role: { type: "string", example: "Admin" },
            message: { type: "string", example: "Token validate Confirm" },
            name: { type: "string", example: "Your.Username" },
            ok: { type: "boolean", example: true },
          },
        },
        401: {
          properties: {
            message: { type: "string", example: "Invallid token" },
            ok: { type: "boolean", example: false },
          },
        },
        500: {
          properties: {
            message: { type: "string", example: "Internal Error" },
            ok: { type: "boolean", example: false },
          },
        },
      },
    },
    handler: ValidateTokenController,
  });

  app.route({
    method: "POST",
    url: "/alterpwd",
    preHandler: [authJWT],
    schema: {
      tags: ["Login"],
      summary: "Verify the Token's integrity",
      description: "Route to verify a token integrity",
      body: {
        type: "object",
        properties: {
          new_password: { type: "string" },
          old_password: {
            type: "string",
          },
        },
        required: ["new_password", "old_password"],
      },
      response: {
        200: {
          properties: {
            uuid: { type: "string" },
            role: { type: "string", example: "Admin" },
            message: { type: "string", example: "Token validate Confirm" },
            name: { type: "string", example: "Your.Username" },
            ok: { type: "boolean", example: true },
          },
        },
        401: {
          properties: {
            message: { type: "string", example: "Invallid token" },
            ok: { type: "boolean", example: false },
          },
        },
        500: {
          properties: {
            message: { type: "string", example: "Internal Error" },
            ok: { type: "boolean", example: false },
          },
        },
      },
    },
    handler: AlterPwdController,
  });
}
