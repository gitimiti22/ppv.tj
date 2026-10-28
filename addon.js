const manifest = {
    id: "community.ppvtj.sports",
    version: "1.4.0", // Neue Version zwingt Stremio zum Updaten der Liste
    name: "⚽ PPV.tj Live Kanäle",
    description: "Permanente Live-Sport-Feeds direkt von PPV.tj",
    resources: ["catalog", "meta", "stream"],
    types: ["tv"],
    idPrefixes: ["ppvtj_"],
    catalogs: [
        {
            type: "tv",
            id: "ppvtj_live_channels",
            name: "📺 PPV.tj 24/7 Live Feeds"
        }
    ]
};

// Hier tragen wir die echten Kanäle ein, die PPV.tj für die Live-Events verwendet
const realLiveChannels = [
    { id: "ppvtj_ufc_main", name: "🥊 UFC / PPV Event Main Feed", type: "tv", poster: "https://unsplash.com", description: "Haupt-Stream für aktuelle UFC & Boxen Pay-Per-Views" },
    { id: "ppvtj_football_pl", name: "⚽ Premier League Live Feed", type: "tv", poster: "https://unsplash.com", description: "Live-Übertragungen der englischen Liga & Champions League" },
    { id: "ppvtj_nfl_feed", name: "🏈 NFL / American Football Live", type: "tv", poster: "https://unsplash.com", description: "US-Sport Übertragungen Live" },
    { id: "ppvtj_nba_feed", name: "🏀 NBA Basketball Live", type: "tv", poster: "https://unsplash.com", description: "NBA Live-Spiele Feed" },
    { id: "ppvtj_fox_cricket", name: "🏏 Fox Cricket 24/7", type: "tv", poster: "https://unsplash.com", description: "Permanenter Fox Cricket Stream von ppv.tj" }
];

module.exports = async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Content-Type", "application/json");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    const currentUrl = req.url ? req.url.split('?')[0] : "/";

    // 1. Route für das Manifest
    if (currentUrl === "/manifest.json" || currentUrl === "/") {
        return res.status(200).json(manifest);
    }

    // 2. Katalog ausgeben
    if (currentUrl.startsWith("/catalog/")) {
        return res.status(200).json({ metas: realLiveChannels });
    }

    // 3. Meta-Details ausgeben
    if (currentUrl.startsWith("/meta/")) {
        const match = currentUrl.match(/(ppvtj_[a-zA-Z0-9_]+)/);
        const metaId = match ? match[1] : null;
        const foundMeta = realLiveChannels.find(item => item.id === metaId);
        
        return res.status(200).json({ meta: foundMeta || realLiveChannels[0] });
    }

    // 4. Stream starten
    if (currentUrl.startsWith("/stream/")) {
        const match = currentUrl.match(/(ppvtj_[a-zA-Z0-9_]+)/);
        const streamId = match ? match[1] : "unknown";

        // Das Addon liefert hier das Video aus
        const streams = [
            {
                name: "⚡ PPV.tj Stream",
                title: "🟢 Live-Feed starten",
                description: "Spielt den Live-Kanal ab",
                url: "https://googleapis.com"
            }
        ];

        return res.status(200).json({ streams: streams });
    }

    return res.status(404).json({ error: "Route nicht gefunden" });
};
