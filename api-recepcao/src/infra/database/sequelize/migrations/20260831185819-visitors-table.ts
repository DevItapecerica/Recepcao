import { QueryInterface, DataTypes } from "sequelize";

/** @type {import("sequelize-cli").Migration} */
export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        "visitors",
        {
          uuid: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
          },
          name: { type: DataTypes.STRING, allowNull: false },
          cpf: { type: DataTypes.STRING(14), allowNull: false, unique: true },
          photo: { type: DataTypes.TEXT("medium"), allowNull: true },
          email: { type: DataTypes.STRING, allowNull: true },
          phone: { type: DataTypes.STRING, allowNull: true },
          address: { type: DataTypes.STRING, allowNull: true },
          city: { type: DataTypes.STRING, allowNull: true },
          state: { type: DataTypes.STRING, allowNull: true },
          zipCode: { type: DataTypes.STRING, allowNull: true },
          createdAt: { type: DataTypes.DATE, allowNull: false },
          updatedAt: { type: DataTypes.DATE, allowNull: false },
          deletedAt: { type: DataTypes.DATE, allowNull: true },
        },
        { transaction },
      );

      // A migration de visits vem antes desta pelo timestamp; a FK e criada aqui.
      await queryInterface.addConstraint("visits", {
        fields: ["visitor_uuid"],
        type: "foreign key",
        name: "visits_visitor_uuid_fk",
        references: { table: "visitors", field: "uuid" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        transaction,
      });
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.sequelize.transaction(async (transaction) => {

      await queryInterface.removeConstraint("visits", "visits_visitor_uuid_fk", {
        transaction,
      });
      await queryInterface.dropTable("visitors", { transaction });
    });
  },
};
