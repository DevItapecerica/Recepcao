import { QueryInterface, DataTypes } from "sequelize";

/** @type {import("sequelize-cli").Migration} */
export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        "visits",
        {
          uuid: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
          },
          creator_uuid: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: "users", key: "uuid" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },
          visitor_uuid: { type: DataTypes.UUID, allowNull: false },
          subject: { type: DataTypes.STRING, allowNull: false },
          date: { type: DataTypes.STRING, allowNull: false },
          createdAt: { type: DataTypes.DATE, allowNull: false },
          updatedAt: { type: DataTypes.DATE, allowNull: false },
          deletedAt: { type: DataTypes.DATE, allowNull: true },
        },
        { transaction },
      );

      await queryInterface.addIndex("visits", ["creator_uuid"], { transaction });
      await queryInterface.addIndex("visits", ["visitor_uuid"], { transaction });
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.sequelize.transaction(async (transaction) => {

      await queryInterface.dropTable("visits", { transaction });
    });
  },
};
