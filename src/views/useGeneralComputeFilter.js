import { computed, ref, watch } from "vue";
import {
  azNameList,
  directoryTreeList,
  regionNameList,
} from "./useDirectoryTree";
import {
  clearBubbleTierFilter,
  setBubbleTierFilter,
  tierFilter,
} from "./useBubbleTierFilter";

export { tierFilter };

export const filterValue = ref(null);
export const backendFilters = ref(createEmptyBackendFilters());
export const filterConfig = ref(null);
export const filterResetKey = ref(0);
export const visibleTiers = ref([]);

const resolvedFilterConfig = computed(() => ({
  region: {
    visible: true,
    searchable: true,
    ...(filterConfig.value?.region ?? {}),
  },
  az: {
    visible: true,
    searchable: false,
    ...(filterConfig.value?.az ?? {}),
  },
  resourceType: {
    visible: true,
    variant: "tree",
    submitMode: "tree",
    confirmable: true,
    ...(filterConfig.value?.resourceType ?? {}),
  },
}));

const showRegionFilter = computed(() => resolvedFilterConfig.value.region.visible);
const showAzFilter = computed(() => resolvedFilterConfig.value.az.visible);
const showResourceTypeFilter = computed(() => resolvedFilterConfig.value.resourceType.visible);

function createSubmitOption(key, rawValue) {
  const value = String(rawValue);
  const obj = { [key]: value };
  const objStr = JSON.stringify(obj);
  return {
    label: value,
    value: objStr,
    name: value,
    obj,
    objStr,
  };
}

const regionFilterOptions = computed(() =>
  regionNameList.value.map((name) => createSubmitOption("regionName", name))
);

const azFilterOptions = computed(() =>
  azNameList.value.map((name) => createSubmitOption("azName", name))
);

export const resourceTree = computed(() => directoryTreeList.value);

export const filterOptions = computed(() => ({
  regions: regionFilterOptions.value,
  azs: azFilterOptions.value,
  resourceTree: resourceTree.value,
}));

function createEmptyBackendFilters() {
  return {
    regionNameList: [],
    azNameList: [],
    resourceTypeList: [],
  };
}

function walkTree(tree, visitor) {
  (tree ?? []).forEach((item) => {
    visitor(item);
    if ((item.children ?? []).length > 0) {
      walkTree(item.children, visitor);
    }
  });
}

function parseOptionObj(item) {
  if (item?.obj) return item.obj;
  if (!item?.objStr) return null;
  try {
    return JSON.parse(item.objStr);
  } catch {
    return null;
  }
}

function getNodeSubmitValue(item, key) {
  if (item?.[key]) return item[key];
  const obj = parseOptionObj(item);
  if (obj?.[key]) return obj[key];
  return "";
}

function collectSubmitOptions(tree, key) {
  const optionMap = new Map();
  walkTree(tree, (item) => {
    const submitValue = getNodeSubmitValue(item, key);
    if (submitValue && !optionMap.has(submitValue)) {
      optionMap.set(submitValue, createSubmitOption(key, submitValue));
    }
  });
  return Array.from(optionMap.values());
}

function flattenResourceFamilies(tree) {
  return (tree ?? []).flatMap((series) => series.children ?? []);
}

function flattenResourceGenerations(tree) {
  return flattenResourceFamilies(tree).flatMap((family) => family.children ?? []);
}

function isOneLevelResourceTree(tree) {
  return (tree ?? []).length > 0 && (tree ?? []).every((item) => !(item.children ?? []).length);
}

function flattenResourceTypes(tree) {
  if (isOneLevelResourceTree(tree)) return tree ?? [];
  return flattenResourceGenerations(tree).flatMap((generation) => generation.children ?? []);
}

function getFilterOptionValue(item) {
  return item?.objStr ?? item?.value ?? item?.name ?? item?.label ?? "";
}

function createDefaultFilterValue(options) {
  const tree = options.resourceTree ?? [];
  return {
    regionNameList: showRegionFilter.value ? (options.regions ?? []).map(getFilterOptionValue) : [],
    azNameList: showAzFilter.value ? (options.azs ?? []).map(getFilterOptionValue) : [],
    resourceSeries: showResourceTypeFilter.value ? tree.map(getFilterOptionValue) : [],
    resourceFamily: showResourceTypeFilter.value ? flattenResourceFamilies(tree).map(getFilterOptionValue) : [],
    resourceVer: showResourceTypeFilter.value ? flattenResourceGenerations(tree).map(getFilterOptionValue) : [],
    resourceType: showResourceTypeFilter.value ? flattenResourceTypes(tree).map(getFilterOptionValue) : [],
  };
}

function keepValidValues(values, optionItems) {
  if (!Array.isArray(values)) return [];
  const validValues = new Set(optionItems.map(getFilterOptionValue));
  return values.filter((item) => validValues.has(item));
}

function reconcileFilterValue(value, options) {
  if (!value) return createDefaultFilterValue(options);
  const tree = options.resourceTree ?? [];
  return {
    regionNameList: keepValidValues(value.regionNameList, options.regions ?? []),
    azNameList: keepValidValues(value.azNameList, options.azs ?? []),
    resourceSeries: keepValidValues(value.resourceSeries, tree),
    resourceFamily: keepValidValues(value.resourceFamily, flattenResourceFamilies(tree)),
    resourceVer: keepValidValues(value.resourceVer, flattenResourceGenerations(tree)),
    resourceType: keepValidValues(value.resourceType, flattenResourceTypes(tree)),
  };
}

function getResourceTreeSignature(tree) {
  return flattenResourceTypes(tree).map(getFilterOptionValue).join("|");
}

function fillNewFilterGroups(value, options, oldOptions) {
  const nextValue = { ...(value ?? {}) };
  const defaultValue = createDefaultFilterValue(options);
  if (showRegionFilter.value && (oldOptions.regions ?? []).length === 0 && (options.regions ?? []).length > 0) {
    nextValue.regionNameList = defaultValue.regionNameList;
  }
  if (showAzFilter.value && (oldOptions.azs ?? []).length === 0 && (options.azs ?? []).length > 0) {
    nextValue.azNameList = defaultValue.azNameList;
  }
  const resourceTreeChanged =
    getResourceTreeSignature(oldOptions.resourceTree ?? []) !== getResourceTreeSignature(options.resourceTree ?? []);
  if (showResourceTypeFilter.value && resourceTreeChanged) {
    nextValue.resourceSeries = defaultValue.resourceSeries;
    nextValue.resourceFamily = defaultValue.resourceFamily;
    nextValue.resourceVer = defaultValue.resourceVer;
    nextValue.resourceType = defaultValue.resourceType;
  }
  return nextValue;
}

function getSubmitValue(item, keys) {
  const obj = parseOptionObj(item);
  for (const key of keys) {
    if (obj?.[key]) return obj[key];
  }
  return "";
}

function mapSelectedSubmitValues(selectedValues, optionItems, keys) {
  const selectedSet = new Set(selectedValues ?? []);
  return optionItems
    .filter((item) => selectedSet.has(getFilterOptionValue(item)))
    .map((item) => getSubmitValue(item, keys))
    .filter(Boolean);
}

function flattenResourceTypesWithSeries(tree) {
  if (isOneLevelResourceTree(tree)) {
    return (tree ?? []).map((item) => ({
      item,
      resourceSeries: "",
    }));
  }

  return (tree ?? []).flatMap((series) => {
    const resourceSeries = getSubmitValue(series, ["resourceSeries", "level0"]);
    return (series.children ?? []).flatMap((family) =>
      (family.children ?? []).flatMap((generation) =>
        (generation.children ?? []).map((type) => ({
          item: type,
          resourceSeries,
        }))
      )
    );
  });
}

function buildResourceTypeList(selectedValues, tree, submitMode) {
  const selectedSet = new Set(selectedValues ?? []);
  const oneLevelTree = isOneLevelResourceTree(tree);
  return flattenResourceTypesWithSeries(tree)
    .filter(({ item }) => selectedSet.has(getFilterOptionValue(item)))
    .map(({ item, resourceSeries }) => {
      const obj = parseOptionObj(item);
      if (submitMode === "resourceTypeOnly" || oneLevelTree) {
        return {
          resourceType: obj?.resourceType,
        };
      }
      return {
        resourceSeries,
        resourceFamily: obj?.resourceFamily,
        resourceVer: obj?.resourceVer,
        resourceType: obj?.resourceType,
      };
    })
    .filter((item) => item.resourceType);
}

function buildBackendFilterValue(value, options) {
  const tree = options.resourceTree ?? [];
  // 未展示的筛选项提交空数组，避免隐藏项的旧选中值继续影响请求。
  return {
    regionNameList: showRegionFilter.value
      ? mapSelectedSubmitValues(value.regionNameList, options.regions ?? [], ["regionName"])
      : [],
    azNameList: showAzFilter.value
      ? mapSelectedSubmitValues(value.azNameList, options.azs ?? [], ["azName"])
      : [],
    resourceTypeList: showResourceTypeFilter.value
      ? buildResourceTypeList(value.resourceType, tree, resolvedFilterConfig.value.resourceType.submitMode)
      : [],
  };
}

export function onFilterChange(value) {
  filterValue.value = reconcileFilterValue(value, filterOptions.value);
  backendFilters.value = buildBackendFilterValue(filterValue.value, filterOptions.value);
  clearBubbleTierFilter();
}

export function resetGeneralComputeFilter() {
  filterValue.value = createDefaultFilterValue(filterOptions.value);
  backendFilters.value = createEmptyBackendFilters();
  filterResetKey.value += 1;
  clearBubbleTierFilter();
}

export function setGeneralComputeFilterConfig(config) {
  filterConfig.value = config;
}

export function setVisibleTierFilter(config) {
  visibleTiers.value = [...(config.tiers ?? [])];
  return setBubbleTierFilter(config);
}

watch(
  filterOptions,
  (options, oldOptions) => {
    const nextValue = oldOptions
      ? fillNewFilterGroups(filterValue.value, options, oldOptions)
      : createDefaultFilterValue(options);
    filterValue.value = reconcileFilterValue(nextValue, options);
  },
  { deep: true, immediate: true }
);
