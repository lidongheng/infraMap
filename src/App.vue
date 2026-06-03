<template>
  <el-config-provider :locale="zhCn">
    <div v-if="showGeneralComputeFilter" class="global-filter">
      <FilterDropdowns
        v-model="filterValue"
        :options="filterOptions"
        :filter-config="filterConfig"
        :loading="directoryTreeLoading"
        @change="onFilterChange"
      />
    </div>
    <router-view />
  </el-config-provider>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import FilterDropdowns from '@/components/FilterDropdowns.vue';
import { directoryTreeLoading } from './views/useDirectoryTree';
import {
  filterConfig,
  filterOptions,
  filterValue,
  onFilterChange,
} from './views/useGeneralComputeFilter';

const route = useRoute();

const showGeneralComputeFilter = computed(() => route.name === 'generalCompute');
</script>

<style lang="less" scoped>
@import './styles/themes.less';

.global-filter {
  position: fixed;
  top: 16px;
  right: 20px;
  z-index: 1000;
}
</style>
