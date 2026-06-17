<template>
  <div class="container">
    <div class="filter-card">
      <div class="section-title">关键信息</div>
      <FilterDropdowns
        v-model="filterValue"
        :options="filterOptions"
        :filter-config="filterConfig"
      />
    </div>
    <div class="overview-cards">
      <div
        class="overview-card"
        v-for="item in infors"
        :key="item.title"
      >
        <div class="card-title">关键信息</div>
        <div class="info">
          <div class="info-row">
            <span class="label">Title</span>
            <span class="value">{{ item.title }}</span>
          </div>
          <div class="info-row">
            <span class="label">Title</span>
            <span class="value">{{ item.value }}</span>
          </div>
          <div class="info-row">
            <span class="label">Title</span>
            <span class="value">{{ item.newValue }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import FilterDropdowns from '@/components/FilterDropdowns.vue';

/**
 * ECS 关键信息筛选配置说明：
 * - filterValue：FilterDropdowns 的 v-model，保存当前选择结果。
 * - filterConfig：筛选框配置数组；数组里每一项对应页面顶部的一个筛选框。
 * - key：筛选项唯一标识，只用于组件内部区分不同筛选框。
 * - label：筛选框左侧展示名称，例如“资源规格”“Region”“资源代数”。
 * - type：筛选框形态；list 表示单列列表，cascade 表示左右两列级联。
 * - optionKey：当前筛选项读取 filterOptions 中哪个字段作为选项数据。
 * - valueKey：当前筛选项选中结果回写到 filterValue 时使用的字段名。
 * - parentValueKey：仅 type 为 cascade 时使用，表示左侧父级列选中结果回写字段名。
 * - searchable：仅 type 为 cascade 时使用，控制右侧子级列是否展示搜索框。
 * - columns：仅 type 为 cascade 时使用，配置左右两列的标题。
 * - filterOptions：筛选项选项数据；key 必须和 filterConfig.optionKey 保持一致。
 * - resourceSpecList：资源规格筛选的数据源，因为资源规格是 type=list，所以这里是一维数组。
 * - regionAreaTree：Region 筛选的数据源，因为 Region 是 type=cascade，所以这里是两层树。
 * - resourceGenerationTree：资源代数筛选的数据源，也是 type=cascade 的两层树。
 * - label：选项在下拉面板中展示的文案。
 * - value：选项选中后写入 filterValue 的值。
 * - children：仅 cascade 使用，表示右侧子级列的数据。
 * - list 型筛选只回写 valueKey；cascade 型筛选会同时回写 parentValueKey 和 valueKey。
 */
const filterValue = ref(null);
const filterConfig = [
  {
    key: 'resourceSpec',
    label: '资源规格',
    type: 'list',
    optionKey: 'resourceSpecList',
    valueKey: 'resourceType',
  },
  {
    key: 'region',
    label: 'Region',
    type: 'cascade',
    optionKey: 'regionAreaTree',
    parentValueKey: 'regionAreaList',
    valueKey: 'regionNameList',
    searchable: true,
    columns: [
      { title: '大区' },
      { title: 'Region' },
    ],
  },
  {
    key: 'resourceGeneration',
    label: '资源代数',
    type: 'cascade',
    optionKey: 'resourceGenerationTree',
    parentValueKey: 'resourceFamily',
    valueKey: 'resourceVer',
    searchable: false,
    columns: [
      { title: '资源族' },
      { title: '资源代数' },
    ],
  },
];
const filterOptions = {
  // resourceSpecList 被“资源规格”筛选的 optionKey 引用；选中后写入 filterValue.resourceType。
  resourceSpecList: [
    { label: 'c6.large', value: 'c6.large' },
    { label: 'c6.xlarge', value: 'c6.xlarge' },
    { label: 'm6.large', value: 'm6.large' },
  ],
  // regionAreaTree 被“Region”筛选的 optionKey 引用；左列大区写入 regionAreaList，右列 Region 写入 regionNameList。
  regionAreaTree: [
    {
      label: '非洲',
      value: 'africa',
      children: [
        { label: '非洲-开罗', value: '非洲-开罗' },
        { label: '非洲-约翰内斯堡', value: '非洲-约翰内斯堡' },
      ],
    },
    {
      label: '拉美',
      value: 'latam',
      children: [
        { label: '拉美-圣保罗一', value: '拉美-圣保罗一' },
        { label: '拉美-圣地亚哥', value: '拉美-圣地亚哥' },
      ],
    },
  ],
  // resourceGenerationTree 被“资源代数”筛选的 optionKey 引用；左列资源族写入 resourceFamily，右列资源代数写入 resourceVer。
  resourceGenerationTree: [
    {
      label: 'c',
      value: 'c',
      children: [
        { label: 'c6', value: 'c6' },
        { label: 'c7', value: 'c7' },
      ],
    },
    {
      label: 'm',
      value: 'm',
      children: [
        { label: 'm6', value: 'm6' },
        { label: 'm7', value: 'm7' },
      ],
    },
  ],
};

const inforData = ref({});
const infors = computed(() => {
  return [
    {
      title: 1,
      value: 2,
      newValue: 3,
    },
    {
      title: 4,
      value: 5,
      newValue: 6,
    },
    {
      title: 7,
      value: 8,
      newValue: 9,
    },
  ]
});
</script>

<style scoped lang="less">
.container {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 12px;
}

.filter-card {
  min-width: 0;
  padding: 12px 16px;
  box-sizing: border-box;
  border-radius: 8px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.section-title {
  flex-shrink: 0;
  color: #0f172a;
  font-size: 15px;
  font-weight: 700;
  line-height: 22px;
}

.overview-cards {
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.overview-card {
  min-width: 0;
  min-height: 120px;
  padding: 16px;
  box-sizing: border-box;
  border-radius: 8px;
  background: #fff;
}

.card-title {
  color: #0f172a;
  font-size: 15px;
  font-weight: 700;
  line-height: 22px;
  margin-bottom: 12px;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #475569;
  font-size: 14px;
  line-height: 20px;
}

.label {
  color: #64748b;
}

.value {
  color: #1e293b;
  font-weight: 700;
}
</style>
