const MonomeController = require('./monomeController');

document.addEventListener('DOMContentLoaded', () => {
  const monomeController = new MonomeController();

  monomeController.on('deviceReady', () => {
    monomeController.snakeEffect();
  });

  monomeController.init();

  const startButton = document.getElementById('startButton');
  const stopButton = document.getElementById('stopButton');
  const startHourInput = document.getElementById('startHour');
  const endHourInput = document.getElementById('endHour');

  startButton.addEventListener('click', () => {
    monomeController.workingHours = {
      start: parseInt(startHourInput.value, 10),
      end: parseInt(endHourInput.value, 10)
    };
    monomeController.startTimer();
    startButton.disabled = true;
    stopButton.disabled = false;
  });

  stopButton.addEventListener('click', () => {
    monomeController.stopTimer();
    startButton.disabled = false;
    stopButton.disabled = true;
  });
});
