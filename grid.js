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