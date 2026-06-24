export function getUserRoleRules() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: 200,
        massage: "success",
        data: {
          account: "12345678",
          totalDimenPermConfigList: [
            {
              permDimenTypeCode: "1",
              permDimenTypeName: "角色",
              detailList: [
                {
                  permCode: "ROLE_CXO",
                  permName: "角色1",
                },
                {
                  permCode: "ROLE_FRONT_SALES",
                  permName: "角色2",
                },
                {
                  permCode: "ROLE_INTERNAL_CUSTOMER",
                  permName: "角色3",
                },
                {
                  permCode: "ROLE_SERVICE_PE",
                  permName: "角色4",
                },
                {
                  permCode: "ROLE_OPS_ANALYST",
                  permName: "角色5",
                },
              ],
            },
          ],
          ruleCodeList: [
            {
              name: "张三",
              code: "ROLE_CXO",
              validEndTime: "2027-10-31",
              account: "12345678",
              userName: "张三",
            },
          ],
          regionCodeList: [
            {
              name: "张三",
              code: "REGION_CN_EAST",
              validEndTime: "2027-10-31",
              account: "12345678",
              userName: "张三",
            },
            {
              name: "张三",
              code: "REGION_CN_WEST",
              validEndTime: "2027-10-31",
              account: "12345678",
              userName: "张三",
            },
            {
              name: "张三",
              code: "REGION_CN_SOUTH",
              validEndTime: "2027-10-31",
              account: "12345678",
              userName: "张三",
            },
          ],
          cloudServerNameList: [
            {
              code: "CLOUD_ECS",
              validEndTime: "2027-02-18",
            },
            {
              code: "CLOUD_OBS",
              validEndTime: "2027-02-18",
            },
            {
              code: "CLOUD_EVS",
              validEndTime: "2027-02-18",
            },
          ],
        },
      });
    }, 500);
  });
}
