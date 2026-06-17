<template>
  <div class="container">
    <header class="header">
      <CommonTitle title="智算" icon-name="type">
        <template #select>
          <FilterDropdowns
            v-model="overviewFilterValue"
            :options="overviewFilterOptions"
            :filter-config="overviewFilterConfig"
            @change="onOverviewFilterChange"
          />
        </template>
      </CommonTitle>
    </header>
    <section class="main flex-center">
      <section class="main-left">
        <AICategoryNav
          :compute-items="filteredComputeItems"
          :token-items="filteredTokenItems"
          :token-customer-items="tokenCustomerItems"
        />
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
                  :static-data="currentStaticChartData"
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
import {
  aiOverviewMode,
  selectedCustomerType,
  selectedModelType,
  selectedResourceType,
  selectedTokenGroup,
  parentName,
  isCustomer,
} from "./useAIComputer";
import { mockFetchEfficiency2, toSuperNodeChartData } from "./useSuperNodeChart";
import { useCurrentDate } from "./useCurrentDate";
import SwitchTableOrChart from "@/components/SwitchTableOrChart.vue";
import { AI_SIZE_TIERS, applyBubbleConfig } from "./commonComputerPowerConfig";

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
const TOKEN_MODEL_MODE_CONFIG = {
  key: "tokenUsage",
  label: "资源池",
  xField: "_tokenUseRate",
  yField: "_actualTps",
  xAxisName: "Token利用率",
  title: "实际TPS",
  yAxisName: "TPS",
  yRange: [0, 100],
  tooltipYLabel: "实际TPS",
  trafficLightKeys: { x: "Token利用率", y: "实际TPS" },
  dataFilter: (d) => d.x != null && d.y != null && d._tokenUseRate > 0,
};
const TOKEN_CUSTOMER_MODE_CONFIG = {
  key: "tokenUsage",
  label: "资源池",
  xField: "_token2UseRate",
  yField: "_actualTps2",
  xAxisName: "Token2利用率",
  title: "实际TPS2",
  yAxisName: "TPS",
  yRange: [0, 100],
  tooltipYLabel: "实际TPS2",
  trafficLightKeys: { x: "Token2利用率", y: "实际TPS2" },
  dataFilter: (d) => d.x != null && d.y != null && d._token2UseRate > 0,
};

const { date: currentMonth } = storeToRefs(useCurrentDate());

const CARD_TYPE_VALUE_KEY = "cardType";
const MODEL_TYPE_VALUE_KEY = "modelType";
const CARD_TYPE_OPTIONS = ["A3", "A2", "A1"];
const MODEL_TYPE_OPTIONS = ["DS V4", "DS V3", "Minimax"];
const cardTypeFilterConfig = {
  key: CARD_TYPE_VALUE_KEY,
  label: "卡类型",
  type: "list",
  optionKey: CARD_TYPE_VALUE_KEY,
  valueKey: CARD_TYPE_VALUE_KEY,
};
const modelTypeFilterConfig = {
  key: MODEL_TYPE_VALUE_KEY,
  label: "模型类型",
  type: "list",
  optionKey: MODEL_TYPE_VALUE_KEY,
  valueKey: MODEL_TYPE_VALUE_KEY,
};
const overviewFilterOptions = {
  [CARD_TYPE_VALUE_KEY]: CARD_TYPE_OPTIONS,
  [MODEL_TYPE_VALUE_KEY]: MODEL_TYPE_OPTIONS,
};
const overviewFilterValue = ref({
  [CARD_TYPE_VALUE_KEY]: CARD_TYPE_OPTIONS,
});

const computeOverviewItems = [
  {
    name: "A3",
    cardNum: "3,415.5",
    allocationRate: "6.97%",
    revenue: "64.095",
    cost: "64.095",
    margin: "6.97%",
  },
  {
    name: "A2",
    cardNum: "3,415.5",
    allocationRate: "6.97%",
    revenue: "64.095",
    cost: "64.095",
    margin: "6.97%",
  },
  {
    name: "A1",
    cardNum: "3,415.5",
    allocationRate: "6.97%",
    revenue: "64.095",
    cost: "64.095",
    margin: "6.97%",
  },
];

const tokenOverviewItems = [
  {
    name: "DS V4",
    cardNum: "715.5",
    dailyToken: "6.97%",
    revenue: "18.09",
    cost: "17.09",
    margin: "24.075%",
  },
  {
    name: "DS V3",
    cardNum: "715.5",
    dailyToken: "6.97%",
    revenue: "18.09",
    cost: "17.09",
    margin: "24.075%",
  },
  {
    name: "Minimax",
    cardNum: "715.5",
    dailyToken: "6.97%",
    revenue: "18.09",
    cost: "17.09",
    margin: "24.075%",
  },
];

const tokenCustomerItems = [
  {
    name: "外部",
    cardNum: "42",
    dailyToken: "6.97%",
    revenue: "18.09",
    cost: "17.09",
    margin: "25.295%",
  },
  {
    name: "内部",
    cardNum: "42",
    dailyToken: "6.97%",
    revenue: "18.09",
    cost: "17.09",
    margin: "25.295%",
  },
];

const staticChartDataMap = {
  A3: makeStaticChartData([
    ["华东-A3资源池1", 72, 68, 620],
    ["华北-A3资源池2", 55, 48, 3600],
    ["华南-A3资源池3", 88, 82, 120],
    ["西南-A3资源池4", 43, 39, 250],
    ["华东-A3资源池5", 31, 27, 4200],
    ["华北-A3资源池6", 65, 60, 80],
  ]),
  A2: makeStaticChartData([
    ["华东-A2资源池1", 62, 56, 520],
    ["华北-A2资源池2", 49, 42, 2800],
    ["华南-A2资源池3", 76, 70, 180],
    ["西南-A2资源池4", 38, 34, 350],
    ["华东-A2资源池5", 58, 52, 1600],
  ]),
  A1: makeStaticChartData([
    ["华东-A1资源池1", 46, 40, 460],
    ["华北-A1资源池2", 34, 29, 1300],
    ["华南-A1资源池3", 69, 63, 220],
    ["西南-A1资源池4", 52, 47, 760],
    ["华东-A1资源池5", 28, 24, 3100],
  ]),
  "DS V4": makeTokenModelChartData([
    ["DS V4-华东模型池1", 74, 66, 1431],
    ["DS V4-华北模型池2", 61, 57, 980],
    ["DS V4-华南模型池3", 83, 72, 360],
    ["DS V4-西南模型池4", 48, 41, 2100],
  ]),
  "DS V3": makeTokenModelChartData([
    ["DS V3-华东模型池1", 68, 60, 1280],
    ["DS V3-华北模型池2", 53, 47, 860],
    ["DS V3-华南模型池3", 79, 69, 420],
    ["DS V3-西南模型池4", 44, 38, 1800],
  ]),
  Minimax: makeTokenModelChartData([
    ["Minimax-华东模型池1", 71, 63, 1180],
    ["Minimax-华北模型池2", 59, 52, 760],
    ["Minimax-华南模型池3", 82, 74, 390],
    ["Minimax-西南模型池4", 51, 45, 1680],
  ]),
  外部: makeTokenCustomerChartData([
    ["外部客户池-华东", 57, 50, 840],
    ["外部客户池-华北", 62, 54, 620],
    ["外部客户池-华南", 49, 42, 1200],
    ["外部客户池-西南", 71, 64, 460],
  ]),
  内部: makeTokenCustomerChartData([
    ["内部客户池-华东", 69, 64, 520],
    ["内部客户池-华北", 58, 51, 880],
    ["内部客户池-华南", 77, 70, 340],
    ["内部客户池-西南", 46, 38, 1360],
  ]),
};

const overviewFilterConfig = computed(() => {
  if (aiOverviewMode.value === "token") {
    return [modelTypeFilterConfig];
  }
  return [cardTypeFilterConfig];
});

const filteredComputeItems = computed(() => {
  const selectedCards = overviewFilterValue.value[CARD_TYPE_VALUE_KEY];
  if (!Array.isArray(selectedCards)) return [];
  return computeOverviewItems.filter((item) => selectedCards.includes(item.name));
});

const filteredTokenItems = computed(() => {
  const selectedModels = overviewFilterValue.value[MODEL_TYPE_VALUE_KEY];
  if (!Array.isArray(selectedModels)) return [];
  return tokenOverviewItems.filter((item) => selectedModels.includes(item.name));
});

const currentStaticChartData = computed(() => {
  if (aiOverviewMode.value === "token") {
    if (selectedTokenGroup.value === "customer") {
      return staticChartDataMap[selectedCustomerType.value];
    }
    return staticChartDataMap[selectedModelType.value];
  }
  return staticChartDataMap[selectedResourceType.value];
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
  if (aiOverviewMode.value === "token") {
    if (selectedTokenGroup.value === "customer") {
      return [TOKEN_CUSTOMER_MODE_CONFIG];
    }
    return [TOKEN_MODEL_MODE_CONFIG];
  }
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

watch(aiOverviewMode, (mode) => {
  tierFilter.value = null;
  chartCollapsed.value = false;
  if (mode === "token") {
    overviewFilterValue.value = {
      [MODEL_TYPE_VALUE_KEY]: MODEL_TYPE_OPTIONS,
    };
    return;
  }
  overviewFilterValue.value = {
    [CARD_TYPE_VALUE_KEY]: CARD_TYPE_OPTIONS,
  };
});

watch(filteredComputeItems, (items) => {
  if (aiOverviewMode.value !== "compute") return;
  if (!items.length) return;
  const isSelectedVisible = items.some(item => item.name === selectedResourceType.value);
  if (isSelectedVisible) return;
  selectedResourceType.value = items[0].name;
});

watch(filteredTokenItems, (items) => {
  if (aiOverviewMode.value !== "token") return;
  if (!items.length) return;
  const isSelectedVisible = items.some(item => item.name === selectedModelType.value);
  if (isSelectedVisible) return;
  selectedModelType.value = items[0].name;
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

function onOverviewFilterChange(value) {
  overviewFilterValue.value = value;
  if (aiOverviewMode.value === "token") {
    updateSelectedModelType(value[MODEL_TYPE_VALUE_KEY]);
    return;
  }
  updateSelectedResourceType(value[CARD_TYPE_VALUE_KEY]);
}

function updateSelectedResourceType(cardTypes) {
  if (!cardTypes.length) return;
  if (cardTypes.includes(selectedResourceType.value)) return;
  selectedResourceType.value = cardTypes[0];
}

function updateSelectedModelType(modelTypes) {
  if (!modelTypes.length) return;
  if (modelTypes.includes(selectedModelType.value)) return;
  selectedModelType.value = modelTypes[0];
}

function makeStaticChartData(rows) {
  return rows.map(([name, npuUseRate, allocationRate, serverNum]) => applyBubbleConfig({
    name,
    azName: name,
    x: allocationRate,
    y: allocationRate,
    serverNum,
    _allocationRate: allocationRate,
    _npuUseRate: npuUseRate,
  }, AI_SIZE_TIERS));
}

function makeTokenModelChartData(rows) {
  return rows.map(([name, tokenUseRate, actualTps, serverNum]) => applyBubbleConfig({
    name,
    azName: name,
    x: tokenUseRate,
    y: actualTps,
    serverNum,
    _tokenUseRate: tokenUseRate,
    _actualTps: actualTps,
  }, AI_SIZE_TIERS));
}

function makeTokenCustomerChartData(rows) {
  return rows.map(([name, token2UseRate, actualTps2, serverNum]) => applyBubbleConfig({
    name,
    azName: name,
    x: token2UseRate,
    y: actualTps2,
    serverNum,
    _token2UseRate: token2UseRate,
    _actualTps2: actualTps2,
  }, AI_SIZE_TIERS));
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
      width: 640px;
      min-width: 640px;
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
