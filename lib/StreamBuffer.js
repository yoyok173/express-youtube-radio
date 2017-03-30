const BufferList = require("bl");

class StreamBuffer
{
    // TODO:
    // - Write audio chunks from the ffmpeg process into the buffer
    // - Split buffer into constant-size chunks
    // - Create a interval timer to send chunks to pipe readers
    // - Ability to return the current chunk buffer for new pipe readers
    //   -> Write that chunk directly to the socket (in express, not here)
}

module.exports = StreamBuffer;
