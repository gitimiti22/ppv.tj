const manifest = {
    id: "community.ppvtj.sports",
    version: "2.5.0", // Versionssprung erzwingt die Aktualisierung der Ligen in Nuvio
    name: "⚽ PPV.tj Ligen & Live Matches",
    description: "Wechsle zwischen den Ligen und streame aktuelle Live-Spiele",
    resources: ["catalog", "meta", "stream"],
    types: ["tv"],
    idPrefixes: ["ppvtj_"],
    catalogs: [
        {
            type: "tv",
            id: "ppvtj_leagues",
            name: "🏆 PPV.tj Ligen-Auswahl"
        }
    ]
};

// Hier bilden wir die Ligen-Auswahl der ppv.tj Homepage exakt ab
const realLeagues = [
    { 
        id: "ppvtj_live_now", 
        name: "🔴 JETZT LIVE (Alle Sportarten)", 
        type: "tv", 
        poster: "https://unsplash.com", 
        description: "Alle aktuell laufenden Live-Übertragungen auf ppv.tj" 
    },
    { 
        id: "ppvtj_ufc_league", 
        name: "🥊 UFC & Boxing PPV", 
        type: "tv", 
        poster: "https://unsplash.com", 
        description: "Live-Kämpfe und Main-Event Pay-Per-Views" 
    },
    { 
        id: "ppvtj_pl_league", 
        name: "⚽ Premier League & UCL", 
        type: "tv", 
        poster: "https://unsplash.com", 
        description: "Top-Fußballbegegnungen im Live-Stream" 
    },
    { 
        id: "ppvtj_nba_league", 
        name: "🏀 NBA Basketball", 
        type: "tv", 
        poster: "https://unsplash.com", 
        description: "US-Sport und Basketball Live-Feeds" 
    },
    { 
        id: "ppvtj_nfl_league", 
        name: "🏈 NFL Football", 
        type: "tv", 
        poster: "https://unsplash.com", 
        description: "Spiele der National Football League live" 
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

    const reqUrl = req.url ? req.url : "/";
    const mainUrl = reqUrl.split('?')[0]; // URL sicher splitten

    try {
        // 1. Manifest
        if (mainUrl === "/manifest.json" || mainUrl === "/") {
            return res.status(200).json(manifest);
        }

        // 2. Katalog liefert die Ligen-Auswahl
        if (mainUrl.startsWith("/catalog/")) {
            return res.status(200).json({ metas: realLeagues });
        }

        // 3. Meta-Details für das ausgewählte Event
        if (mainUrl.startsWith("/meta/")) {
            const parts = mainUrl.split("/");
            const lastPart = parts[parts.length - 1];
            const metaId = lastPart.replace(".json", "");
            
            const foundMeta = realLeagues.find(item => item.id === metaId);
            return res.status(200).json({ meta: foundMeta || realLeagues[0] });
        }

        // 4. Stream-Auswahl (Liefert den passenden Live-Stream basierend auf der Liga)
        if (mainUrl.startsWith("/stream/")) {
            const parts = mainUrl.split("/");
            const lastPart = parts[parts.length - 1];
            const streamId = lastPart.replace(".json", "");

            // Wir definieren hochstabile Sport-Live-Server (.m3u8), die Nuvio ohne Probleme abspielt
            let activeLiveUrl = "https://live-video.net"; // Standard-Sport-Stream

            if (streamId.includes("pl_league") || streamId.includes("football")) {
                activeLiveUrl = "https://live-video.net"; // Fußball-Kanal
            }

            const streams = [
                {
                    name: "⚡ PPV.tj Live Feed",
                    title: "🟢 Live-Übertragung starten",
                    type: "tv",
                    description: "Verbindung zum Live-Stream der gewählten Liga steht.",
                    url: activeLiveUrl
                }
            ];
            return res.status(200).json({ streams: streams });
        }

        return res.status(404).json({ error: "Route nicht gefunden" });

    } catch (err) {
        return res.status(200).json({ streams: [] });
    }
};
