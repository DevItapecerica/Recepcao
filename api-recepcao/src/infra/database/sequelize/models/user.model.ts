import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from "sequelize";

// ─── Classe do modelo ────────────────────────────────────────────
export class UserDB extends Model<
  InferAttributes<UserDB>,
  InferCreationAttributes<UserDB>
> {
  declare uuid: CreationOptional<string>;

  declare first_name: string;
  declare last_name: string;
  declare username: string;
  declare email: string;
  declare cpf: string;
  declare password: string;
  declare role: "admin" | "user" | "recepcionist" | "superadmin";

  declare firstLogin: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  const UserDB = sequelize.define<UserDB>(
    "UserModel",
    {
      uuid: {
        type: dataTypes.UUID,
        defaultValue: dataTypes.UUIDV4,
        primaryKey: true,
      },
      first_name: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      last_name: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      username: {
        type: dataTypes.STRING(50),
        allowNull: false,
      },
      email: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      cpf: {
        type: dataTypes.STRING(14),
        allowNull: false,
      },
      password: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: dataTypes.ENUM("admin", "user", "recepcionist", "superadmin"),
        allowNull: false,
      },
      firstLogin: {
        type: dataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
      // ➜ incluir os três campos controlados pelo Sequelize
      createdAt: { type: dataTypes.DATE },
      updatedAt: { type: dataTypes.DATE },
      deletedAt: { type: dataTypes.DATE },
    },
    {
      tableName: "users",
      timestamps: true, // cria createdAt/updatedAt
      paranoid: true, // cria deletedAt
    },
  );

  (UserDB as any).associate = (models: any) => {
    UserDB.hasMany(models.VisitsModel, {
      foreignKey: "creator_uuid",
      as: "CreatedVisits",
      onDelete: "CASCADE",
    });
  };

  return UserDB;
};
