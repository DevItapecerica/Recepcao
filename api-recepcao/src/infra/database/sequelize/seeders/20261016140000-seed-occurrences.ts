import { QueryInterface, QueryTypes } from "sequelize";
import { randomUUID } from "node:crypto";

const occurrences = [
  { name: "Falou de forma grosseira", severity: 1 },
  { name: "Desrespeitou orientações", severity: 2 },
  { name: "Gritou com um funcionário", severity: 3 },
  { name: "Ofendeu verbalmente um funcionário", severity: 3 },
  { name: "Ameaçou um funcionário", severity: 4 },
  { name: "Tentativa de agressão física", severity: 5 },
  { name: "Agressão física", severity: 5 },
  { name: "Outros", severity: null },
];

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const existing = await queryInterface.sequelize.query<
      { name: string }
    >(
      "SELECT name FROM occurrences",
      { type: QueryTypes.SELECT }
    );

    const existingNames = new Set(
      existing.map((item) => item.name)
    );

    const now = new Date();

    const newOccurrences = occurrences
      .filter((item) => !existingNames.has(item.name))
      .map((item) => ({
        uuid: randomUUID(),
        name: item.name,
        description: null,
        severity: item.severity,
        createdAt: now,
        updatedAt: now,
      }));

    if (newOccurrences.length > 0) {
      await queryInterface.bulkInsert(
        "occurrences",
        newOccurrences
      );
    }
  },

  down: async (_queryInterface: QueryInterface): Promise<void> => {
    // Não remove os tipos automaticamente para preservar
    // os registros históricos vinculados a eles.
  },
};