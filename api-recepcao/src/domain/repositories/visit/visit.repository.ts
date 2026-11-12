import { Visit } from "../../entities/Visit.js";

export interface VisitListOptions {
  search?: string;
  offset: number;
  limit: number;
}

export interface VisitListResult {
  rows: Visit[];
  count: number;
}

export interface VisitDashboardOptions {
  dateFrom: string;
  dateTo: string;
  limit: number;
}

export interface VisitorVisitRanking {
  uuid: string;
  name: string;
  photo: string | null;
  visitCount: number;
}

export interface VisitDashboardResult {
  totalVisits: number;
  uniqueVisitors: number;
  ranking: VisitorVisitRanking[];
  visitsByWeekday: VisitDistributionPoint[];
  visitsByHour: VisitDistributionPoint[];
}

export interface VisitDistributionPoint {
  label: string;
  count: number;
}

export const rankVisitors = (
  visitors: VisitorVisitRanking[],
  limit: number,
): VisitorVisitRanking[] =>
  [...visitors]
    .sort(
      (a, b) =>
        b.visitCount - a.visitCount || a.name.localeCompare(b.name),
    )
    .slice(0, limit);

export interface IVisitRepository {
  list(options: VisitListOptions): Promise<VisitListResult>;
  listByVisitorId(visitorUuid: string): Promise<Visit[]>;
  create(visit: Visit): Promise<Visit>;
  dashboard(options: VisitDashboardOptions): Promise<VisitDashboardResult>;
}
