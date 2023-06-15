self.onmessage = (event) => {
  if (event.data === 'start') {
    self.timerId = setInterval(() => {
      postMessage('tick');
    }, 100);
  } else if (event.data === 'stop') {
    clearInterval(self.timerId);
  }
};
