# audiobuffer2wav

Encodes the contents of an [AudioBuffer](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer) from the WebAudio API as WAVE.
Supports 16-bit PCM and 32-bit float data.

The code for this has been adapted from npm audiobuffer-to-wav

The code for this has been adapted from the export feature of [Recorder.js](https://github.com/mattdiamond/Recorderjs).

PRs welcome.

## Install

```sh
deno add jsr:@attalliayoub/audiobuffer2wav
```

## Example

```ts
import { AudioContext } from "@mutefish/web-audio-api";
import { assertEquals } from "@std/assert";
import { audioBuffer2Wav } from "./mod.ts";

// request the MP3 as binary
const resp = await fetch(
	"https://github.com/Experience-Monks/audiobuffer-to-wav/raw/refs/heads/master/demo/bluejean_short.mp3",
);
const arrayBuffer = await resp.arrayBuffer();
const context = new AudioContext();
// decode the MP3 into an AudioBuffer
const audioBuffer = await new Promise<AudioBuffer>((res, rej) =>
	context.decodeAudioData(arrayBuffer, res, rej)
);
await context.close();
// encode AudioBuffer to WAV
const wav = audioBuffer2Wav(audioBuffer);
// do something with the WAV ArrayBuffer ...

console.log(wav.byteLength);

assertEquals(wav.byteLength, 2893996);
```

See [the demo](./mod_test.ts) for an example of loading MP3, decoding it, and triggering a download of the encoded WAV file.

A more advanced example might be to write the file using Node and Electron or [hihat](https://www.npmjs.com/package/hihat), i.e. an easy way to convert MP3/OGG/etc to WAV.

## Usage

### `arrayBuffer = audioBuffer2Wav(audioBuffer, [opt])`

Encodes the [AudioBuffer](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer) instance as WAV, returning a new array buffer. Interleaves multi-channel data, if necessary.

By default, exports with 16-bit PCM (format: 1). You can specify `opt.float32` instead, which will write format 3 with 32-bit float data.

## License

MIT, see [LICENSE](http://github.com/AttalliAyoub/audiobuffer2wav/blob/main/LICENSE) for details.
