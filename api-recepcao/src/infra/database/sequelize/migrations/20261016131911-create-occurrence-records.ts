import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable("occurrence_records", {
      uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },

      visitor_uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "visitors",
          key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      occurrence_uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "occurrences",
          key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      creator_uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      severity: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
      },

      observation: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      occurredAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    // VALIDAÇÃO: permite somente gravidades de 1 a 5
    await queryInterface.sequelize.query(`
      ALTER TABLE occurrence_records
      ADD CONSTRAINT occurrence_records_severity_check
      CHECK (severity BETWEEN 1 AND 5)
    `);

    // Índice para consultar ocorrências de um munícipe por data
    await queryInterface.addIndex(
      "occurrence_records",
      ["visitor_uuid", "occurredAt"],
      { name: "occurrence_records_visitor_date_idx" }
    );

    // Índice para consultar por tipo de ocorrência
    await queryInterface.addIndex(
      "occurrence_records",
      ["occurrence_uuid"]
    );
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable("occurrence_records");
  },
};