<template>
  <div class="filter-bar" :class="{ 'is-loading': loading }">
    <div v-if="showRangeFilter" class="filter-item">
      <span class="filter-label">范围粒度</span>
      <el-popover
        v-model:visible="rangeVisible"
        placement="bottom-start"
        :trigger="loading ? 'manual' : 'click'"
        width="fit-content"
        :show-arrow="false"
        popper-class="filter-popper filter-popper--range"
      >
        <template #reference>
          <button class="select-trigger" type="button" :disabled="loading">
            <span>{{ rangeSummary }}</span>
            <el-icon><ArrowDown /></el-icon>
          </button>
        </template>
        <div class="dropdown-panel range-panel">
          <div v-if="showRegionSearch" class="search-box range-search">
            <el-icon><Search /></el-icon>
            <input v-model="regionKeyword" placeholder="请输入关键字" />
          </div>
          <div class="range-columns" :class="{ 'range-columns--single': !showRegionFilter || !showAzFilter }">
            <div v-if="showRegionFilter" class="range-column">
              <div class="column-title">Region</div>
              <div class="option-list">
                <label class="option-row checked-row">
                  <el-checkbox
                    :model-value="isAllSelected(regionValue, filteredRegionOptions)"
                    :indeterminate="isIndeterminate(regionValue, filteredRegionOptions)"
                    @change="checked => toggleAll('region', checked)"
                  />
                  <span>全部</span>
                  <el-icon><ArrowRight /></el-icon>
                </label>
                <el-checkbox-group v-model="regionValue" class="option-group">
                  <label
                    v-for="item in filteredRegionOptions"
                    :key="item.value"
                    class="option-row"
                  >
                    <el-checkbox :value="item.value">{{ item.label }}</el-checkbox>
                    <el-icon><ArrowRight /></el-icon>
                  </label>
                </el-checkbox-group>
              </div>
            </div>

            <div v-if="showAzFilter" class="range-column">
              <div class="column-title">AZ</div>
              <div class="option-list">
                <label class="option-row checked-row">
                  <el-checkbox
                    :model-value="isAllSelected(azValue, filteredAzOptions)"
                    :indeterminate="isIndeterminate(azValue, filteredAzOptions)"
                    @change="checked => toggleAll('az', checked)"
                  />
                  <span>全部</span>
                  <el-icon><ArrowRight /></el-icon>
                </label>
                <el-checkbox-group v-model="azValue" class="option-group">
                  <label
                    v-for="item in filteredAzOptions"
                    :key="item.value"
                    class="option-row"
                  >
                    <el-checkbox :value="item.value">{{ item.label }}</el-checkbox>
                    <el-icon><ArrowRight /></el-icon>
                  </label>
                </el-checkbox-group>
              </div>
            </div>
          </div>
          <div class="panel-actions">
            <button class="plain-btn" type="button" @click="cancelRange">取消</button>
            <button class="primary-btn" type="button" @click="confirmRange">确定</button>
          </div>
        </div>
      </el-popover>
    </div>

    <div v-if="showResourceTypeFilter" class="filter-item">
      <span class="filter-label">资源粒度</span>
      <el-popover
        v-model:visible="resourceVisible"
        placement="bottom-start"
        :trigger="loading ? 'manual' : 'click'"
        width="fit-content"
        :show-arrow="false"
        :popper-class="resourcePopperClass"
      >
        <template #reference>
          <button class="select-trigger resource-trigger" type="button" :disabled="loading">
            <span>{{ loading ? '加载中' : resourceSummary }}</span>
            <el-icon><ArrowDown /></el-icon>
          </button>
        </template>
        <div v-if="isResourceListFilter" class="dropdown-panel resource-panel resource-panel--list">
          <div class="resource-columns resource-columns--list">
            <div class="resource-column">
              <div class="column-title">云服务</div>
              <div class="resource-scroll">
                <label class="resource-row checked-row">
                  <el-checkbox
                    :model-value="isAllSelected(resourceCloudServerValue, resourceTypeOnlyCloudServers)"
                    :indeterminate="isIndeterminate(resourceCloudServerValue, resourceTypeOnlyCloudServers)"
                    @change="checked => toggleAll('cloudServerType', checked)"
                  />
                  <span>全部</span>
                  <el-icon><ArrowRight /></el-icon>
                </label>
                <el-checkbox-group v-model="resourceCloudServerValue">
                  <label
                    v-for="item in resourceTypeOnlyCloudServers"
                    :key="item.value"
                    :class="['resource-row', { active: activeCloudServer === item.value }]"
                    @mouseenter="activeCloudServer = item.value"
                  >
                    <el-checkbox :value="item.value">{{ item.label }}</el-checkbox>
                    <el-icon><ArrowRight /></el-icon>
                  </label>
                </el-checkbox-group>
              </div>
            </div>

            <div class="resource-column">
              <div class="column-title">资源类型</div>
              <div class="resource-scroll">
                <label class="resource-row checked-row">
                  <el-checkbox
                    :model-value="isAllSelected(resourceTypeValue, visibleResourceTypes)"
                    :indeterminate="isIndeterminate(resourceTypeValue, visibleResourceTypes)"
                    @change="checked => toggleAll('resourceType', checked)"
                  />
                  <span>全部</span>
                </label>
                <el-checkbox-group v-model="resourceTypeValue">
                  <label
                    v-for="item in visibleResourceTypes"
                    :key="item.value"
                    class="resource-row"
                  >
                    <el-checkbox :value="item.value">{{ item.label }}</el-checkbox>
                  </label>
                </el-checkbox-group>
              </div>
            </div>
          </div>
        </div>
        <div
          v-else
          class="dropdown-panel resource-panel"
          :class="{ 'resource-panel--single': isOneLevelResourceTree }"
        >
          <div class="resource-columns" :class="{ 'resource-columns--single': isOneLevelResourceTree }">
            <div v-if="!isOneLevelResourceTree" class="resource-column">
              <div class="column-title">云服务</div>
              <div class="resource-scroll">
                <label class="resource-row checked-row">
                  <el-checkbox
                    :model-value="isAllSelected(resourceCloudServerValue, resourceCloudServers)"
                    :indeterminate="isIndeterminate(resourceCloudServerValue, resourceCloudServers)"
                    @change="checked => toggleAll('cloudServerType', checked)"
                  />
                  <span>全部</span>
                  <el-icon><ArrowRight /></el-icon>
                </label>
                <el-checkbox-group v-model="resourceCloudServerValue">
                  <label
                    v-for="item in resourceCloudServers"
                    :key="item.value"
                    :class="['resource-row', { active: activeCloudServer === item.value }]"
                    @mouseenter="activeCloudServer = item.value"
                  >
                    <el-checkbox :value="item.value">{{ item.label }}</el-checkbox>
                    <el-icon><ArrowRight /></el-icon>
                  </label>
                </el-checkbox-group>
              </div>
            </div>

            <div v-if="!isOneLevelResourceTree" class="resource-column">
              <div class="column-title">资源系列</div>
              <div class="resource-scroll">
                <label class="resource-row checked-row">
                  <el-checkbox
                    :model-value="isAllSelected(resourceSeriesValue, visibleResourceSeries)"
                    :indeterminate="isIndeterminate(resourceSeriesValue, visibleResourceSeries)"
                    @change="checked => toggleAll('resourceSeries', checked)"
                  />
                  <span>全部</span>
                  <el-icon><ArrowRight /></el-icon>
                </label>
                <el-checkbox-group v-model="resourceSeriesValue">
                  <label
                    v-for="item in visibleResourceSeries"
                    :key="item.value"
                    :class="['resource-row', { active: activeSeries === item.value }]"
                    @mouseenter="activeSeries = item.value"
                  >
                    <el-checkbox :value="item.value">{{ item.label }}</el-checkbox>
                    <el-icon><ArrowRight /></el-icon>
                  </label>
                </el-checkbox-group>
              </div>
            </div>

            <div v-if="!isOneLevelResourceTree" class="resource-column">
              <div class="column-title">资源族</div>
              <div class="resource-scroll">
                <label class="resource-row checked-row">
                  <el-checkbox
                    :model-value="isAllSelected(resourceFamilyValue, visibleResourceFamilies)"
                    :indeterminate="isIndeterminate(resourceFamilyValue, visibleResourceFamilies)"
                    @change="checked => toggleAll('resourceFamily', checked)"
                  />
                  <span>全部</span>
                  <el-icon><ArrowRight /></el-icon>
                </label>
                <el-checkbox-group v-model="resourceFamilyValue">
                  <label
                    v-for="item in visibleResourceFamilies"
                    :key="item.value"
                    :class="['resource-row', { active: activeFamily === item.value }]"
                    @mouseenter="activeFamily = item.value"
                  >
                    <el-checkbox :value="item.value">{{ item.label }}</el-checkbox>
                    <el-icon><ArrowRight /></el-icon>
                  </label>
                </el-checkbox-group>
              </div>
            </div>

            <div v-if="!isOneLevelResourceTree" class="resource-column">
              <div class="column-title">资源代数</div>
              <div class="resource-scroll">
                <label class="resource-row checked-row">
                  <el-checkbox
                    :model-value="isAllSelected(resourceVerValue, visibleResourceGenerations)"
                    :indeterminate="isIndeterminate(resourceVerValue, visibleResourceGenerations)"
                    @change="checked => toggleAll('resourceVer', checked)"
                  />
                  <span>全部</span>
                  <el-icon><ArrowRight /></el-icon>
                </label>
                <el-checkbox-group v-model="resourceVerValue">
                  <label
                    v-for="item in visibleResourceGenerations"
                    :key="item.value"
                    :class="['resource-row', { active: activeGeneration === item.value }]"
                    @mouseenter="activeGeneration = item.value"
                  >
                    <el-checkbox :value="item.value">{{ item.label }}</el-checkbox>
                    <el-icon><ArrowRight /></el-icon>
                  </label>
                </el-checkbox-group>
              </div>
            </div>

            <div class="resource-column">
              <div class="column-title">资源类型</div>
              <div class="resource-scroll">
                <label class="resource-row checked-row">
                  <el-checkbox
                    :model-value="isAllSelected(resourceTypeValue, visibleResourceTypes)"
                    :indeterminate="isIndeterminate(resourceTypeValue, visibleResourceTypes)"
                    @change="checked => toggleAll('resourceType', checked)"
                  />
                  <span>全部</span>
                </label>
                <el-checkbox-group v-model="resourceTypeValue">
                  <label
                    v-for="item in visibleResourceTypes"
                    :key="item.value"
                    class="resource-row"
                  >
                    <el-checkbox :value="item.value">{{ item.label }}</el-checkbox>
                  </label>
                </el-checkbox-group>
              </div>
            </div>
          </div>
          <div v-if="isResourceConfirmable" class="panel-actions">
            <button class="plain-btn" type="button" @click="cancelResource">取消</button>
            <button class="primary-btn" type="button" @click="confirmResource">确定</button>
          </div>
        </div>
      </el-popover>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { ArrowDown, ArrowRight, Search } from '@element-plus/icons-vue';

const props = defineProps({
  options: {
    type: Object,
    default: () => ({
      regionNameList: [],
      azNameList: [],
      resourceTree: [],
    }),
  },
  modelValue: {
    type: Object,
    default: null,
  },
  showRegionFilter: { type: Boolean, default: true },
  showAzFilter: { type: Boolean, default: true },
  filterConfig: { type: Object, default: null },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'change']);

const rangeVisible = ref(false);
const resourceVisible = ref(false);
const regionKeyword = ref('');

const regionOptions = computed(() => sortOptionsByInitial(normalizeOptions(props.options?.regionNameList)));
const azOptions = computed(() => sortOptionsByInitial(normalizeOptions(props.options?.azNameList)));

// FilterDropdowns 只关心展示和交互：哪些框显示、资源类型用树还是单列、是否需要确定按钮。
// 后端字段形态由通算筛选 composable 统一转换，避免 UI 组件夹带资源池判断。
const resolvedFilterConfig = computed(() => ({
  region: {
    visible: props.showRegionFilter,
    searchable: true,
    ...(props.filterConfig?.region ?? {}),
  },
  az: {
    visible: props.showAzFilter,
    searchable: false,
    ...(props.filterConfig?.az ?? {}),
  },
  resourceType: {
    visible: true,
    variant: "tree",
    submitMode: "tree",
    confirmable: true,
    ...(props.filterConfig?.resourceType ?? {}),
  },
}));
const showRegionFilter = computed(() => resolvedFilterConfig.value.region.visible);
const showAzFilter = computed(() => resolvedFilterConfig.value.az.visible);
const showRangeFilter = computed(() => showRegionFilter.value || showAzFilter.value);
const showRegionSearch = computed(() => resolvedFilterConfig.value.region.searchable);
const showResourceTypeFilter = computed(() => resolvedFilterConfig.value.resourceType.visible);
const isResourceListFilter = computed(() => resolvedFilterConfig.value.resourceType.variant === "list");
const isResourceConfirmable = computed(() => resolvedFilterConfig.value.resourceType.confirmable);
const resourcePopperClass = computed(() => "filter-popper");
const loading = computed(() => props.loading);
const filteredAzOptions = computed(() => filterAzOptionsByRegions(azOptions.value, regionValue.value));
const resourceTree = computed(() => normalizeResourceTree(props.options?.resourceTree));
const isOneLevelResourceTree = computed(() =>
  resourceTree.value.length > 0 && resourceTree.value.every(item => !(item.children ?? []).length)
);
const resourceCloudServers = computed(() => resourceTree.value.map(toOptionMeta));
const resourceTypeOnlyCloudServers = computed(() => {
  const cloudServers = resourceTree.value.filter(item => collectDirectTypesByCloudServers([item.value]).length > 0);
  return getUniqueOptions(cloudServers);
});
const currentResourceCloudServers = computed(() => {
  if (isResourceListFilter.value) {
    return resourceTypeOnlyCloudServers.value;
  }
  return resourceCloudServers.value;
});
const allResourceSeries = computed(() => collectSeriesByCloudServers(resourceCloudServers.value.map(item => item.value)));
const allResourceFamilies = computed(() =>
  collectFamiliesBySeries(resourceCloudServers.value.map(item => item.value), allResourceSeries.value.map(item => item.value))
);
const allResourceGenerations = computed(() =>
  collectGenerationsByFamilies(
    resourceCloudServers.value.map(item => item.value),
    allResourceSeries.value.map(item => item.value),
    allResourceFamilies.value.map(item => item.value),
  )
);
const allResourceTypes = computed(() => {
  if (isResourceListFilter.value) {
    return collectDirectTypesByCloudServers(resourceTypeOnlyCloudServers.value.map(item => item.value));
  }
  return collectTypesByGenerations(
    resourceCloudServers.value.map(item => item.value),
    allResourceSeries.value.map(item => item.value),
    allResourceFamilies.value.map(item => item.value),
    allResourceGenerations.value.map(item => item.value),
  );
});

const regionValue = ref([]);
const azValue = ref([]);
const resourceCloudServerValue = ref([]);
const resourceSeriesValue = ref([]);
const resourceFamilyValue = ref([]);
const resourceVerValue = ref([]);
const resourceTypeValue = ref([]);
const rangeSnapshot = ref(getRangeValue());
const resourceSnapshot = ref(getResourceValue());

const activeCloudServer = ref('');
const activeSeries = ref('');
const activeFamily = ref('');
const activeGeneration = ref('');
let syncingFromModel = false;
let syncingResourceCascade = false;
let syncingLocationCascade = false;

const filteredRegionOptions = computed(() => {
  const keyword = regionKeyword.value.trim().toLowerCase();
  if (!keyword) {
    return regionOptions.value;
  }
  return regionOptions.value.filter(item => item.label.toLowerCase().includes(keyword));
});

const visibleResourceSeries = computed(() =>
  collectSeriesByCloudServers(resourceCloudServerValue.value)
);

const visibleResourceFamilies = computed(() => {
  return collectFamiliesBySeries(resourceCloudServerValue.value, resourceSeriesValue.value);
});

const visibleResourceGenerations = computed(() => {
  return collectGenerationsByFamilies(
    resourceCloudServerValue.value,
    resourceSeriesValue.value,
    resourceFamilyValue.value,
  );
});

const visibleResourceTypes = computed(() => {
  if (isOneLevelResourceTree.value) {
    return allResourceTypes.value;
  }
  if (isResourceListFilter.value) {
    return collectDirectTypesByCloudServers(resourceCloudServerValue.value);
  }
  return collectTypesByGenerations(
    resourceCloudServerValue.value,
    resourceSeriesValue.value,
    resourceFamilyValue.value,
    resourceVerValue.value,
  );
});

const resourceSummary = computed(() => {
  return `已选 ${resourceTypeValue.value.length} 项`;
});

const rangeSummary = computed(() => {
  const regionComplete = !showRegionFilter.value || isAllSelected(regionValue.value, regionOptions.value);
  const azComplete = !showAzFilter.value || isAllSelected(azValue.value, filteredAzOptions.value);
  if (regionComplete && azComplete) {
    return '全部';
  }
  if (showRegionFilter.value && !showAzFilter.value) {
    return getSummary(regionValue.value, regionOptions.value);
  }
  if (!showRegionFilter.value && showAzFilter.value) {
    return getSummary(azValue.value, filteredAzOptions.value);
  }
  return `已选 ${regionValue.value.length + azValue.value.length} 项`;
});

watch(resourceSeriesValue, (nextValue, oldValue) => {
  if (syncingFromModel) return;
  if (syncingResourceCascade) return;
  syncingResourceCascade = true;
  syncSeriesCascade(nextValue, oldValue);
  syncingResourceCascade = false;
}, { flush: 'sync' });

watch(resourceCloudServerValue, (nextValue, oldValue) => {
  if (syncingFromModel) return;
  if (syncingResourceCascade) return;
  syncingResourceCascade = true;
  syncCloudServerCascade(nextValue, oldValue);
  syncingResourceCascade = false;
}, { flush: 'sync' });

watch(resourceFamilyValue, (nextValue, oldValue) => {
  if (syncingFromModel) return;
  if (syncingResourceCascade) return;
  syncingResourceCascade = true;
  syncFamilyCascade(nextValue, oldValue);
  syncingResourceCascade = false;
}, { flush: 'sync' });

watch(resourceVerValue, (nextValue, oldValue) => {
  if (syncingFromModel) return;
  if (syncingResourceCascade) return;
  syncingResourceCascade = true;
  syncGenerationCascade(nextValue, oldValue);
  syncingResourceCascade = false;
}, { flush: 'sync' });

watch(resourceTypeValue, () => {
  if (syncingFromModel) return;
  // list 型资源类型保持即时提交；tree 型仍等用户点击“确定”。
  if (!isResourceListFilter.value) return;
  emitCurrentValue();
}, { deep: true, flush: 'sync' });

watch(regionValue, () => {
  if (syncingFromModel) return;
  syncingLocationCascade = true;
  azValue.value = filteredAzOptions.value.map(item => item.value);
  syncingLocationCascade = false;
  if (rangeVisible.value) return;
  emitCurrentValue();
}, { deep: true, flush: 'sync' });

watch(azValue, () => {
  if (syncingFromModel) return;
  if (syncingLocationCascade) return;
  if (rangeVisible.value) return;
  emitCurrentValue();
}, { deep: true, flush: 'sync' });

watch(rangeVisible, (visible) => {
  if (loading.value) {
    rangeVisible.value = false;
    return;
  }
  if (visible) {
    rangeSnapshot.value = getRangeValue();
    return;
  }

  syncingFromModel = true;
  setRangeValue(rangeSnapshot.value);
  syncingFromModel = false;
});

watch(resourceVisible, (visible) => {
  if (loading.value) {
    resourceVisible.value = false;
    return;
  }
  if (!isResourceConfirmable.value) {
    return;
  }
  if (visible) {
    resourceSnapshot.value = getResourceValue();
    return;
  }

  syncingFromModel = true;
  setResourceValue(resourceSnapshot.value);
  syncingFromModel = false;
});

watch(
  () => props.modelValue,
  (value) => {
    applyModelValue(value);
  },
  { deep: true, immediate: true }
);

watch(
  () => props.options,
  () => {
    applyModelValue(props.modelValue);
  },
  { deep: true }
);

watch(loading, (value) => {
  if (!value) return;
  rangeVisible.value = false;
  resourceVisible.value = false;
});

function normalizeOptions(options) {
  return (options ?? []).map(item => {
    if (typeof item === 'string') {
      return { label: item, value: item, name: item };
    }
    return normalizeNode(item);
  }).filter(item => item.value);
}

function sortOptionsByInitial(options) {
  const collator = new Intl.Collator('zh-Hans-CN', {
    numeric: true,
    sensitivity: 'base',
  });
  return [...options].sort((a, b) => collator.compare(a.label, b.label));
}

function normalizeResourceTree(tree) {
  return (tree ?? []).map(normalizeNode).filter(item => item.value);
}

function normalizeNode(item) {
  const label = item?.label ?? item?.name ?? item?.value ?? '';
  const value = item?.objStr ?? item?.value ?? item?.name ?? item?.label ?? '';
  return {
    label,
    value,
    name: item?.name ?? label,
    level: item?.level,
    obj: item?.obj,
    objStr: item?.objStr,
    children: normalizeOptions(item?.children),
  };
}

function toOptionMeta(item) {
  return {
    label: item.label,
    value: item.value,
    name: item.name,
    level: item.level,
    obj: item.obj,
    objStr: item.objStr,
  };
}

function allSelectedValue() {
  return {
    regionNameList: regionOptions.value.map(item => item.value),
    azNameList: azOptions.value.map(item => item.value),
    cloudServerType: currentResourceCloudServers.value.map(item => item.value),
    resourceSeries: isResourceListFilter.value ? [] : allResourceSeries.value.map(item => item.value),
    resourceFamily: isResourceListFilter.value ? [] : allResourceFamilies.value.map(item => item.value),
    resourceVer: isResourceListFilter.value ? [] : allResourceGenerations.value.map(item => item.value),
    resourceType: allResourceTypes.value.map(item => item.value),
  };
}

function applyModelValue(value) {
  syncingFromModel = true;
  const fallback = allSelectedValue();
  const next = value ?? fallback;
  regionValue.value = keepValid(getModelGroupValue(next, 'regionNameList', fallback), regionOptions.value, fallback.regionNameList);
  azValue.value = keepValid(getModelGroupValue(next, 'azNameList', fallback), filteredAzOptions.value, fallback.azNameList);
  resourceCloudServerValue.value = keepValid(getModelGroupValue(next, 'cloudServerType', fallback), currentResourceCloudServers.value, fallback.cloudServerType);
  resourceSeriesValue.value = keepValid(getModelGroupValue(next, 'resourceSeries', fallback), allResourceSeries.value, fallback.resourceSeries);
  resourceFamilyValue.value = keepValid(getModelGroupValue(next, 'resourceFamily', fallback), allResourceFamilies.value, fallback.resourceFamily);
  resourceVerValue.value = keepValid(getModelGroupValue(next, 'resourceVer', fallback), allResourceGenerations.value, fallback.resourceVer);
  resourceTypeValue.value = keepValid(getModelGroupValue(next, 'resourceType', fallback), allResourceTypes.value, fallback.resourceType);
  rangeSnapshot.value = getRangeValue();
  resourceSnapshot.value = getResourceValue();
  activeCloudServer.value = currentResourceCloudServers.value[0]?.value ?? '';
  activeSeries.value = visibleResourceSeries.value[0]?.value ?? '';
  activeFamily.value = allResourceFamilies.value[0]?.value ?? '';
  activeGeneration.value = allResourceGenerations.value[0]?.value ?? '';
  syncingFromModel = false;
}

function getModelGroupValue(value, key, fallback) {
  if (Object.prototype.hasOwnProperty.call(value, key)) {
    return value[key];
  }
  return fallback[key];
}

function keepValid(values, options, fallback) {
  if (!Array.isArray(values)) {
    return [...fallback];
  }
  const optionValues = new Set(options.map(item => item.value));
  return values.filter(item => optionValues.has(item));
}

function filterAzOptionsByRegions(options, selectedRegions) {
  if (!regionOptions.value.length) {
    return options;
  }
  if (!selectedRegions?.length) {
    return [];
  }

  const regionLabels = regionOptions.value
    .filter(item => selectedRegions.includes(item.value))
    .flatMap(item => [item.value, item.label])
    .filter(Boolean);

  return options.filter((item) => {
    const azName = String(item.label ?? item.value ?? "");
    return regionLabels.some(region => azName.startsWith(region));
  });
}

function emitCurrentValue() {
  if (syncingFromModel) return;
  const value = {
    regionNameList: [...regionValue.value],
    azNameList: [...azValue.value],
    cloudServerType: [...resourceCloudServerValue.value],
    resourceSeries: [...resourceSeriesValue.value],
    resourceFamily: [...resourceFamilyValue.value],
    resourceVer: [...resourceVerValue.value],
    resourceType: [...resourceTypeValue.value],
  };
  emit('update:modelValue', value);
  emit('change', value);
}

function getUniqueOptions(options) {
  const map = new Map();
  (options ?? []).forEach(item => {
    if (!map.has(item.value)) {
      map.set(item.value, toOptionMeta(item));
    }
  });
  return Array.from(map.values());
}

function isResourceTypeNode(item) {
  return Boolean(item?.obj?.resourceType);
}

function collectSelectedCloudServers(cloudServerValues) {
  const cloudServerSet = new Set(cloudServerValues);
  return resourceTree.value.filter(item => cloudServerSet.has(item.value));
}

function collectSeriesByCloudServers(cloudServerValues) {
  if (isOneLevelResourceTree.value) {
    return [];
  }
  const series = collectSelectedCloudServers(cloudServerValues)
    .flatMap(item => item.children ?? [])
    .filter(item => !isResourceTypeNode(item));
  return getUniqueOptions(series);
}

function collectDirectTypesByCloudServers(cloudServerValues) {
  if (isOneLevelResourceTree.value) {
    return resourceTree.value;
  }
  const types = collectSelectedCloudServers(cloudServerValues)
    .flatMap(item => item.children ?? [])
    .filter(isResourceTypeNode);
  return getUniqueOptions(types);
}

function syncCloudServerCascade(nextValue, oldValue) {
  const { added } = getValueChange(nextValue, oldValue);
  const addedSeries = collectSeriesByCloudServers(added);
  const addedFamilies = collectFamiliesBySeries(added, addedSeries.map(item => item.value));
  const addedGenerations = collectGenerationsByFamilies(
    added,
    addedSeries.map(item => item.value),
    addedFamilies.map(item => item.value),
  );
  const addedTypes = collectTypesByGenerations(
    added,
    addedSeries.map(item => item.value),
    addedFamilies.map(item => item.value),
    addedGenerations.map(item => item.value),
  );
  resourceSeriesValue.value = mergeValues(resourceSeriesValue.value, addedSeries.map(item => item.value));
  resourceFamilyValue.value = mergeValues(resourceFamilyValue.value, addedFamilies.map(item => item.value));
  resourceVerValue.value = mergeValues(resourceVerValue.value, addedGenerations.map(item => item.value));
  resourceTypeValue.value = mergeValues(resourceTypeValue.value, addedTypes.map(item => item.value));
  pruneResourceSelections();
}

function syncSeriesCascade(nextValue, oldValue) {
  const { added } = getValueChange(nextValue, oldValue);
  const addedFamilies = collectFamiliesBySeries(resourceCloudServerValue.value, added);
  const addedGenerations = collectGenerationsByFamilies(
    resourceCloudServerValue.value,
    nextValue,
    addedFamilies.map(item => item.value),
  );
  const addedTypes = collectTypesByGenerations(
    resourceCloudServerValue.value,
    nextValue,
    addedFamilies.map(item => item.value),
    addedGenerations.map(item => item.value),
  );
  resourceFamilyValue.value = mergeValues(resourceFamilyValue.value, addedFamilies.map(item => item.value));
  resourceVerValue.value = mergeValues(resourceVerValue.value, addedGenerations.map(item => item.value));
  resourceTypeValue.value = mergeValues(resourceTypeValue.value, addedTypes.map(item => item.value));
  pruneResourceSelections();
}

function syncFamilyCascade(nextValue, oldValue) {
  const { added } = getValueChange(nextValue, oldValue);
  const addedGenerations = collectGenerationsByFamilies(
    resourceCloudServerValue.value,
    resourceSeriesValue.value,
    added,
  );
  const addedTypes = collectTypesByGenerations(
    resourceCloudServerValue.value,
    resourceSeriesValue.value,
    nextValue,
    addedGenerations.map(item => item.value),
  );
  resourceVerValue.value = mergeValues(resourceVerValue.value, addedGenerations.map(item => item.value));
  resourceTypeValue.value = mergeValues(resourceTypeValue.value, addedTypes.map(item => item.value));
  pruneResourceSelections();
}

function syncGenerationCascade(nextValue, oldValue) {
  const { added } = getValueChange(nextValue, oldValue);
  const addedTypes = collectTypesByGenerations(
    resourceCloudServerValue.value,
    resourceSeriesValue.value,
    resourceFamilyValue.value,
    added,
  );
  resourceTypeValue.value = mergeValues(resourceTypeValue.value, addedTypes.map(item => item.value));
  pruneResourceSelections();
}

function pruneResourceSelections() {
  const seriesValues = collectSeriesByCloudServers(resourceCloudServerValue.value).map(item => item.value);
  resourceSeriesValue.value = keepValueIntersection(resourceSeriesValue.value, seriesValues);

  const familyValues = collectFamiliesBySeries(resourceCloudServerValue.value, resourceSeriesValue.value).map(item => item.value);
  resourceFamilyValue.value = keepValueIntersection(resourceFamilyValue.value, familyValues);

  const generationValues = collectGenerationsByFamilies(
    resourceCloudServerValue.value,
    resourceSeriesValue.value,
    resourceFamilyValue.value,
  ).map(item => item.value);
  resourceVerValue.value = keepValueIntersection(resourceVerValue.value, generationValues);

  const typeValues = collectTypesByGenerations(
    resourceCloudServerValue.value,
    resourceSeriesValue.value,
    resourceFamilyValue.value,
    resourceVerValue.value,
  ).map(item => item.value);
  resourceTypeValue.value = keepValueIntersection(resourceTypeValue.value, typeValues);
}

function collectFamiliesBySeries(cloudServerValues, seriesValues) {
  if (isOneLevelResourceTree.value) {
    return [];
  }
  const seriesSet = new Set(seriesValues);
  const families = collectSeriesByCloudServers(cloudServerValues)
    .filter(item => seriesSet.has(item.value))
    .flatMap(item => item.children ?? []);
  return getUniqueOptions(families);
}

function collectGenerationsByFamilies(cloudServerValues, seriesValues, familyValues) {
  if (isOneLevelResourceTree.value) {
    return [];
  }
  const seriesSet = new Set(seriesValues);
  const familySet = new Set(familyValues);
  const generations = collectSeriesByCloudServers(cloudServerValues)
    .filter(item => seriesSet.has(item.value))
    .flatMap(item => item.children ?? [])
    .filter(item => familySet.has(item.value))
    .flatMap(item => item.children ?? []);
  return getUniqueOptions(generations);
}

function collectTypesByGenerations(cloudServerValues, seriesValues, familyValues, generationValues) {
  if (isOneLevelResourceTree.value) {
    return getUniqueOptions(resourceTree.value);
  }
  const seriesSet = new Set(seriesValues);
  const familySet = new Set(familyValues);
  const generationSet = new Set(generationValues);
  const nestedTypes = collectSeriesByCloudServers(cloudServerValues)
    .filter(item => seriesSet.has(item.value))
    .flatMap(item => item.children ?? [])
    .filter(item => familySet.has(item.value))
    .flatMap(item => item.children ?? [])
    .filter(item => generationSet.has(item.value))
    .flatMap(item => item.children ?? []);
  return getUniqueOptions([
    ...collectDirectTypesByCloudServers(cloudServerValues),
    ...nestedTypes,
  ]);
}

function getValueChange(nextValue = [], oldValue = []) {
  const oldSet = new Set(oldValue);
  const nextSet = new Set(nextValue);
  return {
    added: nextValue.filter(item => !oldSet.has(item)),
    removed: oldValue.filter(item => !nextSet.has(item)),
  };
}

function mergeValues(currentValue, addedValue) {
  return Array.from(new Set([...(currentValue ?? []), ...(addedValue ?? [])]));
}

function keepValueIntersection(currentValue, allowedValue) {
  const allowedSet = new Set(allowedValue);
  return (currentValue ?? []).filter(item => allowedSet.has(item));
}

function getResourceValue() {
  return {
    cloudServerType: [...resourceCloudServerValue.value],
    resourceSeries: [...resourceSeriesValue.value],
    resourceFamily: [...resourceFamilyValue.value],
    resourceVer: [...resourceVerValue.value],
    resourceType: [...resourceTypeValue.value],
  };
}

function setResourceValue(value) {
  resourceCloudServerValue.value = [...(value.cloudServerType ?? [])];
  resourceSeriesValue.value = [...(value.resourceSeries ?? [])];
  resourceFamilyValue.value = [...(value.resourceFamily ?? [])];
  resourceVerValue.value = [...(value.resourceVer ?? [])];
  resourceTypeValue.value = [...(value.resourceType ?? [])];
}

function getRangeValue() {
  return {
    regionNameList: [...regionValue.value],
    azNameList: [...azValue.value],
  };
}

function setRangeValue(value) {
  regionValue.value = [...value.regionNameList];
  azValue.value = [...value.azNameList];
}

function getSummary(value, options) {
  if (value.length === options.length && options.length > 0) {
    return '全部';
  }
  if (!value.length) {
    return '请选择';
  }
  const first = options.find(item => item.value === value[0])?.label ?? value[0];
  return value.length === 1 ? first : `${first} +${value.length - 1}`;
}

function isAllSelected(value, options) {
  const optionValues = options.map(item => item.value);
  return optionValues.length > 0 && optionValues.every(item => value.includes(item));
}

function isIndeterminate(value, options) {
  const selectedCount = options.filter(item => value.includes(item.value)).length;
  return selectedCount > 0 && selectedCount < options.length;
}

function toggleAll(type, checked) {
  const values = checked ? getOptionsByType(type).map(item => item.value) : [];
  if (type === 'region') {
    regionValue.value = values;
  }
  if (type === 'az') {
    azValue.value = values;
  }
  if (type === 'cloudServerType') {
    resourceCloudServerValue.value = values;
  }
  if (type === 'resourceSeries') {
    resourceSeriesValue.value = values;
  }
  if (type === 'resourceFamily') {
    resourceFamilyValue.value = values;
  }
  if (type === 'resourceVer') {
    resourceVerValue.value = values;
  }
  if (type === 'resourceType') {
    resourceTypeValue.value = values;
  }
}

function getOptionsByType(type) {
  const map = {
    region: filteredRegionOptions.value,
    az: filteredAzOptions.value,
    cloudServerType: currentResourceCloudServers.value,
    resourceSeries: visibleResourceSeries.value,
    resourceFamily: visibleResourceFamilies.value,
    resourceVer: visibleResourceGenerations.value,
    resourceType: visibleResourceTypes.value,
  };
  return map[type] ?? [];
}

function cancelRange() {
  syncingFromModel = true;
  setRangeValue(rangeSnapshot.value);
  syncingFromModel = false;
  rangeVisible.value = false;
}

function confirmRange() {
  rangeSnapshot.value = getRangeValue();
  rangeVisible.value = false;
  emitCurrentValue();
}

function cancelResource() {
  syncingFromModel = true;
  setResourceValue(resourceSnapshot.value);
  syncingFromModel = false;
  resourceVisible.value = false;
}

function confirmResource() {
  resourceSnapshot.value = getResourceValue();
  resourceVisible.value = false;
  emitCurrentValue();
}
</script>

<style scoped lang="less">
.filter-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
}

.filter-bar.is-loading {
  cursor: progress;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.filter-label {
  flex: 0 0 auto;
  font-size: 13px;
  font-weight: 400;
  color: #6262a8;
}

.select-trigger {
  width: 116px;
  height: 28px;
  padding: 0 8px 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #dfe1e6;
  border-radius: 4px;
  background: #fff;
  color: #252b3a;
  font-size: 13px;
  text-align: left;
  cursor: pointer;

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.select-trigger:disabled {
  cursor: not-allowed;
  background: #f5f7fb;
  color: #9095a3;
}

.resource-trigger {
  width: 126px;
}

.dropdown-panel {
  background: #fff;
  color: #252b3a;
  font-family: Microsoft YaHei, Arial, sans-serif;
}

.single {
  width: 100%;
  padding: 0;
  box-sizing: border-box;
}

:global(.filter-popper--single) {
  box-sizing: border-box;
  padding: 10px;
}

:global(.filter-popper--range) {
  box-sizing: border-box;
  padding: 10px;
}

.az-panel {
  padding-top: 12px;
}

.search-box {
  height: 34px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  margin-bottom: 8px;
  border: 1px solid #dfe1e6;
  border-radius: 4px;
  color: #697386;
  box-sizing: border-box;

  input {
    flex: 1;
    border: 0;
    outline: 0;
    min-width: 0;
    color: #33336b;
    font-size: 14px;

    &::placeholder {
      color: #adb0b8;
    }
  }
}

.option-list {
  max-height: 220px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.option-group {
  display: flex;
  flex-direction: column;
}

.range-panel {
  width: 520px;
}

.range-search {
  margin: 0 10px 8px;
}

.range-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(210px, 1fr));
  gap: 8px;
  padding: 0 10px 8px;
}

.range-columns--single {
  grid-template-columns: minmax(210px, 1fr);
}

.range-column {
  min-width: 0;

  .option-list {
    max-height: 240px;
  }

  .option-row {
    justify-content: space-between;
    cursor: pointer;
  }

  .checked-row {
    justify-content: flex-start;
  }

  .option-row :deep(.el-checkbox) {
    width: auto;
    flex: 1;
    min-width: 0;
  }

  .checked-row > :deep(.el-checkbox) {
    width: auto !important;
    flex: 0 0 auto !important;
    min-width: auto !important;
  }

  .option-row :deep(.el-checkbox__label) {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .option-row .el-icon {
    flex: 0 0 auto;
    margin-left: 8px;
  }

  .checked-row .el-icon {
    margin-left: auto;
  }
}

.option-row,
.resource-row {
  min-height: 28px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  box-sizing: border-box;
  color: #33336b;
  font-size: 13px;
}

.option-row {
  padding: 0 10px;
}

.checked-row {
  background: #e9ebfd;
}

.option-row.is-checked,
.option-row.is-indeterminate,
.option-row:has(.el-checkbox.is-checked),
.option-row:has(.el-checkbox.is-indeterminate),
.resource-row:has(.el-checkbox.is-checked) {
  background: #e9ebfd;
}

.checked-row {
  gap: 10px;

  > :deep(.el-checkbox) {
    width: auto;
    flex: 0 0 auto;
  }

  span {
    white-space: nowrap;
  }

  > :deep(.el-checkbox.is-checked) + span,
  > :deep(.el-checkbox.is-indeterminate) + span {
    color: #33336b;
    font-weight: 600;
  }
}

.resource-panel {
  width: min(900px, calc(100vw - 32px));
}

.resource-panel--single {
  width: 220px;
}

.resource-panel--list {
  width: min(420px, calc(100vw - 32px));
}

.resource-columns {
  display: grid;
  grid-template-columns: repeat(5, minmax(136px, 1fr));
  gap: 8px;
  padding: 10px 14px 8px;
}

.resource-columns--list {
  grid-template-columns: repeat(2, minmax(150px, 1fr));
}

.resource-columns--single {
  grid-template-columns: minmax(180px, 1fr);
}

.resource-column {
  min-width: 0;
}

.column-title {
  height: 24px;
  line-height: 24px;
  margin-bottom: 6px;
  border-bottom: 1px solid #dfe1e6;
  font-size: 13px;
  font-weight: 600;
}

.resource-scroll {
  height: 150px;
  overflow-y: auto;
  padding-right: 4px;
  overflow-x: hidden;
}

.resource-row {
  justify-content: space-between;
  padding: 0 8px;
  cursor: pointer;

  &:hover,
  &.active {
    background: #f7f9ff;
  }
}

.panel-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 6px 14px;
  border-top: 1px solid #edf0f5;
}

.plain-btn,
.primary-btn {
  min-width: 62px;
  height: 28px;
  padding: 0 12px;
  border-radius: 3px;
  font-size: 13px;
  cursor: pointer;
}

.plain-btn {
  border: 1px solid #adb0b8;
  background: #fff;
  color: #252b3a;
}

.primary-btn {
  border: 1px solid #4a4abd;
  background: #4a4abd;
  color: #fff;
}

:deep(.el-checkbox) {
  width: 100%;
  height: 28px;
  margin-right: 0;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner),
:deep(.el-checkbox__input.is-indeterminate .el-checkbox__inner) {
  background-color: #444494;
  border-color: #444494;
}

:deep(.el-checkbox__input.is-checked + .el-checkbox__label),
:deep(.el-checkbox__input.is-indeterminate + .el-checkbox__label) {
  color: #33336b;
  font-weight: 600;
}

.resource-row :deep(.el-checkbox) {
  width: auto;
  flex: 1;
}

.resource-row.checked-row {
  justify-content: flex-start;

  > :deep(.el-checkbox) {
    flex: 0 0 auto;
    width: auto;
  }

  span {
    flex: 0 0 auto;
    margin-left: 0;
  }

  .el-icon {
    margin-left: auto;
  }
}

:deep(.el-checkbox__label) {
  color: #33336b;
  font-size: 14px;
  font-weight: 400;
  white-space: nowrap;
}
</style>
