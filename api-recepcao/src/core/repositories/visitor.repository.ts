import { Visitors } from "../../infra/database/sequelize/models/visitors.model.js";
import { VisitorsRequired } from "../types/visitorTypes.js";

export interface VisitorListOptions {
  search?: string;
  offset: number;
  limit: number;
}

export interface VisitorListResult {
  rows: Visitors[];
  count: number;
}

export interface IVisitorRepository {
  findById(uuid: string): Promise<Visitors | null>;
  findByCpf(cpf: string, excludeUuid?: string): Promise<Visitors | null>;
  list(options: VisitorListOptions): Promise<VisitorListResult>;
  create(data: VisitorsRequired): Promise<Visitors>;
  save(visitor: Visitors): Promise<Visitors>;
  deleteById(uuid: string): Promise<boolean>;
}
