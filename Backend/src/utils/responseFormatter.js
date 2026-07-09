/**
 * Standard response envelope helpers.
 * Every API response must use one of these.
 */

function success(res, data, statusCode = 200, meta) {
  const response = { success: true, data };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
}

function error(res, message, statusCode = 500, code) {
  return res.status(statusCode).json({
    success: false,
    error: { message, code: code || `ERR_${statusCode}` },
  });
}

/**
 * Paginate an array and return the envelope the frontend expects.
 * Used by list endpoints that the mock returns as { data, total, page, limit }.
 */
function paginate(arr, page = 1, limit = 20) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, parseInt(limit, 10) || 20);
  const start = (p - 1) * l;
  return {
    data: arr.slice(start, start + l),
    total: arr.length,
    page: p,
    limit: l,
  };
}

module.exports = { success, error, paginate };
