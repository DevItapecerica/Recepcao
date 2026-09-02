import {
  VisitorsQueryParams,
  GetVisitorssResponse,
  VisitorsGenericResponse,
  VisitorsRequired,
  VisitorUpdate,
} from "../dto/visitor/visitorTypes.js";
import { Visitor } from "../../domain/entities/Visitor.js";
import { IVisitorRepository } from "../../domain/repositories/visitor/visitor.repository.js";
import { VisitorPolicyDomainService } from "../../domain/services/visitor/visitorPolicy.domain.service.js";
import { AppError } from "../../core/types/errorTypes.js";
import { parsePagination } from "../../core/utils/pagination.js";

export class VisitorsService {
  constructor(
    private readonly visitorRepository: IVisitorRepository,
    private readonly visitorPolicy: VisitorPolicyDomainService,
  ) {}

  async listVisitors(
    query: VisitorsQueryParams
  ): Promise<GetVisitorssResponse> {
    const { search, offset, limit } = parsePagination(query);

    const { count, rows } = await this.visitorRepository.list({
      search,
      offset,
      limit,
    });

    if (rows.length === 0) {
      return {
        message: "Nenhum visitante encontrado",
        visitor: [],
        count: 0,
      };
    }

    return {
      message: "Visitantes listados com sucesso",
      visitor: rows,
      count,
    };
  }

  async getVisitorById(uuid: string): Promise<VisitorsGenericResponse> {
    const visitor = await this.visitorRepository.findById(uuid);
    if (!visitor) {
      throw new AppError("Visitante não encontrado", 404, "NOT_FOUND");
    }
    return {
      message: "Visitante encontrado",
      visitor,
    };
  }

  async createVisitor(
    visitorData: VisitorsRequired
  ): Promise<VisitorsGenericResponse> {
    const visitor = Visitor.create(visitorData);
    if (!visitor.isValidCpf()) {
      throw new AppError("CPF inválido", 400, "INVALID_CPF");
    }

    // Verifica duplicidade
    if (await this.visitorPolicy.isDuplicateCpf(visitorData.cpf)) {
      throw new AppError("Visitante já existe", 409, "DUPLICATE_VISITOR");
    }

    const newVisitor = await this.visitorRepository.create(visitor);
    return {
      message: "Visitante criado com sucesso",
      visitor: newVisitor,
    };
  }

  async updateVisitor(
    uuid: string,
    visitorData: VisitorUpdate
  ): Promise<VisitorsGenericResponse> {
    const updatedVisitor = await this.visitorRepository.findById(uuid);

    if (!updatedVisitor) {
      throw new AppError("Visitante não encontrado", 404, "NOT_FOUND");
    }

    // Atualiza os campos do visitante
    updatedVisitor.name = visitorData.name;
    updatedVisitor.photo = visitorData.photo ?? null;
    updatedVisitor.email = visitorData.email ?? null;
    updatedVisitor.phone = visitorData.phone ?? null;
    updatedVisitor.address = visitorData.address ?? null;
    updatedVisitor.city = visitorData.city ?? null;
    updatedVisitor.state = visitorData.state ?? null;
    updatedVisitor.zipCode = visitorData.zipCode ?? null;
    await this.visitorRepository.save(updatedVisitor);
    return {
      message: "Visitante atualizado com sucesso",
      visitor: updatedVisitor,
    };
  }

  async deleteVisitor(uuid: string): Promise<VisitorsGenericResponse> {
    const deleted = await this.visitorRepository.deleteById(uuid);

    if (!deleted) {
      throw new AppError("Visitante não encontrado", 404, "NOT_FOUND");
    }

    return {
      message: "Visitante deletado com sucesso",
    };
  }
}
