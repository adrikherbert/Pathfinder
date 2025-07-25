var canvasSize = 1000;
var gridSize = 20;
var squareMargin = 6;
var pathDrawSpeed = 20; // Speed of path drawing in milliseconds
var algorithmSpeed = 10; // Speed of algorithm execution in milliseconds

const wait = (milliseconds) => new Promise((resolve, reject) => {
  setTimeout(_ => resolve(), milliseconds);
});

class Grid {  
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.gridSquares = [];

    this.hasSource = false;
    this.source = null;

    this.hasTarget = false;
    this.target = null;

    this.createGrid();
  }

  createGrid() {
    const squareCoordinateOffset = squareMargin;
    const squareSize = (canvasSize - squareMargin) / this.cols;
    let count = 0;

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const x = j * squareSize;
        const y = i * squareSize;
        const gridSquare = new GridSquare(x + squareCoordinateOffset, y + squareCoordinateOffset, i, j, count, squareSize - squareMargin, this);
        this.gridSquares.push(gridSquare);
        count++;
      }
    }
  }

  getSquareAt(i, j) {
    if (i < 0 || i >= this.rows || j < 0 || j >= this.cols) {
      return null;
    }
    return this.gridSquares[i * this.cols + j];
  }

  drawGrid() {
    for (let square of this.gridSquares) {
      square.display();
    }
  }
}

class GridSquare {
  constructor(x, y, i, j, id, size, grid) {
    this.x = x;
    this.y = y;
    this.i = i;
    this.j = j;
    this.id = id;
    this.size = size;
    this.grid = grid;

    this.isSource = false;
    this.isTarget = false;
    this.isVisited = false;
    this.isCurrent = false;
    this.isBlock = false;
    this.isFound = false;
    this.isPath = false;
  }

  current() {
    this.isCurrent = true;
    setTimeout(() => {
      this.isCurrent = false;
    }, 400);
  }

  found() {
    if (this.isTarget) {
      this.isFound = true;
    }
  }

  mark() {
    if (!this.isBlock && !this.isSource && !this.isTarget) {
      this.isPath = true;
    }
  }

  visited() {
    this.isVisited = true;
  }

  handleBlock() {
    if (mouseX > this.x && mouseX < this.x + this.size && mouseY > this.y && mouseY < this.y + this.size) {
      this.isBlock = true; // Toggle block state
    }
  }

  handleClick() {
    if (mouseX > this.x && mouseX < this.x + this.size && mouseY > this.y && mouseY < this.y + this.size) {
      if (!this.isBlock) {
        if (!this.grid.hasSource) {
          this.grid.hasSource = true;
          this.grid.source = this;
          this.isSource = true;
        } else if (!this.grid.hasTarget && !this.isSource) {
          this.grid.hasTarget = true;
          this.grid.target = this;
          this.isTarget = true;
        }
      }
    }
  }

  display() {
    if (this.isFound) {
      fill(255, 215, 0);
    } else if (this.isPath) {
      fill(255, 100, 255);
    } else if (this.isBlock) {
      fill(100, 100, 100);
    } else if (this.isSource) {
      fill(0, 255, 100);
    } else if (this.isTarget) {
      fill(255, 50, 0);
    } else if (this.isCurrent) {
      fill(100, 0, 255);
    } else if (this.isVisited) {
      fill(30, 180, 255);
    } else {
      fill(255);
    }

    if (mouseX > this.x && mouseX < this.x + this.size && mouseY > this.y && mouseY < this.y + this.size) {
      stroke(0, 50, 255);
      strokeWeight(squareMargin);
    } else {
      noStroke();
    }

    rect(this.x, this.y, this.size, this.size, 4, 4, 4, 4);
  }
}


var grid = new Grid(gridSize, gridSize);

function setup() {
  document.addEventListener('contextmenu', event => event.preventDefault());

  createCanvas(canvasSize + 100, canvasSize);

  let bfsButton = createButton('Start BFS');
  bfsButton.position(canvasSize + 10, 10);
  bfsButton.mousePressed(() => {
    if (grid.hasSource && grid.hasTarget) {
      breadthFirstSearch();
    } else {
      alert("Please select a source and target square.");
    }
  });

  let resetButton = createButton('Reset');
  resetButton.position(canvasSize + 10, 40);
  resetButton.mousePressed(() => {
    grid = new Grid(gridSize, gridSize);
  });
}

function draw() {
  background(0);

  grid.drawGrid();

  if (mouseIsPressed && mouseButton === RIGHT) {
    for (let square of grid.gridSquares) {
      square.handleBlock();
    }
  }
}

function mouseClicked() {
  for (let square of grid.gridSquares) {
    square.handleClick();
  }
}

async function breadthFirstSearch() {
  let queue = [];
  queue.push(grid.source);
  visited = new Map();
  visited.set(grid.source.id, null);

  while (queue.length > 0) {
    const current = queue.shift();

    if (current.isTarget) {
      current.found();
      break;
    }

    for (let neighbor of getNeighbors(current)) {
      if (!visited.get(neighbor.id)) {
        queue.push(neighbor);
        visited.set(neighbor.id, current);
      }
    }

    current.visited();
    current.current();

    await wait(algorithmSpeed); // Wait for the next tick before continuing
  }

  let current = grid.target;

  while (current) {
    current.mark();
    current = visited.get(current.id);

    await wait(pathDrawSpeed); // Wait for the next tick before continuing
  }

}

function getNeighbors(square) {
  let neighbors = [];
  const directions = [
    { i: -1, j: 0 }, // Up
    { i: 1, j: 0 },  // Down
    { i: 0, j: -1 }, // Left
    { i: 0, j: 1 }   // Right
  ];

  for (let dir of directions) {
    const neighbor = grid.getSquareAt(square.i + dir.i, square.j + dir.j);
    if (neighbor && !neighbor.isVisited && !neighbor.isSource && !neighbor.isBlock) {
      neighbors.push(neighbor);
    }
  }

  return neighbors;
}