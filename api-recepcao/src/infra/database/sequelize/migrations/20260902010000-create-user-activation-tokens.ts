import { DataTypes, QueryInterface } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkUpdate(
        "users",
        { firstLogin: false },
        {},
        { transaction },
      );
      await queryInterface.createTable(
        "user_activation_tokens",
        {
          id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: "users", key: "uuid" },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
          },
          token_hash: {
            type: DataTypes.STRING(64),
            allowNull: false,
            unique: true,
          },
          expires_at: { type: DataTypes.DATE, allowNull: false },
          consumed_at: { type: DataTypes.DATE, allowNull: true },
          created_at: { type: DataTypes.DATE, allowNull: false },
          updated_at: { type: DataTypes.DATE, allowNull: false },
        },
        { transaction },
      );
      await queryInterface.addIndex(
        "user_activation_tokens",
        ["user_id", "consumed_at"],
        { transaction },
      );
      await queryInterface.addIndex("user_activation_tokens", ["expires_at"], {
        transaction,
      });
    });
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    // O estado anterior de firstLogin não pode ser reconstruído com segurança.
    await queryInterface.dropTable("user_activation_tokens");
  },
};
