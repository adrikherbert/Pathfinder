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