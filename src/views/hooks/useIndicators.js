import { useCurrentDate } from "../useCurrentDate"

export const getAxisData = (monthNumber) => {
  const currentStore = useCurrentDate();
  let data = [...currentStore.monthsArray];
  switch (monthNumber) {
    case 6:
      data = [...currentStore.monthsArray];
      break;
    case 12:
      data = [...currentStore.monthsArray];
      break;
    default:
      break;
  }
  return data;
}
