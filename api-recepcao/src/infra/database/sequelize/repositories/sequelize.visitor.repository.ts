import { Op } from "sequelize";
import { IVisitorRepository, VisitorListOptions, VisitorListResult } from "../../../../core/repositories/visitor.repository.js";
import { VisitorsRequired } from "../../../../core/types/visitorTypes.js";
import db from "../index.js";
import { Visitors } from "../models/visitors.model.js";

export class SequelizeVisitorRepository implements IVisitorRepository {
  private get model() {
    return db.VisitorsModel;
  }

  async findById(uuid: string): Promise<Visitors | null> {
    return this.model.findByPk(uuid);
  }

  async findByCpf(cpf: string, excludeUuid?: string): Promise<Visitors | null> {
    const where: Record<string, unknown> = { cpf };
    if (excludeUuid) where.uuid = { [Op.ne]: excludeUuid };
    return this.model.findOne({ where });
  }

  async list({ search, offset, limit }: VisitorListOptions): Promise<VisitorListResult> {
    const where = search ? { name: { [Op.like]: `%${search}%` } } : {};
    return this.model.findAndCountAll({
      where,
      attributes: { exclude: ["cpf"] },
      offset,
      limit,
      order: [["createdAt", "DESC"]],
    });
  }

  async create(data: VisitorsRequired): Promise<Visitors> {
    return this.model.create(data);
  }

  async save(visitor: Visitors): Promise<Visitors> {
    return visitor.save();
  }

  async deleteById(uuid: string): Promise<boolean> {
    return (await this.model.destroy({ where: { uuid } })) > 0;
  }
}

export const visitorRepository = new SequelizeVisitorRepository();
