import { computed, ref, watch } from "vue";
import dayjs from "dayjs";
import { selectedPool } from "./ResourcesLifecycle";
import { useCurrentDate } from "./useCurrentDate";
import { ceilToMagnitude } from "./useBubbleAxisRange";
import { getResourcePoolCustomerInfoEfficiencyAPI } from "@/api/infraMock";

export const rangeLevel = ref('全部');
export const resourceLevel = ref('资源族');
export const customerLevel = ref('全部');
export const resourceTypeList = ref([]);

export const customerData = ref({ detailList: [] });
export const tableDataSummary = ref({});
export const inforData = ref({});

export const directoryTreeList = ref([]);
export const cloudServerResourceTreeList = ref([]);
export const regionNameList = ref([]);
export const azNameList = ref([]);
export const directoryTreeLoading = ref(false);
let directoryTreeRequestId = 0;
let resourcePoolCustomerStarted = false;
let directoryTreeDataCache = [];

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

function buildDirectoryTreeByCloudServerName(cloudServerName, data, baseObj = {}) {
  if (cloudServerName === "EVS") {
    return applyRootResourceTypeLevel(data, baseObj);
  }

  if (cloudServerName === "OBS") {
    return applyRootResourceTypeLevel(data, baseObj);
  }

  return applyLevel(data, { obj: baseObj });
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
        cloudServerType: "ECS",
        azNameList: ["非洲-开罗(AZ1)"],
        regionNameList: ["非洲-开罗"],
        dirTreeList: getMockDirectoryTreeData("ECS"),
      },
      {
        cloudServerType: "EVS",
        azNameList: [],
        regionNameList: [],
        dirTreeList: getMockDirectoryTreeData("EVS"),
      },
      {
        cloudServerType: "OBS",
        azNameList: [],
        regionNameList: ["非洲-开罗"],
        dirTreeList: getMockDirectoryTreeData("OBS"),
      },
    ],
  };
}

function buildCloudServerResourceTreeList(list = []) {
  return list.map((item) => {
    const obj = {
      cloudServerName: item.cloudServerType,
    };
    return {
      name: item.cloudServerType,
      level: 0,
      obj,
      objStr: JSON.stringify(obj),
      children: buildDirectoryTreeByCloudServerName(item.cloudServerType, item.dirTreeList, obj),
    };
  });
}

function clearSelectedDirectoryTree() {
  directoryTreeList.value = [];
  regionNameList.value = [];
  azNameList.value = [];
}

function applySelectedDirectoryTree(list = directoryTreeDataCache) {
  const cloudServerName = selectedPool.value;
  const payload = list.find((item) => item.cloudServerType === cloudServerName);
  clearSelectedDirectoryTree();
  if (!payload) {
    return;
  }
  regionNameList.value = payload.regionNameList;
  azNameList.value = payload.azNameList;
  directoryTreeList.value = buildDirectoryTreeByCloudServerName(cloudServerName, payload.dirTreeList);
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

function applyRootResourceTypeLevel(arr = [], baseObj = {}) {
  return arr.map((item) => {
    const obj = {
      ...baseObj,
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

function normalizeFilterParams(filters = {}) {
  const toList = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string" && value) return value.split(",").filter(Boolean);
    return [];
  };
  return {
    regionNameList: toList(filters.regionNameList),
    azNameList: toList(filters.azNameList),
    resourceTypeList: Array.isArray(filters.resourceTypeList) ? filters.resourceTypeList : [],
  };
}

export function loadResourcePoolCustomerInfo(filters = {}) {
  const currentStore = useCurrentDate();
  const normalizedFilters = normalizeFilterParams(filters);
  const params = {
    cloudServerName: selectedPool.value,
    month: dayjs(currentStore.date).format("YYYYMM"),
    date: currentStore.date,
    regionNameList: normalizedFilters.regionNameList,
    azNameList: normalizedFilters.azNameList,
    resourceTypeList: normalizedFilters.resourceTypeList,
  };
  return getResourcePoolCustomerInfoEfficiencyAPI(params).then((res) => {
    inforData.value = res.data;
    return res;
  });
}

export const useResourcePoolCustomer = () => {
  const currentStore = useCurrentDate();
  const loadTreeData = () => {
    const requestId = ++directoryTreeRequestId;
    const params = {
      month: dayjs(currentStore.date).format("YYYYMM"),
      date: currentStore.date,
      cloudServerName: "",
    };
    clearSelectedDirectoryTree();
    cloudServerResourceTreeList.value = [];
    directoryTreeLoading.value = true;
    mockFetchDirectoryTree(params).then((res) => {
      if (requestId !== directoryTreeRequestId) {
        return;
      }
      directoryTreeDataCache = res.data;
      cloudServerResourceTreeList.value = buildCloudServerResourceTreeList(directoryTreeDataCache);
      applySelectedDirectoryTree();
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

  loadTreeData();
  watch(selectedPool, () => {
    applySelectedDirectoryTree();
  });
}

export function useDirectoryTree() {
  return {
    directoryTreeList,
    cloudServerResourceTreeList,
    directoryTreeLoading,
    regionNameList,
    azNameList,
    resourceTree,
  };
}
