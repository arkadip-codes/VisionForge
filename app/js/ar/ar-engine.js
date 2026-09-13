// WebXR & Three.js AR Engine with Seamless 3D Mine Gallery Fallback

import { ParticleFireSystem } from './particle-fire.js';
import { startMineSiren, stopMineSiren, playCombustionRoar, stopCombustionRoar } from '../voice.js';

export class AREngine {
  constructor(videoElement, canvasElement) {
    this.video = videoElement;
    this.canvas = canvasElement;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.fireSystem = null;
    this.animFrameId = null;
    this.mediaStream = null;
    this.isFallbackMode = false;
    this.dangerRing = null;
    this.galleryMeshGroup = null;
    this.clock = new THREE.Clock();
  }

  async initialize() {
    this.setupThreeScene();

    // Try starting camera stream
    const cameraSuccess = await this.startCamera();
    if (!cameraSuccess) {
      console.log('[AREngine] Camera stream unavailable. Engaging 3D Mine Gallery Simulation mode.');
      this.engageFallbackSimulation();
    }

    // Start Procedural Fire & Smoke
    this.fireSystem = new ParticleFireSystem(this.scene);

    // Start Auditory Stressors (DGMS Siren + Combustion rumble)
    startMineSiren();
    playCombustionRoar();

    // Start render loop
    this.animate();

    return {
      isFallback: this.isFallbackMode
    };
  }

  setupThreeScene() {
    this.scene = new THREE.Scene();

    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Ambient & Tactical Danger Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const redFireLight = new THREE.PointLight(0xff4500, 2.5, 8);
    redFireLight.position.set(0, -0.4, -2.5);
    this.scene.add(redFireLight);
    this.redFireLight = redFireLight;

    // Animated Hazard Boundary Ring on floor
    const ringGeo = new THREE.RingGeometry(0.9, 1.05, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    this.dangerRing = new THREE.Mesh(ringGeo, ringMat);
    this.dangerRing.rotation.x = -Math.PI / 2;
    this.dangerRing.position.set(0, -0.62, -2.5);
    this.scene.add(this.dangerRing);

    window.addEventListener('resize', this.onResize.bind(this));
  }

  async startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return false;
    }
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      this.video.srcObject = this.mediaStream;
      await this.video.play();
      this.isFallbackMode = false;
      return true;
    } catch (err) {
      console.warn('[AREngine] Camera access rejected or failed:', err);
      return false;
    }
  }

  engageFallbackSimulation() {
    this.isFallbackMode = true;
    document.getElementById('ar-viewport-container')?.classList.add('gallery-simulation-active');

    // Build 3D Underground Coal Seam Environment
    this.galleryMeshGroup = new THREE.Group();

    // 1. Coal Gallery Walls (Dark textured rock/coal)
    const tunnelGeo = new THREE.CylinderGeometry(2.4, 2.4, 12, 16, 1, true, -Math.PI * 0.5, Math.PI);
    const tunnelMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.9,
      metalness: 0.1,
      side: THREE.BackSide
    });
    const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
    tunnel.rotation.z = Math.PI / 2;
    tunnel.position.set(0, 0.4, -4);
    this.galleryMeshGroup.add(tunnel);

    // 2. Trunk Belt Conveyor Structure
    const conveyorGeo = new THREE.BoxGeometry(1.2, 0.35, 8);
    const conveyorMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const conveyor = new THREE.Mesh(conveyorGeo, conveyorMat);
    conveyor.position.set(0, -0.65, -3.5);
    this.galleryMeshGroup.add(conveyor);

    // Rubber Belt with hot friction spot
    const beltGeo = new THREE.BoxGeometry(0.9, 0.08, 8);
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.95 });
    const belt = new THREE.Mesh(beltGeo, beltMat);
    belt.position.set(0, -0.45, -3.5);
    this.galleryMeshGroup.add(belt);

    // Steel Rollers (Idlers)
    for (let z = -6; z <= -1; z += 1.2) {
      const idlerGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.1, 12);
      const idlerMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
      const idler = new THREE.Mesh(idlerGeo, idlerMat);
      idler.rotation.z = Math.PI / 2;
      idler.position.set(0, -0.48, z);
      this.galleryMeshGroup.add(idler);
    }

    // 3. Overhead Ventilation Duct (Flexible Yellow Tubing)
    const ductGeo = new THREE.CylinderGeometry(0.35, 0.35, 10, 16);
    const ductMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.6 });
    const duct = new THREE.Mesh(ductGeo, ductMat);
    duct.rotation.x = Math.PI / 2;
    duct.position.set(1.2, 1.2, -4);
    this.galleryMeshGroup.add(duct);

    this.scene.add(this.galleryMeshGroup);
  }

  toggleFallbackMode() {
    if (this.isFallbackMode) {
      // Try restoring camera
      this.startCamera().then(success => {
        if (success) {
          if (this.galleryMeshGroup) this.galleryMeshGroup.visible = false;
          document.getElementById('ar-viewport-container')?.classList.remove('gallery-simulation-active');
        }
      });
    } else {
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(t => t.stop());
      }
      this.engageFallbackSimulation();
      if (this.galleryMeshGroup) this.galleryMeshGroup.visible = true;
    }
  }

  animate() {
    this.animFrameId = requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Update Fire & Smoke
    if (this.fireSystem) {
      this.fireSystem.update(delta);
    }

    // Flicker Fire Light
    if (this.redFireLight) {
      this.redFireLight.intensity = (2.2 + Math.sin(elapsedTime * 15) * 0.5) * (this.fireSystem ? this.fireSystem.fireIntensity : 1.0);
    }

    // Pulse Hazard Ring
    if (this.dangerRing) {
      const s = 1.0 + Math.sin(elapsedTime * 4) * 0.05;
      this.dangerRing.scale.set(s, s, s);
    }

    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    if (!this.canvas || !this.renderer || !this.camera) return;
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  shrinkFire(amount = 0.25) {
    if (this.fireSystem) {
      this.fireSystem.reduceIntensity(amount);
    }
  }

  extinguishCompletely() {
    if (this.fireSystem) {
      this.fireSystem.extinguishCompletely();
    }
    if (this.dangerRing) {
      this.dangerRing.material.color.setHex(0x10b981); // Turn Green!
    }
    stopMineSiren();
    stopCombustionRoar();
  }

  destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
    stopMineSiren();
    stopCombustionRoar();

    if (this.fireSystem) {
      this.fireSystem.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    window.removeEventListener('resize', this.onResize.bind(this));
  }
}
