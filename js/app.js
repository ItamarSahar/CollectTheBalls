var WALL = 'WALL'
var FLOOR = 'FLOOR'
var BALL = 'BALL'
var GAMER = 'GAMER'
var GLUE = 'GLUE'
var audio = new Audio('sound/sound.mp3')
var GAMER_IMG = '<img src="img/gamer.png" />'
var GAMERGLUE_IMG = '<img src="img/gamer-purple.png" />'
var BALL_IMG = '<img src="img/ball.png" />'
var GLUE_IMG = '<img src="img/glue.png" />'

var gGameState = {
	gAddBallIntervalId: 0,
	gAddGlueIntervalId: 0,
	gBallScore: 0,
	gNumOfBallsLeft: 2,
	gIsPlayerGlue: false,
}
var gBoard
var gGamerPos

function initGame() {
	gGamerPos = { i: 2, j: 9 }
	gBoard = buildBoard()
	renderBoard(gBoard)
	renderScore()
	gGameState.gAddBallIntervalId = setInterval(addElemnet, 4000, BALL, BALL_IMG)
	gGameState.gAddGlueIntervalId = setInterval(addElemnet, 5000, GLUE, GLUE_IMG)
}

function buildBoard() {
	// Create the Matrix
	var board = createMat(10, 12)

	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR in a regular cell
			var cell = { type: FLOOR, gameElement: null }

			// Place Walls at edges
			if (
				i === 0 ||
				i === board.length - 1 ||
				j === 0 ||
				j === board[0].length - 1
			) {
				cell.type = WALL
			}

			// Add created cell to The game board
			board[i][j] = cell
		}
	}

	// Place the gamer at selected position
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER

	board[0][Math.floor(board[0].length / 2)].type = FLOOR
	board[Math.floor(board[0].length / 2)][0].type = FLOOR
	board[Math.floor(board.length - 1)][Math.floor(board[0].length / 2)].type =
		FLOOR
	board[Math.floor(board[0].length / 2)][Math.floor(board[0].length - 1)].type =
		FLOOR

	// Place the Balls (currently randomly chosen positions)
	board[3][8].gameElement = BALL
	board[7][4].gameElement = BALL

	// console.log(board)
	return board
}

// Render the board to an HTML table
function renderBoard(board) {                       
	var strHTML = ''
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n'
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j]

			var cellClass = getClassName({ i, j })

			// TODO - change to short if statement
			// if (currCell.type === FLOOR) cellClass += ' floor';
			// else if (currCell.type === WALL) cellClass += ' wall';
			cellClass += currCell.type === FLOOR ? ' floor' : ' wall'

			//TODO - Change To template string
			strHTML +=
				'\t<td class="cell ' +
				cellClass +
				'"  onclick="moveTo(' +
				i +
				',' +
				j +
				')" >\n'

			// TODO - change to switch case statement
			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG
			}

			strHTML += '\t</td>\n'
		}
		strHTML += '</tr>\n'
	}

	// console.log('strHTML is:')
	// console.log(strHTML)
	var elBoard = document.querySelector('.board')
	elBoard.innerHTML = strHTML
}

// Move the player to a specific location
function moveTo(i, j) {
	var targetCell = gBoard[i][j]
	if (targetCell.type === WALL) return

	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i)
	var jAbsDiff = Math.abs(j - gGamerPos.j)

	// If the clicked Cell is one of the four allowed
	if (
		(iAbsDiff === 1 && jAbsDiff === 0) ||
		(jAbsDiff === 1 && iAbsDiff === 0)
	) {
		//the condition to stop the palyer to move to 3 sec
		if (!gGameState.gIsPlayerGlue) {
			if (targetCell.gameElement === BALL) {
				console.log('Collecting!')
				gGameState.gNumOfBallsLeft--
				gGameState.gBallScore++
				// audio.play()
				renderScore()
				checkVictory()
			} //colecting a ball
			if (targetCell.gameElement === GLUE) {
				 GAMER_IMG ='<img src="img/gamer-purple.png" />'
				glueModal()
				gGameState.gIsPlayerGlue = true
				setTimeout(function () {
					gGameState.gIsPlayerGlue = false
					GAMER_IMG = '<img src="img/gamer.png" />'
					closeGlueModal()
				}, 3000)
			} //the passes in the wall
			if (i === 0 && j === Math.floor(gBoard[0].length / 2))
				i = Math.floor(gBoard.length - 1)
			else if (
				i === Math.floor(gBoard.length - 1) &&
				j === Math.floor(gBoard[0].length / 2)
			)
				i = 0
			else if (i === Math.floor(gBoard[0].length / 2) && j === 0)
				j = Math.floor(gBoard[0].length - 1)
			else if (
				i === Math.floor(gBoard[0].length / 2) &&
				j === Math.floor(gBoard[0].length - 1)
			)
				j = 0

			// MOVING from current position
			// Model:
			gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
			// Dom:
			renderCell(gGamerPos, '')

			// MOVING to selected position
			// Model:
			gGamerPos.i = i
			gGamerPos.j = j
			gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER
			// DOM:
			renderCell(gGamerPos, GAMER_IMG)
		}
	} // else console.log('TOO FAR', iAbsDiff, jAbsDiff);
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector)
	elCell.innerHTML = value
}

// Move the player by keyboard arrows
function handleKey(event) {
	var i = gGamerPos.i
	var j = gGamerPos.j

	switch (event.key) {
		case 'ArrowLeft':
			moveTo(i, j - 1)
			break
		case 'ArrowRight':
			moveTo(i, j + 1)
			break
		case 'ArrowUp':
			moveTo(i - 1, j)
			break
		case 'ArrowDown':
			moveTo(i + 1, j)
			break
	}
}

// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j
	return cellClass
}

function addElemnet(value, IMG) {
	var emptyCells = []
	for (var i = 0; i < gBoard.length; i++) {
		var currRow = gBoard[i]
		for (var j = 0; j < gBoard[0].length; j++) {
			var currCell = currRow[j]

			if (currCell.gameElement === null && currCell.type === FLOOR) {
				emptyCells.push({ i, j })
			}
		}
	}
	var randomEmptyCell = emptyCells[getRandomInt(0, emptyCells.length)]

	// change the model
	gBoard[randomEmptyCell.i][randomEmptyCell.j].gameElement = value
	if (value === BALL) gGameState.gNumOfBallsLeft++

	// change the DOM
	renderScore()
	renderCell(randomEmptyCell, IMG)
	if (value === GLUE) {
		setTimeout(function () {
			if(gBoard[pos.i][pos.j].gameElement !== GLUE )
			gBoard[randomEmptyCell.i][randomEmptyCell.j].gameElement = null
			renderCell(randomEmptyCell, '')
		}, 3000)
	}
}

function renderScore() {
	var elScore = document.querySelector('.score')
	strHTML = `You'v collect:${gGameState.gBallScore} Balls , and ${gGameState.gNumOfBallsLeft} have left `
	elScore.innerHTML = strHTML
}

function checkVictory() {
	var elModal = document.querySelector('.modal')
	var elScore = document.querySelector('.score')
	var elBoard = document.querySelector('.board')
	if (gGameState.gNumOfBallsLeft === 0) {
		elModal.style.display = 'block'
		elScore.style.display = 'none'
		elBoard.style.display = 'none'
		clearInterval(gGameState.gAddBallIntervalId)
		clearInterval(gGameState.gAddGlueIntervalId)
	}
}

function closeModal() {
	var elModal = document.querySelector('.modal')
	var elScore = document.querySelector('.score')
	var elBoard = document.querySelector('.board')
	elModal.style.display = 'none'
	elScore.style.display = 'block'
	elBoard.style.display = 'block'
}

function restartGame() {
	closeModal()
	gGameState = {
		gAddBallIntervalId: 0,
		gBallScore: 0,
		gNumOfBallsLeft: 2,
	}
	initGame()
}

function glueModal(elModal) {
	var elModal = document.querySelector('.glueModal')
	elModal.style.display = 'block'
}
function closeGlueModal() {
	var elModal = document.querySelector('.glueModal')
	elModal.style.display = 'none'
}
