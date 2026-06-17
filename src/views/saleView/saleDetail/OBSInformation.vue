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

const filterValue = ref(null);
const filterConfig = {
  filters: [
    {
      key: 'region',
      label: 'Region',
      type: 'cascade',
      optionKey: 'regionAreaTree',
      parentValueKey: 'regionAreaList',
      valueKey: 'regionNameList',
      searchable: true,
      confirmable: true,
      columns: [
        { title: '大区' },
        { title: 'Region' },
      ],
    },
  ],
};
const filterOptions = {
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
