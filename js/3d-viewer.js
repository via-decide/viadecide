import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

// Configuration
const COLORS = {
  black: '#1a1a1a',
  white: '#f5f5f5',
  blue: '#1e3a8a',
  sand: '#d2b48c',
  red: '#dc2626',
  green: '#16a34a'
};

const BODY_SWATCHES = [
  { name: 'Black', hex: COLORS.black },
  { name: 'White', hex: COLORS.white },
  { name: 'Blue', hex: COLORS.blue },
  { name: 'Sand', hex: COLORS.sand }
];

const ACCENT_SWATCHES = [
  { name: 'Red', hex: COLORS.red },
  { name: 'Black', hex: COLORS.black },
  { name: 'White', hex: COLORS.white },
  { name: 'Green', hex: COLORS.green }
];

let scene, camera, renderer, controls;
let bodyMesh, accentMesh;

const materials = {
  body: new THREE.MeshStandardMaterial({
    color: COLORS.black,
    roughness: 0.7,
    metalness: 0.1
  }),
  accent: new THREE.MeshStandardMaterial({
    color: COLORS.red,
    roughness: 0.6,
    metalness: 0.2
  })
};

function init() {
  const container = document.getElementById('viewer-container');
  const canvas = document.getElementById('canvas3d');
  
  if(!container || !canvas) return;

  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0a); // Dark environment

  // Camera
  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 50);

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 2.0;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight1.position.set(10, 20, 10);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight2.position.set(-10, -20, -10);
  scene.add(dirLight2);

  // Fallback Geometries (while STLs are missing)
  const loader = new STLLoader();
  
  // Try loading Body STL
  loader.load('/models/body.stl', 
    (geometry) => {
      geometry.center();
      bodyMesh = new THREE.Mesh(geometry, materials.body);
      // Scale down if needed based on STL units
      bodyMesh.scale.set(0.5, 0.5, 0.5);
      scene.add(bodyMesh);
    },
    undefined,
    (error) => {
      console.log("No body.stl found, using fallback box.");
      const geo = new THREE.BoxGeometry(15, 20, 4);
      bodyMesh = new THREE.Mesh(geo, materials.body);
      scene.add(bodyMesh);
    }
  );

  // Try loading Accent STL
  loader.load('/models/accent.stl', 
    (geometry) => {
      geometry.center();
      accentMesh = new THREE.Mesh(geometry, materials.accent);
      // Ensure it sits relative to body
      accentMesh.scale.set(0.5, 0.5, 0.5);
      accentMesh.position.z = 1; 
      scene.add(accentMesh);
    },
    undefined,
    (error) => {
      console.log("No accent.stl found, using fallback cylinder.");
      const geo = new THREE.CylinderGeometry(3, 3, 5, 32);
      geo.rotateX(Math.PI / 2);
      accentMesh = new THREE.Mesh(geo, materials.accent);
      accentMesh.position.set(0, 5, 2);
      scene.add(accentMesh);
    }
  );

  // Window Resize Handle
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // UI Setup
  setupUI();

  // Start Animation Loop
  renderer.setAnimationLoop(animate);
}

function animate() {
  controls.update();
  renderer.render(scene, camera);
}

function setupUI() {
  const bodyContainer = document.getElementById('body-swatches');
  const accentContainer = document.getElementById('accent-swatches');
  const lblBody = document.getElementById('lbl-body');
  const lblAccent = document.getElementById('lbl-accent');

  // Render Body Swatches
  BODY_SWATCHES.forEach((s, idx) => {
    const el = document.createElement('div');
    el.className = `swatch ${idx === 0 ? 'active' : ''}`;
    el.innerHTML = `
      <div class="swatch-color" style="background:${s.hex}"></div>
      <div class="swatch-name">${s.name}</div>
    `;
    el.onclick = () => {
      materials.body.color.set(s.hex);
      lblBody.textContent = s.name.toUpperCase();
      Array.from(bodyContainer.children).forEach(c => c.classList.remove('active'));
      el.classList.add('active');
    };
    bodyContainer.appendChild(el);
  });

  // Render Accent Swatches
  ACCENT_SWATCHES.forEach((s, idx) => {
    const el = document.createElement('div');
    el.className = `swatch ${idx === 0 ? 'active' : ''}`;
    el.innerHTML = `
      <div class="swatch-color" style="background:${s.hex}"></div>
      <div class="swatch-name">${s.name}</div>
    `;
    el.onclick = () => {
      materials.accent.color.set(s.hex);
      lblAccent.textContent = s.name.toUpperCase();
      Array.from(accentContainer.children).forEach(c => c.classList.remove('active'));
      el.classList.add('active');
    };
    accentContainer.appendChild(el);
  });

  // Interaction feedback
  const canvas = document.getElementById('canvas3d');
  canvas.addEventListener('pointerdown', () => {
    controls.autoRotate = false;
    document.querySelector('.drag-hint').style.opacity = '0';
  });
}

// Initialize when DOM is ready
if(document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
