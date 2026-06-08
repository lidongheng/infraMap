import { useCurrentDate } from "./useCurrentDate";
import { ref, watch } from 'vue';
import { formatNumToLocalString, formatRateValue } from "@/utils";
import {
  getCardOperateAPI,
  getResourcePoolLifecycleAPI,
} from '@/api/infraMock';

export const selectedPool = ref('ECS');

const isNull = (val) => ['null', ''].includes(String(val));

const hasPermission = (PromiseSettledResult) =>
  PromiseSettledResult.status === 'fulfilled' && PromiseSettledResult.value.status === 200;

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

  const loadResourcePoolData = async () => {
    const metrics = ['efficiency', 'operate'];
    Promise.allSettled(
      metrics.map((metric) => getResourcePoolLifecycleAPI(metric, currentStore.date, currentStore.month))
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
  const loadOperateData = () => {
    getCardOperateAPI({ month: currentStore.month, date: currentStore.date }).then((res) => {
      if (res.status === 200) {
        operateData.value = res.data?.commonComputing?.[0]
      } else {
        operateData.value.value = '**';
        operateData.value.compareValue = '**';
      }
    });
  };

  watch(
    () => currentStore.date,
    () => {
      loadResourcePoolData();
      loadOperateData();
    },
    { immediate: true }
  );

  return { poolData, operateData };
};
