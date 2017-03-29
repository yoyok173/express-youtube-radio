const ffmpeg = require("fluent-ffmpeg");
const EventEmitter = require("events").EventEmitter;

class Transcoder extends EventEmitter
{
    constructor(url) {
        super();

        this._process = ffmpeg(url)
            .noVideo()
            .audioCodec("libmp3lame")
            .audioQuality(3)
            .format("mp3");

        this._process.on("codecData", (data) => {
            let row = data.duration.match(/(\d+):(\d+):(\d+).(\d+)/);
            let duration = parseInt(row[1]) * 3600 + parseInt(row[2]) * 60 + parseInt(row[3]) + parseInt(row[4]) / 100;
            this.emit("start", duration);
        });

        this._process.on("error", (error) => {
            this._process = null;
            this.emit("error", error);
        });

        this._process.on("end", (stdout, stderr) => {
            this._process = null;
            this.emit("end", stderr);
        });

        this._pipe = this._process.pipe();

        this._pipe.on("error", () => {
            this._pipe = null;
        });

        this._pipe.on("end", () => {
            this._pipe = null;
        });
    }

    pipe(destination, options) {
        if (this._pipe) {
            this._pipe.pipe(destination, options);
        }
    }

    unpipe(destination) {
        if (this._pipe) {
            this._pipe.unpipe(destination);
        }
    }

    kill() {
        if (this._process) {
            this._process.kill();
            this._process = null;
        }
    }
}

module.exports = Transcoder;
