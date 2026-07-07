<template>
  <div class="information-panel">
    <div class="header-row">
      <div class="section-title">关键信息</div>
      <FilterDropdowns
        v-model="filterOtherValue"
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
import { computed } from 'vue';
import FilterDropdowns from '@/components/FilterDropdowns.vue';
import { filterOtherValue, keyInfor, tableSummary } from './useResourceData';

const filterConfig = [
  {
    key: 'cardType',
    label: '卡类型',
    type: 'list',
    optionKey: 'cardTypeList',
    valueKey: 'cardTypeList',
  },
];

// XPU 卡片里的卡数统一用千分位展示，保持和表格数值风格一致。
const formatCardCount = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  return Number(value).toLocaleString();
};

// 关键信息和筛选选项都来自 XPU 趋势接口，避免和静态 mock 分叉。
const xpuTrendList = computed(() => {
  if (!Array.isArray(keyInfor.xpu.trend)) {
    return [];
  }

  return keyInfor.xpu.trend;
});

// 卡类型筛选项由接口数据反推，后续真实接口新增卡型时不用同步改静态枚举。
const filterOptions = computed(() => {
  const cardTypeList = Array.from(
    new Set(xpuTrendList.value.map((item) => item.cardModel))
  ).map((item) => {
    return {
      label: item,
      value: item,
    };
  });

  return {
    cardTypeList,
  };
});

// 某个卡型的待分配量需要从趋势数据里按 cardModel 聚合。
const getCardCount = (cardModel) => {
  return xpuTrendList.value.reduce((total, item) => {
    if (item.cardModel !== cardModel) {
      return total;
    }

    return total + Number(item.unallocatedXpu);
  }, 0);
};

// 顶部四个指标卡保留截图文案，数值接入 useResourceData 中的接口状态。
const xpuMetrics = computed(() => {
  const totalCount = xpuTrendList.value.reduce((total, item) => {
    return total + Number(item.unallocatedXpu);
  }, 0);

  return [
    {
      title: '总待分配量（卡）',
      value: formatCardCount(totalCount),
      unit: '纳上月',
      trend: formatCardCount(tableSummary.xpu.unallocatedXpu),
    },
    {
      title: 'A3待分配量（卡）',
      value: formatCardCount(getCardCount('A3')),
      unit: '纳上月',
      trend: formatCardCount(tableSummary.xpu.allocatedXpu),
    },
    {
      title: 'A2待分配量（卡）',
      value: formatCardCount(getCardCount('A2')),
      unit: '纳上月',
      trend: formatCardCount(tableSummary.xpu.sellableXpu),
    },
    {
      title: 'A1待分配量（卡）',
      value: formatCardCount(getCardCount('A1')),
      unit: '纳上月',
      trend: formatCardCount(tableSummary.xpu.totalXpu),
    },
  ];
});
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
