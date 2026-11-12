import { VisitorsService } from "../../../application/service/VisitorService.js";
import { VisitorPolicyDomainService } from "../../../domain/services/visitor/visitorPolicy.domain.service.js";
import { SequelizeVisitorRepository } from "../../../infra/database/sequelize/repositories/sequelize.visitor.repository.js";

export class VisitorFactory {
  visitorService(): VisitorsService {
    const repository = new SequelizeVisitorRepository();
    return new VisitorsService(repository, new VisitorPolicyDomainService(repository));
  }
}
