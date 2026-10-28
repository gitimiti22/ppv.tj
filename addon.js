const manifest = {
    id: "community.ppvtj.sports",
    version: "1.1.0", // Neue Version zwingt Stremio zum Neuladen
    name: "⚽ PPV.tj Live Sport",
    description: "Live-Streams für UFC, Fußball, NBA und mehr von PPV.tj",
    resources: ["catalog", "meta", "stream"], // "meta" hinzugefügt!
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

// Die gemeinsamen Event-Daten, die sowohl für das Menü als auch für die Detailseite gebraucht werden
const sportEvents = [
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

module.exports = async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Content-Type", "application/json");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    const url = req.url.split('?')[0];

    // 1. Route für das Manifest
    if (url === "/manifest.json" || url === "/") {
        return res.status(200).json(manifest);
    }

    // 2. Sport-Katalog ausliefern (Das Menü)
    if (url.startsWith("/catalog/")) {
        return res.status(200).json({ metas: sportEvents });
    }

    // 3. NEU: Meta-Route ausliefern (Behebt den "No add-on provider meta" Fehler)
    if (url.startsWith("/meta/")) {
        const match = url.match(/(ppvtj_[a-zA-Z0-9_]+)/);
        const metaId = match ? match[0] : null;
        
        const foundMeta = sportEvents.find(item => item.id === metaId);
        
        if (foundMeta) {
            return res.status(200).json({ meta: foundMeta });
        }
        return res.status(404).json({ error: "Meta nicht gefunden" });
    }

    // 4. Stream-Route ausliefern
    if (url.startsWith("/stream/")) {
        const match = url.match(/(ppvtj_[a-zA-Z0-9_]+)/);
        const streamId = match ? match[0] : "unknown";

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
