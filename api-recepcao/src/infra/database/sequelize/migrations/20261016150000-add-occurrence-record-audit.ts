
import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    // Quem realizou a última edição
    await queryInterface.addColumn(
      "occurrence_records",
      "updated_by_uuid",
      {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      }
    );

    // Quem realizou a exclusão lógica
    await queryInterface.addColumn(
      "occurrence_records",
      "deleted_by_uuid",
      {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      }
    );

    // Data da exclusão lógica
    await queryInterface.addColumn(
      "occurrence_records",
      "deletedAt",
      {
        type: DataTypes.DATE,
        allowNull: true,
      }
    );

    // Histórico de alterações e exclusões
    await queryInterface.createTable("occurrence_record_audits", {
      uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },

      occurrence_record_uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "occurrence_records",
          key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      actor_uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      action: {
        type: DataTypes.ENUM("UPDATE", "DELETE"),
        allowNull: false,
      },

      before_data: {
        type: DataTypes.JSON,
        allowNull: false,
      },

      after_data: {
        type: DataTypes.JSON,
        allowNull: true,
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

    await queryInterface.addIndex(
      "occurrence_record_audits",
      ["occurrence_record_uuid", "createdAt"],
      { name: "occurrence_record_audits_record_date_idx" }
    );
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable("occurrence_record_audits");

    await queryInterface.removeColumn(
      "occurrence_records",
      "deletedAt"
    );

    await queryInterface.removeColumn(
      "occurrence_records",
      "deleted_by_uuid"
    );

    await queryInterface.removeColumn(
      "occurrence_records",
      "updated_by_uuid"
    );
  },
};
