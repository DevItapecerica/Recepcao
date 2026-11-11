import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.addColumn("subjects", "deletedAt", {
      type: DataTypes.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("attendants", "deletedAt", {
      type: DataTypes.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.removeColumn("attendants", "deletedAt");
    await queryInterface.removeColumn("subjects", "deletedAt");
  },
};