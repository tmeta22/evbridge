/* =====================================================================
   COMMAND DATABASE — Chinese EV voice commands
   Fields:
     id       unique key
     cat      category id
     zh       Chinese command spoken TO the car  (this is what we speak)
     py       pinyin (romanised, for Khmer/English owners to read aloud)
     en       English meaning
     km       Khmer meaning
     kmr      Khmer romanised reading of the Chinese (how to pronounce zh)
     icon     emoji glyph
     keys     English trigger keywords for offline matching
     kkeys    Khmer trigger keywords for offline matching
     reply    what the car typically answers, {zh, en, km}
     slot     optional: 'number' | 'temp'  (command takes a value)
   No network. Pure data.
   ===================================================================== */

import { GEELY_CATEGORIES, GEELY_COMMANDS } from './geely.js';

export const CATEGORIES = [
  { id: 'climate',  en: 'Climate / AC',     km: 'ត្រជាក់ / ម៉ាស៊ីនត្រជាក់', zh: '空调', icon: '❄️', color: '#0ea5e9' },
  { id: 'window',   en: 'Windows & Roof',   km: 'កញ្ចក់ និងដំបូល',        zh: '车窗', icon: '🪟', color: '#8b5cf6' },
  { id: 'light',    en: 'Lights',           km: 'ភ្លើង',                  zh: '灯光', icon: '💡', color: '#f59e0b' },
  { id: 'media',    en: 'Music & Media',    km: 'តន្ត្រី និងមេឌៀ',        zh: '音乐', icon: '🎵', color: '#ec4899' },
  { id: 'nav',      en: 'Navigation',       km: 'ការណែនាំផ្លូវ',          zh: '导航', icon: '🧭', color: '#10b981' },
  { id: 'seat',     en: 'Seats & Mirrors',  km: 'កៅអី និងកញ្ចក់',        zh: '座椅', icon: '💺', color: '#f97316' },
  { id: 'drive',    en: 'Driving & Battery',km: 'ការបើកបរ និងថ្ម',       zh: '驾驶', icon: '🔋', color: '#22c55e' },
  { id: 'door',     en: 'Doors & Trunk',    km: 'ទ្វារ និងឆាកក្រោយ',     zh: '车门', icon: '🚪', color: '#64748b' },
  { id: 'phone',    en: 'Phone & Screen',   km: 'ទូរស័ព្ទ និងអេក្រង់',   zh: '电话', icon: '📱', color: '#6366f1' },
  { id: 'info',     en: 'Ask the Car',      km: 'សួរឡាន',                zh: '询问', icon: '❓', color: '#14b8a6' },
  { id: 'wiper',    en: 'Wipers & Defog',   km: 'ជូតកញ្ចក់',             zh: '雨刷', icon: '🌧️', color: '#0891b2' },
  { id: 'safety',   en: 'Safety & Cameras', km: 'សុវត្ថិភាព',            zh: '安全', icon: '🛡️', color: '#dc2626' }
];

const GENERIC_COMMANDS = [
  /* ================= CLIMATE ================= */
  { id:'ac_on', cat:'climate', zh:'打开空调', py:'Dǎ kāi kōng tiáo', kmr:'តា ខាយ ឃុង ធាវ',
    en:'Turn on the air conditioner', km:'បើកម៉ាស៊ីនត្រជាក់', icon:'❄️',
    keys:['turn on ac','open ac','air con on','aircon on','ac on','cool the car','turn on air'],
    kkeys:['បើកម៉ាស៊ីនត្រជាក់','បើកអេស៊ី','បើកត្រជាក់','បើកAC'],
    reply:{zh:'空调已打开', en:'Air conditioning is on', km:'ម៉ាស៊ីនត្រជាក់បានបើក'} },

  { id:'ac_off', cat:'climate', zh:'关闭空调', py:'Guān bì kōng tiáo', kmr:'ក្វាន ពី ឃុង ធាវ',
    en:'Turn off the air conditioner', km:'បិទម៉ាស៊ីនត្រជាក់', icon:'🚫',
    keys:['turn off ac','close ac','aircon off','ac off','stop air'],
    kkeys:['បិទម៉ាស៊ីនត្រជាក់','បិទអេស៊ី','បិទត្រជាក់'],
    reply:{zh:'空调已关闭', en:'Air conditioning is off', km:'ម៉ាស៊ីនត្រជាក់បានបិទ'} },

  { id:'temp_set', cat:'climate', zh:'温度调到{n}度', py:'Wēn dù tiáo dào {n} dù', kmr:'វុន ទូ ធាវ តាវ {n} ទូ',
    en:'Set temperature to {n}°C', km:'កំណត់សីតុណ្ហភាព {n} អង្សា', icon:'🌡️', slot:'temp',
    keys:['set temperature','temperature to','set temp','degrees'],
    kkeys:['កំណត់សីតុណ្ហភាព','សីតុណ្ហភាព','អង្សា'],
    reply:{zh:'温度已调到{n}度', en:'Temperature set to {n}°C', km:'សីតុណ្ហភាពកំណត់ {n} អង្សា'} },

  { id:'temp_down', cat:'climate', zh:'温度低一点', py:'Wēn dù dī yī diǎn', kmr:'វុន ទូ ទី យី ទាន',
    en:'Make it cooler', km:'ធ្វើឲ្យត្រជាក់ជាងនេះ', icon:'🥶',
    keys:['cooler','colder','too hot','lower temperature','more cold','reduce temperature'],
    kkeys:['ត្រជាក់ជាង','ក្តៅពេក','បន្ថយសីតុណ្ហភាព','ត្រជាក់បន្ថែម'],
    reply:{zh:'已降低温度', en:'Temperature lowered', km:'បានបន្ថយសីតុណ្ហភាព'} },

  { id:'temp_up', cat:'climate', zh:'温度高一点', py:'Wēn dù gāo yī diǎn', kmr:'វុន ទូ កាវ យី ទាន',
    en:'Make it warmer', km:'ធ្វើឲ្យក្តៅជាងនេះ', icon:'🔥',
    keys:['warmer','hotter','too cold','raise temperature','increase temperature'],
    kkeys:['ក្តៅជាង','ត្រជាក់ពេក','បង្កើនសីតុណ្ហភាព'],
    reply:{zh:'已提高温度', en:'Temperature raised', km:'បានបង្កើនសីតុណ្ហភាព'} },

  { id:'fan_up', cat:'climate', zh:'风量大一点', py:'Fēng liàng dà yī diǎn', kmr:'ហ្វុង លាង តា យី ទាន',
    en:'Increase fan speed', km:'បង្កើនកម្លាំងខ្យល់', icon:'🌀',
    keys:['fan higher','more wind','increase fan','fan up','stronger air','more air'],
    kkeys:['បង្កើនខ្យល់','ខ្យល់ខ្លាំង','ខ្យល់បន្ថែម'],
    reply:{zh:'风量已加大', en:'Fan speed increased', km:'កម្លាំងខ្យល់បានបង្កើន'} },

  { id:'fan_down', cat:'climate', zh:'风量小一点', py:'Fēng liàng xiǎo yī diǎn', kmr:'ហ្វុង លាង ស៊ាវ យី ទាន',
    en:'Decrease fan speed', km:'បន្ថយកម្លាំងខ្យល់', icon:'🍃',
    keys:['fan lower','less wind','decrease fan','fan down','weaker air','too windy'],
    kkeys:['បន្ថយខ្យល់','ខ្យល់តិច','ខ្យល់ខ្លាំងពេក'],
    reply:{zh:'风量已减小', en:'Fan speed decreased', km:'កម្លាំងខ្យល់បានបន្ថយ'} },

  { id:'ac_recirc', cat:'climate', zh:'打开内循环', py:'Dǎ kāi nèi xún huán', kmr:'តា ខាយ នី ស៊ុន ហ្វាន',
    en:'Turn on air recirculation', km:'បើករំកិលខ្យល់ក្នុង', icon:'🔄',
    keys:['recirculation','recirculate','inside air','internal circulation','block outside air'],
    kkeys:['រំកិលខ្យល់ក្នុង','ខ្យល់ក្នុង','បិទខ្យល់ក្រៅ'],
    reply:{zh:'内循环已开启', en:'Recirculation on', km:'រំកិលខ្យល់ក្នុងបានបើក'} },

  { id:'ac_fresh', cat:'climate', zh:'打开外循环', py:'Dǎ kāi wài xún huán', kmr:'តា ខាយ វ៉ាយ ស៊ុន ហ្វាន',
    en:'Bring in fresh outside air', km:'បញ្ចូលខ្យល់ក្រៅ', icon:'🌬️',
    keys:['fresh air','outside air','external circulation','let air in'],
    kkeys:['ខ្យល់ក្រៅ','ខ្យល់ស្រស់','បញ្ចូលខ្យល់'],
    reply:{zh:'外循环已开启', en:'Fresh air mode on', km:'ខ្យល់ក្រៅបានបើក'} },

  { id:'ac_auto', cat:'climate', zh:'空调自动模式', py:'Kōng tiáo zì dòng mó shì', kmr:'ឃុង ធាវ ជឺ ទុង ម៉ូ ស៊ឺ',
    en:'Set AC to auto mode', km:'ដាក់ម៉ាស៊ីនត្រជាក់ស្វ័យប្រវត្តិ', icon:'🅰️',
    keys:['auto ac','ac auto','automatic climate','auto climate'],
    kkeys:['ស្វ័យប្រវត្តិ','អូតូ'],
    reply:{zh:'已切换到自动模式', en:'Auto mode enabled', km:'បានប្តូរទៅស្វ័យប្រវត្តិ'} },

  { id:'ac_face', cat:'climate', zh:'风吹脸部', py:'Fēng chuī liǎn bù', kmr:'ហ្វុង ឈ្វី លាន ពូ',
    en:'Blow air to my face', km:'ផ្លុំខ្យល់ទៅមុខ', icon:'😮‍💨',
    keys:['air to face','blow face','face vents','air on my face'],
    kkeys:['ខ្យល់ទៅមុខ','ផ្លុំមុខ'],
    reply:{zh:'已调整为吹面模式', en:'Face vents selected', km:'បានប្តូរទៅផ្លុំមុខ'} },

  { id:'ac_feet', cat:'climate', zh:'风吹脚部', py:'Fēng chuī jiǎo bù', kmr:'ហ្វុង ឈ្វី ជាវ ពូ',
    en:'Blow air to my feet', km:'ផ្លុំខ្យល់ទៅជើង', icon:'🦶',
    keys:['air to feet','blow feet','foot vents','air on my feet'],
    kkeys:['ខ្យល់ទៅជើង','ផ្លុំជើង'],
    reply:{zh:'已调整为吹脚模式', en:'Foot vents selected', km:'បានប្តូរទៅផ្លុំជើង'} },

  { id:'ac_purify', cat:'climate', zh:'打开空气净化', py:'Dǎ kāi kōng qì jìng huà', kmr:'តា ខាយ ឃុង ឈី ជីង ហ្វា',
    en:'Turn on air purifier', km:'បើកម៉ាស៊ីនបំបាត់ធូលី', icon:'🫧',
    keys:['air purifier','purify air','clean air','pm2.5','filter air'],
    kkeys:['បំបាត់ធូលី','សំអាតខ្យល់','ចម្រោះខ្យល់'],
    reply:{zh:'空气净化已开启', en:'Air purifier on', km:'ម៉ាស៊ីនបំបាត់ធូលីបានបើក'} },

  /* ================= WINDOWS ================= */
  { id:'win_open_all', cat:'window', zh:'打开所有车窗', py:'Dǎ kāi suǒ yǒu chē chuāng', kmr:'តា ខាយ សួ យូ ឈឺ ឈ្វាង',
    en:'Open all windows', km:'បើកកញ្ចក់ទាំងអស់', icon:'🪟',
    keys:['open all windows','open windows','all windows down','windows down'],
    kkeys:['បើកកញ្ចក់ទាំងអស់','បើកកញ្ចក់','ចុះកញ្ចក់'],
    reply:{zh:'所有车窗已打开', en:'All windows open', km:'កញ្ចក់ទាំងអស់បានបើក'} },

  { id:'win_close_all', cat:'window', zh:'关闭所有车窗', py:'Guān bì suǒ yǒu chē chuāng', kmr:'ក្វាន ពី សួ យូ ឈឺ ឈ្វាង',
    en:'Close all windows', km:'បិទកញ្ចក់ទាំងអស់', icon:'🔒',
    keys:['close all windows','close windows','all windows up','windows up','shut windows'],
    kkeys:['បិទកញ្ចក់ទាំងអស់','បិទកញ្ចក់','ឡើងកញ្ចក់'],
    reply:{zh:'所有车窗已关闭', en:'All windows closed', km:'កញ្ចក់ទាំងអស់បានបិទ'} },

  { id:'win_driver_open', cat:'window', zh:'打开主驾车窗', py:'Dǎ kāi zhǔ jià chē chuāng', kmr:'តា ខាយ ជូ ជា ឈឺ ឈ្វាង',
    en:"Open driver's window", km:'បើកកញ្ចក់អ្នកបើកបរ', icon:'🚗',
    keys:["driver window open","open driver window","my window open","open my window"],
    kkeys:['បើកកញ្ចក់អ្នកបើកបរ','បើកកញ្ចក់ខ្ញុំ'],
    reply:{zh:'主驾车窗已打开', en:"Driver's window open", km:'កញ្ចក់អ្នកបើកបរបានបើក'} },

  { id:'win_pass_open', cat:'window', zh:'打开副驾车窗', py:'Dǎ kāi fù jià chē chuāng', kmr:'តា ខាយ ហ្វូ ជា ឈឺ ឈ្វាង',
    en:"Open passenger window", km:'បើកកញ្ចក់អ្នកអង្គុយ', icon:'💁',
    keys:['passenger window','open passenger window','front passenger window'],
    kkeys:['បើកកញ្ចក់អ្នកអង្គុយ','កញ្ចក់ខាងឆ្វេង'],
    reply:{zh:'副驾车窗已打开', en:'Passenger window open', km:'កញ្ចក់អ្នកអង្គុយបានបើក'} },

  { id:'win_rear_open', cat:'window', zh:'打开后排车窗', py:'Dǎ kāi hòu pái chē chuāng', kmr:'តា ខាយ ហូ ផាយ ឈឺ ឈ្វាង',
    en:'Open rear windows', km:'បើកកញ្ចក់ខាងក្រោយ', icon:'🔙',
    keys:['rear windows','back windows','open rear window','open back window'],
    kkeys:['កញ្ចក់ខាងក្រោយ','បើកកញ្ចក់ក្រោយ'],
    reply:{zh:'后排车窗已打开', en:'Rear windows open', km:'កញ្ចក់ខាងក្រោយបានបើក'} },

  { id:'win_half', cat:'window', zh:'车窗开一半', py:'Chē chuāng kāi yī bàn', kmr:'ឈឺ ឈ្វាង ខាយ យី ប៉ាន',
    en:'Open windows halfway', km:'បើកកញ្ចក់ពាក់កណ្តាល', icon:'↕️',
    keys:['half open window','window halfway','open window a little','crack window'],
    kkeys:['ពាក់កណ្តាល','បើកបន្តិច'],
    reply:{zh:'车窗已开一半', en:'Windows half open', km:'កញ្ចក់បើកពាក់កណ្តាល'} },

  { id:'roof_open', cat:'window', zh:'打开天窗', py:'Dǎ kāi tiān chuāng', kmr:'តា ខាយ ធាន ឈ្វាង',
    en:'Open the sunroof', km:'បើកដំបូលកញ្ចក់', icon:'🌤️',
    keys:['open sunroof','sunroof open','open roof','moonroof open'],
    kkeys:['បើកដំបូល','បើកដំបូលកញ្ចក់'],
    reply:{zh:'天窗已打开', en:'Sunroof open', km:'ដំបូលកញ្ចក់បានបើក'} },

  { id:'roof_close', cat:'window', zh:'关闭天窗', py:'Guān bì tiān chuāng', kmr:'ក្វាន ពី ធាន ឈ្វាង',
    en:'Close the sunroof', km:'បិទដំបូលកញ្ចក់', icon:'🌥️',
    keys:['close sunroof','sunroof close','close roof','shut sunroof'],
    kkeys:['បិទដំបូល','បិទដំបូលកញ្ចក់'],
    reply:{zh:'天窗已关闭', en:'Sunroof closed', km:'ដំបូលកញ្ចក់បានបិទ'} },

  { id:'shade_open', cat:'window', zh:'打开遮阳帘', py:'Dǎ kāi zhē yáng lián', kmr:'តា ខាយ ចឺ យាង លាន',
    en:'Open the sunshade', km:'បើករនាំងបាំងថ្ងៃ', icon:'🏖️',
    keys:['sunshade open','open sun shade','open blind','open curtain'],
    kkeys:['រនាំងបាំងថ្ងៃ','បើករនាំង'],
    reply:{zh:'遮阳帘已打开', en:'Sunshade open', km:'រនាំងបាំងថ្ងៃបានបើក'} },

  { id:'shade_close', cat:'window', zh:'关闭遮阳帘', py:'Guān bì zhē yáng lián', kmr:'ក្វាន ពី ចឺ យាង លាន',
    en:'Close the sunshade', km:'បិទរនាំងបាំងថ្ងៃ', icon:'🌑',
    keys:['sunshade close','close sun shade','close blind','close curtain','too much sun'],
    kkeys:['បិទរនាំង','ថ្ងៃក្តៅពេក'],
    reply:{zh:'遮阳帘已关闭', en:'Sunshade closed', km:'រនាំងបាំងថ្ងៃបានបិទ'} },

  /* ================= LIGHTS ================= */
  { id:'light_on', cat:'light', zh:'打开车灯', py:'Dǎ kāi chē dēng', kmr:'តា ខាយ ឈឺ តឹង',
    en:'Turn on the headlights', km:'បើកភ្លើងឡាន', icon:'💡',
    keys:['turn on lights','headlights on','lights on','open lights'],
    kkeys:['បើកភ្លើង','បើកភ្លើងឡាន','បើកភ្លើងមុខ'],
    reply:{zh:'车灯已打开', en:'Headlights on', km:'ភ្លើងឡានបានបើក'} },

  { id:'light_off', cat:'light', zh:'关闭车灯', py:'Guān bì chē dēng', kmr:'ក្វាន ពី ឈឺ តឹង',
    en:'Turn off the headlights', km:'បិទភ្លើងឡាន', icon:'🌙',
    keys:['turn off lights','headlights off','lights off','close lights'],
    kkeys:['បិទភ្លើង','បិទភ្លើងឡាន'],
    reply:{zh:'车灯已关闭', en:'Headlights off', km:'ភ្លើងឡានបានបិទ'} },

  { id:'light_high', cat:'light', zh:'打开远光灯', py:'Dǎ kāi yuǎn guāng dēng', kmr:'តា ខាយ យ័ន ក្វាង តឹង',
    en:'Turn on high beams', km:'បើកភ្លើងឆ្លង', icon:'🔆',
    keys:['high beam','high beams','bright lights','full beam'],
    kkeys:['ភ្លើងឆ្លង','ភ្លើងខ្ពស់'],
    reply:{zh:'远光灯已打开', en:'High beams on', km:'ភ្លើងឆ្លងបានបើក'} },

  { id:'light_low', cat:'light', zh:'打开近光灯', py:'Dǎ kāi jìn guāng dēng', kmr:'តា ខាយ ជីន ក្វាង តឹង',
    en:'Turn on low beams', km:'បើកភ្លើងទាប', icon:'🔅',
    keys:['low beam','low beams','dipped beam','normal lights'],
    kkeys:['ភ្លើងទាប','ភ្លើងធម្មតា'],
    reply:{zh:'近光灯已打开', en:'Low beams on', km:'ភ្លើងទាបបានបើក'} },

  { id:'light_fog', cat:'light', zh:'打开雾灯', py:'Dǎ kāi wù dēng', kmr:'តា ខាយ វូ តឹង',
    en:'Turn on fog lights', km:'បើកភ្លើងអ័ព្ទ', icon:'🌫️',
    keys:['fog lights','fog light on','foglamps'],
    kkeys:['ភ្លើងអ័ព្ទ','ភ្លើងអ័ព្ទបើក'],
    reply:{zh:'雾灯已打开', en:'Fog lights on', km:'ភ្លើងអ័ព្ទបានបើក'} },

  { id:'light_hazard', cat:'light', zh:'打开双闪', py:'Dǎ kāi shuāng shǎn', kmr:'តា ខាយ ស្វាង សាន',
    en:'Turn on hazard lights', km:'បើកភ្លើងបញ្ចាំងគ្រោះថ្នាក់', icon:'⚠️',
    keys:['hazard lights','emergency lights','double flash','warning lights','blinkers'],
    kkeys:['ភ្លើងគ្រោះថ្នាក់','ភ្លើងបញ្ចាំង','ភ្លើងពន្លឺទាំងសង្ខាង'],
    reply:{zh:'双闪已打开', en:'Hazard lights on', km:'ភ្លើងគ្រោះថ្នាក់បានបើក'} },

  { id:'light_cabin', cat:'light', zh:'打开车内阅读灯', py:'Dǎ kāi chē nèi yuè dú dēng', kmr:'តា ខាយ ឈឺ នី យ៊ុយ ទូ តឹង',
    en:'Turn on the interior reading light', km:'បើកភ្លើងក្នុងឡាន', icon:'🔦',
    keys:['interior light','cabin light','reading light','dome light','inside light'],
    kkeys:['ភ្លើងក្នុងឡាន','ភ្លើងអាន','ភ្លើងខាងក្នុង'],
    reply:{zh:'阅读灯已打开', en:'Reading light on', km:'ភ្លើងក្នុងឡានបានបើក'} },

  { id:'light_ambient', cat:'light', zh:'打开氛围灯', py:'Dǎ kāi fēn wéi dēng', kmr:'តា ខាយ ហ្វឹន វ៉ី តឹង',
    en:'Turn on the ambient lighting', km:'បើកភ្លើងតុបតែង', icon:'🌈',
    keys:['ambient light','mood light','atmosphere light','ambient lighting'],
    kkeys:['ភ្លើងតុបតែង','ភ្លើងបរិយាកាស','ភ្លើងពណ៌'],
    reply:{zh:'氛围灯已打开', en:'Ambient lighting on', km:'ភ្លើងតុបតែងបានបើក'} },

  { id:'light_ambient_color', cat:'light', zh:'氛围灯调成蓝色', py:'Fēn wéi dēng tiáo chéng lán sè', kmr:'ហ្វឹន វ៉ី តឹង ធាវ ឆឹង លាន សឺ',
    en:'Change ambient light to blue', km:'ប្តូរភ្លើងតុបតែងទៅពណ៌ខៀវ', icon:'🔵',
    keys:['ambient blue','change light color','light color blue','blue light'],
    kkeys:['ភ្លើងពណ៌ខៀវ','ប្តូរពណ៌ភ្លើង'],
    reply:{zh:'氛围灯已调成蓝色', en:'Ambient light is blue', km:'ភ្លើងតុបតែងជាពណ៌ខៀវ'} },

  /* ================= MEDIA ================= */
  { id:'music_play', cat:'media', zh:'播放音乐', py:'Bō fàng yīn yuè', kmr:'ប៉ូ ហ្វាង យីន យ៊ុយ',
    en:'Play music', km:'លេងតន្ត្រី', icon:'▶️',
    keys:['play music','play song','start music','music on','play some music'],
    kkeys:['លេងតន្ត្រី','បើកតន្ត្រី','បើកចម្រៀង','លេងចម្រៀង'],
    reply:{zh:'开始播放音乐', en:'Playing music', km:'កំពុងលេងតន្ត្រី'} },

  { id:'music_pause', cat:'media', zh:'暂停音乐', py:'Zàn tíng yīn yuè', kmr:'ចាន ធីង យីន យ៊ុយ',
    en:'Pause the music', km:'ផ្អាកតន្ត្រី', icon:'⏸️',
    keys:['pause music','stop music','pause song','music off','stop the song'],
    kkeys:['ផ្អាកតន្ត្រី','បិទតន្ត្រី','ឈប់ចម្រៀង'],
    reply:{zh:'音乐已暂停', en:'Music paused', km:'តន្ត្រីបានផ្អាក'} },

  { id:'music_next', cat:'media', zh:'下一首', py:'Xià yī shǒu', kmr:'ស្យា យី សូ',
    en:'Next song', km:'ចម្រៀងបន្ទាប់', icon:'⏭️',
    keys:['next song','next track','skip song','next','skip'],
    kkeys:['ចម្រៀងបន្ទាប់','បន្ទាប់','រំលង'],
    reply:{zh:'已切换到下一首', en:'Playing next song', km:'លេងចម្រៀងបន្ទាប់'} },

  { id:'music_prev', cat:'media', zh:'上一首', py:'Shàng yī shǒu', kmr:'សាង យី សូ',
    en:'Previous song', km:'ចម្រៀងមុន', icon:'⏮️',
    keys:['previous song','last song','go back song','previous track','back'],
    kkeys:['ចម្រៀងមុន','ថយក្រោយ','មុន'],
    reply:{zh:'已切换到上一首', en:'Playing previous song', km:'លេងចម្រៀងមុន'} },

  { id:'vol_up', cat:'media', zh:'声音大一点', py:'Shēng yīn dà yī diǎn', kmr:'សឹង យីន តា យី ទាន',
    en:'Turn the volume up', km:'បង្កើនសំឡេង', icon:'🔊',
    keys:['volume up','louder','increase volume','turn it up','too quiet'],
    kkeys:['បង្កើនសំឡេង','សំឡេងខ្លាំង','ធំសំឡេង'],
    reply:{zh:'音量已调大', en:'Volume increased', km:'សំឡេងបានបង្កើន'} },

  { id:'vol_down', cat:'media', zh:'声音小一点', py:'Shēng yīn xiǎo yī diǎn', kmr:'សឹង យីន ស៊ាវ យី ទាន',
    en:'Turn the volume down', km:'បន្ថយសំឡេង', icon:'🔉',
    keys:['volume down','quieter','decrease volume','turn it down','too loud'],
    kkeys:['បន្ថយសំឡេង','សំឡេងតូច','សំឡេងខ្លាំងពេក'],
    reply:{zh:'音量已调小', en:'Volume decreased', km:'សំឡេងបានបន្ថយ'} },

  { id:'vol_set', cat:'media', zh:'音量调到{n}', py:'Yīn liàng tiáo dào {n}', kmr:'យីន លាង ធាវ តាវ {n}',
    en:'Set volume to {n}', km:'កំណត់សំឡេង {n}', icon:'🎚️', slot:'number',
    keys:['set volume','volume to','volume level'],
    kkeys:['កំណត់សំឡេង','សំឡេងកម្រិត'],
    reply:{zh:'音量已调到{n}', en:'Volume set to {n}', km:'សំឡេងកំណត់ {n}'} },

  { id:'mute', cat:'media', zh:'静音', py:'Jìng yīn', kmr:'ជីង យីន',
    en:'Mute', km:'បិទសំឡេង', icon:'🔇',
    keys:['mute','silence','be quiet','no sound','shut up'],
    kkeys:['បិទសំឡេង','ស្ងាត់','គ្មានសំឡេង'],
    reply:{zh:'已静音', en:'Muted', km:'បានបិទសំឡេង'} },

  { id:'radio_on', cat:'media', zh:'打开收音机', py:'Dǎ kāi shōu yīn jī', kmr:'តា ខាយ សូ យីន ជី',
    en:'Turn on the radio', km:'បើករ៉ាដ្យូ', icon:'📻',
    keys:['radio on','turn on radio','open radio','fm radio'],
    kkeys:['បើករ៉ាដ្យូ','រ៉ាដ្យូ'],
    reply:{zh:'收音机已打开', en:'Radio on', km:'រ៉ាដ្យូបានបើក'} },

  { id:'bluetooth_music', cat:'media', zh:'播放蓝牙音乐', py:'Bō fàng lán yá yīn yuè', kmr:'ប៉ូ ហ្វាង លាន យា យីន យ៊ុយ',
    en:'Play music from Bluetooth', km:'លេងតន្ត្រីពីប៊្លូធូស', icon:'🔵',
    keys:['bluetooth music','play from phone','play bluetooth','phone music'],
    kkeys:['តន្ត្រីប៊្លូធូស','លេងពីទូរស័ព្ទ'],
    reply:{zh:'正在播放蓝牙音乐', en:'Playing Bluetooth music', km:'កំពុងលេងតន្ត្រីប៊្លូធូស'} },

  { id:'music_repeat', cat:'media', zh:'单曲循环', py:'Dān qǔ xún huán', kmr:'តាន ឈូ ស៊ុន ហ្វាន',
    en:'Repeat this song', km:'លេងចម្រៀងនេះឡើងវិញ', icon:'🔁',
    keys:['repeat song','loop song','play again','repeat'],
    kkeys:['លេងឡើងវិញ','ចម្រៀងដូចគ្នា'],
    reply:{zh:'已开启单曲循环', en:'Repeating this song', km:'លេងចម្រៀងនេះឡើងវិញ'} },

  /* ================= NAVIGATION ================= */
  { id:'nav_home', cat:'nav', zh:'导航回家', py:'Dǎo háng huí jiā', kmr:'តាវ ហាង ហ្វុយ ជា',
    en:'Navigate home', km:'ណែនាំផ្លូវទៅផ្ទះ', icon:'🏠',
    keys:['navigate home','go home','take me home','directions home','drive home'],
    kkeys:['ទៅផ្ទះ','ណែនាំទៅផ្ទះ','ផ្លូវទៅផ្ទះ'],
    reply:{zh:'正在导航回家', en:'Navigating home', km:'កំពុងណែនាំផ្លូវទៅផ្ទះ'} },

  { id:'nav_work', cat:'nav', zh:'导航去公司', py:'Dǎo háng qù gōng sī', kmr:'តាវ ហាង ឈូ គុង ស៊ី',
    en:'Navigate to work', km:'ណែនាំផ្លូវទៅកន្លែងធ្វើការ', icon:'🏢',
    keys:['navigate to work','go to office','take me to work','directions to office'],
    kkeys:['ទៅកន្លែងធ្វើការ','ទៅការិយាល័យ','ទៅរោងចក្រ'],
    reply:{zh:'正在导航去公司', en:'Navigating to work', km:'កំពុងណែនាំទៅកន្លែងធ្វើការ'} },

  { id:'nav_stop', cat:'nav', zh:'取消导航', py:'Qǔ xiāo dǎo háng', kmr:'ឈូ ស្យាវ តាវ ហាង',
    en:'Cancel navigation', km:'បោះបង់ការណែនាំផ្លូវ', icon:'❌',
    keys:['cancel navigation','stop navigation','end navigation','exit navigation'],
    kkeys:['បោះបង់ការណែនាំ','ឈប់ណែនាំផ្លូវ','បិទផែនទី'],
    reply:{zh:'导航已取消', en:'Navigation cancelled', km:'ការណែនាំផ្លូវបានបោះបង់'} },

  { id:'nav_gas', cat:'nav', zh:'附近的充电站', py:'Fù jìn de chōng diàn zhàn', kmr:'ហ្វូ ជីន តឺ ឈុង ទាន ចាន',
    en:'Find a charging station nearby', km:'រកស្ថានីយ៍បញ្ចូលថ្មនៅជិត', icon:'⚡',
    keys:['charging station','find charger','nearest charger','ev charger','charge point'],
    kkeys:['ស្ថានីយ៍បញ្ចូលថ្ម','រកកន្លែងសាកថ្ម','កន្លែងសាកភ្លើង'],
    reply:{zh:'正在搜索附近充电站', en:'Searching nearby charging stations', km:'កំពុងស្វែងរកស្ថានីយ៍បញ្ចូលថ្ម'} },

  { id:'nav_food', cat:'nav', zh:'附近的餐厅', py:'Fù jìn de cān tīng', kmr:'ហ្វូ ជីន តឺ ចាន ធីង',
    en:'Find a restaurant nearby', km:'រកភោជនីយដ្ឋាននៅជិត', icon:'🍜',
    keys:['restaurant nearby','find food','where to eat','nearest restaurant','hungry'],
    kkeys:['ភោជនីយដ្ឋាន','រកអាហារ','កន្លែងបាយ','ឃ្លាន'],
    reply:{zh:'正在搜索附近餐厅', en:'Searching nearby restaurants', km:'កំពុងស្វែងរកភោជនីយដ្ឋាន'} },

  { id:'nav_parking', cat:'nav', zh:'附近的停车场', py:'Fù jìn de tíng chē chǎng', kmr:'ហ្វូ ជីន តឺ ធីង ឈឺ ចាង',
    en:'Find parking nearby', km:'រកកន្លែងចតឡាននៅជិត', icon:'🅿️',
    keys:['parking nearby','find parking','car park','where to park'],
    kkeys:['កន្លែងចតឡាន','រកកន្លែងចត'],
    reply:{zh:'正在搜索附近停车场', en:'Searching nearby parking', km:'កំពុងស្វែងរកកន្លែងចត'} },

  { id:'nav_hospital', cat:'nav', zh:'附近的医院', py:'Fù jìn de yī yuàn', kmr:'ហ្វូ ជីន តឺ យី យ័ន',
    en:'Find a hospital nearby', km:'រកមន្ទីរពេទ្យនៅជិត', icon:'🏥',
    keys:['hospital nearby','find hospital','nearest hospital','emergency room','clinic'],
    kkeys:['មន្ទីរពេទ្យ','រកមន្ទីរពេទ្យ','គ្លីនិក'],
    reply:{zh:'正在搜索附近医院', en:'Searching nearby hospitals', km:'កំពុងស្វែងរកមន្ទីរពេទ្យ'} },

  { id:'nav_route', cat:'nav', zh:'还有多久到', py:'Hái yǒu duō jiǔ dào', kmr:'ហាយ យូ ទួ ជីវ តាវ',
    en:'How long until we arrive?', km:'តើនៅប៉ុន្មានទៀតដល់?', icon:'⏱️',
    keys:['how long','eta','arrival time','how far','time remaining','when arrive'],
    kkeys:['ប៉ុន្មានទៀតដល់','នៅឆ្ងាយប៉ុណ្ណា','ពេលណាដល់'],
    reply:{zh:'预计还有25分钟到达', en:'About 25 minutes remaining', km:'នៅប្រហែល ២៥ នាទីទៀត'} },

  { id:'nav_traffic', cat:'nav', zh:'路况怎么样', py:'Lù kuàng zěn me yàng', kmr:'លូ ក្វាង ចឹន មឺ យាង',
    en:'How is the traffic?', km:'ស្ថានភាពចរាចរណ៍យ៉ាងណា?', icon:'🚦',
    keys:['traffic','traffic condition','is there traffic','road condition','jam'],
    kkeys:['ចរាចរណ៍','ស្ថានភាពផ្លូវ','ការកកស្ទះ'],
    reply:{zh:'前方路况通畅', en:'Traffic ahead is clear', km:'ចរាចរណ៍ខាងមុខរលូន'} },

  { id:'nav_avoid_toll', cat:'nav', zh:'避开收费路段', py:'Bì kāi shōu fèi lù duàn', kmr:'ពី ខាយ សូ ហ្វី លូ ទាន',
    en:'Avoid toll roads', km:'គេចផ្លូវបង់ថ្លៃ', icon:'🚧',
    keys:['avoid toll','no toll road','avoid highway fee'],
    kkeys:['គេចផ្លូវបង់ថ្លៃ','កុំទៅផ្លូវបង់ថ្លៃ'],
    reply:{zh:'已设置避开收费路段', en:'Avoiding toll roads', km:'បានកំណត់គេចផ្លូវបង់ថ្លៃ'} },

  /* ================= SEATS & MIRRORS ================= */
  { id:'seat_heat_on', cat:'seat', zh:'打开座椅加热', py:'Dǎ kāi zuò yǐ jiā rè', kmr:'តា ខាយ ចួ យី ជា រឺ',
    en:'Turn on seat heating', km:'បើកកៅអីកម្តៅ', icon:'🔥',
    keys:['seat heater','heat seat','warm seat','seat heating on'],
    kkeys:['កៅអីកម្តៅ','បើកកម្តៅកៅអី'],
    reply:{zh:'座椅加热已打开', en:'Seat heating on', km:'កៅអីកម្តៅបានបើក'} },

  { id:'seat_vent_on', cat:'seat', zh:'打开座椅通风', py:'Dǎ kāi zuò yǐ tōng fēng', kmr:'តា ខាយ ចួ យី ថុង ហ្វុង',
    en:'Turn on seat ventilation', km:'បើកកៅអីខ្យល់', icon:'💨',
    keys:['seat ventilation','cool seat','seat fan','ventilated seat','seat cooling'],
    kkeys:['កៅអីខ្យល់','កៅអីត្រជាក់','ខ្យល់កៅអី'],
    reply:{zh:'座椅通风已打开', en:'Seat ventilation on', km:'កៅអីខ្យល់បានបើក'} },

  { id:'seat_massage', cat:'seat', zh:'打开座椅按摩', py:'Dǎ kāi zuò yǐ àn mó', kmr:'តា ខាយ ចួ យី អាន ម៉ូ',
    en:'Turn on seat massage', km:'បើកកៅអីម៉ាស្សា', icon:'💆',
    keys:['seat massage','massage on','massage seat','back massage'],
    kkeys:['កៅអីម៉ាស្សា','ម៉ាស្សា'],
    reply:{zh:'座椅按摩已开启', en:'Seat massage on', km:'កៅអីម៉ាស្សាបានបើក'} },

  { id:'seat_back', cat:'seat', zh:'座椅向后调', py:'Zuò yǐ xiàng hòu tiáo', kmr:'ចួ យី ស្យាង ហូ ធាវ',
    en:'Move seat backwards', km:'រំកិលកៅអីទៅក្រោយ', icon:'⬅️',
    keys:['seat back','move seat back','seat backward','more leg room'],
    kkeys:['កៅអីទៅក្រោយ','រំកិលកៅអីក្រោយ'],
    reply:{zh:'座椅已向后调整', en:'Seat moved back', km:'កៅអីបានរំកិលទៅក្រោយ'} },

  { id:'seat_forward', cat:'seat', zh:'座椅向前调', py:'Zuò yǐ xiàng qián tiáo', kmr:'ចួ យី ស្យាង ឈាន ធាវ',
    en:'Move seat forwards', km:'រំកិលកៅអីទៅមុខ', icon:'➡️',
    keys:['seat forward','move seat forward','seat closer'],
    kkeys:['កៅអីទៅមុខ','រំកិលកៅអីមុខ'],
    reply:{zh:'座椅已向前调整', en:'Seat moved forward', km:'កៅអីបានរំកិលទៅមុខ'} },

  { id:'seat_recline', cat:'seat', zh:'座椅靠背放倒', py:'Zuò yǐ kào bèi fàng dǎo', kmr:'ចួ យី ខាវ ពី ហ្វាង តាវ',
    en:'Recline the seat back', km:'ផ្អៀងខ្នងកៅអី', icon:'🛋️',
    keys:['recline seat','lay seat back','seat lie down','lower backrest'],
    kkeys:['ផ្អៀងកៅអី','ដេកកៅអី'],
    reply:{zh:'座椅靠背已放倒', en:'Seat reclined', km:'ខ្នងកៅអីបានផ្អៀង'} },

  { id:'steering_heat', cat:'seat', zh:'打开方向盘加热', py:'Dǎ kāi fāng xiàng pán jiā rè', kmr:'តា ខាយ ហ្វាង ស្យាង ផាន ជា រឺ',
    en:'Turn on steering wheel heating', km:'បើកកម្តៅចង្កូត', icon:'🎯',
    keys:['steering wheel heat','heat steering','warm steering wheel'],
    kkeys:['កម្តៅចង្កូត','ចង្កូតកម្តៅ'],
    reply:{zh:'方向盘加热已打开', en:'Steering wheel heating on', km:'កម្តៅចង្កូតបានបើក'} },

  { id:'mirror_fold', cat:'seat', zh:'折叠后视镜', py:'Zhé dié hòu shì jìng', kmr:'ចឺ ទៀ ហូ ស៊ឺ ជីង',
    en:'Fold the side mirrors', km:'បត់កញ្ចក់ចំហៀង', icon:'🪞',
    keys:['fold mirrors','fold mirror','close mirrors','retract mirrors'],
    kkeys:['បត់កញ្ចក់','បិទកញ្ចក់ចំហៀង'],
    reply:{zh:'后视镜已折叠', en:'Mirrors folded', km:'កញ្ចក់ចំហៀងបានបត់'} },

  { id:'mirror_unfold', cat:'seat', zh:'展开后视镜', py:'Zhǎn kāi hòu shì jìng', kmr:'ចាន ខាយ ហូ ស៊ឺ ជីង',
    en:'Unfold the side mirrors', km:'លាតកញ្ចក់ចំហៀង', icon:'↔️',
    keys:['unfold mirrors','open mirrors','extend mirrors'],
    kkeys:['លាតកញ្ចក់','បើកកញ្ចក់ចំហៀង'],
    reply:{zh:'后视镜已展开', en:'Mirrors unfolded', km:'កញ្ចក់ចំហៀងបានលាត'} },

  /* ================= DRIVING & BATTERY ================= */
  { id:'battery_level', cat:'drive', zh:'还有多少电', py:'Hái yǒu duō shǎo diàn', kmr:'ហាយ យូ ទួ សាវ ទាន',
    en:'How much battery is left?', km:'តើថ្មនៅសល់ប៉ុន្មាន?', icon:'🔋',
    keys:['battery level','how much battery','battery percentage','charge left','how much charge'],
    kkeys:['ថ្មនៅសល់ប៉ុន្មាន','កម្រិតថ្ម','ភ្លើងនៅសល់'],
    reply:{zh:'当前电量百分之68', en:'Battery is at 68 percent', km:'ថ្មនៅ ៦៨ ភាគរយ'} },

  { id:'range_left', cat:'drive', zh:'还能跑多少公里', py:'Hái néng pǎo duō shǎo gōng lǐ', kmr:'ហាយ នឹង ផាវ ទួ សាវ គុង លី',
    en:'How many kilometres of range left?', km:'តើអាចបើកបានប៉ុន្មានគីឡូម៉ែត្រ?', icon:'🛣️',
    keys:['range left','how far can i drive','remaining range','kilometers left','how many km'],
    kkeys:['បើកបានប៉ុន្មានគីឡូ','ចម្ងាយនៅសល់'],
    reply:{zh:'剩余续航约320公里', en:'About 320 kilometres of range', km:'នៅសល់ប្រហែល ៣២០ គីឡូម៉ែត្រ'} },

  { id:'eco_mode', cat:'drive', zh:'切换到经济模式', py:'Qiē huàn dào jīng jì mó shì', kmr:'ឈៀ ហ្វាន តាវ ជីង ជី ម៉ូ ស៊ឺ',
    en:'Switch to Eco mode', km:'ប្តូរទៅមុខងារសន្សំ', icon:'🌱',
    keys:['eco mode','economy mode','save battery mode','efficient mode'],
    kkeys:['មុខងារសន្សំ','អេកូ','សន្សំថ្ម'],
    reply:{zh:'已切换到经济模式', en:'Eco mode enabled', km:'បានប្តូរទៅមុខងារសន្សំ'} },

  { id:'sport_mode', cat:'drive', zh:'切换到运动模式', py:'Qiē huàn dào yùn dòng mó shì', kmr:'ឈៀ ហ្វាន តាវ យ៊ុន ទុង ម៉ូ ស៊ឺ',
    en:'Switch to Sport mode', km:'ប្តូរទៅមុខងារល្បឿន', icon:'🏎️',
    keys:['sport mode','sports mode','fast mode','performance mode'],
    kkeys:['មុខងារល្បឿន','ស្ព័រ','មុខងារលឿន'],
    reply:{zh:'已切换到运动模式', en:'Sport mode enabled', km:'បានប្តូរទៅមុខងារល្បឿន'} },

  { id:'comfort_mode', cat:'drive', zh:'切换到舒适模式', py:'Qiē huàn dào shū shì mó shì', kmr:'ឈៀ ហ្វាន តាវ ស៊ូ ស៊ឺ ម៉ូ ស៊ឺ',
    en:'Switch to Comfort mode', km:'ប្តូរទៅមុខងារស្រួល', icon:'🛏️',
    keys:['comfort mode','normal mode','standard mode'],
    kkeys:['មុខងារស្រួល','មុខងារធម្មតា'],
    reply:{zh:'已切换到舒适模式', en:'Comfort mode enabled', km:'បានប្តូរទៅមុខងារស្រួល'} },

  { id:'cruise_on', cat:'drive', zh:'打开定速巡航', py:'Dǎ kāi dìng sù xún háng', kmr:'តា ខាយ ទីង ស៊ូ ស៊ុន ហាង',
    en:'Turn on cruise control', km:'បើកគ្រប់គ្រងល្បឿន', icon:'🎛️',
    keys:['cruise control','turn on cruise','set cruise','adaptive cruise'],
    kkeys:['គ្រប់គ្រងល្បឿន','ខ្រូសខន់ត្រូល'],
    reply:{zh:'定速巡航已打开', en:'Cruise control on', km:'គ្រប់គ្រងល្បឿនបានបើក'} },

  { id:'regen_high', cat:'drive', zh:'动能回收调高', py:'Dòng néng huí shōu tiáo gāo', kmr:'ទុង នឹង ហ្វុយ សូ ធាវ កាវ',
    en:'Increase regenerative braking', km:'បង្កើនការសាកថ្មពេលហ្វ្រាំង', icon:'♻️',
    keys:['regen braking','regenerative braking','increase regen','one pedal'],
    kkeys:['សាកថ្មពេលហ្វ្រាំង','បង្កើនរីជេន'],
    reply:{zh:'动能回收已调高', en:'Regenerative braking increased', km:'ការសាកថ្មពេលហ្វ្រាំងបានបង្កើន'} },

  { id:'charge_start', cat:'drive', zh:'开始充电', py:'Kāi shǐ chōng diàn', kmr:'ខាយ ស៊ឺ ឈុង ទាន',
    en:'Start charging', km:'ចាប់ផ្តើមបញ្ចូលថ្ម', icon:'🔌',
    keys:['start charging','begin charge','charge now','start charge'],
    kkeys:['ចាប់ផ្តើមសាកថ្ម','សាកថ្ម','បញ្ចូលថ្ម'],
    reply:{zh:'已开始充电', en:'Charging started', km:'បានចាប់ផ្តើមបញ្ចូលថ្ម'} },

  { id:'charge_stop', cat:'drive', zh:'停止充电', py:'Tíng zhǐ chōng diàn', kmr:'ធីង ជឺ ឈុង ទាន',
    en:'Stop charging', km:'ឈប់បញ្ចូលថ្ម', icon:'⛔',
    keys:['stop charging','end charge','stop charge'],
    kkeys:['ឈប់សាកថ្ម','បញ្ឈប់ការសាក'],
    reply:{zh:'已停止充电', en:'Charging stopped', km:'បានឈប់បញ្ចូលថ្ម'} },

  { id:'tire_pressure', cat:'drive', zh:'胎压怎么样', py:'Tāi yā zěn me yàng', kmr:'ថាយ យា ចឹន មឺ យាង',
    en:'How is the tire pressure?', km:'សម្ពាធកង់យ៉ាងណា?', icon:'🛞',
    keys:['tire pressure','tyre pressure','check tires','tire status'],
    kkeys:['សម្ពាធកង់','ពិនិត្យកង់','ខ្យល់កង់'],
    reply:{zh:'四个轮胎胎压正常', en:'All four tires are at normal pressure', km:'កង់ទាំងបួនមានសម្ពាធធម្មតា'} },

  /* ================= DOORS & TRUNK ================= */
  { id:'trunk_open', cat:'door', zh:'打开后备箱', py:'Dǎ kāi hòu bèi xiāng', kmr:'តា ខាយ ហូ ពី ស្យាង',
    en:'Open the trunk', km:'បើកឆាកក្រោយ', icon:'🎒',
    keys:['open trunk','open boot','trunk open','open the back'],
    kkeys:['បើកឆាកក្រោយ','បើកកូនឡានក្រោយ'],
    reply:{zh:'后备箱已打开', en:'Trunk open', km:'ឆាកក្រោយបានបើក'} },

  { id:'trunk_close', cat:'door', zh:'关闭后备箱', py:'Guān bì hòu bèi xiāng', kmr:'ក្វាន ពី ហូ ពី ស្យាង',
    en:'Close the trunk', km:'បិទឆាកក្រោយ', icon:'📦',
    keys:['close trunk','close boot','trunk close','shut the back'],
    kkeys:['បិទឆាកក្រោយ','បិទកូនឡានក្រោយ'],
    reply:{zh:'后备箱已关闭', en:'Trunk closed', km:'ឆាកក្រោយបានបិទ'} },

  { id:'lock_car', cat:'door', zh:'锁车', py:'Suǒ chē', kmr:'សួ ឈឺ',
    en:'Lock the car', km:'ចាក់សោឡាន', icon:'🔐',
    keys:['lock car','lock the doors','lock doors','lock it'],
    kkeys:['ចាក់សោឡាន','ចាក់សោទ្វារ','ខ្ទាស់ទ្វារ'],
    reply:{zh:'车辆已锁定', en:'Car locked', km:'ឡានបានចាក់សោ'} },

  { id:'unlock_car', cat:'door', zh:'解锁车门', py:'Jiě suǒ chē mén', kmr:'ជៀ សួ ឈឺ មឹន',
    en:'Unlock the doors', km:'ដោះសោទ្វារ', icon:'🔓',
    keys:['unlock car','unlock doors','open doors','unlock it'],
    kkeys:['ដោះសោទ្វារ','បើកសោឡាន'],
    reply:{zh:'车门已解锁', en:'Doors unlocked', km:'ទ្វារបានដោះសោ'} },

  { id:'charge_port', cat:'door', zh:'打开充电口', py:'Dǎ kāi chōng diàn kǒu', kmr:'តា ខាយ ឈុង ទាន ខូ',
    en:'Open the charging port', km:'បើករន្ធបញ្ចូលថ្ម', icon:'⚡',
    keys:['open charge port','charging port','open charging flap','charge door'],
    kkeys:['បើករន្ធសាកថ្ម','រន្ធបញ្ចូលថ្ម'],
    reply:{zh:'充电口已打开', en:'Charging port open', km:'រន្ធបញ្ចូលថ្មបានបើក'} },

  { id:'child_lock', cat:'door', zh:'打开儿童锁', py:'Dǎ kāi ér tóng suǒ', kmr:'តា ខាយ អឺ ថុង សួ',
    en:'Turn on the child lock', km:'បើកសោកុមារ', icon:'👶',
    keys:['child lock','baby lock','child safety lock'],
    kkeys:['សោកុមារ','សោការពារកូន'],
    reply:{zh:'儿童锁已开启', en:'Child lock on', km:'សោកុមារបានបើក'} },

  /* ================= PHONE & SCREEN ================= */
  { id:'call_make', cat:'phone', zh:'打电话', py:'Dǎ diàn huà', kmr:'តា ទាន ហ្វា',
    en:'Make a phone call', km:'ហៅទូរស័ព្ទ', icon:'📞',
    keys:['make a call','call someone','phone call','dial'],
    kkeys:['ហៅទូរស័ព្ទ','ទូរស័ព្ទទៅ','ខលទៅ'],
    reply:{zh:'请说出联系人姓名', en:'Please say the contact name', km:'សូមនិយាយឈ្មោះទំនាក់ទំនង'} },

  { id:'call_answer', cat:'phone', zh:'接听电话', py:'Jiē tīng diàn huà', kmr:'ជៀ ធីង ទាន ហ្វា',
    en:'Answer the call', km:'ទទួលការហៅ', icon:'✅',
    keys:['answer call','pick up','accept call','answer the phone'],
    kkeys:['ទទួលការហៅ','លើកទូរស័ព្ទ'],
    reply:{zh:'已接听', en:'Call answered', km:'បានទទួលការហៅ'} },

  { id:'call_reject', cat:'phone', zh:'挂断电话', py:'Guà duàn diàn huà', kmr:'ក្វា ទាន ទាន ហ្វា',
    en:'Hang up the call', km:'បិទការហៅ', icon:'📵',
    keys:['hang up','reject call','end call','decline call'],
    kkeys:['បិទការហៅ','ដាក់ចុះ','បដិសេធការហៅ'],
    reply:{zh:'通话已结束', en:'Call ended', km:'ការហៅបានបញ្ចប់'} },

  { id:'screen_off', cat:'phone', zh:'关闭屏幕', py:'Guān bì píng mù', kmr:'ក្វាន ពី ភីង មូ',
    en:'Turn off the screen', km:'បិទអេក្រង់', icon:'📴',
    keys:['screen off','turn off screen','close display','black screen'],
    kkeys:['បិទអេក្រង់','បិទផ្ទាំង'],
    reply:{zh:'屏幕已关闭', en:'Screen off', km:'អេក្រង់បានបិទ'} },

  { id:'screen_bright', cat:'phone', zh:'屏幕亮一点', py:'Píng mù liàng yī diǎn', kmr:'ភីង មូ លាង យី ទាន',
    en:'Make the screen brighter', km:'ធ្វើឲ្យអេក្រង់ភ្លឺជាង', icon:'🔆',
    keys:['brighter screen','screen brightness up','increase brightness','screen too dark'],
    kkeys:['អេក្រង់ភ្លឺជាង','បង្កើនពន្លឺ'],
    reply:{zh:'屏幕亮度已提高', en:'Screen brightness increased', km:'ពន្លឺអេក្រង់បានបង្កើន'} },

  { id:'screen_dim', cat:'phone', zh:'屏幕暗一点', py:'Píng mù àn yī diǎn', kmr:'ភីង មូ អាន យី ទាន',
    en:'Make the screen dimmer', km:'ធ្វើឲ្យអេក្រង់ងងឹតជាង', icon:'🔅',
    keys:['dimmer screen','screen brightness down','decrease brightness','screen too bright'],
    kkeys:['អេក្រង់ងងឹតជាង','បន្ថយពន្លឺ'],
    reply:{zh:'屏幕亮度已降低', en:'Screen brightness decreased', km:'ពន្លឺអេក្រង់បានបន្ថយ'} },

  /* ================= ASK THE CAR ================= */
  { id:'ask_weather', cat:'info', zh:'今天天气怎么样', py:'Jīn tiān tiān qì zěn me yàng', kmr:'ជីន ធាន ធាន ឈី ចឹន មឺ យាង',
    en:"What's the weather today?", km:'តើអាកាសធាតុថ្ងៃនេះយ៉ាងណា?', icon:'🌤️',
    keys:['weather','how is weather','weather today','will it rain','forecast'],
    kkeys:['អាកាសធាតុ','ធាតុអាកាស','មានភ្លៀងទេ'],
    reply:{zh:'今天晴天，气温32度', en:'Sunny today, 32 degrees', km:'ថ្ងៃនេះមេឃស្រឡះ ៣២ អង្សា'} },

  { id:'ask_time', cat:'info', zh:'现在几点了', py:'Xiàn zài jǐ diǎn le', kmr:'ស្យាន ចាយ ជី ទាន លឺ',
    en:'What time is it?', km:'តើឥឡូវនេះម៉ោងប៉ុន្មាន?', icon:'🕐',
    keys:['what time','time now','current time','clock'],
    kkeys:['ម៉ោងប៉ុន្មាន','ម៉ោងឥឡូវ','ពេលវេលា'],
    reply:{zh:'现在是下午3点25分', en:"It's 3:25 PM", km:'ឥឡូវម៉ោង ៣:២៥ រសៀល'} },

  { id:'ask_speed', cat:'info', zh:'现在车速多少', py:'Xiàn zài chē sù duō shǎo', kmr:'ស្យាន ចាយ ឈឺ ស៊ូ ទួ សាវ',
    en:'What is my current speed?', km:'តើល្បឿនឥឡូវប៉ុន្មាន?', icon:'🚀',
    keys:['current speed','how fast','my speed','speed now'],
    kkeys:['ល្បឿនប៉ុន្មាន','លឿនប៉ុណ្ណា'],
    reply:{zh:'当前车速60公里每小时', en:'Currently 60 kilometres per hour', km:'ល្បឿន ៦០ គីឡូម៉ែត្រក្នុងមួយម៉ោង'} },

  { id:'ask_help', cat:'info', zh:'你能做什么', py:'Nǐ néng zuò shén me', kmr:'នី នឹង ចួ សឹន មឺ',
    en:'What can you do?', km:'តើអ្នកអាចធ្វើអ្វីបាន?', icon:'🤖',
    keys:['what can you do','help','commands','what commands','how to use'],
    kkeys:['អ្នកអាចធ្វើអ្វី','ជំនួយ','បញ្ជាអ្វី'],
    reply:{zh:'我可以控制空调、车窗、音乐、导航等', en:'I can control AC, windows, music, navigation and more', km:'ខ្ញុំអាចគ្រប់គ្រងម៉ាស៊ីនត្រជាក់ កញ្ចក់ តន្ត្រី ការណែនាំផ្លូវ និងច្រើនទៀត'} },

  { id:'thank_you', cat:'info', zh:'谢谢', py:'Xiè xiè', kmr:'ស្យេ ស្យេ',
    en:'Thank you', km:'អរគុណ', icon:'🙏',
    keys:['thank you','thanks','thank','cheers'],
    kkeys:['អរគុណ','សូមអរគុណ'],
    reply:{zh:'不客气', en:"You're welcome", km:'មិនអីទេ'} },

  /* ================= WIPERS & DEFOG ================= */
  { id:'wiper_on', cat:'wiper', zh:'打开雨刷', py:'Dǎ kāi yǔ shuā', kmr:'តា ខាយ យូ ស្វា',
    en:'Turn on the wipers', km:'បើកជូតកញ្ចក់', icon:'🌧️',
    keys:['wipers on','turn on wipers','start wipers','windshield wipers'],
    kkeys:['បើកជូតកញ្ចក់','បើកវ៉ាយពែ'],
    reply:{zh:'雨刷已打开', en:'Wipers on', km:'ជូតកញ្ចក់បានបើក'} },

  { id:'wiper_off', cat:'wiper', zh:'关闭雨刷', py:'Guān bì yǔ shuā', kmr:'ក្វាន ពី យូ ស្វា',
    en:'Turn off the wipers', km:'បិទជូតកញ្ចក់', icon:'☀️',
    keys:['wipers off','turn off wipers','stop wipers'],
    kkeys:['បិទជូតកញ្ចក់','បិទវ៉ាយពែ'],
    reply:{zh:'雨刷已关闭', en:'Wipers off', km:'ជូតកញ្ចក់បានបិទ'} },

  { id:'wiper_fast', cat:'wiper', zh:'雨刷快一点', py:'Yǔ shuā kuài yī diǎn', kmr:'យូ ស្វា ខ្វាយ យី ទាន',
    en:'Make the wipers faster', km:'ធ្វើឲ្យជូតកញ្ចក់លឿនជាង', icon:'⏩',
    keys:['wipers faster','faster wipers','wiper speed up','heavy rain'],
    kkeys:['ជូតកញ្ចក់លឿន','ភ្លៀងធំ'],
    reply:{zh:'雨刷速度已加快', en:'Wiper speed increased', km:'ជូតកញ្ចក់បានលឿនជាង'} },

  { id:'wash_windshield', cat:'wiper', zh:'喷玻璃水', py:'Pēn bō lí shuǐ', kmr:'ភឹន ប៉ូ លី ស្វី',
    en:'Spray the windshield washer', km:'បាញ់ទឹកជូតកញ្ចក់', icon:'💦',
    keys:['spray washer','clean windshield','wash window','washer fluid','dirty windshield'],
    kkeys:['បាញ់ទឹកកញ្ចក់','សំអាតកញ្ចក់','កញ្ចក់ប្រឡាក់'],
    reply:{zh:'正在喷玻璃水', en:'Spraying washer fluid', km:'កំពុងបាញ់ទឹកជូតកញ្ចក់'} },

  { id:'defog_front', cat:'wiper', zh:'打开前挡除雾', py:'Dǎ kāi qián dǎng chú wù', kmr:'តា ខាយ ឈាន តាង ឈូ វូ',
    en:'Turn on front defogger', km:'បើកបំបាត់អ័ព្ទមុខ', icon:'🌬️',
    keys:['defog front','front defogger','clear windshield fog','demist front','foggy window'],
    kkeys:['បំបាត់អ័ព្ទមុខ','កញ្ចក់អ័ព្ទ'],
    reply:{zh:'前挡除雾已开启', en:'Front defogger on', km:'បំបាត់អ័ព្ទមុខបានបើក'} },

  { id:'defog_rear', cat:'wiper', zh:'打开后挡除雾', py:'Dǎ kāi hòu dǎng chú wù', kmr:'តា ខាយ ហូ តាង ឈូ វូ',
    en:'Turn on rear defogger', km:'បើកបំបាត់អ័ព្ទក្រោយ', icon:'🔙',
    keys:['defog rear','rear defogger','clear rear fog','demist rear'],
    kkeys:['បំបាត់អ័ព្ទក្រោយ','កញ្ចក់ក្រោយអ័ព្ទ'],
    reply:{zh:'后挡除雾已开启', en:'Rear defogger on', km:'បំបាត់អ័ព្ទក្រោយបានបើក'} },

  /* ================= SAFETY & CAMERAS ================= */
  { id:'cam_360', cat:'safety', zh:'打开全景影像', py:'Dǎ kāi quán jǐng yǐng xiàng', kmr:'តា ខាយ ឈាន ជីង យីង ស្យាង',
    en:'Open the 360 camera view', km:'បើកកាមេរ៉ា ៣៦០', icon:'🎥',
    keys:['360 camera','panoramic camera','surround view','bird view','open camera'],
    kkeys:['កាមេរ៉ា ៣៦០','កាមេរ៉ាជុំវិញ','បើកកាមេរ៉ា'],
    reply:{zh:'全景影像已打开', en:'360 camera view on', km:'កាមេរ៉ា ៣៦០ បានបើក'} },

  { id:'cam_rear', cat:'safety', zh:'打开倒车影像', py:'Dǎ kāi dào chē yǐng xiàng', kmr:'តា ខាយ តាវ ឈឺ យីង ស្យាង',
    en:'Open the reverse camera', km:'បើកកាមេរ៉ាថយក្រោយ', icon:'📹',
    keys:['reverse camera','backup camera','rear camera','back camera'],
    kkeys:['កាមេរ៉ាថយក្រោយ','កាមេរ៉ាក្រោយ'],
    reply:{zh:'倒车影像已打开', en:'Reverse camera on', km:'កាមេរ៉ាថយក្រោយបានបើក'} },

  { id:'dashcam', cat:'safety', zh:'打开行车记录仪', py:'Dǎ kāi xíng chē jì lù yí', kmr:'តា ខាយ ស៊ីង ឈឺ ជី លូ យី',
    en:'Turn on the dashcam', km:'បើកកាមេរ៉ាកត់ត្រា', icon:'🎬',
    keys:['dashcam','dash cam','driving recorder','record video','start recording'],
    kkeys:['កាមេរ៉ាកត់ត្រា','ថតវីដេអូ'],
    reply:{zh:'行车记录仪已开启', en:'Dashcam recording', km:'កាមេរ៉ាកត់ត្រាកំពុងថត'} },

  { id:'sentry_on', cat:'safety', zh:'打开哨兵模式', py:'Dǎ kāi shào bīng mó shì', kmr:'តា ខាយ សាវ ពីង ម៉ូ ស៊ឺ',
    en:'Turn on sentry / guard mode', km:'បើកមុខងារយាម', icon:'🛡️',
    keys:['sentry mode','guard mode','security mode','watch car'],
    kkeys:['មុខងារយាម','ការពារឡាន'],
    reply:{zh:'哨兵模式已开启', en:'Sentry mode on', km:'មុខងារយាមបានបើក'} },

  { id:'find_car', cat:'safety', zh:'鸣笛找车', py:'Míng dí zhǎo chē', kmr:'មីង ទី ចាវ ឈឺ',
    en:'Honk to find my car', km:'បន្លឺស៊ីផ្លុំរកឡាន', icon:'📢',
    keys:['find my car','honk horn','where is my car','flash lights find'],
    kkeys:['រកឡានខ្ញុំ','បន្លឺស៊ីផ្លុំ'],
    reply:{zh:'正在鸣笛闪灯', en:'Honking and flashing lights', km:'កំពុងបន្លឺស៊ីផ្លុំនិងបញ្ចាំងភ្លើង'} },

  { id:'lane_assist', cat:'safety', zh:'打开车道保持', py:'Dǎ kāi chē dào bǎo chí', kmr:'តា ខាយ ឈឺ តាវ បាវ ឈឺ',
    en:'Turn on lane keep assist', km:'បើកជំនួយរក្សាគូទ្រូង', icon:'🛤️',
    keys:['lane keep','lane assist','lane keeping','stay in lane'],
    kkeys:['រក្សាគូទ្រូង','ជំនួយគូទ្រូង'],
    reply:{zh:'车道保持已开启', en:'Lane keep assist on', km:'ជំនួយរក្សាគូទ្រូងបានបើក'} },

  { id:'parking_sensor', cat:'safety', zh:'打开倒车雷达', py:'Dǎ kāi dào chē léi dá', kmr:'តា ខាយ តាវ ឈឺ លី តា',
    en:'Turn on parking sensors', km:'បើកឧបករណ៍ចាប់សញ្ញាចត', icon:'📡',
    keys:['parking sensor','parking radar','park assist','reverse sensor'],
    kkeys:['ឧបករណ៍ចាប់សញ្ញាចត','រ៉ាដាចត'],
    reply:{zh:'倒车雷达已开启', en:'Parking sensors on', km:'ឧបករណ៍ចាប់សញ្ញាចតបានបើក'} }
];

/* Merge in the brand-exact Geely command set (from the real Voice Skill
   menu screenshots) so search + voice recognition cover it too. */
export const COMMANDS = [...GENERIC_COMMANDS, ...GEELY_COMMANDS];
export const ALL_CATEGORIES = [...CATEGORIES, ...GEELY_CATEGORIES];

export { GEELY_CATEGORIES, GEELY_COMMANDS };
export const byCategory = (cat) => COMMANDS.filter(c => c.cat === cat);
export const getCommand  = (id)  => COMMANDS.find(c => c.id === id);
export const CAT_MAP = Object.fromEntries(ALL_CATEGORIES.map(c => [c.id, c]));
