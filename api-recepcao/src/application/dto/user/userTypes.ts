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

export type UserUpdate = Pick<
  UserRequired,
  "first_name" | "last_name" | "role" | "email"
>;

export interface UserResponse {
  uuid?: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: UserRole;
  firstLogin: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

// response to methodes
export type GetUser = {
  message: string;
  user: User[] | null;
  count: number;
}

export type UserGenericResponse = {
  message: string;
  user: User;
  activationSent?: boolean;
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
