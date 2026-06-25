"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class OrderDetail extends Model {
    static associate(models) {
      // banyak order detail masuk ke 1 order
      OrderDetail.belongsTo(models.Order, {
        foreignKey: "order_id",
        as: "order",
      });
      // banyak order detail mengacu ke 1 kain
      OrderDetail.belongsTo(models.Kain, {
        foreignKey: "fabric_id",
        as: "kain",
      });
    }
  }

  OrderDetail.init(
    {
      id: {
        type: DataTypes.STRING(21),
        primaryKey: true,
        allowNull: false,
      },
      order_id: {
        type: DataTypes.STRING(21),
        allowNull: false,
      },
      fabric_id: {
        type: DataTypes.STRING(21),
        allowNull: false,
      },
      jumlah: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      harga_satuan: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      subtotal: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "OrderDetail",
      tableName: "order_details",
      timestamps: true,
    },
  );

  return OrderDetail;
};
