
import { FastifyRequest, FastifyReply } from "fastify";

import { AttendantsService } from "../../application/service/AttendantsService.js";

import {
  CreateAttendantData,
  UpdateAttendantData,
} from "../../domain/repositories/attendant/attendant.repository.js";

import { SequelizeAttendantRepository } from "../../infra/database/sequelize/repositories/sequelize.attendant.repository.js";

export class AttendantsController {
  private readonly service = new AttendantsService(
    new SequelizeAttendantRepository(),
  );

  list = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const attendants = await this.service.list();
    return reply.status(200).send(attendants);
  };

  findById = async (
    request: FastifyRequest<{ Params: { uuid: string } }>,
    reply: FastifyReply,
  ) => {
    const attendant = await this.service.findById(request.params.uuid);
    return reply.status(200).send(attendant);
  };

  create = async (
    request: FastifyRequest<{ Body: CreateAttendantData }>,
    reply: FastifyReply,
  ) => {
    const attendant = await this.service.create(request.body);
    return reply.status(201).send(attendant);
  };

  update = async (
    request: FastifyRequest<{
      Params: { uuid: string };
      Body: UpdateAttendantData;
    }>,
    reply: FastifyReply,
  ) => {
    const attendant = await this.service.update(
      request.params.uuid,
      request.body,
    );

    return reply.status(200).send(attendant);
  };

  delete = async (
    request: FastifyRequest<{ Params: { uuid: string } }>,
    reply: FastifyReply,
  ) => {
    const result = await this.service.delete(request.params.uuid);
    return reply.status(200).send(result);
  };
}
