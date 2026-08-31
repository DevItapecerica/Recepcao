import { UserDB } from "../../infra/database/sequelize/models/user.model.js";
import { Visitors } from "../../infra/database/sequelize/models/visitors.model.js";
import { Visits as VisitsDB } from "../../infra/database/sequelize/models/visits.model.js";

export interface VisitsParams {
  uuid: string;
}

export interface VisitsRequired {
  creator_uuid: string;
  visitor_uuid: string;
  subject: string;
  date: string;
}

export interface VisitsWithAssociation extends VisitsDB {
  Visitor?: Visitors;
  Creator?: UserDB;
}

// bulk
interface getVisitsSucess {
  ok: true;
  message: string;
  visits: VisitsWithAssociation[];
  count: number;
}

interface getVisitsFail {
  ok: false;
  code: number;
  message: string;
}

export type GetVisitsResponse = getVisitsSucess | getVisitsFail;

// just one
interface VisitsSuccessfull {
  ok: true;
  message: string;
  visits: VisitsDB;
}

interface VisitsFail {
  ok: false;
  error?: any;
  code: number;
  message: string;
}

export type VisitsGenericResponse = VisitsSuccessfull | VisitsFail;

export type VisitsQueryParams = {
  search?: string;
  page?: string;
  limit: string;
};

export interface VisitsResponse {
  uuid: string;
  creator_uuid: string;
  creator: {
    uuid: string | undefined;
    role: "admin" | "user" | "recepcionist" | "superadmin" | undefined;
    username: string | undefined;
  };
  visitor_uuid: string;
  visitor: {
    uuid: string | undefined;
    name: string | undefined;
    photo: string | null;
  };
  subject: string;
  date: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
