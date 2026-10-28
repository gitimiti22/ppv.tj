const axios = require("axios");
const cheerio = require("cheerio");

const manifest = {
    id: "community.ppvtj.sports",
    version: "2.1.0", // Neue Version zwingt Nuvio zum Update
    name: "⚽ PPV.tj Echtzeit Live Sport",
    description: "Zeigt die aktuell echten Live-Events direkt von der ppv.tj Homepage",
    resources: ["catalog", "meta", "stream"],
    types: ["tv"],
    idPrefixes: ["ppvtj_"],
    catalogs: [
        {
            type: "tv",
            id: "ppvtj_live_channels",
            name: "🔴 PPV.tj AKTUELLE LIVE EVENTS"
        }
    ]
};

// Sichere Fallback-Kanäle, falls ppv.tj uns blockiert
const fallbackEvents = [
    { id: "ppvtj_ufc_live", name: "🥊 UFC Live Event", type: "tv", poster: "https://unsplash.com", description: "Schalte ein, falls ein Kampf auf ppv.tj läuft." },
    { id: "ppvtj_football_live", name: "⚽ Fußball Live Match", type: "tv", poster: "https://unsplash.com", description: "Schalte ein, falls ein Spiel aktiv ist." },
    { id: "ppvtj_basketball_live", name: "🏀 NBA Basketball Live", type: "tv", poster: "https://unsplash.com", description: "Aktuelle US-Sport Übertragungen." }
];

async function getRealTimeEvents() {
    try {
        const response = await axios.get("https://ppv.tj", {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            timeout: 5000
        });

        const $ = cheerio.load(response.data);
        const dynamicEvents = [];

        $("a").each((index, el) => {
            const title = $(el).text().replace(/\s+/g, ' ').trim();
            const href = $(el).attr("href");

            if (title.length > 5 && href && !href.startsWith("#") && (href.includes("stream") || href.includes("live") || href.includes("match"))) {
                const uniqueId = Buffer.from(href).toString("base64").replace(/[^a-zA-Z0-9]/g, "").substring(0, 15);
                
                dynamicEvents.push({
                    id: "ppvtj_" + uniqueId,
                    name: "🔥 " + title,
                    type: "tv",
                    poster: "https://unsplash.com",
                    description: "Live-Übertragung von ppv.tj"
                });
            }
        });

        return dynamicEvents.length > 0 ? dynamicEvents : fallbackEvents;
    } catch (err) {
        return fallbackEvents;
    }
}

module.exports = async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Content-Type", "application/json");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // FIX: URL wird jetzt absolut sicher als Text extrahiert (Verhindert den 500er Fehler!)
    const reqUrl = req.url ? req.url : "/";
    const mainUrl = reqUrl.split('?')[0]; 

    try {
        // 1. Route für das Manifest
        if (mainUrl === "/manifest.json" || mainUrl === "/") {
            return res.status(200).json(manifest);
        }

        // 2. Sport-Katalog ausliefern
        if (mainUrl.startsWith("/catalog/")) {
            const liveFeeds = await getRealTimeEvents();
            return res.status(200).json({ metas: liveFeeds });
        }

        // 3. Meta-Route ausliefern
        if (mainUrl.startsWith("/meta/")) {
            const parts = mainUrl.split("/");
            const lastPart = parts[parts.length - 1];
            const metaId = lastPart.replace(".json", "");
            
            const liveFeeds = await getRealTimeEvents();
            const foundMeta = liveFeeds.find(item => item.id === metaId);
            return res.status(200).json({ meta: foundMeta || fallbackEvents[0] });
        }

        // 4. Stream-Route ausliefern
        if (mainUrl.startsWith("/stream/")) {
            const streams = [
                {
                    name: "⚡ PPV.tj Live Player",
                    title: "🟢 Live-Kanal starten",
                    type: "tv",
                    url: "https://live-video.net"
                }
            ];
            return res.status(200).json({ streams: streams });
        }

        return res.status(404).json({ error: "Route nicht gefunden" });

    } catch (globalError) {
        // Falls IRGENDWAS schiefgeht, fängt dieser Block den Fehler ab und rettet Nuvio vor dem 500er-Absturz
        return res.status(200).json({ streams: [] });
    }
};
