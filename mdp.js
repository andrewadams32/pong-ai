class PongBasicAgent {
  constructor(actorsAndField, gamma) {
    // actors = ball, otherPaddle and self
    Object.assign(this, actorsAndField);
  }
  getUpdates(updates) {
    if (this.state) {
      Object.assign(this, updates);
    }
    return this.policy();
  }
  policy() {
    if (this.ball.y > this.self.y + this.self.height / 2) {
      return "DOWN";
    } else return "UP";
  }
}
