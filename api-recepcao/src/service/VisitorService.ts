import {
  VisitorsQueryParams,
  GetVisitorssResponse,
  VisitorsGenericResponse,
  VisitorsRequired,
} from "../core/types/visitorTypes.js";
import validatorCPF from "../core/utils/validatorCPF.js";
import { visitorRepository } from "../infra/database/sequelize/repositories/sequelize.visitor.repository.js";

const isDuplicateUser = async (cpf?: string | null, excludeUuid?: string) => {
  if (!cpf) return null;
  return visitorRepository.findByCpf(cpf, excludeUuid);
};

export class VisitorsService {
  static async listVisitors(
    query: VisitorsQueryParams
  ): Promise<GetVisitorssResponse> {
    const {
      page = "0",
      limit = "10",
      search = "",
    } = query as {
      page?: string;
      limit?: string;
      search?: string;
    };
    const offset = Number(page) * Number(limit);

    const { count, rows } = await visitorRepository.list({
      search,
      offset,
      limit: Number(limit),
    });

    if (rows.length === 0) {
      return {
        ok: true,
        message: "Nenhum visitante encontrado",
        visitor: [],
        count: 0,
      };
    }

    return {
      ok: true,
      message: "Visitantes listados com sucesso",
      visitor: rows,
      count,
    };
  }

  static async getVisitorById(uuid: string): Promise<VisitorsGenericResponse> {
    const visitor = await visitorRepository.findById(uuid);
    if (!visitor) {
      return {
        ok: false,
        code: 404,
        message: "Visitante não encontrado",
      };
    }
    return {
      ok: true,
      message: "Visitante encontrado",
      visitor,
    };
  }

  static async createVisitor(
    visitorData: VisitorsRequired
  ): Promise<VisitorsGenericResponse> {
    const cpfValidation = validatorCPF(visitorData.cpf);
    if (!cpfValidation.ok) {
      throw {
        ok: false,
        code: 403,
        message: "CPF inválido",
      };
    }

    // Verifica duplicidade
    if (await isDuplicateUser(visitorData.cpf)) {
      throw {
        ok: false,
        code: 403,
        message: "Visitante Já existe",
      };
    }

    const newVisitor = await visitorRepository.create(visitorData);
    return {
      ok: true,
      message: "Visitante criado com sucesso",
      visitor: newVisitor,
    };
  }

  static async updateVisitor(
    uuid: string,
    visitorData: VisitorsRequired
  ): Promise<VisitorsGenericResponse> {
    const updatedVisitor = await visitorRepository.findById(uuid);

    if (!updatedVisitor) {
      return {
        ok: false,
        code: 404,
        message: "Visitante não encontrado",
      };
    }

    // Atualiza os campos do visitante
    Object.assign(updatedVisitor, visitorData);
    await visitorRepository.save(updatedVisitor);
    return {
      ok: true,
      message: "Visitante atualizado com sucesso",
      visitor: updatedVisitor,
    };
  }

  static async deleteVisitor(uuid: string): Promise<VisitorsGenericResponse> {
    const deleted = await visitorRepository.deleteById(uuid);

    if (deleted) {
      return {
        ok: true,
        message: "Visitante deletado com sucesso",
      };
    }
    return {
      ok: false,
      code: 404,
      message: "Visitante não encontrado",
    };
  }
}
