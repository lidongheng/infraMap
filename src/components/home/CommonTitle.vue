<template>
  <div class="common-title">
    <div class="title-copy">
      <span class="title">{{ title }}</span>
      <span class="sub-title">{{ subTitle }}</span>
    </div>
    <div class="title-actions">
      <el-date-picker
        v-model="selectedDate"
        type="date"
        placeholder="选择日期"
        format="YYYY年MM月DD日"
        value-format="YYYY-MM-DD"
        :clearable="false"
        size="small"
      />
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useCurrentDate } from "@/views/useCurrentDate";

defineProps({
  title: { type: String, required: true },
  subTitle: { type: String, required: true },
});

const { date: selectedDate } = storeToRefs(useCurrentDate());
</script>

<style lang="less" scoped>
.common-title {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.title-copy {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: #353575;
  line-height: 32px;
}

.sub-title {
  font-size: 16px;
  color: #7171a8;
  line-height: 24px;
}

.title-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
</style>
