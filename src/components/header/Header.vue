<template>
  <header class="global-header-content">
    <div class="header-left">
      <FilterDropdowns
        v-if="showSaleHomeAreaFilter"
        v-model="areaFilterValue"
        :options="areaFilterOptions"
        :filter-config="areaFilterConfig"
      />
      <span v-else>头部区域</span>
    </div>
    <RoleMenu />
  </header>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import FilterDropdowns from "@/components/FilterDropdowns.vue";
import RoleMenu from "@/components/RoleMenu.vue";

const route = useRoute();
const showSaleHomeAreaFilter = computed(() => route.name === "saleHome");

const areaFilterValue = ref({
  areaList: ["domestic"],
  districtList: ["east-china"],
  regionList: ["华东上海一", "华东上海二", "华东上海三", "华东上海四"],
});

const areaFilterConfig = [
  {
    key: "saleHomeArea",
    type: "areaCascade",
    optionKey: "areaTree",
    areaValueKey: "areaList",
    districtValueKey: "districtList",
    regionValueKey: "regionList",
    icon: "location",
    hideLabel: true,
    columns: [
      { title: "区域" },
      { title: "大区" },
      { title: "Region" },
    ],
  },
];

const areaFilterOptions = {
  // saleHome Header 筛选先使用 mock 三层数据，后续接接口时替换 areaTree 即可。
  areaTree: [
    {
      label: "国内",
      value: "domestic",
      children: [
        {
          label: "华北",
          value: "north-china",
          children: [
            { label: "华北北京一", value: "华北北京一" },
            { label: "华北北京二", value: "华北北京二" },
          ],
        },
        {
          label: "华东",
          value: "east-china",
          children: [
            { label: "华东上海一", value: "华东上海一" },
            { label: "华东上海二", value: "华东上海二" },
            { label: "华东上海三", value: "华东上海三" },
            { label: "华东上海四", value: "华东上海四" },
            { label: "华东青岛", value: "华东青岛" },
          ],
        },
        {
          label: "华南",
          value: "south-china",
          children: [
            { label: "华南广州一", value: "华南广州一" },
            { label: "华南深圳一", value: "华南深圳一" },
          ],
        },
        {
          label: "西南",
          value: "southwest-china",
          children: [
            { label: "西南成都一", value: "西南成都一" },
            { label: "西南重庆一", value: "西南重庆一" },
          ],
        },
        {
          label: "西北",
          value: "northwest-china",
          children: [
            { label: "西北西安一", value: "西北西安一" },
            { label: "西北兰州一", value: "西北兰州一" },
          ],
        },
      ],
    },
    {
      label: "海外",
      value: "overseas",
      children: [
        {
          label: "亚太",
          value: "apac",
          children: [
            { label: "亚太新加坡一", value: "亚太新加坡一" },
            { label: "亚太曼谷一", value: "亚太曼谷一" },
          ],
        },
        {
          label: "欧洲",
          value: "europe",
          children: [
            { label: "欧洲法兰克福一", value: "欧洲法兰克福一" },
            { label: "欧洲巴黎一", value: "欧洲巴黎一" },
          ],
        },
      ],
    },
  ],
};
</script>

<style lang="less" scoped>
.global-header-content {
  width: 100%;
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}

.header-left {
  display: flex;
  align-items: center;
  min-width: 0;
}
</style>
