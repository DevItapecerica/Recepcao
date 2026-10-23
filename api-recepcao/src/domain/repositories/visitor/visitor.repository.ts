import { Visitor } from "../../entities/Visitor.js";

export interface VisitorListOptions {
  search?: string;
  offset: number;
  limit: number;
}

export interface VisitorListResult {
  rows: Visitor[];
  count: number;
}

export interface IVisitorRepository {
  findById(uuid: string): Promise<Visitor | null>;
  findByCpf(cpf: string, excludeUuid?: string): Promise<Visitor | null>;
  list(options: VisitorListOptions): Promise<VisitorListResult>;
  create(visitor: Visitor): Promise<Visitor>;
  save(visitor: Visitor): Promise<Visitor>;
  deleteById(uuid: string): Promise<boolean>;
}
