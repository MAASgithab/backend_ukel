'use strict';
 
const { Model } = require('sequelize');
 
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      // banyak order dimiliki 1 user
      Order.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      // 1 order punya banyak order detail
      Order.hasMany(models.OrderDetail, { foreignKey: 'order_id', as: 'order_details' });
    }
  }
 
  Order.init(
    {
      id: {
        type: DataTypes.STRING(21),
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.STRING(21),
        allowNull: false,
      },
      total_harga: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM('sedang diproses', 'dikirim', 'selesai', 'dibatalkan'),
        allowNull: false,
        defaultValue: 'sedang diproses',
      },
      catatan: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      sequelize,
      modelName: 'Order',
      tableName: 'orders',
      timestamps: true,
    }
  );
 
  return Order;
};