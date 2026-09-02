import { Auth } from "../../../application/service/AuthService.js";
import { createAuthJWT } from "../../../core/middleware/authJWT.js";
import { SequelizeUserRepository } from "../../../infra/database/sequelize/repositories/sequelize.user.repository.js";
import { SequelizeUserSessionRepository } from "../../../infra/database/sequelize/repositories/sequelize.user-session.repository.js";
import { SequelizeUserActivationRepository } from "../../../infra/database/sequelize/repositories/sequelize.user-activation.repository.js";
import { ActivationService } from "../../../application/service/ActivationService.js";

const userRepository = new SequelizeUserRepository();
const userSessionRepository = new SequelizeUserSessionRepository();

const activationRepository = new SequelizeUserActivationRepository();
export const authService = new Auth(userRepository, userSessionRepository, activationRepository);
export const activationService = new ActivationService(userRepository, activationRepository);
export const authJWT = createAuthJWT(userRepository);
