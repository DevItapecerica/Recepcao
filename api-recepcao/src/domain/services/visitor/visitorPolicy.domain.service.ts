import { IVisitorRepository } from "../../repositories/visitor/visitor.repository.js";

export class VisitorPolicyDomainService {
  constructor(private readonly visitorRepository: IVisitorRepository) {}

  async isDuplicateCpf(cpf: string, excludeUuid?: string): Promise<boolean> {
    return Boolean(await this.visitorRepository.findByCpf(cpf, excludeUuid));
  }
}
