<template>
  <div class="charts">


    <div class="boxPlot">
        <apexchart id="duration" type="boxPlot" height="350" :options="optionsDuration" :series="store.boxPlotDuration"></apexchart>
      </div>

      <div class="boxPlot">
        <apexchart id="memory" type="boxPlot" height="350" :options="optionsMemory" :series="store.boxPlotMemory"></apexchart>
      </div>
<!-- {{store.boxPlotDuration}} -->


</div>

</template>
<script setup>
import { ref } from "vue"
import prettyBytes from 'pretty-bytes'
import {useStore} from '../store/store';
const store = useStore();


const optionsDuration = ref({
  chart: {
              type: 'boxPlot',
              // height: 350
            },
            title: {
              text: 'Duration (ms)',
              align: 'left'
            },
            plotOptions: {
              bar: {
                horizontal: true,
                barHeight: '25%'
              },
              boxPlot: {
                colors: {
                  upper: '#e9ecef',
                  lower: '#f8f9fa'
                }
              }
            },
            stroke: {
              colors: ['#6c757d']
            }
          })

          const optionsMemory = ref({
  chart: {
              type: 'boxPlot',
              // height: 350
            },
            title: {
              text: 'Memory Consumption',
              align: 'left'
            },
            xaxis: {
    labels: {
      formatter: function(val) {
        // Format the x-axis labels
        return prettyBytes(val);
      }
    }
  },
            plotOptions: {
              bar: {
                horizontal: true,
                barHeight: '25%'
              },
              boxPlot: {
                colors: {
                  upper: '#e9ecef',
                  lower: '#f8f9fa'
                }
              }
            },
            stroke: {
              colors: ['#6c757d']
            }
          })


</script>

<style scoped>

.charts {
  width: 100%;
  border:1px solid red;
  display:flex;
  flex-direction:row;
  gap:1rem;
}

.boxPlot {
  width: 50%;
  border:1px solid blue;
  display:flex;
  flex-direction:column;
  gap:1rem;
}

</style>