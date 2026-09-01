import {
  VisitsGenericResponse,
  VisitsQueryParams,
  VisitsRequired,
  VisitsWithAssociation,
  VisitsResponse,
} from "../../core/types/visitsTypes.js";
import { Visit } from "../../domain/entities/Visit.js";
import { IVisitRepository } from "../../domain/repositories/visit/visit.repository.js";
import { IUserRepository } from "../../domain/repositories/user/user.repository.js";
import { IVisitorRepository } from "../../domain/repositories/visitor/visitor.repository.js";
import { AppError } from "../../core/types/errorTypes.js";

export class VisitsService {
  constructor(
    private readonly visitRepository: IVisitRepository,
    private readonly userRepository: IUserRepository,
    private readonly visitorRepository: IVisitorRepository,
  ) {}

  async listVisits(
    query: VisitsQueryParams
  ): Promise<{ message: string; visits: VisitsResponse[]; count: number }> {
    const {
      page = "0",
      limit = "10",
      search = "",
    } = query as {
      page?: string;
      limit?: string;
      search?: string;
    };
    const offset = Number(page) * Number(limit);

    const { count, rows } = await this.visitRepository.list({
      search,
      offset,
      limit: Number(limit),
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
