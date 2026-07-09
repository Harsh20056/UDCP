'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // The critical spatial index for conflict detection performance
    await queryInterface.sequelize.query(`
      CREATE INDEX projects_location_idx ON projects USING GIST (location);
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS projects_location_idx;');
  },
};
