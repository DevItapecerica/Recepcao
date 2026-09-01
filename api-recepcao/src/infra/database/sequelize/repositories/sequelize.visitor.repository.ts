import { Op } from "sequelize";
import { IVisitorRepository, VisitorListOptions, VisitorListResult } from "../../../../domain/repositories/visitor/visitor.repository.js";
import db from "../index.js";
import { Visitors } from "../models/visitors.model.js";
import { Visitor } from "../../../../domain/entities/Visitor.js";

export class SequelizeVisitorRepository implements IVisitorRepository {
  private get model() {
    return db.VisitorsModel;
  }

  private toDomain(model: Visitors): Visitor {
    return Visitor.create(model.get({ plain: true }));
  }

  async findById(uuid: string): Promise<Visitor | null> {
    const model = await this.model.findByPk(uuid);
    return model ? this.toDomain(model) : null;
  }

  async findByCpf(cpf: string, excludeUuid?: string): Promise<Visitor | null> {
    const where: Record<string, unknown> = { cpf };
    if (excludeUuid) where.uuid = { [Op.ne]: excludeUuid };
    const model = await this.model.findOne({ where });
    return model ? this.toDomain(model) : null;
  }

  async list({ search, offset, limit }: VisitorListOptions): Promise<VisitorListResult> {
    const where = search ? { name: { [Op.like]: `%${search}%` } } : {};
    const result = await this.model.findAndCountAll({
      where,
      offset,
      limit,
      order: [["createdAt", "DESC"]],
    });
    return { count: result.count, rows: result.rows.map((row: Visitors) => this.toDomain(row)) };
  }

  async create(visitor: Visitor): Promise<Visitor> {
    return this.toDomain(await this.model.create({ ...visitor }));
  }

  async save(visitor: Visitor): Promise<Visitor> {
    if (!visitor.uuid) throw new Error("Cannot update visitor without uuid");
    await this.model.update({ ...visitor }, { where: { uuid: visitor.uuid } });
    const updated = await this.model.findByPk(visitor.uuid);
    if (!updated) throw new Error("Visitor not found after update");
    return this.toDomain(updated);
  }

  async deleteById(uuid: string): Promise<boolean> {
    return (await this.model.destroy({ where: { uuid } })) > 0;
  }
}

export const visitorRepository = new SequelizeVisitorRepository();
