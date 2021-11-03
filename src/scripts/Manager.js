// import 'dancer/dancer';
import Sound from './audio/Sound';
import mediaMP3 from '/public/prequell.mp3';

export default class Manager {

  constructor(stage, callback) {
    this.stage = stage;
    // sound
    this.BPM = 145; // https://getsongbpm.com/tools/audio
    this.SOUND_START = .49;
    this.sound = new Sound(mediaMP3, this.BPM, this.SOUND_START, () => {
      this.sound.play();
      callback && callback();
    }, true);
    // kick
    let kick1 = this.sound.createKick({
      threshold: 230, // 180
      decay: .8,
      frequency: [3, 10],
      // onKick: ( mag ) => {
      onKick: ( ) => {
        for (var i = 0; i < this.stage.frontTubeLightLength; i+=10) {
          this.stage.frontTubeLights[i].turnOn(this.sound.beatDuration / 4);
        }
      }
    });
    let kick1Bis = this.sound.createKick({
      threshold: 250, // 180
      decay: .8,
      frequency: [3, 10],
      // onKick: ( mag ) => {
      onKick: ( ) => {
        for (var i = 0; i < this.stage.frontTubeLightLength; i+=10) {
          this.stage.frontTubeLights[i].turnOn(this.sound.beatDuration / 4);
        }
      }
    });
    let kick2 = this.sound.createKick({
      threshold: 140, // 40
      decay: .8,
      frequency: [ 90, 110 ],
      // onKick: ( mag ) => {
      onKick: ( ) => {
        for (var i = 0; i < this.stage.backTubeLightLength; i+=10) {
          this.stage.backTubeLights[i].turnOn(this.sound.beatDuration / 4);
        }
      }
    });
    let kick3 = this.sound.createKick({
      threshold: 200, // 180
      decay: .8,
      frequency: [ 20, 30 ],
      // onKick: ( mag ) => {
      onKick: ( ) => {
        for (var i = 0; i < this.stage.spotLightLength; i++) {
          this.stage.spotLights[i].turnOn(this.sound.beatDuration / 4);
        }
      }
    });
    let kick3Bis = this.sound.createKick({
      threshold: 180, // 180
      decay: .8,
      frequency: [ 20, 30 ],
      // onKick: ( mag ) => {
      onKick: ( ) => {
        for (var i = 0; i < this.stage.spotLightLength; i++) {
          this.stage.spotLights[i].turnOn(this.sound.beatDuration / 4);
        }
      }
    });
    let kick4 = this.sound.createKick({
      threshold: 160, // 40
      decay: .8,
      frequency: [90, 110],
      // onKick: ( mag ) => {
      onKick: ( ) => {
        for (var i = 0; i < this.stage.frontTubeLightLength; i+=5) {
          this.stage.frontTubeLights[i].turnOn(this.sound.beatDuration / 4);
        }
      }
    });
    let kick5 = this.sound.createKick({
      threshold: 120, // 40
      decay: .8,
      frequency: [80, 110],
      // onKick: ( mag ) => {
      onKick: ( ) => {
        for (var i = 0; i < this.stage.spotLightLength; i++) {
          this.stage.spotLights[i].turnOn(this.sound.beatDuration / 4);
        }
      }
    });
    // tube lights turn around slow
    let beat1FTLCurrent = -1;
    let beat1BTLCurrent = Math.round(this.stage.backTubeLightLength / 2);
    let beat1 = this.sound.createBeat({
      factor: 1/16,
      onBeat: () => {
        beat1FTLCurrent = beat1FTLCurrent + 1 < this.stage.frontTubeLightLength ? beat1FTLCurrent + 1 : 0;
        this.stage.frontTubeLights[beat1FTLCurrent].turnOn(this.sound.beatDuration * 3);
        beat1BTLCurrent = beat1BTLCurrent - 1 >= 0 ? beat1BTLCurrent - 1 : this.stage.backTubeLightLength - 1;
        this.stage.backTubeLights[beat1BTLCurrent].turnOn(this.sound.beatDuration * 4);
      }
    });
    // tube lights turn around fast
    let beat2FTLCurrent = -1;
    let beat2BTLCurrent = Math.round(this.stage.backTubeLightLength / 2);
    let beat2 = this.sound.createBeat({
      factor: 1/8,
      onBeat: () => {
        beat2FTLCurrent = beat2FTLCurrent + 1 < this.stage.frontTubeLightLength ? beat2FTLCurrent + 1 : 0;
        this.stage.frontTubeLights[beat2FTLCurrent].turnOn(this.sound.beatDuration * 1);
        beat2BTLCurrent = beat2BTLCurrent - 1 >= 0 ? beat2BTLCurrent - 1 : this.stage.backTubeLightLength - 1;
        this.stage.backTubeLights[beat2BTLCurrent].turnOn(this.sound.beatDuration * 1.5);
      }
    });
    // tube lights turn around very slow
    let beat3FTLCurrent = -1;
    let beat3BTLCurrent = Math.round(this.stage.backTubeLightLength / 2);
    let beat3 = this.sound.createBeat({
      factor: 1/8,
      onBeat: () => {
        beat3FTLCurrent = beat3FTLCurrent + 1 < this.stage.frontTubeLightLength ? beat3FTLCurrent + 1 : 0;
        this.stage.frontTubeLights[beat3FTLCurrent].turnOn(this.sound.beatDuration * 12);
        beat3BTLCurrent = beat3BTLCurrent - 1 >= 0 ? beat3BTLCurrent - 1 : this.stage.backTubeLightLength - 1;
        this.stage.backTubeLights[beat3BTLCurrent].turnOn(this.sound.beatDuration * 16);
      }
    });
    // tube lights turn around very slow
    let beat4BTLCurrent = -1;
    let beat4 = this.sound.createBeat({
      factor: 1/8,
      onBeat: () => {
        beat4BTLCurrent = beat4BTLCurrent + 1 < 8 ? beat4BTLCurrent + 1 : 0;
        for (var i = 0; i < this.stage.backTubeLightLength; i+=8) {
          if (i + beat4BTLCurrent < this.stage.backTubeLightLength) {
            this.stage.backTubeLights[i + beat4BTLCurrent].turnOn(this.sound.beatDuration / 2);
          }
        }
      }
    });
    // tube lights turn around very slow
    let beat5BTLCurrent = -1;
    let beat5 = this.sound.createBeat({
      factor: 1/8,
      onBeat: () => {
        beat5BTLCurrent = beat5BTLCurrent + 1 < 16 ? beat5BTLCurrent + 1 : 0;
        for (var i = 0; i < this.stage.backTubeLightLength; i+=16) {
          if (i + beat5BTLCurrent < this.stage.backTubeLightLength) {
            this.stage.backTubeLights[i + beat5BTLCurrent].turnOn(this.sound.beatDuration * 1.5);
          }
        }
      }
    });
    // console.log(beat1, beat2, beat3, beat4, beat5, kick1, kick1Bis, kick2, kick3, kick3Bis, kick4, kick5);
    // timeline
    this.sound.onceAt('start', this.SOUND_START, () => {
      // for (var i = 0; i < this.stage.backTubeLightLength; i++) {
      //   this.stage.backTubeLights[i].turnOn(999999);
      // }
      // for (var j = 0; j < this.stage.frontTubeLightLength; j++) {
      //   this.stage.frontTubeLights[j].turnOn(999999);
      // }
      // for (var k = 0; k < this.stage.spotLightLength; k++) {
      //   this.stage.spotLights[k].turnOn(999999);
      // }
    })
    .onceAt('1', 0.51, () => {
      beat1.on();
    })
    .onceAt('2', 9.54, () => {
      beat1.off();
      kick1.on();
      kick2.on();
    })
    .onceAt('3', 22.77, () => {
      kick1.off();
      kick1Bis.on();
      beat2.on();
    })
    .onceAt('4', 34.79, () => {
      beat2.off();
      beat3.on();
    })
    .onceAt('5', 49.24, () => {
      beat3.off();
      kick1Bis.off();
      kick2.off();
      for (var i = 0; i < this.stage.backTubeLightLength; i++) {
        this.stage.backTubeLights[i].turnOff(true);
      }
      for (var j = 0; j < this.stage.frontTubeLightLength; j++) {
        this.stage.frontTubeLights[j].turnOff(true);
      }
      beat4.on();
      kick3.on();
      kick4.on();
    })
    .onceAt('6', 62.83, () => {
      beat4.off();
      kick3.off();
      kick3Bis.on();
      beat5.on();
    })
    .onceAt('7', 88.81, () => {
      beat5.off();
      kick3Bis.off();
      kick4.off();
      beat1.on();
    })
    .onceAt('8', 102.21, () => {
      kick1Bis.on();
      kick2.on();
    })
    .onceAt('9', 115.45, () => {
      kick1Bis.off();
      kick2.off();
      kick5.on();
    })
    .onceAt('10', 141.94, () => {
      kick5.off();
      beat1.off();
      beat3.on();
    })
    .onceAt('11', 155.16, () => {
      kick1Bis.on();
    })
    .onceAt('12', 168.72, () => {
      beat3.off();
      kick1Bis.off();
      for (var i = 0; i < this.stage.backTubeLightLength; i++) {
        this.stage.backTubeLights[i].turnOff(true);
      }
      for (var j = 0; j < this.stage.frontTubeLightLength; j++) {
        this.stage.frontTubeLights[j].turnOff(true);
      }
      beat4.on();
      kick3.on();
      kick4.on();
    })
    .onceAt('13', 195.51, () => {
      beat4.off();
    })
    .onceAt('14', 201.51, () => {
      beat5.on();
    })
    .onceAt('16', 241.11, () => {
      beat5.off();
      kick2.on();
    })
    .onceAt('16', 267.51, () => {
      kick2.off();
      kick3.off();
      kick4.off();
    });
  }

  animate = () => {

  }
}
