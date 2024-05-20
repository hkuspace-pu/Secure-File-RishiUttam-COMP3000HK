<template>
    <div>
      {{store.speed}}
    <apexchart
          ref="speedChart"
        height="100%"

          :options="speedChartOptions"
          :series="store.speed"
        ></apexchart>

<!-- {{ store.speed }} -->
<!-- {{Object.keys(store.stats)}} -->
<!-- {{store.speedLabels}} -->

    </div>
</template>


<script setup>
import { ref,computed,watch } from "vue"
import prettyBytes from 'pretty-bytes'
import {useStore} from '../store/store';
const store = useStore();
const speedChart =  ref()
const SpeedSeries = ref([{
            data: [44, 55, 41, 64, 22, 43, 21]
          }, {
            data: [53, 32, 33, 52, 13, 44, 32]
          }])


          const speedChartOptions = computed(() => ({
  chart: {
    type: 'bar',
    height: 430
  },
  plotOptions: {
    bar: {
      horizontal: true,
        stacked: false,
      dataLabels: {},
    },
  },
  dataLabels: {
    enabled: false,
    offsetX: -6,
    style: {
      fontSize: '12px',
      colors: ['#fff']
    }
  },
  stroke: {
    show: true,
    width: 1,
    colors: ['#fff']
  },
  tooltip: {
    shared: true,
    intersect: false
  },
  xaxis: {
    categories: store.speedLabels,
  },
}));

    // watch(speedChart, () =>  {
    //   speedChart.value.updateOptions({
    //     xaxis: {categories: store.getStoreLabels}
    //   })
    // });


</script>


<style scoped>

</style>