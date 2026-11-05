import db from "../index.js";

import {
  ISubjectRepository,
  SubjectData,
  CreateSubjectData,
  UpdateSubjectData,
} from "../../../../domain/repositories/subject/subject.repository.js";

export class SequelizeSubjectRepository implements ISubjectRepository {
  private get model() {
    return db.SubjectsModel;
  }

  private toData(row: any): SubjectData {
    return {
      uuid: row.uuid,
      name: row.name,
      description: row.description,
    };
  }

  async list(): Promise<SubjectData[]> {
    const rows = await this.model.findAll({
      order: [["name", "ASC"]],
    });

   return rows.map((row: any) => this.toData(row));
  }

  async findById(uuid: string): Promise<SubjectData | null> {
    const row = await this.model.findByPk(uuid);

    return row ? this.toData(row) : null;
  }

  async findByName(name: string): Promise<SubjectData | null> {
    const row = await this.model.findOne({
      where: { name },
    });

    return row ? this.toData(row) : null;
  }

  async create(data: CreateSubjectData): Promise<SubjectData> {
    const row = await this.model.create({
      name: data.name,
      description: data.description ?? null,
    });

    return this.toData(row);
  }

  async update(
    uuid: string,
    data: UpdateSubjectData,
  ): Promise<SubjectData | null> {
    const row = await this.model.findByPk(uuid);

    if (!row) {
      return null;
    }

    await row.update(data);

    return this.toData(row);
  }

  async delete(uuid: string): Promise<boolean> {
    const row = await this.model.findByPk(uuid);

    if (!row) {
      return false;
    }

    await row.destroy();

    return true;
  }
}