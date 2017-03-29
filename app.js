const LiveStream = require("./lib/LiveStream");
const express = require("express");
const youtube_dl = require("youtube-dl");

let app = express();
let liveStream = new LiveStream();

app.get("/listen", (request, response) => {
    response.header("Transfer-Encoding", "chunked");
    response.header("Content-Type", "audio/mpeg");
    response.header("Cache-Control", "no-cache");
    response.header("Pragma", "no-cache");

    request.on("close", () => {
        liveStream.removeListener(response);
    });

    liveStream.addListener(response);
});

let play = express();

play.get("/youtube/:videoId", (req, res) => {
    let url = `https://youtube.com/watch?v=${req.params.videoId}`;
    console.log(`Express: GET ${req.baseUrl}/youtube/${req.params.videoId}`);

    youtube_dl.getInfo(url, ["--restrict-filenames"], (error, info) => {
        if (error) {
            return res.json({ success: false, error: "VIDEO_NOT_AVAILABLE" });
        }

        console.log(`Express: YouTube [id: ${info.id}, title: ${info.title}]`);
        liveStream.play(info.url);
        res.json({ success: true });
    });
});

app.use("/play", play);

app.listen(8080, () => {
    console.log("Express: Server is listening on port 8080");
});
