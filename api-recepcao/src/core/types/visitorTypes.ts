import { Visitor } from "../../domain/entities/Visitor.js";

export interface VisitorsParams {
  uuid: string;
}

export interface VisitorsRequired {
  name: string;
  cpf: string;
  photo?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
}

// response to methodes
export type getVisitors = {
  message: string;
  visitor: Visitor[];
  count: number;
}

export type VisitorUpdate = Omit<VisitorsRequired, "cpf">;

export type GetVisitorssResponse = {
  message: string;
  visitor: Visitor[];
  count: number;
};

export type VisitorsGenericResponse = { message: string; visitor?: Visitor };

export type VisitorsQueryParams = {
  search?: string;
  page?: number;
  limit?: number;
};
