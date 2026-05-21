<template>
  <div class="bubble-chart-wrap">
    <div class="bubble-chart-toolbar">
      <FilterDropdowns
        v-model="filterValue"
        :options="filterOptions"
        @change="onFilterChange"
      />
    </div>
    <div ref="el" class="bubble-chart"></div>
    <div v-if="collapsible" class="collapse-toggle" @click="toggleCollapse">
      <span class="collapse-text">{{ collapsed ? '展开' : '收起' }}</span>
      <span class="collapse-arrow" :class="{ 'is-collapsed': collapsed }">&#9650;</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
import * as echarts from "echarts";
import FilterDropdowns from "@/components/FilterDropdowns.vue";
import { getChartScale } from "@/utils/chartScale";
import { SIZE_TIERS, getTierByNum, getTrafficLight, trafficLightHtml } from "@/views/commonComputerPowerConfig";

const props = defineProps({
  data: { type: Array, default: () => [] },
  avgX: { type: Number, default: 0 },
  yAxisName: { type: String, default: "%" },
  yRange: { type: Array, default: () => [-200, 200] },
  xAxisName: { type: String, default: "CPU使用率" },
  /** x 轴末端「最大值%」与 xAxisName 相对箭头：left=箭头左侧（默认），right=箭头尖端右侧 */
  xAxisEndLabelsSide: { type: String, default: "left" },
  showZoneLabels: { type: Boolean, default: true },
  zoneText: {
    type: Object,
    default: () => ({ topProfit: "盈利区", bottomLoss: "亏损区" }),
  },
  /** tooltip 中 Y 值的标签名，不传则取 yAxisName */
  tooltipYLabel: { type: String, default: "" },
  /** tooltip 中 Y 值取数据项的哪个字段，不传则取 value[1]（即 y 轴值） */
  tooltipYField: { type: String, default: "" },
  /** 气泡大小维度的标签，用于图例和 tooltip，如 "服务器规模(台)" 或 "卡数(卡)" */
  sizeLabel: { type: String, default: "服务器规模(台)" },
  /** 气泡大小档位数组，不传则使用默认 SIZE_TIERS */
  sizeTiers: { type: Array, default: () => SIZE_TIERS },
  /** 亮灯规则；有对应指标阈值时 tooltip x/y 行前显示灯，否则不展示圆点 */
  trafficLights: { type: Object, default: null },
  /** 亮灯规则查找 key，覆盖默认的 xAxisName/yLabel，如 { x: "A3分配率", y: "毛利率" } */
  trafficLightKeys: { type: Object, default: null },
  dataFilter: { type: Function, default: null },
  /** 自定义 X 轴范围 [min, max]，不传则使用 [0, 100] */
  xRange: { type: Array, default: null },
  forbidden: { type: Boolean, default: false },
  /** 自定义 Y 轴刻度值数组，不传则自动 4 等分 */
  yTicks: { type: Array, default: null },
  /** 图例各档位初始勾选状态，长度需与 sizeTiers 一致 */
  initialVisibleTiers: { type: Array, default: () => [false, true, true, true] },
  /** 是否显示收起/展开按钮 */
  collapsible: { type: Boolean, default: false },
});

const emit = defineEmits(["bubble-click", "visible-change", "collapse-change", "filter-change"]);

const collapsed = ref(false);

function toggleCollapse() {
  collapsed.value = !collapsed.value;
  emit("collapse-change", collapsed.value);
  if (chart) {
    setTimeout(() => {
      chart.resize();
      chart.setOption(buildOption());
      setTimeout(updateGraphicLabels, 50);
    }, 320);
  }
}

const el = ref(null);
let chart = null;
const visibleTiers = ref([...props.initialVisibleTiers]);
const UNKNOWN_RESOURCE = "未标识";

function option(label, value = label) {
  return { label, value };
}

function getResourceFamily(resourceType) {
  if (!resourceType || resourceType === UNKNOWN_RESOURCE) return UNKNOWN_RESOURCE;
  const match = String(resourceType).match(/^[a-zA-Z]+/);
  return match ? match[0] : resourceType;
}

function getResourceGeneration(resourceType) {
  if (!resourceType || resourceType === UNKNOWN_RESOURCE) return UNKNOWN_RESOURCE;
  const parts = String(resourceType).split("-");
  return parts.length > 1 ? parts.slice(0, -1).join("-") : resourceType;
}

function parseFilterMeta(item) {
  const rawName = String(item.azName || item.name || "").trim();
  const azMatch = rawName.match(/\bAZ\d+\b/i);
  const az = azMatch ? azMatch[0].toUpperCase() : UNKNOWN_RESOURCE;
  let region = rawName || UNKNOWN_RESOURCE;
  let resourceType = UNKNOWN_RESOURCE;

  if (azMatch) {
    region = rawName
      .slice(0, azMatch.index)
      .replace(/[-(\s]+$/g, "")
      .trim() || UNKNOWN_RESOURCE;
    const rest = rawName
      .slice(azMatch.index + azMatch[0].length)
      .replace(/^\)+/, "")
      .replace(/^[-\s]+/, "")
      .trim();
    resourceType = rest || UNKNOWN_RESOURCE;
  }

  return {
    region,
    az,
    resourceFamily: getResourceFamily(resourceType),
    resourceGeneration: getResourceGeneration(resourceType),
    resourceType,
  };
}

function buildResourceTree(items) {
  const familyMap = new Map();
  items.forEach((item) => {
    const meta = parseFilterMeta(item);
    if (!familyMap.has(meta.resourceFamily)) {
      familyMap.set(meta.resourceFamily, new Map());
    }
    const generationMap = familyMap.get(meta.resourceFamily);
    if (!generationMap.has(meta.resourceGeneration)) {
      generationMap.set(meta.resourceGeneration, new Map());
    }
    generationMap.get(meta.resourceGeneration).set(meta.resourceType, option(meta.resourceType));
  });

  return Array.from(familyMap.entries()).map(([family, generationMap]) => ({
    ...option(family),
    children: Array.from(generationMap.entries()).map(([generation, typeMap]) => ({
      ...option(generation),
      children: Array.from(typeMap.values()),
    })),
  }));
}

function uniqueOptions(items, getter) {
  const map = new Map();
  items.forEach((item) => {
    const value = getter(item);
    if (value && !map.has(value)) {
      map.set(value, option(value));
    }
  });
  return Array.from(map.values());
}

const collectedFilterItems = ref([]);

function mergeFilterItems(items) {
  const map = new Map();
  [...collectedFilterItems.value, ...items].forEach((item) => {
    const key = item.azName || item.name;
    if (key) map.set(key, item);
  });
  collectedFilterItems.value = Array.from(map.values());
}

const filterOptions = computed(() => ({
  regions: uniqueOptions(collectedFilterItems.value, (item) => parseFilterMeta(item).region),
  azs: uniqueOptions(collectedFilterItems.value, (item) => parseFilterMeta(item).az),
  resourceTree: buildResourceTree(collectedFilterItems.value),
}));

function flattenResourceGenerations(tree) {
  return tree.flatMap((family) => family.children ?? []);
}

function flattenResourceTypes(tree) {
  return flattenResourceGenerations(tree).flatMap((generation) => generation.children ?? []);
}

function createDefaultFilterValue(options) {
  const resourceTree = options.resourceTree ?? [];
  return {
    regions: (options.regions ?? []).map((item) => item.value),
    azs: (options.azs ?? []).map((item) => item.value),
    resourceFamilies: resourceTree.map((item) => item.value),
    resourceGenerations: flattenResourceGenerations(resourceTree).map((item) => item.value),
    resourceTypes: flattenResourceTypes(resourceTree).map((item) => item.value),
  };
}

function reconcileFilterValue(value, options) {
  const fallback = createDefaultFilterValue(options);
  if (!value) return fallback;
  const keep = (items, optionItems, defaultItems) => {
    const validValues = new Set(optionItems.map((item) => item.value));
    const valid = (items ?? []).filter((item) => validValues.has(item));
    return Array.isArray(items) ? valid : defaultItems;
  };
  const generations = flattenResourceGenerations(options.resourceTree ?? []);
  const types = flattenResourceTypes(options.resourceTree ?? []);
  return {
    regions: keep(value.regions, options.regions ?? [], fallback.regions),
    azs: keep(value.azs, options.azs ?? [], fallback.azs),
    resourceFamilies: keep(value.resourceFamilies, options.resourceTree ?? [], fallback.resourceFamilies),
    resourceGenerations: keep(value.resourceGenerations, generations, fallback.resourceGenerations),
    resourceTypes: keep(value.resourceTypes, types, fallback.resourceTypes),
  };
}

function hasFilterOptions(options) {
  return (
    (options.regions ?? []).length > 0 ||
    (options.azs ?? []).length > 0 ||
    (options.resourceTree ?? []).length > 0
  );
}

const filterValue = ref(createDefaultFilterValue(filterOptions.value));
const filterInitialized = ref(hasFilterOptions(filterOptions.value));

function buildTierFilter(tiers) {
  const allChecked = tiers.every(Boolean);
  const filterFn = props.dataFilter ?? defaultFilter;
  return (item) => {
    return filterFn(item) && passesFilterControls(item) && (allChecked || passesTierFilter(item, tiers));
  };
}

function passesTierFilter(item, tiers) {
  const tierIdx = props.sizeTiers.indexOf(
    getTierByNum(item.serverNum ?? 0, props.sizeTiers)
  );
  return tiers[tierIdx];
}

function passesFilterControls(item) {
  if (!filterInitialized.value) return true;
  const value = filterValue.value;
  const meta = parseFilterMeta(item);
  return (
    value.regions.includes(meta.region) &&
    value.azs.includes(meta.az) &&
    value.resourceFamilies.includes(meta.resourceFamily) &&
    value.resourceGenerations.includes(meta.resourceGeneration) &&
    value.resourceTypes.includes(meta.resourceType)
  );
}

function emitVisibleChange() {
  emit("visible-change", buildTierFilter(visibleTiers.value), [...visibleTiers.value]);
}

function refreshChart() {
  if (chart) {
    chart.setOption(buildOption());
    setTimeout(updateGraphicLabels, 50);
  }
}

function toggleTier(tierIdx) {
  visibleTiers.value[tierIdx] = !visibleTiers.value[tierIdx];
  visibleTiers.value = [...visibleTiers.value];
  emitVisibleChange();
  refreshChart();
}

function onFilterChange(value) {
  filterValue.value = reconcileFilterValue(value, filterOptions.value);
  filterInitialized.value = true;
  emit("filter-change", { ...filterValue.value });
  emitVisibleChange();
  refreshChart();
}

watch(
  () => [
    props.data,
    props.avgX,
    props.forbidden,
    props.yRange,
    props.xRange,
    props.yTicks,
    props.xAxisName,
    props.xAxisEndLabelsSide,
  ],
  () => {
    refreshChart();
  },
  { deep: true }
);

watch(
  () => props.data,
  (data) => {
    mergeFilterItems(data ?? []);
  },
  { deep: true, immediate: true }
);

watch(
  filterOptions,
  (options, oldOptions) => {
    const hadOptions = hasFilterOptions(oldOptions ?? {});
    const hasOptions = hasFilterOptions(options);
    filterValue.value = !hadOptions && hasOptions
      ? createDefaultFilterValue(options)
      : reconcileFilterValue(filterValue.value, options);
    filterInitialized.value = hasOptions;
    emitVisibleChange();
    refreshChart();
  },
  { deep: true }
);

function defaultFilter(d) {
  if (d.x == null || d.y == null) return false;
  return d.y >= props.yRange[0] && d.y <= props.yRange[1] && d.x > 0;
}

const tooltipFormatter = (params) => {
  const az = params.data?.azName || params.name;
  const yLabel = props.tooltipYLabel || props.yAxisName;
  const isPercent = yLabel.includes("率") || yLabel === "%";
  const unit = isPercent ? "%" : "万元";

  let yDisplay = params.value[1];
  if (props.tooltipYField && params.data?.[props.tooltipYField] != null) {
    yDisplay = params.data[props.tooltipYField];
    if (isPercent) yDisplay = yDisplay * 100;
  }
  let rateStr;
  if (yDisplay == null) {
    rateStr = "--";
  } else if (props.forbidden) {
    rateStr = "**";
  } else {
    rateStr = `${Number(yDisplay).toFixed(2)}${unit}`;
  }
  const serverNum = (params.value || [])[2] ?? 0;

  const xVal = Number(params.value[0]);
  const yVal = Number(yDisplay);
  let xMarker = "";
  let yMarker = "";
  if (props.trafficLights) {
    const xKey = props.trafficLightKeys?.x ?? props.xAxisName;
    const yKey = props.trafficLightKeys?.y ?? yLabel;
    const xLight = getTrafficLight(xKey, xVal, props.trafficLights);
    const yLight = getTrafficLight(yKey, yVal, props.trafficLights);
    if (xLight) xMarker = trafficLightHtml(xLight);
    if (yLight) yMarker = trafficLightHtml(yLight);
  }

  return `
    <div class="title value">${az}</div>
    <div class="item mgb4">
      <div class="name">${props.sizeLabel.replace(/\(.*\)/, '')}：</div><div class="value bold">${serverNum} ${(props.sizeLabel.match(/\((.+)\)/) || [])[1] || '台'}</div>
    </div>
    <div class="item mgb4">
      ${xMarker}<div class="name">${props.xAxisName}：</div><div class="value bold">${xVal.toFixed(2)}%</div>
    </div>
    <div class="item">
      ${yMarker}<div class="name">${yLabel}：</div><div class="value bold">${rateStr}</div>
    </div>
  `;
};

/** 与 ECharts grid 一致；边距按 getChartScale(s) 缩放 */
const GRID_INSET = { left: 80, right: 40, top: 100, bottom: 30 };

/** 西文 Arial，中文回落微软雅黑 */
const CHART_FONT_FAMILY = 'Arial, "Microsoft YaHei", sans-serif';

function chartCanvasFont(sizePx, weight = "normal") {
  return `${weight} ${sizePx}px ${CHART_FONT_FAMILY}`;
}

/** x 轴末端标签在箭头右侧时，grid.right 至少需容纳箭头 + 内边距 + 文案宽度，避免溢出画布 */
function computeGridRight() {
  const s = getChartScale(el.value);
  const base = GRID_INSET.right * s;
  if (props.xAxisEndLabelsSide !== "right") return base;
  const lblFs = Math.round(14 * s);
  const padX = 8 * s;
  const al = 12 * s;
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.font = chartCanvasFont(lblFs, "bold");
  const xMax = props.xRange ? props.xRange[1] : 100;
  const pctStr = `${Math.min(Math.round(xMax), 100)}%`;
  const tw = Math.max(
    ctx.measureText(pctStr).width,
    ctx.measureText(props.xAxisName || "").width
  );
  return Math.max(base, al + padX + tw + 12 * s);
}

function buildOption() {
  const s = getChartScale(el.value);
  const filterFn = props.dataFilter ?? defaultFilter;
  const filteredData = props.data
    .filter(filterFn)
    .filter(passesFilterControls)
    .filter((d) => passesTierFilter(d, visibleTiers.value));

  const seriesData = filteredData
    .slice()
    .sort((a, b) => (b.symbolSize ?? 0) - (a.symbolSize ?? 0))
    .map(({ name, azName, x, y, serverNum, symbolSize, color, ...extra }) => ({
      name,
      azName,
      value: [x, y, serverNum ?? 0],
      symbolSize: symbolSize * s,
      itemStyle: {
        color,
        borderColor: "#2b2b7b",
        borderWidth: Math.max(1, 1.5 * s),
        opacity: 1,
      },
      ...extra,
    }));

  const hasCustomTicks = Array.isArray(props.yTicks) && props.yTicks.length > 0;
  let yInterval;
  if (hasCustomTicks) {
    const sorted = [...props.yTicks].sort((a, b) => a - b);
    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    yInterval = sorted.slice(1).reduce((g, v, i) => gcd(g, Math.abs(v - sorted[i])), Math.abs(sorted[1] - sorted[0]));
  } else {
    yInterval = (props.yRange[1] - props.yRange[0]) / 4;
  }

  const dashColor = "#c8c8e8";
  const dashWidth = Math.max(1, 1.5 * s);

  return {
    textStyle: { fontFamily: CHART_FONT_FAMILY },
    dataZoom: [
      { type: "inside", xAxisIndex: 0 },
      { type: "inside", yAxisIndex: 0 },
    ],
    backgroundColor: "#f7f8fd",
    tooltip: {
      trigger: "item",
      className: "custom-tooltip",
      formatter: tooltipFormatter,
    },
    grid: {
      left: GRID_INSET.left * s,
      right: computeGridRight(),
      top: GRID_INSET.top * s,
      bottom: GRID_INSET.bottom * s,
    },
    xAxis: {
      type: "value",
      min: props.xRange ? props.xRange[0] : 0,
      max: props.xRange ? props.xRange[1] : 100,
      interval: props.xRange
        ? (props.xRange[1] - props.xRange[0]) / 5
        : 20,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        show: true,
        lineStyle: { type: "dashed", color: dashColor, width: dashWidth },
      },
      axisLabel: { show: false },
    },
    yAxis: {
      type: "value",
      min: hasCustomTicks
        ? Math.min(...props.yTicks)
        : props.yRange[0],
      max: hasCustomTicks
        ? Math.max(...props.yTicks)
        : props.yRange[1],
      interval: yInterval,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        show: true,
        lineStyle: { type: "dashed", color: dashColor, width: dashWidth },
      },
      axisLabel: {
        show: true,
        fontFamily: CHART_FONT_FAMILY,
        fontSize: Math.round(14 * s),
        color: "#353575",
        formatter: hasCustomTicks ? (v) => (props.yTicks.includes(v) ? v : "") : undefined,
      },
    },
    series: [
      {
        type: "scatter",
        z: 100,
        symbol: "circle",
        data: seriesData,
        label: { show: false },
        markLine: {
          silent: true,
          symbol: "none",
          label: { show: false },
          data: [
            {
              yAxis: 0,
              lineStyle: {
                type: "dashed",
                color: "#9e9ed1",
                width: Math.max(1, 2 * s),
              },
            },
            {
              xAxis: props.avgX,
              lineStyle: {
                type: "dashed",
                color: "#F8C6C7",
                width: Math.max(1, 1.5 * s),
              },
            },
          ],
        },
      },
    ],
  };
}

function updateGraphicLabels() {
  if (!chart) return;
  const s = getChartScale(el.value);
  const opts = chart.getOption();
  const grid = opts.grid?.[0] || {};
  const yAxis = opts.yAxis?.[0] || {};
  const yExtent = [
    yAxis.min ?? props.yRange[0],
    yAxis.max ?? props.yRange[1],
  ];
  const [gl, gr, gt, gb] = [
    grid.left ?? GRID_INSET.left * s,
    grid.right ?? GRID_INSET.right * s,
    grid.top ?? GRID_INSET.top * s,
    grid.bottom ?? GRID_INSET.bottom * s,
  ];
  const w = chart.getWidth() - gl - gr;
  const h = chart.getHeight() - gt - gb;
  const xEnd = gl + w;
  const zeroY =
    gt + (1 - (0 - yExtent[0]) / (yExtent[1] - yExtent[0])) * h;
  const xMin = props.xRange ? props.xRange[0] : 0;
  const xMax = props.xRange ? props.xRange[1] : 100;
  const avgLineX = gl + ((props.avgX - xMin) / (xMax - xMin)) * w;

  const graphics = [];
  const silent = { cursor: "default", silent: true };

  // ── 四象限渐变背景（始终显示）──
  const topLeftW = avgLineX - gl;
  const topRightW = xEnd - avgLineX;
  const topH = zeroY - gt;
  const bottomH = gt + h - zeroY;
  const R = 16 * s;
  const grad = (x0, y0, x1, y1, c0, c1) =>
    new echarts.graphic.LinearGradient(x0, y0, x1, y1, [
      { offset: 0, color: c0 },
      { offset: 1, color: c1 },
    ]);

  graphics.push(
    {
      type: "rect",
      shape: { x: gl, y: gt, width: topLeftW, height: topH, r: [R, R, 0, 0] },
      style: { fill: grad(0.5, 0, 0.5, 1, "rgba(108,107,235,0.08)", "rgba(255,255,255,0)") },
      z: 0, ...silent,
    },
    {
      type: "rect",
      shape: { x: avgLineX, y: gt, width: topRightW, height: topH, r: [R, R, 0, 0] },
      style: { fill: grad(0.5, 0, 0.5, 1, "rgba(27,204,142,0.08)", "rgba(255,255,255,0)") },
      z: 0, ...silent,
    },
    {
      type: "rect",
      shape: { x: gl, y: zeroY, width: topLeftW, height: bottomH, r: [0, 0, R, R] },
      style: { fill: grad(0.5, 1, 0.5, 0, "rgba(250,189,33,0.08)", "rgba(255,255,255,0)") },
      z: 0, ...silent,
    },
    {
      type: "rect",
      shape: { x: avgLineX, y: zeroY, width: topRightW, height: bottomH, r: [0, 0, R, R] },
      style: { fill: grad(0.5, 1, 0.5, 0, "rgba(245,91,91,0.08)", "rgba(255,255,255,0)") },
      z: 0, ...silent,
    }
  );

  // ── 四象限文字标签（可选）──
  if (props.showZoneLabels) {
    const pad = 12 * s;
    const zoneFs = Math.round(12 * s);
    const grayStyle = { fontSize: zoneFs, fill: "#49495d", fontFamily: CHART_FONT_FAMILY };
    const profitStyle = { fontSize: zoneFs, fill: "#029367", fontWeight: "bold", fontFamily: CHART_FONT_FAMILY };
    const lossStyle = { fontSize: zoneFs, fill: "#f55b5b", fontWeight: "bold", fontFamily: CHART_FONT_FAMILY };
    const prefixW = 86 * s;
    const suffixW = 42 * s;
    const topProfit = props.zoneText.topProfit ?? "盈利区";
    const bottomLoss = props.zoneText.bottomLoss ?? "亏损区";

    graphics.push(
      { type: "text", position: [gl + pad, gt + pad], style: { text: "低CPU使用率", ...grayStyle, align: "left", verticalAlign: "top" }, z: 10, ...silent },
      { type: "text", position: [gl + pad + prefixW, gt + pad], style: { text: topProfit, ...profitStyle, align: "left", verticalAlign: "top" }, z: 10, ...silent },
      { type: "text", position: [xEnd - pad - suffixW, gt + pad], style: { text: "高CPU使用率", ...grayStyle, align: "right", verticalAlign: "top" }, z: 10, ...silent },
      { type: "text", position: [xEnd - pad, gt + pad], style: { text: topProfit, ...profitStyle, align: "right", verticalAlign: "top" }, z: 10, ...silent },
      { type: "text", position: [gl + pad, gt + h - pad], style: { text: "低CPU使用率", ...grayStyle, align: "left", verticalAlign: "bottom" }, z: 10, ...silent },
      { type: "text", position: [gl + pad + prefixW, gt + h - pad], style: { text: bottomLoss, ...lossStyle, align: "left", verticalAlign: "bottom" }, z: 10, ...silent },
      { type: "text", position: [xEnd - pad - suffixW, gt + h - pad], style: { text: "高CPU使用率", ...grayStyle, align: "right", verticalAlign: "bottom" }, z: 10, ...silent },
      { type: "text", position: [xEnd - pad, gt + h - pad], style: { text: bottomLoss, ...lossStyle, align: "right", verticalAlign: "bottom" }, z: 10, ...silent }
    );
  }

  // ── Y 轴名称 ──
  graphics.push({
    type: "text",
    position: [gl - 10 * s, gt - 20 * s],
    style: {
      text: props.yAxisName,
      fontSize: Math.round(14 * s),
      fontWeight: "bold",
      fontFamily: CHART_FONT_FAMILY,
      fill: "#353575",
      align: "left",
      verticalAlign: "bottom",
    },
    z: 5, ...silent,
  });

  // ── 图例：服务器规模(台) + 4 档位（带 checkbox），右端与趋势图对齐 ──
  const legendY = 24 * s;
  const legendFs = Math.round(14 * s);
  const cbSize = 12 * s;
  const _ctx = document.createElement("canvas").getContext("2d");
  _ctx.font = chartCanvasFont(legendFs, "bold");

  const maxTierSymbolSize = Math.max(...props.sizeTiers.map((t) => t.symbolSizeMax));
  const legendCr = Math.max(4, (maxTierSymbolSize / 88) * 14) * s;
  const sizeLabelW = _ctx.measureText(props.sizeLabel).width + 12 * s;
  const tierItemGap = 10 * s;
  const legendTotalW = sizeLabelW + props.sizeTiers.reduce((sum, tier) => {
    const pad = 4 * s;
    const textW = _ctx.measureText(tier.label).width;
    const bgW = pad + legendCr * 2 + 6 * s + textW + pad;
    return sum + cbSize + 8 * s + bgW + tierItemGap;
  }, 0) - tierItemGap;
  let lx = xEnd - legendTotalW;

  graphics.push({
    type: "text",
    position: [lx, legendY],
    style: { text: props.sizeLabel, fontSize: legendFs, fontWeight: "bold", fontFamily: CHART_FONT_FAMILY, fill: "#3d3d75", align: "left", verticalAlign: "middle" },
    z: 10, ...silent,
  });
  lx += sizeLabelW;

  props.sizeTiers.forEach((tier, idx) => {
    const checked = visibleTiers.value[idx];
    const cbX = lx;
    const cbY = legendY - cbSize / 2;
    const tierIdx = idx;

    graphics.push({
      type: "rect",
      shape: { x: cbX, y: cbY, width: cbSize, height: cbSize, r: 2 * s },
      style: {
        fill: checked ? "#434393" : "#fff",
        stroke: "#434393",
        lineWidth: Math.max(1, 1.5 * s),
      },
      z: 10,
      cursor: "pointer",
      onclick: () => toggleTier(tierIdx),
    });

    if (checked) {
      const x0 = cbX + 2.5 * s;
      const x1 = cbX + cbSize * 0.42;
      const x2 = cbX + cbSize - 2.5 * s;
      const y0 = legendY + 0.5 * s;
      const y1 = legendY + 3 * s;
      const y2 = legendY - 3 * s;
      graphics.push({
        type: "polyline",
        shape: { points: [[x0, y0], [x1, y1], [x2, y2]] },
        style: { stroke: "#fff", lineWidth: Math.max(1.5, 2 * s), lineCap: "round", lineJoin: "round" },
        z: 11,
        cursor: "pointer",
        onclick: () => toggleTier(tierIdx),
      });
    }

    lx += cbSize + 8 * s;

    const cr = legendCr;
    const circleOpacity = checked ? 1 : 0.3;
    const labelText = tier.label;
    const pad = 4 * s;
    const textW = _ctx.measureText(labelText).width;
    const contentW = cr * 2 + 6 * s + textW;
    const bgW = pad + contentW + pad;
    const bgH = cbSize + 4 * s;

    if (checked) {
      graphics.push({
        type: "rect",
        shape: { x: lx - pad, y: legendY - bgH / 2, width: bgW, height: bgH, r: 4 * s },
        style: { fill: "#e7e9fd" },
        z: 9,
        cursor: "pointer",
        onclick: () => toggleTier(tierIdx),
      });
    }

    graphics.push({
      type: "circle",
      shape: { cx: lx + cr, cy: legendY, r: cr },
      style: { fill: tier.color, opacity: circleOpacity, stroke: "#2b2b7b", lineWidth: 1 },
      z: 10,
      cursor: "pointer",
      onclick: () => toggleTier(tierIdx),
    });

    graphics.push({
      type: "text",
      position: [lx + cr * 2 + 6 * s, legendY],
      style: {
        text: labelText,
        fontSize: legendFs,
        fontWeight: "bold",
        fontFamily: CHART_FONT_FAMILY,
        fill: "#3d3d75",
        align: "left",
        verticalAlign: "middle",
      },
      z: 10,
      cursor: "pointer",
      onclick: () => toggleTier(tierIdx),
    });

    lx += bgW + 10 * s;
  });

  // ── Y 轴线 + 箭头 ──
  const axisColor = "#9e9ed1";
  const axisWidth = Math.max(1, 2 * s);
  graphics.push({
    type: "line",
    shape: { x1: gl, y1: gt, x2: gl, y2: gt + h },
    style: { stroke: axisColor, lineWidth: axisWidth, lineDash: [6, 4] },
    z: 3, ...silent,
  });

  const aw = 6 * s;
  const al = 12 * s;
  const _hasCustomTicks = Array.isArray(props.yTicks) && props.yTicks.length > 0;
  const yTickMin = _hasCustomTicks ? Math.min(...props.yTicks) : props.yRange[0];
  graphics.push(
    { type: "polygon", position: [xEnd, zeroY], shape: { points: [[0, -aw], [0, aw], [al, 0]] }, style: { fill: axisColor }, z: 5, ...silent },
    { type: "polygon", position: [gl, gt], shape: { points: [[-aw, 0], [aw, 0], [0, -al]] }, style: { fill: axisColor }, z: 5, ...silent },
  );
  if (yTickMin < 0) {
    graphics.push(
      { type: "polygon", position: [gl, gt + h], shape: { points: [[-aw, 0], [aw, 0], [0, al]] }, style: { fill: axisColor }, z: 5, ...silent }
    );
  }

  // ── X 轴右端标签（相对箭头左侧或尖端右侧）──
  const xSpan = xMax - xMin;
  const lblFs = Math.round(14 * s);
  const padX = 8 * s;
  const endLabelsRight = props.xAxisEndLabelsSide === "right";
  const txEndLabel = endLabelsRight ? xEnd + al + padX : xEnd - padX;
  const endLabelAlign = endLabelsRight ? "left" : "right";
  const lblStyle = { fontSize: lblFs, fill: "#353575", fontWeight: "bold", fontFamily: CHART_FONT_FAMILY };
  graphics.push(
    { type: "text", position: [txEndLabel, zeroY - 10 * s], style: { text: Math.min(Math.round(xMax), 100) + "%", ...lblStyle, align: endLabelAlign, verticalAlign: "middle" }, z: 999, ...silent },
    { type: "text", position: [txEndLabel, zeroY + 10 * s], style: { text: props.xAxisName, ...lblStyle, align: endLabelAlign, verticalAlign: "middle" }, z: 999, ...silent }
  );

  // ── X 轴刻度标签（贴在 Y=0 横轴线上）──
  const xTickFs = Math.round(14 * s);
  const xTickGap = 6 * s;
  const xTickCount = 5;
  const xTickStep = xSpan / xTickCount;
  for (let i = 1; i < xTickCount; i++) {
    const val = xMin + xTickStep * i;
    const tx = gl + ((val - xMin) / xSpan) * w;
    graphics.push({
      type: "text",
      position: [tx, zeroY + xTickGap],
      style: { text: Math.round(val) + "%", fontSize: xTickFs, fontFamily: CHART_FONT_FAMILY, fill: "#353575", align: "center", verticalAlign: "top" },
      z: 5, ...silent,
    });
  }

  // ── 平均值标签 ──
  graphics.push({
    type: "text",
    position: [avgLineX, gt - 6 * s],
    style: { text: "平均值", fontSize: Math.round(16 * s), fontWeight: "bold", fontFamily: CHART_FONT_FAMILY, fill: "#353575", align: "center", verticalAlign: "bottom" },
    z: 10, ...silent,
  });

  chart.setOption({ graphic: graphics }, { replaceMerge: ["graphic"] });
}

function resize() {
  if (chart) {
    chart.resize();
    chart.setOption(buildOption());
    setTimeout(updateGraphicLabels, 50);
  }
}

function bindChartEvents() {
  chart.on("click", "series.scatter", (params) => {
    if (params.data) {
      emit("bubble-click", {
        name: params.data.name || params.name,
        azName: params.data.azName,
        value: params.value,
      });
    }
  });

  chart.on("dataZoom", () => {
    setTimeout(updateGraphicLabels, 50);
  });

  chart.getZr().on("dblclick", () => {
    chart.dispatchAction({ type: "dataZoom", start: 0, end: 100 });
  });
}

function initChart(retry = 0) {
  if (!el.value) return;
  const { clientWidth, clientHeight } = el.value;
  if ((clientWidth === 0 || clientHeight === 0) && retry < 10) {
    setTimeout(() => initChart(retry + 1), 50);
    return;
  }

  chart = echarts.init(el.value);
  chart.setOption(buildOption());
  setTimeout(() => {
    chart?.resize();
    chart?.setOption(buildOption());
    updateGraphicLabels();
  }, 100);
  bindChartEvents();
}

onMounted(async () => {
  emitVisibleChange();
  await nextTick();
  initChart();
  window.addEventListener("resize", resize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resize);
  if (chart) {
    chart.dispose();
    chart = null;
  }
});
</script>

<style lang="less" scoped>
.bubble-chart-wrap {
  width: 100%;
  height: 100%;
  min-height: 320px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-family: Arial, "Microsoft YaHei", sans-serif;
}

.bubble-chart-toolbar {
  position: absolute;
  top: 8px;
  left: 78px;
  right: 560px;
  z-index: 20;
  min-width: 0;

  :deep(.filter-bar) {
    padding: 0;
    border: 0;
    background: transparent;
    flex-wrap: nowrap;
    gap: 10px 14px;
  }

  :deep(.filter-label) {
    color: #3d3d75;
  }

  :deep(.select-trigger) {
    height: 30px;
    background: rgba(255, 255, 255, 0.92);
    border-color: #dfe3f3;
  }
}

.bubble-chart {
  width: 100%;
  flex: 1;
  min-height: 300px;
}

.collapse-toggle {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 28px;
  cursor: pointer;
  user-select: none;

  .collapse-text {
    font-size: 13px;
    color: #7171a8;
  }

  .collapse-arrow {
    font-size: 10px;
    color: #7171a8;
    transition: transform 0.3s ease;
  }

  .collapse-arrow.is-collapsed {
    transform: rotate(180deg);
  }

  &:hover {
    .collapse-text,
    .collapse-arrow {
      color: #353575;
    }
  }
}

:deep(.custom-tooltip) {
  font-family: Arial, "Microsoft YaHei", sans-serif;
  .mgb4 {
    margin-bottom: 4px;
  }
  .item {
    display: flex;
    align-items: center;
    line-height: 21px;
  }
  .name {
    font-size: 16px;
    color: #7171a8;
  }
  .value {
    font-size: 16px;
    font-weight: 600;
    color: #33336b;
  }
  .title {
    line-height: 24px;
    margin-bottom: 6px;
  }
}
</style>
