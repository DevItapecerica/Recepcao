import { VisitsService } from "../../../application/service/VisitsService.js";
import { SequelizeUserRepository } from "../../../infra/database/sequelize/repositories/sequelize.user.repository.js";
import { SequelizeVisitRepository } from "../../../infra/database/sequelize/repositories/sequelize.visit.repository.js";
import { SequelizeVisitorRepository } from "../../../infra/database/sequelize/repositories/sequelize.visitor.repository.js";

export class VisitFactory {
  visitService(): VisitsService {
    return new VisitsService(
      new SequelizeVisitRepository(),
      new SequelizeUserRepository(),
      new SequelizeVisitorRepository(),
    );
  }
}
