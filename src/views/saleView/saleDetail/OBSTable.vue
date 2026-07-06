<template>
  <div class="detail-table-layout">
    <div class="table-toolbar">
      <div class="section-title">资源详情</div>
    </div>

    <div
      v-if="active === 'XPU'"
      class="range-toolbar"
    >
      <span class="range-label">范围粒度</span>
      <el-radio-group v-model="rangeValue" class="range-radios">
        <el-radio-button label="全部" value="全部" />
        <el-radio-button label="大区" value="大区" />
        <el-radio-button label="Region" value="Region" />
        <el-radio-button label="AZ" value="AZ" />
      </el-radio-group>
    </div>

    <div
      v-if="active === 'XPU'"
      class="xpu-table"
    >
      <div class="xpu-table-row xpu-table-head">
        <span>序号</span>
        <span>大区</span>
        <span>Region</span>
        <span>卡类型</span>
        <span>算力类型</span>
        <span>待分配量(卡)</span>
        <span>操作</span>
      </div>

      <template
        v-for="row in xpuRows"
        :key="row.index"
      >
        <div class="xpu-table-row">
          <span>{{ row.index }}</span>
          <span>{{ row.area }}</span>
          <span>{{ row.region }}</span>
          <span>{{ row.type }}</span>
          <span>{{ row.spec }}</span>
          <span class="stock-value">{{ row.stock }}</span>
          <button
            type="button"
            class="trend-button"
            @click="toggleTrend(row.index)"
          >
            {{ getTrendButtonText(row.index) }}
          </button>
        </div>

        <div
          v-if="expandedTrendIndex === row.index"
          class="trend-row"
        >
          <StaticChart :option="xpuTrendOption" />
        </div>
      </template>
    </div>

    <el-table
      v-else
      class="detail-table"
      :data="tableRows"
      height="438"
    >
      <el-table-column prop="index" label="序号" width="78" />
      <el-table-column
        v-for="column in tableColumns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :min-width="column.width"
      >
        <template #default="{ row }">
          <span :class="{ 'stock-value': column.prop === 'stock' }">
            {{ row[column.prop] }}
          </span>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-row">
      <span>共 2228 条</span>
      <el-select model-value="50条/页" size="small">
        <el-option label="50条/页" value="50条/页" />
      </el-select>
      <el-pagination layout="prev, pager, next, jumper" :total="2228" :page-size="50" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import StaticChart from './StaticChart.vue';
import { networkRows, obsRows, trendValues, xpuRows } from './staticData';

const props = defineProps({
  active: {
    type: String,
    required: true,
  },
});

const rangeValue = ref('全部');
const tableRows = computed(() => {
  if (props.active === 'network') {
    return networkRows;
  }

  if (props.active === 'XPU') {
    return xpuRows;
  }

  return obsRows;
});

const expandedTrendIndex = ref(null);
const xpuTrendOption = {
  grid: {
    left: 50,
    right: 28,
    top: 28,
    bottom: 36,
  },
  xAxis: {
    type: 'category',
    data: trendValues.map((item, index) => index + 1),
    boundaryGap: false,
    axisLabel: {
      color: '#8a8bab',
      fontSize: 11,
    },
    axisLine: {
      lineStyle: {
        color: '#e9ecf5',
      },
    },
    axisTick: {
      show: false,
    },
  },
  yAxis: {
    type: 'value',
    name: '月销量趋势',
    nameTextStyle: {
      color: '#34356f',
      fontWeight: 700,
      align: 'left',
      padding: [0, 0, 0, 4],
    },
    axisLabel: {
      color: '#8a8bab',
    },
    splitLine: {
      lineStyle: {
        color: '#edf0f8',
      },
    },
  },
  series: [
    {
      type: 'line',
      data: trendValues,
      symbol: 'circle',
      symbolSize: 5,
      lineStyle: {
        color: '#75a9dd',
        width: 2,
      },
      itemStyle: {
        color: '#fff',
        borderColor: '#75a9dd',
        borderWidth: 2,
      },
      label: {
        show: true,
        position: 'top',
        color: '#34356f',
        fontSize: 11,
      },
    },
  ],
};

function getTrendButtonText(index) {
  if (expandedTrendIndex.value === index) {
    return '关闭趋势';
  }

  return '查看趋势';
}

function toggleTrend(index) {
  // 同一时间只展开一行趋势，保持表格高度和截图一致。
  if (expandedTrendIndex.value === index) {
    expandedTrendIndex.value = null;
    return;
  }

  expandedTrendIndex.value = index;
}

const tableColumns = computed(() => {
  if (props.active === 'network') {
    return [
      { prop: 'exit', label: '公网出口', width: 180 },
      { prop: 'bandwidth', label: '峰值名称', width: 320 },
      { prop: 'stock', label: '可用带宽', width: 180 },
    ];
  }

  if (props.active === 'XPU') {
    return [
      { prop: 'area', label: '大区', width: 120 },
      { prop: 'region', label: 'Region', width: 180 },
      { prop: 'type', label: '卡类型', width: 120 },
      { prop: 'spec', label: '算力类型', width: 120 },
      { prop: 'stock', label: '待分配量(卡)', width: 140 },
    ];
  }

  return [
    { prop: 'area', label: '大区', width: 120 },
    { prop: 'region', label: 'Region', width: 180 },
    { prop: 'type', label: '存储类型', width: 120 },
    { prop: 'stock', label: '可售量(PB)', width: 140 },
  ];
});
</script>

<style scoped lang="less">
.detail-table-layout {
  min-height: 0;
  padding: 18px;
  box-sizing: border-box;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 10px 26px rgba(60, 65, 118, 0.08);
}

.table-toolbar,
.range-toolbar,
.pagination-row {
  display: flex;
  align-items: center;
}

.table-toolbar {
  margin-bottom: 8px;
}

.section-title {
  color: #34356f;
  font-size: 17px;
  font-weight: 700;
}

.range-toolbar {
  gap: 12px;
  margin-bottom: 12px;
}

.range-label {
  color: #8b8cae;
  font-size: 13px;
}

.range-radios :deep(.el-radio-button__inner) {
  height: 28px;
  padding: 0 16px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #595a8a;
  line-height: 28px;
  box-shadow: none;
}

.range-radios :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #39358e;
  color: #fff;
  box-shadow: none;
}

.detail-table {
  --el-table-header-bg-color: #f4f5fb;
  --el-table-border-color: #eceef7;
  color: #4d4e7c;
}

.xpu-table {
  overflow: hidden;
  border: 1px solid #eceef7;
  border-radius: 6px;
  color: #4d4e7c;
}

.xpu-table-row {
  min-height: 48px;
  display: grid;
  grid-template-columns: 78px minmax(90px, 1fr) minmax(160px, 1.4fr) minmax(90px, 1fr) minmax(110px, 1fr) minmax(130px, 1fr) 116px;
  align-items: center;
  border-bottom: 1px solid #eceef7;
}

.xpu-table-row span,
.trend-button {
  padding: 0 12px;
  box-sizing: border-box;
}

.xpu-table-head {
  min-height: 44px;
  background: #f4f5fb;
  color: #595a8a;
  font-weight: 700;
}

.trend-button {
  border: 0;
  background: transparent;
  color: #6262a8;
  cursor: pointer;
  font-size: 14px;
  text-align: left;
}

.trend-row {
  height: 258px;
  padding: 10px 12px 12px;
  box-sizing: border-box;
  border-bottom: 1px solid #eceef7;
  background: #fff;
}

.stock-value {
  color: #2d9a74;
  font-weight: 700;
}

.pagination-row {
  height: 42px;
  gap: 10px;
  color: #555681;
  font-size: 13px;
}

.pagination-row :deep(.el-select) {
  width: 98px;
}
</style>
