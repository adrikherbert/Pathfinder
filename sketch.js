var canvasSize = 1000;
var gridSize = 20;
var squareMargin = 6;
var ticksPerSecond = 60;

const tick = () => new Promise((resolve, reject) => {
  setTimeout(_ => resolve(), 1000 / ticksPerSecond);
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
    this.isSource = false;
    this.isTarget = false;
    this.grid = grid;
    this.visited = false;
    this.current = false;
    this.block = false;
    this.found = false;
  }

  markFound() {
    if (this.isTarget) {
      this.found = true;
    }
  }

  markVisited() {
    this.visited = true;
  }

  markCurrent() {
    this.current = true;
    setTimeout(() => {
      this.current = false;
    }, 400);
  }

  handleBlock() {
    if (mouseX > this.x && mouseX < this.x + this.size && mouseY > this.y && mouseY < this.y + this.size) {
      this.block = true; // Toggle block state
    }
  }

  handleClick() {
    if (mouseX > this.x && mouseX < this.x + this.size && mouseY > this.y && mouseY < this.y + this.size) {
      if (!this.block) {
        if (!this.grid.hasSource) {
          this.grid.hasSource = true;
          this.grid.source = this;
          this.isSource = true;
        } else if (!this.grid.hasTarget) {
          this.grid.hasTarget = true;
          this.grid.target = this;
          this.isTarget = true;
        }
      }
    }
  }

  display() {
    if (this.found) {
      fill(255, 215, 0);
    } else if (this.block) {
      fill(100, 100, 100);
    } else if (this.isSource) {
      fill(0, 255, 100);
    } else if (this.isTarget) {
      fill(255, 100, 0);
    } else if (this.current) {
      fill(100, 0, 255);
    } else if (this.visited) {
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
      current.markFound();
      break;
    }

    for (let neighbor of getNeighbors(current)) {
      if (!visited.get(neighbor.id)) {
        queue.push(neighbor);
        visited.set(neighbor.id, current);
      }
    }

    current.markVisited();
    current.markCurrent();

    await tick(); // Wait for the next tick before continuing
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
    if (neighbor && !neighbor.visited && !neighbor.isSource && !neighbor.block) {
      neighbors.push(neighbor);
    }
  }

  return neighbors;
}