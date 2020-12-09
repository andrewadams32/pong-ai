"use strict";

function findIndexOfGreatest(array) {
  var greatest;
  var indexOfGreatest;
  for (var i = 0; i < array.length; i++) {
    if (!greatest || array[i] > greatest) {
      greatest = array[i];
      indexOfGreatest = i;
    }
  }
  return indexOfGreatest;
}

//utility for normalizing values in a list
function normalize(min, max) {
  var delta = max - min;
  return function (val) {
    if (delta === 0) return 1;
    return (val - min) / delta;
  };
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

class QLearner {
  constructor(actorsAndField, gamma = 1) {
    // actors = ball, otherPaddle and self
    Object.assign(this, actorsAndField);
    this.gamma = gamma;
    this.fns = [
      this.yDifference.bind(this),
      this.lazy.bind(this),
      // this.avoidBottom.bind(this),
    ];
    this.ws = Array.from({ length: this.fns.length }).map(() => Math.random()); // initialize weights to random between 0 and 1
    this.alpha = 0.5;
    this.eps = 0; // epsilon randomization factor
  }
  getUpdates(updates) {
    // get new values from environment and return next move based on those values
    Object.assign(this, updates);
    return this.makeMove();
  }
  makeMove() {
    //choose next move from max of possible actions
    const actions = ["UP", "DOWN", "NONE"];
    const Qs = actions.map((a) => this.q({ ...this }, a));
    let nextAction;
    // eps randomization
    let r = Math.random();
    if (r < this.eps) nextAction = actions[getRandomInt(actions.length - 1)];
    else nextAction = actions[findIndexOfGreatest(Qs)];

    //update weights
    this.updateW(this, nextAction);
    return nextAction;
  }
  predict(state, action) {
    let newState = this.getActionConsequence(state, action);
    let diff = Math.abs(state.self.x - state.ball.x);
    if (diff > state.field.width - state.self.width) {
      //opposite side of field
      if (state.ball.dy < 0) {
        //going up
      }
    }
  }
  //laziness feature
  lazy(state, action) {
    let newState = this.getActionConsequence(state, action);
    const diff = Math.abs(newState.ball.x - this.self.x);
    if (diff > this.field.width / 2) {
      // other side of the field
      if (state.self.y === newState.self.y) {
        // didnt move
        return 0.5;
      } else {
        // moved
        return -0.5;
      }
    } else return 0;
  }
  //avoid bottom feature
  avoidBottom(state, action) {
    let newState = this.getActionConsequence(state, action);
    let res = 0;
    if (newState.ball.x > this.field.width / 2) {
      //right 1/2
      let diff = newState.ball.y - newState.self.y;
      if (newState.ball.y < newState.field.height / 2) {
        // top half
        if (diff > 0 && diff < newState.self.height) {
          //ball within paddle y
          if (diff < newState.self.height / 2) {
            //ball y is in top half of paddle
            res = -1;
          } else res = 1;
        }
      } else {
        // bottom half
        if (diff > 0 && diff < newState.self.height) {
          //ball within paddle y
          if (diff < newState.self.height / 2) {
            //ball y is in top half of paddle
            res = 1;
          } else res = -1;
        }
      }
    }
    return res;
  }
  //y difference between ball and paddle feature
  yDifference(state, action) {
    let newState = this.getActionConsequence(state, action);
    let difference =
      newState.self.y - newState.ball.y + newState.self.height / 2;
    if (difference === 0) return 1;
    else return 1 / Math.abs(difference);
  }
  log(...message) {
    console.log(`${this.name}:`, ...message);
  }
  //q value calculator
  q(state, action) {
    let sum = 0;
    let fs = this.fns.map((fn) => fn(state, action)); // compute all feature values
    for (let i = 0; i < this.fns.length; i++) {
      sum += fs[i] * this.ws[i]; // sum up all features * weight
    }
    return sum;
  }
  // get result of taking certain action
  getActionConsequence(state, action = "NONE") {
    let updated = JSON.parse(JSON.stringify(state));
    switch (action) {
      case "UP":
        updated.self.y = state.self.y - state.self.speed;
        updated.ball.x += state.ball.dx;
        break;
      case "DOWN":
        updated.self.y = state.self.y + state.self.speed;
        updated.ball.y += state.ball.dy;
        break;
      case "NONE":
        break;
    }
    return Object.assign({}, updated);
  }
  //calculate difference for update function
  difference(state, action) {
    const diff =
      this.reward(state) +
      this.gamma *
        Math.max(...["UP", "DOWN", "NONE"].map((a) => this.q(state, a))) -
      this.q(state, action);
    return diff;
  }
  //calculate reward for scoring
  reward() {
    if (this.scored !== "none") {
      if (this.scored === this.name) {
        return 1;
      } else {
        return -1;
      }
    } else return 0;
  }
  //update weights function
  updateW(state, action) {
    let fs = this.fns.map((fn) => fn(state, action));

    //normalize features
    let normFs;
    if (fs.length > 1) {
      let max = Math.max(...fs);
      let min = Math.min(...fs);
      normFs = fs.map(normalize(min, max));
    } else normFs = fs;

    for (let i = 0; i < this.fns.length; i++) {
      let delta = this.alpha * this.difference(state, action) * normFs[i];
      this.ws[i] += delta;
    }
    //scale down weights to reduce size in case they don't converge
    let wsMax = Math.max(...this.ws);
    this.ws = this.ws.map((w) => w / wsMax);
  }
}
