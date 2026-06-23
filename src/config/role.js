export const ROLE_STORAGE_KEY = "infraMap:selectedRole";

export const roles = [
  {
    label: "角色1",
    value: "cxo",
    avatar: "1",
    theme: "theme-cxo",
    avatarClass: "avatar--one",
    expireDate: "2027-02-18",
    validDate: "--",
    approver: "张三",
    orderNo: "12345678",
  },
  {
    label: "角色2",
    value: "sales",
    avatar: "2",
    theme: "theme-sales",
    avatarClass: "avatar--two",
    expireDate: "2027-02-18",
    validDate: "--",
    approver: "张三",
    orderNo: "12345678",
  },
  {
    label: "角色3",
    value: "internalCustomer",
    avatar: "3",
    theme: "theme-customer",
    avatarClass: "avatar--three",
    expireDate: "2027-02-18",
    validDate: "--",
    approver: "张三",
    orderNo: "12345678",
  },
  {
    label: "角色4",
    value: "servicePe",
    avatar: "4",
    theme: "theme-pe",
    avatarClass: "avatar--four",
    expireDate: "2027-02-18",
    validDate: "--",
    approver: "张三",
    orderNo: "12345678",
  },
  {
    label: "角色5",
    value: "operationAnalysis",
    avatar: "5",
    theme: "theme-operation",
    avatarClass: "avatar--five",
    expireDate: "2027-02-18",
    validDate: "--",
    approver: "张三",
    orderNo: "12345678",
  },
];

export const mockUserRolePermissions = {
  ownedRoleValues: ["cxo", "sales", "internalCustomer", "servicePe"],
};

export function getRoleTargetPath(roleValue) {
  // 角色入口和切换入口共用同一套跳转规则，避免两处维护时出现路由不一致。
  if (roleValue === "cxo") {
    return "/costOperation";
  }

  return "/saleHome";
}

export function saveSelectedRole(roleValue) {
  sessionStorage.setItem(ROLE_STORAGE_KEY, roleValue);
}

export function getSelectedRoleValue() {
  return sessionStorage.getItem(ROLE_STORAGE_KEY);
}
