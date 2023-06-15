const EventEmitter = require('events');
const serialosc = require('serialosc');

class MonomeController extends EventEmitter {
  constructor() {
    super();
    this.device = null;
    this.workingHours = { start: 11, end: 19 };
    this.interval = null;
    this.isRunning = false;
    this.brightness = 15;
    this.dimBrightness = 10;
    this.fadeTimer = 19;
    this.fadingIn = false;
    this.isBright = true;
    this.timeInterval = null;
    this.endTime = null;
    this.activeLedX = 0;
    this.activeLedY = 0;

    // Create the worker
    this.worker = new Worker('./fadeEffectWorker.js');
    this.worker.onmessage = (event) => {
      if (event.data === 'tick') {
        this.fadeEffect(); // Call the fadeEffect method when the worker sends a 'tick' message
      }
    };
  }

  init() {
    serialosc.start();
    serialosc.on('device:add', (device) => {
      this.device = device;
      this.emit('deviceReady');
    });
  }

  snakeEffect() {
    this.clearDisplay();

    const snakeTrail = [0, 1, 2];

    const getPositionFromIndex = (index) => {
      return { x: index % 8, y: Math.floor(index / 8) };
    };

    for (let i = 0; i < 64 + snakeTrail.length; i++) {
      setTimeout(() => {
        const idx = i - snakeTrail.length;
        if (idx >= 0 && idx < 64) {
          const pos = getPositionFromIndex(idx);
          this.device.set(pos.x, pos.y, 0);
        }

        if (i < 64) {
          const pos = getPositionFromIndex(i);
          this.device.set(pos.x, pos.y, 15); // Use 15 as brightness to set it on
        }
      }, i * 40);
    }
  }

  startTimer() {
    this.isRunning = true;
    const currentTime = new Date();
    this.endTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), this.workingHours.end, 0, 0);

    this.interval = setInterval(() => {
      this.updateDisplay();
    }, 60000);

    this.updateDisplay();

    // Start the worker
    this.worker.postMessage('start');

    this.emit('timerStarted');
  }

  stopTimer() {
    clearInterval(this.interval);
    this.worker.postMessage('stop');
    this.clearDisplay();
    this.isRunning = false;
    this.emit('timerStopped');
  }

  clearDisplay() {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        this.device.levelSet(x, y, 0);
      }
    }
  }

  updateDisplay() {
    const currentTime = new Date();
    const elapsedTime = this.endTime - currentTime;
    const totalWorkingTime = (this.workingHours.end - this.workingHours.start) * 60 * 60 * 1000;
    const elapsedFraction = elapsedTime / totalWorkingTime;
    const totalLed = 8 * 8;
    const activeLed = Math.floor(totalLed * elapsedFraction);
    this.activeLedX = activeLed % 8;
    this.activeLedY = Math.floor(activeLed / 8);

    // Turn off LEDs that have already passed
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (y < this.activeLedY || (y === this.activeLedY && x <= this.activeLedX)) {
          this.device.levelSet(x, y, 0);
        } else {
          if (y == this.activeLedY && x == this.activeLedX) {
            this.device.levelSet(x, y, this.dimBrightness);
          } else {
            this.device.levelSet(x, y, this.brightness);
          }
        }
      }
    }
  }

  fadeEffect() {
    // If fading in, increase brightness
    if (this.fadingIn) {
      this.fadeTimer += 1;

      // If maximum brightness is reached, start fading out
      if (this.fadeTimer >= 20) {
        this.fadingIn = false;
      }
    } else { // If fading out, decrease brightness
      this.fadeTimer -= 1;

      // If minimum brightness is reached, start fading in
      if (this.fadeTimer <= 1) {
        this.fadingIn = true;
      }
    }

    // Set the LED to double-blink every cycle
    if (this.fadeTimer == 2) {
      this.device.levelSet(this.activeLedX, this.activeLedY, this.brightness);
    }
    else {
      this.device.levelSet(this.activeLedX, this.activeLedY, this.dimBrightness);
    }
  }

}

module.exports = MonomeController;
