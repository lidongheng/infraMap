<template>
  <main v-if="showRoleSelector" class="role-select-page">
    <RolePermissionCard @start="handleStart" />
  </main>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { getPermissionConfig } from "@/api/role";
import RolePermissionCard from "@/components/RolePermissionCard.vue";
import {
  getRoleTargetPath,
  initializePermissionConfig,
  saveSelectedRole,
} from "@/config/role";

const router = useRouter();
const showRoleSelector = ref(false);

const handleStart = (roleValue) => {
  saveSelectedRole(roleValue);
  router.push(getRoleTargetPath(roleValue));
};

onMounted(async () => {
  const permissionResponse = await getPermissionConfig();
  initializePermissionConfig(permissionResponse.data);
  showRoleSelector.value = true;
});
</script>

<style scoped lang="less">
.role-select-page {
  min-height: 100vh;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  background: #eef0f8;
}

@media (max-width: 720px) {
  .role-select-page {
    padding: 16px;
    align-items: flex-start;
  }
}
</style>
