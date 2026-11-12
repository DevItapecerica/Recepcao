import { FastifyInstance } from "fastify";
import { loginController } from "../controller/auth/loginController.js";
import { ValidateTokenController } from "../controller/auth/validateTokenController.js";
import { AlterPwdController } from "../controller/auth/alterpwdController.js";
import { authJWT } from "../factories/auth/auth.factory.js";
import { errorSchema } from "../../core/shared/schema/errorSchema.js";
import { RefreshController } from "../controller/auth/refreshController.js";
import { LogoutController } from "../controller/auth/logoutController.js";
import { ActivationController } from "../controller/auth/activationController.js";

export async function loginRouter(app: FastifyInstance) {
  app.route({
    method: "POST",
    url: "/",
    config: {
      rateLimit: { max: 5, timeWindow: "1 minute", keyGenerator: (request) => `${request.ip}:${(request.body as { username?: string })?.username?.toLowerCase() || "unknown"}` },
      audit: {
        failureAction: "LOGIN",
        module: "AUTH",
        resourceType: "LOGIN",
      },
    },
    schema: {
      tags: ["Login"],
      description: "Let you make login using username and password",
      summary: "Do login into application",
      body: {
        type: "object",
        required: ["username", "password"],
        properties: {
          username: {
            type: "string", minLength: 1, maxLength: 50,
          },
          password: {
            type: "string", minLength: 1, maxLength: 128,
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
    config: {
      audit: {
        failureAction: "AUTH",
        module: "AUTH",
        resourceType: "AUTH",
      },
    },
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
            user: {
              type: "object",
              properties: {
                uuid: { type: "string" },
                name: { type: "string" },
                role: { type: "string" },
                firstLogin: { type: "boolean" },
              },
            },
            message: { type: "string", example: "Token validate Confirm" },
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
    url: "/refresh",
    config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
    schema: {
      tags: ["Login"],
      summary: "Renova o token de acesso",
      description: "Rotaciona o refresh token recebido por cookie HttpOnly",
      response: {
        200: {
          type: "object",
          required: ["message", "token"],
          properties: {
            message: { type: "string" },
            token: { type: "string" },
          },
        },
        ...errorSchema,
      },
    },
    handler: RefreshController,
  });

  app.route({
    method: "POST",
    url: "/logout",
    schema: {
      tags: ["Login"],
      summary: "Encerra a sessÃ£o atual",
      response: {
        200: {
          type: "object",
          required: ["message"],
          properties: { message: { type: "string" } },
        },
        ...errorSchema,
      },
    },
    handler: LogoutController,
  });

  app.route({
    method: "POST",
    url: "/alterpwd",
    preHandler: [authJWT],
    config: {
      rateLimit: { max: 5, timeWindow: "1 minute" },
      audit: {
        failureAction: "UPDATE",
        module: "AUTH",
        resourceType: "ALTERPWD",
      },
    },
    schema: {
      tags: ["Login"],
      summary: "Verify the Token's integrity",
      description: "Route to verify a token integrity",
      body: {
        type: "object",
        properties: {
          new_password: { type: "string", minLength: 10, maxLength: 128 },
          old_password: {
            type: "string", minLength: 1, maxLength: 128,
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
        ...errorSchema,
      },
    },
    handler: AlterPwdController,
  });

  app.route({
    method: "POST",
    url: "/activate",
    config: { rateLimit: { max: 5, timeWindow: "1 minute" } },
    schema: {
      tags: ["Login"], summary: "Ativar uma nova conta",
      body: { type: "object", additionalProperties: false, required: ["token", "password"], properties: { token: { type: "string", minLength: 32, maxLength: 128 }, password: { type: "string", minLength: 10, maxLength: 128 } } },
      response: { 200: { type: "object", properties: { message: { type: "string" } } }, ...errorSchema },
    },
    handler: ActivationController,
  });
}
