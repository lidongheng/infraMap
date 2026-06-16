<template>
  <div class="common-page-padding">
    <CommonTitle :title="active === 'network' ? '网络资源' : active" iconName="menu" />

    <div class="sale-detail-layout">
      <div class="left-card">
        <LeftOverview v-model:active="active" />
      </div>

      <div class="right">
        <div class="overview-cards">
          <div
            v-for="item in overviewCardList"
            :key="item"
            class="overview-card"
          >
            <component
              :is="informationComponent"
              v-if="item === 1 && informationComponent"
            />
          </div>
        </div>

        <div class="table-card">
          <div class="tree-card">
            <el-tree :data="treeData" />
          </div>
          <div class="table-content">
            <el-table :data="tableData" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import CommonTitle from "@/components/home/CommonTitle.vue";
import LeftOverview from './LeftOverview.vue';
import ECSInformation from './ECSInformation.vue';
import OBSInformation from './OBSInformation.vue';
import XPUInformation from './XPUInformation.vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const active = ref('');
const overviewCardList = [1, 2, 3, 4];
const treeData = [];
const tableData = [];

const informationComponent = computed(() => {
  if (active.value === 'ECS') return ECSInformation;
  if (active.value === 'OBS') return OBSInformation;
  if (active.value === 'XPU') return XPUInformation;
  return null;
});

watch(
  () => route.query.type,
  (value) => {
    active.value = value || 'ECS';
  },
  { immediate: true }
);
</script>

<style lang="less" scoped>
.sale-detail-layout {
  height: calc(100vh - 140px);
  display: flex;
  gap: 16px;
  margin-top: 12px;
}

.left-card {
  width: 220px;
  flex-shrink: 0;
  border-radius: 8px;
  background: #fff;
}

.right {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: minmax(120px, 1fr) minmax(0, 3fr);
  gap: 16px;
}

.overview-cards {
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.overview-card,
.table-card,
.tree-card,
.table-content {
  border-radius: 8px;
  background: #fff;
}

.overview-card {
  min-width: 0;
  min-height: 120px;
  padding: 16px;
  box-sizing: border-box;
}

.table-card {
  min-height: 0;
  padding: 16px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 16px;
}

.tree-card {
  min-height: 0;
  padding: 12px;
  box-sizing: border-box;
  border: 1px solid #e8ecf1;
  overflow: auto;
}

.table-content {
  min-width: 0;
  min-height: 0;
  border: 1px solid #e8ecf1;
  overflow: auto;
}

:deep(.table-content .el-table) {
  height: 100%;
}
</style>
