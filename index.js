const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const fetch = require("node-fetch");
const crypto = require("crypto");

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
    types: ["movie"]
};

// 👇 replace with your Google Sheet JSON URL
const JSON_URL = "https://opensheet.elk.sh/1r10g3g1UODvejUvyO7wXpIzjsxdCb9OEK_yqExTgPGo/Sheet1";

async function getTorrents() {
    const res = await fetch(JSON_URL);
    return res.json();
}

// generate unique id from magnet link
function generateId(url) {
    return crypto.createHash("md5").update(url).digest("hex");
}

const builder = new addonBuilder(manifest);

// Catalog handler
builder.defineCatalogHandler(async () => {
    const torrents = await getTorrents();
    return {
        metas: torrents.map(t => ({
            id: generateId(t.url),  // unique id from magnet
            name: t.name,
            type: "movie"
        }))
    };
});

// Stream handler
builder.defineStreamHandler(async ({ id }) => {
    const torrents = await getTorrents();
    const item = torrents.find(t => generateId(t.url) === id);
    if (!item) {
        console.log("Stream not found for id:", id);
        return { streams: [] };
    }

    return {
        streams: [
            {
                title: item.name,
                url: item.url
            }
        ]
    };
});

// start server
serveHTTP(builder.getInterface(), { port: process.env.PORT || 7000 });
