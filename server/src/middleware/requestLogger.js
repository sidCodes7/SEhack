/**
 * Request logging middleware — logs method, path, status, and response time.
 */
export function requestLogger(req, res, next) {
  const start = Date.now();
  const { method, path: reqPath } = req;

  res.on('finish', () => {
    const ms = Date.now() - start;
    const status = res.statusCode;
    const color = status >= 500 ? '\x1b[31m'   // red
                : status >= 400 ? '\x1b[33m'   // yellow
                : status >= 200 ? '\x1b[32m'   // green
                : '\x1b[0m';                   // reset
    console.log(`${color}[${status}]\x1b[0m ${method} ${reqPath} — ${ms}ms`);
  });

  next();
}
