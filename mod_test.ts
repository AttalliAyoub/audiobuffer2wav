import { AudioContext } from "@mutefish/web-audio-api";
import { assertEquals } from "@std/assert";
import { audioBuffer2Wav } from "./mod.ts";

Deno.test({
	name: "convert to wav",
	permissions: { net: true, read: true, write: true, ffi: true },
	fn: async (test) => {
		let arrayBuffer: ArrayBuffer;
		let audioBuffer: AudioBuffer;

		await test.step("download audio", async () => {
			const resp = await fetch(
				"https://github.com/Experience-Monks/audiobuffer-to-wav/raw/refs/heads/master/demo/bluejean_short.mp3",
			);
			arrayBuffer = await resp.arrayBuffer();
		});
		await test.step("prepare raw audio and convert it to audioBuffer", async () => {
			const context = new AudioContext();
			audioBuffer = await new Promise<AudioBuffer>((res, rej) =>
				context.decodeAudioData(arrayBuffer, res, rej)
			);
			await context.close();
		});
		await test.step("convert audio to wav", () => {
			const wav = audioBuffer2Wav(audioBuffer);
			assertEquals(wav.byteLength, 2893996);
		});
	},
});
