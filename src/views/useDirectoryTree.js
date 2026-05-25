import { ref } from "vue";

export const directoryTreeList = ref([]);

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

export async function mockFetchDirectoryTree(params = {}) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return {
    status: 200,
    massage: "success",
    data: mockResourceTree,
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

export async function fetchDirectoryTree(params = {}) {
  const res = await mockFetchDirectoryTree(params);
  directoryTreeList.value = applyLevel(res.data ?? []);
  return res;
}

export function useDirectoryTree() {
  return {
    directoryTreeList,
    fetchDirectoryTree,
  };
}
