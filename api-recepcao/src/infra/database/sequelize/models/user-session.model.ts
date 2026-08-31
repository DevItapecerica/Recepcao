import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
  DataTypes,
} from "sequelize";

export interface UserSessionDB
  extends Model<
    InferAttributes<UserSessionDB>,
    InferCreationAttributes<UserSessionDB>
  > {
  id: CreationOptional<number>;
  userId: number;
  refreshTokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;

  createdAt: CreationOptional<Date>;
  updatedAt: CreationOptional<Date>;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  const UserSessionDB = sequelize.define<UserSessionDB>(
    "UserSessionModel",
    {
      id: {
        type: dataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      userId: {
        type: dataTypes.INTEGER,
        allowNull: false,
        field: "user_id",
        references: {
          model: "UserModel",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      refreshTokenHash: {
        type: dataTypes.STRING(64),
        allowNull: false,
        unique: true,
        field: "refresh_token_hash",
      },
      expiresAt: {
        type: dataTypes.DATE,
        allowNull: false,
        field: "expires_at",
      },
      revokedAt: {
        type: dataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: "revoked_at",
      },
      createdAt: {
        type: dataTypes.DATE,
        allowNull: false,
        field: "created_at",
      },
      updatedAt: {
        type: dataTypes.DATE,
        allowNull: false,
        field: "updated_at",
      },
    },
    {
      tableName: "user_sessions",
      timestamps: true,
    },
  );

  (UserSessionDB as any).associate = (models: any) => {
    UserSessionDB.belongsTo(models.UserModel, {
      foreignKey: "userId",
      as: "User",
    });
  };

  return UserSessionDB;
};
