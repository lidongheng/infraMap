<template>
  <div class="information-panel">
    <div class="header-row">
      <div class="section-title">关键信息</div>
      <FilterDropdowns
        v-model="filterValue"
        class="xpu-filter"
        :options="filterOptions"
        :filter-config="filterConfig"
      />
    </div>

    <div class="metric-row">
      <div
        v-for="item in xpuMetrics"
        :key="item.title"
        class="metric-card"
      >
        <div class="metric-title">▣ {{ item.title }}</div>
        <div class="metric-value">
          {{ item.value }}<span>{{ item.unit }} ▲{{ item.trend }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import FilterDropdowns from '@/components/FilterDropdowns.vue';
import { xpuMetrics } from './staticData';

const filterValue = ref(null);

const filterConfig = [
  {
    key: 'cardType',
    label: '卡类型',
    type: 'list',
    optionKey: 'cardTypeList',
    valueKey: 'cardTypeList',
  },
];

const filterOptions = {
  cardTypeList: [
    { label: 'A1', value: 'A1' },
    { label: 'A2', value: 'A2' },
    { label: 'A3', value: 'A3' },
    { label: 'A800', value: 'A800' },
    { label: 'H800', value: 'H800' },
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

.header-row {
  display: flex;
  align-items: center;
}

.header-row {
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-title,
.metric-title {
  color: #34356f;
  font-size: 17px;
  font-weight: 700;
}

.xpu-filter {
  flex-shrink: 0;
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.metric-card {
  min-height: 92px;
  padding: 8px 16px 8px 0;
  border-right: 1px solid #eef0f8;
}

.metric-card:last-child {
  border-right: 0;
}

.metric-value {
  margin-top: 16px;
  color: #333376;
  font-size: 34px;
  font-weight: 700;
  line-height: 1;
}

.metric-value span {
  margin-left: 8px;
  color: #77799e;
  font-size: 13px;
  font-weight: 400;
}

</style>
