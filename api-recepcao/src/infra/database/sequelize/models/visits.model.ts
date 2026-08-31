import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from "sequelize";

export class Visits extends Model<
  InferAttributes<Visits>,
  InferCreationAttributes<Visits>
> {
  declare uuid: CreationOptional<string>;
  declare creator_uuid: string;
  declare visitor_uuid: string;
  declare subject: string;
  declare date: string;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  const Visits = sequelize.define<Visits>(
    "VisitsModel",
    {
      uuid: {
        type: dataTypes.UUID,
        defaultValue: dataTypes.UUIDV4,
        primaryKey: true,
      },

      creator_uuid: {
        type: dataTypes.UUID,
        allowNull: false,
        references: {
          model: "UserModel",
          key: "uuid",
        },
      },

      visitor_uuid: {
        type: dataTypes.UUID,
        allowNull: false,
        references: {
          model: "VisitorsModel",
          key: "uuid",
        },
      },
      subject: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: dataTypes.DATE,
        defaultValue: dataTypes.NOW,
      },
      updatedAt: {
        type: dataTypes.DATE,
        defaultValue: dataTypes.NOW,
      },
      deletedAt: {
        type: dataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "visits",
    },
  );

  (Visits as any).associate = (models: any) => {
    Visits.belongsTo(models.VisitorsModel, {
      foreignKey: "visitor_uuid",
      as: "Visitor",
    });
    Visits.belongsTo(models.UserModel, {
      foreignKey: "creator_uuid",
      as: "Creator",
    });
  };

  return Visits;
};
