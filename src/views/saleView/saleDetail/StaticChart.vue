<template>
  <div ref="chartRef" class="static-chart"></div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  option: {
    type: Object,
    required: true,
  },
});

const chartRef = ref(null);
let chartInstance = null;

function resizeChart() {
  if (chartInstance) {
    chartInstance.resize();
  }
}

function renderChart() {
  if (!chartInstance) {
    return;
  }

  chartInstance.setOption(props.option, true);
}

onMounted(() => {
  chartInstance = echarts.init(chartRef.value, null, {
    renderer: 'svg',
  });
  renderChart();
  window.addEventListener('resize', resizeChart);
});

watch(
  () => props.option,
  () => {
    renderChart();
  },
  { deep: true }
);

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart);
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});
</script>

<style lang="less" scoped>
.static-chart {
  width: 100%;
  height: 100%;
}
</style>
