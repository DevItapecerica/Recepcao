import { QueryInterface, DataTypes } from "sequelize";

/** @type {import("sequelize-cli").Migration} */
export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        "users",
        {
          uuid: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
          },
          first_name: { type: DataTypes.STRING, allowNull: false },
          last_name: { type: DataTypes.STRING, allowNull: false },
          username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
          email: { type: DataTypes.STRING, allowNull: false, unique: true },
          cpf: { type: DataTypes.STRING(14), allowNull: false, unique: true },
          password: { type: DataTypes.STRING, allowNull: false },
          role: {
            type: DataTypes.ENUM("admin", "user", "recepcionist", "superadmin"),
            allowNull: false,
          },
          firstLogin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
          createdAt: { type: DataTypes.DATE, allowNull: false },
          updatedAt: { type: DataTypes.DATE, allowNull: false },
          deletedAt: { type: DataTypes.DATE, allowNull: true },
        },
        { transaction },
      );
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.sequelize.transaction(async (transaction) => {

      await queryInterface.dropTable("users", { transaction });
    });
  },
};
