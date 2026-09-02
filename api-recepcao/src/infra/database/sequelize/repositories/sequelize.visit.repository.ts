import { fn, col, Op } from "sequelize";
import {
  IVisitRepository,
  VisitDashboardOptions,
  VisitDashboardResult,
  VisitListOptions,
  VisitListResult,
  VisitorVisitRanking,
  rankVisitors,
} from "../../../../domain/repositories/visit/visit.repository.js";
import db from "../index.js";
import { Visits } from "../models/visits.model.js";
import { Visit } from "../../../../domain/entities/Visit.js";
import { UserDB } from "../models/user.model.js";
import { Visitors } from "../models/visitors.model.js";
import { User } from "../../../../domain/entities/User.js";
import { Visitor } from "../../../../domain/entities/Visitor.js";

export class SequelizeVisitRepository implements IVisitRepository {
  private get model() {
    return db.VisitsModel;
  }

  private toDomain(model: Visits): Visit {
    const plain = model.get({ plain: true }) as any;
    return Visit.create({
      ...plain,
      creator: plain.Creator ? new User(plain.Creator) : undefined,
      visitor: plain.Visitor ? Visitor.create(plain.Visitor) : undefined,
    });
  }

  private get include() {
    return [
      { model: db.UserModel, as: "Creator" },
      { model: db.VisitorsModel, as: "Visitor" },
    ];
  }

  async list({ search, offset, limit }: VisitListOptions): Promise<VisitListResult> {
    const date = search?.split("T")[0];
    const where = date
      ? {
          visitedAt: {
            [Op.between]: [
              new Date(`${date}T00:00:00-03:00`),
              new Date(`${date}T23:59:59.999-03:00`),
            ],
          },
        }
      : {};
    const result = await this.model.findAndCountAll({
      where,
      include: this.include,
      offset,
      limit,
      order: [["createdAt", "DESC"]],
    });
    return { count: result.count, rows: result.rows.map((row: Visits) => this.toDomain(row)) };
  }

  async listByVisitorId(visitorUuid: string): Promise<Visit[]> {
    const rows = await this.model.findAll({
      where: { visitor_uuid: visitorUuid },
      include: this.include,
      order: [["createdAt", "DESC"]],
    });
    return rows.map((row: Visits) => this.toDomain(row));
  }

  async create(visit: Visit): Promise<Visit> {
    const visitedAt = this.parseVisitDate(visit.date);
    const model = await this.model.create({
      creator_uuid: visit.creator_uuid, visitor_uuid: visit.visitor_uuid,
      subject: visit.subject, date: visit.date, visitedAt,
    });
    return this.toDomain(model);
  }

  async dashboard({
    dateFrom,
    dateTo,
    limit,
  }: VisitDashboardOptions): Promise<VisitDashboardResult> {
    const where = {
      visitedAt: {
        [Op.between]: [
          new Date(`${dateFrom}T00:00:00-03:00`),
          new Date(`${dateTo}T23:59:59.999-03:00`),
        ],
      },
    };

    const [totalVisits, groupedVisits, weekdayRows, hourRows] = await Promise.all([
      this.model.count({ where }),
      this.model.findAll({
        attributes: [
          "visitor_uuid",
          [fn("COUNT", col("uuid")), "visitCount"],
        ],
        where,
        group: ["visitor_uuid"],
        raw: true,
      }),
      this.model.findAll({
        attributes: [
          [fn("DAYOFWEEK", col("visited_at")), "bucket"],
          [fn("COUNT", col("uuid")), "count"],
        ],
        where,
        group: [fn("DAYOFWEEK", col("visited_at"))],
        raw: true,
      }),
      this.model.findAll({
        attributes: [
          [fn("HOUR", col("visited_at")), "bucket"],
          [fn("COUNT", col("uuid")), "count"],
        ],
        where,
        group: [fn("HOUR", col("visited_at"))],
        raw: true,
      }),
    ]);

    const weekdayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    const weekdayCounts = Array<number>(7).fill(0);
    const hourCounts = Array<number>(24).fill(0);

    for (const row of weekdayRows as unknown as Array<Record<string, unknown>>) {
      const mondayBasedDay = (Number(row.bucket) + 5) % 7;
      weekdayCounts[mondayBasedDay] = Number(row.count);
    }
    for (const row of hourRows as unknown as Array<Record<string, unknown>>) {
      hourCounts[Number(row.bucket)] = Number(row.count);
    }

    const visitsByWeekday = weekdayLabels.map((label, index) => ({
      label,
      count: weekdayCounts[index],
    }));
    const visitsByHour = hourCounts.map((count, hour) => ({
      label: `${String(hour).padStart(2, "0")}h`,
      count,
    }));

    const counts = new Map<string, number>();
    for (const row of groupedVisits as unknown as Array<Record<string, unknown>>) {
      counts.set(String(row.visitor_uuid), Number(row.visitCount));
    }

    const visitorIds = [...counts.keys()];
    if (!visitorIds.length) {
      return {
        totalVisits,
        uniqueVisitors: 0,
        ranking: [],
        visitsByWeekday,
        visitsByHour,
      };
    }

    const visitors = await db.VisitorsModel.findAll({
      attributes: ["uuid", "name", "photo"],
      where: { uuid: { [Op.in]: visitorIds } },
    });

    const ranking = rankVisitors(
      visitors.map((visitor: Visitors) => ({
        uuid: visitor.uuid,
        name: visitor.name,
        photo: visitor.photo ?? null,
        visitCount: counts.get(visitor.uuid) ?? 0,
      })),
      limit,
    );

    return {
      totalVisits,
      uniqueVisitors: visitorIds.length,
      ranking,
      visitsByWeekday,
      visitsByHour,
    };
  }

  private parseVisitDate(value: string): Date {
    const normalized = value.replace(" ", "T").replace(/Z$/, "");
    return new Date(`${normalized.replace(/([+-]\d{2}:\d{2})$/, "")}-03:00`);
  }
}

export const visitRepository = new SequelizeVisitRepository();
