import { FastifyReply, FastifyRequest } from "fastify";
import {
  VisitsParams,
  VisitsQueryParams,
  VisitsRequired,
} from "../../../core/types/visitsTypes.js";
import { VisitsService } from "../../../application/service/VisitsService.js";

export const getVisits = async (
  request: FastifyRequest<{ Querystring: VisitsQueryParams }>,
  reply: FastifyReply
) => {
  const query = request.query;

    const response = await VisitsService.listVisits(query);

    reply.status(200).send({
      message: response.message,
      visits: response.visits,
      count: response.count,
    });

};

export const getVisitsByVisitorId = async (
  request: FastifyRequest<{ Params: VisitsParams }>,
  reply: FastifyReply
) => {
  const { uuid } = request.params;

  try {
    const response = await VisitsService.listVisitsByVisitorId(uuid);

    if (!response.ok) {
      throw {
        ok: response.ok,
        code: response.code || 500,
        message: response.message || "Erro ao listar visitantes",
      };
    }

    reply.status(200).send({
      message: response.message,
      visits: response.visits,
    });
  } catch (error: any) {
    throw {
      code: error.code || 500,
      message: error.message || "erro interno no servidor",
      ok: false,
    };
  }
};

export const postVisits = async (
  request: FastifyRequest<{ Body: VisitsRequired }>,
  reply: FastifyReply
) => {
  const { visitor_uuid, subject, date } = request.body;

  const formated_date = date.replace("T", " ");

  if (!request.user || !request.user.uuid) {
    throw {
      code: 401,
      message: "Usuário não autenticado",
      ok: false,
    };
  }

  const payload = {
    creator_uuid: request.user.uuid,
    visitor_uuid,
    subject,
    date: formated_date,
  };

  const newVisit = await VisitsService.createVisits(payload);

  if (!newVisit.ok) {
    throw { ...newVisit };
  }

  reply
    .status(201)
    .send({ message: newVisit.message, visits: newVisit.visits });
};
