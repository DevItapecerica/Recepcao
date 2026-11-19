import { UserRole } from "../../../domain/entities/User.js";
import { Visit } from "../../../domain/entities/Visit.js";

export interface VisitsParams { uuid: string }
export interface CreateVisitInput {
  creator_uuid: string;
  visitor_uuid: string;
  subject: string;
  date: string;
}
export type VisitsRequired = CreateVisitInput;
export interface VisitsDashboardQuery { dateFrom?: string; dateTo?: string; limit?: string }
export type VisitsGenericResponse = { message: string; visits: Visit };
export type VisitsQueryParams = { search?: string; page?: string; limit: string };
export interface VisitsResponse {
  uuid: string;
  creator_uuid: string;
  creator: { uuid?: string; role?: UserRole; username?: string };
  visitor_uuid: string;
  visitor: { uuid?: string; name?: string; photo: string | null };
  subject: string;
  date: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
