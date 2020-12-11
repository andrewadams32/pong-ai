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
  constructor(actorsAndField, gamma = 0.9) {
    // actors = ball, otherPaddle and self
    Object.assign(this, actorsAndField);
    this.gamma = gamma;
    this.fns = [
      // this.yDifference.bind(this),
      // this.lazy.bind(this),
      this.hitEdge.bind(this),
      this.predict.bind(this),
    ];
    this.ws = Array.from({ length: this.fns.length }).map(() => Math.random()); // initialize weights to random between 0 and 1
    this.alpha = 0.7;
    this.eps = 0.0; // epsilon randomization factor
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
    if (newState.self.x < this.field.width / 2) {
      //left paddle
      if (newState.ball.dx <= 0) {
        //ball is heading towards left paddle
        let futureBallY = newState.ball.y;
        let futureBallX = newState.ball.x;
        while (
          futureBallX >
          newState.ball.grid * 2 - newState.otherPaddle.width
        ) {
          futureBallY += newState.ball.dy;
          futureBallX += newState.ball.dx; // dx is negative
          if (futureBallY < newState.ball.grid) {
            // top collision
            futureBallY = newState.ball.grid;
            newState.ball.dy *= -1;
          } else if (
            futureBallY + newState.ball.height >
            this.field.height - newState.ball.grid
          ) {
            //bottom collission
            futureBallY = this.field.height - newState.ball.grid * 2;
            newState.ball.dy *= -1;
          }
        }
        let diff = futureBallY - newState.self.y;
        // if (
        //   diff > newState.self.height / 4 &&
        //   diff < newState.self.height - newState.self.height / 4
        // )
        //   diff = 0;
        return diff === 0 ? 1 : 1 / Math.abs(diff);
      }
    } else {
      //right paddle
      if (newState.ball.dx >= 0) {
        //ball is heading towards right paddle
        let futureBallY = newState.ball.y;
        let futureBallX = newState.ball.x;
        while (
          futureBallX <
          this.field.width - newState.ball.grid * 2 - newState.otherPaddle.width
        ) {
          futureBallY += newState.ball.dy;
          futureBallX += newState.ball.dx; // dx is positive
          if (futureBallY < newState.ball.grid) {
            // top collision
            futureBallY = newState.ball.grid;
            newState.ball.dy *= -1;
          } else if (
            futureBallY + newState.ball.height >
            this.field.height - newState.ball.grid
          ) {
            //bottom collission
            futureBallY = this.field.height - newState.ball.grid * 2;
            newState.ball.dy *= -1;
          }
        }
        let diff = futureBallY - newState.self.y;
        // if (
        //   diff > newState.self.height / 4 &&
        //   diff < newState.self.height - newState.self.height / 4
        // )
        //   diff = 0;
        return diff === 0 ? 1 : 1 / Math.abs(diff);
      }
    }
    return 0;
  }
  //laziness feature
  lazy(state, action) {
    let newState = this.getActionConsequence(state, action);
    const diff = Math.abs(newState.ball.x - newState.self.x);
    if (diff > this.field.width / 2) {
      // other side of the field
      if (state.self.y === newState.self.y) {
        // didnt move
        return 1;
      } else {
        // moved
        return -1;
      }
    } else return 0;
  }
  //curveball
  hitEdge(state, action) {
    let newState = this.getActionConsequence(state, action);
    const xDiff = Math.abs(state.ball.x - newState.self.x);
    if (xDiff > state.field.width / 2) return 0; // if ball is on other side, return .5
    if (newState.self.x < newState.field.width / 2) {
      //left paddle
      if (state.ball.dx > 0) return 0;
    } else {
      //right paddle
      if (state.ball.dx < 0) return 0;
    }

    let paddleCenter = newState.self.y + newState.self.height / 2;
    let yDiff = Math.abs(newState.ball.y - paddleCenter);
    if (yDiff > newState.self.height / 3 && yDiff < newState.self.height / 2)
      return 1; // on the 1/3 edge
    if (yDiff === 0) return 0.5;
    return 1 / yDiff;
  }
  //y difference between ball and paddle feature
  yDifference(state, action) {
    let newState = this.getActionConsequence(state, action);
    let difference = newState.self.y - newState.ball.y;
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
        updated.self.y -= state.self.speed;
        updated.ball.x += state.ball.dx;
        updated.ball.y += state.ball.dy;
        break;
      case "DOWN":
        updated.self.y += state.self.speed;
        updated.ball.y += state.ball.dy;
        updated.ball.x += state.ball.dx;
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
  reward(state) {
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
    if (fs.length > 5) {
      let max = Math.max(...fs);
      let min = Math.min(...fs);
      normFs = fs.map(normalize(min, max));
    } else normFs = fs;

    for (let i = 0; i < this.fns.length; i++) {
      let delta = this.alpha * this.difference(state, action) * normFs[i];
      this.ws[i] += delta;
    }
  }
}
