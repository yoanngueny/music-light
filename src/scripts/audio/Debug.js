export default class Debug {

	constructor(sound) {
		this.sound = sound;
		this.isEnable = false;

		this.canvas = document.createElement('canvas');
		this.canvas.width = 512;
		this.canvas.height = 300;
		this.canvas.style.position = 'absolute';
		this.canvas.style.bottom = 0;
		this.canvas.style.left = 0;
		this.canvas.style.zIndex = 3;
		this.ctx = this.canvas.getContext('2d');

		window.addEventListener('resize', this.resize, false);
		this.resize();

		document.addEventListener('keypress', this.toggle);
	}

	toggle = (e) => {
		if (e.keyCode === 32) {
			this.isEnable = !this.isEnable;
			console.log(this.isEnable);
			if (this.isEnable)
				document.body.appendChild(this.canvas);
			else
				document.body.removeChild(this.canvas);
		}
	}

	resize = () => {
		this.canvas.width = window.innerWidth;
	}

	draw = () => {
		if (!this.isEnable) return;
		
		let borderHeight = 10;

		// draw background
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.beginPath();
		this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fillStyle = '#000000';
		this.ctx.fill();
		this.ctx.strokeStyle = '#a1a1a1';
		this.ctx.stroke();

		// draw spectrum
		this.ctx.beginPath();
		let spectrum = this.sound.getSpectrum();
		let spectrumValue = null;
		let spectrumLength = spectrum.length;
		let spectrumWidth = this.canvas.width / spectrumLength;
		let spectrumHeight = this.canvas.height - borderHeight;
		for (let i = 0; i < spectrumLength; i++) {
			spectrumValue = spectrum[i] / 256;
			this.ctx.rect(i * spectrumWidth, spectrumHeight - spectrumHeight * spectrumValue, spectrumWidth / 2, spectrumHeight * spectrumValue);
		}
		this.ctx.fillStyle = '#ffffff';
		this.ctx.fill();

		// draw frequency
		this.ctx.beginPath();
		this.ctx.font = "10px Arial";
		this.ctx.textBaseline = 'middle';
		this.ctx.textAlign = "left";
		for (let i = 0, len = spectrumLength; i < len; i++) {
			if (i % 10 == 0) {
				this.ctx.rect(i * spectrumWidth, spectrumHeight, spectrumWidth / 2, borderHeight);
				this.ctx.fillText(i, i * spectrumWidth + 4, spectrumHeight + borderHeight * .5);
			}
		}
		this.ctx.fillStyle = '#ffffff';
		this.ctx.fill();

		// draw kick
		let kicks = this.sound._kicks;
		let kick = null;
		let kickLength = kicks.length;
		let kickFrequencyStart = null;
		let kickFrequencyLength = null;
		for (let i = 0, len = kickLength; i < len; i++) {
			kick = kicks[i];
			if (kick.isOn) {
				kickFrequencyStart = (kick.frequency.length ? kick.frequency[0] : kick.frequency);
				kickFrequencyLength = (kick.frequency.length ? kick.frequency[1] - kick.frequency[0] + 1 : 1);
				this.ctx.beginPath();
				this.ctx.rect(kickFrequencyStart * spectrumWidth, spectrumHeight - spectrumHeight * (kick.threshold / 256), kickFrequencyLength * spectrumWidth - (spectrumWidth * .5), 2);
				this.ctx.rect(kickFrequencyStart * spectrumWidth, spectrumHeight - spectrumHeight * (kick.currentThreshold / 256), kickFrequencyLength * spectrumWidth - (spectrumWidth * .5), 5);
				this.ctx.fillStyle = kick.isKick ? '#00ff00' : '#ff0000';
				this.ctx.fill();
			}
		}

		// draw waveform
		this.ctx.beginPath();
		let waveform = this.sound.getWaveform();
		let waveformValue = null;
		let waveformLength = waveform.length;
		let waveformWidth = this.canvas.width / waveformLength;
		let waveformHeight = this.canvas.height - borderHeight;
		for (let i = 0; i < waveformLength; i++) {
			waveformValue = waveform[i] / 256;
			if (i == 0) this.ctx.moveTo(i * waveformWidth, waveformHeight * waveformValue);
			else this.ctx.lineTo(i * waveformWidth, waveformHeight * waveformValue);
		}
		this.ctx.strokeStyle = '#0000ff';
		this.ctx.stroke();

		// draw time
		this.ctx.beginPath();
		this.ctx.textAlign = "right";
		this.ctx.textBaseline = 'top';
		this.ctx.font = "15px Arial";
		this.ctx.fillStyle = '#ffffff';
		this.ctx.fillText((Math.round(this.sound.time * 10) / 10) + ' / ' + (Math.round(this.sound.duration * 10) / 10), this.canvas.width - 5, 5);

		// draw section
		this.ctx.beginPath();
		let sections = this.sound._sections;
		let section = null;
		let sectionLength = sections.length;
		let sectionLabels = '';
		for (let i = 0, len = sectionLength; i < len; i++) {
			section = sections[i];
			if ( section.condition() ) {
				sectionLabels += section.label + ' - ';
			}
		}
		if (sectionLabels.length > 0) sectionLabels = sectionLabels.substr(0, sectionLabels.length - 3);
		this.ctx.fillText(sectionLabels, this.canvas.width - 5, 25);
		this.ctx.fill();
	}
}
