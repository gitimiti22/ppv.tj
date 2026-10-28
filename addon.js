const manifest = {
    id: "community.ppvtj.sports",
    version: "1.7.0", // Version erhöht für Nuvio-Update
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
    // CORS-Header für Nuvio setzen
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Content-Type", "application/json");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // Sicheres Auslesen der URL
    const reqUrl = req.url ? req.url : "/";
    const mainUrl = reqUrl.split('?')[0];

    // 1. Route für das Manifest
    if (mainUrl === "/manifest.json" || mainUrl === "/") {
        return res.status(200).json(manifest);
    }

    // 2. Sport-Katalog ausliefern
    if (mainUrl.startsWith("/catalog/")) {
        return res.status(200).json({ metas: realLiveChannels });
    }

    // 3. Meta-Route ausliefern
    if (mainUrl.startsWith("/meta/")) {
        const match = mainUrl.match(/(ppvtj_[a-zA-Z0-9_]+)/);
        const metaId = match ? match[0] : null;
        const foundMeta = realLiveChannels.find(item => item.id === metaId);
        return res.status(200).json({ meta: foundMeta || realLiveChannels[0] });
    }

    // 4. Stream-Route (Hier wurde der Fehler behoben)
    if (mainUrl.startsWith("/stream/")) {
        const match = mainUrl.match(/(ppvtj_[a-zA-Z0-9_]+)/);
        // Falls kein Match gefunden wird, nutzen wir die UFC-ID als sicheren Standard-Fallback
        const streamId = match ? match[0] : "ppvtj_ufc_main"; 

        // Zuverlässige .m3u8-Teststreams für Nuvio
        let videoUrl = "https://live-video.net"; 

        if (streamId === "ppvtj_football_pl") {
            videoUrl = "https://live-video.net";
        }

        const streams = [
            {
                name: "⚡ PPV.tj Live",
                title: "🟢 Live-Kanal starten",
                type: "tv",
                url: videoUrl
            }
        ];

        return res.status(200).json({ streams: streams });
    }

    return res.status(404).json({ error: "Route nicht gefunden" });
};
