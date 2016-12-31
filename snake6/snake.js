/*jshint esversion: 6 */
const Direction = {
	LEFT: 0,
	RIGT: 1,
	TOP: 2,
	BOTTOM: 3
};

const State = {
	PASSIVE: 1,
	SNAKE_HEAD: 2,
	SNAKE_BODY: 3,
	FOOD: 4
};

class Model {

	constructor(width, height) {
		this.width = width;
		this.height = height;
		this.array = [
			[]
		];
		this.prevX = 0;
		this.prevY = 0;

		for (let i = 0; i < width; i++) {
			this.array[i] = [];
			for (let j = 0; j < height; j++) {
				this.array[i][j] = new Cell(i, j);
			}
		}
	}

	loose() {
		if (typeof this.onloose == "function") {
			this.onloose();
		}
	}

	reset() {
		if (this.snake === undefined) {
			return;
		}

		for (let i = 0; i < this.width; i++) {
			for (let j = 0; j < this.height; j++) {
				if (this.array[i][j].state == State.FOOD) {
					continue;
				}
				this.array[i][j].state = State.PASSIVE;
			}
		}
	}

	onchange(callback) {
		this.reset();
		this.array[this.snake.head.x][this.snake.head.y].state = State.SNAKE_HEAD;

		for (let p = 0; p < this.snake.parts.length; p++) {
			let part = this.snake.parts[p];
			let tempX = part.x;
			let tempY = part.y;
			part.x = this.prevX;
			part.y = this.prevY;

			this.array[part.x][part.y].state = State.SNAKE_BODY;

			this.prevX = tempX;
			this.prevY = tempY;
		}

		if (this.callback) {
			this.callback();
		}
	}

	setSnake(snake) {
		this.snake = snake;
		this.prevX = snake.head.x - 1;
		this.prevY = snake.head.y;
		this.onchange();
	}

	setOnchange(callback) {
		this.callback = callback;
	}

	generateFood() {
		let randX = Math.floor(Math.random() * this.width);
		let randY = Math.floor(Math.random() * this.height);
		if (this.array[randX][randY].state == State.SNAKE_BODY ||
			this.array[randX][randY].state == State.SNAKE_HEAD) {
			this.generateFood();
		} else {
			this.array[randX][randY].state = State.FOOD;
		}
	}

	getNextCell() {
		let nextX;
		let nextY;
		let curSnakeDirection = this.snake.nextDirection;
		let snakeHead = this.snake.head;

		if (curSnakeDirection == Direction.RIGT) {
			nextX = snakeHead.x + 1;
			nextY = snakeHead.y;
		} else if (curSnakeDirection == Direction.LEFT) {
			nextX = snakeHead.x - 1;
			nextY = snakeHead.y;
		} else if (curSnakeDirection == Direction.TOP) {
			nextX = snakeHead.x;
			nextY = snakeHead.y - 1;
		} else if (curSnakeDirection == Direction.BOTTOM) {
			nextX = snakeHead.x;
			nextY = snakeHead.y + 1;
		}

		return new Cell(nextX, nextY);
	}

	checkConditions(cell) {
		if (cell.x > this.width - 1 || cell.x < 0 ||
			cell.y > this.height - 1 || cell.y < 0) {
			this.loose();
			return true;
		}

		if (this.array[cell.x][cell.y].state == State.SNAKE_BODY) {
			this.loose();
			return true;
		}
	}

	foodEated() {
		if (typeof this.onfoodeated == "function") {
			this.onfoodeated();
		}
	}

	next() {
		let snakeHead = this.snake.head;
		let cell = this.getNextCell();
		this.snake.direction = this.snake.nextDirection;

		if (this.checkConditions(cell)) {
			return;
		}

		if (this.array[cell.x][cell.y].state == State.FOOD) {
			let newHead = new Part(cell.x, cell.y);
			this.snake.parts.push(this.snake.head);
			this.snake.head = newHead;
			this.array[cell.x][cell.y].state = State.SNAKE_HEAD;
			this.foodEated();
			this.generateFood();
		}

		this.prevX = snakeHead.x;
		this.prevY = snakeHead.y;

		snakeHead.x = cell.x;
		snakeHead.y = cell.y;

		this.onchange();
	}

}

class Cell {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.state = State.PASSIVE;
	}
}

class Part {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

class Scene {
	constructor(model, elemet) {
		this.domArray = [
			[]
		];
		this.closeDialog = document.getElementById("gameFinishDialog");
		this.model = model;

		for (let i = 0; i < this.model.width; i++) {
			this.domArray[i] = [];
			for (let j = 0; j < this.model.height; j++) {
				let cellElement = document.createElement("div");
				this.domArray[i][j] = cellElement;
				cellElement.classList.add("cell");
				elemet.appendChild(cellElement);
				if (j == this.model.width - 1) {
					cellElement.classList.add("rightColumn");
				}
			}
		}

		model.setOnchange(() => {
			this.redraw();
		});
	}

	redraw() {
		for (let i = 0; i < this.model.width; i++) {
			for (let j = 0; j < this.model.height; j++) {

				let element = this.domArray[i][j];
				let cell = this.model.array[j][i];

				element.classList.remove("head");
				element.classList.remove("body");
				element.classList.remove("food");

				if (cell.state == State.PASSIVE) {

				} else if (cell.state == State.SNAKE_BODY) {
					element.classList.add("body");
				} else if (cell.state == State.SNAKE_HEAD) {
					element.classList.add("head");
				} else {
					element.classList.add("food");
				}
			}
		}
	}

	looseAnimation() {
		for (let i = 0; i < this.model.width; i++) {
			for (let j = 0; j < this.model.height; j++) {
				let element = this.domArray[i][j];
				element.classList.remove("head");
				element.classList.remove("body");
				element.classList.remove("food");
			}
		}
	}

	showRestartMessage() {
		this.closeDialog.classList.remove("dialogHidden");
	}

	hideRestartMessage() {
		this.closeDialog.classList.add("dialogHidden");
	}

}

class Snake {
	constructor(x, y) {
		this.head = new Part(x, y);
		this.parts = [];
		this.direction = Direction.RIGT;
		this.nextDirection = Direction.RIGT;
		this.parts.push(new Part(x - 2, y));
		this.parts.push(new Part(x - 3, y));
		this.parts.push(new Part(x - 4, y));
		this.parts.push(new Part(x - 5, y));

	}

	setDirection(direction) {
		if ((this.direction == Direction.TOP && direction == Direction.BOTTOM) ||
			(this.direction == Direction.BOTTOM && direction == Direction.TOP) ||
			(this.direction == Direction.LEFT && direction == Direction.RIGT) ||
			(this.direction == Direction.RIGT && direction == Direction.LEFT)) {
			return;
		}

		this.nextDirection = direction;
	}
}

class KeyBoardController {
	constructor(model) {
		this.model = model;
		window.addEventListener("keyup", (e) => {
			this.model.snake.setDirection(this.getDirection(e.keyCode));
		});
	}

	getDirection(keycode) {
		switch (keycode) {
			case 38:
				return Direction.TOP;
			case 40:
				return Direction.BOTTOM;
			case 37:
				return Direction.LEFT;
			case 39:
				return Direction.RIGT;
			default:
				return Direction.RIGT;
		}
	}
}

class ScoreController {
	constructor(model, elementScore, elementLevel) {
		this.model = model;
		this.elementScore = elementScore;
		this.elementLevel = elementLevel;
		this.score = 0;
		this.level = 1;

		model.onfoodeated = () => {
			this.score++;
			this.updateLevel();
			this.elementScore.innerHTML = this.score;
		};
	}

	updateLevel() {
		if (this.score % 5 == 0) {
			this.level++;
			this.elementLevel.innerHTML = this.level;
			if (typeof this.onlevelchange == 'function') {
				this.onlevelchange();
			}
		}
	}

	reset() {
		this.score = 0;
		this.level = 1;
		this.elementScore.innerHTML = 0;
		this.elementLevel.innerHTML = 1;
	}
}


class GamePlayController {
	constructor() {
		this.stop = false;
		this.interval = 300;
		this.model = new Model(20, 20);
		this.scene = new Scene(this.model,
			document.getElementById("gameContaner"));
		this.snake = new Snake(10, 10);
		this.keyBoardController = new KeyBoardController(this.model);
		this.scoreController = new ScoreController(this.model,
			document.getElementById("scoreContainer"),
			document.getElementById("levelContainer"));
		this.model.setSnake(this.snake);
		this.model.generateFood();

		this.model.onloose = () => {
			this.stop = true;
			clearInterval(this.timer);
			this.scene.looseAnimation();
			this.scene.showRestartMessage();
		};

		this.scoreController.onlevelchange = () => {
			this.interval -= 10
		};

		document.getElementById("restartButton").addEventListener("click",
			() => {
				this.scene.hideRestartMessage();
				this.reset();
				this.start();
			});
	}

	reset() {
		this.stop = false;
		this.interval = 300;
		this.model.reset();
		this.snake = new Snake(10, 10);
		this.model.setSnake(this.snake);
		this.scoreController.reset();
	}

	nextStep() {
		if (!this.stop) {
			setTimeout(() => {
				this.model.next();
				this.nextStep();
			}, this.interval);
		}
	}

	start() {
		this.nextStep();
	}
}