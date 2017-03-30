const Transcoder = require("./Transcoder");

class LiveStream
{
    constructor() {
        this.transcoder = null;
        this.timer = null;
        this.buffer = null;
        this.listeners = new Set();
        this.queue = new Array();
    }

    play(url) {
        if (this.timer || this.transcoder) {
            this.queue.push(url);
            console.log(`LiveStream: Pushed to queue (size: ${this.queue.length})`)
            return;
        }

        let start = false;

        this.transcoder = new Transcoder(url);

        this.transcoder.on("start", (duration) => {
            console.log(`LiveStream: Duration: ${duration} seconds`);
            start = Date.now();

            let sizeEstimate = (192 * duration) / 8; // CBR is not constant (ffs.)
            console.log(`LiveStream: File size estimate: ${Math.floor(sizeEstimate)} KB, ${Math.floor(sizeEstimate / 1024)} MB`);

            this.timer = setTimeout(() => {
                this.timer = null;
                console.log("LiveStream: <<Timeout>>");
                this.playNext();
            }, duration * 1000);
        });

        this.transcoder.on("error", (error) => {
            console.log(`LiveStream: Error: ${error}`);
            this.transcoder = null;
            this.playNext();
        });

        this.transcoder.on("end", () => {
            let duration = !start ? -1 : (Date.now() - start) / 1000;
            console.log(`LiveStream: Transcoding finished (time: ${duration} seconds)`);

            // let buffer = this.transcoder.buffer;
            // console.log(`LiveStream: Buffer length: ${buffer.length} bytes (${Math.floor(buffer.length / 1024)} KB)`);

            // let crypto = require("crypto"),
            //     fs = require("fs");
            // let file = fs.createWriteStream(`tmp/${crypto.randomBytes(8).toString("hex")}.mp3`);
            // file.write(buffer);
            // file.close();

            this.transcoder = null;
        });

        for (let listener of this.listeners) {
            this.transcoder.pipe(listener, { end: false });
        }

        console.log(`LiveStream: ${this.listeners.size} listeners`);
    }

    isQueueEmpty() {
        return this.queue[0] == undefined
    }

    playNext() {
        console.log("LiveStream: playNext()");
        this.stop();

        if (this.isQueueEmpty()) {
            console.log("LiveStream: Queue is empty, aborting");
            return;
        }

        let url = this.queue.splice(0, 1)[0];
        this.play(url);
    }

    stop() {
        console.log("LiveStream: stop()");

        if (this.transcoder) {
            this.transcoder.kill();
            console.log("LiveStream: Transcoder has been killed");
        }

        if (this.timer) {
            clearTimeout(this.timer);
            console.log("LiveStream: Timer has been killed");
        }

        this.transcoder = null;
        this.timer = null;
    }

    addListener(listener) {
        if (this.listeners.has(listener)) {
            return false;
        }

        this.listeners.add(listener);
        console.log(`LiveStream: Listener connected (counter: ${this.listeners.size})`);

        if (this.transcoder) {
            this.transcoder.pipe(listener, { end: false });
        }
    }

    removeListener(listener) {
        if (!this.listeners.has(listener)) {
            return false;
        }

        if (this.transcoder) {
            this.transcoder.unpipe(listener);
        }

        this.listeners.delete(listener);
        console.log(`LiveStream: Listener disconnected (counter: ${this.listeners.size})`);
    }
}

module.exports = LiveStream;
