const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const fetch = require("node-fetch");

const manifest = {
    id: "org.mytorrents.sheet",
    version: "1.0.0",
    name: "My Torrent Playlist (Google Sheets)",
    description: "Stream torrents from Google Sheets",
    catalogs: [
        {
            type: "movie",
            id: "mytorrents",
            name: "My Torrents"
        }
    ],
    resources: ["catalog", "stream"],
    types: ["movie"],
    idPrefixes: ["torrent"]
};

// 👇 replace with your Google Sheet JSON URL
const JSON_URL = "https://opensheet.elk.sh/1r10g3g1UODvejUvyO7wXpIzjsxdCb9OEK_yqExTgPGo/Sheet1";

async function getTorrents() {
    const res = await fetch(JSON_URL);
    return res.json();
}

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(async () => {
    const torrents = await getTorrents();
    return {
        metas: torrents.map(t => ({
            id: t.id || t.name,  // fallback to name if no id
            name: t.name,
            type: "movie"
        }))
    };
});

builder.defineStreamHandler(async ({ id }) => {
    const torrents = await getTorrents();
    const item = torrents.find(t => (t.id || t.name) === id);
    if (!item) return { streams: [] };
    return {
        streams: [{ title: item.name, url: item.url }]
    };
});

// 👇 This actually starts the HTTP server
serveHTTP(builder.getInterface(), { port: process.env.PORT || 7000 });
