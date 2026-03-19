import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 5050;

http.createServer(async (req, res) => {
  let urlPath = req.url.split('?')[0];

  // Proxy /reddit
  if (urlPath.startsWith('/reddit')) {
    const redditPath = urlPath.replace('/reddit', '');
    const queryPart = req.url.substring(urlPath.length);
    const targetUrl = `https://www.reddit.com${redditPath}${queryPart}`;
    console.log(`[Proxy] Routing ${req.method} to -> ${targetUrl}`);
    
    try {
      const upstream = await fetch(targetUrl, {
        method: req.method,
        headers: { 'User-Agent': 'ThreadWebsite/1.0 (unauth)' }
      });
      res.writeHead(upstream.status, { 'Content-Type': upstream.headers.get('content-type') || 'application/json' });
      res.end(await upstream.text());
    } catch(err) {
      console.error(err);
      res.writeHead(500); res.end('Proxy failed');
    }
    return;
  }

  // Static file server
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(__dirname, urlPath);
  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
  };
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
       if (error.code === 'ENOENT') {
           res.writeHead(404);
           res.end('Cannot GET ' + req.url); // match the old Express error text so tests don't break
       } else {
           res.writeHead(500);
           res.end('Server Error: ' + error.code);
       }
    } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
    }
  });

}).listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
