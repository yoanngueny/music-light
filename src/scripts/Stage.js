import { CylinderBufferGeometry, SphereBufferGeometry, Mesh, MeshBasicMaterial, CircleBufferGeometry } from 'three';
import Light from './Light';
import { Reflector } from './Reflector.js';

export default class Stage {

	constructor(scene) {
		// scene.add( new AmbientLight( 0xffffff ) );
		// scene.add( new HemisphereLight( 0x606060, 0x404040 ) );
		// let light = new DirectionalLight( 0xffffff );
		// light.position.set( 1, 1, 1 ).normalize();
		// scene.add( light );

		// let groundGeometry = new PlaneBufferGeometry(100, 100, 1, 1);
		let groundGeometry = new CircleBufferGeometry(7, 64);
		this.ground = new Reflector(groundGeometry, {
			clipBias: 0.003,
			textureWidth: window.innerWidth, // TODO : gérer le resize
			textureHeight: window.innerHeight,
			color: 0xffffff,
			transparent: true,
			opacity: .3,
		});
		this.ground.renderOrder = 2;
		this.ground.position.y = - 3;
		this.ground.rotation.x = - Math.PI / 2;
		scene.add(this.ground);

		this.ground2 = new Mesh(
			groundGeometry,
			new MeshBasicMaterial({
				color:0xffffff,
			})
		);
		this.ground2.renderOrder = 1;
		this.ground2.position.y = this.ground.position.y - .001;
		this.ground2.rotation.x = this.ground.rotation.x;
		scene.add(this.ground2);

		this.spotLights = [];
		this.spotLightLength = 10;
		let spotLightRotation = 0;
		let spotLightRotationGap = Math.PI * 2 / this.spotLightLength;
		let spotLightGeometry = new SphereBufferGeometry( 0.1, 32, 32 );
		for ( let i = 0; i < this.spotLightLength; i ++ ) {
			let light = new Light(spotLightGeometry, false);
			light.position.x = Math.cos(spotLightRotation) * 5;
			light.position.y = 2.5;
			light.position.z = Math.sin(spotLightRotation) * 5;
			spotLightRotation += spotLightRotationGap;
			this.spotLights.push(light);
			scene.add(light);
		}

		this.frontTubeLights = [];
		this.frontTubeLightLength = 150;
		let frontTubeLightRotation = 0;
		let frontTubeLightRotationGap = Math.PI * 2 / this.frontTubeLightLength;
		let frontTubeLightGeometry = new CylinderBufferGeometry( 0.02, 0.02, 4 );
		for ( let i = 0; i < this.frontTubeLightLength; i ++ ) {
			let light = new Light(frontTubeLightGeometry);
			light.position.x = Math.cos(frontTubeLightRotation) * 5;
			light.position.y = Math.cos(frontTubeLightRotation) * 1 + .6;
			light.position.z = Math.sin(frontTubeLightRotation) * 5;
			light.rotation.x = Math.sin(frontTubeLightRotation) * Math.PI / 2.5;
			// light.rotation.y = Math.random() * 2 * Math.PI;
			// light.rotation.z = Math.random() * 2 * Math.PI;
			frontTubeLightRotation += frontTubeLightRotationGap;
			this.frontTubeLights.push(light);
			scene.add(light);
		}

		this.backTubeLights = [];
		this.backTubeLightLength = 150;
		let backTubeLightRotation = 0;
		let backTubeLightRotationGap = Math.PI * 2 / this.backTubeLightLength;
		let backTubeLightGeometry = new CylinderBufferGeometry( 0.02, 0.02, 4 );
		for ( let i = 0; i < this.backTubeLightLength; i ++ ) {
			let light = new Light(backTubeLightGeometry);
			light.position.x = Math.cos(backTubeLightRotation) * 10;
			light.position.y = Math.sin(backTubeLightRotation) * .5 - .3;
			light.position.z = Math.sin(backTubeLightRotation) * 10;
			light.rotation.x = Math.cos(backTubeLightRotation) * Math.PI / 2.5;
			// light.rotation.y = Math.random() * 2 * Math.PI;
			// light.rotation.z = Math.random() * 2 * Math.PI;
			backTubeLightRotation += backTubeLightRotationGap;
			this.backTubeLights.push(light);
			scene.add(light);
		}
	}
}
