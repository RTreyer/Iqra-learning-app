import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const root = process.argv[2];
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
http
  .createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    let f = path.join(root, p);
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(root, "index.html");
    res.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" });
    fs.createReadStream(f).pipe(res);
  })
  .listen(port, () => console.log("serving", root, "on", port));
