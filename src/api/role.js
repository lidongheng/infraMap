export function getUserRoleRules() {
  return Promise.resolve({
    ruleCodeList: [
      {
        name: "张三",
        code: "cxo",
        validEndTime: "2027-10-31",
        account: "12345678",
        userName: "张三",
      },
    ],
  });
}
