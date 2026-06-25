'use strict';

/** @type {import('sequelize-cli').Migration} */
const passwordHash = require('password-hash');
 
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('users', [
      {
        // nanoid tidak bisa dipakai di seeder, pakai string manual
        id:         'admin-batiknesia-001',
        nama:       'Super Admin',
        email:      'admin@batiknesia.com',
        // password-hash: enkripsi password sebelum disimpan
        password:   passwordHash.generate('admin123'),
        no_telp:    '081234567890',
        alamat:     'Kantor Batiknesia',
        role_id:    1,
        createdAt:  new Date(),
        updatedAt:  new Date(),
      },
    ]);
  },
 
  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: 'admin@batiknesia.com' });
  },
};
