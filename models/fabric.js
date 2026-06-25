'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Kain extends Model {
    static associate(models) {
      // banyak kain dimiliki banyak order detail
      Kain.hasMany(models.OrderDetail, { foreignKey: 'fabric_id', as: 'order_details' });
    }
  }

  Kain.init(
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
      deskripsi: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      gambar: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      lebar: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      kategori: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      harga: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      stok: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'Kain',
      tableName: 'fabric',
      timestamps: true,
    }
  );

  return Kain;
};
