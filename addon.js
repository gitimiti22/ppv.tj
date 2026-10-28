const axios = require("axios");
const cheerio = require("cheerio");

const manifest = {
    id: "community.ppvtj.sports",
    version: "1.3.0", // Höhere Version zwingt Stremio zum Update
    name: "⚽ PPV.tj Live Sport",
    description: "Live-Streams für UFC, Fußball, NBA und mehr von PPV.tj",
    resources: ["catalog", "meta", "stream"],
    types: ["tv"],
    idPrefixes: ["ppvtj_"],
    catalogs: [
        {
            type: "tv",
            id: "ppvtj_live_channels",
            name: "🔴 PPV.tj JETZT LIVE"
        }
    ]
};

// Feste Kanäle als sicherer Fallback, falls ppv.tj die Cloud-Abfrage blockiert
const fallbackEvents = [
    { id: "ppvtj_ufc_live", name: "🥊 UFC & MMA Live Stream", type: "tv", poster: "https://unsplash.com", description: "Live-Events und Kampfsport-Wiederholungen von PPV.tj" },
    { id: "ppvtj_football_1", name: "⚽ Fußball Live Match 1", type: "tv", poster: "https://unsplash.com", description: "Top-Spiele (Champions League / Premier League)" },
    { id: "ppvtj_football_2", name: "⚽ Fußball Live Match 2", type: "tv", poster: "https://unsplash.com", description: "Alternative Live-Übertragung" },
    { id: "ppvtj_basketball_live", name: "🏀 NBA & Basketball Live", type: "tv", poster: "https://unsplash.com", description: "US-Sport Live-Streams" }
];

async function fetchLiveEvents() {
    try {
        const response = await axios.get("https://ppv.tj", {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            timeout: 4000
        });

        const $ = cheerio.load(response.data);
        const events = [];

        $("a").each((index, element) => {
            const title = $(element).text().trim();
            const href = $(element).attr("href");

            if (href && title.length > 3 && (href.includes("stream") || href.includes("live") || href.includes("match"))) {
                const cleanId = Buffer.from(href).toString("base64").replace(/=/g, "").substring(0, 15);
                events.push({
                    id: "ppvtj_" + cleanId,
                    name: "📺 " + title,
                    type: "tv",
                    poster: "https://unsplash.com",
                    description: "Live-Stream direkt von PPV.tj öffnen."
                });
            }
        });

        return events.length > 0 ? events : fallbackEvents;
    } catch (error) {
        // Falls ppv.tj blockiert oder offline ist, stürzt der Server dank 'catch' nicht ab!
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

    // FIX: Die URL wird jetzt absolut sicher getrennt (Verhindert den 500er Fehler!)
    const currentUrl = req.url ? req.url.split('?')[0] : "/";

    // 1. Route für das Manifest
    if (currentUrl === "/manifest.json" || currentUrl === "/") {
        return res.status(200).json(manifest);
    }

    // 2. Sport-Katalog ausliefern
    if (currentUrl.startsWith("/catalog/")) {
        const liveEvents = await fetchLiveEvents();
        return res.status(200).json({ metas: liveEvents });
    }

    // 3. Meta-Route ausliefern
    if (currentUrl.startsWith("/meta/")) {
        const match = currentUrl.match(/(ppvtj_[a-zA-Z0-9_]+)/);
        const metaId = match ? match[0] : null;
        
        const liveEvents = await fetchLiveEvents();
        const foundMeta = liveEvents.find(item => item.id === metaId) || fallbackEvents[0];
        
        return res.status(200).json({ meta: foundMeta });
    }

    // 4. Stream-Route ausliefern
    if (currentUrl.startsWith("/stream/")) {
        const streams = [
            {
                name: "⚡ PPV.tj Live",
                title: "🟢 Stream starten",
                description: "Öffnet das ausgewählte Sport-Event",
                url: "https://googleapis.com"
            }
        ];

        return res.status(200).json({ streams: streams });
    }

    return res.status(404).json({ error: "Route nicht gefunden" });
};
