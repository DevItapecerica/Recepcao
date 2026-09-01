import { Op } from "sequelize";
import { IVisitRepository, VisitListOptions, VisitListResult } from "../../../../core/repositories/visit.repository.js";
import { VisitsRequired } from "../../../../core/types/visitsTypes.js";
import db from "../index.js";
import { Visits } from "../models/visits.model.js";

export class SequelizeVisitRepository implements IVisitRepository {
  private get model() {
    return db.VisitsModel;
  }

  private get include() {
    return [
      { model: db.UserModel, as: "Creator" },
      { model: db.VisitorsModel, as: "Visitor" },
    ];
  }

  async list({ search, offset, limit }: VisitListOptions): Promise<VisitListResult> {
    const date = search?.split("T")[0];
    const where = date ? { date: { [Op.like]: `%${date}%` } } : {};
    return this.model.findAndCountAll({
      where,
      include: this.include,
      offset,
      limit,
      order: [["createdAt", "DESC"]],
    });
  }

  async listByVisitorId(visitorUuid: string): Promise<Visits[]> {
    return this.model.findAll({
      where: { visitor_uuid: visitorUuid },
      include: this.include,
      order: [["createdAt", "DESC"]],
    });
  }

  async create(data: VisitsRequired): Promise<Visits> {
    return this.model.create(data);
  }
}

export const visitRepository = new SequelizeVisitRepository();
