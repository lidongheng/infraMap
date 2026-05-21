import dayjs from 'dayjs';
import { defineStore } from 'pinia';

const costCenterLastMonth = () => {
  let days = dayjs().date();
  let diffMonth = days < 15 ? 2 : 1;
  return dayjs().add(-`${diffMonth}`, 'month').startOf('month').format('YYYY-MM');
}

const getMonthArray = (currentMonth) => {
  const data = [currentMonth];
  for (let index = 1; index < 6; index++) {
    data.unshift(dayjs(currentMonth).subtract(index, 'months').format('YYYYMM'));
  }
  return data;
};

export const useCurrentDate = defineStore('currentMonth', {
  state: () => {
    return {
      date: costCenterLastMonth(),
    };
  },
  getters: {
    monthsArray: (state) => getMonthArray(state.date),
  },
});