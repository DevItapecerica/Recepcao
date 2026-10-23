import { Visitor } from "../../domain/entities/Visitor.js";

export const presentVisitor = (visitor: Visitor) => ({
  uuid: visitor.uuid,
  name: visitor.name,
  photo: visitor.photo,
  email: visitor.email,
  phone: visitor.phone,
  address: visitor.address,
  city: visitor.city,
  state: visitor.state,
  zipCode: visitor.zipCode,
  createdAt: visitor.createdAt,
  updatedAt: visitor.updatedAt,
  deletedAt: visitor.deletedAt,
});
