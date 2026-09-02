import { Auth } from "../../../application/service/AuthService.js";
import { createAuthJWT } from "../../../core/middleware/authJWT.js";
import { SequelizeUserRepository } from "../../../infra/database/sequelize/repositories/sequelize.user.repository.js";

const userRepository = new SequelizeUserRepository();

export const authService = new Auth(userRepository);
export const authJWT = createAuthJWT(userRepository);
