<template>
  <div class="overview-cards">
    <div class="overview-card">OBSInformation</div>
    <div class="overview-card"></div>
    <div class="overview-card"></div>
    <div class="overview-card"></div>
  </div>
</template>

<script setup>

</script>

<style scoped lang="less">
.overview-cards {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
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

</style>
