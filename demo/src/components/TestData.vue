<template>
  <div class="testData">
  <!-- <h3>Results</h3> -->
      <DataTable sortField="duration" :sortOrder="-1" resizableColumns lazy stripedRows :value="store.testResults" tableStyle="min-width:60rem">
    <Column dataKey="software" field="software" header="Software"></Column>
    <Column dataKey="fileSize" :field="callPrettyBytesSize" header="FileSize"></Column>
    <Column dataKey="throughput" field="throughput" header="Throughput MB/s"></Column>
    <Column dataKey="duration" :sortable="true" field="duration" header="Duration(ms)"></Column>
    <Column dataKey="memory" sortable :field= "callPrettyBytes" header="Memory"></Column>
</DataTable>
<!-- {{console.table(store.groupedData)}}
{{store.groupedData}} -->
<p></p>
<!-- {{console.table(store.stats)}} -->
<!-- {{store.stats}} -->
<!-- {{store.testResults}} -->


<div v-if="store.testResults.length">
  <p>Min,Max, Median for all runs (Duration and Memory)</p>
  <DataTable v-for="(value, key) in store.stats" :key="key" :value="[value]">
    {{key}}
  <Column field="duration.min" header="Duration Min"></Column>
  <!-- <Column field="duration.q1" header="Duration Q1"></Column> -->
      <Column field="duration.median" header="Duration (ms) Median"></Column>
      <!-- <Column field="duration.q3" header="Duration Q3"></Column> -->
      <Column field="duration.max" header="Duration Max"></Column>
      <Column field="memory.min" header="Memory Min"></Column>
      <!-- <Column field="memory.q1" header="Memory Q1"></Column> -->
      <Column field="memory.median" header="Memory  Median"></Column>
      <!-- <Column field="memory.q3" header="Memory Q3"></Column> -->
      <Column field="memory.max" header="Memory Max"></Column>
      <Column field="throughput.min" header="Throughput Min"></Column>
      <!-- <Column field="throughput.q1" header="Throughput Q1"></Column> -->
      <Column field="throughput.median" header="Throughput Median"></Column>
      <!-- <Column field="throughput.q3" header="ThroughputQ3"></Column> -->
      <Column field="throughput.max" header="Throughput Max"></Column>
    </DataTable>

</div>

</div>

</template>
<script setup>
import { ref } from "vue"
import prettyBytes from 'pretty-bytes'
import {useStore} from '../store/store';
const store = useStore();
import DataTable from 'primevue/datatable'
import Column from 'primevue/column';


const stats = ref(store.stats);
const callPrettyBytes = (value) => {
  // console.log('pp',value.Size)
  return prettyBytes(value.memory)
}
const callPrettyBytesSize = (value) => {
  // console.log('pp',value.Size)
  return prettyBytes(value.fileSize)
}


const callPrettyBytesSizeMin = (value) => {
  // console.log('pp',value.Size)
  return prettyBytes(value.min)
}

const callPrettyBytesSizeMax = (value) => {
  // console.log('pp',value.Size)
  return prettyBytes(value.max)
}

const callPrettyBytesSizeMedium = (value) => {
  // console.log('pp',value.Size)
  return prettyBytes(value.medium)
}


</script>

<style scoped>
.testData {
  overflow-y:auto;
  padding:2rem;
  width: 100%;
  display:flex;
  flex-direction:column;
  gap:2rem;
}
</style>