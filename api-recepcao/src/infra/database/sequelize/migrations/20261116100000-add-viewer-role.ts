import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.changeColumn("users", "role", {
      type: DataTypes.ENUM("admin", "user", "recepcionist", "superadmin", "viewer"),
      allowNull: false,
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    const [viewers] = await queryInterface.sequelize.query(
      "SELECT uuid FROM users WHERE role = 'viewer' LIMIT 1",
    );
    if (viewers.length > 0) {
      throw new Error("Reatribua as contas viewer antes de reverter esta migration.");
    }
    await queryInterface.changeColumn("users", "role", {
      type: DataTypes.ENUM("admin", "user", "recepcionist", "superadmin"),
      allowNull: false,
    });
  },
};
