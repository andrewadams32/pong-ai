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
      if (diff < gameObject.height / 6) {
        return 0;
      } else if (diff < (2.5 * gameObject.height) / 6) {
        return 1;
      } else if (diff < (3.5 * gameObject.height) / 6) {
        return 2;
      } else if (diff < (5 * gameObject.height) / 6) {
        return 3;
      } else {
        return 4;
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
        this.dy = 0;
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
          this.dy = -Math.abs(this.initialSpeed.dy * 1.5);
          break;
        case 1:
          this.dy = -Math.abs(this.initialSpeed.dy);
          break;
        case 2:
          this.dy = 0;
          break;
        case 3:
          this.dy = Math.abs(this.initialSpeed.dy);
          break;
        case 4:
          this.dy = Math.abs(this.initialSpeed.dy * 1.5);
          break;
      }
      if (gameObject.speed > 0) {
        this.dx =
          this.dx > 0
            ? Math.abs(1.5 * this.initialSpeed.dx)
            : -Math.abs(1.5 * this.initialSpeed.dx);
        this.dy > 0
          ? Math.abs(1.5 * this.initialSpeed.dy)
          : -Math.abs(1.5 * this.initialSpeed.dy);
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
