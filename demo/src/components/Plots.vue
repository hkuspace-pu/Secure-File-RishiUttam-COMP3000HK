<template>
  <div class="BoxPlot">


    <div id="chart">
        <apexchart id="duration" type="boxPlot" height="350" :options="options" :series="store.boxPlotDuration"></apexchart>
      </div>
      <div id="chartmem">
        <apexchart id="memory" type="boxPlot" height="350" :options="options" :series="store.boxPlotMemory"></apexchart>
      </div>
{{store.boxPlotDuration}}


</div>

</template>
<script setup>
import { ref } from "vue"
// import prettyBytes from 'pretty-bytes'
import {useStore} from '../store/store';
const store = useStore();


const options = ref({
  chart: {
              type: 'boxPlot',
              height: 350
            },
            title: {
              text: 'Horizontal BoxPlot Chart',
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


</script>

<style scoped>

.boxPlot {
  display:flex;
  flex-direction:row;
  gap:1rem;
}

</style>