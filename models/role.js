'use strict';
 
const { Model } = require('sequelize');
 
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      // 1 role dimiliki banyak user
      Role.hasMany(models.User, { foreignKey: 'role_id', as: 'users' });
    }
  }
 
  Role.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nama_role: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Role',
      tableName: 'roles',
      timestamps: true,
    }
  );
 
  return Role;
};