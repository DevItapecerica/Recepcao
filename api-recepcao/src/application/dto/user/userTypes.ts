import { UserDB } from "../../../infra/database/sequelize/models/user.model.js";

// Base Types
export interface UserParams {
  uuid: string;
}

export interface UserRequired {
  first_name: string;
  last_name: string;
  role: "admin" | "user" | "recepcionist" | "superadmin";
  email: string;
  password?: string;
  cpf: string;
}

// response to methodes
export type GetUser = {
  message: string;
  user: UserDB[] | null;
  count: number;
}

export type UserGenericResponse = {
  message: string;
  user: UserDB
}

export type GetOneUser = {
  message: string;
  user: UserDB | null;
}

export type GenericResponse = {
  message: string;
}

export type UserQueryParams = {
  search?: string;
  page?: number;
  limit?: number;
};
