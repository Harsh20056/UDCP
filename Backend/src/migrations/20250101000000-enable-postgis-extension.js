'use strict';

/**
 * Migration to enable PostGIS extension
 * This must run before any migrations that use geometry types
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    // Enable PostGIS extension (required for GIS features)
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    console.log('✅ PostGIS extension enabled');
    
    // Optionally verify it's working
    try {
      const [results] = await queryInterface.sequelize.query('SELECT PostGIS_version();');
      console.log('✅ PostGIS version:', results[0].postgis_version);
    } catch (error) {
      console.log('⚠️ PostGIS verification failed:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    // Drop PostGIS extension (will cascade and remove all geometry columns)
    await queryInterface.sequelize.query('DROP EXTENSION IF EXISTS postgis CASCADE;');
    console.log('PostGIS extension removed');
  }
};
