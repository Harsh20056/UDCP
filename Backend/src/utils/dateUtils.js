function formatDate(date) {
  if (!date) return null;
  return new Date(date).toISOString();
}

function isDateOverlap(start1, end1, start2, end2) {
  return new Date(start1) <= new Date(end2) && new Date(end1) >= new Date(start2);
}

module.exports = { formatDate, isDateOverlap };
