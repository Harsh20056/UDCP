const { Sequelize } = require('sequelize');

/**
 * Build a raw SQL literal for inserting a GEOMETRY(POINT,4326) from lat/lng.
 * Sequelize doesn't natively wrap PostGIS, so we use sequelize.literal().
 */
function makePoint(lat, lng) {
  // PostGIS ST_MakePoint takes (x, y) = (lng, lat)
  return Sequelize.literal(`ST_SetSRID(ST_MakePoint(${parseFloat(lng)}, ${parseFloat(lat)}), 4326)`);
}

/**
 * Parse a raw geometry column value into { lat, lng }.
 * When using ST_AsGeoJSON or when Sequelize returns the raw buffer,
 * we need to handle both cases.
 */
function parsePoint(geojson) {
  if (!geojson) return null;
  // If it's already a parsed GeoJSON object
  if (typeof geojson === 'object' && geojson.coordinates) {
    return { lat: geojson.coordinates[1], lng: geojson.coordinates[0] };
  }
  // If it's a JSON string
  if (typeof geojson === 'string') {
    try {
      const parsed = JSON.parse(geojson);
      if (parsed.coordinates) {
        return { lat: parsed.coordinates[1], lng: parsed.coordinates[0] };
      }
    } catch (e) {
      return null;
    }
  }
  return null;
}

module.exports = { makePoint, parsePoint };
