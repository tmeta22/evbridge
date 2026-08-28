/* =====================================================================
   GEELY — real on-car "Voice Skill" menu
   Transcribed directly from the Geely infotainment Voice Skill screens
   (语音助手 / 导航出行 / 车辆控制 / 音乐控制 / 系统控制 / 生活服务).
   Same field shape as data/commands.js, merged into the global COMMANDS
   list so search + recognition pick these up automatically.
   No network. Pure data.
   ===================================================================== */

export const GEELY_CATEGORIES = [
  { id: 'gv', en: 'Voice Assistant',  km: 'ជំនួយការសំឡេង',       zh: '语音助手', icon: '🗣️', color: '#2f6fd6' },
  { id: 'gn', en: 'Navigation',       km: 'ការណែនាំផ្លូវ',        zh: '导航出行', icon: '🧭', color: '#10b981' },
  { id: 'gc', en: 'Vehicle Control',  km: 'ការគ្រប់គ្រងឡាន',      zh: '车辆控制', icon: '🚗', color: '#1a4b8c' },
  { id: 'gm', en: 'Music Control',    km: 'ការគ្រប់គ្រងតន្ត្រី',   zh: '音乐控制', icon: '🎵', color: '#e2325c' },
  { id: 'gs', en: 'System Control',   km: 'ការគ្រប់គ្រងប្រព័ន្ធ',  zh: '系统控制', icon: '⚙️', color: '#e08a1e' },
  { id: 'gl', en: 'Life Services',    km: 'សេវាកម្មប្រចាំថ្ងៃ',   zh: '生活服务', icon: '☕', color: '#2f8fd6' }
];

export const GEELY_COMMANDS = [
  /* ================= 语音助手 VOICE ASSISTANT ================= */
  { id:'gv_settings', cat:'gv', zh:'打开语音设置', py:'Dǎ kāi yǔ yīn shè zhì', kmr:'តា ខាយ យូ យិន ស្ស ជឺ',
    en:'Open voice settings', km:'បើកការកំណត់សំឡេង', icon:'🗣️',
    keys:['voice settings','open voice settings','assistant settings'],
    kkeys:['ការកំណត់សំឡេង','បើកការកំណត់'],
    reply:{zh:'已为您打开语音设置', en:'Voice settings opened', km:'ការកំណត់សំឡេងបានបើក'} },

  { id:'gv_emotion', cat:'gv', zh:'打开情感应答', py:'Dǎ kāi qíng gǎn yìng dá', kmr:'តា ខាយ ឈីង កាន់ យីង តា',
    en:'Turn on emotional responses', km:'បើកការឆ្លើយតបអារម្មណ៍', icon:'💬',
    keys:['emotional response','turn on emotion mode','feeling replies'],
    kkeys:['ការឆ្លើយតបអារម្មណ៍','បើកអារម្មណ៍'],
    reply:{zh:'情感应答已开启', en:'Emotional responses on', km:'ការឆ្លើយតបអារម្មណ៍បានបើក'} },

  { id:'gv_rename', cat:'gv', zh:'给你取个新名字', py:'Gěi nǐ qǔ gè xīn míng zi', kmr:'ហ្គី នី ឈូ កឺ ស៊ិន មីង ជឺ',
    en:'Give you a new name', km:'ដាក់ឈ្មោះថ្មីឱ្យអ្នក', icon:'✏️',
    keys:['new name','rename assistant','give you a name','change your name'],
    kkeys:['ដាក់ឈ្មោះថ្មី','ប្តូរឈ្មោះ'],
    reply:{zh:'好呀，你想叫我什么呢', en:"Sure, what would you like to call me?", km:'បាទ តើអ្នកចង់ហៅខ្ញុំថាអ្វី?'} },

  /* ================= 导航出行 NAVIGATION ================= */
  { id:'gn_home', cat:'gn', zh:'导航回家', py:'Dǎo háng huí jiā', kmr:'តាវ ហាំង ហុយ ជា',
    en:'Navigate home', km:'នាំផ្លូវទៅផ្ទះ', icon:'🏠',
    keys:['navigate home','take me home','directions home','go home'],
    kkeys:['នាំផ្លូវទៅផ្ទះ','ទៅផ្ទះ'],
    reply:{zh:'正在为您规划回家路线', en:'Planning your route home', km:'កំពុងគូសផែនទីទៅផ្ទះ'} },

  { id:'gn_dest', cat:'gn', zh:'导航到{n}', py:'Dǎo háng dào {n}', kmr:'តាវ ហាំង តាវ {n}',
    en:'Navigate to [destination]', km:'នាំផ្លូវទៅ [ទីតាំង]', icon:'📍',
    keys:['navigate to','directions to','take me to','how do i get to'],
    kkeys:['នាំផ្លូវទៅ','ទៅកន្លែង'],
    reply:{zh:'正在为您规划路线', en:'Planning your route', km:'កំពុងគូសផែនទី'} },

  { id:'gn_go', cat:'gn', zh:'我要去{n}', py:'Wǒ yào qù {n}', kmr:'វូ យាវ ឈូ {n}',
    en:'I want to go to [destination]', km:'ខ្ញុំចង់ទៅ [ទីតាំង]', icon:'🚦',
    keys:['i want to go to','i need to go to','heading to'],
    kkeys:['ខ្ញុំចង់ទៅ','ត្រូវទៅ'],
    reply:{zh:'好的，已加入路线', en:'Got it, added to route', km:'យល់ព្រម បានបញ្ចូលក្នុងផ្លូវ'} },

  /* ================= 车辆控制 VEHICLE CONTROL ================= */
  { id:'gc_temp_down', cat:'gc', zh:'空调温度低一点', py:'Kōng tiáo wēn dù dī yī diǎn', kmr:'ឃុង ធាវ វុន ទូ ទី យី ទាន',
    en:'Lower the AC temperature a bit', km:'បន្ថយសីតុណ្ហភាពម៉ាស៊ីនត្រជាក់', icon:'🥶',
    keys:['ac cooler','lower ac temperature','make it colder'],
    kkeys:['បន្ថយសីតុណ្ហភាព','ត្រជាក់ជាង'],
    reply:{zh:'已调低空调温度', en:'AC temperature lowered', km:'សីតុណ្ហភាពត្រូវបានបន្ថយ'} },

  { id:'gc_temp_24', cat:'gc', zh:'温度调到24°C', py:'Wēn dù tiáo dào èr shí sì dù', kmr:'វុន ទូ ធាវ តាវ អ័រ ស៊ឺ ស៊ឺ ទូ',
    en:'Set temperature to 24°C', km:'កំណត់សីតុណ្ហភាព ២៤ អង្សា', icon:'🌡️',
    keys:['set temperature to 24','ac temp 24','temperature 24 degrees','set ac to 24'],
    kkeys:['កំណត់សីតុណ្ហភាព ២៤','សីតុណ្ហភាព២៤អង្សា'],
    reply:{zh:'空调温度已调到24度', en:'AC set to 24°C', km:'សីតុណ្ហភាពកំណត់ត្រឹម ២៤ អង្សា'} },

  { id:'gc_fan_up', cat:'gc', zh:'风量大一点', py:'Fēng liàng dà yī diǎn', kmr:'ហ្វុង លាង តា យី ទាន',
    en:'Increase the fan speed', km:'បង្កើនកម្លាំងខ្យល់', icon:'🌀',
    keys:['fan higher','more airflow','increase fan speed','stronger fan'],
    kkeys:['បង្កើនកម្លាំងខ្យល់','ខ្យល់ខ្លាំង'],
    reply:{zh:'风量已加大', en:'Fan speed increased', km:'កម្លាំងខ្យល់បានបង្កើន'} },

  { id:'gc_recirc', cat:'gc', zh:'空调内循环', py:'Kōng tiáo nèi xún huán', kmr:'ឃុង ធាវ នី ស៊ុន ហ្វាន',
    en:'Switch AC to recirculation', km:'ប្តូរទៅរំកិលខ្យល់ក្នុង', icon:'🔄',
    keys:['recirculate air','inside air mode','recirculation mode'],
    kkeys:['រំកិលខ្យល់ក្នុង','ខ្យល់ក្នុង'],
    reply:{zh:'已切换为内循环', en:'Recirculation mode on', km:'បានប្តូរទៅរំកិលខ្យល់ក្នុង'} },

  { id:'gc_face', cat:'gc', zh:'空调吹脸', py:'Kōng tiáo chuī liǎn', kmr:'ឃុង ធាវ ឈ្វី លាន',
    en:'Blow AC air to my face', km:'ផ្លុំខ្យល់ត្រជាក់មកមុខ', icon:'😮\u200d💨',
    keys:['air to my face','blow face vents','face vents'],
    kkeys:['ផ្លុំខ្យល់មកមុខ','ខ្យល់មកមុខ'],
    reply:{zh:'已切换为吹面模式', en:'Face vents selected', km:'បានប្តូរទៅផ្លុំមុខ'} },

  { id:'gc_ac_on', cat:'gc', zh:'打开空调AC', py:'Dǎ kāi kōng tiáo AC', kmr:'តា ខាយ ឃុង ធាវ អេស៊ី',
    en:'Turn on AC compressor', km:'បើកម៉ាស៊ីនត្រជាក់ AC', icon:'❄️',
    keys:['turn on ac compressor','ac on','turn on air conditioning'],
    kkeys:['បើកអេស៊ី','បើកម៉ាស៊ីនត្រជាក់'],
    reply:{zh:'空调AC已打开', en:'AC compressor on', km:'ម៉ាស៊ីនត្រជាក់ AC បានបើក'} },

  { id:'gc_defrost', cat:'gc', zh:'打开除霜', py:'Dǎ kāi chú shuāng', kmr:'តា ខាយ ឈូ ស្វាំង',
    en:'Turn on the defroster', km:'បើកម៉ាស៊ីនបំបាត់ទឹកកក', icon:'🧊',
    keys:['turn on defrost','defroster on','clear frost'],
    kkeys:['បំបាត់ទឹកកក','ដកទឹកកក'],
    reply:{zh:'除霜已开启', en:'Defroster on', km:'ការបំបាត់ទឹកកកបានបើក'} },

  { id:'gc_win_open', cat:'gc', zh:'打开车窗', py:'Dǎ kāi chē chuāng', kmr:'តា ខាយ ឈឺ ឈ្វាង',
    en:'Open the window', km:'បើកកញ្ចក់', icon:'🪟',
    keys:['open window','open the windows','window down'],
    kkeys:['បើកកញ្ចក់','ចុះកញ្ចក់'],
    reply:{zh:'车窗已打开', en:'Window opened', km:'កញ្ចក់បានបើក'} },

  { id:'gc_win_half', cat:'gc', zh:'车窗开一半', py:'Chē chuāng kāi yī bàn', kmr:'ឈឺ ឈ្វាង ខាយ យី ប៉ាន',
    en:'Open the window halfway', km:'បើកកញ្ចក់ពាក់កណ្តាល', icon:'🌤️',
    keys:['window halfway','half open window','window half down'],
    kkeys:['បើកកញ្ចក់ពាក់កណ្តាល','កញ្ចក់ពាក់កណ្តាល'],
    reply:{zh:'车窗已开一半', en:'Window opened halfway', km:'កញ្ចក់បានបើកពាក់កណ្តាល'} },

  { id:'gc_win_close', cat:'gc', zh:'关闭车窗', py:'Guān bì chē chuāng', kmr:'ក្វាន ពី ឈឺ ឈ្វាង',
    en:'Close the window', km:'បិទកញ្ចក់', icon:'🔒',
    keys:['close window','close the windows','window up'],
    kkeys:['បិទកញ្ចក់','ឡើងកញ្ចក់'],
    reply:{zh:'车窗已关闭', en:'Window closed', km:'កញ្ចក់បានបិទ'} },

  { id:'gc_win_crack', cat:'gc', zh:'车窗开条缝', py:'Chē chuāng kāi tiáo fèng', kmr:'ឈឺ ឈ្វាង ខាយ ធាវ ហ្វុង',
    en:'Crack the window open a little', km:'បើកកញ្ចក់បន្តិចប៉ុណ្ណោះ', icon:'🌬️',
    keys:['crack the window','open window a little','ventilate window slightly'],
    kkeys:['បើកកញ្ចក់បន្តិច','ខ្យល់តាមកញ្ចក់'],
    reply:{zh:'车窗已开一条缝', en:'Window cracked open', km:'កញ្ចក់បានបើកបន្តិច'} },

  /* ================= 音乐控制 MUSIC CONTROL ================= */
  { id:'gm_play', cat:'gm', zh:'我想听歌', py:'Wǒ xiǎng tīng gē', kmr:'វូ ស្យាង ធីង កឺ',
    en:'I want to listen to music', km:'ខ្ញុំចង់ស្តាប់ចម្រៀង', icon:'🎵',
    keys:['play music','i want to listen to music','play some songs'],
    kkeys:['ចង់ស្តាប់ចម្រៀង','ចាក់ចម្រៀង'],
    reply:{zh:'为您播放音乐', en:'Playing music for you', km:'កំពុងចាក់ចម្រៀងសម្រាប់អ្នក'} },

  { id:'gm_light', cat:'gm', zh:'我想听轻音乐', py:'Wǒ xiǎng tīng qīng yīn yuè', kmr:'វូ ស្យាង ធីង ឈីង យិន យ្វេ',
    en:'I want to listen to light music', km:'ខ្ញុំចង់ស្តាប់តន្ត្រីស្រាល', icon:'🎧',
    keys:['light music','easy listening music','soft music'],
    kkeys:['តន្ត្រីស្រាល','ចម្រៀងស្រាល'],
    reply:{zh:'为您播放轻音乐', en:'Playing light music', km:'កំពុងចាក់តន្ត្រីស្រាល'} },

  { id:'gm_canto', cat:'gm', zh:'我想听粤语歌', py:'Wǒ xiǎng tīng Yuè yǔ gē', kmr:'វូ ស្យាង ធីង យ្វេ យូ កឺ',
    en:'I want to listen to Cantonese songs', km:'ខ្ញុំចង់ស្តាប់ចម្រៀងកន់តុង', icon:'🎤',
    keys:['cantonese songs','play cantonese music'],
    kkeys:['ចម្រៀងកន់តុង','ចាក់ចម្រៀងកន់តុង'],
    reply:{zh:'为您播放粤语歌曲', en:'Playing Cantonese songs', km:'កំពុងចាក់ចម្រៀងកន់តុង'} },

  { id:'gm_jay', cat:'gm', zh:'我想听周杰伦的歌', py:'Wǒ xiǎng tīng Zhōu Jié lún de gē', kmr:'វូ ស្យាង ធីង ចូ ជេ លុន ទឺ កឺ',
    en:'I want to listen to Jay Chou', km:'ខ្ញុំចង់ស្តាប់ចម្រៀងចូ ជេលុន', icon:'🎙️',
    keys:['jay chou songs','play jay chou','listen to jay chou'],
    kkeys:['ចម្រៀងចូជេលុន','ចាក់ចូជេលុន'],
    reply:{zh:'为您播放周杰伦的歌曲', en:'Playing Jay Chou songs', km:'កំពុងចាក់ចម្រៀងចូ ជេលុន'} },

  { id:'gm_fav_play', cat:'gm', zh:'播放收藏的歌', py:'Bò fàng shōu cáng de gē', kmr:'ប៉ូ ហ្វាង សូ ឆាង ទឺ កឺ',
    en:'Play my favorited songs', km:'ចាក់ចម្រៀងដែលបានចូលចិត្ត', icon:'⭐',
    keys:['play favorites','play my favorite songs','play saved songs'],
    kkeys:['ចាក់ចម្រៀងចូលចិត្ត','ចម្រៀងដែលចូលចិត្ត'],
    reply:{zh:'为您播放收藏歌曲', en:'Playing your favorited songs', km:'កំពុងចាក់ចម្រៀងដែលបានចូលចិត្ត'} },

  { id:'gm_repeat', cat:'gm', zh:'切换单曲循环', py:'Qiē huàn dān qǔ xún huán', kmr:'ឈៀ ហ្វាន តាន ឈូ ស៊ុន ហ្វាន',
    en:'Switch to repeat one', km:'ប្តូរទៅចាក់ចម្រៀងតែមួយម្តងៗ', icon:'🔂',
    keys:['repeat one song','loop this song','repeat song'],
    kkeys:['ចាក់តែមួយវិញៗ','ចាក់ចម្រៀងតែមួយ'],
    reply:{zh:'已切换为单曲循环', en:'Repeat one enabled', km:'បានប្តូរទៅចាក់តែមួយវិញៗ'} },

  { id:'gm_shuffle', cat:'gm', zh:'调成随机播放', py:'Tiáo chéng suí jī bò fàng', kmr:'ធាវ ឈិង ស្វី ជី ប៉ូ ហ្វាង',
    en:'Switch to shuffle play', km:'ប្តូរទៅចាក់ចៃដន្យ', icon:'🔀',
    keys:['shuffle songs','shuffle play','random play'],
    kkeys:['ចាក់ចៃដន្យ','ចាក់ចៃដន្យចម្រៀង'],
    reply:{zh:'已切换为随机播放', en:'Shuffle play enabled', km:'បានប្តូរទៅចាក់ចៃដន្យ'} },

  { id:'gm_sequential', cat:'gm', zh:'顺序播放', py:'Shùn xù bò fàng', kmr:'ស៊ុន ស៊ូ ប៉ូ ហ្វាង',
    en:'Play in order', km:'ចាក់តាមលំដាប់', icon:'➡️',
    keys:['play in order','sequential playback','play songs in order'],
    kkeys:['ចាក់តាមលំដាប់','ចាក់តាមលេខ'],
    reply:{zh:'已切换为顺序播放', en:'Sequential play enabled', km:'បានប្តូរទៅចាក់តាមលំដាប់'} },

  { id:'gm_pause', cat:'gm', zh:'暂停播放', py:'Zàn tíng bò fàng', kmr:'ចាន ធីង ប៉ូ ហ្វាង',
    en:'Pause playback', km:'ផ្អាកចាក់', icon:'⏸️',
    keys:['pause music','pause song','stop playing for now'],
    kkeys:['ផ្អាកចាក់','ផ្អាកចម្រៀង'],
    reply:{zh:'已暂停播放', en:'Playback paused', km:'ការចាក់ត្រូវបានផ្អាក'} },

  { id:'gm_prev', cat:'gm', zh:'上一首', py:'Shàng yī shǒu', kmr:'ស្យាង យី សូ',
    en:'Previous song', km:'ចម្រៀងមុន', icon:'⏮️',
    keys:['previous song','last song','go back a song'],
    kkeys:['ចម្រៀងមុន','ថយក្រោយចម្រៀង'],
    reply:{zh:'为您播放上一首', en:'Playing the previous song', km:'កំពុងចាក់ចម្រៀងមុន'} },

  { id:'gm_next', cat:'gm', zh:'下一首', py:'Xià yī shǒu', kmr:'ស្យា យី សូ',
    en:'Next song', km:'ចម្រៀងបន្ទាប់', icon:'⏭️',
    keys:['next song','skip song','play next song'],
    kkeys:['ចម្រៀងបន្ទាប់','រំលងចម្រៀង'],
    reply:{zh:'为您播放下一首', en:'Playing the next song', km:'កំពុងចាក់ចម្រៀងបន្ទាប់'} },

  { id:'gm_stop', cat:'gm', zh:'我不想听歌了', py:'Wǒ bù xiǎng tīng gē le', kmr:'វូ ពូ ស្យាង ធីង កឺ លឺ',
    en:"I don't want to listen to music anymore", km:'ខ្ញុំមិនចង់ស្តាប់ចម្រៀងទៀតទេ', icon:'🚫',
    keys:['stop music','turn off music','i dont want music anymore','no more music'],
    kkeys:['មិនចង់ស្តាប់ចម្រៀង','បិទចម្រៀង'],
    reply:{zh:'已为您关闭音乐', en:'Music turned off', km:'ចម្រៀងត្រូវបានបិទ'} },

  { id:'gm_fav', cat:'gm', zh:'收藏这首歌', py:'Shōu cáng zhè shǒu gē', kmr:'សូ ឆាង ចឺ សូ កឺ',
    en:'Favorite this song', km:'ចូលចិត្តចម្រៀងនេះ', icon:'❤️',
    keys:['favorite this song','save this song','like this song'],
    kkeys:['ចូលចិត្តចម្រៀងនេះ','រក្សាទុកចម្រៀងនេះ'],
    reply:{zh:'已收藏这首歌', en:'Song favorited', km:'ចម្រៀងនេះបានចូលចិត្ត'} },

  /* ================= 系统控制 SYSTEM CONTROL ================= */
  { id:'gs_vol_up', cat:'gs', zh:'声音大一点', py:'Shēng yīn dà yī diǎn', kmr:'ស្យេង យិន តា យី ទាន',
    en:'Turn the volume up a bit', km:'បង្កើនសំឡេងបន្តិច', icon:'🔊',
    keys:['volume up','louder','turn it up','increase volume'],
    kkeys:['បង្កើនសំឡេង','ខ្លាំងជាង'],
    reply:{zh:'音量已调大', en:'Volume increased', km:'សំឡេងបានបង្កើន'} },

  { id:'gs_vol_10', cat:'gs', zh:'音量调到10%', py:'Yīn liàng tiáo dào bǎi fēn zhī shí', kmr:'យិន លាង ធាវ តាវ ស៊ិប ភាគរយ',
    en:'Set volume to 10%', km:'កំណត់សំឡេង ១០%', icon:'🔉',
    keys:['set volume to 10','volume 10 percent'],
    kkeys:['កំណត់សំឡេង១០ភាគរយ','សំឡេង១០%'],
    reply:{zh:'音量已调到10%', en:'Volume set to 10%', km:'សំឡេងកំណត់ត្រឹម ១០%'} },

  { id:'gs_vol_down', cat:'gs', zh:'调低音量', py:'Tiáo dī yīn liàng', kmr:'ធាវ ទី យិន លាង',
    en:'Lower the volume', km:'បន្ថយសំឡេង', icon:'🔈',
    keys:['volume down','turn it down','lower volume','quieter'],
    kkeys:['បន្ថយសំឡេង','ស្ងាត់ជាង'],
    reply:{zh:'音量已调低', en:'Volume lowered', km:'សំឡេងបានបន្ថយ'} },

  { id:'gs_vol_min', cat:'gs', zh:'把音量调到最小', py:'Bǎ yīn liàng tiáo dào zuì xiǎo', kmr:'ប៉ា យិន លាង ធាវ តាវ ជ្វី ស្យាវ',
    en:'Set volume to minimum', km:'កំណត់សំឡេងទាបបំផុត', icon:'🔇',
    keys:['minimum volume','mute the volume','lowest volume'],
    kkeys:['សំឡេងទាបបំផុត','សំឡេងតូចបំផុត'],
    reply:{zh:'音量已调到最小', en:'Volume set to minimum', km:'សំឡេងកំណត់ត្រឹមតូចបំផុត'} },

  { id:'gs_bright_up', cat:'gs', zh:'屏幕调亮一点', py:'Píng mù tiáo liàng yī diǎn', kmr:'ភីង មូ ធាវ លាង យី ទាន',
    en:'Make the screen brighter', km:'ធ្វើឲ្យអេក្រង់ភ្លឺជាង', icon:'🔆',
    keys:['brighter screen','screen brightness up','increase brightness'],
    kkeys:['អេក្រង់ភ្លឺជាង','បង្កើនពន្លឺ'],
    reply:{zh:'屏幕亮度已提高', en:'Screen brightness increased', km:'ពន្លឺអេក្រង់បានបង្កើន'} },

  { id:'gs_bright_down', cat:'gs', zh:'屏幕调暗一点', py:'Píng mù tiáo àn yī diǎn', kmr:'ភីង មូ ធាវ អាន យី ទាន',
    en:'Make the screen dimmer', km:'ធ្វើឲ្យអេក្រង់ងងឹតជាង', icon:'🔅',
    keys:['dimmer screen','screen brightness down','decrease brightness'],
    kkeys:['អេក្រង់ងងឹតជាង','បន្ថយពន្លឺ'],
    reply:{zh:'屏幕亮度已降低', en:'Screen brightness decreased', km:'ពន្លឺអេក្រង់បានបន្ថយ'} },

  { id:'gs_bright_80', cat:'gs', zh:'屏幕亮度调到80%', py:'Píng mù liàng dù tiáo dào bǎi fēn zhī bā shí', kmr:'ភីង មូ លាង ទូ ធាវ តាវ ប៉ែត ស៊ិប ភាគរយ',
    en:'Set screen brightness to 80%', km:'កំណត់ពន្លឺអេក្រង់ ៨០%', icon:'🌕',
    keys:['brightness to 80','set brightness 80 percent'],
    kkeys:['ពន្លឺអេក្រង់៨០%','កំណត់ពន្លឺ៨០'],
    reply:{zh:'屏幕亮度已调到80%', en:'Screen brightness set to 80%', km:'ពន្លឺអេក្រង់កំណត់ត្រឹម ៨០%'} },

  { id:'gs_bright_30', cat:'gs', zh:'屏幕亮度调到30%', py:'Píng mù liàng dù tiáo dào bǎi fēn zhī sān shí', kmr:'ភីង មូ លាង ទូ ធាវ តាវ សាំ ស៊ិប ភាគរយ',
    en:'Set screen brightness to 30%', km:'កំណត់ពន្លឺអេក្រង់ ៣០%', icon:'🌑',
    keys:['brightness to 30','set brightness 30 percent'],
    kkeys:['ពន្លឺអេក្រង់៣០%','កំណត់ពន្លឺ៣០'],
    reply:{zh:'屏幕亮度已调到30%', en:'Screen brightness set to 30%', km:'ពន្លឺអេក្រង់កំណត់ត្រឹម ៣០%'} },

  { id:'gs_wifi', cat:'gs', zh:'打开WIFI', py:'Dǎ kāi WIFI', kmr:'តា ខាយ វ៉ាយហ្វាយ',
    en:'Turn on WiFi', km:'បើក WIFI', icon:'📶',
    keys:['turn on wifi','wifi on','connect wifi'],
    kkeys:['បើកវ៉ាយហ្វាយ','បើកWIFI'],
    reply:{zh:'WIFI已打开', en:'WiFi is on', km:'WIFI បានបើក'} },

  { id:'gs_bt', cat:'gs', zh:'打开蓝牙', py:'Dǎ kāi lán yá', kmr:'តា ខាយ ឡាន យ៉ា',
    en:'Turn on Bluetooth', km:'បើកប៊្លូធូស', icon:'🔵',
    keys:['turn on bluetooth','bluetooth on','connect bluetooth'],
    kkeys:['បើកប៊្លូធូស','ភ្ជាប់ប៊្លូធូស'],
    reply:{zh:'蓝牙已打开', en:'Bluetooth is on', km:'ប៊្លូធូសបានបើក'} },

  { id:'gs_call', cat:'gs', zh:'我要打电话', py:'Wǒ yào dǎ diàn huà', kmr:'វូ យាវ តា ទ្យេន ហ្វា',
    en:'I want to make a phone call', km:'ខ្ញុំចង់ទូរស័ព្ទ', icon:'📞',
    keys:['make a call','i want to call','place a phone call'],
    kkeys:['ចង់ទូរស័ព្ទ','ចង់ហៅទូរស័ព្ទ'],
    reply:{zh:'请问要打给谁', en:'Who would you like to call?', km:'តើចង់ហៅទៅអ្នកណា?'} },

  /* ================= 生活服务 LIFE SERVICES ================= */
  { id:'gl_fx', cat:'gl', zh:'美元现在汇率多少', py:'Měi yuán xiàn zài huì lǜ duō shǎo', kmr:'ម៉េយ យ្វេន ស្យាន ចាយ ហ្វេយ ល្វី ទួ សាវ',
    en:"What's the USD exchange rate now", km:'តើអត្រាប្តូរប្រាក់ដុល្លារឥឡូវប៉ុន្មាន?', icon:'💵',
    keys:['dollar exchange rate','usd exchange rate','current exchange rate'],
    kkeys:['អត្រាប្តូរប្រាក់ដុល្លារ','អត្រាប្តូរប្រាក់'],
    reply:{zh:'为您查询实时汇率', en:'Checking the live exchange rate', km:'កំពុងពិនិត្យអត្រាប្តូរប្រាក់'} },

  { id:'gl_restrict', cat:'gl', zh:'今天上海的限行情况', py:'Jīn tiān Shàng hǎi de xiàn xíng qíng kuàng', kmr:'ជីន ធាន ស្យាង ហៃ ទឺ ស្យាន ស៊ីង ឈីង ខ្វាង',
    en:"Today's driving restrictions in Shanghai", km:'តើលក្ខខណ្ឌកម្រិតបើកបរនៅសៀងហៃថ្ងៃនេះយ៉ាងណា?', icon:'🚦',
    keys:['shanghai driving restrictions','license plate restrictions today'],
    kkeys:['កម្រិតបើកបរសៀងហៃ','លក្ខខណ្ឌបើកបរ'],
    reply:{zh:'为您查询今日限行信息', en:"Checking today's restriction rules", km:'កំពុងពិនិត្យលក្ខខណ្ឌបើកបរថ្ងៃនេះ'} },

  { id:'gl_flight', cat:'gl', zh:'查下明天去北京的机票', py:'Chá xià míng tiān qù Běi jīng de jī piào', kmr:'ឆា ស្យា មីង ធាន ឈូ ប៉េយ ជីង ទឺ ជី ភ្យាវ',
    en:'Check flights to Beijing tomorrow', km:'ពិនិត្យសំបុត្រយន្តហោះទៅប៉េកាំងថ្ងៃស្អែក', icon:'✈️',
    keys:['flights to beijing tomorrow','check flight tickets','search flights'],
    kkeys:['សំបុត្រយន្តហោះទៅប៉េកាំង','ពិនិត្យសំបុត្រយន្តហោះ'],
    reply:{zh:'为您查询明天飞北京的航班', en:"Checking tomorrow's flights to Beijing", km:'កំពុងពិនិត្យសំបុត្រយន្តហោះទៅប៉េកាំង'} },

  { id:'gl_planets', cat:'gl', zh:'太阳系有几大行星', py:'Tài yáng xì yǒu jǐ dà xíng xīng', kmr:'ធាយ យ៉ាង ស៊ី យូ ជី តា ស៊ីង ស៊ីង',
    en:'How many planets are in the solar system?', km:'តើប្រព័ន្ធព្រះអាទិត្យមានភពប៉ុន្មាន?', icon:'🪐',
    keys:['how many planets','planets in solar system'],
    kkeys:['ភពប៉ុន្មាន','ប្រព័ន្ធព្រះអាទិត្យ'],
    reply:{zh:'太阳系共有八大行星', en:'There are eight planets in the solar system', km:'ប្រព័ន្ធព្រះអាទិត្យមានភពប្រាំបី'} },

  { id:'gl_cny', cat:'gl', zh:'春节是哪一天', py:'Chūn jié shì nǎ yī tiān', kmr:'ឈុន ជីេ ស៊ឺ ណា យី ធាន',
    en:'When is Chinese New Year?', km:'តើបុណ្យចូលឆ្នាំចិនធ្លាក់ថ្ងៃណា?', icon:'🧧',
    keys:['chinese new year date','when is spring festival'],
    kkeys:['ថ្ងៃចូលឆ្នាំចិន','បុណ្យចូលឆ្នាំចិន'],
    reply:{zh:'为您查询今年春节日期', en:"Checking this year's date", km:'កំពុងពិនិត្យកាលបរិច្ឆេទឆ្នាំនេះ'} },

  { id:'gl_weather', cat:'gl', zh:'今天天气怎么样', py:'Jīn tiān tiān qì zěn me yàng', kmr:'ជីន ធាន ធាន ឈី ចឹន មឺ យាង',
    en:"What's the weather today?", km:'តើអាកាសធាតុថ្ងៃនេះយ៉ាងណា?', icon:'🌤️',
    keys:['weather today','how is the weather','current weather'],
    kkeys:['អាកាសធាតុថ្ងៃនេះ','ធាតុអាកាស'],
    reply:{zh:'今天晴天，气温32度', en:'Sunny today, 32 degrees', km:'ថ្ងៃនេះមេឃស្រឡះ ៣២ អង្សា'} },

  { id:'gl_rain', cat:'gl', zh:'明天上海会下雨吗', py:'Míng tiān Shàng hǎi huì xià yǔ ma', kmr:'មីង ធាន ស្យាង ហៃ ហ្វេយ ស្យា យូ ម៉ា',
    en:'Will it rain in Shanghai tomorrow?', km:'តើថ្ងៃស្អែកសៀងហៃមានភ្លៀងទេ?', icon:'🌧️',
    keys:['will it rain tomorrow','rain forecast shanghai'],
    kkeys:['ថ្ងៃស្អែកមានភ្លៀងទេ','ព្យាករណ៍ភ្លៀង'],
    reply:{zh:'明天上海有小雨', en:'Light rain expected tomorrow in Shanghai', km:'ថ្ងៃស្អែកសៀងហៃមានភ្លៀងតិចៗ'} },

  { id:'gl_umbrella', cat:'gl', zh:'下周一需要带伞吗', py:'Xià zhōu yī xū yào dài sǎn ma', kmr:'ស្យា ចូ យី ស៊ុយ យាវ តាយ សាន ម៉ា',
    en:'Do I need an umbrella next Monday?', km:'តើថ្ងៃច័ន្ទក្រោយត្រូវយកឆ័ត្រទេ?', icon:'☂️',
    keys:['need umbrella next monday','umbrella forecast'],
    kkeys:['ត្រូវយកឆ័ត្រទេ','ថ្ងៃច័ន្ទក្រោយភ្លៀង'],
    reply:{zh:'下周一有雨，建议带伞', en:"It'll rain Monday — bring an umbrella", km:'ថ្ងៃច័ន្ទក្រោយមានភ្លៀង គួរយកឆ័ត្រ'} },

  { id:'gl_sad', cat:'gl', zh:'我今天不开心', py:'Wǒ jīn tiān bù kāi xīn', kmr:'វូ ជីន ធាន ពូ ខាយ ស៊ិន',
    en:"I'm not happy today", km:'ថ្ងៃនេះខ្ញុំមិនសប្បាយចិត្តទេ', icon:'😔',
    keys:["i'm sad today","i am not happy","feeling down"],
    kkeys:['មិនសប្បាយចិត្ត','ថ្ងៃនេះមិនសប្បាយ'],
    reply:{zh:'别难过，我陪着你呢', en:"Don't worry, I'm here with you", km:'កុំបារម្ភ ខ្ញុំនៅជាមួយអ្នក'} },

  { id:'gl_joke', cat:'gl', zh:'讲个笑话', py:'Jiǎng gè xiào huà', kmr:'ជាំង កឺ ស្យាវ ហ្វា',
    en:'Tell a joke', km:'និយាយរឿងកំប្លែងមួយ', icon:'😄',
    keys:['tell me a joke','tell a joke','make me laugh'],
    kkeys:['និយាយរឿងកំប្លែង','រឿងកំប្លែង'],
    reply:{zh:'好嘞，给您讲一个', en:'Sure, here goes', km:'បាទ ខ្ញុំនិយាយឲ្យស្តាប់'} },

  { id:'gl_wukong', cat:'gl', zh:'用孙悟空的语气说话', py:'Yòng Sūn Wù kōng de yǔ qì shuō huà', kmr:'យុង ស៊ុន វូ ខុង ទឺ យូ ឈី ស្វូ ហ្វា',
    en:'Talk like Sun Wukong', km:'និយាយដូចសុន វូខុង', icon:'🐒',
    keys:['talk like sun wukong','monkey king voice','speak as sun wukong'],
    kkeys:['និយាយដូចសុនវូខុង','សម្លេងស្តេចស្វា'],
    reply:{zh:'俺老孙来也', en:"Ol' Sun is here!", km:'ខ្ញុំសុនចាស់ បានមកដល់ហើយ!'} },

  { id:'gl_idiom', cat:'gl', zh:'来玩成语接龙', py:'Lái wán chéng yǔ jiē lóng', kmr:'ឡាយ វ៉ាន ឈិង យូ ជីេ ឡុង',
    en:"Let's play the idiom chain game", km:'តោះលេងហ្គេមចង្វាក់ពាក្យប្រយោគ', icon:'🐉',
    keys:['idiom chain game','play chengyu jielong','word chain game'],
    kkeys:['ហ្គេមចង្វាក់ពាក្យប្រយោគ','លេងចង្វាក់ពាក្យ'],
    reply:{zh:'好呀，你先来', en:"Sure, you go first", km:'បាទ អ្នកចាប់ផ្តើមមុន'} },

  /* ================= Vehicle Control additions (Geely Galaxy cockpit reference) ================= */
  { id:'gc_ac_power', cat:'gc', zh:'打开空调', py:'Dǎ kāi kōng tiáo', kmr:'តា ខាយ ឃុង ធាវ',
    en:'Turn on the air conditioning', km:'បើកម៉ាស៊ីនត្រជាក់', icon:'❄️',
    keys:['turn on ac','turn on air conditioning','aircon on','ac on'],
    kkeys:['បើកម៉ាស៊ីនត្រជាក់','បើកអេស៊ី'],
    reply:{zh:'空调已打开', en:'Air conditioning is on', km:'ម៉ាស៊ីនត្រជាក់បានបើក'} },

  { id:'gc_ac_off', cat:'gc', zh:'关闭空调', py:'Guān bì kōng tiáo', kmr:'ក្វាន ពី ឃុង ធាវ',
    en:'Turn off the air conditioning', km:'បិទម៉ាស៊ីនត្រជាក់', icon:'🚫',
    keys:['turn off ac','close the ac','aircon off','ac off'],
    kkeys:['បិទម៉ាស៊ីនត្រជាក់','បិទអេស៊ី'],
    reply:{zh:'空调已关闭', en:'Air conditioning is off', km:'ម៉ាស៊ីនត្រជាក់បានបិទ'} },

  { id:'gc_seat_vent_on', cat:'gc', zh:'打开主驾座椅通风', py:'Dǎ kāi zhǔ jià zuò yǐ tōng fēng', kmr:'តា ខាយ ជូ ជា ជ្វូ យី ធុង ហ្វុង',
    en:'Start driver seat cooling', km:'បើកកៅអីត្រជាក់ (អ្នកបើកបរ)', icon:'🪑',
    keys:['seat cooling','ventilation on','cool the seat','seat ventilation'],
    kkeys:['បើកកៅអីត្រជាក់','កៅអីត្រជាក់'],
    reply:{zh:'主驾座椅通风已开启', en:'Driver seat cooling on', km:'កៅអីត្រជាក់បានបើក'} },

  { id:'gc_seat_vent_off', cat:'gc', zh:'关闭主驾座椅通风', py:'Guān bì zhǔ jià zuò yǐ tōng fēng', kmr:'ក្វាន ពី ជូ ជា ជ្វូ យី ធុង ហ្វុង',
    en:'Stop driver seat cooling', km:'បិទកៅអីត្រជាក់', icon:'🧊',
    keys:['stop seat cooling','seat cooling off','turn off ventilation'],
    kkeys:['បិទកៅអីត្រជាក់','ឈប់ត្រជាក់កៅអី'],
    reply:{zh:'主驾座椅通风已关闭', en:'Driver seat cooling off', km:'កៅអីត្រជាក់បានបិទ'} },

  { id:'gc_seat_heat_on', cat:'gc', zh:'打开主驾座椅加热', py:'Dǎ kāi zhǔ jià zuò yǐ jiā rè', kmr:'តា ខាយ ជូ ជា ជ្វូ យី ជា រឺ',
    en:'Start driver seat heating', km:'បើកកម្តៅកៅអី', icon:'🔥',
    keys:['seat heating','heat the seat','seat warmer','warm the seat'],
    kkeys:['បើកកម្តៅកៅអី','កៅអីក្តៅ'],
    reply:{zh:'主驾座椅加热已开启', en:'Driver seat heating on', km:'កម្តៅកៅអីបានបើក'} },

  { id:'gc_seat_heat_off', cat:'gc', zh:'关闭主驾座椅加热', py:'Guān bì zhǔ jià zuò yǐ jiā rè', kmr:'ក្វាន ពី ជូ ជា ជ្វូ យី ជា រឺ',
    en:'Stop driver seat heating', km:'បិទកម្តៅកៅអី', icon:'🧊',
    keys:['stop seat heating','seat heating off','turn off seat heat'],
    kkeys:['បិទកម្តៅកៅអី','ឈប់កម្តៅកៅអី'],
    reply:{zh:'主驾座椅加热已关闭', en:'Driver seat heating off', km:'កម្តៅកៅអីបានបិទ'} },

  { id:'gc_seat_fwd', cat:'gc', zh:'座椅往前调', py:'Zuò yǐ wǎng qián tiáo', kmr:'ជ្វូ យី វ៉ាង ឆៀន ធាវ',
    en:'Move the seat forward', km:'រំកិលកៅអីទៅមុខ', icon:'↗️',
    keys:['seat forward','move seat forward','push seat up'],
    kkeys:['កៅអីទៅមុខ','រំកិលទៅមុខ'],
    reply:{zh:'座椅已往前调', en:'Seat moved forward', km:'កៅអីបានរំកិលទៅមុខ'} },

  { id:'gc_seat_back', cat:'gc', zh:'座椅往后调', py:'Zuò yǐ wǎng hòu tiáo', kmr:'ជ្វូ យី វ៉ាង ហូវ ធាវ',
    en:'Move the seat backward', km:'រំកិលកៅអីទៅក្រោយ', icon:'↘️',
    keys:['seat backward','move seat back','push seat back'],
    kkeys:['កៅអីទៅក្រោយ','រំកិលទៅក្រោយ'],
    reply:{zh:'座椅已往后调', en:'Seat moved backward', km:'កៅអីបានរំកិលទៅក្រោយ'} },

  { id:'gc_sunroof_open', cat:'gc', zh:'打开天窗', py:'Dǎ kāi tiān chuāng', kmr:'តា ខាយ ធាន ឈ្វាង',
    en:'Open the sunroof', km:'បើកដំបូលកញ្ចក់', icon:'🌞',
    keys:['open sunroof','sunroof open','open the roof'],
    kkeys:['បើកដំបូលកញ្ចក់','ដំបូលកញ្ចក់'],
    reply:{zh:'天窗已打开', en:'Sunroof opened', km:'ដំបូលកញ្ចក់បានបើក'} },

  { id:'gc_sunroof_close', cat:'gc', zh:'关闭天窗', py:'Guān bì tiān chuāng', kmr:'ក្វាន ពី ធាន ឈ្វាង',
    en:'Close the sunroof', km:'បិទដំបូលកញ្ចក់', icon:'🌥️',
    keys:['close sunroof','sunroof close','close the roof'],
    kkeys:['បិទដំបូលកញ្ចក់','បិទដំបូល'],
    reply:{zh:'天窗已关闭', en:'Sunroof closed', km:'ដំបូលកញ្ចក់បានបិទ'} },

  { id:'gc_sunroof_half', cat:'gc', zh:'天窗开一半', py:'Tiān chuāng kāi yī bàn', kmr:'ធាន ឈ្វាង ខាយ យី ប៉ាន',
    en:'Open the sunroof halfway', km:'បើកដំបូលកញ្ចក់ពាក់កណ្តាល', icon:'🌗',
    keys:['sunroof halfway','half open sunroof','open roof halfway'],
    kkeys:['ដំបូលពាក់កណ្តាល','បើកពាក់កណ្តាល'],
    reply:{zh:'天窗已开一半', en:'Sunroof opened halfway', km:'ដំបូលបានបើកពាក់កណ្តាល'} },

  { id:'gc_sunroof_vent', cat:'gc', zh:'天窗开条缝', py:'Tiān chuāng kāi tiáo fèng', kmr:'ធាន ឈ្វាង ខាយ ធាវ ហ្វុង',
    en:'Vent the sunroof (crack it open)', km:'បើកដំបូលបន្តិចបន្តួច', icon:'🌬️',
    keys:['vent sunroof','crack the sunroof','sunroof vent'],
    kkeys:['ដំបូលបើកបន្តិច','ខ្យល់ដំបូល'],
    reply:{zh:'天窗已开一条缝', en:'Sunroof vented', km:'ដំបូលបានបើកបន្តិច'} },

  { id:'gc_shade_open', cat:'gc', zh:'打开遮阳帘', py:'Dǎ kāi zhē yáng lián', kmr:'តា ខាយ ឈឺ យ៉ាង លៀន',
    en:'Open the sunshade curtain', km:'បើកវាំងននដំបូល', icon:'🪟',
    keys:['open sunshade','open sunshade curtain','sunshade on'],
    kkeys:['បើកវាំងននដំបូល','វាំងននដំបូល'],
    reply:{zh:'遮阳帘已打开', en:'Sunshade opened', km:'វាំងននដំបូលបានបើក'} },

  { id:'gc_shade_close', cat:'gc', zh:'关闭遮阳帘', py:'Guān bì zhē yáng lián', kmr:'ក្វាន ពី ឈឺ យ៉ាង លៀន',
    en:'Close the sunshade curtain', km:'បិទវាំងននដំបូល', icon:'🌑',
    keys:['close sunshade','close sunshade curtain','sunshade off'],
    kkeys:['បិទវាំងននដំបូល','បិទវាំងនន'],
    reply:{zh:'遮阳帘已关闭', en:'Sunshade closed', km:'វាំងននដំបូលបានបិទ'} },

  { id:'gc_cam360_on', cat:'gc', zh:'打开360全景影像', py:'Dǎ kāi 360 quán jǐng yǐng xiàng', kmr:'តា ខាយ 360 ឈ្វាន ជីង យីង ស្យាង',
    en:'Open the 360° camera view', km:'បើកកាមេរ៉ា 360°', icon:'📷',
    keys:['360 camera','open 360 view','surround view','panoramic camera'],
    kkeys:['កាមេរ៉ា 360','ទិដ្ឋភាព 360'],
    reply:{zh:'360全景影像已打开', en:'360° camera on', km:'កាមេរ៉ា 360° បានបើក'} },

  { id:'gc_cam360_off', cat:'gc', zh:'关闭360全景影像', py:'Guān bì 360 quán jǐng yǐng xiàng', kmr:'ក្វាន ពី 360 ឈ្វាន ជីង យីង ស្យាង',
    en:'Close the 360° camera view', km:'បិទកាមេរ៉ា 360°', icon:'🚫',
    keys:['close 360 camera','turn off 360 view','close surround view'],
    kkeys:['បិទកាមេរ៉ា 360','បិទទិដ្ឋភាព 360'],
    reply:{zh:'360全景影像已关闭', en:'360° camera off', km:'កាមេរ៉ា 360° បានបិទ'} },

  { id:'gn_cancel', cat:'gn', zh:'取消导航', py:'Qǔ xiāo dǎo háng', kmr:'ឈូ ស្យាវ តាវ ហាំង',
    en:'Cancel navigation', km:'លុបចោលការនាំផ្លូវ', icon:'⛔',
    keys:['cancel navigation','stop navigation','cancel directions'],
    kkeys:['លុបចោលការនាំផ្លូវ','បោះបង់ការនាំផ្លូវ'],
    reply:{zh:'已取消导航', en:'Navigation canceled', km:'ការនាំផ្លូវត្រូវបានលុបចោល'} }
];
