/**
 * Math for Kids - Interactive Tutorial Game Logic (Polished Debugged Edition)
 */

// Game State
const state = {
  score: 0,
  streak: 0,
  stars: 0,
  operator: 'add', // 'add', 'sub', 'mul', 'div', 'random'
  currentProblem: {
    num1: 0,
    num2: 0,
    operatorChar: '+',
    answer: 0
  },
  answered: false
};

// Mascot speech chimes
const speechBubbles = {
  idle: [
    "Ready to solve? 🦁",
    "Pick an operator! 🚀",
    "What's next? 🦉",
    "Give it a try! 👍"
  ],
  correct: [
    "Awesome job! 🎉",
    "You're a genius! 🧠",
    "Super Star! ⭐",
    "Spot on! 🎯",
    "Brilliant! 🌟"
  ],
  wrong: [
    "Try again! You got this! 🌟",
    "Almost there! 🌟",
    "Close one! Try again!",
    "Give it another shot! 💪"
  ]
};

// DOM Bindings
const num1El = document.getElementById('num-1');
const num2El = document.getElementById('num-2');
const opDisplayEl = document.getElementById('op-display');
const answerInput = document.getElementById('answer-input');
const feedbackMessage = document.getElementById('feedback-message');
const scoreCounter = document.getElementById('score-counter');
const streakCounter = document.getElementById('streak-counter');
const starsBar = document.getElementById('stars-bar');
const btnCheck = document.getElementById('btn-check');
const btnGenerate = document.getElementById('btn-generate');
const btnHint = document.getElementById('btn-hint');
const equationDisplay = document.getElementById('equation-display');
const mascotBox = document.getElementById('mascot-box');
const mascotSpeech = document.getElementById('mascot-speech');
const audioCorrect = document.getElementById('audio-correct');
const audioCorrect2 = document.getElementById('audio-correct-2');
const audioWrong = document.getElementById('audio-wrong');
const audioWrong2 = document.getElementById('audio-wrong2');
const celebrationOverlay = document.getElementById('celebration-overlay');

// Track alternating sound states independently
let useSecondCorrectSound = false;
let useSecondWrongSound = false;

// Helper to get random integer inclusive
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Play audio chimes
const playSound = (type) => {
  try {
    let audioTarget = null;

    if (type === 'correct') {
      // Toggle between correct 1 and correct 2
      if (audioCorrect2 && useSecondCorrectSound) {
        audioTarget = audioCorrect2;
      } else {
        audioTarget = audioCorrect;
      }
      useSecondCorrectSound = !useSecondCorrectSound; // Alternate for next correct answer
    } else if (type === 'correct2') {
      audioTarget = audioCorrect2 || audioCorrect;
    } else if (type === 'wrong') {
      // Toggle between wrong 1 and wrong 2
      if (audioWrong2 && useSecondWrongSound) {
        audioTarget = audioWrong2;
      } else {
        audioTarget = audioWrong;
      }
      useSecondWrongSound = !useSecondWrongSound; // Alternate for next wrong answer
    } else if (type === 'wrong2') {
      audioTarget = audioWrong2 || audioWrong;
    }

    if (audioTarget) {
      audioTarget.currentTime = 0;
      audioTarget.play().catch(e => console.log('Audio playback prevented:', e));
    }
  } catch (e) {
    console.warn("Audio element error:", e);
  }
};

// Render star reward display
const renderStars = () => {
  starsBar.innerHTML = '';
  // Show up to 5 stars at a time
  const count = Math.min(state.stars, 5);
  for (let i = 0; i < count; i++) {
    const star = document.createElement('span');
    star.className = 'earned-star';
    star.textContent = '⭐';
    starsBar.appendChild(star);
  }
};

// Celebration overlays & particles
const triggerCelebrationEffects = () => {
  celebrationOverlay.classList.add('pulse-green');
  setTimeout(() => {
    celebrationOverlay.classList.remove('pulse-green');
  }, 800);

  // Confetti builder
  const colors = ['#feca57', '#ff7675', '#54a0ff', '#2ecc71', '#9b59b6', '#fd79a8'];
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'confetti-particle';
    particle.style.left = getRandomInt(0, window.innerWidth) + 'px';
    particle.style.backgroundColor = colors[getRandomInt(0, colors.length - 1)];
    const size = getRandomInt(8, 14);
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.animationDuration = (getRandomInt(10, 18) / 10) + 's';
    
    document.body.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 1800);
  }
};

// Update Mascot reaction chimes
const setMascot = (type) => {
  mascotBox.classList.remove('mascot-dance', 'mascot-wobble');
  void mascotBox.offsetWidth; // Trigger DOM reflow

  const speechList = speechBubbles[type];
  mascotSpeech.textContent = speechList[getRandomInt(0, speechList.length - 1)];

  if (type === 'correct') {
    mascotBox.classList.add('mascot-dance');
  } else if (type === 'wrong') {
    mascotBox.classList.add('mascot-wobble');
  }
};

/* 
 * FEATURE 3: Dynamic Visual Hint System
 * The showHint() function dynamically generates step-by-step visual aids or 
 * conceptual text explanations based on the active numbers (num1 and num2) 
 * and operator type. It repeats emojis for addition, uses interactive cookie 
 * scenarios for subtraction, repeated addition formulas for multiplication, 
 * and equal pile sharing analogies for division. Old hints reset on GENERATE.
 */
const showHint = () => {
  if (state.answered) return;
  const { num1, num2, operatorChar } = state.currentProblem;
  let hintText = "";
  
  switch (operatorChar) {
    case '+':
      const apples1 = num1 > 0 ? "🍎".repeat(num1) : "0";
      const apples2 = num2 > 0 ? "🍎".repeat(num2) : "0";
      hintText = `Try counting: ${apples1} + ${apples2}`;
      break;
    case '−':
      hintText = `Imagine you have ${num1} cookies and eat ${num2}... how many are left? 🍪`;
      break;
    case '×':
      if (num1 === 0) {
        hintText = `0 × ${num2} means 0 groups of ${num2}! The answer is 0! 🍭`;
      } else {
        hintText = `${num1} × ${num2} means ${num1} groups of ${num2}! Try adding: ${Array(num1).fill(num2).join(" + ")} 🍭`;
      }
      break;
    case '÷':
      hintText = `${num1} ÷ ${num2} means split ${num1} items into ${num2} equal piles! 🎈`;
      break;
  }
  
  mascotSpeech.textContent = hintText;
  mascotBox.classList.remove('mascot-dance', 'mascot-wobble');
  void mascotBox.offsetWidth; // Trigger DOM reflow
  mascotBox.classList.add('mascot-wobble'); // Wiggle to show hint
};

/* 
 * FEATURE 1: Operator Selection & Problem Generation Logic
 * This module generates random math problems on a fixed 0-10 scale.
 * If 'Random' is chosen, it selects from Addition (+), Subtraction (-), 
 * Multiplication (x), or Division (/). 
 * - Subtraction Constraint: Enforces num1 >= num2 to guarantee non-negative math outcomes.
 * - Division Constraint: Enforces num2 != 0 and num1 % num2 === 0 to guarantee whole-number
 *   quotients without remainder decimals (calculated by searching valid divisors of a random dividend).
 */
const generateProblem = () => {
  let activeOp = state.operator;
  if (activeOp === 'random') {
    const ops = ['add', 'sub', 'mul', 'div'];
    activeOp = ops[getRandomInt(0, ops.length - 1)];
  }

  let num1 = 0;
  let num2 = 0;
  let operatorChar = '+';
  let answer = 0;

  switch (activeOp) {
    case 'add':
      num1 = getRandomInt(0, 10);
      num2 = getRandomInt(0, 10);
      operatorChar = '+';
      answer = num1 + num2;
      break;

    case 'sub':
      num1 = getRandomInt(0, 10);
      num2 = getRandomInt(0, 10);
      // Subtraction rule: Ensure num1 >= num2 for non-negative answer
      if (num2 > num1) {
        const temp = num1;
        num1 = num2;
        num2 = temp;
      }
      operatorChar = '−';
      answer = num1 - num2;
      break;

    case 'mul':
      num1 = getRandomInt(0, 10);
      num2 = getRandomInt(0, 10);
      operatorChar = '×';
      answer = num1 * num2;
      break;

    case 'div':
      // Division rule: Ensure num2 != 0 and num1 % num2 === 0, inputs strictly 0-10
      num1 = getRandomInt(0, 10);
      const divisors = [];
      for (let i = 1; i <= 10; i++) {
        if (num1 % i === 0) {
          divisors.push(i);
        }
      }
      num2 = divisors[getRandomInt(0, divisors.length - 1)];
      operatorChar = '÷';
      answer = num1 / num2;
      break;
  }

  // Update State
  state.currentProblem = { num1, num2, operatorChar, answer };
  state.answered = false;

  // Render UI
  num1El.textContent = num1;
  num2El.textContent = num2;
  opDisplayEl.textContent = operatorChar;
  answerInput.value = '';
  answerInput.disabled = false;
  answerInput.focus();

  // Reset UI visual states
  feedbackMessage.classList.add('hidden');
  feedbackMessage.className = 'feedback-text hidden';
  equationDisplay.className = 'equation';
  setMascot('idle');
};

/* 
 * FEATURE 2: Answer Validation & Audio-Visual Feedback System
 * The checkAnswer() function compares the user input against the expected math answer.
 * - Correct Path: Increments state score (+10), streak (+1), and star counts. Triggers
 *   confetti particle burst, a green background pulse, bounce animations, and plays correct.mp3.
 * - Incorrect Path: Resets the winning streak badge back to 0, shakes the problem card, wiggles the
 *   mascot, outputs non-harsh yellow encouragement text, and plays wrong.mp3.
 */
const checkAnswer = () => {
  if (state.answered) return;

  const userInputValue = answerInput.value.trim();
  if (userInputValue === '') {
    feedbackMessage.textContent = 'Oops! Type in an answer! 🤔';
    feedbackMessage.className = 'feedback-text wrong';
    feedbackMessage.classList.remove('hidden');
    equationDisplay.classList.add('shake');
    setMascot('wrong');
    setTimeout(() => {
      equationDisplay.classList.remove('shake');
    }, 500);
    return;
  }

  const userAnswer = parseInt(userInputValue, 10);
  
  if (userAnswer === state.currentProblem.answer) {
    // Correct answer
    state.score += 10;
    state.streak += 1;
    state.stars += 1;
    
    scoreCounter.textContent = state.score;
    streakCounter.textContent = state.streak;
    renderStars();

    feedbackMessage.textContent = 'Awesome! Correct! 🎉⭐';
    feedbackMessage.className = 'feedback-text correct';
    feedbackMessage.classList.remove('hidden');
    
    // Animate, sound & mascot reaction
    equationDisplay.classList.add('bounce');
    setMascot('correct');
    playSound('correct');
    triggerCelebrationEffects();

    state.answered = true;
    answerInput.disabled = true;
  } else {
    // Wrong answer
    state.streak = 0; // Reset streak
    streakCounter.textContent = state.streak;

    // Friendly encouragement (no harsh red error text)
    feedbackMessage.textContent = 'Try again! You got this! 🌟';
    feedbackMessage.className = 'feedback-text wrong';
    feedbackMessage.classList.remove('hidden');

    // Animate, sound & mascot reaction
    equationDisplay.classList.add('shake');
    setMascot('wrong');
    playSound('wrong');

    // Reset input to try again
    answerInput.value = '';
    answerInput.focus();

    setTimeout(() => {
      equationDisplay.className = 'equation';
    }, 500);
  }
};

// Event Listeners Setup
document.addEventListener('DOMContentLoaded', () => {
  // Operator Selection Toggles
  const operatorButtons = document.querySelectorAll('.operator-selector-grid button');
  operatorButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      operatorButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
      state.operator = btn.dataset.operator;
      generateProblem();
    });
  });

  // Action Buttons
  btnCheck.addEventListener('click', checkAnswer);
  btnGenerate.addEventListener('click', generateProblem);
  btnHint.addEventListener('click', showHint);

  // Keyboard support: Enter key
  answerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (!state.answered) {
        checkAnswer();
      } else {
        generateProblem();
      }
    }
  });

  // Init Game Board
  generateProblem();
  renderStars();
});