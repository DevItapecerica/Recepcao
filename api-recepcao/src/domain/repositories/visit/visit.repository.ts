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

export interface IVisitRepository {
  list(options: VisitListOptions): Promise<VisitListResult>;
  listByVisitorId(visitorUuid: string): Promise<Visit[]>;
  create(visit: Visit): Promise<Visit>;
}
