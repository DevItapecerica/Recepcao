import { DataTypes, QueryInterface } from "sequelize";

interface LegacyVisit {
  uuid: string;
  date: string | null;
}

const indexName = "visits_visited_at_idx";
const legacyDatePattern =
  /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/;

const parseLegacyDate = (value: string | null): Date | null => {
  const match = value?.match(legacyDatePattern);
  if (!match) return null;

  const [, year, month, day, hour, minute, second] = match;
  const result = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );

  const valid =
    result.getFullYear() === Number(year) &&
    result.getMonth() === Number(month) - 1 &&
    result.getDate() === Number(day) &&
    result.getHours() === Number(hour) &&
    result.getMinutes() === Number(minute) &&
    result.getSeconds() === Number(second);

  return valid ? result : null;
};

/** @type {import("sequelize-cli").Migration} */
export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const visits = (await queryInterface.select(
      null,
      "visits",
      {},
    )) as unknown as LegacyVisit[];

    const parsedVisits = visits.map((visit) => ({
      uuid: visit.uuid,
      visitedAt: parseLegacyDate(visit.date),
    }));
    const invalidVisit = parsedVisits.find((visit) => !visit.visitedAt);

    if (invalidVisit) {
      throw new Error(
        `Migration aborted: visit ${invalidVisit.uuid} has an invalid date`,
      );
    }

    await queryInterface.addColumn("visits", "visited_at", {
      type: DataTypes.DATE,
      allowNull: true,
    });

    for (const visit of parsedVisits) {
      await queryInterface.bulkUpdate(
        "visits",
        { visited_at: visit.visitedAt },
        { uuid: visit.uuid },
      );
    }

    await queryInterface.changeColumn("visits", "visited_at", {
      type: DataTypes.DATE,
      allowNull: false,
    });
    await queryInterface.addIndex("visits", ["visited_at"], {
      name: indexName,
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.removeIndex("visits", indexName);
    await queryInterface.removeColumn("visits", "visited_at");
  },
};
