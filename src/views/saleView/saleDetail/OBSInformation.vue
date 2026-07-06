<template>
  <div class="information-panel">
    <div class="metric-row">
      <div
        v-for="item in obsMetrics"
        :key="item.title"
        class="metric-card"
      >
        <div class="metric-title">▣ {{ item.title }}</div>
        <div class="metric-value">
          {{ item.value }}<span>{{ item.unit }} ▲{{ item.trend }}</span>
        </div>
      </div>
    </div>

    <div class="chart-section">
      <div class="section-title">Region Top10</div>
      <StaticChart :option="stackOption" />
    </div>
  </div>
</template>

<script setup>
import StaticChart from './StaticChart.vue';
import { obsMetrics, obsStackBars } from './staticData';

const stackOption = {
  grid: {
    left: 48,
    right: 24,
    top: 36,
    bottom: 42,
  },
  legend: {
    right: 10,
    top: 4,
    itemWidth: 9,
    itemHeight: 9,
    textStyle: {
      color: '#5e5f91',
      fontSize: 12,
    },
  },
  xAxis: {
    type: 'category',
    data: obsStackBars.map((item) => item.name),
    axisLabel: {
      color: '#7c7da4',
      fontSize: 11,
    },
    axisTick: {
      show: false,
    },
    axisLine: {
      lineStyle: {
        color: '#eef0f8',
      },
    },
  },
  yAxis: {
    type: 'value',
    name: 'PB',
    nameTextStyle: {
      color: '#7c7da4',
    },
    axisLabel: {
      color: '#7c7da4',
    },
    splitLine: {
      lineStyle: {
        color: '#edf0f8',
      },
    },
  },
  series: [
    {
      name: '单AZ',
      type: 'bar',
      stack: 'total',
      barWidth: 30,
      data: obsStackBars.map((item) => item.single),
      itemStyle: {
        color: '#7db8f0',
      },
      label: {
        show: true,
        color: '#fff',
        fontSize: 10,
      },
    },
    {
      name: '三AZ',
      type: 'bar',
      stack: 'total',
      barWidth: 30,
      data: obsStackBars.map((item) => item.multi),
      itemStyle: {
        color: '#6d62bb',
      },
      label: {
        show: true,
        color: '#fff',
        fontSize: 10,
      },
    },
  ],
};
</script>

<style scoped lang="less">
.information-panel {
  min-width: 0;
  padding: 18px 20px;
  box-sizing: border-box;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 10px 26px rgba(60, 65, 118, 0.08);
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.metric-card {
  min-height: 92px;
  padding: 8px 20px 8px 0;
  border-right: 1px solid #eef0f8;
}

.metric-card:last-child {
  border-right: 0;
}

.metric-title,
.section-title {
  color: #34356f;
  font-size: 17px;
  font-weight: 700;
}

.metric-value {
  margin-top: 16px;
  color: #333376;
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
}

.metric-value span {
  margin-left: 8px;
  color: #77799e;
  font-size: 14px;
  font-weight: 400;
}

.chart-section {
  height: 230px;
  margin-top: 12px;
}

.section-title {
  height: 24px;
}

.chart-section :deep(.static-chart) {
  height: calc(100% - 24px);
}
</style>
