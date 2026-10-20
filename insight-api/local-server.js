// Runs the AI function on your own computer (no Vercel, no GitHub needed).
// Start it with:  node --env-file=.env local-server.js
const http = require("http");
const handler = require("./api/insight.js");

http
  .createServer((req, res) => {
    if (req.url.split("?")[0] !== "/api/insight") {
      res.statusCode = 404;
      return res.end("Use /api/insight");
    }
    // tiny adapter so the Vercel-style handler works here
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (obj) => {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(obj));
      return res;
    };
    handler(req, res);
  })
  .listen(3000, () => console.log("Jaga AI function running at http://localhost:3000/api/insight"));
