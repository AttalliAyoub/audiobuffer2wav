/**
 * This function encodes AudioBuffer to WAV.
 *
 * @param {AudioBuffer} buffer - the audiobuffer data that cames form the audio context, when downloaded or you got on the browsers web-audio-api
 * @returns {ArrayBuffer} - the encoded result with wav format.
 * @example
 * ```ts
 * const resp = await fetch('https://github.com/Experience-Monks/audiobuffer-to-wav/raw/refs/heads/master/demo/bluejean_short.mp3');
 * const arrayBuffer = await resp.arrayBuffer();
 * const context = new AudioContext();
 * const audioBuffer = await new Promise<AudioBuffer>((res, rej) => context.decodeAudioData(arrayBuffer, res, rej));
 * await context.close();
 * const wav = audioBuffer2Wav(audioBuffer);
 * ```
 */

export function audioBuffer2Wav(
	buffer: AudioBuffer,
	opt?: { float32?: boolean | undefined },
): ArrayBuffer {
	opt = opt || {};
	const numChannels = buffer.numberOfChannels;
	const sampleRate = buffer.sampleRate;
	const format = opt.float32 ? 3 : 1;
	const bitDepth = format === 3 ? 32 : 16;

	const result = numChannels === 2
		? interleave(buffer.getChannelData(0), buffer.getChannelData(1))
		: buffer.getChannelData(0);

	return encodeWAV(result, format, sampleRate, numChannels, bitDepth);
}

function encodeWAV(
	samples: Float32Array,
	format: 3 | 1,
	sampleRate: number,
	numChannels: number,
	bitDepth: 32 | 16,
): ArrayBuffer {
	const bytesPerSample = bitDepth / 8;
	const blockAlign = numChannels * bytesPerSample;

	const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
	const view = new DataView(buffer);

	/* RIFF identifier */
	writeString(view, 0, "RIFF");
	/* RIFF chunk length */
	view.setUint32(4, 36 + samples.length * bytesPerSample, true);
	/* RIFF type */
	writeString(view, 8, "WAVE");
	/* format chunk identifier */
	writeString(view, 12, "fmt ");
	/* format chunk length */
	view.setUint32(16, 16, true);
	/* sample format (raw) */
	view.setUint16(20, format, true);
	/* channel count */
	view.setUint16(22, numChannels, true);
	/* sample rate */
	view.setUint32(24, sampleRate, true);
	/* byte rate (sample rate * block align) */
	view.setUint32(28, sampleRate * blockAlign, true);
	/* block align (channel count * bytes per sample) */
	view.setUint16(32, blockAlign, true);
	/* bits per sample */
	view.setUint16(34, bitDepth, true);
	/* data chunk identifier */
	writeString(view, 36, "data");
	/* data chunk length */
	view.setUint32(40, samples.length * bytesPerSample, true);
	if (format === 1) { // Raw PCM
		floatTo16BitPCM(view, 44, samples);
	} else {
		writeFloat32(view, 44, samples);
	}

	return buffer;
}

function interleave(inputL: Float32Array, inputR: Float32Array): Float32Array {
	const length = inputL.length + inputR.length;
	const result = new Float32Array(length);

	let index = 0;
	let inputIndex = 0;

	while (index < length) {
		result[index++] = inputL[inputIndex];
		result[index++] = inputR[inputIndex];
		inputIndex++;
	}
	return result;
}

function writeFloat32(
	output: DataView<ArrayBuffer>,
	offset: number,
	input: Float32Array,
): void {
	for (let i = 0; i < input.length; i++, offset += 4) {
		output.setFloat32(offset, input[i], true);
	}
}

function floatTo16BitPCM(
	output: DataView<ArrayBuffer>,
	offset: number,
	input: Float32Array,
): void {
	for (let i = 0; i < input.length; i++, offset += 2) {
		const s = Math.max(-1, Math.min(1, input[i]));
		output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
	}
}

function writeString(
	view: DataView<ArrayBuffer>,
	offset: number,
	str: string,
): void {
	for (let i = 0; i < str.length; i++) {
		view.setUint8(offset + i, str.charCodeAt(i));
	}
}
