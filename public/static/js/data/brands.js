/* =====================================================================
   BRAND PROFILES  —  Chinese-market EV voice assistants
   Each entry: the real wake word the car's built-in assistant listens for.
   All data is local. No network calls anywhere in this file.
   ===================================================================== */

export const BRANDS = [
  // ---------- Most common in Cambodia ----------
  {
    id: 'byd', name: 'BYD', nameZh: '比亚迪', assistant: '小迪 (DiLink)',
    wake: '你好小迪', wakePy: 'Nǐ hǎo Xiǎo Dí', wakeKm: 'នី ហាវ ស៊ាវ ឌី',
    models: 'Atto 3, Seal, Dolphin, Song Plus, Sealion 6/7, Han, Tang, e2',
    color: '#0b4da2', popular: true
  },
  {
    id: 'geely', name: 'Geely', nameZh: '吉利', assistant: '吉利语音',
    wake: '你好吉利', wakePy: 'Nǐ hǎo Jí lì', wakeKm: 'នី ហាវ ជី លី',
    models: 'EX5, Geometry C/E, Galaxy E5, Coolray, Okavango, Starray',
    color: '#1a4b8c', popular: true
  },
  {
    id: 'xiaomi', name: 'Xiaomi', nameZh: '小米', assistant: '小爱同学 (XiaoAi)',
    wake: '小爱小爱', wakePy: 'Xiǎo ài Xiǎo ài', wakeKm: 'ស៊ាវ អាយ ស៊ាវ អាយ',
    models: 'SU7, SU7 Pro / Max, YU7',
    color: '#ff6900', popular: true
  },
  {
    id: 'wuling', name: 'Wuling', nameZh: '五菱', assistant: 'Ling OS',
    wake: '你好五菱', wakePy: 'Nǐ hǎo Wǔ líng', wakeKm: 'នី ហាវ វូ លីង',
    models: 'Air EV, Bingo, Mini EV, Cloud EV, Starlight',
    color: '#c8102e', popular: true
  },
  {
    id: 'gwm', name: 'GWM / Ora / Haval', nameZh: '长城', assistant: '哈弗智能',
    wake: '你好哈弗', wakePy: 'Nǐ hǎo Hā fú', wakeKm: 'នី ហាវ ហា ហ្វូ',
    models: 'Ora 03 / Good Cat, Haval H6 HEV, Jolion, Tank 300',
    color: '#004a97', popular: true
  },
  {
    id: 'chery', name: 'Chery / Omoda / Jaecoo', nameZh: '奇瑞', assistant: '小艺 / 雄狮',
    wake: '你好奇瑞', wakePy: 'Nǐ hǎo Qí ruì', wakeKm: 'នី ហាវ ឈី រ៉ុយ',
    models: 'Omoda 5 / E5, Jaecoo J7, Tiggo 8, Arrizo, eQ7',
    color: '#e2231a', popular: true
  },
  {
    id: 'zeekr', name: 'Zeekr', nameZh: '极氪', assistant: 'ZEEKR AI',
    wake: '你好极氪', wakePy: 'Nǐ hǎo Jí kè', wakeKm: 'នី ហាវ ជី ខឺ',
    models: '001, 007, X, 009, 7X',
    color: '#12100e', popular: true
  },
  {
    id: 'aion', name: 'GAC Aion', nameZh: '埃安', assistant: '小可',
    wake: '你好小可', wakePy: 'Nǐ hǎo Xiǎo kě', wakeKm: 'នី ហាវ ស៊ាវ ខឺ',
    models: 'Y Plus, S Plus, ES, V, Hyptec GT',
    color: '#00a0e9', popular: true
  },

  // ---------- Also sold / imported ----------
  {
    id: 'leapmotor', name: 'Leapmotor', nameZh: '零跑', assistant: '小雅',
    wake: '你好小雅', wakePy: 'Nǐ hǎo Xiǎo yǎ', wakeKm: 'នី ហាវ ស៊ាវ យ៉ា',
    models: 'C10, C11, T03, B10', color: '#0f3d8c'
  },
  {
    id: 'deepal', name: 'Deepal (Changan)', nameZh: '深蓝', assistant: '小安',
    wake: '你好小安', wakePy: 'Nǐ hǎo Xiǎo ān', wakeKm: 'នី ហាវ ស៊ាវ អាន',
    models: 'S07, SL03, S05, L07', color: '#1b6ca8'
  },
  {
    id: 'changan', name: 'Changan', nameZh: '长安', assistant: '小安',
    wake: '你好长安', wakePy: 'Nǐ hǎo Cháng ān', wakeKm: 'នី ហាវ ចាង អាន',
    models: 'CS55, CS75, Lumin, Eado', color: '#0058a3'
  },
  {
    id: 'neta', name: 'NETA', nameZh: '哪吒', assistant: '小You',
    wake: '你好小You', wakePy: 'Nǐ hǎo Xiǎo You', wakeKm: 'នី ហាវ ស៊ាវ យូ',
    models: 'V, U, S, GT, X', color: '#e60012'
  },
  {
    id: 'mg', name: 'MG / Roewe', nameZh: '名爵', assistant: '斑马 Banma',
    wake: '你好斑马', wakePy: 'Nǐ hǎo Bān mǎ', wakeKm: 'នី ហាវ បាន ម៉ា',
    models: 'MG4 EV, MG ZS EV, MG5, Marvel R', color: '#c8102e'
  },
  {
    id: 'xpeng', name: 'XPeng', nameZh: '小鹏', assistant: '小P',
    wake: '你好小P', wakePy: 'Nǐ hǎo Xiǎo P', wakeKm: 'នី ហាវ ស៊ាវ ភី',
    models: 'G6, P7, X9, G9, Mona M03', color: '#0aa5a5'
  },
  {
    id: 'nio', name: 'NIO', nameZh: '蔚来', assistant: 'NOMI',
    wake: 'Hey NOMI', wakePy: 'Hey NOMI', wakeKm: 'ហេ NOMI',
    models: 'ES6, ET5, EC6, ES8, ET7', color: '#00bfff'
  },
  {
    id: 'liauto', name: 'Li Auto', nameZh: '理想', assistant: '理想同学',
    wake: '理想同学', wakePy: 'Lǐ xiǎng tóng xué', wakeKm: 'លី ស្យាង តុង ស៊ុយ',
    models: 'L6, L7, L8, L9, Mega', color: '#0b6e4f'
  },
  {
    id: 'aito', name: 'AITO / Seres (HarmonyOS)', nameZh: '问界', assistant: '小艺 XiaoYi',
    wake: '小艺小艺', wakePy: 'Xiǎo yì Xiǎo yì', wakeKm: 'ស៊ាវ យី ស៊ាវ យី',
    models: 'M5, M7, M9', color: '#1a1a2e'
  },
  {
    id: 'jetour', name: 'Jetour', nameZh: '捷途', assistant: '捷途智联',
    wake: '你好捷途', wakePy: 'Nǐ hǎo Jié tú', wakeKm: 'នី ហាវ ជៀ តូ',
    models: 'X70, X90, Dashing, T2', color: '#b8860b'
  },
  {
    id: 'baojun', name: 'Baojun', nameZh: '宝骏', assistant: 'Ling OS',
    wake: '你好宝骏', wakePy: 'Nǐ hǎo Bǎo jùn', wakeKm: 'នី ហាវ បាវ ជុន',
    models: 'Yep, Cloud, KiWi EV', color: '#d4001a'
  },
  {
    id: 'hongqi', name: 'Hongqi', nameZh: '红旗', assistant: '你好红旗',
    wake: '你好红旗', wakePy: 'Nǐ hǎo Hóng qí', wakeKm: 'នី ហាវ ហុង ឈី',
    models: 'E-QM5, EH7, HS5, H9', color: '#a4161a'
  },
  {
    id: 'dongfeng', name: 'Dongfeng / Nammi', nameZh: '东风', assistant: '你好东风',
    wake: '你好东风', wakePy: 'Nǐ hǎo Dōng fēng', wakeKm: 'នី ហាវ ទុង ហ្វុង',
    models: 'Nammi 01, Box, Aeolus, Rich 6', color: '#00529b'
  },
  {
    id: 'jac', name: 'JAC', nameZh: '江淮', assistant: '你好江淮',
    wake: '你好江淮', wakePy: 'Nǐ hǎo Jiāng huái', wakeKm: 'នី ហាវ ជាង ហ្វាយ',
    models: 'iEV, E10X, JS4, T8', color: '#005baa'
  },
  {
    id: 'maxus', name: 'Maxus / LDV', nameZh: '大通', assistant: '你好大通',
    wake: '你好大通', wakePy: 'Nǐ hǎo Dà tōng', wakeKm: 'នី ហាវ តា ថុង',
    models: 'Mifa 9, T90, eDeliver', color: '#1c3f94'
  },
  {
    id: 'vwcn', name: 'VW ID (China)', nameZh: '大众', assistant: '你好大众',
    wake: '你好大众', wakePy: 'Nǐ hǎo Dà zhòng', wakeKm: 'នី ហាវ តា ចុង',
    models: 'ID.3, ID.4 Crozz, ID.6', color: '#001e50'
  },
  {
    id: 'generic', name: 'Other Chinese EV', nameZh: '通用', assistant: 'Generic',
    wake: '你好', wakePy: 'Nǐ hǎo', wakeKm: 'នី ហាវ',
    models: 'Works with most Chinese assistants', color: '#556070'
  }
];

export const getBrand = (id) => BRANDS.find(b => b.id === id) || BRANDS[0];
