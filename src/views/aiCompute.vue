<template>
  <div class="container">
    <header class="header flex-center">
      <span class="title">xxxxxxxxx</span>
    </header>
    <section class="main flex-center">
      <section class="main-left">
        <AICategoryNav />
      </section>
      <section class="main-right">
        <div v-if="tabs.length > 1" class="tab-bar">
          <div
            v-for="tab in tabs"
            :key="tab.key"
            class="tab-item"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </div>
        </div>
        <div class="chart-area" :class="{ 'chart-area--collapsed': chartCollapsed }">
          <AIComputerPower
            v-if="activeTab !== 'superNode'"
            ref="chartRef"
            :xField="currentConfig.xField"
            :yField="currentConfig.yField"
            :xAxisName="currentConfig.xAxisName"
            :title="currentConfig.title"
            :yAxisName="currentConfig.yAxisName"
            :yRange="bubbleChartYRange"
            :y-ticks="bubbleChartYTicks"
            :axis-range-data-padding="bubbleChartAxisPadding"
            :tooltipYLabel="currentConfig.tooltipYLabel"
            :avgXField="currentConfig.xField"
            :trafficLightKeys="currentConfig.trafficLightKeys"
            :dataFilter="currentConfig.dataFilter ?? null"
            @bubble-click="onBubbleClick"
            @visible-change="onVisibleChange"
          />
          <SuperNodeChart
            v-else
            ref="superNodeChartRef"
            :data="superNodeData"
            :avgRangeList="superNodeAvgRangeList"
            :avg-x-from-frontend="currentConfig.avgXFromFrontend === true"
            @bubble-click="onBubbleClick"
            @visible-change="onVisibleChange"
            @collapse-change="onCollapseChange"
          />
        </div>
        <ResourcePoolTable
          ref="tableRef"
          :data="chartData"
        />
      </section>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import AICategoryNav from "@/components/AICategoryNav.vue";
import AIComputerPower from "./aiComputerPower.vue";
import SuperNodeChart from "./superNodeChart.vue";
import ResourcePoolTable from "@/components/ResourcePoolTable.vue";
import { activeAICategory } from "./useAIComputer";
import { mockFetchEfficiency2, toSuperNodeChartData } from "./useSuperNodeChart";
import { useCurrentDate } from "./useCurrentDate";

const CATEGORY_CONFIG = {
  A3: {
    tabs: [
      {
        key: "npuUsage",
        label: "资源池",
        xField: "_npuUseRate",
        yField: "_allocationRate",
        xAxisName: "NPU使用率",
        title: "分配率",
        yAxisName: "%",
        /** 未启用 axisRangeDataPadding 时使用 */
        yRange: [0, 100],
        /** 设为数字则与 commonComputerPower 相同：按 yField 数据驱动 Y 轴刻度；null 表示关闭 */
        axisRangeDataPadding: 5,
        yTicks: [0, 25, 50, 75, 100],
        tooltipYLabel: "A3分配率",
        trafficLightKeys: { x: "NPU使用率", y: "A3分配率" },
        dataFilter: (d) => d.x != null && d.y != null && d._npuUseRate > 0,
      },
      {
        key: "superNode",
        label: "超节点",
        avgXFromFrontend: true,
      },
    ],
  },
};

const { date: currentMonth } = storeToRefs(useCurrentDate());

const xpodDetailData = ref({});
const fetchXpodDetail = async () => {
  const response = await mockFetchEfficiency2();
  xpodDetailData.value = response.data;
};

const superNodeData = computed(() => {
  const list = xpodDetailData.value?.quadrantVo?.list;
  return list ? toSuperNodeChartData(list) : [];
});
const superNodeAvgRangeList = computed(() =>
  xpodDetailData.value?.quadrantVo?.avgRangeList ?? []
);

const tabs = computed(() => CATEGORY_CONFIG[activeAICategory.value]?.tabs ?? CATEGORY_CONFIG.A3.tabs);
const activeTab = ref(tabs.value[0].key);

const chartRef = ref(null);
const superNodeChartRef = ref(null);
const tableRef = ref(null);
const tierFilter = ref(null);

const isSuperNode = computed(() => activeTab.value === "superNode");

watch(tabs, (newTabs) => {
  activeTab.value = newTabs[0].key;
});

watch(isSuperNode, () => {
  if (isSuperNode.value) {
    fetchXpodDetail();
  }
});

watch(currentMonth, () => {
  if (isSuperNode.value) {
    fetchXpodDetail();
  }
});

watch(activeTab, () => {
  tierFilter.value = null;
  chartCollapsed.value = false;
});

const currentConfig = computed(() =>
  tabs.value.find((t) => t.key === activeTab.value) ?? tabs.value[0]
);

/** 与「无有效气泡点」判定一致：null / 非有限数字视为无效，数值为 0 视为零 */
function isNullOrZeroAxisValue(v) {
  if (v == null) return true;
  const n = Number(v);
  if (!Number.isFinite(n)) return true;
  return n === 0;
}

/** 无行，或每一行 x、y 均为 null/0（无有效坐标） */
function isAllBubbleAxesNullOrZero(rows) {
  if (!rows.length) return true;
  return rows.every(
    (row) => isNullOrZeroAxisValue(row.x) && isNullOrZeroAxisValue(row.y)
  );
}

const currentChartRef = computed(() =>
  activeTab.value === "superNode" ? superNodeChartRef.value : chartRef.value
);
const allData = computed(() => currentChartRef.value?.data ?? []);

/** 气泡图：数据全空/全为 0 时用固定 [0,100] 与关闭按数据驱动的 Y 轴配置 */
const isBubbleAxisDataDegenerate = computed(() => {
  if (activeTab.value === "superNode") return false;
  return isAllBubbleAxesNullOrZero(allData.value);
});

const bubbleChartYRange = computed(() =>
  isBubbleAxisDataDegenerate.value
    ? [0, 100]
    : currentConfig.value.yRange
);

const bubbleChartYTicks = computed(() =>
  isBubbleAxisDataDegenerate.value
    ? null
    : currentConfig.value.yTicks ?? null
);

const bubbleChartAxisPadding = computed(() =>
  isBubbleAxisDataDegenerate.value
    ? null
    : currentConfig.value.axisRangeDataPadding ?? null
);
const chartData = computed(() =>
  tierFilter.value ? allData.value.filter(tierFilter.value) : allData.value
);

const chartCollapsed = ref(false);

function onCollapseChange(isCollapsed) {
  chartCollapsed.value = isCollapsed;
}

function onVisibleChange(filterFn) {
  tierFilter.value = filterFn;
}

function onBubbleClick(detail) {
  const azName = detail.azName || detail.name;
  tableRef.value?.scrollToByName(azName);
}
</script>

<style scoped lang="less">
.flex-center {
  display: flex;
  align-items: center;
}

.container {
  width: 1872px;
  border-radius: 16px;
  background-color: rgba(221, 227, 246, 0.4);
  box-shadow: 0 4px 4px 0 rgba(33, 48, 92, 0.2);
  padding: 24px 24px 19px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .header {
    column-gap: 8px;
    .title {
      font-size: 22px;
      font-weight: bold;
      line-height: 29px;
      color: #353575;
    }
  }

  .main {
    flex: 1;
    min-height: 0;
    gap: 24px;
    align-items: stretch;

    .main-left {
      flex-shrink: 0;
      width: 30px;
      min-width: 30px;
    }

    .main-right {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .tab-bar {
        display: flex;
        flex-shrink: 0;

        .tab-item {
          padding: 8px 20px;
          font-size: 16px;
          color: #606266;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;

          &:hover {
            color: #353575;
          }

          &.active {
            color: #353575;
            font-weight: 600;
            border-bottom-color: #353575;
          }
        }
      }

      .chart-area {
        flex-shrink: 0;
        height: 380px;
        transition: height 0.3s ease;

        &.chart-area--collapsed {
          height: 255px;
        }
      }
    }
  }
}
</style>
