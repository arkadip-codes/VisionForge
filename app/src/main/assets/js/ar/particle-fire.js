// Three.js Volumetric Particle Fire, Embers & Rising Coal Smoke

export class ParticleFireSystem {
  constructor(scene) {
    this.scene = scene;
    this.fireParticles = null;
    this.smokeParticles = null;
    this.fireIntensity = 1.0;
    this.isExtinguished = false;

    this.initFire();
    this.initSmoke();
  }

  initFire() {
    const particleCount = 250;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    this.fireData = [];

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 0.8;
      const y = Math.random() * 0.4;
      const z = (Math.random() - 0.5) * 0.8;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Orange/Red to Yellow gradient
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.25 + Math.random() * 0.5;
      colors[i * 3 + 2] = 0.05;

      sizes[i] = 0.15 + Math.random() * 0.2;

      this.fireData.push({
        baseX: x,
        baseZ: z,
        speedY: 0.8 + Math.random() * 1.4,
        maxHeight: 1.2 + Math.random() * 0.6,
        life: Math.random()
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Custom Particle Material with canvas radial texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 165, 0, 0.8)');
    grad.addColorStop(0.7, 'rgba(255, 40, 0, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.25,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    });

    this.fireParticles = new THREE.Points(geometry, material);
    this.fireParticles.position.set(0, -0.6, -2.5);
    this.scene.add(this.fireParticles);
  }

  initSmoke() {
    const smokeCount = 180;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(smokeCount * 3);
    const colors = new Float32Array(smokeCount * 3);

    this.smokeData = [];

    for (let i = 0; i < smokeCount; i++) {
      const x = (Math.random() - 0.5) * 0.6;
      const y = 0.5 + Math.random() * 1.5;
      const z = (Math.random() - 0.5) * 0.6;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Dark gray coal dust smoke
      const gray = 0.15 + Math.random() * 0.15;
      colors[i * 3] = gray;
      colors[i * 3 + 1] = gray;
      colors[i * 3 + 2] = gray;

      this.smokeData.push({
        baseX: x,
        baseZ: z,
        speedY: 0.4 + Math.random() * 0.6,
        driftX: (Math.random() - 0.5) * 0.2,
        life: Math.random()
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.35,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      vertexColors: true
    });

    this.smokeParticles = new THREE.Points(geometry, material);
    this.smokeParticles.position.set(0, -0.6, -2.5);
    this.scene.add(this.smokeParticles);
  }

  update(delta = 0.016) {
    if (this.isExtinguished) {
      if (this.fireParticles) this.fireParticles.visible = false;
      if (this.smokeParticles) this.smokeParticles.material.opacity = Math.max(0, this.smokeParticles.material.opacity - 0.02);
      return;
    }

    // Update Fire
    if (this.fireParticles) {
      const pos = this.fireParticles.geometry.attributes.position.array;
      for (let i = 0; i < this.fireData.length; i++) {
        const d = this.fireData[i];
        d.life += delta * d.speedY;
        if (d.life > 1.0) {
          d.life = 0;
          pos[i * 3] = d.baseX * this.fireIntensity;
          pos[i * 3 + 1] = 0;
          pos[i * 3 + 2] = d.baseZ * this.fireIntensity;
        } else {
          pos[i * 3 + 1] = d.life * d.maxHeight * this.fireIntensity;
          pos[i * 3] += (Math.sin(d.life * 10) * 0.01) * this.fireIntensity;
        }
      }
      this.fireParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Update Smoke
    if (this.smokeParticles) {
      const pos = this.smokeParticles.geometry.attributes.position.array;
      for (let i = 0; i < this.smokeData.length; i++) {
        const s = this.smokeData[i];
        pos[i * 3 + 1] += delta * s.speedY;
        pos[i * 3] += delta * s.driftX;
        if (pos[i * 3 + 1] > 2.8) {
          pos[i * 3 + 1] = 0.6 * this.fireIntensity;
          pos[i * 3] = s.baseX;
        }
      }
      this.smokeParticles.geometry.attributes.position.needsUpdate = true;
    }
  }

  reduceIntensity(amount = 0.25) {
    this.fireIntensity = Math.max(0, this.fireIntensity - amount);
    if (this.fireIntensity <= 0.05) {
      this.isExtinguished = true;
    }
  }

  extinguishCompletely() {
    this.fireIntensity = 0;
    this.isExtinguished = true;
  }

  dispose() {
    if (this.fireParticles) {
      this.scene.remove(this.fireParticles);
      this.fireParticles.geometry.dispose();
      this.fireParticles.material.dispose();
    }
    if (this.smokeParticles) {
      this.scene.remove(this.smokeParticles);
      this.smokeParticles.geometry.dispose();
      this.smokeParticles.material.dispose();
    }
  }
}
