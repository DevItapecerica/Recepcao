import { QueryInterface, DataTypes } from "sequelize";

/** @type {import("sequelize-cli").Migration} */
export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        "user_sessions",
        {
          id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
          },
          user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: "users", key: "uuid" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },
          refresh_token_hash: {
            type: DataTypes.STRING(64),
            allowNull: false,
            unique: true,
          },
          expires_at: { type: DataTypes.DATE, allowNull: false },
          revoked_at: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
          created_at: { type: DataTypes.DATE, allowNull: false },
          updated_at: { type: DataTypes.DATE, allowNull: false },
        },
        { transaction },
      );

      await queryInterface.addIndex("user_sessions", ["user_id"], { transaction });
      await queryInterface.addIndex("user_sessions", ["expires_at"], { transaction });
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.sequelize.transaction(async (transaction) => {

      await queryInterface.dropTable("user_sessions", { transaction });
    });
  },
};
