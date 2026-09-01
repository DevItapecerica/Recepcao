export interface VisitorProps {
  name: string; cpf: string; photo?: string | null; email?: string | null;
  phone?: string | null; address?: string | null; city?: string | null;
  state?: string | null; zipCode?: string | null; uuid?: string;
  createdAt?: Date; updatedAt?: Date; deletedAt?: Date | null;
}

export class Visitor {
  constructor(
    public name: string, public cpf: string, public photo: string | null = null,
    public email: string | null = null, public phone: string | null = null,
    public address: string | null = null, public city: string | null = null,
    public state: string | null = null, public zipCode: string | null = null,
    public readonly uuid?: string, public readonly createdAt?: Date,
    public readonly updatedAt?: Date, public readonly deletedAt?: Date | null,
  ) {}

  static create(p: VisitorProps): Visitor {
    return new Visitor(p.name, p.cpf, p.photo, p.email, p.phone, p.address, p.city,
      p.state, p.zipCode, p.uuid, p.createdAt, p.updatedAt, p.deletedAt);
  }

  isValidCpf(): boolean { return cpfValidator.isValid(this.cpf); }
}
import { cpf as cpfValidator } from "cpf-cnpj-validator";
