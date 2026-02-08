/*
 * 3Dcard - Three.js 3D Card Implementation (Full App Version)
 * Features: Card flip animation, mouse-tilt effect, fetch questions from API
 */

// ============================
// 🔧 CUSTOMIZATION LOCATIONS
// ============================
// Card dimensions (2.5:3.5 ratio - standard poker card)
const CARD_WIDTH = 2.5;
const CARD_HEIGHT = 3.5;

// 🔧 Replace these URLs with your own card images (714 x 1000px recommended)
const CARD_BACK_IMAGE = 'https://i.imgur.com/placeholder.png'; // Western art

// ============================
// THREE.JS SETUP
// ============================
let scene, camera, renderer, cardGroup, cardFront, cardBack;
let isFlipped = false;
let isAnimating = false;
let mouseX = 0, mouseY = 0;
let targetRotationX = 0, targetRotationY = 0;
let baseRotation = 0; // Store the base rotation (0 or PI)

// Canvas container
const container = document.getElementById('card-container');

function init() {
  if (!container) return;

  // Create scene
  scene = new THREE.Scene();

  // Create camera
  camera = new THREE.PerspectiveCamera(
    45, // FOV
    container.clientWidth / container.clientHeight, // Aspect ratio
    0.1, // Near
    100 // Far
  );
  camera.position.z = 8;

  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0); // Transparent background
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 10);
  scene.add(directionalLight);

  const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
  backLight.position.set(-5, -5, -10);
  scene.add(backLight);

  // Create card
  createCard();

  // Event listeners
  window.addEventListener('resize', onWindowResize);
  renderer.domElement.addEventListener('mousemove', onMouseMove);
  renderer.domElement.addEventListener('click', onCardClick);

  // Start animation loop
  animate();

  // Load first question onto dark side (hidden initially)
  loadNewQuestion();
}

// ============================
// CARD CREATION
// ============================
function createCard() {
  cardGroup = new THREE.Group();

  // Texture loader
  const textureLoader = new THREE.TextureLoader();

  // Load textures
  const frontTexture = createFrontTexture(); // Light side - no question
  const backTexture = createQuestionTexture("Loading..."); // Dark side - with question

  // Card geometry (thin box for 3D effect)
  const geometry = new THREE.BoxGeometry(CARD_WIDTH, CARD_HEIGHT, 0.02);

  // Materials for each face
  const edgeMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4a574,
    roughness: 0.6,
    metalness: 0.1
  });

  const frontMaterial = new THREE.MeshStandardMaterial({
    map: frontTexture,
    roughness: 0.5,
    metalness: 0.1
  });

  const backMaterial = new THREE.MeshStandardMaterial({
    map: backTexture,
    roughness: 0.5,
    metalness: 0.1
  });

  const materials = [
    edgeMaterial,
    edgeMaterial,
    edgeMaterial,
    edgeMaterial,
    frontMaterial,
    backMaterial
  ];

  // Create card mesh
  const card = new THREE.Mesh(geometry, materials);

  // Create separate meshes for front and back
  const frontGeometry = new THREE.PlaneGeometry(CARD_WIDTH, CARD_HEIGHT);
  cardFront = new THREE.Mesh(frontGeometry, frontMaterial);
  cardFront.position.z = 0.011;
  cardFront.rotation.y = 0;

  const backGeometry = new THREE.PlaneGeometry(CARD_WIDTH, CARD_HEIGHT);
  cardBack = new THREE.Mesh(backGeometry, backMaterial);
  cardBack.position.z = -0.011;
  cardBack.rotation.y = Math.PI;

  const edgePiece = new THREE.Mesh(geometry, materials);
  edgePiece.scale.set(0.98, 0.98, 1);

  cardGroup.add(cardFront);
  cardGroup.add(cardBack);
  cardGroup.add(edgePiece);

  scene.add(cardGroup);
}

// ============================
// FRONT TEXTURE (LIGHT - NO QUESTION)
// ============================
function createFrontTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1436;
  const ctx = canvas.getContext('2d');

  // Light parchment background
  ctx.fillStyle = '#f4e4bc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Decorative border
  ctx.strokeStyle = '#8b4513';
  ctx.lineWidth = 20;
  ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

  ctx.strokeStyle = '#d4a574';
  ctx.lineWidth = 10;
  ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

  // Corner decorations
  drawCorner(ctx, 80, 80, 0);
  drawCorner(ctx, canvas.width - 80, 80, Math.PI / 2);
  drawCorner(ctx, canvas.width - 80, canvas.height - 80, Math.PI);
  drawCorner(ctx, 80, canvas.height - 80, -Math.PI / 2);

  // Center decoration - card back pattern
  ctx.fillStyle = '#d4a574';
  ctx.font = 'bold 80px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('3D', canvas.width / 2, canvas.height / 2 - 60);

  ctx.font = 'bold 60px Georgia, serif';
  ctx.fillText('CARD', canvas.width / 2, canvas.height / 2 + 30);

  // Instructions at bottom
  ctx.font = '32px Georgia, serif';
  ctx.fillStyle = '#666';
  ctx.fillText('Click to flip', canvas.width / 2, canvas.height - 100);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// ============================
// QUESTION TEXTURE (DARK - WITH QUESTION)
// ============================
function createQuestionTexture(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1436;
  const ctx = canvas.getContext('2d');

  // Darker parchment background
  ctx.fillStyle = '#d4c4a0'; // Darker than front
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Decorative border
  ctx.strokeStyle = '#5a3510'; // Darker border
  ctx.lineWidth = 20;
  ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

  ctx.strokeStyle = '#b8956a';
  ctx.lineWidth = 10;
  ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

  // Corner decorations
  drawCorner(ctx, 80, 80, 0);
  drawCorner(ctx, canvas.width - 80, 80, Math.PI / 2);
  drawCorner(ctx, canvas.width - 80, canvas.height - 80, Math.PI);
  drawCorner(ctx, 80, canvas.height - 80, -Math.PI / 2);

  // Question text
  ctx.fillStyle = '#000c2a';
  ctx.font = 'bold 48px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const words = text.split(' ');
  let line = '';
  let lines = [];
  const maxWidth = canvas.width - 200;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && i > 0) {
      lines.push(line);
      line = words[i] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  const lineHeight = 70;
  const startY = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;

  lines.forEach((line, index) => {
    ctx.fillText(line.trim(), canvas.width / 2, startY + (index * lineHeight));
  });

  ctx.font = '32px Georgia, serif';
  ctx.fillStyle = '#444';
  ctx.fillText('Click for new question', canvas.width / 2, canvas.height - 100);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function drawCorner(ctx, x, y, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.strokeStyle = '#8b4513';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(60, 0);
  ctx.lineTo(0, 60);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

// ============================
// UPDATE QUESTION FROM API
// ============================
async function updateQuestionText() {
  try {
    const response = await fetch('/api/questions/random');
    const data = await response.json();
    const newTexture = createQuestionTexture(data.text);

    if (cardBack) {
      cardBack.material.map = newTexture;
      cardBack.material.needsUpdate = true;
    }
  } catch (err) {
    console.error('Error fetching question:', err);
  }
}

// ============================
// LOAD QUESTION WITHOUT FLIPPING
// ============================
async function loadNewQuestion() {
  try {
    const response = await fetch('/api/questions/random');
    const data = await response.json();
    const newTexture = createQuestionTexture(data.text);

    if (cardBack) {
      cardBack.material.map = newTexture;
      cardBack.material.needsUpdate = true;
    }
  } catch (err) {
    console.error('Error fetching question:', err);
  }
}

// ============================
// EVENT HANDLERS
// ============================
function onWindowResize() {
  if (!camera || !renderer) return;
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

function onMouseMove(event) {
  if (!renderer) return;
  const rect = renderer.domElement.getBoundingClientRect();
  mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function onCardClick(event) {
  if (isAnimating) return;
  flipCard();
}

function flipCard() {
  if (isAnimating) return;

  isAnimating = true;

  const startRotation = baseRotation;
  const targetRotation = isFlipped ? 0 : Math.PI;
  const duration = 600;
  const startTime = Date.now();

  function animateFlip() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    // Animate from start to target
    cardGroup.rotation.y = startRotation + (targetRotation - startRotation) * eased;

    if (progress < 1) {
      requestAnimationFrame(animateFlip);
    } else {
      // Animation complete
      isAnimating = false;
      isFlipped = !isFlipped;
      baseRotation = targetRotation; // Update base rotation
      cardGroup.rotation.y = baseRotation; // Set exact final rotation

      // Load new question when flipping TO dark side (showing question)
      if (isFlipped) {
        loadNewQuestion();
      }
    }
  }

  animateFlip();
}

function animate() {
  requestAnimationFrame(animate);

  // Calculate target rotations
  targetRotationY = mouseX * 0.26;
  targetRotationX = -mouseY * 0.26;

  // Apply mouse tilt - only tilt effect, base rotation stays stable
  if (!isAnimating) {
    // Smooth tilt on X axis
    cardGroup.rotation.x += (targetRotationX - cardGroup.rotation.x) * 0.05;

    // For Y axis, add tilt to the base rotation
    const targetY = baseRotation + targetRotationY;
    cardGroup.rotation.y += (targetY - cardGroup.rotation.y) * 0.05;
  }

  renderer.render(scene, camera);
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
