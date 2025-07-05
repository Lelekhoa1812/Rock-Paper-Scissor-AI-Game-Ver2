// Rock Paper Scissors Backend AI Model with TensorFlow.js

const choices = ["Rock", "Paper", "Scissors"];
let userScore = 0, botScore = 0, roundCount = 1;
let rockCount = 0, paperCount = 0, scissorsCount = 0;
let historyChoice = [], firstPick = "", secondPick = "", mode = "";
let botChoice = "", user_msg = "Set your pick", bot_msg = "Bot is picking...";
let strategyMode = "history2";

const rr = [], rp = [], rs = [], pr = [], pp = [], ps = [], sr = [], sp = [], ss = [];

// Load TensorFlow.js via CDN in HTML <head>
let tfModel;

async function createTFModel() {
  tfModel = tf.sequential();
  tfModel.add(tf.layers.dense({ inputShape: [2], units: 10, activation: 'relu' }));
  tfModel.add(tf.layers.dense({ units: 3, activation: 'softmax' }));
  tfModel.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy' });
}
createTFModel();

function encodeChoice(choice) {
  return { "Rock": 1, "Paper": 2, "Scissors": 3 }[choice];
}
function decodeChoice(code) {
  return [null, "Rock", "Paper", "Scissors"][code];
}

function makeChoice(userChoice) {
  historyChoice.push([roundCount, encodeChoice(userChoice)]);
  if (roundCount > 2) {
    setHistoryPick();
    setPattern(userChoice);
  }
  roundCount++;

  botChoice = (roundCount <= 1)
    ? choices[Math.floor(Math.random() * 3)]
    : setBotChoice(rockCount, paperCount, scissorsCount);

  const status = determineWinner(userChoice, botChoice);
  if (status === "Win") userScore++;
  else if (status === "Lose") botScore++;

  if (userChoice === "Rock") rockCount++;
  else if (userChoice === "Paper") paperCount++;
  else if (userChoice === "Scissors") scissorsCount++;

  updateDisplay(userChoice, status);
}

function updateDisplay(userChoice, status) {
  document.getElementById('user-msg').innerText = status + " Game";
  document.getElementById('bot-msg').innerText = status === "Draw" ? "Draw Game" : (status === "Win" ? "Lose Side" : "Win Side");
  document.getElementById('scoreboard').innerText = `${userScore} - ${botScore}`;

  document.querySelectorAll('.choice').forEach(img => img.classList.add('faded'));
  document.getElementById(userChoice.toLowerCase()).classList.remove('faded');

  const botImage = new Image();
  botImage.src = `${botChoice.toLowerCase()}.jpg`;
  botImage.alt = botChoice;
  document.getElementById('bot-choice').innerHTML = '';
  document.getElementById('bot-choice').appendChild(botImage);

  setTimeout(() => {
    // alert(`You ${status}! You chose ${userChoice} when the Bot picked ${botChoice}. Mode: ${mode}`);
    resetGame();
  }, 100);
}

function resetGame() {
  document.querySelectorAll('.choice').forEach(img => img.classList.remove('faded'));
  document.getElementById('bot-choice').innerHTML = '';
  document.getElementById('user-msg').innerText = "Set your pick";
  document.getElementById('bot-msg').innerText = "Bot is picking...";
}

function determineWinner(u, b) {
  if (u === b) return "Draw";
  if ((u === "Rock" && b === "Scissors") || (u === "Paper" && b === "Rock") || (u === "Scissors" && b === "Paper")) return "Win";
  return "Lose";
}

function setBotChoice(r, p, s) {
  if (roundCount < 10) return PopularChoice(r, p, s);

  if (strategyMode === "history2") {
    const lookup = { rr, rp, rs, pr, pp, ps, sr, sp, ss };
    if (!mode || !lookup[mode] || lookup[mode].length < 1) return PopularChoice(r, p, s);
    return getCounterMove(findMostFrequent(lookup[mode]));

  } else if (strategyMode === "full") {
    const predicted = predictFromFullHistory();
    return predicted ? getCounterMove(predicted) : PopularChoice(r, p, s);

  } else if (strategyMode === "tf") {
    const input = getTFInput();
    if (!input || !tfModel) return PopularChoice(r, p, s);
    const prediction = tf.tidy(() => tfModel.predict(tf.tensor2d([input])));
    const argMax = prediction.argMax(-1).dataSync()[0];
    return getCounterMove(choices[argMax]);
  }
}

function getTFInput() {
  if (historyChoice.length < 2) return null;
  const a = historyChoice[historyChoice.length - 2][1];
  const b = historyChoice[historyChoice.length - 1][1];
  return [a, b];
}

function predictFromFullHistory() {
  if (historyChoice.length < 3) return null;
  const currentPattern = historyChoice.slice(-2).map(([_, c]) => c).join("-");
  const patternMap = {};

  for (let i = 2; i < historyChoice.length; i++) {
    const key = `${historyChoice[i - 2][1]}-${historyChoice[i - 1][1]}`;
    const next = historyChoice[i][1];
    if (!patternMap[key]) patternMap[key] = [];
    patternMap[key].push(next);
  }
  return patternMap[currentPattern] ? decodeChoice(findMostFrequent(patternMap[currentPattern])) : null;
}

function setHistoryPick() {
  const find = (r) => historyChoice.find(([round]) => round === r)?.[1] ?? "";
  firstPick = decodeChoice(find(roundCount - 2));
  secondPick = decodeChoice(find(roundCount - 1));
}

function setPattern(userChoice) {
  const patternKey = (firstPick[0] + secondPick[0]).toLowerCase();
  const patternMap = {
    rr, rp, rs,
    pr, pp, ps,
    sr, sp, ss
  };
  if (patternMap[patternKey]) {
    patternMap[patternKey].push(userChoice);
    mode = patternKey;
  }
}

function PopularChoice(r, p, s) {
  const max = Math.max(r, p, s);
  if (r === max) return "Paper";
  if (p === max) return "Scissors";
  if (s === max) return "Rock";
  return choices[Math.floor(Math.random() * 3)];
}

function getCounterMove(move) {
  return { "Rock": "Paper", "Paper": "Scissors", "Scissors": "Rock" }[move];
}

function findMostFrequent(arr) {
  const freq = arr.reduce((acc, val) => (acc[val] = (acc[val] || 0) + 1, acc), {});
  return Object.keys(freq).reduce((a, b) => freq[a] > freq[b] ? a : b);
}
