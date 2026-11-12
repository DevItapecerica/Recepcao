import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from "sequelize";

export class Occurrence extends Model<
  InferAttributes<Occurrence>,
  InferCreationAttributes<Occurrence>
> {
  declare uuid: CreationOptional<string>;
  declare name: string;
  declare description: CreationOptional<string | null>;
  declare severity: CreationOptional<number | null>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  const OccurrenceModel = sequelize.define<Occurrence>(
    "OccurrenceModel",
    {
      uuid: {
        type: dataTypes.UUID,
        defaultValue: dataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: dataTypes.STRING(150),
        allowNull: false,
        unique: true,
      },
      description: {
        type: dataTypes.TEXT,
        allowNull: true,
      },
      severity: {
        type: dataTypes.TINYINT.UNSIGNED,
        allowNull: true,
        validate: {
          min: 1,
          max: 5,
        },
      },
      createdAt: {
        type: dataTypes.DATE,
        defaultValue: dataTypes.NOW,
      },
      updatedAt: {
        type: dataTypes.DATE,
        defaultValue: dataTypes.NOW,
      },
    },
    {
      tableName: "occurrences",
      timestamps: true,
    }
  );

  (OccurrenceModel as any).associate = (models: any) => {
    OccurrenceModel.hasMany(models.OccurrenceRecordModel, {
      foreignKey: "occurrence_uuid",
      as: "OccurrenceRecords",
      onDelete: "RESTRICT",
    });
  };

  return OccurrenceModel;
};