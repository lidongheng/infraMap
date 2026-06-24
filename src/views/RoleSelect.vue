<template>
  <div v-if="showRoleSelector" class="role-select-page">
    <div class="role-select-modal">
      <section class="intro-panel">
        <div class="dashboard-visual">
          <div class="ribbon ribbon-blue ribbon-1"></div>
          <div class="ribbon ribbon-red ribbon-2"></div>
          <div class="ribbon ribbon-orange ribbon-3"></div>
          <div class="ribbon ribbon-blue ribbon-4"></div>
          <div class="spark spark-1"></div>
          <div class="spark spark-2"></div>

          <div class="dashboard-board">
            <div class="board-header">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="metric-row">
              <div
                v-for="item in metrics"
                :key="item"
                class="metric-card"
              >
                <div class="metric-value">{{ item }}</div>
                <div class="metric-line"></div>
              </div>
            </div>
            <div class="dashboard-grid">
              <div class="panel-card wide">
                <div class="panel-title"></div>
                <div class="map-dots">
                  <span
                    v-for="dot in mapDots"
                    :key="dot.className"
                    :class="dot.className"
                  ></span>
                </div>
              </div>
              <div class="panel-card">
                <div class="panel-title"></div>
                <div class="bar-list">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div class="panel-card">
                <div class="panel-title"></div>
                <div class="mini-cards">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="product-copy">
          <h1>五大联赛资料</h1>
          <ul>
            <li>覆盖英超、西甲、意甲、德甲、法甲核心资料</li>
            <li>球队、赛程、积分、球员数据集中查看</li>
            <li>关键赛事动态汇聚，热门对决快速定位</li>
            <li>历史表现与实时数据结合，辅助赛前分析</li>
          </ul>
        </div>
      </section>

      <section class="role-panel">
        <h2>请选择你的角色</h2>
        <div class="role-grid">
          <button
            v-for="role in roles"
            :key="role.value"
            :class="['role-card', { active: selectedRole === role.value }]"
            type="button"
            @click="selectedRole = role.value"
          >
            <span class="avatar-wrap">
              <img class="avatar-image" :src="role.avatar" :alt="role.label">
              <span v-if="selectedRole === role.value" class="check-mark">✓</span>
            </span>
            <span class="role-name">{{ role.label }}</span>
          </button>
        </div>

        <button class="start-button" type="button" @click="handleStart">
          立即体验
        </button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getUserRoleRules } from '@/api/role'
import {
  getRoleTargetPath,
  initializeRolePermissions,
  ROLE_CODE_ORDER,
  rolePermissionList,
  roles,
  saveSelectedRole
} from '@/config/role'

const router = useRouter()
const selectedRole = ref()
const showRoleSelector = ref(false)

const metrics = ['273.59', '798.41', '379.15', '103.8']
const mapDots = [
  { className: 'dot dot-1' },
  { className: 'dot dot-2' },
  { className: 'dot dot-3' },
  { className: 'dot dot-4' },
  { className: 'dot dot-5' }
]

function handleStart() {
  saveSelectedRole(selectedRole.value)
  router.push(getRoleTargetPath(selectedRole.value))
}

onMounted(async () => {
  const response = await getUserRoleRules()

  if (response.status !== 200) {
    throw new Error(response.massage)
  }

  initializeRolePermissions(response.data)

  if (rolePermissionList.length === 0) {
    selectedRole.value = roles[0].value
    showRoleSelector.value = true
    return
  }

  // 按产品定义的角色优先级确定默认进入角色，不依赖接口返回顺序。
  const sortedRuleCodeList = [...rolePermissionList].sort((currentRole, nextRole) => {
    return ROLE_CODE_ORDER.indexOf(currentRole.code) - ROLE_CODE_ORDER.indexOf(nextRole.code)
  })
  const roleCode = sortedRuleCodeList[0].code

  saveSelectedRole(roleCode)
  router.replace(getRoleTargetPath(roleCode))
})
</script>

<style scoped lang="less">
.role-select-page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 16% 18%, rgba(89, 125, 255, 0.14), transparent 32%),
    radial-gradient(circle at 86% 12%, rgba(151, 124, 255, 0.12), transparent 34%),
    #eef1fa;
  color: #24204f;
}

.role-select-modal {
  width: min(920px, 100%);
  height: min(520px, calc(100vh - 68px));
  min-height: 480px;
  display: grid;
  grid-template-columns: minmax(480px, 1.08fr) minmax(420px, 0.92fr);
  overflow: hidden;
  border-radius: 20px;
  background: #fbf9ff;
  box-shadow: 0 28px 80px rgba(55, 48, 120, 0.22);
}

.intro-panel {
  position: relative;
  min-width: 0;
  padding: 34px 42px 36px;
  box-sizing: border-box;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.96), rgba(248, 246, 255, 0.92)),
    radial-gradient(circle at 26% 22%, rgba(82, 126, 255, 0.12), transparent 34%),
    #fbfaff;
}

.intro-panel::after {
  content: "";
  position: absolute;
  top: 5%;
  right: 0;
  width: 1px;
  height: 90%;
  background: linear-gradient(180deg, transparent, rgba(88, 78, 165, 0.16), transparent);
}

.dashboard-visual {
  position: relative;
  height: 230px;
  max-width: 720px;
  margin: 0 auto;
}

.dashboard-board {
  position: absolute;
  left: 9%;
  right: 5%;
  top: 34px;
  height: 176px;
  padding: 12px;
  box-sizing: border-box;
  border: 1px solid rgba(105, 128, 206, 0.18);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 24px 60px rgba(78, 84, 142, 0.18);
  transform: perspective(900px) rotateY(-9deg) rotateX(2deg);
}

.board-header {
  display: flex;
  gap: 6px;
  margin-bottom: 9px;
}

.board-header span {
  width: 34px;
  height: 5px;
  border-radius: 6px;
  background: #cbd6fb;
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 7px;
  margin-bottom: 8px;
}

.metric-card {
  height: 38px;
  padding: 7px;
  box-sizing: border-box;
  border-radius: 6px;
  background: #f8fbff;
  border: 1px solid rgba(111, 135, 216, 0.14);
}

.metric-value {
  color: #4d63c8;
  font-size: 12px;
  font-weight: 700;
  line-height: 15px;
}

.metric-line {
  width: 72%;
  height: 4px;
  margin-top: 5px;
  border-radius: 5px;
  background: linear-gradient(90deg, #92b6ff, rgba(146, 182, 255, 0.12));
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  grid-template-rows: repeat(2, 45px);
  gap: 8px;
}

.panel-card {
  min-width: 0;
  border-radius: 6px;
  background: #ffffff;
  border: 1px solid rgba(111, 135, 216, 0.13);
  padding: 7px;
  box-sizing: border-box;
}

.panel-card.wide {
  grid-row: span 2;
}

.panel-title {
  width: 46px;
  height: 5px;
  border-radius: 6px;
  background: #d6def8;
  margin-bottom: 7px;
}

.map-dots {
  position: relative;
  height: 66px;
  border-radius: 6px;
  background:
    linear-gradient(135deg, rgba(90, 151, 255, 0.1), rgba(90, 151, 255, 0.02)),
    repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(122, 145, 213, 0.08) 25px),
    repeating-linear-gradient(90deg, transparent, transparent 24px, rgba(122, 145, 213, 0.08) 25px);
}

.dot {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #387bff;
  box-shadow: 0 0 0 5px rgba(56, 123, 255, 0.12);
}

.dot-1 {
  left: 18%;
  top: 34%;
}

.dot-2 {
  left: 42%;
  top: 46%;
}

.dot-3 {
  left: 64%;
  top: 28%;
}

.dot-4 {
  left: 72%;
  top: 68%;
}

.dot-5 {
  left: 30%;
  top: 72%;
}

.bar-list {
  display: grid;
  gap: 6px;
}

.bar-list span {
  height: 7px;
  border-radius: 9px;
  background: linear-gradient(90deg, #678dff, rgba(103, 141, 255, 0.16));
}

.bar-list span:nth-child(2) {
  width: 76%;
}

.bar-list span:nth-child(3) {
  width: 58%;
}

.mini-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 5px;
}

.mini-cards span {
  height: 15px;
  border-radius: 5px;
  background: #f2f5ff;
  border: 1px solid rgba(111, 135, 216, 0.12);
}

.ribbon,
.spark {
  position: absolute;
  pointer-events: none;
}

.ribbon {
  width: 32px;
  height: 9px;
  border-radius: 12px;
  transform: rotate(42deg);
}

.ribbon-blue {
  background: #387bff;
}

.ribbon-red {
  background: #e83f74;
}

.ribbon-orange {
  background: #ff9f42;
}

.ribbon-1 {
  left: 4%;
  top: 30px;
}

.ribbon-2 {
  left: 14%;
  top: 60px;
}

.ribbon-3 {
  left: 2%;
  top: 164px;
}

.ribbon-4 {
  right: 8%;
  top: 78px;
}

.spark {
  width: 44px;
  height: 44px;
  border: 5px solid transparent;
  border-top-color: #ff814f;
  border-left-color: #4d8cff;
  border-radius: 50%;
}

.spark-1 {
  right: 4%;
  top: 48px;
  transform: rotate(28deg);
}

.spark-2 {
  left: 4%;
  bottom: 10px;
  transform: rotate(-24deg);
}

.product-copy {
  max-width: 650px;
  margin: 4px auto 0;
}

.product-copy h1 {
  margin: 0 0 10px;
  color: #17145d;
  font-size: 24px;
  line-height: 32px;
  font-weight: 800;
  letter-spacing: 0;
}

.product-copy ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 5px;
}

.product-copy li {
  position: relative;
  padding-left: 22px;
  color: rgba(49, 45, 112, 0.66);
  font-size: 13px;
  line-height: 20px;
  font-weight: 500;
}

.product-copy li::before {
  content: "✓";
  position: absolute;
  left: 0;
  top: 0;
  color: #6f80e6;
  font-weight: 800;
}

.role-panel {
  position: relative;
  min-width: 0;
  padding: 58px 38px 42px;
  box-sizing: border-box;
  background:
    radial-gradient(circle at 74% 12%, rgba(115, 135, 255, 0.1), transparent 35%),
    #fbf9ff;
}

.role-panel h2 {
  margin: 0 0 32px;
  color: #27205e;
  font-size: 26px;
  line-height: 34px;
  font-weight: 800;
  letter-spacing: 0;
}

.role-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(62px, 1fr));
  gap: 24px 18px;
  max-width: 820px;
}

.role-card {
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
  cursor: pointer;
  color: rgba(39, 32, 94, 0.68);
  font: inherit;
}

.role-card.active {
  color: #21195f;
}

.avatar-wrap {
  position: relative;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  box-shadow: 0 14px 28px rgba(70, 82, 150, 0.16);
}

.avatar-image {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  object-fit: cover;
}

.check-mark {
  position: absolute;
  right: 2px;
  bottom: 4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4668ff;
  border: 2px solid #fff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  box-sizing: border-box;
}

.role-name {
  max-width: 100%;
  color: currentColor;
  font-size: 15px;
  line-height: 22px;
  font-weight: 700;
  white-space: nowrap;
}

.start-button {
  position: absolute;
  right: 38px;
  bottom: 34px;
  width: 126px;
  height: 42px;
  border: 0;
  border-radius: 6px;
  background: #2f55dd;
  color: #fff;
  font-size: 16px;
  font-weight: 800;
  line-height: 42px;
  box-shadow: 0 12px 24px rgba(47, 85, 221, 0.24);
  cursor: pointer;
}

.start-button:hover {
  background: #2449cb;
}

@media (max-width: 1180px) {
  .role-select-page {
    align-items: flex-start;
    overflow: auto;
  }

  .role-select-modal {
    grid-template-columns: 1fr;
    height: auto;
    min-height: 0;
    overflow: auto;
  }

  .intro-panel,
  .role-panel {
    padding: 56px 40px;
  }

  .intro-panel::after {
    display: none;
  }

  .role-panel {
    min-height: 520px;
  }
}

@media (max-width: 720px) {
  .role-select-page {
    padding: 16px;
  }

  .role-select-modal {
    border-radius: 14px;
  }

  .intro-panel,
  .role-panel {
    padding: 32px 20px;
  }

  .dashboard-visual {
    height: 300px;
  }

  .dashboard-board {
    left: 2%;
    right: 2%;
    top: 48px;
    height: 230px;
    transform: none;
  }

  .metric-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-grid {
    display: none;
  }

  .product-copy h1,
  .role-panel h2 {
    font-size: 28px;
    line-height: 36px;
  }

  .product-copy li {
    font-size: 15px;
    line-height: 24px;
  }

  .role-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 28px 22px;
  }

  .start-button {
    position: static;
    width: 100%;
    margin-top: 44px;
  }
}
</style>
