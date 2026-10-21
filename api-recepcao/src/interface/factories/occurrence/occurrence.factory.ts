
import { OccurrenceService } from "../../../application/service/OccurrenceService.js";
import { SequelizeOccurrenceRepository } from "../../../infra/database/sequelize/repositories/sequelize.occurrence.repository.js";

export class OccurrenceFactory {
  occurrenceService(): OccurrenceService {
    return new OccurrenceService(
      new SequelizeOccurrenceRepository(),
    );
  }
}
