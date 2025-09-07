const { addonBuilder } = require("stremio-addon-sdk");
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

// 👇 paste your Google Sheet JSON URL here
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
            id: t.id || t.name,  // use id if exists, else fallback to name
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

module.exports = builder.getInterface();
