export const tableDataSummary = ref({});
export const directoryTreeList = ref([]);
export const resourcelypeList = ref([]);
export const directoryTreeLoading = ref(false);
export const leftCardData = reactive({
    ecs: {},
    obs: {},
    xpu: {},
});
export const keylnfor = reactive({
    ecs: {},
    obs: {},
    xpu: {},
});
export const tableSummary = reactive({
    ecs: {},
    obs: {},
    xpu: {},
});

export const permissionCard = reactive({

    ecs: true,

    obs: true,

    xpu: true,

});

export const permissionTable = reactive({

    ecs: true,

    obs: true,

    xpu: true,

});

export const ecsTable = ref([]);
export const obsTable = ref([]);

export const xpuTable = ref([]);

export const pageNo = ref(1);

export const pageSize = ref(50);

export const pageinfo = ref({ total: 0 });
export const currentSort = ref({
    prop: '',
    order: '',
});

export const storageMode = ref([]);

export const
    generationDirTreeList =
        computed(() =>
            filterOtherValue.value.generationDirTreeList ?? []); // 资源代次
export const resourceTypeArr =
    computed(() =>
        filterOtherValue.value.resourceType ?? []); // 资源规格
const areaList = computed(() => filterValue.value.areaName ?? []); // 大区
const regionList = computed(() => filterValue.value.regionName ?? []); // region
const cardTypeList = computed(() =>
    filterOtherValue.value.cardTypeList ?? []); // 卡类型

const applyLevel = (arr = [],
    pitem = {}, plevel = 0) => {
    const levelKeyMap = {
        0: 'calcType',
        1: 'family',
        2: 'generation',
    };
    return arr?.map((item) => {
        const key =
            levelKeyMap[plevel] ??
            plevel.toString();
        const obj = {
            ...pitem.obj,
            [key]: item.name,
        };
        const objStr = JSON.stringify(obj);
        let newltem = {
            ...item,
            level: plevel,
            obj: obj,
            objStr: objStr,
        };

        if (item.children &&
            item.children.length > 0) {
            newltem.children =

                applyLevel(item.children, newltem, plevel + 1);
        }
        return newltem;
    });
};

// OBS
export const useResoureDetailByOBS = (active) => {
    const currentStore = useCurrentStore();
    const loadCardData = () => {
        const params = {
            month: currentStore.saleMonth,
            date: currentStore.saleDate,
            areaName: areaList.value,
            regionid: [],
            regionName: regionList.value,
        };
        leftCardData.obs = {};
        permissionCard.obs = true;

        getSalesDetailByObsAPI(params).then((res) => {
            if (res.status === 403) {
                permissionCard.obs = false;
                return;
            }
            if (res.status === 200) {
                leftCardData.obs = res.data ?? {};
            }
        });
    };
    const loadInfoData = debounce(() => {
        const params = {
            month: currentStore.saleMonth,
            date: currentStore.saleDate,
            areaName: areaList.value,
            regionld: [],
            regionName: regionList.value,
        };
        keylnfor.obs = {};

        getSalesDetailByObsAPI(params).then((res) => {
            if (res.status === 200) {
                keyinfor.obs = res.data ??
                    {};
            }
        });
    }, 100);
    const loadTableData =
        debounce(() => {
            const params = {
                month:
                    currentStore.saleMonth,
                date: currentStore.saleDate,
                areaName: areaList.value,
                regionid: [],
                regionName:
                    regionList.value,
                pageNo: pageNo.value,
                pageSize: pageSize.value,
                sortField:
                    currentSort.value.prop,
                order:
                    currentSort.value.order ===
                        'descending' ? 2 : 1,
                storageMode:
                    storageMode.value,
            };
            obsTable.value = [];
            tableSummary.obs = {};
            permissionTable.obs = true;

            getSalesTableByObsAPI(params
            )
                .then((res) => {
                    if (res.status === 403) {
                        permissionTable.obs =
                            false;
                        return;
                    }
                    if (res.status === 200) {
                        obsTable.value =
                            res.data?.pagelnfo?.records ??
                            [];
                        pagelnfo.value.total =
                            res.data?.pagelnfo?.totalNum ??
                            0;

                        tableSummary.obs =
                            res.data?.summaryVo ?? {};
                    }
                })
                .catch(() =>
                    (pagelnfo.value.total = 0));
        }, 100);

    watch(
        [() => currentStore.saleDate,
            filterValue],
        ([]) => {
            loadCardData();
        },
        {
            immediate: true,
        }
    );
    watch(
        [() => currentStore.saleDate,
            filterValue, filterOtherValue,
            active],
        ([]) => {
            if (active.value !== 'OBS') {
                return;
            }
            loadInfoData();
        },
        {
            immediate: true,
        }
    );
    watch(
        [() => currentStore.saleDate,
            filterValue, filterOtherValue,
            active, pageNo, pageSize,
            currentSort, storageMode],
        ([]) => {
            if (active.value !== 'OBS') {
                return;
            }
            loadTableData();
        }
    );
};