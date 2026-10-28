const manifest = {
    id: "community.ppvtj.sports",
    version: "1.0.1",
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
    // CORS-Header aktivieren, damit Stremio zugreifen darf
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Content-Type", "application/json");

    // Falls es eine OPTIONS-Anfrage (Preflight) von Stremio ist
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    const url = req.url;

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

    // 3. FIX: Route für die Streams verbessern
    if (url.startsWith("/stream/")) {
        // Bereinigt die URL von Stremio-Parametern (z.B. /stream/tv/ppvtj_ufc.json)
        const cleanUrl = url.split('?')[0];
        const parts = cleanUrl.split("/");
        const filename = parts[parts.length - 1]; // Holt z.B. "ppvtj_ufc.json"
        const streamId = filename.replace(".json", ""); // Holt z.B. "ppvtj_ufc"

        // Wir senden ein stabiles Testvideo zurück
        const streams = [
            {
                name: "⚡ PPV.tj Live",
                title: "Stream starten (" + streamId.replace("ppvtj_", "").toUpperCase() + ")",
                description: "Verbindung zu PPV.tj wird hergestellt...",
                url: "https://googleapis.com"
            }
        ];

        return res.status(200).json({ streams: streams });
    }

    return res.status(404).json({ error: "Route nicht gefunden" });
};
