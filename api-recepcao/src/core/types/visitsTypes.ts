import { User } from "../../domain/entities/User.js";
import { Visitor } from "../../domain/entities/Visitor.js";
import { Visit } from "../../domain/entities/Visit.js";

export interface VisitsParams {
  uuid: string;
}

export interface VisitsRequired {
  creator_uuid: string;
  visitor_uuid: string;
  subject: string;
  date: string;
}

export interface VisitsWithAssociation extends Visit {
  visitor?: Visitor;
  creator?: User;
}

// bulk
interface getVisitsSucess {
  message: string;
  visits: VisitsWithAssociation[];
  count: number;
}

export type GetVisitsResponse = getVisitsSucess;

// just one
interface VisitsSuccessfull {
  message: string;
  visits: Visit;
}

export type VisitsGenericResponse = VisitsSuccessfull;

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
