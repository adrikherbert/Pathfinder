var canvasSize = 1000;
var gridSize = 20;
var squareMargin = 3;
var pathDrawSpeed = 3; // Speed of path drawing in milliseconds
var algorithmSpeed = 20; // Speed of algorithm execution in milliseconds

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

  clearAlgorithmMarks() {
    for (let square of this.gridSquares) {
      square.isVisited = false;
      square.isCurrent = false;
      square.isPath = false;
      square.isCurrentPath = false;
      square.isFound = false;
      square.isHighlighted = false;
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
    this.isCurrentPath = false;
    this.isHighlighted = false;
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
      this.isHighlighted = true;
      this.isPath = true;

      setTimeout(() => {
        this.isHighlighted = false;
      }, 200);
    }
  }

  markCurrentPath() {
    if (!this.isBlock && !this.isSource && !this.isTarget) {
      this.isCurrentPath = true;
    }
  }

  unmarkCurrentPath() {
    this.isCurrentPath = false;
  }

  visited() {
    this.isVisited = true;
  }

  handleBlock() {
    if (!this.isSource && !this.isTarget && mouseX > this.x && mouseX < this.x + this.size && mouseY > this.y && mouseY < this.y + this.size) {
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
    if (this.isHighlighted) {
      fill(255, 0, 255);
    } else if (this.isPath) {
      fill(0, 255, 255);
    } else if (this.isCurrentPath) {
      fill(255, 255, 0);
    } else if (this.isBlock) {
      fill(100, 100, 100);
    } else if (this.isSource) {
      fill(0, 255, 100);
    } else if (this.isTarget) {
      fill(255, 50, 0);
    } else if (this.isCurrent) {
      fill(100, 0, 255);
    } else if (this.isVisited) {
      fill(40);
    } else {
      fill(200);
    }

    if (mouseX > this.x && mouseX < this.x + this.size && mouseY > this.y && mouseY < this.y + this.size) {
      stroke(0, 50, 255);
      strokeWeight(squareMargin);
    } else {
      noStroke();
    }

    rect(this.x, this.y, this.size, this.size, 1, 1, 1, 1);
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

  let aStarButton = createButton('Start A*');
  aStarButton.position(canvasSize + 10, 40);
  aStarButton.mousePressed(() => {
    if (grid.hasSource && grid.hasTarget) {
      AStarSearch();
    } else {
      alert("Please select a source and target square.");
    }
  });

  let resetButton = createButton('Reset');
  resetButton.position(canvasSize + 10, 70);
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

async function AStarSearch() {
  grid.clearAlgorithmMarks();

  let openSet = [];
  openSet.push([grid.source, 0]);

  cameFrom = new Map();
  cameFrom.set(grid.source.id, null);

  gScore = new Map();
  gScore.set(grid.source.id, 0);

  fScore = new Map();
  fScore.set(grid.source.id, heuristic(grid.source, grid.target));

  let current = null;
  let previous = null;

  while (openSet.length > 0) {
    if (current) {
      previous = current[0];
    }

    current = openSet.shift();

    if (current[0].isTarget) {
      current[0].found();
      break;
    }

    purgeCurrentPath(constructPath(previous, cameFrom));

    for (let neighbor of getNeighbors(current[0])) {
      const tentativeGScore = gScore.get(current[0].id) + 1; // Assuming uniform cost for each step

      if (!gScore.has(neighbor.id) || tentativeGScore < gScore.get(neighbor.id)) {
        cameFrom.set(neighbor.id, current[0]);
        gScore.set(neighbor.id, tentativeGScore);
        fScore.set(neighbor.id, tentativeGScore + heuristic(neighbor, grid.target));

        if (!openSet.some(item => item[0].id === neighbor.id)) {
          openSet.push([neighbor, fScore.get(neighbor.id)]);
          openSet.sort((a, b) => a[1] - b[1]); // Sort by fScore
        }
      }
    }

    markCurrentPath(constructPath(current[0], cameFrom));

    current[0].visited();
    current[0].current();

    await wait(algorithmSpeed); // Wait for the next tick before continuing
  }

  current = grid.target;

  while (current) {
    current.mark();
    current = cameFrom.get(current.id);

    await wait(pathDrawSpeed); // Wait for the next tick before continuing
  }


}

function constructPath(target, cameFrom) {
  let path = [];
  let current = target;

  while (current) {
    path.push(current);
    current = cameFrom.get(current.id);
  }

  return path;
}

function heuristic(a, b) {
  return 2 * (Math.abs(a.i - b.i) + Math.abs(a.j - b.j));
}

function purgeCurrentPath(cameFrom) {
  for (let square of cameFrom) {
    if (square && square.isCurrentPath) {
      square.unmarkCurrentPath();
    }
  }
}

function markCurrentPath(cameFrom) {
  for (let square of cameFrom) {
    if (square) {
      square.markCurrentPath();
    }
  }
}

async function breadthFirstSearch() {
  grid.clearAlgorithmMarks();

  let queue = [];
  queue.push(grid.source);
  visited = new Map();
  visited.set(grid.source.id, null);

  let current = null;
  let previous = null;

  while (queue.length > 0) {
    if (current) {
      previous = current;
    }

    current = queue.shift();

    purgeCurrentPath(constructPath(previous, visited));

    if (current.isTarget) {
      current.found();
      markCurrentPath(constructPath(current, visited));
      break;
    }

    for (let neighbor of getNeighbors(current)) {
      if (!visited.get(neighbor.id)) {
        queue.push(neighbor);
        visited.set(neighbor.id, current);
      }
    }

    markCurrentPath(constructPath(current, visited));

    current.visited();
    current.current();

    await wait(algorithmSpeed); // Wait for the next tick before continuing
  }

  current = grid.target;

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