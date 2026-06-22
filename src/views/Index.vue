<template>
  <!-- 首页 -->
  <HomeLayout class="cost-operation">
    <template #overview>
      <CommonTitle title="运营概览" sub-title="(GYY)">
        <template #actions>
          <div ref="roleMenuRef" class="role-card-entry">
            <button
              class="role-avatar-button"
              type="button"
              aria-label="切换角色"
              @click.stop="toggleRoleCard"
            >
              <span class="role-avatar-face">1</span>
            </button>
            <div v-if="showRoleCard" class="role-card-popover" @click.stop>
              <Card1 compact />
            </div>
          </div>
        </template>
      </CommonTitle>
    </template>
    <template #top>
      <TopIndicators></TopIndicators>
    </template>
    <template #left>
      <CommonService />
    </template>
    <template #center>
      <Map />
    </template>
    <template #right>
      <Customer />
    </template>
  </HomeLayout>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import HomeLayout from "@/components/home/HomeLayout.vue";
import CommonTitle from "@/components/home/CommonTitle.vue";
import TopIndicators from "@/components/home/TopIndicators.vue";
import CommonService from "@/components/home/CommonService.vue";
import Map from "@/components/home/Map.vue";
import Customer from "@/components/home/Customer.vue";
import Card1 from "@/views/card1.vue";

const showRoleCard = ref(false);
const roleMenuRef = ref(null);

const toggleRoleCard = () => {
  showRoleCard.value = !showRoleCard.value;
};

const closeRoleCard = (event) => {
  // 下拉卡片打开后，点击组件外部需要收起，避免遮挡运营页主内容。
  if (!showRoleCard.value) {
    return;
  }

  if (roleMenuRef.value?.contains(event.target)) {
    return;
  }

  showRoleCard.value = false;
};

onMounted(() => {
  document.addEventListener("click", closeRoleCard);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", closeRoleCard);
});
</script>

<style scoped lang="less">
.role-card-entry {
  position: relative;
  flex-shrink: 0;
}

.role-avatar-button {
  width: 36px;
  height: 36px;
  border: 0;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #8ea8ff, #5e73dc);
  box-shadow: 0 8px 20px rgba(61, 80, 160, 0.24);
  cursor: pointer;
}

.role-avatar-face {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  color: #ffffff;
  font-size: 14px;
  line-height: 1;
  font-weight: 800;
}

.role-card-popover {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 200;
}
</style>
