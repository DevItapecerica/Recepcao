import { UserResponse } from "../../application/dto/user/userTypes.js";
import { User } from "../../domain/entities/User.js";

export const presentUser = (user: User): UserResponse => ({
  uuid: user.uuid,
  first_name: user.first_name,
  last_name: user.last_name,
  username: user.username,
  email: user.email,
  role: user.role,
  firstLogin: user.firstLogin,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  deletedAt: user.deletedAt,
});
