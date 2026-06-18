import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- Configuration & Colors ---
const COLORS = {
  white: { hex: '#f5f5f5', rgb: [245, 245, 245], label: 'WHITE' },
  black: { hex: '#111111', rgb: [17, 17, 17], label: 'BLACK' },
  gray:  { hex: '#888888', rgb: [136, 136, 136], label: 'GRAY' },
  blue:  { hex: '#0a84ff', rgb: [10, 132, 255], label: 'BLUE' },
  red:   { hex: '#ff3b30', rgb: [255, 59, 48], label: 'RED' },
  neon:  { hex: '#39ff14', rgb: [57, 255, 20], label: 'NEON' },
  gold:  { hex: '#ffd700', rgb: [255, 215, 0], label: 'GOLD' },
  steel: { hex: '#a8b2b8', rgb: [168, 178, 184], label: 'STEEL' }
};

let currentState = {
  text: "DL3 CBT 6077",
  base: 'black',
  char: 'white',
  border: 'steel'
};

// --- DOM Elements ---
const canvas2d = document.getElementById('texture-canvas');
const ctx = canvas2d.getContext('2d');
const inputEl = document.getElementById('reg-input');
const readScore = document.getElementById('read-score');
const readMsg = document.getElementById('read-msg');

// --- Luminance & Contrast Logic ---
function getLuminance(r, g, b) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrast(rgb1, rgb2) {
  const lum1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const lum2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function updateReadability() {
  const baseRgb = COLORS[currentState.base].rgb;
  const charRgb = COLORS[currentState.char].rgb;
  const ratio = getContrast(baseRgb, charRgb);
  
  readScore.textContent = ratio.toFixed(2) + 'x';
  
  if (ratio < 3.0) {
    readScore.style.color = '#ff3b30';
    readMsg.textContent = 'Low - digits blend into base';
    readMsg.style.color = '#ff3b30';
  } else if (ratio < 4.5) {
    readScore.style.color = '#ffd700';
    readMsg.textContent = 'Medium - acceptable';
    readMsg.style.color = '#ffd700';
  } else {
    readScore.style.color = '#39ff14';
    readMsg.textContent = 'Strong contrast';
    readMsg.style.color = '#39ff14';
  }
}

// --- 2D Canvas Generation ---
let canvasTexture;

function updateCanvas() {
  // Clear
  ctx.fillStyle = COLORS[currentState.base].hex;
  ctx.fillRect(0, 0, canvas2d.width, canvas2d.height);
  
  // Draw inner border (simulating the raised edge)
  ctx.strokeStyle = COLORS[currentState.border].hex;
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, canvas2d.width - 4, canvas2d.height - 4);
  
  // Draw Text
  ctx.fillStyle = COLORS[currentState.char].hex;
  ctx.font = 'bold 50px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Add a slight shadow to make it look "raised"
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  ctx.fillText(currentState.text, canvas2d.width / 2, canvas2d.height / 2 + 2);
  
  // Reset shadow for next draw
  ctx.shadowColor = 'transparent';
  
  if (canvasTexture) {
    canvasTexture.needsUpdate = true;
  }
  updateReadability();
}

// --- Three.js Setup ---
const container = document.getElementById('viewer-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a); // match bg

const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
camera.position.set(0, 0, 15);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas3d'), antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 5;
controls.maxDistance = 30;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(5, 10, 7);
dirLight.castShadow = true;
scene.add(dirLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
fillLight.position.set(-5, -2, 5);
scene.add(fillLight);

// --- Create the Numberplate Mesh ---
// Plate dimensions: e.g. 10 x 2 x 0.2
const geometry = new THREE.BoxGeometry(10, 2, 0.2);

// We need an array of materials for the 6 faces.
// Order: right, left, top, bottom, front, back
canvasTexture = new THREE.CanvasTexture(canvas2d);
canvasTexture.colorSpace = THREE.SRGBColorSpace;

const borderMat = new THREE.MeshStandardMaterial({ color: COLORS[currentState.border].hex, roughness: 0.4, metalness: 0.2 });
const frontMat = new THREE.MeshStandardMaterial({ map: canvasTexture, roughness: 0.6, metalness: 0.1 });
const backMat = new THREE.MeshStandardMaterial({ color: COLORS[currentState.base].hex, roughness: 0.6, metalness: 0.1 });

const materials = [
  borderMat, // right
  borderMat, // left
  borderMat, // top
  borderMat, // bottom
  frontMat,  // front
  backMat    // back
];

const plateMesh = new THREE.Mesh(geometry, materials);
plateMesh.castShadow = true;
plateMesh.receiveShadow = true;
scene.add(plateMesh);

// Initial render
updateCanvas();

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Handle Resize
window.addEventListener('resize', () => {
  if(!container) return;
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});

// --- UI Interaction Logic ---
inputEl.addEventListener('input', (e) => {
  currentState.text = e.target.value.toUpperCase();
  updateCanvas();
});

function renderSwatches(containerId, options, stateKey) {
  const c = document.getElementById(containerId);
  c.innerHTML = '';
  options.forEach(opt => {
    const swatch = document.createElement('div');
    swatch.className = `swatch ${currentState[stateKey] === opt ? 'active' : ''}`;
    swatch.innerHTML = `<div class="swatch-inner" style="background:${COLORS[opt].hex};"></div>`;
    swatch.onclick = () => {
      currentState[stateKey] = opt;
      renderSwatches(containerId, options, stateKey); // re-render to update active class
      
      // Update 3D materials
      if(stateKey === 'border') {
        borderMat.color.set(COLORS[opt].hex);
      }
      if(stateKey === 'base') {
        backMat.color.set(COLORS[opt].hex);
      }
      
      updateCanvas();
    };
    c.appendChild(swatch);
  });
}

const baseOpts = ['black', 'white', 'gray', 'blue'];
const charOpts = ['white', 'black', 'red', 'neon', 'gold'];
const borderOpts = ['steel', 'black', 'white', 'blue', 'red'];

renderSwatches('base-swatches', baseOpts, 'base');
renderSwatches('char-swatches', charOpts, 'char');
renderSwatches('border-swatches', borderOpts, 'border');

window.submitOrder = function() {
  const text = `Hey PrintByDD! I want to order the Custom 3D Numberplate.\n\nRegistration: ${currentState.text}\nConfiguration:\n- Base: ${COLORS[currentState.base].label}\n- Text: ${COLORS[currentState.char].label}\n- Border: ${COLORS[currentState.border].label}\n\nPlease help me complete this order!`;
  const url = `https://wa.me/919999999999?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}
