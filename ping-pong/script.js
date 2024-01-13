// Canvas
const { body } = document;
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
const width = 500;
const height = 700;
const screenWidth = window.screen.width;
const canvaPosition = screenWidth / 2 - width / 2;
const isMobile = window.matchMedia('(max-width: 600px)');
const gameOverEl = document.createElement('div');

// paddle
const paddleHeight = 10;
const paddleWidth = 50;
const paddleDiff = 25;
let paddleBottomX = 225;
let paddleTopX = 225;
let playerMoved = false;
let paddleContact = false;

// ball
let ballX = 250;
let ballY = 350;
const ballRadius = 5;

// speed
let speedY;
let speedX;
let trajectoryX;
let computerSpeed;

// change mobile setting
if (isMobile.matches) {
    speedY = -2;
    speedX = speedY;
    computerSpeed = 4;
} else {
    speedY = -1;
    speedX = speedY;
    computerSpeed = 10;
}

// score
let computerScore = 0;
let playerScore = 0;
const winningScore = 7;
let isGameOver = true;
let isNewGame = true;

// render everything on canvas
function renderCanvas() {
    // canvas background
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    // paddle color 
    context.fillStyle = 'white';

    //player paddle BOTTOM
    context.fillRect(paddleBottomX, height - 20, paddleWidth, paddleHeight);
    //player paddle TOP
    context.fillRect(paddleTopX, 10, paddleWidth, paddleHeight);

    // dashed center line
    context.beginPath();
    context.setLineDash([4]);
    context.moveTo(0, 350);
    context.lineTo(500, 350);
    context.strokeStyle = 'lightgrey';
    context.stroke();

    // ball
    context.beginPath();
    context.arc(ballX, ballY, ballRadius, 2 * Math.PI, false);
    context.fillStyle = 'White';
    context.fill();

    // score
    context.font = '32px Courier New';
    context.fillText(playerScore, 20, canvas.height / 2 + 50);
    context.fillText(computerScore, 20, canvas.height / 2 - 30);
}

//create canvas element
function createCanvas() {
    canvas.width = width;
    canvas.height = height;
    body.appendChild(canvas);
    renderCanvas()
}

//reset ball to center
function ballReset() {
    ballX = width / 2;
    ballY = height / 2;
    speedY = - 3;
    paddleContact = false;
}

// adjust ball movement
function ballMove() {
    //vertical speed
    ballY += -speedY;

    //horizontal speed
    if (playerMoved && paddleContact) {
        ballX += speedX;
    }
}

// determine what ball bounces off, score points, resetball
function ballBoundaries() {
    //bounce on left wall
    if (ballX < 0 && speedX < 0) {
        speedX = -speedX;
    }

    //bounce on right wall
    if (ballX > width && speedX > 0) {
        speedX = -speedX;
    }

    //bounce off player paddle (bottom)
    if (ballY > height - paddleDiff) {
        if (ballX > paddleBottomX && ballX < paddleBottomX + paddleWidth) {
            paddleContact = true;
            //add speed on it
            if (playerMoved) {
                speedY -= 1;
                //max speed
                if (speedY < -5) {
                    speedY = -5;
                    computerSpeed = 6;
                }
            }
            speedY = -speedY;
            trajectoryX = ballX - (paddleBottomX + paddleDiff);
            speedX = trajectoryX * 1;
        } else if (ballY > height) {
            // reset ball, add to computer score
            ballReset()
            computerScore++;
        }
    }
    //bounce off computer paddle (top)
    if (ballY < paddleDiff) {
        if (ballX > paddleTopX && ballX < paddleTopX + paddleWidth) {
            //add speed on hit
            if (playerMoved) {
                speedY += 5;
                //max speed
                if (speedY > 5) {
                    speedY = 5;
                }
            }
            speedY = -speedY;
        } else if (ballY < 0) {
            // reset ball, add to player score
            ballReset()
            playerScore++;
        }
    }
}

// computer movement
function computerAI() {
    if (playerMoved) {
        if (paddleTopX + paddleDiff < ballX) {
            paddleTopX += computerSpeed;
        } else {
            paddleTopX -= computerSpeed;
        }
    }
}

function showGameOverEl(winner) {
    // hide canvas
    canvas.hidden = true;
    //containers
    gameOverEl.textContent = '';
    gameOverEl.classList.add('game-over-container');
    //title
    const title = document.createElement('h1');
    title.textContent = `${winner} Wins!`
    //button
    const playAgainBtn = document.createElement('button');
    playAgainBtn.setAttribute('onClick', 'startGame()');
    playAgainBtn.textContent = 'Play Again';
    //append
    gameOverEl.append(title, playAgainBtn);
    body.appendChild(gameOverEl);
}

//check if one player has winning score, if they do, end game
function gameOver() {
    if (playerScore === winningScore || computerScore === winningScore) {
        isGameOver = true;
        // set winner
        const winner = playerScore === winningScore ? 'Player 1' : 'Computer';
        showGameOverEl(winner);
    }
}

// called every framed
function animate() {
    renderCanvas();
    ballMove();
    ballBoundaries();
    computerAI();
    gameOver();
    if (!isGameOver) {
        window.requestAnimationFrame(animate);
    }
}

// start game, reset everything
function startGame() {
    if (isGameOver && !isNewGame) {
        body.removeChild(gameOverEl);
        canvas.hidden= false;
    }
    isGameOver = false;
    isNewGame = false;
    playerScore = 0;
    computerScore = 0;
    ballReset();
    createCanvas();
    animate();
    canvas.addEventListener('mousemove', (e) => {
        playerMoved = true;
        // compensate for canvas being centered
        paddleBottomX = e.clientX - canvaPosition - paddleDiff;
        if (paddleBottomX < paddleDiff) {
            paddleBottomX = 0;
        }
        if (paddleBottomX > width - paddleWidth) {
            paddleBottomX = width - paddleWidth;
        }
        //hide cursor
        canvas.style.cursor = 'none';
    });
}

// on load
startGame();