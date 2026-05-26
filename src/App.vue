<template>
  <div class="app-shell">
    <div class="global-date-filter">
      <el-date-picker
        v-model="selectedMonth"
        type="month"
        placeholder="选择月份"
        format="YYYY年MM月"
        value-format="YYYY-MM"
        :clearable="false"
        size="small"
      />
    </div>
    <router-view />
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useCurrentDate } from './views/useCurrentDate';

const currentDateStore = useCurrentDate();
const { date: selectedMonth } = storeToRefs(currentDateStore);
</script>

<style lang="less" scoped>
@import './styles/themes.less';

.app-shell {
  position: relative;
  min-height: 100vh;
}

.global-date-filter {
  position: fixed;
  top: 16px;
  right: 20px;
  z-index: 1000;
}
</style>
