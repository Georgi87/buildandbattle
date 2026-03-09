const cardsContainer = document.getElementById('cards');
const die1 = document.getElementById('die1');
const die2 = document.getElementById('die2');
const rollBtn = document.getElementById('rollBtn');
const message = document.getElementById('message');
const player1Hand = document.getElementById('player1').querySelector('.hand');
const player2Hand = document.getElementById('player2').querySelector('.hand');
const player1Score = document.getElementById('player1').querySelector('.score');
const player2Score = document.getElementById('player2').querySelector('.score');

let cards = [];
let player1Cards = [];
let player2Cards = [];
let currentSelector = null; // 1 or 2
let gameStarted = false;
let selectedCard = null;
let selectorRoll = null;
let opponentRoll = null;
let isOpponentRoll = false;
let p1Points = 0;
let p2Points = 0;

function startSecondPhase() {
	p1Points = 0;
	p2Points = 0;
	updatePoints();
	// Hide or disable first phase elements if needed
	playRound(1);
}

function playRound(round) {
	if (round > 6) {
		// End second phase
		if (p1Points > p2Points) {
			message.textContent = 'Player 1 wins the game with ' + p1Points + ' points vs ' + p2Points + '!';
		} else if (p2Points > p1Points) {
			message.textContent = 'Player 2 (Computer) wins the game with ' + p2Points + ' points vs ' + p1Points + '!';
		} else {
			message.textContent = 'The game is a tie with ' + p1Points + ' points each!';
		}
		rollBtn.textContent = 'Play Again';
		rollBtn.disabled = false;
		rollBtn.removeEventListener('click', handleRoll);
		rollBtn.addEventListener('click', resetGame);
		return;
	}
	message.textContent = 'Round ' + round + ': Select a card to play.';
	// Clear play cards
	document.querySelectorAll('.playCard').forEach(function(pc) { pc.textContent = ''; });
	// Enable p1 hand clicks
	const p1Cards = player1Hand.querySelectorAll('.player-card');
	p1Cards.forEach(function(card) {
		card.style.cursor = 'pointer';
		card.addEventListener('click', function() { selectPlayCard(card, 1, round); });
	});
}

function selectPlayCard(card, player, round) {
	const value = parseInt(card.textContent);
	// Remove from hand and array
	card.remove();
	const arrIndexP1 = player1Cards.indexOf(value);
	if (arrIndexP1 !== -1) {
		player1Cards.splice(arrIndexP1, 1);
	}
	// Place face down
	const playDiv = document.getElementById('p1Play').querySelector('.playCard');
	playDiv.textContent = '?'; // face down
	playDiv.dataset.value = value;
	message.textContent = 'Player 1 selected a card. Player 2 (Computer) is selecting...';
	// Computer selects
	setTimeout(function() {
		const p2Cards = player2Hand.querySelectorAll('.player-card');
		const randomIndex = Math.floor(Math.random() * p2Cards.length);
		const randomCard = p2Cards[randomIndex];
		const value2 = parseInt(randomCard.textContent);
		// Remove from DOM
		randomCard.remove();
		// Remove from player2Cards array
		const arrIndex = player2Cards.indexOf(value2);
		if (arrIndex !== -1) {
			player2Cards.splice(arrIndex, 1);
		}
		// Place face down for computer
		const p2PlayDiv = document.getElementById('p2Play').querySelector('.playCard');
		p2PlayDiv.textContent = '?';
		p2PlayDiv.dataset.value = value2;
		message.textContent = 'Both cards selected. Revealing...';
		// Reveal
		setTimeout(function() {
			playDiv.textContent = value;
			p2PlayDiv.textContent = value2;
			// Compare
			if (value > value2) {
				p1Points += 1;
				message.textContent = 'Player 1 wins the round with ' + value + ' vs ' + value2 + '!';
			} else if (value2 > value) {
				p2Points += 1;
				message.textContent = 'Player 2 (Computer) wins the round with ' + value2 + ' vs ' + value + '!';
			} else {
				// Tie: no points
				message.textContent = 'Tie! No points awarded.';
			}
			updatePoints();
			setTimeout(function() { playRound(round + 1); }, 3000);
		}, 1500);
	}, 1000);
}

function resetGame() {
	// Reset variables
	player1Cards = [];
	player2Cards = [];
	currentSelector = null;
	gameStarted = false;
	selectedCard = null;
	selectorRoll = null;
	opponentRoll = null;
	// Clear hands
	player1Hand.innerHTML = '';
	player2Hand.innerHTML = '';
	// Reset cards
	cards.forEach(function(c) {
		c.classList.remove('taken', 'selected');
		c.style.pointerEvents = 'none';
		c.style.cursor = 'default';
	});
	// Reset dice
	die1.textContent = '';
	die2.textContent = '';
	// Reset scores
	updateScores();
	// Reset button
	rollBtn.textContent = 'Roll Dice to Start';
	rollBtn.disabled = false;
	rollBtn.removeEventListener('click', resetGame);
	rollBtn.addEventListener('click', handleRoll);
	// Reset message
	message.textContent = '';
}

function computerTurn() {
	message.textContent = 'Player 2 (Computer) is rolling...';
	selectorRoll = rollDice();
	message.textContent = 'Player 2 (Computer) rolled ' + selectorRoll + '. Selecting card...';
	setTimeout(function() {
		// Computer selects card based on roll: if roll >=7, pick highest; else pick lowest
		const availableCards = cards.filter(function(c) { return !c.classList.contains('taken'); });
		let selected;
		if (selectorRoll >= 7) {
			// Pick highest
			selected = availableCards.reduce(function(prev, current) {
				return (parseInt(prev.dataset.value) > parseInt(current.dataset.value)) ? prev : current;
			});
		} else {
			// Pick lowest
			selected = availableCards.reduce(function(prev, current) {
				return (parseInt(prev.dataset.value) < parseInt(current.dataset.value)) ? prev : current;
			});
		}
		selectedCard = parseInt(selected.dataset.value);
		selected.classList.add('selected');
		cards.forEach(function(c) { c.style.pointerEvents = 'none'; });
		message.textContent = 'Player 2 (Computer) selected card ' + selectedCard + '. Player 1, roll the dice.';
		// Opponent is human, enable roll button
		isOpponentRoll = true;
		rollBtn.disabled = false;
		rollBtn.textContent = 'Roll Dice (Player 1)';
	}, 1000);
}

function initGame() {
	// Create cards 1-12
	for (let i = 1; i <= 12; i++) {
		const card = document.createElement('div');
		card.className = 'card';
		card.textContent = i;
		card.dataset.value = i;
		card.addEventListener('click', function() { selectCard(i); });
		cardsContainer.appendChild(card);
		cards.push(card);
	}
	cards.forEach(function(c) { c.style.pointerEvents = 'none'; });
	rollBtn.addEventListener('click', handleRoll);
}

function rollDice() {
	const d1 = Math.floor(Math.random() * 6) + 1;
	const d2 = Math.floor(Math.random() * 6) + 1;
	die1.textContent = d1;
	die2.textContent = d2;
	return d1 + d2;
}

function handleRoll() {
	rollBtn.textContent = 'Rolling...';
	if (!gameStarted) {
		// Determine starter
		message.textContent = 'Rolling for Player 1...';
		const p1Roll = rollDice();
		message.textContent = 'Player 1 rolled ' + p1Roll + '. Rolling for Player 2...';
		setTimeout(function() {
			const p2Roll = rollDice();
			message.textContent = 'Player 2 rolled ' + p2Roll + '. Determining starter...';
			setTimeout(function() {
				if (p1Roll > p2Roll) {
					currentSelector = 1;
					message.textContent = 'Player 1 starts!';
				} else if (p2Roll > p1Roll) {
					currentSelector = 2;
					message.textContent = 'Player 2 (Computer) starts!';
				} else {
					message.textContent = 'Tie! Rolling again...';
					setTimeout(function() { handleRoll(); }, 1000);
					return;
				}
				gameStarted = true;
				rollBtn.textContent = 'Roll Dice';
				if (currentSelector === 2) {
					// Computer starts
					setTimeout(function() { computerTurn(); }, 1000);
				} else {
					message.textContent += ' Player 1, roll the dice and select a card.';
				}
			}, 1000);
		}, 1000);
	} else if (isOpponentRoll) {
		// Opponent (human) rolls
		opponentRoll = rollDice();
		message.textContent = 'Player 1 rolled ' + opponentRoll + '.';
		rollBtn.disabled = true;
		setTimeout(function() {
			resolveCard();
		}, 1000);
	} else {
		// Human selector turn (player 1)
		selectorRoll = rollDice();
		message.textContent = 'Player 1 rolled ' + selectorRoll + '. Select a card.';
		rollBtn.disabled = true;
		// Enable card selection
		cards.forEach(function(card) {
			if (!card.classList.contains('taken')) {
				card.style.pointerEvents = 'auto';
				card.style.cursor = 'pointer';
			}
		});
	}
}

function selectCard(value) {
	if (!selectorRoll) return;
	selectedCard = value;
	const cardElement = cards.find(function(c) { return parseInt(c.dataset.value) === value; });
	cardElement.classList.add('selected');
	cards.forEach(function(c) { c.style.pointerEvents = 'none'; });
	message.textContent = 'Player 1 selected card ' + value + '. Player 2 (Computer), roll the dice.';
	// Opponent is computer, roll automatically
	setTimeout(function() {
		opponentRoll = rollDice();
		setTimeout(function() {
			resolveCard();
		}, 1000);
	}, 1000);
}

function resolveCard() {
	const winner = selectorRoll > opponentRoll ? currentSelector : (opponentRoll > selectorRoll ? (currentSelector === 1 ? 2 : 1) : null);
	if (!winner) {
		// Tie, reroll
		message.textContent = 'Tie! Rolling again...';
		selectorRoll = null;
		opponentRoll = null;
		selectedCard = null;
		isOpponentRoll = false;
		cards.forEach(function(c) {
			if (!c.classList.contains('taken')) {
				c.style.pointerEvents = 'auto';
				c.style.cursor = 'pointer';
			}
			c.classList.remove('selected');
		});
		if (currentSelector === 1) {
			rollBtn.disabled = false;
			rollBtn.textContent = 'Roll Dice';
		} else {
			// Computer rerolls
			setTimeout(function() { computerTurn(); }, 1000);
		}
		return;
	}
	// Give card to winner
	const cardElement = cards.find(function(c) { return parseInt(c.dataset.value) === selectedCard; });
	cardElement.classList.add('taken');
	cardElement.classList.remove('selected');
	const playerHand = winner === 1 ? player1Hand : player2Hand;
	const playerCards = winner === 1 ? player1Cards : player2Cards;
	playerCards.push(selectedCard);
	const playerCard = document.createElement('div');
	playerCard.className = 'player-card';
	playerCard.textContent = selectedCard;
	playerHand.appendChild(playerCard);
	updateScores();
	message.textContent = 'Player ' + winner + (winner === 2 ? ' (Computer)' : '') + ' gets card ' + selectedCard + '!';
	// Check if someone has 6 cards
	if (player1Cards.length === 6 || player2Cards.length === 6) {
		setTimeout(function() { endGame(); }, 1000);
		return;
	}
	// Switch selector
	currentSelector = currentSelector === 1 ? 2 : 1;
	// Reset
	selectorRoll = null;
	opponentRoll = null;
	selectedCard = null;
	isOpponentRoll = false;
	cards.forEach(function(c) {
		if (!c.classList.contains('taken')) {
			c.style.pointerEvents = 'auto';
			c.style.cursor = 'pointer';
		}
		c.classList.remove('selected');
	});
	if (currentSelector === 2) {
		// Computer's turn
		setTimeout(function() { computerTurn(); }, 1000);
	} else {
		rollBtn.disabled = false;
		rollBtn.textContent = 'Roll Dice';
		message.textContent += ' Player 1, roll the dice and select a card.';
	}
}

function updateScores() {
	player1Score.textContent = 'Cards: ' + player1Cards.length;
	player2Score.textContent = 'Cards: ' + player2Cards.length;
}

function updatePoints() {
	document.getElementById('p1Points').textContent = p1Points;
	document.getElementById('p2Points').textContent = p2Points;
}

function endGame() {
	// Give remaining cards to the other player
	const remainingCards = cards.filter(function(c) { return !c.classList.contains('taken'); }).map(function(c) { return parseInt(c.dataset.value); });
	let receiverHand, receiverCards;
	if (player1Cards.length === 6) {
		receiverCards = player2Cards;
		receiverHand = player2Hand;
	} else {
		receiverCards = player1Cards;
		receiverHand = player1Hand;
	}
	receiverCards.push(...remainingCards);
	remainingCards.forEach(function(val) {
		const card = document.createElement('div');
		card.className = 'player-card';
		card.textContent = val;
		receiverHand.appendChild(card);
	});
	// Ensure both have exactly 6 cards: if receiver has more, discard excess
	if (receiverCards.length > 6) {
		const excess = receiverCards.length - 6;
		for (let i = 0; i < excess; i++) {
			receiverCards.pop();
			const lastCard = receiverHand.lastElementChild;
			if (lastCard) receiverHand.removeChild(lastCard);
		}
	}
	updateScores();
	// Start second phase
	message.textContent = 'First phase complete! Starting second phase...';
	setTimeout(function() { startSecondPhase(); }, 2000);
}

initGame();
