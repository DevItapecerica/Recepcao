import { Visitors as VisitorsDB } from "../../infra/database/sequelize/models/visitors.model.js";

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
interface getVisitorsSucess {
  ok: true;
  message: string;
  visitor: VisitorsDB[];
  count: number;
}

interface getVisitorsFail {
  ok: false;
  code: number;
  message: string;
}

export type GetVisitorssResponse = getVisitorsSucess | getVisitorsFail;

interface VisitorsSuccessful {
  ok: true;
  message: string;
  visitor?: VisitorsDB;
}

interface VisitorsFail {
  ok: false;
  error?: any;
  code: number;
  message: string;
}

export type VisitorsGenericResponse = VisitorsSuccessful | VisitorsFail;

export type VisitorsQueryParams = {
  search?: string;
  page?: number;
  limit?: number;
};
