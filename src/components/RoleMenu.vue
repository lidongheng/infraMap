<template>
  <div ref="roleMenuRef" class="role-card-entry">
    <button
      v-if="selectedRole"
      class="role-avatar-button"
      type="button"
      aria-label="切换角色"
      @click.stop="toggleRoleCard"
    >
      <span class="role-avatar-face">{{ selectedRole.avatar }}</span>
      <span class="role-avatar-name">{{ selectedRole.label }}</span>
    </button>
    <div v-if="showRoleCard" class="role-card-popover" @click.stop>
      <Card1 compact @role-change="handleRoleChange" />
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import Card1 from "@/views/card1.vue";
import {
  getRoleTargetPath,
  getSelectedRoleValue,
  roles,
  saveSelectedRole,
} from "@/config/role";

const router = useRouter();
const showRoleCard = ref(false);
const roleMenuRef = ref(null);
const selectedRoleValue = ref(getSelectedRoleValue());

const selectedRole = computed(() => {
  return roles.find((role) => role.value === selectedRoleValue.value);
});

const toggleRoleCard = () => {
  showRoleCard.value = !showRoleCard.value;
};

const closeRoleCard = (event) => {
  // 下拉卡片打开后，点击组件外部需要收起，避免遮挡页面主内容。
  if (!showRoleCard.value) {
    return;
  }

  if (roleMenuRef.value?.contains(event.target)) {
    return;
  }

  showRoleCard.value = false;
};

const handleRoleChange = (roleValue) => {
  saveSelectedRole(roleValue);
  selectedRoleValue.value = roleValue;
  showRoleCard.value = false;
  router.push(getRoleTargetPath(roleValue));
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
  height: 36px;
  border: 0;
  padding: 4px 10px 4px 4px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  background: linear-gradient(135deg, #8ea8ff, #5e73dc);
  box-shadow: 0 8px 20px rgba(61, 80, 160, 0.24);
  color: #ffffff;
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
  font-size: 14px;
  line-height: 1;
  font-weight: 800;
}

.role-avatar-name {
  max-width: 72px;
  overflow: hidden;
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.role-card-popover {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 200;
}
</style>
