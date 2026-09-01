import { Visits } from "../../infra/database/sequelize/models/visits.model.js";
import { VisitsRequired } from "../types/visitsTypes.js";

export interface VisitListOptions {
  search?: string;
  offset: number;
  limit: number;
}

export interface VisitListResult {
  rows: Visits[];
  count: number;
}

export interface IVisitRepository {
  list(options: VisitListOptions): Promise<VisitListResult>;
  listByVisitorId(visitorUuid: string): Promise<Visits[]>;
  create(data: VisitsRequired): Promise<Visits>;
}
