<template>
  <div class="container">
    <header class="header flex-center">
      <span class="title">xxxxxxxxx</span>
    </header>
    <section class="main flex-center">
      <section class="main-left">
        <CategoryNav />
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
            :filterConfig="currentFilterConfig"
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
import CategoryNav from "@/components/CategoryNav.vue";
import CommonComputerPower from "./commonComputerPower.vue";
import ResourcePoolTable from "@/components/ResourcePoolTable.vue";
import { activeCategory } from "./useGeneralComputer";
import { tierFilter, testData1 } from "./useCommonComputerPower";
import { SIZE_TIERS } from "./commonComputerPowerConfig";
import { useResourcePoolCustomer } from "./useDirectoryTree";

useResourcePoolCustomer();

const category = computed(() => activeCategory.value);

// 通算页筛选项统一在这里按资源池配置；下游组件只消费配置，不再写资源池特判。
// variant: tree 使用 ECS 四层树面板；list 使用 AZ 同款单列面板。
// submitMode: tree 提交四层对象；resourceTypeOnly 提交 [{ resourceType }]。
const TREE_RESOURCE_FILTER = {
  visible: true,
  variant: "tree",
  submitMode: "tree",
  confirmable: true,
};

const LIST_RESOURCE_FILTER = {
  visible: true,
  variant: "list",
  submitMode: "resourceTypeOnly",
  confirmable: false,
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
      resourceType: LIST_RESOURCE_FILTER,
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
      resourceType: LIST_RESOURCE_FILTER,
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
      }
    }
  }
}
</style>
