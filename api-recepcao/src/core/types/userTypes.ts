import { UserDB } from "../../infra/db/sequelize/models/user.js";

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
interface getUserSucess {
  ok: true;
  message: string;
  user: UserDB[];
  count: number;
}

interface getUserFail {
  ok: false;
  code: number;
  message: string;
}

export type GetUserGenericResponse = getUserSucess | getUserFail;

interface userSuccessful {
  ok: true;
  code: number;
  message: string;
  user: UserDB;
}

interface UserFail {
  ok: false;
  code: number;
  message: string;
}

export type UserGenericResponse = userSuccessful | UserFail;

export type UserQueryParams = {
  search?: string;
  page?: number;
  limit?: number;
};

export interface GenericResponse {
  ok: boolean;
  code: number;
  message: string;
}
