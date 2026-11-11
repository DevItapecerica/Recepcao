
import db from "../index.js";

import {
  IAttendantRepository,
  AttendantData,
  CreateAttendantData,
  UpdateAttendantData,
} from "../../../../domain/repositories/attendant/attendant.repository.js";

export class SequelizeAttendantRepository implements IAttendantRepository {
  private get model() {
    return db.AttendantsModel;
  }

  private toData(row: any): AttendantData {
    return {
      uuid: row.uuid,
      name: row.name,
      description: row.description,
    };
  }

  async list(): Promise<AttendantData[]> {
    const rows = await this.model.findAll({
      order: [["name", "ASC"]],
    });

    return rows.map((row: any) => this.toData(row));
  }

  async findById(uuid: string): Promise<AttendantData | null> {
    const row = await this.model.findByPk(uuid);

    return row ? this.toData(row) : null;
  }

  async create(data: CreateAttendantData): Promise<AttendantData> {
    const row = await this.model.create({
      name: data.name,
      description: data.description ?? null,
    });

    return this.toData(row);
  }

  async update(
    uuid: string,
    data: UpdateAttendantData,
  ): Promise<AttendantData | null> {
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
