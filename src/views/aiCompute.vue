<template>
  <div class="container">
    <header class="header">
      <CommonTitle title="智算" icon-name="type">
        <template #select>
          <FilterDropdowns
            v-model="cardTypeFilterValue"
            :options="cardTypeFilterOptions"
            :filter-config="cardTypeFilterConfig"
            @change="onCardTypeFilterChange"
          />
        </template>
      </CommonTitle>
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
        <template v-if="!isSuperNode">
          <SwitchTableOrChart
            v-if="parentName !== '地域'"
            class="switch-btn"
            v-model="tableRadio"
          />
          <div v-show="tableRadio === 'chart'" class="trend trend-upSuperNode">
            <div class="ai-computer-power">
              <div class="trend-header">
                {{ activeTabYTitle }}
              </div>
              <div class="trend-chart">
                <AIComputerPower
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
              </div>
            </div>
            <ResourcePoolTable
              ref="tableRef"
              :data="chartData"
            />
          </div>
          <div v-if="tableRadio === 'table'" class="ai-table">
            Other Table
          </div>
        </template>
        
        <div v-else class="trend common-card-style2 trend-superNode">
          <div class="trend-header">
            NPU卡时使用率
          </div>
          <SuperNodeChart
            ref="superNodeChartRef"
            :data="superNodeData"
            :avgRangeList="superNodeAvgRangeList"
            :avg-x-from-frontend="currentConfig.avgXFromFrontend === true"
            @bubble-click="onBubbleClick"
            @visible-change="onVisibleChange"
            @collapse-change="onCollapseChange"
          />
          <ResourcePoolTable
            ref="tableRef"
            :data="chartData"
          />
        </div>
      </section>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import CommonTitle from "@/components/home/CommonTitle.vue";
import FilterDropdowns from "@/components/FilterDropdowns.vue";
import AICategoryNav from "@/components/AICategoryNav.vue";
import AIComputerPower from "./aiComputerPower.vue";
import SuperNodeChart from "./superNodeChart.vue";
import ResourcePoolTable from "@/components/ResourcePoolTable.vue";
import { selectedResourceType, parentName, isCustomer } from "./useAIComputer";
import { mockFetchEfficiency2, toSuperNodeChartData } from "./useSuperNodeChart";
import { useCurrentDate } from "./useCurrentDate";
import SwitchTableOrChart from "@/components/SwitchTableOrChart.vue";

const NPU_USEAGE_FOR_GENERATION = {
  key: "npuUsage",
  label: "资源池",
  xField: "_npuUseRate",
  yField: "_allocationRate",
  xAxisName: "NPU使用率",
  title: "分配率",
  yAxisName: "%",
  yRange: [0, 100],
  tooltipYLabel: "分配率",
  trafficLightKeys: { x: "NPU使用率", y: "A3分配率" },
  dataFilter: (d) => d.x != null && d.y != null && d._npuUseRate > 0,
};
const NPU_USEAGE_FOR_CUSTOMER = {
  key: "npuUsage",
  label: "资源池",
  xField: "_npuUseRate",
  yField: "_npuCardTimeUseRate",
  xAxisName: "NPU使用率",
  title: "NPU卡时使用率",
  yAxisName: "%",
  axisRangeDataPadding: 5,
  yTicks: [0, 10, 20, 30],
  tooltipYLabel: "NPU卡时使用率",
  trafficLightKeys: { x: "NPU使用率", y: "NPU卡时使用率" },
  dataFilter: (d) => d.x != null && d.y != null && d._npuUseRate > 0,
};
const SUPER_NODE_CONFIG = {
  key: "superNode",
  label: "超节点",
  avgXFromFrontend: true,
};

const { date: currentMonth } = storeToRefs(useCurrentDate());

const CARD_TYPE_VALUE_KEY = "cardType";
const cardTypeFilterConfig = [
  {
    key: CARD_TYPE_VALUE_KEY,
    label: "卡类型",
    type: "list",
    optionKey: CARD_TYPE_VALUE_KEY,
    valueKey: CARD_TYPE_VALUE_KEY,
  },
];
const cardTypeFilterOptions = {
  [CARD_TYPE_VALUE_KEY]: ["A3", "A2", "A1"],
};
const cardTypeFilterValue = ref({
  [CARD_TYPE_VALUE_KEY]: [selectedResourceType.value],
});

watch(selectedResourceType, (cardType) => {
  cardTypeFilterValue.value = {
    [CARD_TYPE_VALUE_KEY]: [cardType],
  };
});

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

const tabs = computed(() => {
  if (['A3'].includes(selectedResourceType.value) ||
    ['代次'].includes(parentName.value) && !selectedResourceType.value) {
      return [NPU_USEAGE_FOR_GENERATION, SUPER_NODE_CONFIG];
  } else if (isCustomer.value) {
    return [NPU_USEAGE_FOR_CUSTOMER];
  } else {
    return [NPU_USEAGE_FOR_GENERATION];
  }
});
const activeTab = ref(tabs.value[0].key);
const activeTabYTitle = ref(tabs.value[0].title);

const chartRef = ref(null);
const superNodeChartRef = ref(null);
const tableRef = ref(null);
const tierFilter = ref(null);

const isSuperNode = computed(() => activeTab.value === "superNode");

watch(tabs, (newTabs) => {
  activeTab.value = newTabs[0].key;
  activeTabYTitle.value = newTabs[0].title;
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

function onCardTypeFilterChange(value) {
  const [cardType] = value[CARD_TYPE_VALUE_KEY];
  // FilterDropdowns 是多选形态；智算页现有卡类型状态只接收单个有效值。
  if (!cardType) return;
  selectedResourceType.value = cardType;
}

const tableRadio = ref('chart');
</script>

<style scoped lang="less">
.flex-center {
  display: flex;
  align-items: center;
}

.container {
  width: 100%;
  max-width: calc(100vw - 32px);
  box-sizing: border-box;
  border-radius: 16px;
  background-color: rgba(221, 227, 246, 0.4);
  box-shadow: 0 4px 4px 0 rgba(33, 48, 92, 0.2);
  padding: 24px 24px 19px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .header {
    width: 100%;
    min-width: 0;
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

      .switch-btn {
        align-self: flex-end;
        margin: 8px 0 14px;
      }

      .trend {
        flex: 1;
        min-height: 0;
        min-width: 0;
        padding: 18px 20px;
        border-radius: 14px;
        background: rgba(246, 248, 252, 0.9);
        box-sizing: border-box;
      }

      .trend-upSuperNode {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .trend-superNode {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .ai-computer-power {
        flex-shrink: 0;
        min-width: 0;
      }

      .trend-header {
        height: 32px;
        display: flex;
        align-items: flex-start;
        color: #16183d;
        font-size: 20px;
        font-weight: 700;
        line-height: 28px;
      }

      .trend-chart {
        width: 100%;
        min-width: 0;
        height: 380px;
      }

      .ai-table {
        flex: 1;
        min-height: 460px;
        min-width: 0;
        padding: 24px;
        border-radius: 14px;
        background: rgba(246, 248, 252, 0.9);
        color: #353575;
        font-size: 16px;
        font-weight: 600;
        box-sizing: border-box;
      }
    }
  }
}
</style>
