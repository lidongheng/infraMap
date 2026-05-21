import { ref, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { REGION_COORDS } from "@/config/regionCoords";
import { useCurrentDate } from "./useCurrentDate";

const isIframeCreated = ref(true);
/**
 * 根据 name 前缀匹配，补充 lng、lat；无匹配则返回 null（用于过滤）
 * @param {{ name: string, rate: number }} item 后端返回的项（仅 name、rate）
 * @returns {{ name: string, rate: number, lng: number, lat: number } | null}
 */
export function enrichRegionWithCoords(item) {
  const name = item.name || "";
  for (const [prefix, [lng, lat]] of REGION_COORDS) {
    if (name.startsWith(prefix)) {
      return { ...item, lng, lat };
    }
  }
  return null;
}

/**
 * Region 数据 composable：从后端获取 regionData、profitCount、lossCount
 */
/**
 * 模拟 operate 接口（有白名单权限控制）
 * 有权限时返回 { status: 200, data: { list }, message: "SUCCESS" }
 * 无权限时返回 { status: 403, data: null, message: "没有相关权限" }
 */
async function mockFetchOperate() {
  await new Promise((r) => setTimeout(r, 300));
  // 取消下行注释可模拟无权限
  // return { status: 403, data: null, message: "没有相关权限" };
  return {
    status: 200,
    message: "SUCCESS",
    data: {
      list: [
        { name: "西南-贵阳一", rate: 0.0644 },
        { name: "华北-北京四", rate: 0.0517 },
        { name: "华北-乌兰察布一", rate: 0.0517 },
        { name: "华东-上海二", rate: 0.1318 },
        { name: "华南-广州-友好用户环境", rate: 0.1899 },
        { name: "华南-广州", rate: 0.1829 },
        { name: "西南-贵阳-汽车二", rate: 0.0644 },
        { name: "西北-克拉玛依", rate: 0.0644 },
        { name: "华北三", rate: 0.1111 },
        { name: "华东-上海一", rate: 0.1318 },
        { name: "华东-北京金融二", rate: 0.1318 },
        { name: "腾讯云政务平台-乌兰察布", rate: 0.1318 },
        { name: "华东专属-金融一", rate: 0.1318 },
        { name: "华北-北京一", rate: 0.0517 },
        { name: "中国-香港", rate: 0.0517 },
        { name: "华北-乌兰察布-汽车一", rate: 0.0517 },
        { name: "华南-深圳", rate: 0.0517 },
        { name: "华东二", rate: 0.0517 },
        { name: "华北-北京二", rate: 0.0517 },
        { name: "欧洲-巴黎-OP1", rate: 0.0531 },
        { name: "欧洲-法兰克福", rate: 0.0782 },
        { name: "欧洲-伦敦", rate: 0.0945 },
        { name: "欧洲-阿姆斯特丹", rate: 0.0615 },
        { name: "欧洲-马德里", rate: 0.0488 },
        { name: "俄罗斯-莫斯科", rate: 0.0531 },
        { name: "土耳其-伊斯坦布尔", rate: 0.1211 },
        { name: "中东-迪拜", rate: 0.1455 },
        { name: "非洲-约翰内斯堡", rate: -0.0211 },
        { name: "非洲-开罗", rate: 0.0328 },
        { name: "非洲-拉各斯", rate: -0.0155 },
        { name: "亚太-雅加达", rate: 0.1211 },
        { name: "亚太-新加坡", rate: 0.1533 },
        { name: "亚太-东京", rate: 0.1055 },
        { name: "亚太-悉尼", rate: 0.0872 },
        { name: "亚太-首尔", rate: 0.1122 },
        { name: "亚太-孟买", rate: 0.0966 },
        { name: "亚太-曼谷", rate: 0.0789 },
        { name: "亚太-马尼拉", rate: 0.0633 },
        { name: "亚太-吉隆坡", rate: 0.0811 },
        { name: "拉美-墨西哥城四", rate: 0.1899 },
        { name: "拉美-圣保罗", rate: 0.1522 },
        { name: "拉美-波哥大", rate: 0.0688 },
        { name: "拉美-布宜诺斯艾利斯", rate: -0.0355 },
        { name: "拉美-圣地亚哥", rate: 0.0422 },
        { name: "北美-弗吉尼亚", rate: 0.1189 },
        { name: "北美-硅谷", rate: 0.1644 },
        { name: "北美-达拉斯", rate: -0.0088 },
      ],
    },
  };
}

/**
 * 模拟 efficiency 接口（无权限控制，rate 全为 null）
 */
async function mockFetchEfficiency() {
  await new Promise((r) => setTimeout(r, 200));
  return {
    status: 200,
    message: "SUCCESS",
    data: {
      list: [
        { name: "西南-贵阳一", rate: null },
        { name: "华北-北京四", rate: null },
        { name: "华北-乌兰察布一", rate: null },
        { name: "华东-上海二", rate: null },
        { name: "华南-广州-友好用户环境", rate: null },
        { name: "华南-广州", rate: null },
        { name: "西南-贵阳-汽车二", rate: null },
        { name: "西北-克拉玛依", rate: null },
        { name: "华北三", rate: null },
        { name: "华东-上海一", rate: null },
        { name: "华东-北京金融二", rate: null },
        { name: "腾讯云政务平台-乌兰察布", rate: null },
        { name: "华东专属-金融一", rate: null },
        { name: "华北-北京一", rate: null },
        { name: "中国-香港", rate: null },
        { name: "华北-乌兰察布-汽车一", rate: null },
        { name: "华南-深圳", rate: null },
        { name: "华东二", rate: null },
        { name: "华北-北京二", rate: null },
        { name: "欧洲-巴黎-OP1", rate: null },
        { name: "欧洲-法兰克福", rate: null },
        { name: "欧洲-伦敦", rate: null },
        { name: "欧洲-阿姆斯特丹", rate: null },
        { name: "欧洲-马德里", rate: null },
        { name: "俄罗斯-莫斯科", rate: null },
        { name: "土耳其-伊斯坦布尔", rate: null },
        { name: "中东-迪拜", rate: null },
        { name: "非洲-约翰内esburg", rate: null },
        { name: "非洲-开罗", rate: null },
        { name: "非洲-拉各斯", rate: null },
        { name: "亚太-雅加达", rate: null },
        { name: "亚太-新加坡", rate: null },
        { name: "亚太-东京", rate: null },
        { name: "亚太-悉尼", rate: null },
        { name: "亚太-首尔", rate: null },
        { name: "亚太-孟买", rate: null },
        { name: "亚太-曼谷", rate: null },
        { name: "亚太-马尼拉", rate: null },
        { name: "亚太-吉隆坡", rate: null },
        { name: "拉美-墨西哥城四", rate: null },
        { name: "拉美-圣保罗", rate: null },
        { name: "拉美-波哥大", rate: null },
        { name: "拉美-布宜诺斯艾利斯", rate: null },
        { name: "拉美-圣地亚哥", rate: null },
        { name: "北美-弗吉尼亚", rate: null },
        { name: "北美-硅谷", rate: null },
        { name: "北美-达拉斯", rate: null },
      ],
    },
  };
}

export function useRegionData() {
  const regionData = ref([]);
  const profitCount = ref(0);
  const lossCount = ref(0);
  const error = ref(null);
  /** operate 接口返回 403 时为 true，rate 显示为 "**" */
  const forbidden = ref(false);
  const rates = computed(() => regionData.value.map((r) => r.rate));

  async function fetchRegionStats(month) {
    error.value = null;
    forbidden.value = false;
    try {
      // TODO: 替换为真实接口，如 axios.get('/api/xxx/operate', { params: { month } })
      let res = await mockFetchOperate();

      if (res.status === 403) {
        forbidden.value = true;
        // TODO: 替换为真实接口，如 axios.get('/api/xxx/efficiency')
        res = await mockFetchEfficiency();
      }

      const rawList = res.data?.list ?? [];
      const matched = rawList.map(enrichRegionWithCoords).filter(Boolean);
      regionData.value = matched.map((r) => ({
        ...r,
        rate: r.rate != null ? Number((r.rate * 100).toFixed(2)) : null,
      }));
      profitCount.value = regionData.value.filter((r) => r.rate != null && r.rate >= 0).length;
      lossCount.value = regionData.value.filter((r) => r.rate != null && r.rate < 0).length;
      return { regionData: regionData.value, profitCount: profitCount.value, lossCount: lossCount.value };
    } catch (e) {
      error.value = e;
      regionData.value = [];
      profitCount.value = 0;
      lossCount.value = 0;
      return { regionData: [], profitCount: 0, lossCount: 0 };
    }
  }

  // isIframeCreated 或 月份 变化时自动重新请求
  const { date: currentMonth } = storeToRefs(useCurrentDate());
  watch(
    [isIframeCreated, currentMonth],
    ([iframeReady, month]) => {
      if (iframeReady) fetchRegionStats(month);
    },
    { immediate: true }
  );

  return {
    regionData,
    profitCount,
    lossCount,
    error,
    forbidden,
    rates,
    fetchRegionStats,
  };
}
