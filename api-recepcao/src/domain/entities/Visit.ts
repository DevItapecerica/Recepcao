
import { User } from "./User.js";
import { Visitor } from "./Visitor.js";

export interface VisitProps {
  creator_uuid: string;
  visitor_uuid: string;
  subject: string | null;
  date: string;

  subject_uuid?: string | null;
  attendant_uuid?: string | null;

  uuid?: string;
  creator?: User;
  visitor?: Visitor;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class Visit {
  constructor(
    public creator_uuid: string,
    public visitor_uuid: string,
    public subject: string | null,
    public date: string,
    public readonly uuid?: string,
    public readonly creator?: User,
    public readonly visitor?: Visitor,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly deletedAt?: Date | null,
    public subject_uuid: string | null = null,
    public attendant_uuid: string | null = null,
  ) {}

  static create(p: VisitProps): Visit {
    return new Visit(
      p.creator_uuid,
      p.visitor_uuid,
      p.subject,
      p.date,
      p.uuid,
      p.creator,
      p.visitor,
      p.createdAt,
      p.updatedAt,
      p.deletedAt,
      p.subject_uuid ?? null,
      p.attendant_uuid ?? null,
    );
  }
}
