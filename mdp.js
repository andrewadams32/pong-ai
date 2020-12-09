class PongBasicAgent {
  constructor(actorsAndField, gamma) {
    // actors = ball, otherPaddle and self
    Object.assign(this, actorsAndField);
  }
  getUpdates(updates) {
    if (this.state) {
      this.old = this;
      Object.assign(this, updates);
    }
    return this.policy();
  }
  policy() {
    if (this.ball.y > this.self.y + this.self.height) {
      return "DOWN";
    } else return "UP";
  }
}

//fail...
class MDPAgent {
  constructor(actorsAndField, gamma) {
    // actors = ball, otherPaddle and self
    Object.assign(this, actorsAndField);
    this.scale = 0.1;
    this.state = Array.from({ length: this.field.height * this.scale }).fill(
      Array.from({ length: this.field.width * this.scale }).fill(
        Array.from({ length: this.field.height * this.scale }).fill(0)
      )
    ); // state[bally][paddley]
    this.policyVals = Array.from({ length: this.field.height }).fill(
      Array.from({ length: this.field.width }).fill(
        Array.from({ length: this.field.height }).fill("NONE")
      )
    ); // state[bally][paddley]
    console.log("state", this.state);
  }
  reward(ballY, ballX, selfY) {
    if (this.self.x < this.field.width / 2) {
      if (ballX < this.self.x) {
        return -1;
      } else if (ballX > this.otherPaddle.x) {
        return 1;
      }
    } else {
      if (ballX > this.self.x) {
        return -1;
      } else if (ballX < this.otherPaddle.x) {
        return 1;
      }
    }
  }
  policyEvaluation() {
    let newState = JSON.parse(JSON.stringify(this.state));
    const stringifiedState = JSON.stringify(this.state);
    let i = 0;
    do {
      console.log("step", i);
      newState = this.policyEvaluationStep();
    } while (stringifiedState !== JSON.stringify(newState));
  }
  policyEvaluationStep(prevState) {
    const newState = JSON.parse(JSON.stringify(prevState));
    for (let ballY = 0; ballY < newState.length; ballY++) {
      for (let ballX = 0; ballX < newState[0].length; ballX++) {
        for (let selfY = 0; selfY < newState[0][0].length; selfY++) {
          let action = this.policyVals[ballY][ballX][selfY];
          let newBallY, newBallX, newSelfY;
          newBallY = ballY + this.ball.dy * Math.floor(this.scale);
          newBallX = ballX + this.ball.dx * Math.floor(this.scale);
          switch (action) {
            case "DOWN":
              newSelfY =
                selfY + Math.abs(this.self.dy) * Math.floor(this.scale);
              break;
            case "UP":
              newSelfY =
                selfY - Math.abs(this.self.dy) * Math.floor(this.scale);
              break;
          }
          if (newBallY > this.field.height) newBallY = this.field.height;
          if (newBallY < 0) newBallY = 0;

          if (newSelfY > this.field.height) newSelfY = this.field.height;
          if (newSelfY < 0) newSelfY = 0;

          if (newBallX > this.field.width) newBallX = this.field.width;
          if (newBallX < 0) newBallX = 0;

          newState[ballY][ballX][selfY] =
            this.reward(ballY, ballX, selfY) +
            this.gamma * newState[newBallY][newBallX][newSelfY];
        }
      }
    }
    return newState;
  }
}
