'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('roles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nama_role: {
        type: Sequelize.STRING(50),
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
 
    // Seed default roles langsung saat migration
    await queryInterface.bulkInsert('roles', [
      { nama_role: 'admin',    createdAt: new Date(), updatedAt: new Date() },
      { nama_role: 'pembeli',  createdAt: new Date(), updatedAt: new Date() },
    ]);
  },
 
  async down(queryInterface) {
    await queryInterface.dropTable('roles');
  },
};
