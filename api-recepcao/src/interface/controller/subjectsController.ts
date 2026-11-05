import { FastifyRequest, FastifyReply } from "fastify";

import { SubjectsService } from "../../application/service/SubjectsService.js";

import {
  CreateSubjectData,
  UpdateSubjectData,
} from "../../domain/repositories/subject/subject.repository.js";

import { SequelizeSubjectRepository } from "../../infra/database/sequelize/repositories/sequelize.subject.repository.js";

export class SubjectsController {
  private readonly service = new SubjectsService(
    new SequelizeSubjectRepository(),
  );

  list = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const subjects = await this.service.list();
    return reply.status(200).send(subjects);
  };

  findById = async (
    request: FastifyRequest<{ Params: { uuid: string } }>,
    reply: FastifyReply,
  ) => {
    const subject = await this.service.findById(request.params.uuid);
    return reply.status(200).send(subject);
  };

  create = async (
    request: FastifyRequest<{ Body: CreateSubjectData }>,
    reply: FastifyReply,
  ) => {
    const subject = await this.service.create(request.body);
    return reply.status(201).send(subject);
  };

  update = async (
    request: FastifyRequest<{
      Params: { uuid: string };
      Body: UpdateSubjectData;
    }>,
    reply: FastifyReply,
  ) => {
    const subject = await this.service.update(
      request.params.uuid,
      request.body,
    );

    return reply.status(200).send(subject);
  };

  delete = async (
    request: FastifyRequest<{ Params: { uuid: string } }>,
    reply: FastifyReply,
  ) => {
    const result = await this.service.delete(request.params.uuid);
    return reply.status(200).send(result);
  };
}