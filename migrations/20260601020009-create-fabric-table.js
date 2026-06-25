'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('fabric', {
      id: {
        type: Sequelize.STRING(21),
        primaryKey: true,
        allowNull: false,
      },
      nama: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      deskripsi: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      gambar: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      lebar: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      kategori: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      harga: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      stok: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
    await queryInterface.dropTable('fabric',);
  },
};
