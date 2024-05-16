const data = [
  {
    software: "Baseline",
    runs: [
      {
        fileSize: 1, // File size in MB
        duration: [120, 118, 122], // Array of durations for 10 runs
        memory: [15, 16, 14], // Array of memory usage for 10 runs (MB)
        cpu: [20, 19, 18] // Array of CPU usage for 10 runs (%)
      },
      {
        fileSize: 10, // File size in MB
        duration: [520, 515, 532], // Array of durations for 10 runs (ms)
        memory: [38, 37, 39], // Array of memory usage for 10 runs (MB)
        cpu: [50, 48, 49] // Array of CPU usage for 10 runs (%)
      },
      {
        fileSize: 100, // File size in MB
        duration: [1200, 1180, 1220], // Array of durations for 10 runs (ms)
        memory: [75, 74, 76], // Array of memory usage for 10 runs (MB)
        cpu: [82, 80, 81] // Array of CPU usage for 10 runs (%)
      },
      {
        fileSize: 300, // Include additional file sizes as needed
        duration: [...], // Fill in durations for 10 runs
        memory: [...], // Fill in memory usage for 10 runs
        cpu: [...] // Fill in CPU usage for 10 runs
      },
      {
        fileSize: 1024, // Include additional file sizes as needed
        duration: [...], // Fill in durations for 10 runs
        memory: [...], // Fill in memory usage for 10 runs
        cpu: [...] // Fill in CPU usage for 10 runs
      },
      {
        fileSize: 2048, // Include additional file sizes as needed
        duration: [...], // Fill in durations for 10 runs
        memory: [...], // Fill in memory usage for 10 runs
        cpu: [...] // Fill in CPU usage for 10 runs
      },
      {
        fileSize: 3072, // Include additional file sizes as needed
        duration: [...], // Fill in durations for 10 runs
        memory: [...], // Fill in memory usage for 10 runs
        cpu: [...] // Fill in CPU usage for 10 runs
      },
      {
        fileSize: 5120, // Include additional file sizes as needed
        duration: [...], // Fill in durations for 10 runs
        memory: [...], // Fill in memory usage for 10 runs
        cpu: [...] // Fill in CPU usage for 10 runs
      }
    ]
  },
  {
    software: "OpenPGP (Buffer)",
    runs: [
      {
        fileSize: 1,
        duration: [...], // Fill in durations for 10 runs
        memory: [...], // Fill in memory usage for 10 runs
        cpu: [...] // Fill in CPU usage for 10 runs
      },
      // ... data for other file sizes (similar to Baseline)
    ]
  },
  // ... data for other software (OpenPGP (Streaming), CryptoJS, etc.)
];