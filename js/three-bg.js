/* =========================================================
   Wahid Bin Kouser — Portfolio
   three-bg.js — Lightweight 3D particle background
   ========================================================= */

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  // Respect reduced motion
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // ---------- Particle sphere ----------
  const count = window.innerWidth < 768 ? 900 : 1600;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count * 3; i += 3) {
    const r = 2.6 + Math.random() * 1.6;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i + 2] = r * Math.cos(phi);
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0x6a5acd,
    size: 0.016,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // ---------- Wireframe icosahedron ----------
  const icoGeo = new THREE.IcosahedronGeometry(1.9, 1);
  const icoMat = new THREE.MeshBasicMaterial({
    color: 0x00d4ff,
    wireframe: true,
    transparent: true,
    opacity: 0.10
  });
  const ico = new THREE.Mesh(icoGeo, icoMat);
  scene.add(ico);

  // ---------- Mouse parallax ----------
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  // ---------- Animate ----------
  let rafId;
  const animate = () => {
    rafId = requestAnimationFrame(animate);

    particles.rotation.y += 0.0006;
    particles.rotation.x += 0.0002;

    ico.rotation.y += 0.0018;
    ico.rotation.x += 0.0010;

    camera.position.x += (mouseX * 0.4 - camera.position.x) * 0.045;
    camera.position.y += (-mouseY * 0.4 - camera.position.y) * 0.045;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  };
  animate();

  // ---------- Resize ----------
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  // Pause when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(rafId);
    else animate();
  });
})();