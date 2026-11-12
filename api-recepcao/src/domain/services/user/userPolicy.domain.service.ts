import { IUserRepository } from "../../repositories/user/user.repository.js";

export class UserPolicyDomainService {
    constructor(private readonly userRepository: IUserRepository) {}
  readonly isValidRole = (role: string) =>
    ["admin", "user", "recepcionist", "superadmin"].includes(role);

  readonly isDuplicateUser = async (
    email: string,
    cpf?: string | null,
    excludeUuid?: string,
  ) => {
    return this.userRepository.findUserDuplicateByEmailOrCpf(
      email,
      cpf,
      excludeUuid,
    );
  };
}
