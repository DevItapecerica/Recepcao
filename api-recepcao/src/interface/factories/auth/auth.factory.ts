import { Auth } from "../../../application/service/AuthService.js";
import { createAuthJWT } from "../../../core/middleware/authJWT.js";
import { SequelizeUserRepository } from "../../../infra/database/sequelize/repositories/sequelize.user.repository.js";
import { SequelizeUserSessionRepository } from "../../../infra/database/sequelize/repositories/sequelize.user-session.repository.js";

const userRepository = new SequelizeUserRepository();
const userSessionRepository = new SequelizeUserSessionRepository();

export const authService = new Auth(userRepository, userSessionRepository);
export const authJWT = createAuthJWT(userRepository);
