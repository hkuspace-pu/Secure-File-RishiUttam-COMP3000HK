<template>
  <div class="chartContainer">
    <div class="boxCharts">
      <div class="boxPlot">
        <apexchart
          id="duration"
          type="boxPlot"
          ref="boxPlotDuration"
          height="350"
          :options="optionsDuration"
          :series="store.boxPlotDuration"
        ></apexchart>
      </div>

      <div class="boxPlot">
        <apexchart
          id="memory"
          type="boxPlot"
          height="350"
          ref="boxPlotMemory"
          :options="optionsMemory"
          :series="store.boxPlotMemory"
        ></apexchart>
      </div>
    </div>
    <div class="boxCharts">
      <div class="lineChart">
        <apexchart
          type="line"
          height="350"
          :options="optionsLine"
          :series="store.lineChartDuration"
        ></apexchart>
      </div>

      <div class="lineChart">
        <apexchart
          type="line"
          height="350"
          :options="optionsLineMemory"
          :series="store.lineChartMemory"
        ></apexchart>
      </div>
    </div>

    {{ store.statsWithStdDev }}
  </div>
</template>
<script setup>
import { ref, computed, watch } from "vue";
import prettyBytes from "pretty-bytes";
import { useStore } from "../store/store";
const store = useStore();

// const bpMem = computed({
//   get: () => store.boxPlotMemory,
//   set: (value) => store.setPassphrase(value), // replace with your action
// });

const optionsLine = ref({
  chart: {
    type: "line",

    toolbar: {
      show: true,
    },
  },
  markers: {
    size: 7,
  },

  stroke: {
    curve: "smooth",
  },
  xaxis: {
    // width: '10',
    type: "numeric",
    title: {
      text: "File Size",
    },
    labels: {
      formatter: (value) => prettyBytes(+value),
    },
  },

  yaxis: {
    logarithmic: false,
    title: {
      text: "Median Duration (ms)",
    },
    labels: {
      formatter: (value) => `${Math.floor(value)}ms`,
    },
  },
  title: {
    text: "Median Duration (ms) by File Size",
    align: "left",
  },
  tooltip: {
    x: {
      formatter: (value) => prettyBytes(+value),
    },
  },
});

const optionsLineMemory = ref({
  chart: {
    type: "line",

    toolbar: {
      show: true,
    },
  },
  markers: {
    size: 7,
  },

  stroke: {
    curve: "smooth",
  },
  xaxis: {
    type: "numeric",
    title: {
      text: "File Size",
    },
    labels: {
      formatter: (value) => prettyBytes(+value),
    },
  },
  yaxis: {
    logarithmic: false,
    title: {
      text: "Memory Consumption",
    },
    labels: {
      formatter: (value) => prettyBytes(+value),
    },
  },
  title: {
    text: "Median Memory by File Size",
    align: "left",
  },
  tooltip: {
    // x: {
    //   formatter: (value) => prettyBytes(value)
    // }
  },
});
const optionsDuration = ref({
  chart: {
    type: "boxPlot",
  },
  title: {
    text: "Duration (ms)",
    align: "left",
  },
  plotOptions: {
    bar: {
      horizontal: true,
      barHeight: "25%",
    },
    xaxis: {
      logarithmic: false,
      labels: {
        formatter: function (val) {
          return prettyBytes(val);
        },
      },
    },
    boxPlot: {
      colors: {
        upper: "#e9ecef",
        lower: "#f8f9fa",
      },
    },
  },
  stroke: {
    colors: ["#6c757d"],
  },
});

const optionsMemory = ref({
  chart: {
    type: "boxPlot",
    // height: 350
  },
  title: {
    text: "Memory Consumption",
    align: "left",
  },
  xaxis: {

      labels: {
        formatter: (value) => prettyBytes(+value),
      },

  },
  plotOptions: {
    bar: {
      horizontal: true,
      barHeight: "25%",
    },
    boxPlot: {
      colors: {
        upper: "#e9ecef",
        lower: "#f8f9fa",
      },
    },
  },
  stroke: {
    colors: ["#6c757d"],
  },
});
</script>

<style scoped>
.chartContainer {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.boxCharts {
  display: flex;
  flex-direction: row;
  /* width: 50%; */
}

.boxPlot {
  width: 50%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.lineChart {
  width: 50%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>