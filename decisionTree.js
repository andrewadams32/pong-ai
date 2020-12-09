class DecisionTree {
  constructor(props) {
    Object.assign(this, props);
    this.attributes = [this.yDifference.bind(this)];
  }
  yDifference() {
    let difference = this.self.y - this.ball.y + this.self.height / 2;
    if (difference === 0) return 1;
    else return 1 / Math.abs(difference);
  }
  entropy(leftCount, rightCount) {
    const total = leftCount + rightCount;
    const probs = [leftCount / total, rightCount / total];
    const e = probs.reduce((p, c, i) => {
      return p + -c * Math.log2(p);
    }, 0);
    return e;
  }
  gini() {
    gini_index =
      (1.0 - sum(proportion * proportion)) * (group_size / total_samples);
  }
  informationGain(probs) {
    const total = probs.reduce((p, c, i) => p + c, 0);
    return probs.reduce((p, c, i) => {
      return p + (p / total) * Math.log10();
    });
  }
}
