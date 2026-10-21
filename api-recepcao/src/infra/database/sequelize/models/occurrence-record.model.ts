import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from "sequelize";

export class OccurrenceRecord extends Model<
  InferAttributes<OccurrenceRecord>,
  InferCreationAttributes<OccurrenceRecord>
> {
  declare uuid: CreationOptional<string>;
  declare visitor_uuid: string;
  declare occurrence_uuid: string;
  declare creator_uuid: string;

  declare severity: number;
  declare observation: CreationOptional<string | null>;
  declare occurredAt: Date;
  declare updated_by_uuid: CreationOptional<string | null>;
  declare deleted_by_uuid: CreationOptional<string | null>;
  declare deletedAt: CreationOptional<Date | null>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  const OccurrenceRecordModel = sequelize.define<OccurrenceRecord>(
    "OccurrenceRecordModel",
    {
      uuid: {
        type: dataTypes.UUID,
        defaultValue: dataTypes.UUIDV4,
        primaryKey: true,
      },

      visitor_uuid: {
        type: dataTypes.UUID,
        allowNull: false,
      },

      occurrence_uuid: {
        type: dataTypes.UUID,
        allowNull: false,
      },

      creator_uuid: {
        type: dataTypes.UUID,
        allowNull: false,
      },

      severity: {
        type: dataTypes.TINYINT.UNSIGNED,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
          isInt: true,
        },
      },

      observation: {
        type: dataTypes.TEXT,
        allowNull: true,
      },

      occurredAt: {
        type: dataTypes.DATE,
        allowNull: false,
      },
      updated_by_uuid: {
        type: dataTypes.UUID,
        allowNull: true,
      },

      deleted_by_uuid: {
        type: dataTypes.UUID,
        allowNull: true,
      },  

    deletedAt: {
      type: dataTypes.DATE,
      allowNull: true,
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
      tableName: "occurrence_records",
      timestamps: true,
      paranoid: true,
    }
  );

  (OccurrenceRecordModel as any).associate = (models: any) => {
    OccurrenceRecordModel.belongsTo(models.VisitorsModel, {
      foreignKey: "visitor_uuid",
      as: "Visitor",
    });

    OccurrenceRecordModel.belongsTo(models.OccurrenceModel, {
      foreignKey: "occurrence_uuid",
      as: "Occurrence",
    });

    OccurrenceRecordModel.belongsTo(models.UserModel, {
      foreignKey: "creator_uuid",
      as: "Creator",
    });
  };

  return OccurrenceRecordModel;
};