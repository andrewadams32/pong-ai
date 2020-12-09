class GameObject {
  constructor(props) {
    Object.assign(this, props);
  }
  checkCollision(gameObject) {
    const collided =
      this.x < gameObject.x + gameObject.width &&
      this.x + this.width > gameObject.x &&
      this.y < gameObject.y + gameObject.height &&
      this.y + this.height > gameObject.y;
    if (collided) {
      const diff = this.y - gameObject.y;
      if (diff < gameObject.height / 3) {
        return 0; // top
      } else if (diff === gameObject.height / 2) {
        // TODO: make it a range
        return 1; // middle
      } else {
        return 2; // bottom
      }
    } else {
      return -1;
    }
  }
  draw() {
    context.fillRect(this.x, this.y, this.width, this.height);
  }
}

class Paddle extends GameObject {
  constructor(props) {
    const { x, y, width, height, dx, dy, ...rest } = props;
    super({ x, y, height, width, dx, dy });
    Object.assign(this, rest);
  }
  update() {
    this.y += this.dy;
    if (this.y < this.grid) {
      this.y = this.grid;
    } else if (this.y > this.maxY) {
      this.y = this.maxY;
    }
  }
  goUp() {
    this.dy = -this.speed;
  }
  goDown() {
    this.dy = this.speed;
  }
  stop() {
    this.dy = 0;
  }
  score() {
    this.points++;
  }
}

class Ball extends GameObject {
  constructor(props) {
    const { x, y, height, width, dx, dy, ...rest } = props;
    super({ x, y, height, width, dx, dy });
    this.initialSpeed = { dx, dy };
    Object.assign(this, rest);
  }
  update(left, right) {
    // move ball by its velocity
    this.x += this.dx;
    this.y += this.dy;

    // prevent ball from going through walls by changing its velocity
    if (this.y < this.grid) {
      this.y = this.grid;
      this.dy *= -1;
    } else if (this.y + this.grid > this.canvas.height - this.grid) {
      this.y = this.canvas.height - this.grid * 2;
      this.dy *= -1;
      this.dx > 0
        ? (this.dx = Math.abs(this.initialSpeed.dx))
        : (this.dx = -Math.abs(this.initialSpeed.dx));
      this.dy > 0
        ? (this.dy = Math.abs(this.initialSpeed.dy))
        : (this.dy = -Math.abs(this.initialSpeed.dy));
    }

    // reset ball if it goes past paddle (but only if we haven't already done so)
    if ((this.x < 0 || this.x > this.canvas.width) && !this.resetting) {
      ball.resetting = true;

      if (this.x > this.canvas.width / 2) left.score();
      else right.score();
      setTimeout(() => {
        this.resetting = false;
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height / 2;
        // this.dy = 0;
      }, 400);
      return this.x < 0 ? "right" : "left";
    } else return "none";
  }
  handlePossibleCollision(gameObject) {
    const collided = this.checkCollision(gameObject);
    if (collided !== -1) {
      this.dx *= -1;
      switch (collided) {
        case 0:
          this.dy = -Math.abs(this.dy);
          break;
        case 1:
          this.dy = 0;
          break;
        case 2:
          this.dy = Math.abs(this.dy);
      }
      if (gameObject.speed > 0) {
        this.dx > 0 ? (this.dx += 1) : (this.dx -= 1);
        this.dy > 0 ? (this.dy += 1) : (this.dy -= 1);
      }

      if (this.x > gameObject.x)
        // move ball next to the paddle otherwise the collision will happen again
        // in the next frame
        this.x = gameObject.x + gameObject.width;
      else this.x = gameObject.x - gameObject.width;
      return true;
    }
    return false;
  }
}
