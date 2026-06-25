'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('order_details', {
      id: {
        type: Sequelize.STRING(21),
        primaryKey: true,
        allowNull: false,
      },
      order_id: {
        type: Sequelize.STRING(21),
        allowNull: false,
        // relasi ke tabel orders
        references: {
          model: 'orders',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      fabric_id: {
        type: Sequelize.STRING(21),
        allowNull: false,
        // relasi ke tabel fabric
        references: {
          model: 'fabric',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      jumlah: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      harga_satuan: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      subtotal: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },
 
  async down(queryInterface) {
    await queryInterface.dropTable('order_details');
  },
};
