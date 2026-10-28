const manifest = {
    id: "community.ppvtj.sports",
    version: "1.0.2", // Version erhöht für Stremio-Update
    name: "⚽ PPV.tj Live Sport",
    description: "Live-Streams für UFC, Fußball, NBA und mehr von PPV.tj",
    resources: ["catalog", "stream"],
    types: ["tv"],
    idPrefixes: ["ppvtj_"],
    catalogs: [
        {
            type: "tv",
            id: "ppvtj_live_channels",
            name: "PPV.tj Sport-Events",
            extra: [{ name: "search", isRequired: false }]
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

    // Bereinige die URL von eventuellen Query-Parametern (?...)
    const mainUrl = req.url.split('?')[0];

    // 1. Route für das Manifest
    if (mainUrl === "/manifest.json" || mainUrl === "/") {
        return res.status(200).json(manifest);
    }

    // 2. Sport-Katalog ausliefern
    if (mainUrl.startsWith("/catalog/")) {
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

    // 3. SICHERE ROUTE FÜR STREAMS
    if (mainUrl.startsWith("/stream/")) {
        // Beispiel-Pfad: /stream/tv/ppvtj_ufc.json
        const parts = mainUrl.split("/");
        const lastPart = parts[parts.length - 1]; // Holt "ppvtj_ufc.json"
        const streamId = lastPart.replace(".json", ""); // Holt "ppvtj_ufc"

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
