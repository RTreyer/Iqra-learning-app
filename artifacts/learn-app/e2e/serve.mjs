import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const root = path.resolve(process.argv[2]);
const port = Number(process.argv[3] || 8787);
const types = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".json": "application/json",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
};
// The same headers as netlify.toml, so the e2e tests run under the production policy.
const security = {
  "content-security-policy":
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'; worker-src 'none'; manifest-src 'self'",
  "x-frame-options": "DENY",
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
};
const send = (res, status, headers, body) => {
  res.writeHead(status, { ...security, ...headers });
  if (typeof body === "string") res.end(body);
  else body.pipe(res);
};
http
  .createServer((req, res) => {
    let p;
    try {
      p = decodeURIComponent(req.url.split("?")[0]);
    } catch {
      return send(res, 400, { "content-type": "text/plain" }, "bad request");
    }
    let f = path.resolve(root, "." + p);
    if (f !== root && !f.startsWith(root + path.sep))
      return send(res, 403, { "content-type": "text/plain" }, "forbidden");
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) {
      // Only routes (no extension) fall back to the single page app; a missing asset is a 404.
      if (path.extname(p)) return send(res, 404, { "content-type": "text/plain" }, "not found");
      f = path.join(root, "index.html");
    }
    send(
      res,
      200,
      { "content-type": types[path.extname(f)] || "application/octet-stream" },
      fs.createReadStream(f),
    );
  })
  .listen(port, "127.0.0.1", () => console.log("serving", root, "on", port));
