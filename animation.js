// see https://gist.github.com/addyosmani/5434533
// helps control rate limit in requestAnimationFrame
// not neccessary, but useful for slowing down/speeding up the game for testing

class AnimationFrame {
  constructor(fps = 60, animate) {
    this.requestID = 0;
    this.fps = fps;
    this.animate = animate;
    this.playing = false;
  }
  start() {
    let then = performance.now();
    const interval = 1000 / this.fps;
    const tolerance = 0.1;

    const animateLoop = (now) => {
      this.requestID = requestAnimationFrame(animateLoop);
      const delta = now - then;

      if (delta >= interval - tolerance) {
        then = now - (delta % interval);
        this.animate(delta);
      }
    };
    this.requestID = requestAnimationFrame(animateLoop);
    this.playing = true;
  }
  stop() {
    cancelAnimationFrame(this.requestID);
    this.playing = false;
  }
}
