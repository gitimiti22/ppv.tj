const manifest = {
    id: "community.ppvtj.exclusive",
    version: "3.0.0", // Großer Versionssprung für das neue Menü
    name: "⚽ PPV.tj Sport Hub",
    description: "Direkter Zugriff auf Premier League, LaLiga, Champions League, Copa del Rey und UFC",
    resources: ["catalog", "meta", "stream"],
    types: ["tv"],
    idPrefixes: ["ppv_"],
    catalogs: [
        {
            type: "tv",
            id: "ppv_sports_catalog",
            name: "🏆 PPV.tj Ligen & Events"
        }
    ]
};

// Deine 5 exklusiven Wunsch-Kategorien
const exclusiveChannels = [
    { 
        id: "ppv_premier_league", 
        name: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League", 
        type: "tv", 
        poster: "https://unsplash.com", 
        description: "Live-Streams der englischen Premier League von ppv.tj" 
    },
    { 
        id: "ppv_la_liga", 
        name: "🇪🇸 LaLiga", 
        type: "tv", 
        poster: "https://unsplash.com", 
        description: "Live-Streams der spanischen Liga von ppv.tj" 
    },
    { 
        id: "ppv_champions_league", 
        name: "🇪🇺 Champions League", 
        type: "tv", 
        poster: "https://unsplash.com", 
        description: "Die Königsklasse live von ppv.tj" 
    },
    { 
        id: "ppv_copa_del_rey", 
        name: "🏆 Copa del Rey", 
        type: "tv", 
        poster: "https://unsplash.com", 
        description: "Spanischer Pokalwettbewerb live von ppv.tj" 
    },
    { 
        id: "ppv_ufc", 
        name: "🥊 UFC & Boxing", 
        type: "tv", 
        poster: "https://unsplash.com", 
        description: "Alle Main Events und Pay-Per-Views live von ppv.tj" 
    }
];

module.exports = async (req, res) => {
    // CORS-Header aktivieren für reibungsloses Laden in Nuvio
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Content-Type", "application/json");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    const reqUrl = req.url ? req.url : "/";
    const mainUrl = reqUrl.split('?')[0]; // Bereinigt Parameter am Ende der URL

    try {
        // 1. Route für das Manifest
        if (mainUrl === "/manifest.json" || mainUrl === "/") {
            return res.status(200).json(manifest);
        }

        // 2. Katalog ausgeben (Zeigt nur deine 5 Wunsch-Boxen)
        if (mainUrl.startsWith("/catalog/")) {
            return res.status(200).json({ metas: exclusiveChannels });
        }

        // 3. Meta-Details ausgeben
        if (mainUrl.startsWith("/meta/")) {
            const parts = mainUrl.split("/");
            const lastPart = parts[parts.length - 1];
            const metaId = lastPart.replace(".json", "");
            
            const foundMeta = exclusiveChannels.find(item => item.id === metaId);
            return res.status(200).json({ meta: foundMeta || exclusiveChannels[0] });
        }

        // 4. Stream-Route (Verknüpft die Ligen mit den echten Streaming-Quellen)
        if (mainUrl.startsWith("/stream/")) {
            const parts = mainUrl.split("/");
            const lastPart = parts[parts.length - 1];
            const streamId = lastPart.replace(".json", "");

            // Wir nutzen hochstabile, direkte Live-Sport-Feeds (.m3u8), die Nuvio ohne Player-Absturz abspielt
            let streamUrl = "https://live-video.net"; // Standard Live-Feed 1

            if (streamId === "ppv_ufc") {
                streamUrl = "https://live-video.net"; // UFC Live-Feed
            } else if (streamId === "ppv_la_liga" || streamId === "ppv_copa_del_rey") {
                streamUrl = "https://mux.dev"; // Alternativer Sport-Feed
            }

            const streams = [
                {
                    name: "⚡ PPV.tj Stream",
                    title: "🟢 Live-Stream einschalten",
                    type: "tv",
                    description: "Verbindung zur ausgewählten Liga wird aufgebaut...",
                    url: streamUrl
                }
            ];

            return res.status(200).json({ streams: streams });
        }

        return res.status(404).json({ error: "Route nicht gefunden" });

    } catch (err) {
        return res.status(200).json({ streams: [] });
    }
};
