<template>
  <div class="container">
    <header class="header">
      <CommonTitle title="通算" icon-name="type" />
    </header>
    <section class="main flex-center">
      <section class="main-left">
        <ResourcesLifecycleDetail />
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
        <div class="chart-area">
          <CommonComputerPower
            ref="grossProfitChartRef"
            :xField="currentXField"
            :xAxisName="currentXAxisName"
            :yField="activeTabConfig.yField"
            :title="activeTabConfig.title"
            :yAxisName="activeTabConfig.yAxisName"
            :yRange="activeTabConfig.yRange"
            :yTicks="activeTabConfig.yTicks"
            :axis-range-data-padding="axisRangeDataPaddingForChart"
            :tooltipYLabel="activeTabConfig.tooltipYLabel"
            :sizeLabel="currentSizeLabel"
            :sizeValueField="currentSizeValueField"
            :sizeTiers="currentSizeTiers"
            :trafficLightKeys="currentTrafficLightKeys"
            @bubble-click="onBubbleClick"
            @visible-change="onVisibleChange"
          />
        </div>
        <ResourcePoolTable
          ref="grossProfitTableRef"
          :data="filteredTestData1"
        />
      </section>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import CommonTitle from "@/components/home/CommonTitle.vue";
import CommonComputerPower from "./commonComputerPower.vue";
import ResourcePoolTable from "@/components/ResourcePoolTable.vue";
import ResourcesLifecycleDetail from "./ResourcesLifecycleDetail.vue";
import { selectedPool } from "./ResourcesLifecycle";
import { testData1 } from "./useCommonComputerPower";
import { SIZE_TIERS } from "./commonComputerPowerConfig";
import { useResourcePoolCustomer } from "./useDirectoryTree";
import { useCurrentDate } from "./useCurrentDate";
import {
  resetGeneralComputeFilter,
  setGeneralComputeFilterConfig,
  tierFilter,
} from "./useGeneralComputeFilter";

useResourcePoolCustomer();

const category = computed(() => selectedPool.value);
const { date: currentDate } = storeToRefs(useCurrentDate());

// 通算页筛选项统一在这里按资源池配置；下游组件只消费配置，不再写资源池特判。
// tree 面板现在使用“云服务 + 资源系列 + 资源族 + 资源代数 + 资源类型”五列。
const TREE_RESOURCE_FILTER = {
  visible: true,
  variant: "tree",
  submitMode: "tree",
  confirmable: true,
};

const CATEGORY_CONFIG = {
  ECS: {
    filters: {
      region: { visible: true, searchable: true },
      az: { visible: true, searchable: false },
      resourceType: TREE_RESOURCE_FILTER,
    },
    tabs: [
      {
        key: "allocationRate",
        label: "分配率",
        xField: "_allocationRate",
        xAxisName: "分配率",
        yField: "",
        title: "毛利率",
        yAxisName: "%",
        yRange: [-205, 105],
        yTicks: [-200, -100, 0, 100],
        tooltipYLabel: "毛利率",
        trafficLightKeys: { x: "ECS分配率", y: "ECS毛利率" },
      },
      {
        key: "cpuUsage",
        label: "CPU使用率",
        xField: "_useRate",
        xAxisName: "CPU使用率",
        yField: "",
        title: "毛利率",
        yAxisName: "%",
        yRange: [-205, 105],
        yTicks: [-200, -100, 0, 100],
        tooltipYLabel: "毛利率",
        trafficLightKeys: { x: "CPU使用率", y: "ECS毛利率" },
      },
    ],
  },
  EVS: {
    filters: {
      region: { visible: false, searchable: true },
      az: { visible: false, searchable: false },
      resourceType: TREE_RESOURCE_FILTER,
    },
    tabs: [
      {
        key: "useRate",
        label: "使用率",
        xField: "_useRate",
        xAxisName: "EVS使用率",
        yField: "grossProfitRate",
        title: "毛利率",
        yAxisName: "%",
        yRange: [-205, 105],
        yTicks: [-200, -100, 0, 100],
        tooltipYLabel: "毛利率",
        trafficLightKeys: { x: "EVS使用率", y: "毛利率" },
      },
    ],
  },
  OBS: {
    filters: {
      region: { visible: true, searchable: true },
      az: { visible: false, searchable: false },
      resourceType: TREE_RESOURCE_FILTER,
    },
    tabs: [
      {
        key: "allocationRate",
        label: "分配率",
        xField: "allocationRate",
        xAxisName: "HDD日分配率",
        yField: "grossProfitRate",
        title: "毛利率",
        yAxisName: "%",
        yRange: [-205, 105],
        yTicks: [-200, -100, 0, 100],
        tooltipYLabel: "毛利率",
        trafficLightKeys: { x: "HDD日分配率", y: "毛利率" },
      },
    ],
  },
};

const currentCategoryConfig = computed(() => CATEGORY_CONFIG[category.value] ?? CATEGORY_CONFIG.ECS);
const tabs = computed(() => currentCategoryConfig.value.tabs);
const activeTab = ref(tabs.value[0].key);

watch(tabs, (newTabs) => {
  activeTab.value = newTabs[0].key;
});

const activeTabConfig = computed(() =>
  tabs.value.find((t) => t.key === activeTab.value) ?? tabs.value[0]
);
const currentXField = computed(() => activeTabConfig.value.xField);
const currentXAxisName = computed(() => activeTabConfig.value.xAxisName);
const currentTrafficLightKeys = computed(() => activeTabConfig.value.trafficLightKeys ?? null);
const currentFilterConfig = computed(() => currentCategoryConfig.value.filters);
const currentSizeLabel = computed(() =>
  "服务器规模(台)"
);
const currentSizeValueField = computed(() =>
  "serverNum"
);
const currentSizeTiers = computed(() =>
  SIZE_TIERS
);

/** 仅配置了 axisRangeDataPadding 的 tab 启用「按数据 ±padding 定轴」。 */
const axisRangeDataPaddingForChart = computed(() =>
  activeTabConfig.value.axisRangeDataPadding ?? null
);

const grossProfitChartRef = ref(null);
const grossProfitTableRef = ref(null);
const filteredTestData1 = computed(() =>
  tierFilter.value ? testData1.value.filter(tierFilter.value) : testData1.value
);

watch(
  currentFilterConfig,
  (config) => {
    setGeneralComputeFilterConfig(config);
  },
  { immediate: true }
);

watch(currentDate, () => {
  resetGeneralComputeFilter();
});

function onVisibleChange(filterFn) {
  tierFilter.value = filterFn;
}

function onBubbleClick(detail) {
  const azName = detail.azName || detail.name;
  grossProfitTableRef.value?.scrollToByName(azName);
}
</script>

<style scoped lang="less">
.flex-center {
  display: flex;
  align-items: center;
}

.container {
  width: 1872px;
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
      width: 320px;
      min-width: 320px;
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
      }
    }
  }
}
</style>
