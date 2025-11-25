import './style.css'

// --- Game State ---
const state = {
  timerInterval: null,
  seconds: 0,
  isTimerRunning: false
};

// --- DOM Elements ---
const dice = document.getElementById('dice');
const rollBtn = document.getElementById('roll-btn');
const timerDisplay = document.getElementById('timer');
const startTimerBtn = document.getElementById('start-timer');
const stopTimerBtn = document.getElementById('stop-timer');
const resetTimerBtn = document.getElementById('reset-timer');
const deckQuestion = document.getElementById('deck-question');
const deckBeneficial = document.getElementById('deck-beneficial');
const activeCardArea = document.getElementById('active-card-area');
const rulesBtn = document.getElementById('rules-btn');
const rulesModal = document.getElementById('rules-modal');
const closeModal = document.querySelector('.close-modal');

// --- Dice Logic ---
const diceResultDisplay = document.getElementById('dice-result');

// Rotations for a CUBE
// Face 1 (Front): rotateY(0)
// Face 2 (Right): rotateY(-90)
// Face 3 (Back): rotateY(-180)
// Face 4 (Left): rotateY(-270) or rotateY(90)
// Face 5 (Top): rotateX(-90)
// Face 6 (Bottom): rotateX(90)

const faceRotations = {
  1: { x: 0, y: 0 },       // Front
  2: { x: 0, y: -90 },     // Right
  3: { x: 0, y: -180 },    // Back
  4: { x: 0, y: 90 },      // Left
  5: { x: -90, y: 0 },     // Top
  6: { x: 90, y: 0 },      // Bottom
  7: { x: 0, y: 0 },       // Fallback for D8 (Front)
  8: { x: 0, y: -90 }      // Fallback for D8 (Right)
};

let currentRotationX = 0;
let currentRotationY = 0;

function rollDice() {
  rollBtn.disabled = true;
  rollBtn.textContent = "ROLLING...";
  
  // Stop floating animation to ensure perfect alignment
  document.querySelector('.scene').classList.add('stop-anim');
  
  const result = Math.floor(Math.random() * 8) + 1;
  const target = faceRotations[result];
  
  // Calculate next rotation
  // We want to add at least 2 full spins (720deg) + the difference to reach target
  // But simply adding to current is better.
  // Target is absolute orientation.
  // We need: NewRot = CurrentRot + Delta
  // Where NewRot % 360 == Target
  
  // Let's normalize current rotation to 0-360 base for calculation? No need.
  // We just want to reach Target + K * 360.
  // Let's find the closest multiple of 360 that is greater than current + min_spin.
  
  const minSpin = 720; // 2 full turns minimum
  
  // Calculate target X
  // We want nextX > currentX + minSpin
  // and nextX % 360 == target.x % 360
  // Actually target.x is -90, 0, 90.
  
  // Simple formula:
  // 1. Add minSpin to current
  // 2. Adjust to match target phase
  
  let kX = Math.ceil((currentRotationX + minSpin - target.x) / 360);
  let nextX = target.x + (kX * 360);
  
  let kY = Math.ceil((currentRotationY + minSpin - target.y) / 360);
  let nextY = target.y + (kY * 360);
  
  // Apply
  dice.style.transition = 'transform 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
  dice.style.transform = `rotateX(${nextX}deg) rotateY(${nextY}deg)`;
  
  // Update state
  currentRotationX = nextX;
  currentRotationY = nextY;
  
  setTimeout(() => {
    rollBtn.disabled = false;
    rollBtn.textContent = "Roll the Dice";
    diceResultDisplay.textContent = result;
    diceResultDisplay.classList.add('show-result');
    document.querySelector('.scene').classList.remove('stop-anim');
  }, 1500);
}

rollBtn.addEventListener('click', rollDice);

// --- Timer Logic ---
let startTime = 0;
let elapsedTime = 0;

function updateTimerDisplay() {
  const now = Date.now();
  const time = now - startTime + elapsedTime;
  
  const seconds = Math.floor(time / 1000);
  const milliseconds = Math.floor((time % 1000) / 10); // 2 digits
  
  const sStr = seconds.toString().padStart(2, '0');
  const msStr = milliseconds.toString().padStart(2, '0');
  
  timerDisplay.textContent = `${sStr}:${msStr}`;
}

startTimerBtn.addEventListener('click', () => {
  if (state.isTimerRunning) return;
  state.isTimerRunning = true;
  startTimerBtn.style.color = 'var(--primary-color)';
  startTime = Date.now();
  
  state.timerInterval = setInterval(() => {
    updateTimerDisplay();
  }, 10); // Update every 10ms
});

stopTimerBtn.addEventListener('click', () => {
  if (!state.isTimerRunning) return;
  state.isTimerRunning = false;
  startTimerBtn.style.color = 'white';
  clearInterval(state.timerInterval);
  elapsedTime += Date.now() - startTime;
});

resetTimerBtn.addEventListener('click', () => {
  state.isTimerRunning = false;
  startTimerBtn.style.color = 'white';
  clearInterval(state.timerInterval);
  elapsedTime = 0;
  timerDisplay.textContent = "00:00";
});

// --- Card Logic ---
// 3 designs per category
const questionFaces = [
  '/assets/card_face_1.png',
  '/assets/card_face_2.png',
  '/assets/card_face_3.png'
];

const beneficialFaces = [
  '/assets/card_face_3.png', // Shared design
  '/assets/card_face_4.png',
  '/assets/card_face_5.png'
];

function drawCard(type) {
  // Clear active area
  activeCardArea.innerHTML = '';
  
  // Create card structure
  const card = document.createElement('div');
  card.className = 'active-card';
  
  const backFace = document.createElement('div');
  backFace.className = 'card-face-back';
  
  // Custom CSS Backs
  if (type === 'question') {
    backFace.classList.add('piraterie-back');
    backFace.innerHTML = '<div class="logo-92i">92i</div>';
  } else {
    backFace.classList.add('futur-back');
    backFace.innerHTML = '<div class="logo-futur">FUTUR</div>';
  }
  
  const frontFace = document.createElement('div');
  frontFace.className = 'card-face-front';
  
  let randomFaceUrl;
  if (type === 'question') {
    randomFaceUrl = questionFaces[Math.floor(Math.random() * questionFaces.length)];
  } else {
    randomFaceUrl = beneficialFaces[Math.floor(Math.random() * beneficialFaces.length)];
  }
  
  frontFace.style.backgroundImage = `url('${randomFaceUrl}')`;
  frontFace.style.border = '4px solid var(--primary-color)';
  
  card.appendChild(backFace);
  card.appendChild(frontFace);
  
  activeCardArea.appendChild(card);
}

deckQuestion.addEventListener('click', () => drawCard('question'));
deckBeneficial.addEventListener('click', () => drawCard('beneficial'));

// --- Modal Logic ---
rulesBtn.addEventListener('click', () => {
  rulesModal.classList.remove('hidden');
});

closeModal.addEventListener('click', () => {
  rulesModal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
  if (e.target === rulesModal) {
    rulesModal.classList.add('hidden');
  }
});
