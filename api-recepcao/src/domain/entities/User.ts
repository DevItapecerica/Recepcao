import { cpf as cpfValidator } from "cpf-cnpj-validator";

export type UserRole = "admin" | "user" | "recepcionist" | "superadmin";

export interface UserProps {
  first_name: string; last_name: string; username: string; email: string;
  cpf: string; password: string; role: UserRole; uuid?: string;
  firstLogin?: boolean; createdAt?: Date; updatedAt?: Date; deletedAt?: Date | null;
}

export class User {
  public first_name: string;
  public last_name: string;
  public username: string;
  public email: string;
  public cpf: string;
  public role: UserRole;
  public readonly uuid?: string;
  public readonly firstLogin: boolean;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;
  public readonly deletedAt?: Date | null;
  private password: string;

  constructor(props: UserProps) {
    this.first_name = props.first_name; this.last_name = props.last_name;
    this.username = props.username; this.email = props.email; this.cpf = props.cpf;
    this.password = props.password; this.role = props.role; this.uuid = props.uuid;
    this.firstLogin = props.firstLogin ?? true; this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt; this.deletedAt = props.deletedAt;
  }

  get passwordHash(): string { return this.password; }
  changePassword(hash: string): void { this.password = hash; }
  isValidCpf(): boolean { return cpfValidator.isValid(this.cpf); }
  toPersistence(): UserProps { return { ...this, password: this.password }; }
  toJSON(): Omit<UserProps, "password"> {
    const { password: _password, ...user } = this.toPersistence();
    return user;
  }
}
