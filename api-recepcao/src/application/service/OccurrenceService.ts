
import { AppError } from "../../core/types/errorTypes.js";
import { SequelizeOccurrenceRepository } from "../../infra/database/sequelize/repositories/sequelize.occurrence.repository.js";


export type CreateOccurrenceData = {
  visitor_uuid: string;
  occurrence_uuid: string;
  creator_uuid: string;
  severity?: number;
  observation?: string | null;
  occurredAt?: string;
};

export type UpdateOccurrenceData = {
  occurrence_uuid?: string;
  severity?: number;
  observation?: string | null;
  occurredAt?: string;
};

export class OccurrenceService {
  constructor(
    private readonly occurrenceRepository: SequelizeOccurrenceRepository,
  ) {}

  // Lista os tipos de ocorrências cadastrados no banco.
  async listTypes() {
    const occurrences = await this.occurrenceRepository.listTypes();

    return {
      message: "Tipos de ocorrências listados com sucesso",
      occurrences,
    };
  }

  // Registra uma ocorrência para um munícipe.
  async createOccurrence(data: CreateOccurrenceData) {
    const visitor = await this.occurrenceRepository.findVisitorById(
      data.visitor_uuid,
    );

    if (!visitor) {
      throw new AppError(
        "Munícipe não encontrado",
        404,
        "VISITOR_NOT_FOUND",
      );
    }

    const occurrence = await this.occurrenceRepository.findTypeById(
      data.occurrence_uuid,
    );

    if (!occurrence) {
      throw new AppError(
        "Tipo de ocorrência não encontrado",
        404,
        "OCCURRENCE_NOT_FOUND",
      );
    }

    const predefinedSeverity = occurrence.get("severity") as number | null;
    let severity: number;

    if (predefinedSeverity === null) {
      // Para "Outros", o funcionário escolhe a gravidade.
      if (
        !Number.isInteger(data.severity) ||
        data.severity === undefined ||
        data.severity < 1 ||
        data.severity > 5
      ) {
        throw new AppError(
          "Informe uma gravidade de 1 a 5 para a ocorrência Outros",
          400,
          "INVALID_SEVERITY",
        );
      }

      severity = data.severity;
    } else {
      // Para os demais tipos, usa a gravidade cadastrada.
      severity = Number(predefinedSeverity);
    }

    let occurredAt = new Date();

    if (data.occurredAt !== undefined) {
      if (typeof data.occurredAt !== "string") {
        throw new AppError(
          "Data da ocorrência inválida",
          400,
          "INVALID_OCCURRENCE_DATE",
        );
      }

      occurredAt = new Date(data.occurredAt);

      if (
        !Number.isFinite(occurredAt.getTime()) ||
        occurredAt.getTime() > Date.now()
      ) {
        throw new AppError(
          "Data da ocorrência inválida ou futura",
          400,
          "INVALID_OCCURRENCE_DATE",
        );
      }
    }

    if (
      data.observation !== undefined &&
      data.observation !== null &&
      typeof data.observation !== "string"
    ) {
      throw new AppError(
        "Observação inválida",
        400,
        "INVALID_OBSERVATION",
      );
    }

    const record = await this.occurrenceRepository.createRecord({
      visitor_uuid: data.visitor_uuid,
      occurrence_uuid: data.occurrence_uuid,
      creator_uuid: data.creator_uuid,
      severity,
      observation: data.observation?.trim() || null,
      occurredAt,
    });

    const status = await this.getVisitorStatus(data.visitor_uuid);

    return {
      message: "Ocorrência registrada com sucesso",
      occurrence: record,
      status,
    };
  }

  // Retorna as ocorrências ativas do munícipe.
  async getVisitorHistory(visitorUuid: string) {
    await this.ensureVisitorExists(visitorUuid);

    const records = await this.occurrenceRepository.listByVisitorId(
      visitorUuid,
    );

    const status = await this.getVisitorStatus(visitorUuid);

    return {
      message: "Histórico de ocorrências consultado com sucesso",
      occurrences: records,
      count: records.length,
      status,
    };
  }

  // Calcula a pontuação dos últimos seis meses.
  async getVisitorStatus(visitorUuid: string) {
    await this.ensureVisitorExists(visitorUuid);

    const points =
      await this.occurrenceRepository.getPointsLastSixMonths(visitorUuid);

    let status: "OK" | "ATENCAO" | "AGRESSIVO";
    let color: "green" | "yellow" | "red";

    if (points >= 15) {
      status = "AGRESSIVO";
      color = "red";
    } else if (points >= 8) {
      status = "ATENCAO";
      color = "yellow";
    } else {
      status = "OK";
      color = "green";
    }

    return {
      visitor_uuid: visitorUuid,
      points,
      status,
      color,
      periodMonths: 6,
    };
  }

  // Edita uma ocorrência e recalcula a pontuação.
  async updateOccurrence(
    uuid: string,
    data: UpdateOccurrenceData,
    actorUuid: string,
  ) {
    const record = await this.occurrenceRepository.findRecordById(uuid);

    if (!record) {
      throw new AppError(
        "Registro de ocorrência não encontrado",
        404,
        "OCCURRENCE_RECORD_NOT_FOUND",
      );
    }

    if (
      data.occurrence_uuid === undefined &&
      data.severity === undefined &&
      data.observation === undefined &&
      data.occurredAt === undefined
    ) {
      throw new AppError(
        "Informe pelo menos um campo para editar",
        400,
        "EMPTY_UPDATE",
      );
    }

    const occurrenceUuid = String(
      data.occurrence_uuid ?? record.get("occurrence_uuid"),
    );

    const occurrence = await this.occurrenceRepository.findTypeById(
      occurrenceUuid,
    );

    if (!occurrence) {
      throw new AppError(
        "Tipo de ocorrência não encontrado",
        404,
        "OCCURRENCE_NOT_FOUND",
      );
    }

    const predefinedSeverity = occurrence.get("severity") as number | null;

    let severity: number;

    if (predefinedSeverity === null) {
      // Se o tipo for "Outros", a gravidade pode ser escolhida.
      // Ao mudar de um tipo predefinido para "Outros",
      // exige uma gravidade informada explicitamente.
      const previousTypeUuid = String(record.get("occurrence_uuid"));

      const requestedSeverity =
        previousTypeUuid === occurrenceUuid
          ? (data.severity ?? Number(record.get("severity")))
          : data.severity;

      if (
        !Number.isInteger(requestedSeverity) ||
        requestedSeverity === undefined ||
        requestedSeverity < 1 ||
        requestedSeverity > 5
      ) {
        throw new AppError(
          "Informe uma gravidade de 1 a 5 para a ocorrência Outros",
          400,
          "INVALID_SEVERITY",
        );
      }

      severity = requestedSeverity;
    } else {
      // Tipos predefinidos usam sempre a gravidade do catálogo.
      severity = Number(predefinedSeverity);
    }

    const updateData: {
      occurrence_uuid: string;
      severity: number;
      observation?: string | null;
      occurredAt?: Date;
    } = {
      occurrence_uuid: occurrenceUuid,
      severity,
    };

    if (data.observation !== undefined) {
      if (
        data.observation !== null &&
        typeof data.observation !== "string"
      ) {
        throw new AppError(
          "Observação inválida",
          400,
          "INVALID_OBSERVATION",
        );
      }

      updateData.observation = data.observation?.trim() || null;
    }

    if (data.occurredAt !== undefined) {
      if (typeof data.occurredAt !== "string") {
        throw new AppError(
          "Data da ocorrência inválida",
          400,
          "INVALID_OCCURRENCE_DATE",
        );
      }

      const occurredAt = new Date(data.occurredAt);

      if (
        !Number.isFinite(occurredAt.getTime()) ||
        occurredAt.getTime() > Date.now()
      ) {
        throw new AppError(
          "Data da ocorrência inválida ou futura",
          400,
          "INVALID_OCCURRENCE_DATE",
        );
      }

      updateData.occurredAt = occurredAt;
    }

    const updatedRecord = await this.occurrenceRepository.updateRecord(
      uuid,
      updateData,
      actorUuid,
    );

    if (!updatedRecord) {
      throw new AppError(
        "Registro de ocorrência não encontrado",
        404,
        "OCCURRENCE_RECORD_NOT_FOUND",
      );
    }

    const visitorUuid = String(record.get("visitor_uuid"));
    const status = await this.getVisitorStatus(visitorUuid);

    return {
      message: "Ocorrência atualizada com sucesso",
      occurrence: updatedRecord,
      status,
    };
  }

  // Exclui logicamente uma ocorrência.
  async deleteOccurrence(uuid: string, actorUuid: string) {
    const record = await this.occurrenceRepository.findRecordById(uuid);

    if (!record) {
      throw new AppError(
        "Registro de ocorrência não encontrado",
        404,
        "OCCURRENCE_RECORD_NOT_FOUND",
      );
    }

    const visitorUuid = String(record.get("visitor_uuid"));

    const deletedRecord = await this.occurrenceRepository.deleteRecord(
      uuid,
      actorUuid,
    );

    if (!deletedRecord) {
      throw new AppError(
        "Registro de ocorrência não encontrado",
        404,
        "OCCURRENCE_RECORD_NOT_FOUND",
      );
    }

    const status = await this.getVisitorStatus(visitorUuid);

    return {
      message: "Ocorrência excluída com sucesso",
      status,
    };
  }

  // Consulta o histórico de alterações e exclusões.
  async getOccurrenceAudit(uuid: string) {
    const audits = await this.occurrenceRepository.listAuditByRecordId(uuid);

    return {
      message: "Histórico de alterações consultado com sucesso",
      audits,
      count: audits.length,
    };
  }

  // Verifica se o munícipe existe no banco.
  private async ensureVisitorExists(uuid: string) {
    const visitor = await this.occurrenceRepository.findVisitorById(uuid);

    if (!visitor) {
      throw new AppError(
        "Munícipe não encontrado",
        404,
        "VISITOR_NOT_FOUND",
      );
    }
  }
}
