// local-dev.js – single Express app that
//  • serves your static front-end (index.html, js/, css/, …)
//  • proxies any `/reddit/...` request to api.reddit.com with CORS enabled

import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 5050; // one port for both static + proxy

//-----------------------------------------------------------------
// 1. STATIC FILES  (http://localhost:5050/index.html)
//-----------------------------------------------------------------
app.use(express.static(path.join(__dirname)));

//-----------------------------------------------------------------
// 2. PROXY /reddit/... -> https://www.reddit.com/...
//-----------------------------------------------------------------
app.use("/reddit", async (req, res) => {
  // req.url is the path relative to the mount point (/reddit)
  // e.g. if original is /reddit/r/anime/..., req.url is /r/anime/...
  const targetUrl = `https://www.reddit.com${req.url}`;

  console.log(`[Proxy] ${req.method} ${req.originalUrl} -> ${targetUrl}`);

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        "User-Agent": "ThreadWebsite/1.0 (unauth)",
      },
    });

    if (!upstream.ok) {
      console.error(`[Proxy] Upstream error: ${upstream.status}`);
      return res.status(upstream.status).send(await upstream.text());
    }

    const data = await upstream.json();
    res.json(data);
  } catch (err) {
    console.error("[Proxy] Network error:", err);
    res.status(500).json({ error: "Proxy failed", details: err.message });
  }
});

//-----------------------------------------------------------------
app.listen(PORT, () =>
  console.log(`Dev server running at http://localhost:${PORT}`)
);
