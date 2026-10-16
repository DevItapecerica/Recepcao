
import { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../../core/types/errorTypes.js";
import { OccurrenceFactory } from "../../factories/occurrence/occurrence.factory.js";

import type {
  CreateOccurrenceData,
  UpdateOccurrenceData,
} from "../../../application/service/OccurrenceService.js";

type VisitorParams = {
  uuid: string;
};

type RecordParams = {
  uuid: string;
};

type CreateOccurrenceBody = Omit<
  CreateOccurrenceData,
  "creator_uuid"
>;

type UpdateOccurrenceBody = UpdateOccurrenceData;

export class OccurrenceController {
  private readonly occurrenceService =
    new OccurrenceFactory().occurrenceService();

  // Lista os tipos de ocorrências.
  getTypes = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const result = await this.occurrenceService.listTypes();

    reply.status(200).send(result);
  };

  // Cadastra uma ocorrência.
  createOccurrence = async (
    request: FastifyRequest<{ Body: CreateOccurrenceBody }>,
    reply: FastifyReply,
  ): Promise<void> => {
    if (!request.user?.uuid) {
      throw new AppError(
        "Usuário não autenticado",
        401,
        "UNAUTHORIZED",
      );
    }

    const result = await this.occurrenceService.createOccurrence({
      ...request.body,
      creator_uuid: request.user.uuid,
    });

    reply.status(201).send(result);
  };

  // Consulta o histórico de ocorrências do munícipe.
  getVisitorHistory = async (
    request: FastifyRequest<{ Params: VisitorParams }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const result = await this.occurrenceService.getVisitorHistory(
      request.params.uuid,
    );

    reply.status(200).send(result);
  };

  // Consulta a pontuação e o status do munícipe.
  getVisitorStatus = async (
    request: FastifyRequest<{ Params: VisitorParams }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const result = await this.occurrenceService.getVisitorStatus(
      request.params.uuid,
    );

    reply.status(200).send(result);
  };

  // Edita uma ocorrência existente.
  updateOccurrence = async (
    request: FastifyRequest<{
      Params: RecordParams;
      Body: UpdateOccurrenceBody;
    }>,
    reply: FastifyReply,
  ): Promise<void> => {
    if (!request.user?.uuid) {
      throw new AppError(
        "Usuário não autenticado",
        401,
        "UNAUTHORIZED",
      );
    }

    const result = await this.occurrenceService.updateOccurrence(
      request.params.uuid,
      request.body,
      request.user.uuid,
    );

    reply.status(200).send(result);
  };

  // Exclui logicamente uma ocorrência.
  deleteOccurrence = async (
    request: FastifyRequest<{ Params: RecordParams }>,
    reply: FastifyReply,
  ): Promise<void> => {
    if (!request.user?.uuid) {
      throw new AppError(
        "Usuário não autenticado",
        401,
        "UNAUTHORIZED",
      );
    }

    const result = await this.occurrenceService.deleteOccurrence(
      request.params.uuid,
      request.user.uuid,
    );

    reply.status(200).send(result);
  };

  // Consulta o histórico de edições e exclusões.
  getOccurrenceAudit = async (
    request: FastifyRequest<{ Params: RecordParams }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const result = await this.occurrenceService.getOccurrenceAudit(
      request.params.uuid,
    );

    reply.status(200).send(result);
  };
}
