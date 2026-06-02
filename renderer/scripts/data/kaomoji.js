/**
 * 颜文字合集 — 按心情分类的完整颜文字库
 * 用于语音气泡、随机反应、鼓励雨等场景
 */

const KAOMOJI_BY_MOOD = {
  happy: [
    '(￣▽￣)~*', '(￣▽￣)／', '(*￣︶￣)', '(ノ￣▽￣)', 'ヽ(￣▽￣)ﾉ',
    '(～￣▽￣)～', '︿(￣︶￣)︿', '~(￣▽￣)~*', '(oﾟ▽ﾟ)o', 'ヾ(ﾟ∀ﾟゞ)',
    '(ﾉ´▽｀)ﾉ♪', '(ﾉﾟ▽ﾟ)ﾉ', 'ヾ(✿ﾟ▽ﾟ)ノ', '٩(๑❛ᴗ❛๑)۶', 'ヾ(◍°∇°◍)ﾉﾞ',
    'ヾ(๑╹◡╹)ﾉ"', '(๑*◡*๑)', '٩(๑>◡<๑)۶', '(๑╹◡╹)ﾉ"""', "(๑´ㅂ`๑)",
    'ヽ(°▽、°)ﾉ', "(*´ﾟ∀ﾟ｀)ﾉ", 'ヽ(ﾟ∀ﾟ)ﾒ(ﾟ∀ﾟ)ﾉ', '(´▽`)ﾉ', '(ﾟ▽ﾟ*)',
    '(ﾉﾟ∀ﾟ)ﾉ', 'ヾ(o´∀｀o)ﾉ', 'ヾ(●´∀｀●)', 'ヾ(^∀^)ﾉ', 'ヾ(^Д^*)/',
    'ヾ(@^▽^@)ノ', '(*๓´╰╯`๓)', '(｡◕ˇ∀ˇ◕)', '(^し^)', '(≖ᴗ≖)✧',
    '(◕ᴗ◕✿)', '(✧◡✧)', "(❁´◡`❁)*✲ﾟ*", '(๑¯∀¯๑)', '(ૢ˃ꌂ˂⁎)',
    '(((((ી(･◡･)ʃ)))))', "(*´・ｖ・)", "✺◟(∗❛ัᴗ❛ั∗)◞✺",
    "✧*｡٩(ˊᗜˋ*)و✧*｡", "(*'U`*)", '(づ｡◕ᴗᴗ◕｡)づ', '(ღ˘⌣˘ღ)',
    '＜(▰˘◡˘▰)', 'ಠᴗಠ', '(⁎˃ᴗ˂⁎)', '(≧∀≦)♪', '(≧ω≦)/',
    '(*≧▽≦)', 'Ｏ(≧▽≦)Ｏ', '(ﾉ≧∀≦)ﾉ', 'ヽ(≧∀≦)ﾉ', 'ヾ(≧∇≦*)ヾ',
    '(*≧∪≦)', '(≧∇≦)ﾉ', '☆(≧∀≦*)ﾉ', 'o(*≧▽≦)ツ', 'φ(≧ω≦*)♪',
    '(*ﾉ∀ﾟ*)σ', 'ｄ(･∀･*)♪ﾟ', '♪（＾∀＾●）ﾉ', "(*ﾟ∀ﾟ*)！", '(●´∀｀●)ﾉ',
    "(′▽`〃)", "(*>∀<)ﾉ))★", '(o゜▽゜)o☆', "(*´▽｀)◇ゞ", '((^∀^*))',
    '●ヽ(ﾟ∀ﾟ)ﾉ●', "★´∀｀★", '|●´∀`|σ', "(｀∀´)Ψ", 'ﾍ(ﾟ∀ﾟﾍ)ｱﾋｬ',
    '∑d(*ﾟ∀ﾟ*)', 'ヾ(･∀･｀*)', 'ヽ(´∀`｡)ﾉ', '☆´∀｀☆', 'ヽ(　･∀･)ﾉ',
    '(ﾟ∀ﾟ〃)', "(σ´∀`)σ", '( ﾟ∀ﾟ)', "ε-(´∀｀; )", '(*ﾟ∀ﾟ)=3',
    '(・∀・)', '＼(⌒∀⌒*)/', "╮(‵▽′)╭", 'ψ(｀∇´)ψ', 'ﾍ|･∀･|ﾉ*~●',
    "ﾍ(｀▽´*)", '( ﾟ▽ﾟ)/', 'ヾ(^▽^ヾ)', "(*´v｀)", "(=´▽｀)ゞ",
    '╭(′▽`)╭(′▽`)╯', '（◑▽◐）', "(o´▽｀o)", '(*^▽^*)', '＼(*T▽T*)／',
    'o((*^▽^*))o', '(*＾ワ＾*)', "(*｀▽´*)", 'o(＊＾▽＾＊)o♪',
    'o(*￣▽￣*)o', '(ﾟ▽ﾟ*)♪', 'φ(゜▽゜*)♪', '(*^-^*)ゞ', 'ヾ(*>∀＜*)',
    'ヾ(*Ő౪Ő*)', '(＾▽＾)', '*\\(^o^)/*', '(-^O^-)', '(☆^O^☆)',
    '(＾＿＾)☆', '(＾ω＾)', '(＾∀＾)ﾉｼ', '(^m^)', '(ｖ＾＿＾)ｖ',
    '(★^O^★)', '(★ᴗ★)', '(●＾o＾●)', '(★＞U＜★)', '\\(^o^)/',
    '(＾－＾)V', '\\(^o^)/~', '(*^__^*)', 'Y(^o^)Y', 'q^__^p',
    "(´^ω^`)", 'O(∩_∩)O', '(^.^)Y Ya!!', '(oﾟvﾟ)ノ', 'o(^▽^)o',
    '~(@^_^@)~', '(*^▽^*)', '=￣ω￣=',
    '‧★,:*:‧\\(￣▽￣)/‧:*‧°★*', "d=====(￣▽￣*)b",
    'o(*////▽////*)q', "(´・︶・`)", '(๑＞︶＜)و', '(＊＞︶＜＊)',
    '٩(❛ั︶❛ั＊)', '(•‾︶‾•)y', '(๑>︶<๑)', '(´･ᴗ･`)', '(*’U`*)'
  ],

  love: [
    '（づ￣3￣）づ╭❤～', '(ღ˘︶˘ღ)', 'ღ(๑╯◡╰๑ღ)', 'ლ(╹◡╹ლ)',
    '(*❦ω❦)', "(❁´ω`❁)", '＼＼\٩(\'ω\')و//／／',
    '(づ●─●)づ', '(*ΦωΦ*)', '(⺣◡⺣)♡', '(づ￣ 3￣)づ',
    '(ღˇ◡ˇღ)', '(๑′ᴗ‵๑)♡'
  ],

  cute: [
    '(〃\'▽\'〃)', 'φ(>ω<*)', '(*/ω＼*)', '(｡･ω･｡)', '(｀・ω・´)',
    'ヾ(ｏ･ω･)ﾉ', '(*･ω-q)', '(*･ω< )', '(〃´-ω･)', 'ヽ(･ω･´ﾒ)',
    "d(´ω｀*)", '( ･´ω`･ )', '(>ω･* )ﾉ', '( • ̀ω•́ )✧', 'ヾ(=･ω･=)o',
    "(=´ω｀=)", '(￣.￣)', '（￣︶￣）↗', '￣ω￣=', 'o(*￣3￣)o',
    'o(￣▽￣)ｄ', '(￣３￣)a', '￣▽￣', 'o(￣ε￣*)', '╮(￣▽￣)╭',
    'ｂ（￣▽￣）ｄ', '╰(￣▽￣)╭', '(～o￣3￣)～', '\\（￣︶￣）/',
    '(*￣∇￣*)', '(*￣3￣)╭', 'ㄟ( ▔, ▔ )ㄏ', 'ヾ(･ε･｀*)',
    '(=ﾟωﾟ)ﾉ', '∠( °ω°)／', '(灬°ω°灬)', '(o°ω°o)', "(o´ω`o)ﾉ",
    'ヾ(･ω･*)ﾉ', 'ヾ(❀^ω^)ﾉﾞ', '(*•ω•)', 'ヾ(•ω•`。)', 'ヽ(•ω•ゞ)',
    'ヽ(´•ω•`)､', '┗(•ω•;)┛', 'ヽ(•ω•。)ノ', '(๑•ω•๑)', '(๑Ő௰Ő๑)',
    '(◍´꒳`◍)', '(✪ω✪)', '(✺ω✺)', '(*◎ｖ◎*)', "(❁´3`❁)",
    'ヾ(*ΦωΦ)ツ', "(❀ฺ´∀`❀ฺ)ﾉ", "✧*｡٩(ˊᗜˋ*)و✧*｡",
    '✧⁺⸜(●˙▾˙●)⸝⁺✧', '✺◟(∗❛ัᴗ❛ั∗)◞✺', '(｡◝ᴗ◜｡)', '(๑╹っ╹๑)',
    "(´⌣`ʃƪ)", 'φ(．．｡)', '<(▰˘◡˘▰)>', "ε = = (づ′▽`)づ", "('ω')",
    '(ε: )', '(.ω.)', '( :3 )', "(´•༝•`)", '(•ᴗ•)', '｡◕ᴗ◕｡',
    'ლ(｀∀´ლ)', 'ლ(＾ω＾ლ)', 'ლ(・∀・ )ლ', 'ლ(・ ิω・ิლ)',
    'ლ(|||⌒εー|||)ლ', 'ლ(́◉◞౪◟◉‵ლ)', 'ლ(╹◡╹ლ)', 'ლ(╹ε╹ლ)',
    'ლ(❛◡❛✿)ლ', 'ლ(⁰⊖⁰ლ)', 'ฅ•̀∀•́ฅ', '(>ω･*)ﾉ',
    'ヽ(^ω^)ﾉ', '(ﾟωﾟ)ﾉ☆', 'ヾ(ω`)/',
    '(〃^ω^)', '(･ิω･ิ)', 'ღ(๑╯◡╰๑ღ)'
  ],

  sad: [
    '(；´д｀)ゞ', '(；′⌒`)', '(；д；)', '(；へ：)', '(╥╯^╰╥)',
    '╮(╯﹏╰）╭', '╭(╯^╰)╮', '(╯︵╰)', '(╯﹏╰)b', '罒ω罒',
    "|*´Å`)ﾉ", '( Ĭ ^ Ĭ )', '(T＿T)', '(Ｔ▽Ｔ)', '(ㄒoㄒ)',
    '╥﹏╥', 'o(╥﹏╥)o', '〒▽〒', '(*T_T*)', 'T^T',
    '/(ㄒoㄒ)/~~', '(T ^ T)', 'ε(┬┬﹏┬┬)3', 'o(TωT)o',
    '(〒︿〒)', 'T_T\\"', '┭┮﹏┭┮', '(つД`)',
    '(ﾉД`)', '(ノДＴ)', 'ﾍ(;´Д｀ﾍ)', '(ｉДｉ)', '(つД｀)･ﾟ･',
    "(;´༎ຶД༎ຶ`)", '༼༎ຶᴗ༎ຶ༽', '(ಥ_ಥ)', '(ಥ﹏ಥ)', "(´థ౪థ)σ",
    'ಠ╭╮ಠ', '(｡･ˇдˇ･｡)', '(｡•́︿•̀｡)', '｢(ﾟﾍﾟ)', "(′へ`、)",
    'ヽ(。>д<)ｐ', "(*´д`*)", '(◢д◣)', '(ŎдŎ；)', '⊙︿⊙',
    '⊙﹏⊙', '⊙﹏⊙|||', '(ó﹏ò｡)', '(」＞＜)」', '(〃＞＿＜;〃)',
    '{>~<}', '>_<', '~~o(>_<)o ~~', '..(｡•ˇ‸ˇ•｡…',
    '(˘•ω•˘)', '(˘•灬•˘)', '(ノへ￣、)', '(*￣︿￣)', '…(﹂_﹂)…',
    '￣へ￣', 'o(︶︿︶)o', '(︶︹︺)', '(/□＼*)', '(／_＼)',
    "(´-ι_-｀)", '(⇀‸↼‶)', '(눈‸눈)', '(个_个)', '(!)_(!)',
    '打击!!＿|￣|○', "ε=(´ο｀*)))唉", '((유∀유|||))',
    '..(｡•ˇ‸ˇ•｡)…', '⁞⁞⁞⁞꒰ ´╥ д ╥`  ू ꒱⁞⁞⁞⁞'
  ],

  angry: [
    '￣へ￣', '<(￣ ﹌ ￣)>', '<(￣ ﹌ ￣)@m', '(－＂－怒)',
    '(╬￣皿￣)', '(艹皿艹)', '(`皿´)', '(#｀皿´)', '(╬￣皿￣)=○',
    '(〃´皿`)q', '凸(艹皿艹 )', '(*´ﾉ皿`)', '(*｀皿´*)ﾉ',
    '(〃＞皿＜)', '（╬￣皿￣）＝○＃（￣＃）３￣）', '(╬◣д◢)',
    '(▼ヘ▼#)', '(〝▼皿▼)', '(▼へ▼メ)', '(▼皿▼#)', 'o(▼皿▼メ;)o',
    'ヽ(#`Д´)ﾉ', 'ヽ(#`Д´)ﾉ┌┛〃', 'ヾ(｡｀Д´｡)ﾉ彡', 'ヽ(`Д´)ﾉ',
    'ヽ(●-`Д´-)ノ', '(ｰ̀дｰ́)', '(╯°Д°)╯', "m9(`Д´)",
    "(`-д-；)ゞ", '(╯>д<)╯⁽˙³˙⁾', 'o(*≧д≦)o!!', '꒰╬•᷅д•᷄╬꒱',
    '(ノ｀Д)ノ', '(｀Д´)', '(ﾟДﾟ*)ﾉ', '(ー`´ー)', "(#‵′)",
    '(ﾟ益ﾟメ)', '(╬｀益´)ｺ', "(*｀Ω´*)v", "(｡・`ω´･)",
    '(｀_´)', '(｀⌒´メ)', "(;｀O´)o", '(｀_ゝ´)', '(｀ι_´メ)',
    '(｀ﾍ´)=3', '(ﾉ｀⊿´)ﾉ', '(ﾒ｀ﾛ´)/', "(ง'-̀'́)ง",
    "<(｀^´)>", '٩(๑`^´๑)۶', 'ヽ(#｀_つ´)ﾉ', '（｀へ´）',
    'щ(｀ω´щ)', "( ｀д′)", "(σ｀д′)σ", "(`Д´*)9",
    'ヽ(｀Д´)ﾉ', "(*`ェ´*)", '凸ˋ_ˊ#', '(╰_╯)#', 'ヽ(｀⌒´)ﾉ',
    "(*`д´*)", '(●｀エ´)', "(`o´)", '╰_ ╯', "d(･｀ω´･d*)",
    "(｀ω´*)", '(•́へ•́╬)', '╰(‵□′)╯', 'o(≧口≦)o', 'ヽ（≧□≦）ノ'
  ],

  wink: [
    '(^_−)☆', '(๑＞ڡ＜)☆', '(－ｏ⌒) ☆', '(<ゝω・)☆', '(＾＿－)',
    'ヽ(^_−)ﾉ', '❥(^_-)', '✧(≖ ◡ ≖✿', '❥(ゝω・✿ฺ)', '✧(＾＿－✿',
    '(๑＞ڡ＜)✿', '(－ｏ⌒)✿', '(⌒.−)＝★', '＾＿−)≡★', '☆￣(＞。☆)',
    '(*ﾉω・*)ﾃﾍ', '☆(－ｏ⌒)', '★(－ｏ⌒)', '(－ｏ⌒)=3', '(・ω<)',
    '(・ω<) てへぺろ', '(･ω<)☆', '(・ω<) ﾃﾍﾍﾟﾛ', '(・ω≦)',
    '（ゝω・）', '☆(ゝω･)v', '☆～（ゝ。∂）', 'ヽ(。ゝω・。)ﾉ',
    '(。ゝω・。)☆', '（ゝω・） ﾃﾍﾍﾟﾛ', '（ゝω・）vｷｭﾋﾟｯ',
    '─━ _ ─━✧', '☆⌒(＞。≪)', '(￢_￢)瞄', '＾＿－)≡★'
  ]
};

/**
 * 颜文字+文字短语 — 带中文语境的颜文字表达
 */
const KAOMOJI_PHRASES_ZH = {
  happy: [
    '(*^▽^*)开心',
    'd=====(￣▽￣*)b 顶',
    "o(*￣▽￣*)o 耶~",
    '٩( \'ω\' )و get！',
    '✧*｡٩(ˊᗜˋ*)و✧*｡ 太棒了',
    '(ﾉ´▽｀)ﾉ♪ 哼哼~',
    'ヾ(◍°∇°◍)ﾉﾞ 好耶',
    '(*≧▽≦) 哈哈哈',
    '\\(^o^)/ 万岁',
    '(≧∀≦)♪ 好开心',
    'o(＊＾▽＾＊)o♪ 幸福'
  ],

  love: [
    '(๑′ᴗ‵๑)Ｉ Lᵒᵛᵉᵧₒᵤ❤',
    '(*^o^)人(^o^*) 友谊万岁',
    '(づ｡◕ᴗᴗ◕｡)づ 抱抱',
    '(ღ˘⌣˘ღ) 么么哒',
    '(*❦ω❦) 暖暖的',
    '(⺣◡⺣)♡ 喜欢',
    '(｡♥ᴗ♥｡) 心动'
  ],

  encourage: [
    'ᕦ(･ㅂ･)ᕤ 加油',
    '٩( \'ω\' )و 冲鸭',
    'Fight!!(ｏ^-^)尸~\'\'☆ミ☆ミ',
    '( • ̀ω•́ )✧ 一定行',
    '(๑＞︶＜)و 奥利给',
    'Σ(σ｀•ω•´)σ 起飞！',
    '(ง •_•)ง 不认输',
    '(σﾟ∀ﾟ)σ..:*☆哎哟不错哦',
    '(๑╹っ╹๑) 我不休息我还能学',
    '(｀・ω・´) 全力以赴'
  ],

  sad: [
    '(╥╯﹏╰╥)ง 好难过',
    '(ಥ_ಥ) 哭了',
    '(╥╯^╰╥) 抱抱我',
    '(つД`) 呜呜',
    '(╯︵╰) 叹气',
    'T^T 好委屈',
    '(;´༎ຶД༎ຶ`) 痛哭'
  ],

  surprised: [
    '!!!∑(ﾟДﾟノ)ノ 啊！！',
    'Σ(っ°Д°;)っ卧槽，不见了',
    '(ﾟДﾟ*)ﾉ 什么！',
    'Σσ(・Д・；) 我我我什么都没做!!!',
    'o(ﾟДﾟ)っ！ 纳尼',
    '(○|￣|) 天哪',
    '∑(ﾟДﾟ) 嘿嘿嘿'
  ],

  funny: [
    "(*╹▽╹*) 土豪我们做朋友好不好",
    '_(:ι」∠)_ 好饿，但是不想动',
    "(*▼ｰ(｡-_-｡) 画风不对，如何相爱",
    "ψ(｀∇´)ψ 嘿嘿嘿",
    "(σ´∀`)σ 给你看个好东西",
    "(￣(∞)￣)　 躺平",
    "(｡•ˇ‸ˇ•｡) 滚犊子",
    "(๑‾᷅^‾᷅๑) 嫌弃你",
    "●\'ω\')_旦~ 请你喝茶",
    "(((┏(;￣▽￣)┛ 装完逼就跑",
    "(\'∇\')シ┳━┳ 掀桌",
    "(｀∀´)Ψ 坏笑",
    "‑=≡Σ(((つ•̀ω•́)つ 冲啊",
    "(σﾟ∀ﾟ)σ..:*☆哎哟不错哦",
    "d=====(￣▽￣*)b 顶",
    "=￣ω￣= 喵了个咪",
    "聊五分钱的天吗？|ω･)و ̑̑༉",
    "(๑⁼̴̀д⁼̴́๑)ﾄﾞﾔｯ!! What are you 弄啥嘞！",
    "睡什么睡，起来嗨！",
    "(￢_￢)瞄"
  ],

  shy: [
    '|ू･ω･` ) 偷看',
    '(*/ω＼*) 脸红',
    '┓(;´_｀)┏ 尴尬',
    '(〃\'▽\'〃) 害羞',
    '(灬°ω°灬) 不好意思'
  ],

  sleepy: [
    '(。-ω-)zzz 睡着了',
    '(Θ３Θ) 困',
    '(бвб))zzz 呼噜',
    '(*￣︿￣) 打盹',
    '(˘•ω•˘) 迷糊',
    "(´-ι_-｀) 好困"
  ],

  cool: [
    'ヾ(⌐ ■_■) 墨镜',
    '(￣▽￣)~* 淡定',
    '(￣ェ￣;) 无语',
    '┗( ▔, ▔ )┛ 无所谓',
    'ヽ(ー_ー)ノ 随便',
    '(｀_ゝ´) 哼'
  ],

  react: [
    'Thanks♪(･ω･)ﾉ 谢谢',
    '٩( \'ω\' )و 蟹蟹！',
    '(ノ▽｀*)ノ[你回来啦♪]=з=з=з',
    '(ノ_；＼( ｀ロ´)／谁敢欺负我的人！',
    '(\'∇\')シ┳━┳ 掀桌',
    '( ￣ ▽￣)o╭╯☆#╰ 敢打老子，看招',
    '؏؏☝ᖗ乛◡乛ᖘ☝؏؏ 完美',
    '(๑Ő௰Ő๑) 惊呆了',
    "(´థ౪థ)σ你假期竟然没胖",
    "(╥╯﹏╰╥)ง光宗耀祖支撑着我去教室"
  ],

  scared: [
    '(((;꒪ꈊ꒪;))) 怕怕',
    'o((⊙﹏⊙))o 不妙',
    '(ŎдŎ；) 慌了',
    '(/□＼*) 不敢看',
    '(ﾟДﾟ; 嘛嘛嘛'
  ]
};

/**
 * 颜文字部件库 — 从 ~390 个颜文字中提取的原子组件
 *
 * 每种部件按 key 索引，value 为实际字符
 * eyes/arms/bounds/deco: [left, right]
 * mouths: string
 */

const KAOMOJI_PARTS = {

  // === 眼睛 ===
  // [left_char, right_char]
  eyes: {
    // 中性/基础
    dot:       ['·', '·'],
    blank:     [' ', ' '],
    // 开心系列
    happy:     ['^', '^'],
    caret:     ['^', '^'],
    grin:      ['≧', '≧'],
    vline:     ['￣', '￣'],
    dash:      ['-', '-'],
    content:   ['~', '~'],
    sparkle:   ['✧', '✧'],
    star:      ['★', '★'],
    star2:     ['☆', '☆'],
    round:     ['●', '●'],
    dotround:  ['◉', '◉'],
    cute:      ['◕', '◕'],
    wide:      ['⊙', '⊙'],
    big:       ['O', 'O'],
    flower:    ['✿', '✿'],
    bloom:     ['❁', '❁'],
    dot2:      ['•', '•'],
    ring:      ['○', '○'],
    cross:     ['×', '×'],
    smug:      ['¬', '¬'],
    curoust:   ['°', '°'],
    // 悲伤系列
    teary:     [';', 'T'],
    tear2:     ['T', 'T'],
    cry:       ['╥', '╥'],
    cry2:      ['ಥ', 'ಥ'],
    sad:       [';', ';'],
    down:      ['﹏', '﹏'],
   忧:         ['⊙', '⊙'],
    dark:      ['◢', '◣'],
    worried:   ['・', '・'],
    sweat:     [';', '·'],
    // 生气系列
    glare:     ['>', '<'],
    rage:      ['▼', '▼'],
    rage2:     ['皿', ''],   // 不对称特殊
    furious:   ['╬', '╬'],
    face:      ['艹', '艹'],
    angry:     ['\"', '\"'],
    flat:      ['─', '─'],
    // 惊讶
    surprised: ['O', 'O'],
    shock:     ['ﾟ', 'ﾟ'],
    shock2:    ['Д', 'Д'],
    blank2:    ['□', '□'],
    // 可爱系列
    blush:     ['灬', '灬'],
    cat:       ['Φ', 'Φ'],
    cat2:      ['Ő', 'Ő'],
    tiny:      ['ิ', 'ิ'],   // 泰语字符
    baby:      ['╹', '╹'],
    sleepy:    ['-', '-'],
    sleep:     ['─', '─'],
    confused:  ['?', '?'],
    // 非对称（眨眼/特殊）
    wink_r:    ['^', '-'],
    wink_l:    ['-', '^'],
    wink2_r:   ['^', '−'],
    wink2_l:   ['−', '^'],
    peek:      ['·', '<'],
    peek_l:    ['>', '·'],
    look_l:    ['·', '⟩'],
    look_r:    ['⟨', '·'],
    wink_star: ['☆', '-'],
    wink3:     ['＾', '−'],
    // 混合
    mix_ht:    ['>', 'T'],
    mix_oc:    ['○', '●'],
    mix_oc2:   ['●', '○'],
    mix_cs:    ['✧', '★'],
  },

  // === 嘴巴 ===
  mouths: {
    // 可爱/中性
    omega:    'ω',
    cat:      '3',
    tiny:     'ᴗ',
    blush2:   '∇',
    dot3:     '•',
    // 开心
    smile:    '▽',
    grin:     '∀',
    cheer:    '▽',
    vsmile:   '︶',
    crescent: '◡',
    music:    '♪',
    peace:    'v',
    wide:     '∀',
    wai:      'ワ',
    triangle: '∇',
    // 悲伤
    cry:      '﹏',
    frown:    '︿',
    wavy:     '≈',
    flat:     '─',
    down:     'д',
    small:    'o',
    sigh:     'へ',
    tonguet:  'ρ',
    pout:     '∪',
    // 生气
    rage:     '皿',
    scream:   '口',
    angry:    'Д',
    furious:  'へ',
   怒:        'ω',
    // 惊讶
    open:     'O',
    shock:    '▽',
    big:      '▽',
    surprise: 'o',
    // 困倦
    yawn:     'o',
    sleep:    'ω',
    // 特殊
    star:     '★',
    note:     '♪',
    blush3:   '灬',
    cap:      '∩',
    zero:     '0',
    U:        'U',
    xi:       '夕',
  },

  // === 手臂 ===
  // [left_str, right_str]
  arms: {
    none:     ['', ''],
    // 欢呼/举手
    cheer:    ['ヽ', 'ﾉ'],
    cheer2:   ['ヾ', 'ﾉ'],
    cheer3:   ['ヽ', 'ﾉ'],
    cheer_w:  ['ヾ', 'ﾉﾞ'],
    cheer_d:  ['ヾ', 'ﾉﾞ'],
    // 抱/环绕
    hug:      ['o', 'o'],
    hug2:     ['Ｏ', 'Ｏ'],
    hug3:     ['(*', '*)'],
    // 竖拇指/评价
    thumb_l:  ['d=', ''],
    thumb_r:  ['', 'b'],
    thumbs:   ['d=', 'b'],
    ok:       ['o(', ')o'],
    // 指向/攻击
    point:    ['凸', ''],
    point2:   ['', '凸'],
    grab:     ['σ', 'σ'],
    grab2:    ['σ', ''],
    // 张开
    spread:   ['＼', '/'],
    spread2:  ['\\', '/'],
    spread3:  ['/', '\\'],
    // 挥手
    wave_l:   ['ψ', ''],
    wave_r:   ['', 'Ψ'],
    wave:     ['ψ', 'Ψ'],
    // 持物
    hold:     ['φ', '♪'],
    pen:      ['φ', ''],
    // 拳/力量
    fist_l:   ['o(', ''],
    fist_r:   ['', ')o'],
    power:    ['ᕙ', 'ᕗ'],
    fight:    ['(ง', 'ง)'],
    punch:    ['(ง', ')ง'],
    cast:     ['╰(', ')╯'],
    toss:     ['(╯', ')╯'],
    shield:   ['ᕦ(', ')ᕤ'],
    dance:    ['└(', ')┘'],
    grabby:   ['ლ(', 'ლ)'],
    cheer_up: ['٩(', ')و'],
    wing:     ['ʚ', 'ɞ'],
    // 抱歉/投降
    bow:      ['m(_', '_)m'],
    surrender:['(´', '`)', ],
    // 特殊
    run:      ['─=≡Σ', ''],
    run2:     ['ε = =', ''],
    fish:     ['', '><』'],
    flip:     ['(╯', '╯'],
    push:     ['∑', ''],
    clap:     ['ヽ(', ')ﾉ'],
    stretch:  ['╭(', ')╯'],
    hug_wall: ['щ(', 'щ)'],
  },

  // === 边界 ===
  bounds: {
    paren:    ['(', ')'],
    paren2:   ['（', '）'],
    angle:    ['<', '>'],
    angle2:   ['＜', '＞'],
    square:   ['[', ']'],
    none:     ['', ''],
    brace:    ['{', '}'],
    // 特殊（有时边界被手臂替代）
    wave_l:   ['~', ')'],
    wave_r:   ['(', '~'],
    flower:   ['❁', '❁'],
    deco_r:   ['✧', '✧'],
  },

  // === 装饰 ===
  // [left_str, right_str]
  deco: {
    none:     ['', ''],
    star:     ['☆', '☆'],
    stars:    ['★', '★'],
    sparkle:  ['✧', '✧'],
    sparkle2: ['✧', '✧*｡'],
    heart:    ['♡', '♡'],
    hearts:   ['♥', '♥'],
    flower:   ['❁', '✿'],
    flower2:  ['❀', '❀'],
    music:    ['♪', '♪'],
    note:     ['♫', '♫'],
    wave:     ['~', '~'],
    wave2:    ['~~', '~~'],
    spark3:   ['✺◟', '◞✺'],
    glow:     ['✧*｡', '*✧'],
    glow2:    ['✧⁺⸜', '⸝⁺✧'],
    check:    ['✓', '✓'],
    crown:    ['♛', '♛'],
    fire:     ['🔥', '🔥'],
    star_trail: ['', '☆ﾟ*'],
  }
};

/**
 * 预设表情 — 直接引用 KAOMOJI_PARTS 的 key 组合
 * resolver 会将这些展开为实际的段位替换映射
 */
const PRESET_EXPRESSIONS = {
  // === 开心 ===
  happy_smile:     { eyes: 'happy',   mouth: 'smile',  arms: 'none',  bounds: 'paren', deco: 'none' },
  happy_cheer:     { eyes: 'happy',   mouth: 'grin',   arms: 'cheer', bounds: 'paren', deco: 'none' },
  happy_big:       { eyes: 'round',   mouth: 'grin',   arms: 'cheer2',bounds: 'paren', deco: 'none' },
  happy_star:      { eyes: 'star',    mouth: 'smile',  arms: 'none',  bounds: 'paren', deco: 'none' },
  happy_v:         { eyes: 'vline',   mouth: 'smile',  arms: 'none',  bounds: 'paren', deco: 'none' },
  happy_wave:      { eyes: 'vline',   mouth: 'smile',  arms: 'none',  bounds: 'paren', deco: 'none' },
  happy_excited:   { eyes: 'grin',    mouth: 'wide',   arms: 'cheer', bounds: 'paren', deco: 'sparkle' },
  happy_proud:     { eyes: 'grin',    mouth: 'music',  arms: 'hold',  bounds: 'paren', deco: 'none' },
  happy_cute:      { eyes: 'cute',    mouth: 'tiny',   arms: 'none',  bounds: 'paren', deco: 'none' },
  happy_sparkle:   { eyes: 'sparkle', mouth: 'crescent',arms: 'none', bounds: 'paren', deco: 'sparkle' },
  happy_wai:       { eyes: 'grin',    mouth: 'wai',    arms: 'spread',bounds: 'paren', deco: 'none' },
  happy_ok:        { eyes: 'happy',   mouth: 'smile',  arms: 'thumbs',bounds: 'paren', deco: 'none' },
  happy_clap:      { eyes: 'happy',   mouth: 'smile',  arms: 'clap',  bounds: 'paren', deco: 'music' },
  happy_yay:       { eyes: 'grin',    mouth: 'grin',   arms: 'cheer3',bounds: 'paren', deco: 'star' },
  happy_dance:     { eyes: 'happy',   mouth: 'grin',   arms: 'dance', bounds: 'paren', deco: 'note' },
  happy_launch:    { eyes: 'sparkle', mouth: 'smile',  arms: 'cheer_up', bounds: 'paren', deco: 'sparkle' },

  // === 喜爱 ===
  love:            { eyes: 'content', mouth: 'omega',  arms: 'hug',   bounds: 'paren', deco: 'none' },
  love_eyes:       { eyes: 'star',    mouth: 'cat',    arms: 'none',  bounds: 'paren', deco: 'none' },
  love_hug:        { eyes: 'content', mouth: 'cat',    arms: 'hug2',  bounds: 'paren', deco: 'hearts' },
  love_big:        { eyes: 'round',   mouth: 'tiny',   arms: 'hug',   bounds: 'paren', deco: 'heart' },
  love_hearts:     { eyes: 'flower',  mouth: 'crescent',arms:'none',  bounds: 'paren', deco: 'none' },
  love_shy:        { eyes: 'dot2',    mouth: 'tiny',   arms: 'none',  bounds: 'paren', deco: 'none' },
  love_reach:      { eyes: 'content', mouth: 'cat',    arms: 'grabby', bounds: 'paren', deco: 'heart' },

  // === 伤心 ===
  sad:             { eyes: 'sad',     mouth: 'frown',  arms: 'none',  bounds: 'paren', deco: 'none' },
  sad_cry:         { eyes: 'teary',   mouth: 'cry',    arms: 'hug',   bounds: 'paren', deco: 'none' },
  sad_cry2:        { eyes: 'cry',     mouth: 'cry',    arms: 'none',  bounds: 'paren', deco: 'none' },
  sad_tears:       { eyes: 'cry2',    mouth: 'flat',   arms: 'none',  bounds: 'paren', deco: 'none' },
  sad_bow:         { eyes: 'dash',    mouth: 'flat',   arms: 'none',  bounds: 'paren', deco: 'none' },
  sad_down:        { eyes: 'flat',    mouth: 'down',   arms: 'none',  bounds: 'paren', deco: 'none' },
  sad_sigh:        { eyes: 'sad',     mouth: 'sigh',   arms: 'none',  bounds: 'paren', deco: 'none' },
  sad_worried:     { eyes: 'worried', mouth: 'frown',  arms: 'none',  bounds: 'paren', deco: 'none' },
  sad_defeated:    { eyes: 'flat',    mouth: 'flat',   arms: 'none',  bounds: 'paren', deco: 'none' },
  sad_surrender:   { eyes: 'content', mouth: 'flat',   arms: 'none',  bounds: 'paren', deco: 'none' },

  // === 生气 ===
  angry:           { eyes: 'glare',   mouth: 'rage',   arms: 'none',  bounds: 'paren', deco: 'none' },
  angry_rage:      { eyes: 'rage',    mouth: 'rage',   arms: 'point', bounds: 'paren', deco: 'none' },
  angry_yell:      { eyes: 'furious', mouth: 'scream', arms: 'cheer', bounds: 'paren', deco: 'none' },
  angry_furious:   { eyes: 'dark',    mouth: 'angry',  arms: 'none',  bounds: 'paren', deco: 'none' },
  angry_point:     { eyes: 'glare',   mouth: 'rage',   arms: 'grab2', bounds: 'paren', deco: 'none' },
  angry_flip:      { eyes: 'shock',   mouth: 'rage',   arms: 'flip',  bounds: 'paren', deco: 'none' },
  angry_fight:     { eyes: 'glare',   mouth: 'rage',   arms: 'fight', bounds: 'paren', deco: 'none' },
  angry_punch:     { eyes: 'rage',    mouth: 'scream', arms: 'punch', bounds: 'paren', deco: 'fire' },
  angry_throw:     { eyes: 'furious', mouth: 'rage',   arms: 'toss',  bounds: 'paren', deco: 'none' },

  // === 惊讶 ===
  surprised:       { eyes: 'wide',    mouth: 'open',   arms: 'none',  bounds: 'paren', deco: 'none' },
  shocked:         { eyes: 'big',     mouth: 'shock',  arms: 'spread',bounds: 'paren', deco: 'none' },
  surprised_star:  { eyes: 'star',    mouth: 'open',   arms: 'none',  bounds: 'paren', deco: 'sparkle' },
  shocked_big:     { eyes: 'wide',    mouth: 'scream', arms: 'spread',bounds: 'paren', deco: 'none' },
  surprised_what:  { eyes: 'shock',   mouth: 'down',   arms: 'none',  bounds: 'paren', deco: 'none' },
  surprised_shield:{ eyes: 'wide',    mouth: 'open',   arms: 'shield',bounds: 'paren', deco: 'sparkle' },

  // === 可爱/卖萌 ===
  cute:            { eyes: 'dot',     mouth: 'omega',  arms: 'none',  bounds: 'paren', deco: 'none' },
  cute_cat:        { eyes: 'cute',    mouth: 'cat',    arms: 'none',  bounds: 'paren', deco: 'none' },
  cute_blush:      { eyes: 'blush',   mouth: 'omega',  arms: 'none',  bounds: 'paren', deco: 'none' },
  cute_cat2:       { eyes: 'cat',     mouth: 'omega',  arms: 'none',  bounds: 'paren', deco: 'none' },
  cute_shy:        { eyes: 'baby',    mouth: 'tiny',   arms: 'none',  bounds: 'paren', deco: 'none' },
  cute_hug:        { eyes: 'cute',    mouth: 'tiny',   arms: 'hug',   bounds: 'paren', deco: 'heart' },
  cute_paw:        { eyes: 'dot2',    mouth: 'cat',    arms: 'none',  bounds: 'paren', deco: 'none' },
  cute_bloom:      { eyes: 'flower',  mouth: 'tiny',   arms: 'none',  bounds: 'paren', deco: 'flower' },
  cute_star:       { eyes: 'sparkle', mouth: 'tiny',   arms: 'none',  bounds: 'paren', deco: 'star' },
  cute_dote:       { eyes: 'baby',    mouth: 'cat',    arms: 'none',  bounds: 'paren', deco: 'none' },
  cute_flap:       { eyes: 'cute',    mouth: 'tiny',   arms: 'wing',  bounds: 'paren', deco: 'sparkle' },

  // === 眨眼 ===
  wink:            { eyes: 'wink_r',  mouth: 'omega',  arms: 'none',  bounds: 'paren', deco: 'none' },
  wink_cheeky:     { eyes: 'wink_r',  mouth: 'cat',    arms: 'none',  bounds: 'paren', deco: 'star' },
  wink_star:       { eyes: 'wink_star',mouth: 'tiny',  arms: 'none',  bounds: 'paren', deco: 'none' },
  wink_wave:       { eyes: 'wink_r',  mouth: 'smile',  arms: 'cheer', bounds: 'paren', deco: 'none' },
  wink_cute:       { eyes: 'wink2_r', mouth: 'cat',    arms: 'none',  bounds: 'paren', deco: 'star' },
  wink_playful:    { eyes: 'wink_r',  mouth: 'cat',    arms: 'grab',  bounds: 'paren', deco: 'none' },

  // === 困倦 ===
  sleepy:          { eyes: 'dash',    mouth: 'yawn',   arms: 'none',  bounds: 'paren', deco: 'none' },
  sleeping:        { eyes: 'sleep',   mouth: 'flat',   arms: 'none',  bounds: 'paren', deco: 'none' },
  drowsy:          { eyes: 'flat',    mouth: 'yawn',   arms: 'none',  bounds: 'paren', deco: 'none' },

  // === 得意 ===
  smug:            { eyes: 'smug',    mouth: 'cat',    arms: 'none',  bounds: 'paren', deco: 'none' },
  smug_cool:       { eyes: 'vline',   mouth: 'smile',  arms: 'none',  bounds: 'paren', deco: 'none' },
  smug_star:       { eyes: 'smug',    mouth: 'cat',    arms: 'none',  bounds: 'paren', deco: 'star' },

  // === 中性 ===
  neutral:         { eyes: 'dot',     mouth: 'omega',  arms: 'none',  bounds: 'paren', deco: 'none' },
  normal:          { eyes: 'vline',   mouth: 'vsmile', arms: 'none',  bounds: 'paren', deco: 'none' },
  curious:         { eyes: 'curoust', mouth: 'omega',  arms: 'none',  bounds: 'paren', deco: 'none' },
  confused:        { eyes: 'confused',mouth: 'wavy',   arms: 'none',  bounds: 'paren', deco: 'none' },
};

/**
 * 心情 → 预设映射
 * 每个心情对应多个预设，运行时随机选一个
 */
const MOOD_PRESETS = {
  happy:      ['happy_cheer', 'happy_smile', 'happy_big', 'happy_excited', 'happy_v', 'happy_dance', 'happy_launch'],
  love:       ['love', 'love_eyes', 'love_hug', 'love_big', 'love_hearts', 'love_reach'],
  sad:        ['sad_cry', 'sad', 'sad_cry2', 'sad_tears', 'sad_sigh'],
  angry:      ['angry', 'angry_rage', 'angry_yell', 'angry_furious', 'angry_fight', 'angry_punch', 'angry_throw'],
  surprised:  ['surprised', 'shocked', 'surprised_star', 'shocked_big', 'surprised_shield'],
  playing:    ['wink_playful', 'happy_cheer', 'happy_ok', 'wink_wave', 'happy_dance', 'cute_flap'],
  hungry:     ['cute_cat', 'sad_down', 'cute'],
  sleepy:     ['sleepy', 'drowsy'],
  sleeping:   ['sleeping'],
  normal:     ['neutral', 'normal'],
  greeting:   ['happy_wave', 'happy_v', 'happy_smile', 'happy_yay', 'happy_launch'],
  satisfied:  ['happy_cute', 'smug', 'happy_smile'],
  curious:    ['curious', 'confused', 'cute_cat'],
  alert:      ['surprised', 'surprised_what'],
  stressed:   ['sad_surrender', 'sad_defeated', 'confused'],
  drowsy:     ['drowsy', 'sleepy'],
  eating:     ['happy_smile', 'cute_cat'],
  levelup:    ['happy_excited', 'happy_yay', 'happy_big'],
  evolve:     ['happy_excited', 'happy_star'],
  walking:    ['happy_v'],
  blink:      [],
  look_left:  [],
  look_right: [],
  look_up:    [],
  stretch:    ['happy_cute'],
  clean:      ['happy_smile'],
  tail_chase: ['surprised'],
  yawn:       ['drowsy'],
  shy:        ['cute_shy', 'love_shy'],
  confused:   ['confused'],
  worried:    ['sad_worried', 'sad_defeated'],
  smug:       ['smug', 'smug_cool', 'smug_star'],
  winking:    ['wink', 'wink_cheeky'],
};

/**
 * 解析器：将预设名展开为段位替换映射
 * @param {string} presetName - PRESET_EXPRESSIONS 中的 key
 * @returns {object} { 'seg-eye-l': char, 'seg-mouth': char, ... }
 */
function resolvePreset(presetName) {
  const preset = PRESET_EXPRESSIONS[presetName];
  if (!preset) return null;

  const eyes = KAOMOJI_PARTS.eyes[preset.eyes || 'dot'] || ['·', '·'];
  const mouth = KAOMOJI_PARTS.mouths[preset.mouth || 'omega'] || 'ω';
  const arms = KAOMOJI_PARTS.arms[preset.arms || 'none'] || ['', ''];
  const bounds = KAOMOJI_PARTS.bounds[preset.bounds || 'paren'] || ['(', ')'];
  const deco = KAOMOJI_PARTS.deco[preset.deco || 'none'] || ['', ''];

  return {
    'seg-deco-l':   deco[0],
    'seg-arm-l':    arms[0],
    'seg-bound-l':  bounds[0],
    'seg-eye-l':    eyes[0],
    'seg-mouth':    mouth,
    'seg-eye-r':    eyes[1],
    'seg-bound-r':  bounds[1],
    'seg-arm-r':    arms[1],
    'seg-deco-r':   deco[1],
  };
}

/**
 * 根据心情随机选一个预设并解析
 * @param {string} mood
 * @returns {object|null} 段位映射，或 null（无对应预设）
 */
function resolveMoodPreset(mood) {
  const candidates = MOOD_PRESETS[mood];
  if (!candidates || candidates.length === 0) return null;
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  return resolvePreset(pick);
}
