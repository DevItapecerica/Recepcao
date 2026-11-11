import {
  ISubjectRepository,
  CreateSubjectData,
  UpdateSubjectData,
} from "../../domain/repositories/subject/subject.repository.js";

import { AppError } from "../../core/types/errorTypes.js";

export class SubjectsService {
  constructor(
    private readonly subjectRepository: ISubjectRepository,
  ) {}

  async list() {
    return this.subjectRepository.list();
  }

  async findById(uuid: string) {
    const subject = await this.subjectRepository.findById(uuid);

    if (!subject) {
      throw new AppError("Assunto não encontrado", 404, "SUBJECT_NOT_FOUND");
    }

    return subject;
  }

  async create(data: CreateSubjectData) {
    const name = data.name?.trim();

    if (!name || name.length > 150) {
      throw new AppError("Nome do assunto inválido", 400, "INVALID_SUBJECT_NAME");
    }

    const existing = await this.subjectRepository.findByName(name);

    if (existing) {
      throw new AppError("Esse assunto já existe", 409, "SUBJECT_ALREADY_EXISTS");
    }

    return this.subjectRepository.create({
      name,
      description: data.description ?? null,
    });
  }

  async update(uuid: string, data: UpdateSubjectData) {
    await this.findById(uuid);

    const updatedData = { ...data };

    if (data.name !== undefined) {
      const name = data.name.trim();

      if (!name || name.length > 150) {
        throw new AppError("Nome do assunto inválido", 400, "INVALID_SUBJECT_NAME");
      }

      const existing = await this.subjectRepository.findByName(name);

      if (existing && existing.uuid !== uuid) {
        throw new AppError("Esse assunto já existe", 409, "SUBJECT_ALREADY_EXISTS");
      }

      updatedData.name = name;
    }

    const updated = await this.subjectRepository.update(uuid, updatedData);

    if (!updated) {
      throw new AppError("Assunto não encontrado", 404, "SUBJECT_NOT_FOUND");
    }

    return updated;
  }

  async delete(uuid: string) {
    const deleted = await this.subjectRepository.delete(uuid);

    if (!deleted) {
      throw new AppError("Assunto não encontrado", 404, "SUBJECT_NOT_FOUND");
    }

    return { message: "Assunto excluído com sucesso" };
  }
}