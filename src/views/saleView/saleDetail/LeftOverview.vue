<template>
  <div class="left-overview">
    <button
      v-for="item in overviewList"
      :key="item.value"
      type="button"
      :class="['overview-button', { active: active === item.value }]"
      @click="changeActive(item.value)"
    >
      {{ item.label }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  active: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:active']);

const overviewList = [
  { label: 'OBS', value: 'OBS' },
  { label: 'ECS', value: 'ECS' },
  { label: 'XPU', value: 'XPU' },
  { label: 'network', value: 'network' }
];

function changeActive(value) {
  emit('update:active', value);
}
</script>

<style lang="less" scoped>
.left-overview {
  width: 220px;
  padding: 12px;
  box-sizing: border-box;
  border-radius: 8px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.overview-button {
  width: 100%;
  height: 44px;
  border: 1px solid #c8c8e8;
  border-radius: 6px;
  background: #f7f8fd;
  color: #353575;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
}

.overview-button:hover,
.overview-button.active {
  border-color: #7171a8;
  background: #eef2ff;
}
</style>
