import { UserService } from "../../../application/service/UserService.js";
import { SequelizeUserRepository } from "../../../infra/database/sequelize/repositories/sequelize.user.repository.js";
import { UserPolicyDomainService } from "../../../domain/services/user/userPolicy.domain.service.js";
import { SequelizeUserActivationRepository } from "../../../infra/database/sequelize/repositories/sequelize.user-activation.repository.js";
import { SequelizeUserSessionRepository } from "../../../infra/database/sequelize/repositories/sequelize.user-session.repository.js";
import { ActivationService } from "../../../application/service/ActivationService.js";

export class UserFactory {
  userService = () => {
    const repository = new SequelizeUserRepository();
    const activationService = new ActivationService(repository, new SequelizeUserActivationRepository());
    const service = new UserService(
      repository,
      new UserPolicyDomainService(repository),
      activationService,
      new SequelizeUserSessionRepository(),
    );
    return service;
  };
}
