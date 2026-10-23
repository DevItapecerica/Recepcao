import assert from "node:assert/strict";
import test from "node:test";
import { IVisitRepository } from "../../domain/repositories/visit/visit.repository.js";
import { rankVisitors } from "../../domain/repositories/visit/visit.repository.js";
import { IUserRepository } from "../../domain/repositories/user/user.repository.js";
import { IVisitorRepository } from "../../domain/repositories/visitor/visitor.repository.js";
import { AppError } from "../../core/types/errorTypes.js";
import { VisitsService } from "./VisitsService.js";

const unusedUserRepository = {} as IUserRepository;
const unusedVisitorRepository = {} as IVisitorRepository;

test("returns dashboard totals and the most frequent visitor", async () => {
  const visitRepository = {
    dashboard: async () => ({
      totalVisits: 7,
      uniqueVisitors: 2,
      visitsByWeekday: [{ label: "Ter", count: 7 }],
      visitsByHour: [{ label: "09h", count: 7 }],
      ranking: [
        { uuid: "1", name: "Ana", photo: null, visitCount: 5 },
        { uuid: "2", name: "Bruno", photo: null, visitCount: 2 },
      ],
    }),
  } as unknown as IVisitRepository;
  const service = new VisitsService(
    visitRepository,
    unusedUserRepository,
    unusedVisitorRepository,
  );

  const result = await service.getDashboard({
    dateFrom: "2026-09-01",
    dateTo: "2026-09-30",
    limit: "5",
  });

  assert.equal(result.dashboard.totalVisits, 7);
  assert.equal(result.dashboard.uniqueVisitors, 2);
  assert.equal(result.dashboard.mostFrequentVisitor?.name, "Ana");
  assert.equal(result.dashboard.ranking.length, 2);
  assert.equal(result.dashboard.visitsByWeekday[0].count, 7);
});

test("returns an empty dashboard without treating it as an error", async () => {
  const visitRepository = {
    dashboard: async () => ({
      totalVisits: 0,
      uniqueVisitors: 0,
      ranking: [],
      visitsByWeekday: [],
      visitsByHour: [],
    }),
  } as unknown as IVisitRepository;
  const service = new VisitsService(
    visitRepository,
    unusedUserRepository,
    unusedVisitorRepository,
  );

  const result = await service.getDashboard({
    dateFrom: "2026-09-01",
    dateTo: "2026-09-30",
  });

  assert.equal(result.dashboard.mostFrequentVisitor, null);
  assert.deepEqual(result.dashboard.ranking, []);
});

test("rejects an invalid dashboard date range", async () => {
  const service = new VisitsService(
    {} as IVisitRepository,
    unusedUserRepository,
    unusedVisitorRepository,
  );

  await assert.rejects(
    service.getDashboard({ dateFrom: "2026-09-31", dateTo: "2026-09-01" }),
    (error: unknown) => error instanceof AppError && error.statusCode === 400,
  );
});

test("ranks by visit count and uses the visitor name as tie-breaker", () => {
  const ranking = rankVisitors(
    [
      { uuid: "3", name: "Carlos", photo: null, visitCount: 2 },
      { uuid: "2", name: "Bruno", photo: null, visitCount: 3 },
      { uuid: "1", name: "Ana", photo: null, visitCount: 3 },
    ],
    2,
  );

  assert.deepEqual(ranking.map((visitor) => visitor.name), ["Ana", "Bruno"]);
});
