const choices = ["Rock", "Paper", "Scissors"];
let user_msg = "Set your pick"
let bot_msg = "Bot is picking..."

// Scoreboard
let userScore = 0;
let botScore = 0;

// Track user's tendency
let rockCount = 0;
let paperCount = 0;
let scissorsCount = 0;

// Track the number of round has been processed
let roundCount = 1;

// Execute botChoice
let botChoice = ""; 

// Update Scoreboard
function updateScoreboard() {
    document.getElementById('scoreboard').innerText = `${userScore} - ${botScore}`;
}

// History of choices
let historyChoice = [];

// Set the nearest 2 userChoices
let firstPick = "";
let secondPick = "";

// Set the pattern arrays to predict the next move from the last 2 moves of from user
let rr = []; let rp = []; let rs = []; 
let pp = []; let pr = []; let ps = [];
let ss = []; let sr = []; let sp = [];

// Set mode on types of pattern
let mode = "";

// Uncomment and adjust these to train model on long term using localStorage
// Load the historyChoice from localStorage
//if (localStorage.getItem("historyChoice")) {
//    historyChoice = JSON.parse(localStorage.getItem("historyChoice"));
//}
// Clear historyChoice on page load
//window.onload = function() {
//    historyChoice = [];
//    localStorage.setItem("historyChoice", JSON.stringify(historyChoice));
//}

// Set the choice and perform backend
function makeChoice(userChoice) {
    // Save the choice to history and localStorage
    historyChoice.push([roundCount, userChoice]);
    //localStorage.setItem("historyChoice", JSON.stringify(historyChoice));

    // Start to set history of pick and append pattern to array
    if (roundCount > 2) {
        setHistoryPick();
        setPattern(userChoice);
    }

    roundCount++;
    // Set botChoice 
    // Case beginning
    if (roundCount <= 1) {
        botChoice = choices[Math.floor(Math.random() * choices.length)];
    }
    else {
        botChoice = setBotChoice(rockCount, paperCount, scissorsCount);
    }
    
    // Set game status
    let status = determineWinner(userChoice, botChoice);

    // Send customised message per game status as h1 header
    switch (status) {
        case "Draw":
            user_msg = "Draw Game";
            bot_msg = "Draw Game";
            break;
        case "Win":
            user_msg = "Win Side";
            bot_msg = "Lose Side";
            userScore++;
            break;
        case "Lose":
            user_msg = "Lose Side";
            bot_msg = "Win Side";
            botScore++;
            break;
    }

    // Increment per user choice
    switch (userChoice) {
        case "Rock":
            rockCount++;
            break;
        case "Paper":
            paperCount++;
            break;
        case "Scissors":
            scissorsCount++;
            break;
    }

    updateScoreboard();

    // Set customised msg per round
    document.getElementById('user-msg').innerText = user_msg;
    document.getElementById('bot-msg').innerText = bot_msg;

    // Set opacity (dark fallback) for images not in pick
    document.querySelectorAll('.choice').forEach(img => img.classList.add('faded'));
    document.getElementById(userChoice.toLowerCase()).classList.remove('faded');

    //console.log(botChoice)
    // Set the display image for the bot
    let botImage = document.createElement('img');
    botImage.src = botChoice.toLowerCase() + '.jpg';
    botImage.alt = botChoice;

    document.getElementById('bot-choice').innerHTML = '';
    document.getElementById('bot-choice').appendChild(botImage);
    
    // Send alert message with tracking for reset
    setTimeout(() => {
        alert(`You ${status}! You chose ${userChoice} when the Bot picked ${botChoice}. Mode: ${mode}.`);
        //alert(`You ${status}! You chose ${userChoice} when the Bot picked ${botChoice}.`);
        resetGame();
    }, 100);
}

// Decide winner status
function determineWinner(userChoice, botChoice) {
    if (userChoice === botChoice) {
        return "Draw";
    } else if (
        (userChoice === "Rock" && botChoice === "Scissors") ||
        (userChoice === "Paper" && botChoice === "Rock") ||
        (userChoice === "Scissors" && botChoice === "Paper")
    ) {
        return "Win";
    } else {
        return "Lose";
    }
}

// Method set botChoice based on the probability of userChoice 
function setBotChoice(rockCount, paperCount, scissorsCount) {
    // For the first 10 moves, as data training is not completed to predict next move, we use the method to execute pick based on the most popular pick
    if (roundCount > 1 && roundCount < 10) {
        let result = PopularChoice(rockCount, paperCount, scissorsCount);
        return result;
    }
    // For the next 10 moves, we use the method to execute pick based on learning model prediction, if learning model has not satisfy, we would still use the same method to execute pick based on the most popular pick
    else {
        let result;
        switch (mode) {
            // Rock list
            case "rr":
                if (rr.length < 1) { result = PopularChoice(rockCount, paperCount, scissorsCount); }
                else { result = getCounterMove(findMostFrequent(rr)); }
                break;
            case "rp":
                if (rp.length < 1) { result = PopularChoice(rockCount, paperCount, scissorsCount); }
                else { result = getCounterMove(findMostFrequent(rp)); }
                break;
            case "rs":
                if (rs.length < 1) { result = PopularChoice(rockCount, paperCount, scissorsCount); }
                else { result = getCounterMove(findMostFrequent(rs)); }
                break;
            // Paper list
            case "pr":
                if (pr.length < 1) { result = PopularChoice(rockCount, paperCount, scissorsCount); }
                else { result = getCounterMove(findMostFrequent(pr)); }
                break;
            case "pp":
                if (pp.length < 1) { result = PopularChoice(rockCount, paperCount, scissorsCount); }
                else { result = getCounterMove(findMostFrequent(pp)); }
                break;
            case "ps":
                if (ps.length < 1) { result = PopularChoice(rockCount, paperCount, scissorsCount); }
                else { result = getCounterMove(findMostFrequent(ps)); }
                break;
            // Scissors list
            case "sr":
                if (sr.length < 1) { result = PopularChoice(rockCount, paperCount, scissorsCount); }
                else { result = getCounterMove(findMostFrequent(sr)); }
                break;
            case "sp":
                if (sp.length < 1) { result = PopularChoice(rockCount, paperCount, scissorsCount); }
                else { result = getCounterMove(findMostFrequent(sp)); }
                break;
            case "ss":
                if (ss.length < 1) { result = PopularChoice(rockCount, paperCount, scissorsCount); }
                else { result = getCounterMove(findMostFrequent(ss)); }
                break;
        }
        return result;
    }
}

// Refresh game to new round
function resetGame() {
    document.querySelectorAll('.choice').forEach(img => img.classList.remove('faded'));
    document.getElementById('bot-choice').innerHTML = '';
    document.getElementById('user-msg').innerText = "Set your pick";
    document.getElementById('bot-msg').innerText = "Bot is picking...";
}

// Set the history pick arrays
function setHistoryPick() {  
    // filtrate pick
    let firstPickRound = roundCount - 2;
    let secondPickRound = roundCount - 1;

    for (let i = 0; i < historyChoice.length; i++) {
        if (historyChoice[i][0] === firstPickRound) {
            firstPick = historyChoice[i][1];
        }
        if (historyChoice[i][0] === secondPickRound) {
            secondPick = historyChoice[i][1];
        }
    }
}

// Set the pattern for next move decision.
function setPattern(userChoice) {
    switch (firstPick) {
        case "Rock":
            if (secondPick === "Rock") { rr.push(userChoice); mode = "rr"; }
            if (secondPick === "Paper") { rp.push(userChoice); mode = "rp"; }
            if (secondPick === "Scissors") { rs.push(userChoice); mode = "rs"; }
            break;
        case "Paper":
            if (secondPick === "Rock") { pr.push(userChoice); mode = "pr"; }
            if (secondPick === "Paper") { pp.push(userChoice); mode = "pp"; }
            if (secondPick === "Scissors") { ps.push(userChoice); mode = "ps"; }
            break;
        case "Scissors":
            if (secondPick === "Rock") { sr.push(userChoice); mode = "sr"; }
            if (secondPick === "Paper") { sp.push(userChoice); mode = "sp"; }
            if (secondPick === "Scissors") { ss.push(userChoice); mode = "ss"; }
            break;
    }
    console.log(`Round: (${roundCount})`)
    console.log(`RR: (${rr}), RP: (${rp}), RS: (${rs})`);
    console.log(`PR: (${pr}), PP: (${pp}), PS: (${ps})`);
    console.log(`SR: (${sr}), SP: (${sp}), SS: (${ss})`);
}

// set botChoice based on user's most popular pick
function PopularChoice(rockCount, paperCount, scissorsCount){
        // Case a dominant userChoice
        if (rockCount > paperCount && rockCount > scissorsCount) {
            return "Paper";
        }
        else if (paperCount > rockCount && paperCount > scissorsCount) {
            return "Scissors";
        }
        else if (scissorsCount > rockCount && scissorsCount > paperCount) {
            return "Rock";
        }
        // Case 2 equal userChoice
        else if (rockCount > paperCount && scissorsCount > paperCount && rockCount === scissorsCount) {
            return ["Paper", "Rock"][Math.floor(Math.random() * 2)];
        }
        else if (rockCount > scissorsCount && paperCount > scissorsCount && rockCount === paperCount) {
            return ["Paper", "Scissors"][Math.floor(Math.random() * 2)];
        }
        else if (paperCount > rockCount && scissorsCount > rockCount && paperCount === scissorsCount) {
            return ["Scissors", "Rock"][Math.floor(Math.random() * 2)];
        }
        // Case equal
        else {
            return choices[Math.floor(Math.random() * choices.length)];
        }
}

// Function to find the most frequent element in an array
function findMostFrequent(arr) {
    const frequency = {};
    let maxFreq = 0;
    let mostFrequentElement = null;

    for (let item of arr) {
        frequency[item] = (frequency[item] || 0) + 1;
        if (frequency[item] > maxFreq) {
            maxFreq = frequency[item];
            mostFrequentElement = item;
        }
    }
    return mostFrequentElement;
}

// Function to determine the counter move
function getCounterMove(move) {
    switch (move) {
        case "Rock":
            return "Paper";
        case "Paper":
            return "Scissors";
        case "Scissors":
            return "Rock";
    }
}