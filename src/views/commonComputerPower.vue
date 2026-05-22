<template>
  <BubbleChart
    :data="mappedData"
    :avgX="avgX"
    :forbidden="forbidden"
    :title="title"
    :yAxisName="yAxisName"
    :yRange="chartYRange"
    :xRange="chartXRange"
    :xAxisName="xAxisName"
    :showZoneLabels="false"
    :tooltipYLabel="tooltipYLabel"
    :trafficLights="trafficLightRules"
    :trafficLightKeys="trafficLightKeys"
    :yTicks="chartYTicks"
    :filterOptions="bubbleFilterOptions"
    @bubble-click="(e) => emit('bubble-click', e)"
    @visible-change="onVisibleChange"
    @filter-change="onFilterChange"
  />
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import BubbleChart from "@/components/BubbleChart.vue";
import { useCommonComputerPower, computeWeightedAvg } from "./useCommonComputerPower";
import { useBubbleAxisRange } from "./useBubbleAxisRange";
import { useCurrentDate } from "./useCurrentDate";
import { useTargetNumStore } from "@/stores/targetNumStore";

const targetNumStore = useTargetNumStore();
const { trafficLightRules } = storeToRefs(targetNumStore);

const props = defineProps({
  xField: { type: String, default: "_useRate" },
  xAxisName: { type: String, default: "CPU使用率" },
  yField: { type: String, default: "" },
  title: { type: String, default: "毛利率" },
  yAxisName: { type: String, default: "%" },
  yRange: { type: Array, default: () => [-205, 105] },
  /** 自定义 X 轴 [min, max]，不传则 BubbleChart 使用默认 0–100 */
  xRange: { type: Array, default: null },
  yTicks: { type: Array, default: () => [-200, -100, 0, 100] },
  /**
   * 设为数字（如 5）时，用 mappedData 中 xField / yField 的有效数值计算轴范围 [min−pad, max+pad]；
   * 某一轴无有效值则该轴仍用 yRange / xRange / yTicks 传入的默认值
   */
  axisRangeDataPadding: { type: Number, default: null },
  tooltipYLabel: { type: String, default: "毛利率" },
  trafficLightKeys: { type: Object, default: null },
});

const emit = defineEmits(["bubble-click", "visible-change"]);

const { data, avgRangeList, forbidden, azOptions, directoryTreeList, fetchData } = useCommonComputerPower();
const { date: currentMonth } = storeToRefs(useCurrentDate());

const visibleTiers = ref([false, true, true, true]);
const backendFilters = ref({});

function onVisibleChange(filterFn, tiers) {
  if (tiers) visibleTiers.value = tiers;
  emit("visible-change", filterFn);
}

function onFilterChange(filters) {
  backendFilters.value = { ...(filters ?? {}) };
  fetchData(currentMonth.value, backendFilters.value);
}

const avgX = computed(() => {
  const avg = computeWeightedAvg(avgRangeList.value, visibleTiers.value);
  return avg * 100;
});

const mappedData = computed(() =>
  data.value.map((d) => ({
    ...d,
    x: d[props.xField] ?? d.x,
    ...(props.yField ? { y: d[props.yField] ?? d.y } : {}),
  }))
);

const { chartXRange, chartYRange, chartYTicks } = useBubbleAxisRange(
  props,
  mappedData
);

const bubbleFilterOptions = computed(() => ({
  azs: azOptions.value,
  resourceTree: directoryTreeList.value,
}));

onMounted(() => {
  fetchData(currentMonth.value, backendFilters.value);
});

defineExpose({ data: mappedData });
</script>
