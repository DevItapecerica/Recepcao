import { FastifyReply, FastifyRequest } from "fastify";
import { VisitorsService } from "../../../service/VisitorService.js";
import {
  VisitorsQueryParams,
  VisitorsRequired,
} from "../../../core/types/visitorTypes.js";

export const getVisitorsController = async (
  request: FastifyRequest<{ Querystring: VisitorsQueryParams }>,
  reply: FastifyReply
): Promise<void> => {
  try {
    const query = request.query;

    const response = await VisitorsService.listVisitors(query);

    if (!response.ok) {
      throw {
        ok: response.ok,
        code: response.code || 500,
        message: response.message || "Erro ao listar visitantes",
      };
    }

    reply.status(200).send({
      message: response.message,
      visitor: response.visitor,
      count: response.count,
    });
  } catch (error: any) {
    throw {
      ok: error.ok || false,
      error: error,
      code: error.code || 500,
      message: error.message || "Impossível listar os visitantes",
    };
  }
};

export const createVisitorController = async (
  request: FastifyRequest<{ Body: VisitorsRequired }>,
  reply: FastifyReply
): Promise<void> => {
  try {
    const data = request.body;
    const visitorData = {
      name: data.name,
      cpf: data.cpf,
      photo: data.photo,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
    };

    const result = await VisitorsService.createVisitor(visitorData);

    if (!result.ok) {
      throw { ok: false, code: result.code, message: result.message };
    }
    reply.status(201).send({
      message: result.message,
      visitor: result.visitor,
    });
  } catch (error: any) {
    throw {
      ok: error.ok || false,
      error: error || "No application error",
      code: error.code || 500,
      message: error.message || "Impossível criar visitante",
    };
  }
};

export const deleteVisitorController = async (
  request: FastifyRequest<{ Params: { uuid: string } }>,
  reply: FastifyReply
) => {
  try {
    const visitorId = request.params.uuid;
    const result = await VisitorsService.deleteVisitor(visitorId);
    if (!result.ok) {
      throw { ok: false, code: result.code, message: result.message };
    }
    reply.status(200).send({
      message: result.message,
    });
  } catch (error: any) {
    throw {
      ok: error.ok || false,
      error: error,
      code: error.code || 500,
      message: error.message || "Impossível deletar visitante",
    };
  }
};

export const updateVisitorController = async (
  request: FastifyRequest<{ Body: VisitorsRequired; Params: { uuid: string } }>,
  reply: FastifyReply
): Promise<void> => {
  try {
    const visitorId = request.params.uuid;
    const data = request.body;
    const visitorData = {
      name: data.name,
      cpf: data.cpf,
      photo: data.photo,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
    };
    const result = await VisitorsService.updateVisitor(visitorId, visitorData);

    if (!result.ok) {
      throw { ok: false, code: result.code, message: result.message };
    }
    reply.status(201).send({
      message: result.message,
      visitor: result.visitor,
    });
  } catch (error: any) {
    throw {
      ok: error.ok || false,
      error: error || "No application error",
      code: error.code || 500,
      message: error.message || "Impossível criar visitante",
    };
  }
};
