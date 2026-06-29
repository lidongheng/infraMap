export function getPermissionConfig() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: 200,
        massage: "success",
        data: {
          account: "12345678",
          ruleCodeList: [
            {
              name: "张三",
              code: "ROLE_CXO",
              validEndTime: "2027-10-31",
              account: "12345678",
              userName: "张三",
            },
          ],
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
            {
              permDimenTypeCode: "2",
              permDimenTypeName: "Region",
              // Region 展示名脱敏片段：下方 permName 使用“五大联赛-俱乐部”。
              // 恢复真实 Region 名时，只需把本 detailList 内的 permName 改回真实 Region 名。
              detailList: [
                {
                  permCode: "REGION_CN_EAST",
                  permName: "英超-曼城",
                },
                {
                  permCode: "REGION_CN_NORTH",
                  permName: "英超-阿森纳",
                },
                {
                  permCode: "REGION_CN_SOUTH",
                  permName: "英超-利物浦",
                },
                {
                  permCode: "REGION_CN_WEST",
                  permName: "西甲-皇家马德里",
                },
                {
                  permCode: "REGION_CN_BEIJING_ONE",
                  permName: "西甲-巴塞罗那",
                },
                {
                  permCode: "REGION_CN_SHANGHAI_ONE",
                  permName: "西甲-马德里竞技",
                },
                {
                  permCode: "REGION_CN_SHENZHEN",
                  permName: "意甲-国际米兰",
                },
                {
                  permCode: "REGION_CN_HONGKONG",
                  permName: "意甲-尤文图斯",
                },
                {
                  permCode: "REGION_AP_SINGAPORE",
                  permName: "德甲-拜仁慕尼黑",
                },
                {
                  permCode: "REGION_AP_JAKARTA",
                  permName: "德甲-多特蒙德",
                },
                {
                  permCode: "REGION_EU_FRANKFURT",
                  permName: "法甲-巴黎圣日耳曼",
                },
                {
                  permCode: "REGION_US_SILICON_VALLEY",
                  permName: "法甲-马赛",
                },
              ],
            },
            {
              permDimenTypeCode: "4",
              permDimenTypeName: "云服务",
              detailList: [
                {
                  permCode: "CLOUD_ECS",
                  permName: "ECS",
                },
                {
                  permCode: "CLOUD_OBS",
                  permName: "OBS",
                },
                {
                  permCode: "CLOUD_EVS",
                  permName: "XPU",
                },
              ],
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
