
import { Op, Transaction } from "sequelize";
import db from "../index.js";

export type CreateOccurrenceRecordData = {
  visitor_uuid: string;
  occurrence_uuid: string;
  creator_uuid: string;
  severity: number;
  observation?: string | null;
  occurredAt: Date;
};

export type UpdateOccurrenceRecordData = {
  occurrence_uuid?: string;
  severity?: number;
  observation?: string | null;
  occurredAt?: Date;
};

export class SequelizeOccurrenceRepository {
  private get occurrenceModel() {
    return db.OccurrenceModel;
  }

  private get recordModel() {
    return db.OccurrenceRecordModel;
  }

  private get auditModel() {
    return db.OccurrenceRecordAuditModel;
  }

  async listTypes() {
    return this.occurrenceModel.findAll({
      attributes: ["uuid", "name", "description", "severity"],
      order: [["name", "ASC"]],
    });
  }

  async findTypeById(uuid: string) {
    return this.occurrenceModel.findByPk(uuid);
  }

  async findVisitorById(uuid: string) {
    return db.VisitorsModel.findByPk(uuid);
  }

  async findRecordById(uuid: string) {
    return this.recordModel.findByPk(uuid);
  }

  async createRecord(data: CreateOccurrenceRecordData) {
    return this.recordModel.create(data);
  }

  async listByVisitorId(visitorUuid: string) {
    return this.recordModel.findAll({
      where: {
        visitor_uuid: visitorUuid,
      },
      include: [
        {
          model: this.occurrenceModel,
          as: "Occurrence",
          attributes: ["uuid", "name", "description"],
        },
        {
          model: db.UserModel,
          as: "Creator",
          attributes: ["uuid", "username"],
        },
      ],
      order: [
        ["occurredAt", "DESC"],
        ["createdAt", "DESC"],
      ],
    });
  }

  async getPointsLastSixMonths(visitorUuid: string) {
    const now = new Date();
    const startDate = new Date(now);

    startDate.setUTCMonth(startDate.getUTCMonth() - 6);

    const records = await this.recordModel.findAll({
      attributes: ["severity"],
      where: {
        visitor_uuid: visitorUuid,
        occurredAt: {
          [Op.between]: [startDate, now],
        },
      },
    });

    let total = 0;

    for (const record of records) {
      total += Number(record.get("severity"));
    }

    return total;
  }

  // Edita a ocorrência e registra a alteração na auditoria
  async updateRecord(
    uuid: string,
    data: UpdateOccurrenceRecordData,
    actorUuid: string
  ) {
    return db.sequelize.transaction(async (transaction: Transaction) => {
      const record = await this.recordModel.findByPk(uuid, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!record) {
        return null;
      }

      const beforeData = record.toJSON();

      await record.update(
        {
          ...data,
          updated_by_uuid: actorUuid,
        },
        { transaction }
      );

      const afterData = record.toJSON();

      await this.auditModel.create(
        {
          occurrence_record_uuid: uuid,
          actor_uuid: actorUuid,
          action: "UPDATE",
          before_data: beforeData,
          after_data: afterData,
        },
        { transaction }
      );

      return record;
    });
  }

  // Exclui logicamente e mantém o histórico da exclusão
  async deleteRecord(uuid: string, actorUuid: string) {
    return db.sequelize.transaction(async (transaction: Transaction) => {
      const record = await this.recordModel.findByPk(uuid, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!record) {
        return null;
      }

      const beforeData = record.toJSON();

      await record.update(
        {
          deleted_by_uuid: actorUuid,
        },
        { transaction }
      );

      await record.destroy({ transaction });

      const afterData = record.toJSON();

      await this.auditModel.create(
        {
          occurrence_record_uuid: uuid,
          actor_uuid: actorUuid,
          action: "DELETE",
          before_data: beforeData,
          after_data: afterData,
        },
        { transaction }
      );

      return record;
    });
  }

  // Consulta o histórico de edições e exclusões
  async listAuditByRecordId(uuid: string) {
    return this.auditModel.findAll({
      where: {
        occurrence_record_uuid: uuid,
      },
      include: [
        {
          model: db.UserModel,
          as: "Actor",
          attributes: ["uuid", "username"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
  }
}

export const occurrenceRepository =
  new SequelizeOccurrenceRepository();
