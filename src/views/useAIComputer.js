import { computed, ref } from "vue";

export const selectedResourceType = ref("A3");
export const parentName = ref("代次");
export const isCustomer = computed(
  () => 
    selectedResourceType.value.includes('部') ||
    selectedResourceType.value.includes('YW') ||
    parentName.value.includes('客户')
);
