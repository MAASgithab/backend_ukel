'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.STRING(21),
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.STRING(21),
        allowNull: false,
        // relasi ke tabel users
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      total_harga: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM('sedang diproses', 'dikirim', 'selesai', 'dibatalkan'),
        allowNull: false,
        defaultValue: 'sedang diproses',
      },
      catatan: {
        type: Sequelize.TEXT,
        allowNull: true,
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
    await queryInterface.dropTable('orders');
  },
};
