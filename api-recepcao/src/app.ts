import { FastifyInstance } from "fastify";
import { loginRouter } from "./router/loginRouter.js";
import { userRouter } from "./router/userRouter.js";
import { visitorRouter } from "./router/visitorRouter.js";
import { visitsRouter } from "./router/visitsRouter.js";

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

}

export default bootstrap