
import {
  VisitsGenericResponse,
  VisitsDashboardQuery,
  VisitsQueryParams,
  VisitsRequired,
  VisitsResponse,
} from "../dto/visit/visitTypes.js";

import { Visit } from "../../domain/entities/Visit.js";
import { IVisitRepository } from "../../domain/repositories/visit/visit.repository.js";
import { IUserRepository } from "../../domain/repositories/user/user.repository.js";
import { IVisitorRepository } from "../../domain/repositories/visitor/visitor.repository.js";
import { ISubjectRepository } from "../../domain/repositories/subject/subject.repository.js";
import { IAttendantRepository } from "../../domain/repositories/attendant/attendant.repository.js";
import { AppError } from "../../core/types/errorTypes.js";
import { parsePagination } from "../../core/utils/pagination.js";

export class VisitsService {
  constructor(
    private readonly visitRepository: IVisitRepository,
    private readonly userRepository: IUserRepository,
    private readonly visitorRepository: IVisitorRepository,
    private readonly subjectRepository: ISubjectRepository,
    private readonly attendantRepository: IAttendantRepository,
  ) {}

  async getDashboard(query: VisitsDashboardQuery) {
    const hasOnlyOneDate =
      Boolean(query.dateFrom) !== Boolean(query.dateTo);

    if (hasOnlyOneDate) {
      throw new AppError(
        "dateFrom and dateTo must be provided together",
        400,
        "INVALID_DATE_RANGE",
      );
    }

    const now = new Date();
    const defaultDateFrom = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    );
    const defaultDateTo = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    );

    const dateFrom = query.dateFrom ?? this.formatDate(defaultDateFrom);
    const dateTo = query.dateTo ?? this.formatDate(defaultDateTo);
    const limit = query.limit === undefined ? 5 : Number(query.limit);

    if (
      !this.isValidDate(dateFrom) ||
      !this.isValidDate(dateTo) ||
      dateFrom > dateTo ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 20
    ) {
      throw new AppError(
        "Filtros do painel inválidos",
        400,
        "INVALID_DASHBOARD_FILTERS",
      );
    }

    const dashboard = await this.visitRepository.dashboard({
      dateFrom,
      dateTo,
      limit,
    });

    return {
      message: "Dashboard retrieved successfully",
      period: { dateFrom, dateTo },
      dashboard: {
        ...dashboard,
        mostFrequentVisitor: dashboard.ranking[0] ?? null,
      },
    };
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  private isValidDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  }

  async listVisits(
    query: VisitsQueryParams,
  ): Promise<{
    message: string;
    visits: VisitsResponse[];
    count: number;
  }> {
    const { search, offset, limit } = parsePagination(query);

    const { count, rows } = await this.visitRepository.list({
      search,
      offset,
      limit,
    });

    if (!rows.length) {
      throw new AppError(
        "Nenhuma visita encontrada",
        404,
        "NOT_FOUND",
      );
    }

    const visits: VisitsResponse[] = rows.map((v) => ({
      uuid: v.uuid!,
      creator_uuid: v.creator_uuid,
      creator: {
        uuid: v.creator?.uuid,
        role: v.creator?.role,
        username: v.creator?.username,
      },
      visitor_uuid: v.visitor_uuid,
      visitor: {
        uuid: v.visitor?.uuid,
        name: v.visitor?.name,
        photo: v.visitor?.photo ?? null,
      },
      subject: v.subject,
      subject_uuid: v.subject_uuid ?? null,
      attendant_uuid: v.attendant_uuid ?? null,
      subjectName: v.subjectName ?? null,
      attendantName: v.attendantName ?? null,
      date: v.date,
      createdAt: v.createdAt!,
      updatedAt: v.updatedAt!,
      deletedAt: v.deletedAt ?? null,
    }));

    return {
      message: "Visits successfully listed",
      visits,
      count,
    };
  }

  async createVisits(
    visitsData: VisitsRequired,
  ): Promise<VisitsGenericResponse> {

const visitDate = new Date(visitsData.date);

if (Number.isNaN(visitDate.getTime())) {
  throw new AppError(
    "Data da visita inválida",
    400,
    "INVALID_VISIT_DATE",
  );
}

const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

const selectedDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(visitDate);

if (selectedDate !== today) {
  throw new AppError(
    "Só é permitido cadastrar visitas com a data de hoje",
    400,
    "VISIT_DATE_NOT_TODAY",
  );
}

    const visitor = await this.visitorRepository.findById(
      visitsData.visitor_uuid,
    );

    const creator = await this.userRepository.findUserById(
      visitsData.creator_uuid,
    );

    if (!visitor || !creator) {
      throw new AppError(
        "Visitante ou usuário responsável não encontrado",
        400,
        "INVALID_VISIT_REFERENCE",
      );
    }

    if (!visitsData.subject_uuid) {
      throw new AppError(
        "O assunto é obrigatório",
        400,
        "SUBJECT_REQUIRED",
      );
    }

    const subject = await this.subjectRepository.findById(
      visitsData.subject_uuid,
    );

    if (!subject) {
      throw new AppError(
        "Assunto não encontrado",
        400,
        "INVALID_SUBJECT",
      );
    }

    if (visitsData.attendant_uuid) {
      const attendant = await this.attendantRepository.findById(
        visitsData.attendant_uuid,
      );

      if (!attendant) {
        throw new AppError(
          "Atendente não encontrado",
          400,
          "INVALID_ATTENDANT",
        );
      }
    }

    const newVisits = await this.visitRepository.create(
      Visit.create({
        ...visitsData,
        subject: visitsData.subject ?? null,
        attendant_uuid: visitsData.attendant_uuid ?? null,
      }),
    );

    return {
      message: "Visita registrada com sucesso",
      visits: newVisits,
    };
  }

  async listVisitsByVisitorId(
    uuid: string,
  ): Promise<{
    visits: VisitsResponse[];
    message: string;
  }> {
    const visits = await this.visitRepository.listByVisitorId(uuid);

    if (!visits.length) {
      throw new AppError(
        "Nenhuma visita encontrada para este visitante",
        404,
        "NOT_FOUND",
      );
    }

    const visitsResponse: VisitsResponse[] = visits.map((v) => ({
      uuid: v.uuid!,
      creator_uuid: v.creator_uuid,
      creator: {
        uuid: v.creator?.uuid,
        role: v.creator?.role,
        username: v.creator?.username,
      },
      visitor_uuid: v.visitor_uuid,
      visitor: {
        uuid: v.visitor?.uuid,
        name: v.visitor?.name,
        photo: v.visitor?.photo ?? null,
      },
      subject: v.subject,
      subject_uuid: v.subject_uuid ?? null,
      attendant_uuid: v.attendant_uuid ?? null,
      subjectName: v.subjectName ?? null,
      attendantName: v.attendantName ?? null,
      date: v.date,
      createdAt: v.createdAt!,
      updatedAt: v.updatedAt!,
      deletedAt: v.deletedAt ?? null,
    }));

    return {
      visits: visitsResponse,
      message: "Visits found",
    };
  }
}
