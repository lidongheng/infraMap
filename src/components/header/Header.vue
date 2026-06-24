<template>
  <header class="global-header-content">
    <span>头部区域</span>
    <RoleMenu />
  </header>
</template>

<script setup>
import RoleMenu from "@/components/RoleMenu.vue";
</script>

<style lang="less" scoped>
.global-header-content {
  width: 100%;
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}
</style>
