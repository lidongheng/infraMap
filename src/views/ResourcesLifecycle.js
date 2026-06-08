import { useCurrentDate } from "./useCurrentDate";
import { ref } from 'vue';
import dayjs from "dayjs";
import { formatNumToLocalString, formatRateValue } from "@/utils";
import {
  getCardOperateAPI,
  getResourcePoolLifecycleAPI,
} from '@/api/infraMock';

export const selectedPool = ref('ECS');

const isNull = (val) => ['null', ''].includes(String(val));

const hasPermission = (PromiseSettledResult) =>
  PromiseSettledResult.status === 'fulfilled' && PromiseSettledResult.value.status === 200;

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

function buildCommonComputeParams(currentStore, filters = {}) {
  const normalizedFilters = normalizeFilterParams(filters);
  return {
    cloudServerName: selectedPool.value,
    month: dayjs(currentStore.date).format("YYYYMM"),
    date: currentStore.date,
    regionNameList: normalizedFilters.regionNameList,
    azNameList: normalizedFilters.azNameList,
    resourceTypeList: normalizedFilters.resourceTypeList,
  };
}

export const useResourcePool = () => {
  const currentStore = useCurrentDate();
  const pools = ['zyc', 'js', 'ECS', 'BMS', 'DCC', 'cc', 'EVS', 'OBS', 'DSS'];
  const initData = pools.map((item) => ({
    resourceName: item,
    poolNum: '--',
    cpuUseRate: '--',
    hardDiskUseRate: '--',
    grossProfitRate: '--',
    gainResourcePoolNum: '--',
    diskSpaceUseRate: '--',
  }));
  const poolData = ref(structuredClone(initData));

  const loadResourcePoolData = async (filters = {}) => {
    const metrics = ['efficiency', 'operate'];
    const baseParams = buildCommonComputeParams(currentStore, filters);
    Promise.allSettled(
      metrics.map((metric) => getResourcePoolLifecycleAPI({ ...baseParams, metric }))
    ).then(([efficiencyRes, operateRes]) => {
      if (hasPermission(efficiencyRes)) {
        poolData.value.forEach((pool) => {
          const findItem = efficiencyRes.value.data.find(
            (item) => item.resourceName.slice(0, 3) === pool.resourceName
          );
          if (findItem) {
            pool.poolNum = isNull(findItem.poolNum)
              ? '--'
              : formatNumToLocalString(findItem.poolNum);
            pool.cpuUseRate = isNull(findItem.cpuUseRate)
              ? '--'
              : `${formatRateValue(findItem.cpuUseRate)}%`;
            pool.diskSpaceUseRate = isNull(findItem.diskSpaceUseRate)
              ? '--'
              : `${formatRateValue(findItem.diskSpaceUseRate)}%`;
            pool.hardDiskUseRate = isNull(findItem.hardDiskUseRate)
              ? '--'
              : `${formatRateValue(findItem.hardDiskUseRate)}%`;
          } else {
            pool.poolNum = '--';
            pool.cpuUseRate = '--';
            pool.hardDiskUseRate = '--';
            pool.diskSpaceUseRate = '--';
          }
        });
      } else {
        poolData.value.forEach((pool) => {
          pool.poolNum = '**';
          pool.cpuUseRate = '**';
          pool.hardDiskUseRate = '**';
          pool.diskSpaceUseRate = '**';
        });
      }

      if (hasPermission(operateRes)) {
        poolData.value.forEach((pool) => {
          const findItem = operateRes.value.data.find(
            (item) => item.resourceName.slice(0, 3) === pool.resourceName
          );
          if (findItem) {
            pool.grossProfitRate = isNull(findItem.grossProfitRate)
              ? '--'
              : formatNumToLocalString(findItem.grossProfitRate);
            pool.gainResourcePoolNum = isNull(findItem.gainResourcePoolNum)
              ? '--'
              : `${formatRateValue(findItem.gainResourcePoolNum)}%`;
            pool.lossResourcePoolNum = isNull(findItem.lossResourcePoolNum)
              ? '--'
              : `${formatRateValue(findItem.lossResourcePoolNum)}%`;
          } else {
            pool.grossProfitRate = '--';
            pool.gainResourcePoolNum = '--';
            pool.lossResourcePoolNum = '--';
          }
        });
      } else {
        poolData.value.forEach((pool) => {
          pool.grossProfitRate = '**';
          pool.gainResourcePoolNum = '**';
          pool.lossResourcePoolNum = '**';
        });
      }
    });
  };

  const operateData = ref({
    value: '--',
    compareValue: '--',
  });
  const loadOperateData = (filters = {}) => {
    getCardOperateAPI(buildCommonComputeParams(currentStore, filters)).then((res) => {
      if (res.status === 200) {
        operateData.value = res.data?.commonComputing?.[0]
      } else {
        operateData.value.value = '**';
        operateData.value.compareValue = '**';
      }
    });
  };

  const fetchResourcePoolData = (filters = {}) => {
    loadResourcePoolData(filters);
    loadOperateData(filters);
  };

  return { poolData, operateData, fetchResourcePoolData };
};
