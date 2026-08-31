import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from "sequelize";

export class Visitors extends Model<
  InferAttributes<Visitors>,
  InferCreationAttributes<Visitors>
> {
  declare uuid: CreationOptional<string>;

  declare name: string;
  declare cpf: string;
  declare photo: CreationOptional<string> | null;

  declare email: CreationOptional<string> | null;
  declare phone: CreationOptional<string> | null;
  declare address: CreationOptional<string> | null;
  declare city: CreationOptional<string> | null;
  declare state: CreationOptional<string> | null;
  declare zipCode: CreationOptional<string> | null;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  const Visitors = sequelize.define<Visitors>(
    "VisitorsModel",
    {
      uuid: {
        type: dataTypes.UUID,
        defaultValue: dataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      cpf: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      photo: {
        type: dataTypes.TEXT("medium"),
        allowNull: true,
      },
      email: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      state: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      zipCode: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      createdAt: {
        type: dataTypes.DATE,
      },
      updatedAt: {
        type: dataTypes.DATE,
      },
      deletedAt: {
        type: dataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "visitors",
      timestamps: true,
    },
  );

  (Visitors as any).associate = (models: any) => {
    Visitors.hasMany(models.VisitsModel, {
      foreignKey: "visitor_uuid",
      as: "VisitorVisits",
      onDelete: "CASCADE",
    });
  };

  return Visitors;
};
