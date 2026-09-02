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
import { AppError } from "../../core/types/errorTypes.js";
import { parsePagination } from "../../core/utils/pagination.js";

export class VisitsService {
  constructor(
    private readonly visitRepository: IVisitRepository,
    private readonly userRepository: IUserRepository,
    private readonly visitorRepository: IVisitorRepository,
  ) {}

  async getDashboard(query: VisitsDashboardQuery) {
    const hasOnlyOneDate = Boolean(query.dateFrom) !== Boolean(query.dateTo);
    if (hasOnlyOneDate) {
      throw new AppError(
        "dateFrom and dateTo must be provided together",
        400,
        "INVALID_DATE_RANGE",
      );
    }

    const now = new Date();
    const defaultDateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
    const defaultDateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0);
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
      throw new AppError("Invalid dashboard filters", 400, "INVALID_DASHBOARD_FILTERS");
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
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  }

  async listVisits(
    query: VisitsQueryParams
  ): Promise<{ message: string; visits: VisitsResponse[]; count: number }> {
    const { search, offset, limit } = parsePagination(query);

    const { count, rows } = await this.visitRepository.list({
      search,
      offset,
      limit,
    });

    const visits: VisitsResponse[] = rows.map((visit) => {
      const v = visit;

      return {
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
        date: v.date,
        createdAt: v.createdAt!,
        updatedAt: v.updatedAt!,
        deletedAt: v.deletedAt ?? null,
      };
    });

    if (!rows.length) {
      throw new AppError("No visits found", 404, "NOT_FOUND");
    }

    return {
      message: "Visits successfully listed",
      visits,
      count,
    };
  }

  async createVisits(
    visitsData: VisitsRequired
  ): Promise<VisitsGenericResponse> {
    const visitor = await this.visitorRepository.findById(visitsData.visitor_uuid);
    const creator = await this.userRepository.findUserById(visitsData.creator_uuid);

    if (!visitor || !creator) {
      throw new AppError(
        "Visitor or creator not found",
        400,
        "INVALID_VISIT_REFERENCE",
      );
    }

    const newVisits = await this.visitRepository.create(Visit.create(visitsData));

    return {
      message: "visit created success",
      visits: newVisits,
    };
  }

  async listVisitsByVisitorId(uuid: string): Promise<{
    visits: VisitsResponse[];
    message: string;
  }> {
    const visits = await this.visitRepository.listByVisitorId(uuid);

    if (!visits.length) {
      throw new AppError(
        "No visits found for the given visitor ID",
        404,
        "NOT_FOUND",
      );
    }

    const visitsResponse: VisitsResponse[] = visits.map((visit) => {
      const v = visit;
      return {
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
        date: v.date,
        createdAt: v.createdAt!,
        updatedAt: v.updatedAt!,
        deletedAt: v.deletedAt ?? null,
      };
    });

    return {
      visits: visitsResponse,
      message: "Visits found",
    };
  }
}
