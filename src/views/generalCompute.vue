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
import { EVS_SIZE_TIERS, SIZE_TIERS } from "./commonComputerPowerConfig";
import { useResourcePoolCustomer } from "./useDirectoryTree";

useResourcePoolCustomer();

function keepEnglishOnly(str) {
  const match = String(str ?? "").match(/^[a-zA-Z\s]*/);
  return match ? match[0].trimEnd() : "";
}

const category = computed(() => keepEnglishOnly(activeCategory.value));

const CATEGORY_CONFIG = {
  ECS: {
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
        /** 由 commonComputerPower 按数据 [min−5, max+5] 标定轴范围 */
        axisRangeDataPadding: 5,
        tooltipYLabel: "毛利率",
        trafficLightKeys: { x: "EVS使用率", y: "毛利率" },
      },
    ],
  },
};

const tabs = computed(() => CATEGORY_CONFIG[category.value]?.tabs ?? CATEGORY_CONFIG.ECS.tabs);
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
const isEvsCategory = computed(() => category.value === "EVS");
const currentSizeLabel = computed(() =>
  isEvsCategory.value ? "磁盘总量(TB)" : "服务器规模(台)"
);
const currentSizeValueField = computed(() =>
  isEvsCategory.value ? "totalDiskSpace" : "serverNum"
);
const currentSizeTiers = computed(() =>
  isEvsCategory.value ? EVS_SIZE_TIERS : SIZE_TIERS
);

/** 仅 EVS 分类启用「按数据 ±padding 定轴」；ECS 等不传，避免误配 tab 字段时生效 */
const axisRangeDataPaddingForChart = computed(() =>
  isEvsCategory.value
    ? activeTabConfig.value.axisRangeDataPadding ?? null
    : null
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
