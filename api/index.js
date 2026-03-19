import express from "express";
import fetch from "node-fetch";

const app = express();

app.use("/reddit", async (req, res) => {
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

export default app;
