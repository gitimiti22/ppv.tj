const manifest = {
    id: "community.ppvtj.sports",
    version: "1.0.0",
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
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Content-Type", "application/json");

    const url = req.url.split('?')[0];

    // 1. Manifest ausliefern
    if (url === "/manifest.json" || url === "/") {
        return res.status(200).json(manifest);
    }

    // 2. Sport-Katalog ausliefern (Das Menü, das in Stremio erscheint)
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

    // 3. Streams ausliefern, wenn ein Event angeklickt wird
    if (url.startsWith("/stream/")) {
        const parts = url.split("/");
        const filename = parts[parts.length - 1];
        const streamId = filename.replace(".json", "");

        // Platzhalter für den Live-Stream (m3u8 oder mp4)
        const streams = [
            {
                title: "⚡ PPV.tj Live Stream starten",
                desc: "Kanal: " + streamId.replace("ppvtj_", "").toUpperCase(),
                url: "https://googleapis.com"
            }
        ];

        return res.status(200).json({ streams: streams });
    }

    return res.status(404).json({ error: "Route nicht gefunden" });
};
