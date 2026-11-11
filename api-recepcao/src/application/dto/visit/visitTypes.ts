import { UserRole } from "../../../domain/entities/User.js";
import { Visit } from "../../../domain/entities/Visit.js";

export interface VisitsParams {
  uuid: string;
}

export interface CreateVisitInput {
  creator_uuid: string;
  visitor_uuid: string;
  subject_uuid: string;
  attendant_uuid?: string | null;
  subject?: string | null;
  date: string;
}

export type VisitsRequired = CreateVisitInput;

export interface VisitsDashboardQuery {
  dateFrom?: string;
  dateTo?: string;
  limit?: string;
}

export type VisitsGenericResponse = {
  message: string;
  visits: Visit;
};

export type VisitsQueryParams = {
  search?: string;
  page?: string;
  limit: string;
};

export interface VisitsResponse {
  uuid: string;

  creator_uuid: string;
  creator: {
    uuid?: string;
    role?: UserRole;
    username?: string;
  };

  visitor_uuid: string;
  visitor: {
    uuid?: string;
    name?: string;
    photo: string | null;
  };

  // Observação da visita (campo antigo)
  subject: string | null;

  // Identificadores do assunto e do atendente
  subject_uuid?: string | null;
  attendant_uuid?: string | null;

  // Nomes para exibição no histórico
  subjectName: string | null;
  attendantName: string | null;

  // Data e hora da visita
  date: string;

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
