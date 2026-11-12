
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from "sequelize";

export class OccurrenceRecordAudit extends Model<
  InferAttributes<OccurrenceRecordAudit>,
  InferCreationAttributes<OccurrenceRecordAudit>
> {
  declare uuid: CreationOptional<string>;

  declare occurrence_record_uuid: string;
  declare actor_uuid: string;

  declare action: "UPDATE" | "DELETE";

  declare before_data: Record<string, unknown>;
  declare after_data: CreationOptional<Record<string, unknown> | null>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  const OccurrenceRecordAuditModel =
    sequelize.define<OccurrenceRecordAudit>(
      "OccurrenceRecordAuditModel",
      {
        uuid: {
          type: dataTypes.UUID,
          defaultValue: dataTypes.UUIDV4,
          primaryKey: true,
        },

        occurrence_record_uuid: {
          type: dataTypes.UUID,
          allowNull: false,
        },

        actor_uuid: {
          type: dataTypes.UUID,
          allowNull: false,
        },

        action: {
          type: dataTypes.ENUM("UPDATE", "DELETE"),
          allowNull: false,
        },

        before_data: {
          type: dataTypes.JSON,
          allowNull: false,
        },

        after_data: {
          type: dataTypes.JSON,
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
        tableName: "occurrence_record_audits",
        timestamps: true,
      }
    );

  (OccurrenceRecordAuditModel as any).associate = (models: any) => {
    OccurrenceRecordAuditModel.belongsTo(
      models.OccurrenceRecordModel,
      {
        foreignKey: "occurrence_record_uuid",
        as: "OccurrenceRecord",
      }
    );

    OccurrenceRecordAuditModel.belongsTo(models.UserModel, {
      foreignKey: "actor_uuid",
      as: "Actor",
    });
  };

  return OccurrenceRecordAuditModel;
};
