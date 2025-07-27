const canvasSize = 1000; // Size of the canvas in pixels
const gridSize = 30; // Number of squares in each row and column
const squareMargin = 2; // Margin between squares
const squareCornerRadius = 1; // Corner radius for squares
const pathDrawSpeed = 3; // Speed of path drawing in milliseconds
const algorithmSpeed = 1; // Speed of algorithm execution in milliseconds
const aStarHueristicWeight = 1; // Weight for A* heuristic calculation
const randomBlockWeight = 0.3; // Weight for random block generation

const highlightedColor = [255, 0, 255]; // Color for highlighted squares
const pathColor = [0, 255, 255]; // Color for path squares
const currentPathColor = [255, 255, 0]; // Color for current path squares
const blockColor = [100, 100, 100]; // Color for blocked squares
const sourceColor = [0, 255, 100]; // Color for source square
const targetColor = [255, 50, 0]; // Color for target square
const currentColor = [100, 0, 255]; // Color for current square
const visitedColor = [40]; // Color for visited squares
const defaultColor = [200]; // Default color for squares
const gridBackgroundColor = [0]; // Background color of the grid

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
    const squareSize = (canvasSize - squareMargin) / this.cols;
    let count = 0;

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const x = j * squareSize;
        const y = i * squareSize;
        const gridSquare = new GridSquare(x, y, i, j, count, squareSize, this);
        this.gridSquares.push(gridSquare);
        count++;
      }
    }
  }

  generateRandomBlocks(weight) {
    for (let square of this.gridSquares) {
      if (!square.isSource && !square.isTarget && Math.random() < weight) {
        square.isBlock = true;
      } else {
        square.isBlock = false;
      }
    }
  }

  getSquareAt(i, j) {
    if (i < 0 || i >= this.rows || j < 0 || j >= this.cols) {
      return null;
    }
    return this.gridSquares[i * this.cols + j];
  }

  getNeighbors(square) {
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

  purgeCurrentPath(cameFrom) {
    for (let square of cameFrom) {
      if (square && square.isCurrentPath) {
        square.unmarkCurrentPath();
      }
    }
  }

  markCurrentPath(cameFrom) {
    for (let square of cameFrom) {
      if (square) {
        square.markCurrentPath();
      }
    }
  }

  constructPath(target, cameFrom) {
    let path = [];
    let current = target;

    while (current) {
      path.push(current);
      current = cameFrom.get(current.id);
    }

    return path;
  }

  heuristic(a, b) {
    return aStarHueristicWeight * (Math.abs(a.i - b.i) + Math.abs(a.j - b.j));
  }

  async AStarSearch() {
    this.clearAlgorithmMarks();

    let openSet = [];
    openSet.push([this.source, 0]);

    let cameFrom = new Map();
    cameFrom.set(this.source.id, null);

    let gScore = new Map();
    gScore.set(this.source.id, 0);

    let fScore = new Map();
    fScore.set(this.source.id, this.heuristic(this.source, this.target));

    let current = null;
    let previous = null;

    while (openSet.length > 0) {
      if (current) {
        previous = current[0];
      }

      current = openSet.shift();

      this.purgeCurrentPath(this.constructPath(previous, cameFrom));

      if (current[0].isTarget) {
        current[0].found();
        this.markCurrentPath(this.constructPath(current[0], cameFrom));
        break;
      }

      for (let neighbor of this.getNeighbors(current[0])) {
        const tentativeGScore = gScore.get(current[0].id) + 1; // Assuming uniform cost for each step

        if (!gScore.has(neighbor.id) || tentativeGScore < gScore.get(neighbor.id)) {
          cameFrom.set(neighbor.id, current[0]);
          gScore.set(neighbor.id, tentativeGScore);
          fScore.set(neighbor.id, tentativeGScore + this.heuristic(neighbor, this.target));

          if (!openSet.some(item => item[0].id === neighbor.id)) {
            openSet.push([neighbor, fScore.get(neighbor.id)]);
            openSet.sort((a, b) => a[1] - b[1]); // Sort by fScore
          }
        }
      }

      this.markCurrentPath(this.constructPath(current[0], cameFrom));

      current[0].visited();
      current[0].current();

      await wait(algorithmSpeed); // Wait for the next tick before continuing
    }

    current = this.target;

    while (current) {
      current.mark();
      current = cameFrom.get(current.id);

      await wait(pathDrawSpeed); // Wait for the next tick before continuing
    }
  }

  async breadthFirstSearch() {
    this.clearAlgorithmMarks();

    let queue = [];
    queue.push(this.source);
    let visited = new Map();
    visited.set(this.source.id, null);

    let current = null;
    let previous = null;

    while (queue.length > 0) {
      if (current) {
        previous = current;
      }

      current = queue.shift();

      this.purgeCurrentPath(this.constructPath(previous, visited));

      if (current.isTarget) {
        current.found();
        this.markCurrentPath(this.constructPath(current, visited));
        break;
      }

      for (let neighbor of this.getNeighbors(current)) {
        if (!visited.get(neighbor.id)) {
          queue.push(neighbor);
          visited.set(neighbor.id, current);
        }
      }

      this.markCurrentPath(this.constructPath(current, visited));

      current.visited();
      current.current();

      await wait(algorithmSpeed); // Wait for the next tick before continuing
    }

    current = this.target;

    while (current) {
      current.mark();
      current = visited.get(current.id);

      await wait(pathDrawSpeed); // Wait for the next tick before continuing
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
    this.currentSize = size;
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

    this.currentAnimationDuration = 30; // Duration for current animation
    this.currentAnimationStep = 0;

    this.highlightedAnimationDuration = 15; // Duration for highlighted animation
    this.highlightedAnimationStep = 0;
  }

  current() {
    this.isCurrent = true;
    this.currentAnimationStep = this.currentAnimationDuration
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

      this.highlightedAnimationStep = this.highlightedAnimationDuration;
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

  setColor() {
    drawingContext.shadowBlur = 0; // Reset shadow blur
    drawingContext.shadowColor = 'transparent'; // Reset shadow color

    if (this.isHighlighted) {
      if (this.highlightedAnimationStep > 0) {
        const currentAnimationColor = lerpColor(color(pathColor), color(highlightedColor), this.highlightedAnimationStep / this.highlightedAnimationDuration);

        fill(currentAnimationColor);
        this.highlightedAnimationStep -= 1; // Decrease animation duration

        drawingContext.shadowBlur = this.highlightedAnimationStep;
        drawingContext.shadowColor = currentAnimationColor;

        if (this.highlightedAnimationStep <= 0) {
          this.isHighlighted = false; // Reset current state after animation
        }
      }
    } else if (this.isPath) {
      fill(pathColor);
    } else if (this.isCurrentPath) {
      fill(currentPathColor);
    } else if (this.isBlock) {
      fill(blockColor);
    } else if (this.isSource) {
      fill(sourceColor);
    } else if (this.isTarget) {
      fill(targetColor);
    } else if (this.isCurrent) {
      if (this.currentAnimationStep > 0) {
        const currentAnimationColor = lerpColor(color(visitedColor), color(currentColor), this.currentAnimationStep / this.currentAnimationDuration);

        fill(currentAnimationColor);
        this.currentAnimationStep -= 1; // Decrease animation duration

        drawingContext.shadowBlur = this.currentAnimationStep;
        drawingContext.shadowColor = currentAnimationColor;

        if (this.currentAnimationStep <= 0) {
          this.isCurrent = false; // Reset current state after animation
        }
      }
    } else if (this.isVisited) {
      fill(visitedColor);
    } else {
      fill(defaultColor);
    }
  }

  setSize() {
    if (this.highlightedAnimationStep > 0) {
      this.currentSize = (canvasSize - squareMargin) / this.grid.cols - this.highlightedAnimationStep / 10; // Slightly increase size during highlight animation
    } else {
      this.currentSize = this.size; // Reset to original size
    }
  }

  display() {
    this.setColor();
    this.setSize();

    if (mouseX > this.x && mouseX < this.x + this.size && mouseY > this.y && mouseY < this.y + this.size) {
      stroke(0, 50, 255);
    } else {
      stroke(gridBackgroundColor);
    }

    strokeWeight(squareMargin);

    rect(this.x, this.y, this.currentSize, this.currentSize, squareCornerRadius, squareCornerRadius, squareCornerRadius, squareCornerRadius);
  }
}


var grid = new Grid(gridSize, gridSize);

function setup() {
  document.addEventListener('contextmenu', event => event.preventDefault());

  createCanvas(canvasSize + 400, canvasSize);

  let bfsButton = createButton('Start BFS');
  bfsButton.position(canvasSize + 10, 10);
  bfsButton.mousePressed(() => {
    if (grid.hasSource && grid.hasTarget) {
      grid.breadthFirstSearch();
    } else {
      alert("Please select a source and target square.");
    }
  });

  let aStarButton = createButton('Start A*');
  aStarButton.position(canvasSize + 10, 40);
  aStarButton.mousePressed(() => {
    if (grid.hasSource && grid.hasTarget) {
      grid.AStarSearch();
    } else {
      alert("Please select a source and target square.");
    }
  });

  let randomBlocksButton = createButton('Generate Random Blocks');
  randomBlocksButton.position(canvasSize + 10, 100);
  randomBlocksButton.mousePressed(() => {
    grid.generateRandomBlocks(randomBlockWeight); // Adjust the weight as needed
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