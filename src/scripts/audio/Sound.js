import Kick from './Kick';
import Beat from './Beat';
import Debug from './Debug';

// Based largely on https://github.com/jsantell/dancer.js/
export default class Sound {

	/**
	 * src        : path to mp3
	 * bpm        : beat per minute
	 * offsetTime : remove blank sound at start for beat calculation (in seconds)
	 * callback   : ready callback
	 * debug      : enable debug display
	 */
	constructor(src, bpm, offsetTime, callback, debug = false) {
		// create context
		this.ctx;
		try {
			window.AudioContext = window.AudioContext || window.webkitAudioContext;
			this.ctx = new AudioContext();
		}
		catch(e) {
			throw new Error('Web Audio API is not supported in this browser');
		}

		// values
		this._bpm = bpm;
		this._beatDuration = 60 / this._bpm;
		this._offsetTime = offsetTime;
		this._sections = [];
		this._kicks = [];
		this._beats = [];
		this._startTime = 0;
		this._pauseTime = 0;
		this._isPlaying = false;
		this._isLoaded = false;
		this._progress = 0;

		// events
		this._onUpdate = this.onUpdate.bind(this);
		this._onEnded = this.onEnded.bind(this);

		// create gain
		this.gainNode = this.ctx.createGain();
		this.gainNode.connect(this.ctx.destination);

		// create analyser
		this.analyserNode = this.ctx.createAnalyser();
		this.analyserNode.connect(this.gainNode);
		this.analyserNode.smoothingTimeConstant = .8;
		this.analyserNode.fftSize = 512;
		let bufferLength = this.analyserNode.frequencyBinCount;
		this.frequencyDataArray = new Uint8Array(bufferLength);
		this.timeDomainDataArray = new Uint8Array(bufferLength);

		// create debug
		if (debug) this.debug = new Debug(this);

		// load
		this._load(src, callback);

		// update
		window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
		window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
	}

	// load MP3

	_load(src, callback) {
		if (src) {
			this._isLoaded = false;
			this._progress = 0;

			// Load asynchronously
			let request = new XMLHttpRequest();
			request.open("GET", src, true);
			request.responseType = "arraybuffer";
			request.onprogress = (e) => {
				this._progress = e.loaded / e.total;
			};
			request.onload = () => {
				this.ctx.decodeAudioData(request.response, (buffer) => {
					this._buffer = buffer;
					this._isLoaded = true;
					if (callback) callback();
				}, function(e) {
					console.log(e);
				});
			};
			request.send();
		}
	}

	get progress() {
		return this._progress;
	}

	get isLoaded() {
		return this._isLoaded;
	}

	// sound actions

	play(offset = 0) {
		if (this.req) cancelAnimationFrame(this.req);
		this._onUpdate();

		this._isPlaying = true;
		let elapseTime = this._pauseTime - this._startTime + offset;
		this._startTime = this.ctx.currentTime - elapseTime;

		this.sourceNode = this.ctx.createBufferSource();
		this.sourceNode.connect(this.analyserNode);
		this.sourceNode.buffer = this._buffer;
		this.sourceNode.start(0, elapseTime);
		this.sourceNode.addEventListener('ended', this._onEnded, false);
	}

	pause() {
		if (this.req) cancelAnimationFrame(this.req);

		if (this.sourceNode) {
			this.sourceNode.removeEventListener('ended', this._onEnded, false);
			this.sourceNode.stop(0);
			this.sourceNode.disconnect();
			this.sourceNode = null;
		}

		this._pauseTime = this.ctx.currentTime;
		this._isPlaying = false;
	}

	get duration() {
		return this._isLoaded ? this._buffer.duration : 0;
	}

	get time() {
		return this.isPlaying ? this.ctx.currentTime - this._startTime : this._pauseTime - this._startTime;
	}

	set volume(value) {
		this.gainNode.gain.value = value;
	}

	get volume() {
		return this.gainNode.gain.value;
	}

	get isPlaying() {
		return this._isPlaying;
	}

	// callback at specific time

	before(label, time, callback) {
		let _this = this;
		this._sections.push({
			label: label,
			condition : function () {
				return _this.time < time;
			},
			callback : callback
		});
		return this;
	}

	after(label, time, callback) {
		let _this = this;
		this._sections.push({
			label: label,
			condition : function () {
				return _this.time > time;
			},
			callback : callback
		});
		return this;
	}

	between(label, startTime, endTime, callback) {
		let _this = this;
		this._sections.push({
			label: label,
			condition : function () {
				return _this.time > startTime && _this.time < endTime;
			},
			callback : callback
		});
		return this;
	}

	onceAt(label, time, callback) {
		let _this = this;
		let thisSection = null;
		this._sections.push({
			label: label,
			condition : function () {
				return _this.time > time && !this.called;
			},
			callback : function () {
				console.log('once :', thisSection.label);
				callback.call( this );
				thisSection.called = true;
			},
			called : false
		});
		thisSection = this._sections[ this._sections.length - 1 ];
		return this;
	}

	// sound analyser

	getSpectrum() {
		this.analyserNode.getByteFrequencyData(this.frequencyDataArray);
		return this.frequencyDataArray;
	}

	getWaveform() {
		this.analyserNode.getByteTimeDomainData(this.timeDomainDataArray);
		return this.timeDomainDataArray;
	}

	getFrequency(freq, endFreq = null) {
		let sum = 0;
		let spectrum = this.getSpectrum();
		if ( endFreq !== undefined ) {
			for ( var i = freq; i <= endFreq; i++ ) {
				sum += spectrum[ i ];
			}
			return sum / ( endFreq - freq + 1 );
		} else {
			return spectrum[ freq ];
		}
	}

	/**
	 * Kicks are detected when the amplitude (normalized values between 0 and 1) of a specified frequency, or the max amplitude over a range, is greater than the minimum threshold, as well as greater than the previously registered kick's amplitude, which is decreased by the decay rate per frame.
	 * frequency : the frequency (element of the spectrum) to check for a spike. Can be a single frequency (number) or a range (2 element array) that uses the frequency with highest amplitude.
	 * threshold : the minimum amplitude of the frequency range in order for a kick to occur.
	 * decay     : the rate that the previously registered kick's amplitude is reduced by on every frame.
	 * onKick    : the callback to be called when a kick is detected.
	 * offKick   : the callback to be called when there is no kick on the current frame.
	 */

	createKick({frequency, threshold, decay, onKick, offKick}) {
		let kick = new Kick({frequency, threshold, decay, onKick, offKick});
		this._kicks.push(kick);
		return kick;
	}

	/**
	 * Beat are detected when the time correspond to duration of one beat (in second) multiplied by the factor
	 * factor : the factor to multiply the duration of one beat
	 * onBeat : the callback to be called when a beat is detected.
	 */

	createBeat({factor, onBeat}) {
		let beat = new Beat({factor, onBeat});
		this._beats.push(beat);
		return beat;
	}

	get beatDuration() {
		return this._beatDuration;
	}

	//

	onUpdate() {
		this.req = requestAnimationFrame(this._onUpdate);

		for ( let i in this._sections ) {
			if ( this._sections[ i ].condition() )
				this._sections[ i ].callback.call( this );
		}

		let spectrum = this.getSpectrum();
		for ( let i in this._kicks ) {
			this._kicks[i].calc(spectrum);
		}

		let time = Math.max(0, this.time - this._offsetTime);
		for ( let i in this._beats ) {
			this._beats[i].calc(time, this._beatDuration);
		}

		if (this.debug) this.debug.draw();
	}

	onEnded() {
		this.stop();
	}
}
