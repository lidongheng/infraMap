import { ref } from "vue";

export const directoryTreeList = ref([]);

export async function mockFetchDirectoryTree(params = {}) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return {
    status: 200,
    massage: "success",
    data: [
      {
        name: "内存优化型",
        children: [
          {
            name: "unclassified",
            children: [
              {
                name: "m9e-opc",
                children: [
                  {
                    name: "m9e-opc.large",
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "通用计算型",
        children: [
          {
            name: "c",
            children: [
              {
                name: "c7",
                children: [
                  {
                    name: "c7.large",
                    children: [],
                  },
                  {
                    name: "c7.xlarge",
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
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
