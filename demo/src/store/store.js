import { defineStore } from 'pinia'
import prettyBytes from 'pretty-bytes'
export const useStore = defineStore("store", {
    state: () => ({
        
            isPublicKeyModalOpen:false,
            isSettings : true,
            passphrase : '',
            testResults : [],
            isCloud : false,
         
          
        
    }),
    actions: {
        closeModal() {
                this.isPublicKeyModalOpen = false
        },
        openModal() {
            console.log('action called')
            this.isPublicKeyModalOpen = true
        },
        setPassphrase(value) {
            this.passphrase = value
        },
  




    },
    getters: {
        groupedData() {
            if (!this.testResults || this.testResults.length === 0) {
                return null;
            }

            // Group data by software and file size
            const groupedData = this.testResults.reduce((acc, item) => {
                // const key = `${item.software}:${prettyBytes(item.fileSize)}`;
                const key = `${item.software}:${item.fileSize}`;

                if (!acc[key]) {
                    acc[key] = [];
                }

                acc[key].push(item);

                return acc;
            }, {});

            return groupedData;
        },  stats() {
            if (!this.groupedData) {
              return null;
            }
          
            const stats = {};
          
            for (const key in this.groupedData) {
              const group = this.groupedData[key];
          
              // Sort group data for quartile calculations
              const sortedDurationData = group.map(item => item.duration).sort((a, b) => a - b);
              const sortedMemoryData = group.map(item => item.memory).sort((a, b) => a - b);
          
              stats[key] = {
                duration: {
                  min: sortedDurationData[0],
                  q1: sortedDurationData[Math.floor(sortedDurationData.length / 4)],
                  median: sortedDurationData[Math.floor(sortedDurationData.length / 2)],
                  q3: sortedDurationData[Math.floor(3 * sortedDurationData.length / 4)],
                  max: sortedDurationData[sortedDurationData.length - 1],
                },
                memory: {
                  min: sortedMemoryData[0],
                  q1: sortedMemoryData[Math.floor(sortedMemoryData.length / 4)],
                  median: sortedMemoryData[Math.floor(sortedMemoryData.length / 2)],
                  q3: sortedMemoryData[Math.floor(3 * sortedMemoryData.length / 4)],
                  max: sortedMemoryData[sortedMemoryData.length - 1],
                },
              };
            }
          
            return stats;
          },

          boxPlotDuration() {

            if (!this.stats) {
                return [{ data: [] }];
              }

        
            // const series = [{data:[{x:'Software-1',y:[50, 66, 69, 75, 88]}]}];
            const series = [{ data: [] }];
            // return [ { "data": [ { "x": "Baseline - 1052352", "y": [ 339.9, 345.6, 365.4, 376.8, 419.2 ] } ] } ]
            for (const key in this.stats) {
              const group = this.stats[key];
              series[0].data.push({
                x: key,
                y: [group.duration.min, group.duration.q1, group.duration.median, group.duration.q3, group.duration.max],
              });
            }
        
            return series;
           
          },
          boxPlotMemory() {

            if (!this.stats) {
                return [{ data: [] }];
              }

        
            // const series = [{data:[{x:'Software-1',y:[50, 66, 69, 75, 88]}]}];
            const series = [{ data: [] }];
            // return [ { "data": [ { "x": "Baseline - 1052352", "y": [ 339.9, 345.6, 365.4, 376.8, 419.2 ] } ] } ]
            for (const key in this.stats) {

              const group = this.stats[key];
              series[0].data.push({
                x: key,
                y: [group.memory.min, group.memory.q1, group.memory.median, group.memory.q3, group.memory.max],
              });
            }
        
            return series;
           
          }, lineChartDuration() {
            const series = [];
            for (const key in this.groupedData) {
              const group = this.groupedData[key];
              const [software, fileSize] = key.split(':');
          
              // Calculate the median duration
              const sortedDurations = group.map(item => item.duration).sort((a, b) => a - b);
              const medianDuration = sortedDurations[Math.floor(sortedDurations.length / 2)];
          
              // Find or create the series for this software
              let serie = series.find(serie => serie.name === software);
              if (!serie) {
                serie = { name: software, data: [] };
                series.push(serie);
              }
          
              // Add the data point to the series
              serie.data.push({ x: fileSize, y: medianDuration });
            }
            series.forEach(serie => {
              serie.data.sort((a, b) => a.x - b.x);
            });
            return series;
          },
          lineChartMemory() {
            const series = [];
            for (const key in this.groupedData) {
              const group = this.groupedData[key];
              const [software, fileSize] = key.split(':');
          
              // Calculate the median duration
              const sortedMemory = group.map(item => item.memory).sort((a, b) => a - b);
              const medianMemory = sortedMemory[Math.floor(sortedMemory.length / 2)];
          
              // Find or create the series for this software
              let serie = series.find(serie => serie.name === software);
              if (!serie) {
                serie = { name: software, data: [] };
                series.push(serie);
              }
          
              // Add the data point to the series
              serie.data.push({ x: fileSize, y: medianMemory });
            }
            series.forEach(serie => {
              serie.data.sort((a, b) => a.x - b.x);
            });
            return series;
          },
          statsWithStdDev() { // NOT SURE IF IT WORKS
            const statsWithStdDev = { ...this.stats };
        
            for (const key in statsWithStdDev) {
              const group = this.groupedData[key];
        
              const durationMean = group.reduce((sum, item) => sum + item.duration, 0) / group.length;
              const memoryMean = group.reduce((sum, item) => sum + item.memory, 0) / group.length;
        
              const durationStdDev = Math.sqrt(group.reduce((sum, item) => sum + Math.pow(item.duration - durationMean, 2), 0) / group.length);
              const memoryStdDev = Math.sqrt(group.reduce((sum, item) => sum + Math.pow(item.memory - memoryMean, 2), 0) / group.length);
        
              statsWithStdDev[key].duration.stdDev = durationStdDev;
              statsWithStdDev[key].memory.stdDev = memoryStdDev;
            }
        
            return statsWithStdDev;
          },      speed() {
            function calculateSpeed(bytes, durationInMilliseconds) {
              const bytesToMB = bytes * 1.0E-6;
              const durationInSeconds = durationInMilliseconds / 1000;
              return bytesToMB / durationInSeconds;
            }
            const avgSpeed = []
  
          for (const key in this.stats) {
    const group = this.stats[key];
    const totalBytes = Number(key.split(':')[1]);
    const speed = calculateSpeed(totalBytes, group.duration.median);
  
    avgSpeed.push({
      name: key,
      data: [speed],
    });
    
  }
          
  // this.speedChartOptions.xaxis.cate gories = key.split(':')[0]
  
            return avgSpeed;
  
          },
          

           speedLabels() {
            const labels = [];
            for (const key in this.stats) {
              labels.push(key.split(':')[0]);
            }
            return labels;
          },


    },
}) // Store name

