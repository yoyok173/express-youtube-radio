const Transcoder = require("./Transcoder");

class LiveStream
{
    constructor() {
        this.transcoder = null;
        this.timer = null;
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

        this.transcoder.on("end", (buffer) => {
            this.transcoder = null;
            let duration = !start ? -1 : (Date.now() - start) / 1000;
            console.log(`LiveStream: Transcoding finished (buffer: ${buffer.length} bytes, time: ${duration} seconds)`);
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
