import { Op } from "sequelize";
import { IVisitRepository, VisitListOptions, VisitListResult } from "../../../../domain/repositories/visit/visit.repository.js";
import db from "../index.js";
import { Visits } from "../models/visits.model.js";
import { Visit } from "../../../../domain/entities/Visit.js";
import { UserDB } from "../models/user.model.js";
import { Visitors } from "../models/visitors.model.js";
import { User } from "../../../../domain/entities/User.js";
import { Visitor } from "../../../../domain/entities/Visitor.js";

export class SequelizeVisitRepository implements IVisitRepository {
  private get model() {
    return db.VisitsModel;
  }

  private toDomain(model: Visits): Visit {
    const plain = model.get({ plain: true }) as any;
    return Visit.create({
      ...plain,
      creator: plain.Creator ? new User(plain.Creator) : undefined,
      visitor: plain.Visitor ? Visitor.create(plain.Visitor) : undefined,
    });
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
    const result = await this.model.findAndCountAll({
      where,
      include: this.include,
      offset,
      limit,
      order: [["createdAt", "DESC"]],
    });
    return { count: result.count, rows: result.rows.map((row: Visits) => this.toDomain(row)) };
  }

  async listByVisitorId(visitorUuid: string): Promise<Visit[]> {
    const rows = await this.model.findAll({
      where: { visitor_uuid: visitorUuid },
      include: this.include,
      order: [["createdAt", "DESC"]],
    });
    return rows.map((row: Visits) => this.toDomain(row));
  }

  async create(visit: Visit): Promise<Visit> {
    const model = await this.model.create({
      creator_uuid: visit.creator_uuid, visitor_uuid: visit.visitor_uuid,
      subject: visit.subject, date: visit.date,
    });
    return this.toDomain(model);
  }
}

export const visitRepository = new SequelizeVisitRepository();
