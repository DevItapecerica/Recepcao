import { FastifyReply, FastifyRequest } from "fastify";
import {
  VisitorUpdate,
  VisitorsQueryParams,
  VisitorsRequired,
} from "../../../application/dto/visitor/visitorTypes.js";
import { VisitorFactory } from "../../factories/visitor/visitor.factory.js";
import { presentVisitor } from "../../presenters/visitor.presenter.js";

export class VisitorController {
  private readonly visitorService = new VisitorFactory().visitorService();

  getVisitorsController = async (
    request: FastifyRequest<{ Querystring: VisitorsQueryParams }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const response = await this.visitorService.listVisitors(request.query);

    reply.status(200).send({
      message: response.message,
      visitor: response.visitor.map(presentVisitor),
      count: response.count,
    });
  };

  createVisitorController = async (
    request: FastifyRequest<{ Body: VisitorsRequired }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const result = await this.visitorService.createVisitor(request.body);

    reply.status(201).send({
      message: result.message,
      visitor: result.visitor ? presentVisitor(result.visitor) : undefined,
    });
  };

  deleteVisitorController = async (
    request: FastifyRequest<{ Params: { uuid: string } }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const result = await this.visitorService.deleteVisitor(request.params.uuid);
    reply.status(200).send({ message: result.message });
  };

  updateVisitorController = async (
    request: FastifyRequest<{ Body: VisitorUpdate; Params: { uuid: string } }>,
    reply: FastifyReply,
  ): Promise<void> => {
    const result = await this.visitorService.updateVisitor(
      request.params.uuid,
      request.body,
    );

    reply.status(200).send({
      message: result.message,
      visitor: result.visitor ? presentVisitor(result.visitor) : undefined,
    });
  };
}
