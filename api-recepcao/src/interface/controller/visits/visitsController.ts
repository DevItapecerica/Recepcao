import { FastifyReply, FastifyRequest } from "fastify";
import {
  VisitsParams,
  VisitsDashboardQuery,
  VisitsQueryParams,
  VisitsRequired,
} from "../../../application/dto/visit/visitTypes.js";
import { AppError } from "../../../core/types/errorTypes.js";
import { VisitFactory } from "../../factories/visit/visit.factory.js";

export class VisitController {
  private readonly visitsService = new VisitFactory().visitService();

  getDashboard = async (
    request: FastifyRequest<{ Querystring: VisitsDashboardQuery }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const response = await this.visitsService.getDashboard(request.query);
    reply.status(200).send(response);
  };

  getVisits = async (
    request: FastifyRequest<{ Querystring: VisitsQueryParams }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const response = await this.visitsService.listVisits(request.query);
    reply.status(200).send(response);
  };

  getVisitsByVisitorId = async (
    request: FastifyRequest<{ Params: VisitsParams }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const response = await this.visitsService.listVisitsByVisitorId(
      request.params.uuid,
    );
    reply.status(200).send(response);
  };

  postVisits = async (
    request: FastifyRequest<{ Body: VisitsRequired }>,
    reply: FastifyReply,
  ): Promise<void> => {
    if (!request.user?.uuid) {
      throw new AppError("Usuário não autenticado", 401, "UNAUTHORIZED");
    }

    const result = await this.visitsService.createVisits({
      creator_uuid: request.user.uuid,
      visitor_uuid: request.body.visitor_uuid,
      subject: request.body.subject,
      date: request.body.date.replace("T", " "),
    });

    reply.status(201).send({ message: result.message, visits: result.visits });
  };
}
