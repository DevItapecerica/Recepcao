import { User, UserRole } from "../../../domain/entities/User.js";

// Base Types
export interface UserParams {
  uuid: string;
}

export interface UserRequired {
  first_name: string;
  last_name: string;
  role: UserRole;
  email: string;
  password?: string;
  cpf: string;
}

// response to methodes
export type GetUser = {
  message: string;
  user: User[] | null;
  count: number;
}

export type UserGenericResponse = {
  message: string;
  user: User
}

export type GetOneUser = {
  message: string;
  user: User | null;
}

export type GenericResponse = {
  message: string;
}

export type UserQueryParams = {
  search?: string;
  page?: number;
  limit?: number;
};
