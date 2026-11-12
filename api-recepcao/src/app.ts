import { FastifyInstance } from "fastify";
import { loginRouter } from "./interface/router/loginRouter.js";
import { userRouter } from "./interface/router/userRouter.js";
import { visitorRouter } from "./interface/router/visitorRouter.js";
import { visitsRouter } from "./interface/router/visitsRouter.js";
import { occurrencesRouter } from "./interface/router/occurrencesRouter.js";

const bootstrap = (fastify: FastifyInstance) => {


  fastify.register(loginRouter, {
    prefix: "/login",
  });

  fastify.register(userRouter, {
    prefix: "/user",
  });

  fastify.register(visitorRouter, {
    prefix: "/visitors",
  });

  fastify.register(visitsRouter, {
    prefix: "/visits",
  });;

  fastify.register(occurrencesRouter, {
    prefix: "/occurrences",
  });

}

export default bootstrap