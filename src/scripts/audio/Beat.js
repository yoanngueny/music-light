export default class Beat {

	constructor({factor, onBeat}) {
		this.factor = factor !== undefined ? factor : 1;
		this.onBeat = onBeat;
		this.isOn   = false;
		this.currentTime = 0;
	}

	on() {
		this.isOn = true;
	}

	off() {
		this.isOn = false;
	}

	set({factor, onBeat}) {
		this.factor = factor !== undefined ? factor : this.factor;
		this.onBeat = onBeat || this.onBeat;
	}

	calc(time, beatDuration) {
		if ( time == 0 ) { return; }
		let beatDurationFactored = beatDuration * this.factor;
		if (time >= this.currentTime + beatDurationFactored) {
			if ( this.isOn ) this.onBeat && this.onBeat();
			this.currentTime += beatDurationFactored;
		}
	}
}
