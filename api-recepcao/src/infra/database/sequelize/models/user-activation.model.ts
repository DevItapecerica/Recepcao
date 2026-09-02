import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from "sequelize";

export class UserActivationDB extends Model<InferAttributes<UserActivationDB>, InferCreationAttributes<UserActivationDB>> {
  declare id: CreationOptional<number>;
  declare userId: string;
  declare tokenHash: string;
  declare expiresAt: Date;
  declare consumedAt: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) =>
  sequelize.define<UserActivationDB>("UserActivationModel", {
    id: { type: dataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: dataTypes.UUID, allowNull: false, field: "user_id", references: { model: "users", key: "uuid" }, onDelete: "CASCADE" },
    tokenHash: { type: dataTypes.STRING(64), allowNull: false, unique: true, field: "token_hash" },
    expiresAt: { type: dataTypes.DATE, allowNull: false, field: "expires_at" },
    consumedAt: { type: dataTypes.DATE, allowNull: true, field: "consumed_at" },
    createdAt: { type: dataTypes.DATE, allowNull: false, field: "created_at" },
    updatedAt: { type: dataTypes.DATE, allowNull: false, field: "updated_at" },
  }, { tableName: "user_activation_tokens", timestamps: true });
