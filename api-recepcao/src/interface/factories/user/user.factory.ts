import { UserService } from "../../../application/service/UserService.js";
import { SequelizeUserRepository } from "../../../infra/database/sequelize/repositories/sequelize.user.repository.js";
import { UserPolicyDomainService } from "../../../domain/services/user/userPolicy.domain.service.js";

export class UserFactory {
  userService = () => {
    const repository = new SequelizeUserRepository();
    const service = new UserService(
      repository,
      new UserPolicyDomainService(repository),
    );
    return service;
  };
}
