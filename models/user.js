"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // banyak user punya 1 role
      User.belongsTo(models.Role, { foreignKey: "role_id", as: "role" });
      // 1 user bisa punya banyak order
      User.hasMany(models.Order, { foreignKey: "user_id", as: "orders" });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.STRING(21),
        primaryKey: true,
        allowNull: false,
      },
      nama: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      no_telp: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: null,
      },
      alamat: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: true,
    },
  );

  return User;
};
