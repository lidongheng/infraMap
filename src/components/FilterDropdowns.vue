<template>
  <div class="filter-bar">
    <div class="filter-item">
      <span class="filter-label">Region</span>
      <el-popover
        v-model:visible="regionVisible"
        placement="bottom-start"
        trigger="click"
        :width="240"
        :show-arrow="false"
        popper-class="filter-popper filter-popper--single"
      >
        <template #reference>
          <button class="select-trigger" type="button">
            <span>{{ getSummary(regionValue, regionOptions) }}</span>
            <el-icon><ArrowDown /></el-icon>
          </button>
        </template>
        <div class="dropdown-panel single">
          <div class="search-box">
            <el-icon><Search /></el-icon>
            <input v-model="regionKeyword" placeholder="请输入关键字" />
          </div>
          <label class="option-row checked-row">
            <el-checkbox
              :model-value="isAllSelected(regionValue, filteredRegionOptions)"
              :indeterminate="isIndeterminate(regionValue, filteredRegionOptions)"
              @change="checked => toggleAll('region', checked)"
            />
            <span>全部</span>
          </label>
          <el-checkbox-group v-model="regionValue" class="option-list">
            <el-checkbox
              v-for="item in filteredRegionOptions"
              :key="item.value"
              :label="item.value"
              class="option-row"
            >
              {{ item.label }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </el-popover>
    </div>

    <div class="filter-item">
      <span class="filter-label">AZ</span>
      <el-popover
        v-model:visible="azVisible"
        placement="bottom-start"
        trigger="click"
        :width="240"
        :show-arrow="false"
        popper-class="filter-popper filter-popper--single"
      >
        <template #reference>
          <button class="select-trigger" type="button">
            <span>{{ getSummary(azValue, azOptions) }}</span>
            <el-icon><ArrowDown /></el-icon>
          </button>
        </template>
        <div class="dropdown-panel single az-panel">
          <label class="option-row checked-row">
            <el-checkbox
              :model-value="isAllSelected(azValue, azOptions)"
              :indeterminate="isIndeterminate(azValue, azOptions)"
              @change="checked => toggleAll('az', checked)"
            />
            <span>全部</span>
          </label>
          <el-checkbox-group v-model="azValue" class="option-list">
            <el-checkbox
              v-for="item in azOptions"
              :key="item.value"
              :label="item.value"
              class="option-row"
            >
              {{ item.label }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </el-popover>
    </div>

    <div class="filter-item">
      <span class="filter-label">资源类型</span>
      <el-popover
        v-model:visible="resourceVisible"
        placement="bottom-start"
        trigger="click"
        :width="980"
        :show-arrow="false"
        popper-class="filter-popper"
      >
        <template #reference>
          <button class="select-trigger resource-trigger" type="button">
            <span>{{ resourceSummary }}</span>
            <el-icon><ArrowDown /></el-icon>
          </button>
        </template>
        <div class="dropdown-panel resource-panel">
          <div class="resource-columns">
            <div class="resource-column">
              <div class="column-title">资源系列</div>
              <div class="resource-scroll">
                <label class="resource-row checked-row">
                  <el-checkbox
                    :model-value="isAllSelected(resourceSeriesValue, resourceSeries)"
                    :indeterminate="isIndeterminate(resourceSeriesValue, resourceSeries)"
                    @change="checked => toggleAll('series', checked)"
                  />
                  <span>全部</span>
                  <el-icon><ArrowRight /></el-icon>
                </label>
                <el-checkbox-group v-model="resourceSeriesValue">
                  <label
                    v-for="item in resourceSeries"
                    :key="item.value"
                    :class="['resource-row', { active: activeSeries === item.value }]"
                    @mouseenter="activeSeries = item.value"
                  >
                    <el-checkbox :label="item.value">{{ item.label }}</el-checkbox>
                    <el-icon><ArrowRight /></el-icon>
                  </label>
                </el-checkbox-group>
              </div>
            </div>

            <div class="resource-column">
              <div class="column-title">资源族</div>
              <div class="resource-scroll">
                <label class="resource-row checked-row">
                  <el-checkbox
                    :model-value="isAllSelected(resourceFamiliesValue, visibleResourceFamilies)"
                    :indeterminate="isIndeterminate(resourceFamiliesValue, visibleResourceFamilies)"
                    @change="checked => toggleAll('family', checked)"
                  />
                  <span>全部</span>
                  <el-icon><ArrowRight /></el-icon>
                </label>
                <el-checkbox-group v-model="resourceFamiliesValue">
                  <label
                    v-for="item in visibleResourceFamilies"
                    :key="item.value"
                    :class="['resource-row', { active: activeFamily === item.value }]"
                    @mouseenter="activeFamily = item.value"
                  >
                    <el-checkbox :label="item.value">{{ item.label }}</el-checkbox>
                    <el-icon><ArrowRight /></el-icon>
                  </label>
                </el-checkbox-group>
              </div>
            </div>

            <div class="resource-column">
              <div class="column-title">资源代数</div>
              <div class="resource-scroll">
                <label class="resource-row checked-row">
                  <el-checkbox
                    :model-value="isAllSelected(resourceGenerationsValue, visibleResourceGenerations)"
                    :indeterminate="isIndeterminate(resourceGenerationsValue, visibleResourceGenerations)"
                    @change="checked => toggleAll('generation', checked)"
                  />
                  <span>全部</span>
                  <el-icon><ArrowRight /></el-icon>
                </label>
                <el-checkbox-group v-model="resourceGenerationsValue">
                  <label
                    v-for="item in visibleResourceGenerations"
                    :key="item.value"
                    :class="['resource-row', { active: activeGeneration === item.value }]"
                    @mouseenter="activeGeneration = item.value"
                  >
                    <el-checkbox :label="item.value">{{ item.label }}</el-checkbox>
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
                    :model-value="isAllSelected(resourceTypesValue, visibleResourceTypes)"
                    :indeterminate="isIndeterminate(resourceTypesValue, visibleResourceTypes)"
                    @change="checked => toggleAll('type', checked)"
                  />
                  <span>全部</span>
                </label>
                <el-checkbox-group v-model="resourceTypesValue">
                  <label
                    v-for="item in visibleResourceTypes"
                    :key="item.value"
                    class="resource-row"
                  >
                    <el-checkbox :label="item.value">{{ item.label }}</el-checkbox>
                  </label>
                </el-checkbox-group>
              </div>
            </div>
          </div>
          <div class="panel-actions">
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
      regions: [],
      azs: [],
      resourceTree: [],
    }),
  },
  modelValue: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'change']);

const regionVisible = ref(false);
const azVisible = ref(false);
const resourceVisible = ref(false);
const regionKeyword = ref('');

const regionOptions = computed(() => normalizeOptions(props.options?.regions));
const azOptions = computed(() => normalizeOptions(props.options?.azs));
const resourceTree = computed(() => normalizeResourceTree(props.options?.resourceTree));
const resourceSeries = computed(() => resourceTree.value.map(({ label, value }) => ({ label, value })));
const allResourceFamilies = computed(() => getUniqueOptions(resourceTree.value.flatMap(item => item.children ?? [])));
const allResourceGenerations = computed(() => getUniqueOptions(
  resourceTree.value.flatMap(item => item.children ?? []).flatMap(item => item.children ?? []),
));
const allResourceTypes = computed(() => getUniqueOptions(
  resourceTree.value
    .flatMap(item => item.children ?? [])
    .flatMap(item => item.children ?? [])
    .flatMap(item => item.children ?? []),
));

const regionValue = ref([]);
const azValue = ref([]);
const resourceSeriesValue = ref([]);
const resourceFamiliesValue = ref([]);
const resourceGenerationsValue = ref([]);
const resourceTypesValue = ref([]);
const resourceSnapshot = ref(getResourceValue());

const activeSeries = ref('');
const activeFamily = ref('');
const activeGeneration = ref('');
let syncingFromModel = false;
let syncingResourceCascade = false;

const filteredRegionOptions = computed(() => {
  const keyword = regionKeyword.value.trim().toLowerCase();
  if (!keyword) {
    return regionOptions.value;
  }
  return regionOptions.value.filter(item => item.label.toLowerCase().includes(keyword));
});

const visibleResourceFamilies = computed(() => {
  const seriesSet = new Set(resourceSeriesValue.value);
  const families = resourceTree.value
    .filter(item => seriesSet.has(item.value))
    .flatMap(item => item.children ?? []);
  return getUniqueOptions(families);
});

const visibleResourceGenerations = computed(() => {
  const seriesSet = new Set(resourceSeriesValue.value);
  const familySet = new Set(resourceFamiliesValue.value);
  const generations = resourceTree.value
    .filter(item => seriesSet.has(item.value))
    .flatMap(item => item.children ?? [])
    .filter(item => familySet.has(item.value))
    .flatMap(item => item.children ?? []);
  return getUniqueOptions(generations);
});

const visibleResourceTypes = computed(() => {
  const seriesSet = new Set(resourceSeriesValue.value);
  const familySet = new Set(resourceFamiliesValue.value);
  const generationSet = new Set(resourceGenerationsValue.value);
  const types = resourceTree.value
    .filter(item => seriesSet.has(item.value))
    .flatMap(item => item.children ?? [])
    .filter(item => familySet.has(item.value))
    .flatMap(item => item.children ?? [])
    .filter(item => generationSet.has(item.value))
    .flatMap(item => item.children ?? []);
  return getUniqueOptions(types);
});

const resourceSummary = computed(() => {
  const values = [
    ...resourceSeriesValue.value,
    ...resourceFamiliesValue.value,
    ...resourceGenerationsValue.value,
    ...resourceTypesValue.value,
  ];
  const total = resourceSeries.value.length + allResourceFamilies.value.length + allResourceGenerations.value.length + allResourceTypes.value.length;
  return values.length === total ? '全部' : `已选 ${values.length} 项`;
});

watch(resourceSeriesValue, () => {
  if (syncingFromModel) return;
  syncingResourceCascade = true;
  syncFamiliesByVisibleOptions();
  syncingResourceCascade = false;
  emitCurrentValue();
}, { flush: 'sync' });

watch(resourceFamiliesValue, () => {
  if (syncingFromModel) return;
  if (syncingResourceCascade) {
    syncByVisibleOptions();
    return;
  }
  syncingResourceCascade = true;
  syncByVisibleOptions();
  syncingResourceCascade = false;
  emitCurrentValue();
}, { flush: 'sync' });

watch(resourceGenerationsValue, () => {
  if (syncingFromModel) return;
  if (syncingResourceCascade) {
    syncTypesByVisibleOptions();
    return;
  }
  syncingResourceCascade = true;
  syncTypesByVisibleOptions();
  syncingResourceCascade = false;
  emitCurrentValue();
}, { flush: 'sync' });

watch(resourceTypesValue, () => {
  if (syncingFromModel || syncingResourceCascade) return;
  emitCurrentValue();
}, { deep: true, flush: 'sync' });

watch([regionValue, azValue], () => {
  emitCurrentValue();
}, { deep: true, flush: 'sync' });

watch(resourceVisible, (visible) => {
  if (visible) {
    resourceSnapshot.value = getResourceValue();
  }
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

function normalizeOptions(options) {
  return (options ?? []).map(item => {
    if (typeof item === 'string') {
      return { label: item, value: item };
    }
    return {
      label: item?.label ?? item?.value ?? '',
      value: item?.value ?? item?.label ?? '',
    };
  }).filter(item => item.value);
}

function normalizeResourceTree(tree) {
  return (tree ?? []).map(family => ({
    label: family?.label ?? family?.value ?? '',
    value: family?.value ?? family?.label ?? '',
    children: normalizeOptions(family?.children).map(resourceFamily => {
      const rawFamily = (family?.children ?? []).find(item => (item?.value ?? item?.label) === resourceFamily.value) ?? {};
      return {
        ...resourceFamily,
        children: normalizeOptions(rawFamily.children).map(generation => {
          const rawGeneration = (rawFamily.children ?? []).find(item => (item?.value ?? item?.label) === generation.value) ?? {};
          return {
            ...generation,
            children: normalizeOptions(rawGeneration.children),
          };
        }),
      };
    }),
  })).filter(item => item.value);
}

function allSelectedValue() {
  return {
    regions: regionOptions.value.map(item => item.value),
    azs: azOptions.value.map(item => item.value),
    resourceSeries: resourceSeries.value.map(item => item.value),
    resourceFamilies: allResourceFamilies.value.map(item => item.value),
    resourceGenerations: allResourceGenerations.value.map(item => item.value),
    resourceTypes: allResourceTypes.value.map(item => item.value),
  };
}

function applyModelValue(value) {
  syncingFromModel = true;
  const fallback = allSelectedValue();
  const next = value ?? fallback;
  regionValue.value = keepValid(next.regions, regionOptions.value, fallback.regions);
  azValue.value = keepValid(next.azs, azOptions.value, fallback.azs);
  resourceSeriesValue.value = keepValid(next.resourceSeries, resourceSeries.value, fallback.resourceSeries);
  resourceFamiliesValue.value = keepValid(next.resourceFamilies, allResourceFamilies.value, fallback.resourceFamilies);
  resourceGenerationsValue.value = keepValid(next.resourceGenerations, allResourceGenerations.value, fallback.resourceGenerations);
  resourceTypesValue.value = keepValid(next.resourceTypes, allResourceTypes.value, fallback.resourceTypes);
  resourceSnapshot.value = getResourceValue();
  activeSeries.value = resourceSeries.value[0]?.value ?? '';
  activeFamily.value = allResourceFamilies.value[0]?.value ?? '';
  activeGeneration.value = allResourceGenerations.value[0]?.value ?? '';
  syncingFromModel = false;
}

function keepValid(values, options, fallback) {
  if (!Array.isArray(values)) {
    return [...fallback];
  }
  const optionValues = new Set(options.map(item => item.value));
  return values.filter(item => optionValues.has(item));
}

function emitCurrentValue() {
  if (syncingFromModel) return;
  const value = {
    regions: [...regionValue.value],
    azs: [...azValue.value],
    resourceSeries: [...resourceSeriesValue.value],
    resourceFamilies: [...resourceFamiliesValue.value],
    resourceGenerations: [...resourceGenerationsValue.value],
    resourceTypes: [...resourceTypesValue.value],
  };
  emit('update:modelValue', value);
  emit('change', value);
}

function getUniqueOptions(options) {
  const map = new Map();
  (options ?? []).forEach(item => {
    if (!map.has(item.value)) {
      map.set(item.value, {
        label: item.label,
        value: item.value,
      });
    }
  });
  return Array.from(map.values());
}

function syncFamiliesByVisibleOptions() {
  const familyValues = visibleResourceFamilies.value.map(item => item.value);
  resourceFamiliesValue.value = resourceFamiliesValue.value.filter(item => familyValues.includes(item));
  syncByVisibleOptions();
}

function syncByVisibleOptions() {
  const generationValues = visibleResourceGenerations.value.map(item => item.value);
  resourceGenerationsValue.value = resourceGenerationsValue.value.filter(item => generationValues.includes(item));
  syncTypesByVisibleOptions();
}

function syncTypesByVisibleOptions() {
  const typeValues = visibleResourceTypes.value.map(item => item.value);
  resourceTypesValue.value = resourceTypesValue.value.filter(item => typeValues.includes(item));
}

function getResourceValue() {
  return {
    series: [...resourceSeriesValue.value],
    families: [...resourceFamiliesValue.value],
    generations: [...resourceGenerationsValue.value],
    types: [...resourceTypesValue.value],
  };
}

function setResourceValue(value) {
  resourceSeriesValue.value = [...(value.series ?? [])];
  resourceFamiliesValue.value = [...value.families];
  resourceGenerationsValue.value = [...value.generations];
  resourceTypesValue.value = [...value.types];
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
  if (type === 'series') {
    resourceSeriesValue.value = values;
  }
  if (type === 'family') {
    resourceFamiliesValue.value = values;
  }
  if (type === 'generation') {
    resourceGenerationsValue.value = values;
  }
  if (type === 'type') {
    resourceTypesValue.value = values;
  }
}

function getOptionsByType(type) {
  const map = {
    region: filteredRegionOptions.value,
    az: azOptions.value,
    series: resourceSeries.value,
    family: visibleResourceFamilies.value,
    generation: visibleResourceGenerations.value,
    type: visibleResourceTypes.value,
  };
  return map[type] ?? [];
}

function cancelResource() {
  syncingFromModel = true;
  setResourceValue(resourceSnapshot.value);
  syncingFromModel = false;
  resourceVisible.value = false;
  emitCurrentValue();
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
  gap: 12px 18px;
  padding: 16px 18px;
  background: #fff;
  border: 1px solid #e5e8ef;
  border-radius: 4px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.filter-label {
  flex: 0 0 auto;
  font-size: 14px;
  font-weight: 600;
  color: #252b3a;
}

.select-trigger {
  width: 150px;
  height: 32px;
  padding: 0 10px 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #dfe1e6;
  border-radius: 4px;
  background: #fff;
  color: #252b3a;
  font-size: 14px;
  text-align: left;
  cursor: pointer;

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.resource-trigger {
  width: 170px;
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
    color: #252b3a;
    font-size: 14px;
  }
}

.option-list {
  max-height: 250px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.option-row,
.resource-row {
  min-height: 32px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  box-sizing: border-box;
  color: #252b3a;
  font-size: 14px;
}

.option-row {
  padding: 0 10px;
}

.checked-row {
  background: #f2f5fc;
}

.option-row:has(.el-checkbox.is-checked),
.resource-row:has(.el-checkbox.is-checked) {
  background: #f2f5fc;
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
    color: #409eff;
  }
}

.resource-panel {
  width: 940px;
}

.resource-columns {
  display: grid;
  grid-template-columns: repeat(4, minmax(190px, 1fr));
  gap: 12px;
  padding: 10px 14px 8px;
}

.resource-column {
  min-width: 0;
}

.column-title {
  height: 26px;
  line-height: 26px;
  margin-bottom: 6px;
  border-bottom: 1px solid #dfe1e6;
  font-size: 14px;
  font-weight: 600;
}

.resource-scroll {
  height: 174px;
  overflow-y: auto;
  padding-right: 4px;
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
  gap: 10px;
  padding: 8px 14px;
  border-top: 1px solid #edf0f5;
}

.plain-btn,
.primary-btn {
  min-width: 70px;
  height: 32px;
  padding: 0 16px;
  border-radius: 3px;
  font-size: 14px;
  cursor: pointer;
}

.plain-btn {
  border: 1px solid #adb0b8;
  background: #fff;
  color: #252b3a;
}

.primary-btn {
  border: 1px solid #5e7ce0;
  background: #5e7ce0;
  color: #fff;
}

:deep(.el-checkbox) {
  width: 100%;
  height: 32px;
  margin-right: 0;
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
  color: #252b3a;
  font-size: 14px;
  white-space: nowrap;
}
</style>
