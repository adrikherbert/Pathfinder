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