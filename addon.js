const axios = require("axios");
const cheerio = require("cheerio");

const manifest = {
    id: "community.ppvtj.sports",
    version: "1.2.0", // Höhere Version zwingt Stremio zum Update
    name: "⚽ PPV.tj Real-Time Live Sport",
    description: "Aktuelle Live-Events direkt von ppv.tj",
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

// Hilfsfunktion: Holt die echten Events live von der ppv.tj Webseite
async function fetchLiveEvents() {
    try {
        // Wir rufen die Startseite von ppv.tj ab
        const response = await axios.get("https://ppv.tj/", {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            timeout: 5000
        });

        const $ = cheerio.load(response.data);
        const events = [];

        // HIER PASSIERT DAS LIVE-AUSLESEN:
        // Wir suchen nach den Stream-Boxen/Links auf der Webseite.
        // (Dieser Selektor 'a' und 'div' wird je nach genauem HTML-Layout von ppv.tj angepasst)
        $("a").each((index, element) => {
            const title = $(element).text().trim();
            const href = $(element).attr("href");

            // Wir filtern nach Links, die wie ein Stream aussehen (z.B. Boxen, Live-Planer)
            if (href && (href.includes("/stream") || href.includes("/live") || title.length > 5)) {
                // Wir erstellen eine einzigartige ID aus dem Link, damit Stremio sie zuordnen kann
                const cleanId = Buffer.from(href).toString("base64").replace(/=/g, "");
                
                events.push({
                    id: "ppvtj_" + cleanId,
                    name: "📺 " + title,
                    type: "tv",
                    poster: "https://unsplash.com", // Standard Sport-Poster
                    description: "Live-Stream direkt von ppv.tj öffnen.",
                    originalUrl: href.startsWith("http") ? href : "https://ppv.tj" + href
                });
            }
        });

        // Falls ppv.tj temporär nicht ausgelesen werden kann, senden wir Sicherheits-Fallbacks
        if (events.length === 0) {
            return [
                { id: "ppvtj_fallback_1", name: "🥊 UFC Live Stream", type: "tv", poster: "https://unsplash.com", description: "Prüfe ppv.tj für aktuelle Kampf-Streams." },
                { id: "ppvtj_fallback_2", name: "⚽ Fußball Live", type: "tv", poster: "https://unsplash.com", description: "Prüfe ppv.tj für Live-Spiele." }
            ];
        }

        return events;
    } catch (error) {
        console.error("Fehler beim Laden von ppv.tj:", error);
        return [
            { id: "ppvtj_error", name: "⚠️ ppv.tj temporär nicht erreichbar", type: "tv", poster: "", description: "Der Scraper konnte die Live-Daten nicht abrufen." }
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

    const url = req.url.split('?');

    // 1. Route für das Manifest
    if (url === "/manifest.json" || url === "/") {
        return res.status(200).json(manifest);
    }

    // 2. Dynamischer Sport-Katalog (Holt die echten Daten von der Webseite)
    if (url.startsWith("/catalog/")) {
        const liveEvents = await fetchLiveEvents();
        return res.status(200).json({ metas: liveEvents });
    }

    // 3. Dynamische Meta-Route
    if (url.startsWith("/meta/")) {
        const match = url.match(/(ppvtj_[a-zA-Z0-9_]+)/);
        const metaId = match ? match : null;
        
        const liveEvents = await fetchLiveEvents();
        const foundMeta = liveEvents.find(item => item.id === metaId);
        
        if (foundMeta) {
            return res.status(200).json({ meta: foundMeta });
        }
        return res.status(404).json({ error: "Meta nicht gefunden" });
    }

    // 4. Stream-Route (Spielt das Video ab)
    if (url.startsWith("/stream/")) {
        const streams = [
            {
                name: "⚡ PPV.tj Live Player",
                title: "🟢 Stream starten",
                description: "Verbindung zum Live-Hoster wird geladen...",
                // Hier nutzen wir vorerst das stabile Testvideo, bis wir den m3u8-Link herausfiltern
                url: "https://googleapis.com"
            }
        ];

        return res.status(200).json({ streams: streams });
    }

    return res.status(404).json({ error: "Route nicht gefunden" });
};
