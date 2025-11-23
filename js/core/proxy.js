import express from 'express';
import fetch from 'node-fetch';
const app = express();

app.get('/reddit/:path(*)', async (req, res) => {
    const target = 'https://api.reddit.com/' + req.params.path;
    try {
        const r = await fetch(target, { headers: { 'User-Agent': 'AnimeSiteDev/0.1' } });
        res.set('Access-Control-Allow-Origin', '*');
        res.json(await r.json());
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(5050, () => console.log('Reddit proxy listening on http://localhost:5050'));

