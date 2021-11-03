export default class Kick {

	constructor({frequency, threshold, decay, onKick, offKick}) {
		this.frequency = frequency !== undefined ? frequency : [ 0, 10 ];
		this.threshold = threshold !== undefined ? threshold :  0.3;
		this.decay     = decay     !== undefined ? decay     :  0.02;
		this.onKick    = onKick;
		this.offKick   = offKick;
		this.isOn      = false;
		this.isKick    = false;
		this.currentThreshold = this.threshold;
	}

	on() {
		this.isOn = true;
	}

	off() {
		this.isOn = false;
	}

	set({frequency, threshold, decay, onKick, offKick}) {
		this.frequency = frequency !== undefined ? frequency : this.frequency;
		this.threshold = threshold !== undefined ? threshold : this.threshold;
		this.decay     = decay     !== undefined ? decay : this.decay;
		this.onKick    = onKick    || this.onKick;
		this.offKick   = offKick   || this.offKick;
	}

	calc(spectrum) {
		if ( !this.isOn ) { return; }
		let magnitude = this.maxAmplitude(spectrum, this.frequency);
		if ( magnitude >= this.currentThreshold && magnitude >= this.threshold ) {
			this.currentThreshold = magnitude;
			this.onKick && this.onKick(magnitude);
			this.isKick = true;
		} else {
			this.offKick && this.offKick(magnitude);
			this.currentThreshold -= this.decay;
			this.isKick = false;
		}
	}

	maxAmplitude(fft, frequency) {
		let max = 0;

		// Sloppy array check
		if ( !frequency.length ) {
			return frequency < fft.length ? fft[ ~~frequency ] : null;
		}

		for ( var i = frequency[ 0 ], l = frequency[ 1 ]; i <= l; i++ ) {
			if ( fft[ i ] > max ) { max = fft[ i ]; }
		}

		return max;
	}
}
