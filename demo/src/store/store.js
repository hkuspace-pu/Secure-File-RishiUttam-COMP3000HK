import { defineStore } from 'pinia'

export const useStore = defineStore("store", {
    state: () => ({
        
            isPublicKeyModalOpen:false,
            passphrase : '',
            testResults : []
        
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
           
          }
    },
}) // Store name

