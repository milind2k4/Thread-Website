// server.js – single Express app that
//  • serves your static front-end (index.html, js/, css/, …)
//  • proxies any `/reddit/...` request to api.reddit.com with CORS enabled

import express from "express";
import fetch from "node-fetch";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 5050; // one port for both static + proxy

//-----------------------------------------------------------------
// 1. STATIC FILES  (http://localhost:5050/index.html)
//-----------------------------------------------------------------
// This assumes your static files are in the same root directory.
// If they are in a subfolder (e.g., 'public'), you should change this to:
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

//-----------------------------------------------------------------
app.listen(PORT, () =>
  console.log(`Dev server running at http://localhost:${PORT}`)
);
