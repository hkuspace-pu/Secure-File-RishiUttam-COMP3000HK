<template>
    <div class="box">
      <!-- <h2>Throughput</h2> -->
      <!-- {{store.speed}} -->

    <apexchart
          ref="speedChart"
        height="100%"
        width="100%"

          :options="speedChartOptions"
          :series="medianThroughputs"
        ></apexchart>

        <!-- {{store.stats}} -->
<!-- {{ store.speed }} -->
<!-- {{Object.keys(store.stats)}} -->
<!-- {{store.speedLabels}} -->
<!-- {{medianThroughputs}} -->
<!-- {{throughPutkeys}} -->
    </div>
</template>


<script setup>
import { ref,computed,watch } from "vue"
import prettyBytes from 'pretty-bytes'
import {useStore} from '../store/store';
const store = useStore();
const speedChart =  ref()




        const medianThroughputs = computed(() => {
  if (store.stats && Object.keys(store.stats).length > 0) {
    return [{ data: Object.keys(store.stats).map(key => store.stats[key].throughput.median) }];
  } else {
    return [{ data: [] }];
  }
});

const throughPutkeys = computed(() => {
  return store.stats ? Object.keys(store.stats) : [];
});


          const speedChartOptions = computed(() => ({
  chart: {
    type: 'bar',
    // height: 430
  },
  title: {
    text: "Throughput MB/sec",
    align: "left",
  },
  plotOptions: {
    bar: {
      horizontal: true,
         barHeight: "50%",
        stacked: false,
      dataLabels: { position: 'top'},
    },
  },
  dataLabels: {
    enabled: true,
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
  // tooltip: {
  //   shared: true,
  //   intersect: false
  // },
  xaxis: {
    categories: throughPutkeys.value,
    title: {
        text: "MB",
      },
  },
    // colors: defaultColors,
}));

  ;


</script>


<style scoped>
.box {
  padding: 12px;
  border-radius: 5px;
  display: flex;
gap: 5px;
 flex:1;
  flex-direction: column;
  border: 1px solid rgb(230, 230, 230);
  box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1);
}
</style>