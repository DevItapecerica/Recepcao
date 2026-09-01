import {
  VisitsGenericResponse,
  VisitsQueryParams,
  VisitsRequired,
  VisitsWithAssociation,
  VisitsResponse,
} from "../../core/types/visitsTypes.js";
import { Visit } from "../../domain/entities/Visit.js";
import { visitRepository } from "../../infra/database/sequelize/repositories/sequelize.visit.repository.js";
import { userRepository } from "../../infra/database/sequelize/repositories/sequelize.user.repository.js";
import { visitorRepository } from "../../infra/database/sequelize/repositories/sequelize.visitor.repository.js";

export class VisitsService {
  static async listVisits(
    query: VisitsQueryParams
  ): Promise<
    | { ok: true; message: string; visits: VisitsResponse[]; count: number }
    | { ok: false; code: number; message: string }
  > {
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

    const { count, rows } = await visitRepository.list({
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
      return {
        ok: false,
        code: 404,
        message: "No visits found",
      };
    }

    return {
      ok: true,
      message: "Visits successfully listed",
      visits,
      count,
    };
  }

  static async createVisits(
    visitsData: VisitsRequired
  ): Promise<VisitsGenericResponse> {
    const visitor = await visitorRepository.findById(visitsData.visitor_uuid);
    const creator = await userRepository.findUserById(visitsData.creator_uuid);

    if (!visitor || !creator) {
      return {
        ok: false,
        code: 400,
        message: "Visitor or creator not found...",
      };
    }

    const newVisits = await visitRepository.create(Visit.create(visitsData));

    return {
      ok: true,
      message: "visit created success",
      visits: newVisits,
    };
  }

  static async listVisitsByVisitorId(uuid: string): Promise<
    | {
        ok: true;
        visits: VisitsResponse[];
        message: string;
      }
    | {
        ok: false;
        code: number;
        message: string;
      }
  > {
    const visits = await visitRepository.listByVisitorId(uuid);

    if (!visits.length) {
      return {
        ok: false,
        code: 404,
        message: "No visits found for the given visitor ID",
      };
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
      ok: true,
      visits: visitsResponse,
      message: "Visits found",
    };
  }
}
