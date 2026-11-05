
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from "sequelize";

export class Attendants extends Model<
  InferAttributes<Attendants>,
  InferCreationAttributes<Attendants>
> {
  declare uuid: CreationOptional<string>;
  declare name: string;
  declare description: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  const Attendants = sequelize.define<Attendants>(
    "AttendantsModel",
    {
      uuid: {
        type: dataTypes.UUID,
        defaultValue: dataTypes.UUIDV4,
        primaryKey: true,
      },

      name: {
        type: dataTypes.STRING(150),
        allowNull: false,
      },

      description: {
        type: dataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },

      createdAt: {
        type: dataTypes.DATE,
        allowNull: false,
        defaultValue: dataTypes.NOW,
      },

      updatedAt: {
        type: dataTypes.DATE,
        allowNull: false,
        defaultValue: dataTypes.NOW,
      },
    },
    {
      tableName: "attendants",
    },
  );

  return Attendants;
};
