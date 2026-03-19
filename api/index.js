export default async function handler(req, res) {
  try {
    // Vercel automatically parses the rewritten path into req.query based on vercel.json
    let path = req.query.proxyPath || "";
    if (Array.isArray(path)) {
      path = path.join("/");
    }

    // Reconstruct the original query parameters without 'proxyPath'
    // Vercel's `req.url` in destination contains the full relative URL.
    const urlObj = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    urlObj.searchParams.delete("proxyPath");
    
    const queryPart = urlObj.searchParams.toString();
    const targetUrl = `https://www.reddit.com/${path}${queryPart ? "?" + queryPart : ""}`;

    console.log(`[Proxy] Routing ${req.method} to -> ${targetUrl}`);

    // Using Node's built-in fetch (available in Node 18+ which Vercel uses by default)
    // This entirely avoids `node-fetch` ESM import crashes!
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "User-Agent": "ThreadWebsite/1.0 (unauth)",
      },
    });

    if (!upstream.ok) {
      console.error(`[Proxy] Upstream error: ${upstream.status}`);
      const errText = await upstream.text();
      return res.status(upstream.status).send(errText);
    }

    // Return the response, checking the content type to parse JSON cleanly
    const contentType = upstream.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await upstream.json();
      return res.status(200).json(data);
    } else {
      const text = await upstream.text();
      return res.status(200).send(text);
    }
  } catch (err) {
    console.error("[Proxy Error]:", err);
    return res.status(500).json({ error: "Failed to proxy request", details: err.message });
  }
}
