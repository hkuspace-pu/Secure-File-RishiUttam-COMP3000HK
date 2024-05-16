self.onmessage = (event) => {
    setInterval(() => {
      // Run returnMaxMem and get the result
      const result = self.performance.memory.usedJSHeapSize;
  
      // Send the result back to the main thread
      self.postMessage(result);
    }, 500);
  };