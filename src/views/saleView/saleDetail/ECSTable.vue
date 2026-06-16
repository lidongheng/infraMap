<template>
  <div class="detail-table-layout">
    <div class="tree-card">
      <el-tree :data="treeData" />
    </div>
    <div class="table-card">
      <el-table :data="tableData" />
    </div>
  </div>
</template>

<script setup>
const treeData = [];
const tableData = [];

</script>

<style scoped lang="less">
.detail-table-layout {
  min-height: 0;
  padding: 16px;
  box-sizing: border-box;
  border-radius: 8px;
  background: #fff;
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 16px;
}

.tree-card,
.table-card {
  min-height: 0;
  border: 1px solid #e8ecf1;
  border-radius: 8px;
  background: #fff;
  overflow: auto;
}

.tree-card {
  padding: 12px;
  box-sizing: border-box;
}

</style>
