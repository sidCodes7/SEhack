export function validateIdParam(req, res, next) {
  const idValue = req.params.id || req.params.anomaly_id;
  const id = parseInt(idValue);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid ID parameter. Must be a positive integer.' });
  }
  next();
}

export function validateZoneIdBody(req, res, next) {
  const { zone_id } = req.body;
  if (!zone_id || isNaN(parseInt(zone_id)) || parseInt(zone_id) <= 0) {
    return res.status(400).json({ error: 'zone_id is required and must be a positive integer.' });
  }
  next();
}
