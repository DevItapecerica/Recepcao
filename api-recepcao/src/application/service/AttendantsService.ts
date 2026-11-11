
import { AppError } from "../../core/types/errorTypes.js";

import {
  IAttendantRepository,
  CreateAttendantData,
  UpdateAttendantData,
} from "../../domain/repositories/attendant/attendant.repository.js";

export class AttendantsService {
  constructor(
    private readonly attendantRepository: IAttendantRepository,
  ) {}

  async list() {
    return this.attendantRepository.list();
  }

  async findById(uuid: string) {
    const attendant = await this.attendantRepository.findById(uuid);

    if (!attendant) {
      throw new AppError("Atendente não encontrado", 404, "NOT_FOUND");
    }

    return attendant;
  }

  async create(data: CreateAttendantData) {
    const name = data.name?.trim();

    if (!name || name.length > 150) {
      throw new AppError("Nome do atendente inválido", 400, "BAD_REQUEST");
    }

    return this.attendantRepository.create({
      name,
      description: data.description ?? null,
    });
  }

  async update(uuid: string, data: UpdateAttendantData) {
    const updatedData = { ...data };

    if (data.name !== undefined) {
      const name = data.name.trim();

      if (!name || name.length > 150) {
        throw new AppError("Nome do atendente inválido", 400, "BAD_REQUEST");
      }

      updatedData.name = name;
    }

    const attendant = await this.attendantRepository.update(
      uuid,
      updatedData,
    );

    if (!attendant) {
      throw new AppError("Atendente não encontrado", 404, "NOT_FOUND");
    }

    return attendant;
  }

  async delete(uuid: string) {
    const deleted = await this.attendantRepository.delete(uuid);

    if (!deleted) {
      throw new AppError("Atendente não encontrado", 404, "NOT_FOUND");
    }

    return { message: "Atendente excluído com sucesso" };
  }
}
