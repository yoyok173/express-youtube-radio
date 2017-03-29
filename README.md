# Express YouTube Radio
A simple YouTube-to-MP3 stream server with an express http interface.
**Warning:** This project is not for deployment in production setups because of existing issues.

## Installation
1. Install [ffmpeg](http://ffmpeg.org/download.html) on your operating system
2. Run `npm install` on the command line in the root directory
3. Start the application with `node app.js` or `npm run` or `pm2 start app.js` (see [pm2](https://github.com/Unitech/pm2))

**Note:** The hard-coded application port is 8080.

## API
> /listen
This endpoint starts streaming the audio bytes to your device.

> /play/youtube/<videoId>
This endpoint starts/queues a YouTube video for the livestream. It returns a JSON response `{"success":true}` on success or
`{"success":false,"error":"VIDEO_NOT_AVAILABLE"}` on failure.
