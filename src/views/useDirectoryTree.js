import { computed, ref, watch } from "vue";
import { activeCategory } from "./useGeneralComputer";
import { useCurrentDate } from "./useCurrentDate";

export const rangeLevel = ref('全部');
export const resourceLevel = ref('资源族');
export const customerLevel = ref('全部');
export const resourceTypeList = ref([]);

export const customerData = ref({ detailList: [] });
export const tableDataSummary = ref({});
export const inforData = ref({});

export const directoryTreeList = ref([]);
export const regionNameList = ref([]);
export const azNameList = ref([]);
export const directoryTreeLoading = ref(false);
let directoryTreeRequestId = 0;
let resourcePoolCustomerStarted = false;

function createResourceTypes(prefix, sizes) {
  return sizes.map((size) => ({
    name: `${prefix}.${size}`,
    children: [],
  }));
}

function createResourceGenerations(family, generations, sizes) {
  return generations.map((generation) => ({
    name: `${family}${generation}`,
    children: createResourceTypes(`${family}${generation}`, sizes),
  }));
}

function createResourceFamily(family, generations, sizes) {
  return {
    name: family,
    children: createResourceGenerations(family, generations, sizes),
  };
}

function createResourceSeries(name, families, generations, sizes) {
  return {
    name,
    children: families.map((family) => createResourceFamily(family, generations, sizes)),
  };
}

const mockResourceTree = [
  createResourceSeries("内存优化型", ["m", "mse", "mne", "mre", "mge", "mhe"], ["6", "7", "8", "9"], [
    "large",
    "xlarge",
    "2xlarge",
    "4xlarge",
    "8xlarge",
    "12xlarge",
  ]),
  createResourceSeries("通用计算型", ["c", "s", "sn", "se", "g", "gn", "ge", "h"], ["5", "6", "7", "8", "9"], [
    "large",
    "xlarge",
    "2xlarge",
    "4xlarge",
    "8xlarge",
    "16xlarge",
  ]),
  createResourceSeries("计算增强型", ["cc", "ce", "cne", "cse", "cge", "ch"], ["6", "7", "8", "9"], [
    "medium",
    "large",
    "xlarge",
    "2xlarge",
    "4xlarge",
    "8xlarge",
  ]),
  createResourceSeries("GPU 计算型", ["gn", "pi", "pn", "gni", "gnt", "gvt"], ["5", "6", "7", "8"], [
    "2xlarge",
    "4xlarge",
    "8xlarge",
    "16xlarge",
    "32xlarge",
    "64xlarge",
  ]),
  createResourceSeries("高主频型", ["hf", "hfc", "hfg", "hfm", "hfr", "hfs"], ["6", "7", "8", "9"], [
    "large",
    "xlarge",
    "2xlarge",
    "4xlarge",
    "8xlarge",
    "12xlarge",
  ]),
  createResourceSeries("本地 SSD 型", ["i", "im", "is", "it", "ir", "id"], ["4", "5", "6", "7"], [
    "large",
    "xlarge",
    "2xlarge",
    "4xlarge",
    "8xlarge",
    "16xlarge",
  ]),
  createResourceSeries("大数据型", ["d", "dm", "ds", "dr", "dn", "dw"], ["3", "4", "5", "6"], [
    "xlarge",
    "2xlarge",
    "4xlarge",
    "8xlarge",
    "16xlarge",
    "24xlarge",
  ]),
  createResourceSeries("裸金属型", ["ebm", "ebmc", "ebmg", "ebmi", "ebmn", "ebms"], ["5", "6", "7", "8"], [
    "large",
    "xlarge",
    "2xlarge",
    "4xlarge",
    "8xlarge",
    "16xlarge",
  ]),
];

const mockEvsResourceTree = [
  { name: "ESSD", children: null },
  { name: "SSD", children: null },
  { name: "SAS", children: null },
  { name: "ESSSD", children: null },
];

const mockObsResourceTree = [
  { name: "标准存储", children: null },
  { name: "低频访问存储", children: null },
  { name: "归档存储", children: null },
  { name: "深度归档存储", children: null },
];

function getResponsePayload(res, cloudServerName) {
  return res.data.find((item) => item.cloudServerType === cloudServerName);
}

function buildDirectoryTreeByCloudServerName(cloudServerName, data) {
  if (cloudServerName === "EVS") {
    return applyRootResourceTypeLevel(data);
  }

  if (cloudServerName === "OBS") {
    return applyRootResourceTypeLevel(data);
  }

  return applyLevel(data);
}

function getMockDirectoryTreeData(cloudServerName) {
  const mockDataMap = {
    EVS: mockEvsResourceTree,
    OBS: mockObsResourceTree,
  };
  return mockDataMap[cloudServerName] ?? mockResourceTree;
}

export async function mockFetchDirectoryTree(params = {}) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return {
    status: 200,
    massage: "success",
    data: [
      {
        cloudServerType: params.cloudServerName,
        azNameList: ["非洲-开罗(AZ1)"],
        regionNameList: ["非洲-开罗"],
        dirTreeList: getMockDirectoryTreeData(params.cloudServerName),
      },
    ],
  };
}

const applyLevel = (arr = [], pitem = {}, plevel = 0) => {
  const levelKeyMap = {
    0: 'level0',
    1: 'resourceFamily',
    2: 'resourceVer',
    3: 'resourceType',
  };
  return arr.map((item) => {
    const key = levelKeyMap[plevel] ?? plevel.toString();
    const obj = {
      ...pitem.obj,
      [key]: item.name,
    };
    if (plevel > 0) {
      if (Object.prototype.hasOwnProperty.call(obj, 'level0')) {
        delete obj.level0;
      }
    }
    const objStr = JSON.stringify(obj);
    let newItem = {
      ...item,
      level: plevel,
      obj: obj,
      objStr: objStr,
    };

    if (item.children && item.children.length > 0) {
      newItem.children = applyLevel(item.children, newItem, plevel + 1);
    }
    return newItem;
  });
};

function applyRootResourceTypeLevel(arr = []) {
  return arr.map((item) => {
    const obj = {
      resourceType: item.name,
    };
    const newItem = {
      ...item,
      level: 0,
      obj,
      objStr: JSON.stringify(obj),
    };

    if (item.children && item.children.length > 0) {
      newItem.children = applyLevel(item.children, newItem, 1);
    }
    return newItem;
  });
}

export const resourceTree = computed(() => directoryTreeList.value);

export const useResourcePoolCustomer = () => {
  const currentStore = useCurrentDate();
  const loadTreeData = () => {
    const cloudServerName = activeCategory.value;
    const requestId = ++directoryTreeRequestId;
    const params = {
      month: currentStore.month,
      date: currentStore.date,
      cloudServerName,
    };
    directoryTreeList.value = [];
    regionNameList.value = [];
    azNameList.value = [];
    directoryTreeLoading.value = true;
    mockFetchDirectoryTree(params).then((res) => {
      if (requestId !== directoryTreeRequestId || activeCategory.value !== cloudServerName) {
        return;
      }
      const payload = getResponsePayload(res, cloudServerName);
      regionNameList.value = payload.regionNameList;
      azNameList.value = payload.azNameList;
      directoryTreeList.value = buildDirectoryTreeByCloudServerName(cloudServerName, payload.dirTreeList);
    }).finally(() => {
      if (requestId === directoryTreeRequestId) {
        directoryTreeLoading.value = false;
      }
    })
  }

  if (resourcePoolCustomerStarted) {
    return;
  }
  resourcePoolCustomerStarted = true;

  watch(activeCategory, loadTreeData);

  loadTreeData();
}

export function useDirectoryTree() {
  return {
    directoryTreeList,
    directoryTreeLoading,
    regionNameList,
    azNameList,
    resourceTree,
  };
}
