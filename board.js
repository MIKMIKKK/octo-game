document.addEventListener('DOMContentLoaded', () => {
    const stepsContainer = document.getElementById('steps-container');
    const tokensContainer = document.getElementById('tokens-container');
    const playerInfo = document.getElementById('player-info');
    
    // Timer Elements
    const timerDisplay = document.getElementById('timer');
    const startTimerBtn = document.getElementById('start-timer');
    const stopTimerBtn = document.getElementById('stop-timer');
    const resetTimerBtn = document.getElementById('reset-timer');

    // Dice Elements
    const dice = document.getElementById('dice');
    const scene = document.querySelector('.scene');

    // Card Elements
    const deckQuestion = document.getElementById('deck-question');
    const deckBeneficial = document.getElementById('deck-beneficial');
    const activeCardArea = document.getElementById('active-card-area');

    // --- Timer Logic ---
    const state = {
        timerInterval: null,
        isTimerRunning: false,
        timeLeft: 15000 // 15 seconds in ms
    };

    function updateTimerDisplay() {
        const seconds = Math.floor(state.timeLeft / 1000);
        const milliseconds = Math.floor((state.timeLeft % 1000) / 10); // 2 digits (centiseconds)
        
        const sStr = seconds.toString().padStart(2, '0');
        const msStr = milliseconds.toString().padStart(2, '0');
        
        timerDisplay.textContent = `${sStr}:${msStr}`;
        
        if (state.timeLeft > 0) {
            state.timeLeft -= 10;
        } else {
            state.timeLeft = 0;
            // Ensure 00:00 is displayed
            timerDisplay.textContent = "00:00";
            stopTimer();
            timerDisplay.style.color = 'red';
        }
    }

    function startTimer() {
        // Always reset to 15s when starting for a question
        stopTimer();
        state.timeLeft = 15000;
        state.isTimerRunning = true;
        timerDisplay.style.color = '#D4AF37';
        updateTimerDisplay(); 
        
        state.timerInterval = setInterval(updateTimerDisplay, 10);
    }

    function stopTimer() {
        state.isTimerRunning = false;
        clearInterval(state.timerInterval);
    }

    function resetTimer() {
        stopTimer();
        state.timeLeft = 15000;
        timerDisplay.textContent = "15:00";
        timerDisplay.style.color = '#D4AF37';
    }

    startTimerBtn.addEventListener('click', startTimer);
    stopTimerBtn.addEventListener('click', stopTimer);
    resetTimerBtn.addEventListener('click', resetTimer);

    // --- Dice Logic ---
    const faceRotations = {
        1: { x: 0, y: 0 },       // Front
        2: { x: 0, y: -90 },     // Right
        3: { x: 0, y: -180 },    // Back
        4: { x: 0, y: 90 },      // Left
        5: { x: -90, y: 0 },     // Top
        6: { x: 90, y: 0 }       // Bottom
    };

    let currentRotationX = 0;
    let currentRotationY = 0;
    let isRolling = false;

    function rollDice() {
        if (isRolling) return;
        isRolling = true;
        
        scene.classList.add('stop-anim');
        
        const result = Math.floor(Math.random() * 6) + 1;
        const target = faceRotations[result];
        
        const minSpin = 720;
        
        let kX = Math.ceil((currentRotationX + minSpin - target.x) / 360);
        let nextX = target.x + (kX * 360);
        
        let kY = Math.ceil((currentRotationY + minSpin - target.y) / 360);
        let nextY = target.y + (kY * 360);
        
        dice.style.transition = 'transform 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
        dice.style.transform = `rotateX(${nextX}deg) rotateY(${nextY}deg)`;
        
        currentRotationX = nextX;
        currentRotationY = nextY;
        
        setTimeout(() => {
            isRolling = false;
            scene.classList.remove('stop-anim');
            
            // Move Player Logic
            movePlayer(result);
            
        }, 1500);
    }

    scene.addEventListener('click', rollDice);

    // --- Card Logic ---
    const questionFaces = [
        '/assets/card_face_1.png',
        '/assets/card_face_2.png',
        '/assets/card_face_3.png'
    ];

    const beneficialFaces = [
        '/assets/card_face_3.png',
        '/assets/card_face_4.png',
        '/assets/card_face_5.png'
    ];

    function drawCard(type) {
        activeCardArea.innerHTML = '';
        
        const card = document.createElement('div');
        card.className = 'active-card';
        
        const backFace = document.createElement('div');
        backFace.className = 'card-face-back';
        
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
        
        card.appendChild(backFace);
        card.appendChild(frontFace);
        
        activeCardArea.appendChild(card);
    }

    deckQuestion.addEventListener('click', () => drawCard('question'));
    deckBeneficial.addEventListener('click', () => drawCard('beneficial'));

    // --- Board Logic ---
    // Create organic curved path
    const steps = [
        { x: 120, y: 680, angle: 15, type: 'normal' },
        { x: 200, y: 720, angle: 5, type: 'question' }, // Blue
        { x: 300, y: 735, angle: -5, type: 'normal' },
        { x: 410, y: 720, angle: -15, type: 'bonus' }, // Green
        { x: 520, y: 680, angle: -30, type: 'normal' },
        
        { x: 610, y: 610, angle: -55, type: 'question' },
        { x: 680, y: 520, angle: -75, type: 'normal' },
        { x: 720, y: 410, angle: -95, type: 'bonus' },
        { x: 735, y: 290, angle: -110, type: 'normal' },
        { x: 720, y: 180, angle: -135, type: 'question' },
        
        { x: 670, y: 100, angle: -165, type: 'normal' },
        { x: 550, y: 60, angle: 175, type: 'bonus' },
        { x: 420, y: 55, angle: 165, type: 'normal' },
        { x: 290, y: 70, angle: 155, type: 'question' },
        { x: 180, y: 110, angle: 135, type: 'normal' },
        
        { x: 100, y: 200, angle: 105, type: 'bonus' },
        { x: 60, y: 310, angle: 85, type: 'normal' },
        { x: 55, y: 430, angle: 75, type: 'question' },
        { x: 75, y: 540, angle: 55, type: 'normal' },
        { x: 105, y: 620, angle: 35, type: 'normal' }
    ];

    steps.forEach((pos, i) => {
        const step = document.createElement('div');
        step.classList.add('step');
        
        if (pos.type === 'question') step.classList.add('question');
        if (pos.type === 'bonus') step.classList.add('bonus');

        step.style.left = `${pos.x - 50}px`;
        step.style.top = `${pos.y - 50}px`;
        const randomRot = (Math.random() - 0.5) * 15;
        step.style.transform = `rotate(${pos.angle + randomRot}deg)`;
        
        const numberSpan = document.createElement('span');
        numberSpan.className = 'step-number';
        numberSpan.textContent = i + 1;
        step.appendChild(numberSpan);
        
        stepsContainer.appendChild(step);
        pos.element = step;
        steps[i] = pos;
    });

    // --- Setup Logic ---
    const setupModal = document.getElementById('setup-modal');
    const stepCount = document.getElementById('step-count');
    const stepNames = document.getElementById('step-names');
    const nextStepBtn = document.getElementById('next-step-btn');
    const startGameBtn = document.getElementById('start-game-btn');
    const countBtns = document.querySelectorAll('.count-btn');
    const nameInputsContainer = document.getElementById('name-inputs-container');

    let playerCount = 4;
    const playerColors = ['#ff4444', '#4444ff', '#44ff44', '#ffff44'];
    let players = [];
    let currentPlayerIndex = 0;

    // Handle Count Selection
    countBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            countBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            playerCount = parseInt(btn.dataset.count);
        });
    });

    // Go to Names Step
    nextStepBtn.addEventListener('click', () => {
        stepCount.classList.add('hidden');
        stepNames.classList.remove('hidden');
        generateNameInputs();
    });

    function generateNameInputs() {
        nameInputsContainer.innerHTML = '';
        for (let i = 0; i < playerCount; i++) {
            const group = document.createElement('div');
            group.className = 'input-group';
            
            const color = document.createElement('div');
            color.className = 'color-indicator';
            color.style.backgroundColor = playerColors[i];
            
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'name-input';
            input.placeholder = `Nom du Joueur ${i + 1}`;
            input.value = `Joueur ${i + 1}`; // Default value
            input.id = `player-name-${i}`;
            
            group.appendChild(color);
            group.appendChild(input);
            nameInputsContainer.appendChild(group);
        }
    }

    // Start Game
    startGameBtn.addEventListener('click', () => {
        // Initialize Players Array
        players = [];
        for (let i = 0; i < playerCount; i++) {
            const name = document.getElementById(`player-name-${i}`).value || `Joueur ${i + 1}`;
            players.push({
                id: i + 1,
                name: name,
                color: playerColors[i],
                position: 0
            });
        }

        // Create Tokens
        createTokens();
        
        // Update Info
        updatePlayerInfo();
        
        // Hide Modal
        setupModal.classList.add('hidden');
        
        // Save Initial State
        saveGameState();
        
        // Don't start timer automatically anymore
        // startTimerBtn.click();
    });

    function createTokens() {
        tokensContainer.innerHTML = '';
        players.forEach((player, index) => {
            const token = document.createElement('div');
            token.classList.add('token');
            token.id = `p${player.id}`;
            const offset = (index - 1.5) * 10; 
            token.style.left = `${steps[0].x + 30 + offset}px`;
            token.style.top = `${steps[0].y + 30 + offset}px`;
            token.style.border = `2px solid ${player.color}`;
            token.style.borderRadius = '50%';
            tokensContainer.appendChild(token);
            player.element = token;
        });
    }

    function updatePlayerInfo() {
        const player = players[currentPlayerIndex];
        playerInfo.innerHTML = `Tour de <span style="color: ${player.color}; font-weight: bold;">${player.name}</span>`;
    }

    // --- Persistence Logic ---
    function saveGameState() {
        const gameState = {
            players: players,
            currentPlayerIndex: currentPlayerIndex,
            playerCount: playerCount
        };
        localStorage.setItem('octoGameState', JSON.stringify(gameState));
    }

    function loadGameState() {
        const savedState = localStorage.getItem('octoGameState');
        if (savedState) {
            const state = JSON.parse(savedState);
            players = state.players;
            currentPlayerIndex = state.currentPlayerIndex;
            playerCount = state.playerCount;
            
            // Restore UI
            setupModal.classList.add('hidden');
            createTokens();
            
            // Restore positions
            players.forEach((player, index) => {
                const targetStep = steps[player.position];
                const offset = (index - 1.5) * 10;
                player.element.style.left = `${targetStep.x + 30 + offset}px`;
                player.element.style.top = `${targetStep.y + 30 + offset}px`;
            });
            
            updatePlayerInfo();
            return true;
        }
        return false;
    }

    // Restart Logic
    const restartBtn = document.getElementById('restart-btn');
    const restartModal = document.getElementById('restart-modal');
    const confirmRestartBtn = document.getElementById('confirm-restart-btn');
    const cancelRestartBtn = document.getElementById('cancel-restart-btn');

    restartBtn.addEventListener('click', () => {
        restartModal.classList.remove('hidden');
    });

    confirmRestartBtn.addEventListener('click', () => {
        resetGame();
        restartModal.classList.add('hidden');
    });

    cancelRestartBtn.addEventListener('click', () => {
        restartModal.classList.add('hidden');
    });

    function resetGame() {
        console.log("Resetting game...");
        // 1. Clear Save
        localStorage.removeItem('octoGameState');
        
        // 2. Stop Timer
        stopTimer();
        timerDisplay.textContent = "15:00";
        timerDisplay.style.color = '#D4AF37';
        
        // 3. Reset Game State
        players = [];
        currentPlayerIndex = 0;
        tokensContainer.innerHTML = '';
        playerInfo.textContent = "En attente...";
        
        // 4. Show Setup Modal (Reset to Step 1)
        setupModal.classList.remove('hidden');
        stepCount.classList.remove('hidden');
        stepNames.classList.add('hidden');
        
        // 5. Reset Dice
        scene.style.pointerEvents = 'auto';
        scene.style.opacity = '1';
        
        console.log("Game reset complete");
    }

    // Check for saved game on load
    if (!loadGameState()) {
        // No saved game, show setup modal (default behavior)
        setupModal.classList.remove('hidden');
    } else {
        // Game loaded, ensure modal is hidden
        setupModal.classList.add('hidden');
    }

    // --- Game Logic ---
    function movePlayer(roll) {
        const player = players[currentPlayerIndex];
        let newPos = player.position + roll;
        
        // Win Condition: Completing a full lap
        if (newPos >= steps.length) {
            // Player wins!
            newPos = steps.length - 1; // Snap to last step
            player.position = newPos;

            // Update visual position
            const targetStep = steps[newPos];
            const offset = (players.indexOf(player) - 1.5) * 10;
            player.element.style.left = `${targetStep.x + 30 + offset}px`;
            player.element.style.top = `${targetStep.y + 30 + offset}px`;

            // Announce Victory
            playerInfo.innerHTML = `<span style="color: #D4AF37; font-size: 1.5em; text-shadow: 0 0 10px gold;">👑 VICTOIRE ! ${player.name} a gagné ! 👑</span>`;
            
            const messageDisplay = document.getElementById('message-display');
            messageDisplay.textContent = `${player.name.toUpperCase()} GAGNE !`;
            messageDisplay.style.color = '#D4AF37';
            messageDisplay.style.fontSize = '18px';

            // Disable Dice
            scene.style.pointerEvents = 'none';
            scene.style.opacity = '0.5';
            
            // Stop Timer
            stopTimer();
            
            // Clear Save
            localStorage.removeItem('octoGameState');
            
            return; // End game
        }

        // Normal Move
        player.position = newPos;

        const targetStep = steps[newPos];
        const offset = (players.indexOf(player) - 1.5) * 10;
        player.element.style.left = `${targetStep.x + 30 + offset}px`;
        player.element.style.top = `${targetStep.y + 30 + offset}px`;

        if (targetStep.type === 'question') {
            console.log("Question Time!");
            // Auto draw question card
            setTimeout(() => drawCard('question'), 500);
            // Start Timer for Question
            startTimer();
        } else if (targetStep.type === 'bonus') {
            console.log("Bonus Time!");
            // Auto draw bonus card
            setTimeout(() => drawCard('beneficial'), 500);
            // Stop timer if it was running (optional, but good practice)
            resetTimer();
        } else {
            // Normal step, reset timer
            resetTimer();
        }

        // Next Turn
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        updatePlayerInfo();
        
        // Save State
        saveGameState();
    }
});
