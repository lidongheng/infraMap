import { reactive, ref } from "vue";

export const ROLE_STORAGE_KEY = "infraMap:selectedRole";

export const ROLE_CODE_ORDER = [
  "ROLE_CXO",
  "ROLE_FRONT_SALES",
  "ROLE_INTERNAL_CUSTOMER",
  "ROLE_SERVICE_PE",
  "ROLE_OPS_ANALYST",
];

// 正式头像提供后，在这里引入 PNG 文件，并将下方 null 替换为对应的变量。
// import roleCxoAvatar from "@/assets/images/role/role-cxo.png";
// import roleFrontSalesAvatar from "@/assets/images/role/role-front-sales.png";
// import roleInternalCustomerAvatar from "@/assets/images/role/role-internal-customer.png";
// import roleServicePeAvatar from "@/assets/images/role/role-service-pe.png";
// import roleOpsAnalystAvatar from "@/assets/images/role/role-ops-analyst.png";
const ROLE_AVATAR_MAP = {
  // ROLE_CXO: roleCxoAvatar,
  ROLE_CXO: null,
  // ROLE_FRONT_SALES: roleFrontSalesAvatar,
  ROLE_FRONT_SALES: null,
  // ROLE_INTERNAL_CUSTOMER: roleInternalCustomerAvatar,
  ROLE_INTERNAL_CUSTOMER: null,
  // ROLE_SERVICE_PE: roleServicePeAvatar,
  ROLE_SERVICE_PE: null,
  // ROLE_OPS_ANALYST: roleOpsAnalystAvatar,
  ROLE_OPS_ANALYST: null,
};

export const roles = reactive([]);
export const rolePermissionList = reactive([]);
export const regionPermissionList = reactive([]);
export const cloudServerPermissionList = reactive([]);
export const selectedRoleValue = ref(sessionStorage.getItem(ROLE_STORAGE_KEY));

export function initializeRolePermissions(data) {
  const roleDimension = data.totalDimenPermConfigList.find(
    (item) => item.permDimenTypeCode === "1",
  );
  const roleList = roleDimension.detailList.map((role) => {
    return {
      label: role.permName,
      value: role.permCode,
      avatar: ROLE_AVATAR_MAP[role.permCode],
    };
  });

  roles.splice(0, roles.length, ...roleList);
  rolePermissionList.splice(0, rolePermissionList.length, ...data.ruleCodeList);
  regionPermissionList.splice(0, regionPermissionList.length, ...data.regionCodeList);
  cloudServerPermissionList.splice(
    0,
    cloudServerPermissionList.length,
    ...data.cloudServerNameList,
  );
}

export function getRoleTargetPath(roleValue) {
  // 角色入口和切换入口共用同一套跳转规则，避免两处维护时出现路由不一致。
  if (roleValue === "ROLE_CXO") {
    return "/costOperation";
  }

  return "/saleHome";
}

export function saveSelectedRole(roleValue) {
  sessionStorage.setItem(ROLE_STORAGE_KEY, roleValue);
  selectedRoleValue.value = roleValue;
}
