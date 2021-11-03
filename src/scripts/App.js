import { Clock, Scene, Color, PerspectiveCamera, WebGLRenderer } from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { BloomEffect, EffectComposer, EffectPass, SMAAEffect, SMAAImageLoader, SMAAPreset, EdgeDetectionMode, BlendFunction, KernelSize, RenderPass } from "postprocessing";
// import Stats from 'stats.js';
import Stage from './Stage';
import Manager from './Manager';

export default class App {

	constructor() {
		const start = document.querySelector('.introduction-start');
		start.addEventListener('click', this.init);
	}

	/**
	 * [init description]
	 */
	init = () => {
		// hide introduction
		const introduction = document.querySelector('.introduction');
		introduction.style.display = 'none';
		// show loading
		const loading = document.querySelector('.loading');
		loading.style.display = 'block';
		// initialize three
		this.initThree();
		// initialize post processing
		this.initPost();
		// start manager
		this.manager = new Manager(this.stage, () => {
			// hide loading
			loading.style.display = 'none';
			// start
			this.start();
		});
	}

	/**
	 * [initThree description]
	 */
	initThree = () => {
		// clock
		this.clock = new Clock();
		// scene
		this.scene = new Scene();
		this.scene.background = new Color(0x000000);
		// this.scene.fog = new Fog(0x000000, 15, 25);
		// camera
		this.camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.camera.position.set(0, 0, 0.01);
		// this.camera.rotation.y = Math.PI;
		this.scene.add(this.camera);
		// renderer
		this.renderer = new WebGLRenderer({ antialias: true });
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		// controls
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.autoRotate = true;
		this.controls.rotateSpeed *= -1;
		this.controls.maxPolarAngle = Math.PI * .54;
		this.controls.enableDamping = true;
		this.controls.enableZoom = true;
		this.controls.maxDistance = 20;
		this.controls.enablePan = false;
		this.renderer.domElement.style.cursor = 'grab';
		// stats
		// this.stats = new Stats();
		// this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
		// document.body.appendChild( this.stats.dom );
		// stage
		this.stage = new Stage(this.scene);
	}

	/**
   * [initPost description]
   */
  initPost = () => {
		this.composer = new EffectComposer(this.renderer);
    const smaaImageLoader = new SMAAImageLoader();
    smaaImageLoader.load(([search, area]) => {
      const smaaEffect = new SMAAEffect(
        search,
        area,
        SMAAPreset.HIGH,
        EdgeDetectionMode.COLOR
      );
      smaaEffect.edgeDetectionMaterial.setEdgeDetectionThreshold(0.01);
      // this.composer.multisampling = Math.min(4, this.renderer.getContext().getParameter(this.renderer.getContext().MAX_SAMPLES));
      const renderPass = new RenderPass(this.scene, this.camera);
      this.composer.addPass(renderPass);
      const bloomEffect = new BloomEffect({
        blendFunction: BlendFunction.SCREEN,
        kernelSize: KernelSize.MEDIUM,
        luminanceThreshold: 0.4,
        luminanceSmoothing: 0.1,
        height: 480
      });
      const bloomEffectPass = new EffectPass(this.camera, smaaEffect, bloomEffect);
      bloomEffectPass.renderToScreen = true;
      this.composer.addPass(bloomEffectPass);
    });
  }

	/**
	 * [start description]
	 */
	start = () => {
		document.body.prepend(this.renderer.domElement);
		this.renderer.setAnimationLoop(this.render);
		window.addEventListener('resize', this.resize, false);
		this.resize();
	}

	/**
	 * [render description]
	 */
	render = () => {
		// let delta = this.clock.getDelta() * 60;
		this.stats?.begin();
		this.manager.animate();
		this.controls.update();
		this.composer.render();
		// this.renderer.render(this.scene, this.camera);
		this.stats?.end();
	}

	/**
	 * [resize description]
	 */
	resize = () => {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.composer.setSize(window.innerWidth, window.innerHeight);
	}

	// enterFullscreen = (el) => {
	// 	if (el.requestFullscreen) {
	// 		el.requestFullscreen();
	// 	} else if (el.mozRequestFullScreen) {
	// 		el.mozRequestFullScreen();
	// 	} else if (el.webkitRequestFullscreen) {
	// 		el.webkitRequestFullscreen();
	// 	} else if (el.msRequestFullscreen) {
	// 		el.msRequestFullscreen();
	// 	}
	// }
}
