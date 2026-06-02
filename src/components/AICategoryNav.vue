<template>
  <div class="category-nav">
    <div
      v-for="item in categories"
      :key="item.key"
      class="category-btn"
      :class="{ active: selectedResourceType === item.key, disabled: item.disabled }"
      @click="!item.disabled && (selectedResourceType = item.key)"
    >
      {{ item.key }}
    </div>
  </div>
</template>

<script setup>
import { selectedResourceType } from "@/views/useAIComputer";

const categories = [
  { key: "A3", disabled: false },
  { key: "A2", disabled: true },
  { key: "A1", disabled: true },
];
</script>

<style lang="less" scoped>
.category-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  height: 100%;
}

.category-btn {
  padding: 6px 0;
  font-size: 12px;
  font-weight: 600;
  color: #353575;
  cursor: pointer;
  text-align: center;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover:not(.disabled) {
    background: rgba(53, 53, 117, 0.08);
  }

  &.active {
    color: #fff;
    background: #353575;
  }

  &.disabled {
    color: #bbb;
    cursor: not-allowed;
  }
}
</style>
