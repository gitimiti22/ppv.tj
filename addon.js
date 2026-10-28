const manifest = {
    id: "community.ppvtj.bridge",
    version: "3.5.0", 
    name: "⚽ PPV.tj Live Web-Feeds",
    description: "Generiert direkte Links zu den laufenden Spielen auf ppv.tj",
    resources: ["catalog", "meta", "stream"],
    types: ["tv"],
    idPrefixes: ["ppv_"],
    catalogs: [
        {
            type: "tv",
            id: "ppv_sports_catalog",
            name: "🏆 Live auf PPV.tj"
        }
    ]
};

const exclusiveChannels = [
    { id: "ppv_premier_league", name: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League Live", type: "tv", poster: "https://unsplash.com", description: "Öffnet direkt die aktuellen Premier League Streams auf der Homepage." },
    { id: "ppv_la_liga", name: "🇪🇸 LaLiga Live", type: "tv", poster: "https://unsplash.com", description: "Öffnet direkt die spanischen Live-Matches." },
    { id: "ppv_champions_league", name: "🇪🇺 Champions League Live", type: "tv", poster: "https://unsplash.com", description: "Öffnet direkt die aktuellen Königsklassen-Spiele." },
    { id: "ppv_ufc", name: "🥊 UFC & Boxing Main Event", type: "tv", poster: "https://unsplash.com", description: "Öffnet die aktuellen Kampfsport-Feeds." }
];

module.exports = async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Content-Type", "application/json");

    if (req.method === "OPTIONS") return res.status(200).end();

    const reqUrl = req.url ? req.url : "/";
    const mainUrl = reqUrl.split('?')[0]; 

    try {
        if (mainUrl === "/manifest.json" || mainUrl === "/") {
            return res.status(200).json(manifest);
        }

        if (mainUrl.startsWith("/catalog/")) {
            return res.status(200).json({ metas: exclusiveChannels });
        }

        if (mainUrl.startsWith("/meta/")) {
            const parts = mainUrl.split("/");
            const metaId = parts[parts.length - 1].replace(".json", "");
            const foundMeta = exclusiveChannels.find(item => item.id === metaId);
            return res.status(200).json({ meta: foundMeta || exclusiveChannels[0] });
        }

        if (mainUrl.startsWith("/stream/")) {
            const parts = mainUrl.split("/");
            const streamId = parts[parts.length - 1].replace(".json", "");

            // Bestimme die Ziel-URL auf der echten Website
            let webUrl = "https://ppv.tj/";
            if (streamId === "ppv_champions_league") webUrl = "https://ppv.tj/"; // Leitet direkt zur Live-Auswahl weiter
            
            const streams = [
                {
                    name: "🌐 Auf PPV.tj ansehen",
                    title: "🚀 Stream im Browser öffnen",
                    type: "tv",
                    externalUrl: webUrl // Nutzt externalUrl statt url, damit Nuvio den Browser öffnet
                }
            ];

            return res.status(200).json({ streams: streams });
        }

        return res.status(404).json({ error: "Nicht gefunden" });
    } catch (err) {
        return res.status(200).json({ streams: [] });
    }
};
