const axios = require("axios");
const cheerio = require("cheerio");

const manifest = {
    id: "community.ppvtj.sports",
    version: "2.0.0", // Großer Versionssprung zwingt Nuvio, das Menü komplett neu zu laden
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

// Diese Funktion zieht die echten, aktiven Events direkt von der ppv.tj Homepage
async function getRealTimeEvents() {
    try {
        const response = await axios.get("https://ppv.tj/", {
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8"
            },
            timeout: 6000
        });

        const $ = cheerio.load(response.data);
        const dynamicEvents = [];

        // Wir scannen alle Boxen und Links auf ppv.tj nach aktuellen Match-Namen
        $("a, .stream-box, .match-card").each((index, el) => {
            const title = $(el).text().replace(/\s+/g, ' ').trim();
            const href = $(el).attr("href");

            // Filtert nur echte, beschriftete Live-Sport-Events heraus und ignoriert Menüknöpfe
            if (title.length > 8 && href && !href.startsWith("#") && !href.includes("privacy")) {
                const uniqueId = Buffer.from(href).toString("base64").replace(/[^a-zA-Z0-9]/g, "").substring(0, 15);
                
                dynamicEvents.push({
                    id: "ppvtj_" + uniqueId,
                    name: "🔥 " + title, // Signalisiert Nuvio, dass dieses Event jetzt von der Seite gezogen wurde
                    type: "tv",
                    poster: "https://unsplash.com", // Dynamisches Sport-Cover
                    description: "Live-Übertragung von ppv.tj: " + title
                });
            }
        });

        // Falls die Seite leer ist oder uns blockiert, senden wir die 3 Hauptkanäle als Fallback
        if (dynamicEvents.length === 0) {
            return [
                { id: "ppvtj_ufc_live", name: "🥊 UFC Live Event (Prüfe Homepage)", type: "tv", poster: "https://unsplash.com", description: "Schalte ein, falls ein Kampf auf ppv.tj läuft." },
                { id: "ppvtj_football_live", name: "⚽ Fußball Live (Prüfe Homepage)", type: "tv", poster: "https://unsplash.com", description: "Schalte ein, falls ein Spiel aktiv ist." },
                { id: "ppvtj_basketball_live", name: "🏀 NBA Basketball (Prüfe Homepage)", type: "tv", poster: "https://unsplash.com", description: "Aktuelle US-Sport Übertragungen." }
            ];
        }

        return dynamicEvents;
    } catch (err) {
        // Verhindert Absturz des Addons bei Cloudflare-Fehlern
        return [
            { id: "ppvtj_fallback_ufc", name: "🥊 UFC / Boxing Main Stream", type: "tv", poster: "https://unsplash.com", description: "Direkt-Stream" },
            { id: "ppvtj_fallback_foot", name: "⚽ Champions League / Football Feed", type: "tv", poster: "https://unsplash.com", description: "Direkt-Stream" }
        ];
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

    const reqUrl = req.url ? req.url : "/";
    const mainUrl = reqUrl.split('?');

    if (mainUrl === "/manifest.json" || mainUrl === "/") {
        return res.status(200).json(manifest);
    }

    // Katalog lädt die echten Daten im Moment des Öffnens
    if (mainUrl.startsWith("/catalog/")) {
        const liveFeeds = await getRealTimeEvents();
        return res.status(200).json({ metas: liveFeeds });
    }

    if (mainUrl.startsWith("/meta/")) {
        const match = mainUrl.match(/(ppvtj_[a-zA-Z0-9_]+)/);
        const metaId = match ? match : null;
        const liveFeeds = await getRealTimeEvents();
        const foundMeta = liveFeeds.find(item => item.id === metaId);
        return res.status(200).json({ meta: foundMeta || liveFeeds });
    }

    if (mainUrl.startsWith("/stream/")) {
        // Nuvio-kompatibler Live-Stream Feed (.m3u8)
        const streams = [
            {
                name: "⚡ PPV.tj Live Player",
                title: "🟢 Live-Stream starten",
                type: "tv",
                url: "https://live-video.net"
            }
        ];
        return res.status(200).json({ streams: streams });
    }

    return res.status(404).json({ error: "Route nicht gefunden" });
};
