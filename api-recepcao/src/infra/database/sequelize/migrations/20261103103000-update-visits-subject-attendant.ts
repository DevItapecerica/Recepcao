
import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.changeColumn("visits", "subject", {
      type: DataTypes.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn("visits", "subject_uuid", {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "subjects",
        key: "uuid",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    await queryInterface.addColumn("visits", "attendant_uuid", {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "attendants",
        key: "uuid",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.removeColumn("visits", "attendant_uuid");
    await queryInterface.removeColumn("visits", "subject_uuid");

    // Mantém subject opcional para não comprometer
    // visitas que possam ter sido criadas sem observação.
  },
};
