<template>
  <div class="role-select-page">
    <el-dialog
      v-model="visible"
      title="请选择您的角色"
      width="520px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      align-center
      class="role-select-dialog"
    >
      <div class="role-options">
        <el-button
          v-for="role in roles"
          :key="role.value"
          class="role-option"
          @click="handleSelect(role.value)"
        >
          {{ role.label }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const visible = ref(true)

const roles = [
  { label: 'CXO', value: 'cxo' },
  { label: '一线销售', value: 'sales' },
  { label: '内部客户', value: 'internalCustomer' },
  { label: '服务PE', value: 'servicePe' }
]

function handleSelect(role) {
  // CXO 进入经营视角，其他角色进入销售视角。
  const targetPath = role === 'cxo' ? '/cxoHome' : '/saleHome'
  router.push(targetPath)
}
</script>

<style scoped lang="less">
.role-select-page {
  min-height: 100vh;
  background: #f5f7fb;
}

.role-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.role-option {
  width: 100%;
  height: 56px;
  margin-left: 0;
  font-size: 16px;
}

:deep(.role-select-dialog) {
  border-radius: 8px;
}

:deep(.el-dialog__body) {
  padding-top: 8px;
}
</style>
