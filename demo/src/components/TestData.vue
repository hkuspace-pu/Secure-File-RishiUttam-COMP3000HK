<template>
  <div v-if="store.testResults">
  <h3>Test Data</h3>
      <DataTable resizableColumns lazy stripedRows :value="store.testResults" tableStyle="min-width:60rem">
      <!-- <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header"></Column> -->
      <!-- <Column v-for="col of columns" :key="col.software" :field="asd" header="SOFT"></Column> -->

    <Column field="software" header="Software"></Column>
    <Column :field="callPrettyBytesSize" header="FileSize"></Column>
    <Column field="duration" header="Duration(ms)"></Column>
    <Column :field= "callPrettyBytes" header="Memory"></Column>
{{store.testResults}}
</DataTable>
</div>
</template>

<script setup>
import prettyBytes from 'pretty-bytes'
import {useStore} from '../store/store';
const store = useStore();
import DataTable from 'primevue/datatable'
import Column from 'primevue/column';


const callPrettyBytes = (value) => {
  // console.log('pp',value.Size)
  return prettyBytes(value.memory)
}
const callPrettyBytesSize = (value) => {
  // console.log('pp',value.Size)
  return prettyBytes(value.fileSize)
}
</script>

<style>

</style>