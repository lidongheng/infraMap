<template>
  <div class="filter-bar">
    <div class="filter-item">
      <span class="filter-label">Region</span>
      <el-popover
        v-model:visible="regionVisible"
        placement="bottom-start"
        trigger="click"
        width="fit-content"
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
          <div class="option-list">
            <label class="option-row checked-row">
              <el-checkbox
                :model-value="isAllSelected(regionValue, filteredRegionOptions)"
                :indeterminate="isIndeterminate(regionValue, filteredRegionOptions)"
                @change="checked => toggleAll('region', checked)"
              />
              <span>全部</span>
            </label>
            <el-checkbox-group v-model="regionValue" class="option-group">
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
        </div>
      </el-popover>
    </div>

    <div class="filter-item">
      <span class="filter-label">AZ</span>
      <el-popover
        v-model:visible="azVisible"
        placement="bottom-start"
        trigger="click"
        width="fit-content"
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
          <div class="option-list">
            <label class="option-row checked-row">
              <el-checkbox
                :model-value="isAllSelected(azValue, azOptions)"
                :indeterminate="isIndeterminate(azValue, azOptions)"
                @change="checked => toggleAll('az', checked)"
              />
              <span>全部</span>
            </label>
            <el-checkbox-group v-model="azValue" class="option-group">
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
        </div>
      </el-popover>
    </div>

    <div class="filter-item">
      <span class="filter-label">资源类型</span>
      <el-popover
        v-model:visible="resourceVisible"
        placement="bottom-start"
        trigger="click"
        width="fit-content"
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
                    @change="checked => toggleAll('resourceSeries', checked)"
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

const regionOptions = computed(() => sortOptionsByInitial(normalizeOptions(props.options?.regions)));
const azOptions = computed(() => sortOptionsByInitial(normalizeOptions(props.options?.azs)));
const resourceTree = computed(() => normalizeResourceTree(props.options?.resourceTree));
const resourceSeries = computed(() => resourceTree.value.map(toOptionMeta));
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
const resourceFamilyValue = ref([]);
const resourceVerValue = ref([]);
const resourceTypeValue = ref([]);
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
  const familySet = new Set(resourceFamilyValue.value);
  const generations = resourceTree.value
    .filter(item => seriesSet.has(item.value))
    .flatMap(item => item.children ?? [])
    .filter(item => familySet.has(item.value))
    .flatMap(item => item.children ?? []);
  return getUniqueOptions(generations);
});

const visibleResourceTypes = computed(() => {
  const seriesSet = new Set(resourceSeriesValue.value);
  const familySet = new Set(resourceFamilyValue.value);
  const generationSet = new Set(resourceVerValue.value);
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
  return `已选 ${resourceTypeValue.value.length} 项`;
});

watch(resourceSeriesValue, () => {
  if (syncingFromModel) return;
  syncingResourceCascade = true;
  syncFamiliesByVisibleOptions();
  syncingResourceCascade = false;
  emitCurrentValue();
}, { flush: 'sync' });

watch(resourceFamilyValue, () => {
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

watch(resourceVerValue, () => {
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

watch(resourceTypeValue, () => {
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
    resourceSeries: resourceSeries.value.map(item => item.value),
    resourceFamily: allResourceFamilies.value.map(item => item.value),
    resourceVer: allResourceGenerations.value.map(item => item.value),
    resourceType: allResourceTypes.value.map(item => item.value),
  };
}

function applyModelValue(value) {
  syncingFromModel = true;
  const fallback = allSelectedValue();
  const next = value ?? fallback;
  regionValue.value = keepValid(next.regionNameList, regionOptions.value, fallback.regionNameList);
  azValue.value = keepValid(next.azNameList, azOptions.value, fallback.azNameList);
  resourceSeriesValue.value = keepValid(next.resourceSeries, resourceSeries.value, fallback.resourceSeries);
  resourceFamilyValue.value = keepValid(next.resourceFamily, allResourceFamilies.value, fallback.resourceFamily);
  resourceVerValue.value = keepValid(next.resourceVer, allResourceGenerations.value, fallback.resourceVer);
  resourceTypeValue.value = keepValid(next.resourceType, allResourceTypes.value, fallback.resourceType);
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
    regionNameList: [...regionValue.value],
    azNameList: [...azValue.value],
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

function syncFamiliesByVisibleOptions() {
  const familyValues = visibleResourceFamilies.value.map(item => item.value);
  resourceFamilyValue.value = resourceFamilyValue.value.filter(item => familyValues.includes(item));
  syncByVisibleOptions();
}

function syncByVisibleOptions() {
  const generationValues = visibleResourceGenerations.value.map(item => item.value);
  resourceVerValue.value = resourceVerValue.value.filter(item => generationValues.includes(item));
  syncTypesByVisibleOptions();
}

function syncTypesByVisibleOptions() {
  const typeValues = visibleResourceTypes.value.map(item => item.value);
  resourceTypeValue.value = resourceTypeValue.value.filter(item => typeValues.includes(item));
}

function getResourceValue() {
  return {
    resourceSeries: [...resourceSeriesValue.value],
    resourceFamily: [...resourceFamilyValue.value],
    resourceVer: [...resourceVerValue.value],
    resourceType: [...resourceTypeValue.value],
  };
}

function setResourceValue(value) {
  resourceSeriesValue.value = [...(value.resourceSeries ?? [])];
  resourceFamilyValue.value = [...(value.resourceFamily ?? [])];
  resourceVerValue.value = [...(value.resourceVer ?? [])];
  resourceTypeValue.value = [...(value.resourceType ?? [])];
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
    az: azOptions.value,
    resourceSeries: resourceSeries.value,
    resourceFamily: visibleResourceFamilies.value,
    resourceVer: visibleResourceGenerations.value,
    resourceType: visibleResourceTypes.value,
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
  font-weight: 400;
  color: #6262a8;
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
    color: #33336b;
    font-size: 14px;

    &::placeholder {
      color: #adb0b8;
    }
  }
}

.option-list {
  max-height: 250px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.option-group {
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
  color: #33336b;
  font-size: 14px;
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
