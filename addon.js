const manifest = {
    id: "community.ppvtj.sports",
    version: "1.0.5", // Höhere Version zwingt Stremio zum Update
    name: "⚽ PPV.tj Live Sport",
    description: "Live-Streams für UFC, Fußball, NBA und mehr von PPV.tj",
    resources: ["catalog", "stream"],
    types: ["tv"],
    idPrefixes: ["ppvtj_"],
    catalogs: [
        {
            type: "tv",
            id: "ppvtj_live_channels",
            name: "PPV.tj Sport-Events"
        }
    ]
};

module.exports = async (req, res) => {
    // CORS-Header aktivieren
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Content-Type", "application/json");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // Hol die reine URL ohne Parameter
    const url = req.url.split('?')[0];

    // 1. Route für das Manifest
    if (url === "/manifest.json" || url === "/") {
        return res.status(200).json(manifest);
    }

    // 2. Sport-Katalog ausliefern
    if (url.startsWith("/catalog/")) {
        const catalogMetas = [
            {
                id: "ppvtj_ufc",
                name: "🥊 UFC & Kampfsport Live",
                type: "tv",
                poster: "https://unsplash.com",
                description: "Live-Events und Wiederholungen von PPV.tj"
            },
            {
                id: "ppvtj_football",
                name: "⚽ Fußball Live (Champions League / Ligen)",
                type: "tv",
                poster: "https://unsplash.com",
                description: "Top-Spiele im Live-Stream"
            },
            {
                id: "ppvtj_basketball",
                name: "🏀 NBA & Basketball",
                type: "tv",
                poster: "https://unsplash.com",
                description: "US-Sport und internationale Ligen"
            }
        ];

        return res.status(200).json({ metas: catalogMetas });
    }

    // 3. Fehlerfreie Stream-Route (Holt die ID, egal wie die URL aussieht)
    if (url.startsWith("/stream/")) {
        // Findet "ppvtj_ufc", "ppvtj_football", etc. in der URL
        const match = url.match(/(ppvtj_[a-zA-Z0-9_]+)/);
        const streamId = match ? match[1] : "unknown";

        const streams = [
            {
                name: "⚡ PPV.tj Live",
                title: "🔴 Stream starten (" + streamId.replace("ppvtj_", "").toUpperCase() + ")",
                description: "Verbindung zu PPV.tj aktiv",
                url: "https://googleapis.com"
            }
        ];

        return res.status(200).json({ streams: streams });
    }

    return res.status(404).json({ error: "Route nicht gefunden" });
};
