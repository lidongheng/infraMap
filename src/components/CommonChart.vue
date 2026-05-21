<template>
  <div ref="chartContainer" class="chart-dom" :style="containerStyle"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import * as echarts from 'echarts';
import { changeValueByScale } from '@/composables/autoLayout';

const props = defineProps({
  options: {
    type: Object,
    required: true,
  },
  autoResize: {
    type: Boolean,
    default: true,
  },
  fixHeight: {
    type: Number,
    default: null,
  },
  style: {
    type: Object,
    default: () => ({}),
  },
  theme: {
    type: String,
    default: '',
  },
  lazyInit: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(['chartReady', 'chartUpdaed', 'chartError']);

const chartContainer = ref(null);
let myChart = null;
let isInitialized = false;

// 计算容器样式（优先使用 style 中的 width/height，支持数字或百分比）
const containerStyle = computed(() => {
  const w = props.width ?? props.style?.width ?? 160;
  const h = props.height ?? props.style?.height ?? 86;
  const widthVal = typeof w === 'string' ? w : `${changeValueByScale(w)}px`;
  const heightVal = typeof h === 'string' ? h : `${changeValueByScale(h)}px`;
  const styleValue = {
    ...props.style,
    width: widthVal,
    height: heightVal,
  };
  return styleValue;
});

// 初始化图表
const initChart = () => {
  if (!chartContainer.value || isInitialized) return;

  try {
    myChart = echarts.init(chartContainer.value, props.theme);
    isInitialized = true;

    // 设置初始配置
    if (props.options) {
      myChart.setOption(props.options, true);
    }

    // 触发图表就绪事件
    emit('chartReady', myChart);

    // 如果需要自动调整大小
    if (props.autoResize) {
      window.addEventListener('resize', resize);
    }

  } catch (error) {
    emit('chartError', error);
  }
};

// 更新图表配置
const updateChart = (newOptions) => {
  if (!myChart) return;

  try {
    myChart.setOption(newOptions, true);
    emit('chartUpdated', myChart);
  } catch (error) {
    emit('chartError', error);
  }
};

// 手动调整大小
const resize = () => {
  if (myChart) {
    myChart.resize(containerStyle.value);
  }
};

// 清理图表
const dispose = () => {
  if (myChart) {
    myChart.dispose();
    myChart = null;
    isInitialized = false;
    window.removeEventListener('resize', resize);
  }
};

// 获取图表实例
const getInstance = () => {
  return myChart;
};

// 监听 options 变化
watch(() => props.options, (newOptions) => {
  if (isInitialized && newOptions) {
    updateChart(newOptions);
  }
}, { deep: true });

onMounted(() => {
  if (!props.lazyInit) {
    initChart();
  }
});

onUnmounted(() => {
  dispose();
});

defineExpose({
  initChart,
  updateChart,
  resize,
  dispose,
  getInstance,
});
</script>

<style lang="less" scoped>
.chart-dom {
  width: 100%;
  height: 100%;
}
</style>
