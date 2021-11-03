import { Mesh, MeshBasicMaterial } from 'three';

export default class Light extends Mesh {

  constructor(geometry, enabled = false, debugIndex = 0) {
    super(geometry, new MeshBasicMaterial({
      color: 0xffffff,
      transparent:true,
      opacity:0,
      depthTest: false,
      fog:false
    }));
    this.renderOrder = 3;
    this.debugIndex = debugIndex;
    this.timeout = null;
    if (enabled) {
      this.turnOn();
    }
  }

  turnOn = (duration = -1) => {
    // console.log('turn ON :', duration); // this.debugIndex);
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.material.opacity = 1;
    if (duration !== -1)
      this.timeout = setTimeout(this.turnOff, duration * 1000);
  }

  turnOff = (forceClear = false) => {
    // console.log('turn OFF :', this.debugIndex);
    if (this.timeout && forceClear) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.material.opacity = 0;
  }
}
