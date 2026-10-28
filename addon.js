const manifest = {
    id: "community.ppvtj.sports",
    version: "1.6.0", // Erhöhte Version zwingt Nuvio zum Update
    name: "⚽ PPV.tj Live Sport",
    description: "Live-Sport-Feeds optimiert für Nuvio und Stremio",
    resources: ["catalog", "meta", "stream"],
    types: ["tv"],
    idPrefixes: ["ppvtj_"],
    catalogs: [
        {
            type: "tv",
            id: "ppvtj_live_channels",
            name: "📺 PPV.tj Live Sport"
        }
    ]
};

const realLiveChannels = [
    { 
        id: "ppvtj_ufc_main", 
        name: "🥊 UFC / Boxing PPV Feed", 
        type: "tv", 
        poster: "https://unsplash.com", 
        description: "Live-Kampfsport Übertragungen" 
    },
    { 
        id: "ppvtj_football_pl", 
        name: "⚽ Live Sport & Football Feed 1", 
        type: "tv", 
        poster: "https://unsplash.com", 
        description: "Live-Fußball und internationale Ligen" 
    },
    { 
        id: "ppvtj_nba_feed", 
        name: "🏀 Live Sport & Basketball Feed 2", 
        type: "tv", 
        poster: "https://unsplash.com", 
        description: "US-Sport und Basketball Übertragungen Live" 
    }
];

module.exports = async (req, res) => {
    // CORS-Header – extrem wichtig für Nuvio
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Content-Type", "application/json");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    const currentUrl = req.url ? req.url.split('?') : "/";

    if (currentUrl === "/manifest.json" || currentUrl === "/") {
        return res.status(200).json(manifest);
    }

    if (currentUrl.startsWith("/catalog/")) {
        return res.status(200).json({ metas: realLiveChannels });
    }

    if (currentUrl.startsWith("/meta/")) {
        const match = currentUrl.match(/(ppvtj_[a-zA-Z0-9_]+)/);
        const metaId = match ? match : null;
        const foundMeta = realLiveChannels.find(item => item.id === metaId);
        return res.status(200).json({ meta: foundMeta || realLiveChannels });
    }

    if (currentUrl.startsWith("/stream/")) {
        const match = currentUrl.match(/(ppvtj_[a-zA-Z0-9_]+)/);
        const streamId = match ? match : "unknown";

        // Zuverlässige .m3u8-Teststreams für Sport
        let videoUrl = "https://mux.dev"; 

        if (streamId === "ppvtj_ufc_main") {
            videoUrl = "https://live-video.net"; 
        } else if (streamId === "ppvtj_football_pl") {
            videoUrl = "https://live-video.net";
        }

        // Nuvio-spezifisches Stream-Format
        const streams = [
            {
                name: "⚡ PPV.tj Live",
                title: "🟢 Live-Kanal starten",
                type: "tv", // Zwingend erforderlich für Nuvio TV-Addons
                behaviorHints: {
                    notWebReady: true // Sagt Nuvio, dass es im nativen Player (mpv/Exo) geladen werden muss
                },
                url: videoUrl
            }
        ];

        return res.status(200).json({ streams: streams });
    }

    return res.status(404).json({ error: "Route nicht gefunden" });
};
