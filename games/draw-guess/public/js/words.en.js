/* ===== words.en.js — 英文題庫（Draw & Guess 英文版題目） =====
 *
 * 一個 id 對應 words.js 裡同一個中文詞條：第一個是顯示用的標準答案，
 * 「|」後面是也算對的說法（同義詞、常見寫法）。比對時不分大小寫、容忍前後空白，
 * 並忽略連字號、標點、重音符號、開頭的 a／an／the 與單複數差異（見 words.js 的 matchEn）。
 * 分類與難度沿用中文題庫（同一個 id 同一個分類與難度）；分類名稱的英文在 words.js。
 * 行尾註解是對應的中文題目，方便維護；新增中文題時要在這裡補上同一個 id。
 * 瀏覽器載入後掛在 window.WordsEN，Node 以 require 取得。
 */
(function (root, factory) {
  'use strict';
  var data = factory();
  if (typeof module === 'object' && module.exports) module.exports = data;
  root.WordsEN = data;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  return {
    'cat': "cat|kitty|kitten", // 貓
    'dog': "dog|puppy", // 狗
    'fish': "fish", // 魚
    'bird': "bird", // 鳥
    'rabbit': "rabbit|bunny", // 兔子
    'pig': "pig|piglet", // 豬
    'cow': "cow", // 牛
    'elephant': "elephant", // 大象
    'snake': "snake", // 蛇
    'turtle': "turtle|tortoise", // 烏龜
    'butterfly': "butterfly", // 蝴蝶
    'crab': "crab", // 螃蟹
    'giraffe': "giraffe", // 長頸鹿
    'penguin': "penguin", // 企鵝
    'lion': "lion", // 獅子
    'frog': "frog", // 青蛙
    'bee': "bee", // 蜜蜂
    'owl': "owl", // 貓頭鷹
    'whale': "whale", // 鯨魚
    'dinosaur': "dinosaur|dino", // 恐龍
    'apple': "apple", // 蘋果
    'banana': "banana", // 香蕉
    'watermelon': "watermelon", // 西瓜
    'cake': "cake|birthday cake", // 蛋糕
    'icecream': "ice cream", // 冰淇淋
    'burger': "hamburger|burger", // 漢堡
    'pizza': "pizza", // 披薩
    'bread': "bread|toast", // 麵包
    'coffee': "coffee", // 咖啡
    'riceball': "rice ball|onigiri", // 飯糰
    'sushi': "sushi", // 壽司
    'hotdog': "hot dog|hotdog", // 熱狗
    'donut': "donut|doughnut", // 甜甜圈
    'grape': "grape|grapes", // 葡萄
    'strawberry': "strawberry", // 草莓
    'pineapple': "pineapple", // 鳳梨
    'egg': "egg|fried egg", // 雞蛋
    'bubbletea': "bubble tea|boba|pearl milk tea", // 珍珠奶茶
    'lollipop': "lollipop", // 棒棒糖
    'hotpot': "hot pot|hotpot", // 火鍋
    'umbrella': "umbrella", // 雨傘
    'clock': "clock|alarm clock", // 時鐘
    'book': "book", // 書本
    'chair': "chair|stool", // 椅子
    'table': "table|desk", // 桌子
    'cup': "cup|mug", // 杯子
    'bulb': "light bulb|bulb", // 燈泡
    'key': "key", // 鑰匙
    'scissors': "scissors", // 剪刀
    'glasses': "glasses|eyeglasses|sunglasses", // 眼鏡
    'phone': "phone|cell phone|mobile phone|smartphone", // 手機
    'tv': "television|tv", // 電視
    'toothbrush': "toothbrush", // 牙刷
    'broom': "broom", // 掃把
    'mirror': "mirror", // 鏡子
    'pencil': "pencil", // 鉛筆
    'hat': "hat|cap|baseball cap", // 帽子
    'shoe': "shoes|shoe|sneakers", // 鞋子
    'fan': "electric fan|fan", // 電風扇
    'washer': "washing machine|washer", // 洗衣機
    'car': "car|automobile", // 汽車
    'bicycle': "bicycle|bike", // 腳踏車
    'airplane': "airplane|plane|aeroplane", // 飛機
    'boat': "boat|ship", // 船
    'train': "train", // 火車
    'bus': "bus", // 公車
    'motorcycle': "motorcycle|motorbike|scooter", // 摩托車
    'balloon': "hot air balloon", // 熱氣球
    'rocket': "rocket", // 火箭
    'helicopter': "helicopter|chopper", // 直升機
    'truck': "truck|lorry", // 卡車
    'ambulance': "ambulance", // 救護車
    'submarine': "submarine|sub", // 潛水艇
    'skateboard': "skateboard", // 滑板
    'tricycle': "tricycle|trike", // 三輪車
    'sailboat': "sailboat|sailing boat|yacht", // 帆船
    'cablecar': "cable car|gondola", // 纜車
    'firetruck': "fire truck|fire engine", // 消防車
    'tractor': "tractor", // 拖拉機
    'canoe': "canoe|kayak", // 獨木舟
    'sun': "sun", // 太陽
    'moon': "moon|crescent moon", // 月亮
    'star': "star|stars", // 星星
    'cloud': "cloud", // 雲
    'rain': "rain|raining|rainy day", // 下雨
    'rainbow': "rainbow", // 彩虹
    'tree': "tree", // 樹
    'flower': "flower", // 花
    'mountain': "mountain", // 山
    'sea': "sea|ocean", // 大海
    'lightning': "lightning|thunder", // 閃電
    'snowman': "snowman", // 雪人
    'volcano': "volcano", // 火山
    'island': "island|small island", // 小島
    'desert': "desert", // 沙漠
    'waterfall': "waterfall", // 瀑布
    'cactus': "cactus", // 仙人掌
    'mushroom': "mushroom", // 蘑菇
    'maple': "maple leaf|leaf", // 楓葉
    'tornado': "tornado|twister", // 龍捲風
    'soccer': "soccer|football", // 足球
    'basketball': "basketball", // 籃球
    'racket': "tennis racket|racket|racquet", // 球拍
    'guitar': "guitar", // 吉他
    'drum': "drum|drums|drum set", // 鼓
    'kite': "kite", // 風箏
    'swing': "swing", // 鞦韆
    'slide': "slide|playground slide", // 溜滑梯
    'ferriswheel': "ferris wheel", // 摩天輪
    'dice': "dice|die", // 骰子
    'cards': "playing cards|cards|deck of cards", // 撲克牌
    'puzzle': "jigsaw puzzle|puzzle|jigsaw", // 拼圖
    'note': "music note|note|musical note", // 音符
    'microphone': "microphone|mic", // 麥克風
    'camera': "camera", // 相機
    'trophy': "trophy|cup", // 獎盃
    'computer': "computer|laptop", // 電腦
    'piano': "piano", // 鋼琴
    'bowling': "bowling|bowling ball", // 保齡球
    'jumprope': "jump rope|skipping rope", // 跳繩
    'face': "face", // 臉
    'eye': "eye|eyes", // 眼睛
    'hand': "hand", // 手
    'house': "house|home", // 房子
    'person': "child|kid", // 小朋友
    'shirt': "t-shirt|tee|shirt", // T恤
    'lantern': "lantern|red lantern|paper lantern", // 燈籠
    'xmastree': "christmas tree", // 聖誕樹
    'w-animal-0': "bear", // 熊
    'w-animal-1': "tiger", // 老虎
    'w-animal-2': "monkey", // 猴子
    'w-animal-3': "snail", // 蝸牛
    'w-animal-4': "shark", // 鯊魚
    'w-animal-5': "goldfish", // 金魚
    'w-animal-6': "octopus", // 章魚
    'w-animal-7': "duck", // 鴨子
    'w-animal-8': "chick", // 小雞
    'w-animal-9': "mouse|rat", // 老鼠
    'w-animal-10': "horse", // 馬
    'w-animal-11': "sheep|lamb", // 綿羊
    'w-animal-12': "spider", // 蜘蛛
    'w-animal-13': "ant", // 螞蟻
    'w-animal-14': "ladybug|ladybird", // 瓢蟲
    'w-animal-15': "caterpillar", // 毛毛蟲
    'w-animal-16': "panda", // 貓熊
    'w-animal-17': "cheetah", // 獵豹
    'w-animal-18': "gorilla", // 猩猩
    'w-animal-19': "squirrel", // 松鼠
    'w-animal-20': "hedgehog", // 刺蝟
    'w-animal-21': "dolphin", // 海豚
    'w-animal-22': "jellyfish", // 水母
    'w-animal-23': "shrimp|prawn", // 蝦子
    'w-animal-24': "lobster", // 龍蝦
    'w-animal-25': "seahorse", // 海馬
    'w-animal-26': "goose", // 鵝
    'w-animal-27': "rooster", // 公雞
    'w-animal-28': "hen", // 母雞
    'w-animal-29': "eagle", // 老鷹
    'w-animal-30': "parrot", // 鸚鵡
    'w-animal-31': "peacock", // 孔雀
    'w-animal-32': "swan", // 天鵝
    'w-animal-33': "swallow", // 燕子
    'w-animal-34': "woodpecker", // 啄木鳥
    'w-animal-35': "flamingo", // 紅鶴
    'w-animal-36': "ostrich", // 鴕鳥
    'w-animal-37': "camel", // 駱駝
    'w-animal-38': "zebra", // 斑馬
    'w-animal-39': "hippo|hippopotamus", // 河馬
    'w-animal-40': "rhino|rhinoceros", // 犀牛
    'w-animal-41': "deer", // 梅花鹿
    'w-animal-42': "goat", // 山羊
    'w-animal-43': "fox", // 狐狸
    'w-animal-44': "wolf", // 狼
    'w-animal-45': "koala", // 無尾熊
    'w-animal-46': "kangaroo", // 袋鼠
    'w-animal-47': "sloth", // 樹懶
    'w-animal-48': "raccoon", // 浣熊
    'w-animal-49': "seal", // 海豹
    'w-animal-50': "polar bear", // 北極熊
    'w-animal-51': "bat", // 蝙蝠
    'w-animal-52': "hamster", // 倉鼠
    'w-animal-53': "dragonfly", // 蜻蜓
    'w-animal-54': "cicada", // 蟬
    'w-animal-55': "earthworm|worm", // 蚯蚓
    'w-animal-56': "crocodile|alligator", // 鱷魚
    'w-animal-57': "lizard", // 蜥蜴
    'w-animal-58': "gecko", // 壁虎
    'w-animal-59': "clownfish", // 小丑魚
    'w-animal-60': "pufferfish", // 河豚
    'w-animal-61': "tadpole", // 蝌蚪
    'w-animal-62': "firefly", // 螢火蟲
    'w-animal-63': "mosquito", // 蚊子
    'w-animal-64': "fly|housefly", // 蒼蠅
    'w-animal-65': "cockroach", // 蟑螂
    'w-animal-66': "praying mantis|mantis", // 螳螂
    'w-animal-67': "alpaca|llama", // 羊駝
    'w-animal-68': "seashell|shell", // 貝殼
    'w-animal-69': "starfish", // 海星
    'w-animal-70': "chameleon", // 變色龍
    'w-animal-71': "otter", // 水獺
    'w-animal-72': "eel", // 鰻魚
    'w-animal-73': "flounder|flatfish", // 比目魚
    'w-animal-74': "stingray", // 魟魚
    'w-animal-75': "sea anemone|anemone", // 海葵
    'w-animal-76': "coral", // 珊瑚
    'w-animal-77': "sea urchin", // 海膽
    'w-animal-78': "clam", // 蛤蜊
    'w-animal-79': "oyster", // 牡蠣
    'w-animal-80': "squid|cuttlefish", // 花枝
    'w-animal-81': "toad", // 蟾蜍
    'w-animal-82': "newt|salamander", // 蠑螈
    'w-animal-83': "pangolin", // 穿山甲
    'w-animal-84': "anteater", // 食蟻獸
    'w-animal-85': "armadillo", // 犰狳
    'w-animal-86': "baboon", // 狒狒
    'w-animal-87': "chimpanzee|chimp", // 黑猩猩
    'w-animal-88': "gibbon", // 長臂猿
    'w-animal-89': "wild boar|boar", // 野豬
    'w-animal-90': "moose|elk", // 麋鹿
    'w-animal-91': "reindeer", // 馴鹿
    'w-animal-92': "antelope", // 羚羊
    'w-animal-93': "buffalo|water buffalo", // 水牛
    'w-animal-94': "yak", // 氂牛
    'w-animal-95': "snow leopard", // 雪豹
    'w-animal-96': "cougar|puma|mountain lion", // 美洲獅
    'w-animal-97': "groundhog|marmot", // 土撥鼠
    'w-animal-98': "mole", // 鼴鼠
    'w-animal-99': "weasel", // 黃鼠狼
    'w-animal-100': "skunk", // 臭鼬
    'w-animal-101': "seagull|gull", // 海鷗
    'w-animal-102': "albatross", // 信天翁
    'w-animal-103': "rhinoceros beetle|rhino beetle", // 獨角仙
    'w-animal-104': "centipede", // 蜈蚣
    'w-animal-105': "cricket", // 蟋蟀
    'w-animal-106': "salmon", // 鮭魚
    'w-animal-107': "tuna", // 鮪魚
    'w-animal-108': "donkey", // 驢子
    'w-animal-109': "turkey", // 火雞
    'w-food-0': "orange|tangerine", // 橘子
    'w-food-1': "lemon", // 檸檬
    'w-food-2': "cherry", // 櫻桃
    'w-food-3': "tomato", // 番茄
    'w-food-4': "corn", // 玉米
    'w-food-5': "carrot", // 紅蘿蔔
    'w-food-6': "pumpkin", // 南瓜
    'w-food-7': "eggplant", // 茄子
    'w-food-8': "sausage", // 香腸
    'w-food-9': "french fries|fries", // 薯條
    'w-food-10': "pudding", // 布丁
    'w-food-11': "cookie|biscuit", // 餅乾
    'w-food-12': "chocolate", // 巧克力
    'w-food-13': "marshmallow", // 棉花糖
    'w-food-14': "milk", // 牛奶
    'w-food-15': "juice", // 果汁
    'w-food-16': "tangyuan|sweet rice ball", // 湯圓
    'w-food-17': "bao|baozi", // 包子
    'w-food-18': "dumpling|dumplings", // 水餃
    'w-food-19': "drumstick|chicken leg", // 雞腿
    'w-food-20': "popcorn", // 爆米花
    'w-food-21': "pear", // 梨子
    'w-food-22': "coconut", // 椰子
    'w-food-23': "peanut", // 花生
    'w-food-24': "noodles|noodle", // 麵條
    'w-food-25': "instant noodles|cup noodles", // 泡麵
    'w-food-26': "rice|white rice", // 白飯
    'w-food-27': "candy|sweets", // 糖果
    'w-food-28': "mango", // 芒果
    'w-food-29': "peach", // 水蜜桃
    'w-food-30': "kiwi|kiwifruit", // 奇異果
    'w-food-31': "papaya", // 木瓜
    'w-food-32': "cantaloupe|melon", // 哈密瓜
    'w-food-33': "pomelo|grapefruit", // 柚子
    'w-food-34': "wax apple", // 蓮霧
    'w-food-35': "guava", // 芭樂
    'w-food-36': "starfruit|star fruit", // 楊桃
    'w-food-37': "blueberry", // 藍莓
    'w-food-38': "persimmon", // 柿子
    'w-food-39': "radish|daikon", // 白蘿蔔
    'w-food-40': "potato", // 馬鈴薯
    'w-food-41': "sweet potato", // 地瓜
    'w-food-42': "bell pepper|green pepper", // 青椒
    'w-food-43': "broccoli", // 花椰菜
    'w-food-44': "cabbage", // 高麗菜
    'w-food-45': "onion", // 洋蔥
    'w-food-46': "garlic", // 大蒜
    'w-food-47': "chili|chili pepper|chilli", // 辣椒
    'w-food-48': "tofu", // 豆腐
    'w-food-49': "congee|porridge", // 稀飯
    'w-food-50': "ramen", // 拉麵
    'w-food-51': "mantou|steamed bread", // 饅頭
    'w-food-52': "egg pancake|egg crepe", // 蛋餅
    'w-food-53': "potsticker|pot sticker", // 鍋貼
    'w-food-54': "soup dumpling|xiaolongbao", // 小籠包
    'w-food-55': "zongzi|sticky rice dumpling", // 肉粽
    'w-food-56': "mooncake", // 月餅
    'w-food-57': "pineapple cake", // 鳳梨酥
    'w-food-58': "egg tart", // 蛋塔
    'w-food-59': "jelly", // 果凍
    'w-food-60': "potato chips|chips", // 洋芋片
    'w-food-61': "fried chicken", // 炸雞
    'w-food-62': "steak", // 牛排
    'w-food-63': "bacon", // 培根
    'w-food-64': "cheese", // 起司
    'w-food-65': "soda|soft drink", // 汽水
    'w-food-66': "black tea", // 紅茶
    'w-food-67': "soy milk|soymilk", // 豆漿
    'w-food-68': "honey", // 蜂蜜
    'w-food-69': "sandwich", // 三明治
    'w-food-70': "bagel", // 貝果
    'w-food-71': "croissant", // 可頌
    'w-food-72': "salad", // 沙拉
    'w-food-73': "cream soup|thick soup", // 濃湯
    'w-food-74': "ham", // 火腿
    'w-food-75': "fried rice", // 炒飯
    'w-food-76': "chicken cutlet|fried chicken cutlet", // 雞排
    'w-food-77': "shaved ice", // 刨冰
    'w-food-78': "tofu pudding|douhua", // 豆花
    'w-food-79': "popsicle|ice pop", // 冰棒
    'w-food-80': "milk tea", // 奶茶
    'w-food-81': "crepe", // 可麗餅
    'w-food-82': "pancake|pancakes", // 鬆餅
    'w-food-83': "cream puff", // 泡芙
    'w-food-84': "dorayaki", // 銅鑼燒
    'w-food-85': "mochi", // 麻糬
    'w-food-86': "meatball|pork ball", // 貢丸
    'w-food-87': "braised egg|soy sauce egg", // 滷蛋
    'w-food-88': "bento|lunch box", // 便當
    'w-food-89': "shaobing|sesame flatbread", // 燒餅
    'w-food-90': "youtiao|fried dough stick", // 油條
    'w-food-91': "red bean cake|red bean pancake", // 紅豆餅
    'w-food-92': "egg cake|baby cake", // 雞蛋糕
    'w-food-93': "takoyaki|octopus balls", // 章魚燒
    'w-food-94': "taiyaki|fish-shaped cake", // 鯛魚燒
    'w-food-95': "macaron|macaroon", // 馬卡龍
    'w-food-96': "sundae", // 聖代
    'w-food-97': "milkshake|shake", // 奶昔
    'w-food-98': "rice cake|nian gao", // 年糕
    'w-food-99': "yogurt|yoghurt", // 優格
    'w-food-100': "butter", // 奶油
    'w-food-101': "jam", // 果醬
    'w-food-102': "pistachio", // 開心果
    'w-food-103': "walnut", // 核桃
    'w-food-104': "sunflower seeds|sunflower seed", // 瓜子
    'w-food-105': "cashew", // 腰果
    'w-food-106': "raisin|raisins", // 葡萄乾
    'w-food-107': "almond", // 杏仁
    'w-food-108': "nougat", // 牛軋糖
    'w-food-109': "green tea", // 綠茶
    'w-food-110': "spaghetti|pasta", // 義大利麵
    'w-food-111': "green onion pancake|scallion pancake", // 蔥油餅
    'w-food-112': "stinky tofu", // 臭豆腐
    'w-food-113': "braised pork rice", // 滷肉飯
    'w-food-114': "beef noodle soup|beef noodles", // 牛肉麵
    'w-food-115': "oyster omelet|oyster omelette", // 蚵仔煎
    'w-food-116': "intestine vermicelli|mee sua", // 大腸麵線
    'w-food-117': "popcorn chicken|salt and pepper chicken", // 鹹酥雞
    'w-food-118': "braised snacks|lu wei", // 滷味
    'w-food-119': "oden", // 關東煮
    'w-food-120': "curry rice|curry", // 咖哩飯
    'w-food-121': "sukiyaki", // 壽喜燒
    'w-food-122': "miso soup", // 味噌湯
    'w-food-123': "shumai|siu mai", // 燒賣
    'w-food-124': "ba-wan|taiwanese meatball", // 肉圓
    'w-food-125': "bowl rice cake|wagui", // 碗粿
    'w-food-126': "sticky rice|glutinous rice", // 米糕
    'w-food-127': "oil rice|glutinous oil rice", // 油飯
    'w-food-128': "gua bao|pork belly bun", // 刈包
    'w-food-129': "pepper bun|black pepper bun", // 胡椒餅
    'w-food-130': "flaky scallion pancake|cong zhua bing", // 蔥抓餅
    'w-food-131': "pig blood cake|pork blood cake", // 豬血糕
    'w-food-132': "oyster vermicelli", // 蚵仔麵線
    'w-food-133': "danzai noodles|tan tsai noodles", // 擔仔麵
    'w-food-134': "zha jiang noodles|noodles with meat sauce", // 炸醬麵
    'w-food-135': "wonton|wontons", // 餛飩
    'w-food-136': "rice vermicelli|rice noodles", // 米粉
    'w-food-137': "clay pot noodles|pot noodle soup", // 鍋燒麵
    'w-food-138': "pork chop rice", // 排骨飯
    'w-food-139': "chicken drumstick rice|chicken leg rice", // 雞腿飯
    'w-food-140': "turnip cake|radish cake", // 蘿蔔糕
    'w-food-141': "taro cake", // 芋頭糕
    'w-food-142': "rice noodle roll", // 腸粉
    'w-food-143': "bbq pork bun|char siu bao", // 叉燒包
    'w-food-144': "shrimp dumpling|har gow", // 蝦餃
    'w-food-145': "taco", // 塔可餅
    'w-food-146': "lasagna|lasagne", // 千層麵
    'w-food-147': "risotto", // 燉飯
    'w-food-148': "fish and chips", // 炸魚薯條
    'w-food-149': "hamburger steak|salisbury steak", // 漢堡排
    'w-food-150': "beef bowl|gyudon", // 牛丼
    'w-food-151': "oyakodon|chicken and egg bowl", // 親子丼
    'w-food-152': "tempura", // 天婦羅
    'w-food-153': "udon", // 烏龍麵
    'w-food-154': "soba|buckwheat noodles", // 蕎麥麵
    'w-food-155': "okonomiyaki", // 大阪燒
    'w-food-156': "kimchi", // 泡菜
    'w-food-157': "bibimbap", // 石鍋拌飯
    'w-food-158': "korean fried chicken", // 韓式炸雞
    'w-food-159': "tiramisu", // 提拉米蘇
    'w-food-160': "apple pie", // 蘋果派
    'w-food-161': "spring roll", // 春捲
    'w-food-162': "smoothie|slush", // 冰沙
    'w-food-163': "red bean soup", // 紅豆湯
    'w-food-164': "grass jelly|herbal jelly", // 仙草
    'w-food-165': "aiyu jelly|aiyu", // 愛玉
    'w-home-0': "sofa|couch", // 沙發
    'w-home-1': "bed", // 床
    'w-home-2': "pillow", // 枕頭
    'w-home-3': "bowl", // 碗
    'w-home-4': "plate|dish", // 盤子
    'w-home-5': "spoon", // 湯匙
    'w-home-6': "fork", // 叉子
    'w-home-7': "chopsticks", // 筷子
    'w-home-8': "toothpaste", // 牙膏
    'w-home-9': "towel", // 毛巾
    'w-home-10': "comb", // 梳子
    'w-home-11': "desk lamp|lamp", // 檯燈
    'w-home-12': "candle", // 蠟燭
    'w-home-13': "lock|padlock", // 鎖頭
    'w-home-14': "window", // 窗戶
    'w-home-15': "ladder", // 梯子
    'w-home-16': "bucket|pail", // 水桶
    'w-home-17': "trash can|trash bin|garbage can|dustbin", // 垃圾桶
    'w-home-18': "toilet paper|tissue paper", // 衛生紙
    'w-home-19': "envelope", // 信封
    'w-home-20': "ruler", // 尺
    'w-home-21': "eraser|rubber", // 橡皮擦
    'w-home-22': "battery", // 電池
    'w-home-23': "refrigerator|fridge", // 冰箱
    'w-home-24': "picture frame|photo frame", // 相框
    'w-home-25': "vase", // 花瓶
    'w-home-26': "flashlight|torch", // 手電筒
    'w-home-27': "frying pan|pan|skillet", // 平底鍋
    'w-home-28': "kettle|teapot", // 水壺
    'w-home-29': "wardrobe|closet", // 衣櫃
    'w-home-30': "oven", // 烤箱
    'w-home-31': "microwave|microwave oven", // 微波爐
    'w-home-32': "rice cooker", // 電鍋
    'w-home-33': "mop", // 拖把
    'w-home-34': "soap", // 肥皂
    'w-home-35': "vacuum cleaner|vacuum", // 吸塵器
    'w-home-36': "iron|clothes iron", // 熨斗
    'w-home-37': "kitchen knife|knife|cleaver", // 菜刀
    'w-home-38': "cutting board|chopping board", // 砧板
    'w-home-39': "hanger|coat hanger|clothes hanger", // 衣架
    'w-home-40': "button", // 鈕扣
    'w-home-41': "needle and thread|sewing kit", // 針線
    'w-home-42': "zipper|zip", // 拉鍊
    'w-home-43': "notebook", // 筆記本
    'w-home-44': "stapler", // 釘書機
    'w-home-45': "glue", // 膠水
    'w-home-46': "calendar", // 日曆
    'w-home-47': "thermometer", // 溫度計
    'w-home-48': "power outlet|outlet|socket", // 插座
    'w-home-49': "lighter", // 打火機
    'w-home-50': "matches|matchstick|match", // 火柴
    'w-home-51': "hot water flask|water flask", // 熱水瓶
    'w-home-52': "blender", // 果汁機
    'w-home-53': "spatula", // 鍋鏟
    'w-home-54': "brush", // 刷子
    'w-home-55': "scale|weighing scale|bathroom scale", // 體重計
    'w-home-56': "map", // 地圖
    'w-home-57': "cushion|throw pillow", // 抱枕
    'w-home-58': "carpet|rug", // 地毯
    'w-home-59': "mosquito coil", // 蚊香
    'w-home-60': "air conditioner|ac", // 冷氣
    'w-home-61': "pot lid|lid", // 鍋蓋
    'w-home-62': "measuring cup", // 量杯
    'w-home-63': "bandage", // 繃帶
    'w-home-64': "bookshelf|bookcase", // 書架
    'w-home-65': "doorknob|door handle", // 門把
    'w-home-66': "speaker|stereo", // 音響
    'w-home-67': "keyboard", // 鍵盤
    'w-home-68': "monitor|screen", // 螢幕
    'w-home-69': "saw", // 鋸子
    'w-home-70': "tape measure", // 捲尺
    'w-home-71': "hand fan|folding fan", // 扇子
    'w-home-72': "blanket|quilt|comforter", // 棉被
    'w-home-73': "heater|space heater", // 暖爐
    'w-home-74': "flower pot|flowerpot", // 花盆
    'w-home-75': "watering can", // 澆花器
    'w-home-76': "computer mouse|mouse", // 滑鼠
    'w-home-77': "doorbell", // 門鈴
    'w-home-78': "safe|safe box", // 保險箱
    'w-home-79': "hammer", // 鐵鎚
    'w-home-80': "wrench|spanner", // 扳手
    'w-home-81': "paintbrush|paint brush", // 油漆刷
    'w-home-82': "printer", // 印表機
    'w-home-83': "charger", // 充電器
    'w-home-84': "extension cord|power strip", // 延長線
    'w-home-85': "drying rack|clothes drying rack", // 曬衣架
    'w-home-86': "hair dryer|blow dryer|hairdryer", // 吹風機
    'w-home-87': "nail clipper|nail clippers", // 指甲剪
    'w-home-88': "suitcase|luggage", // 行李箱
    'w-home-89': "sticky note|post-it", // 便利貼
    'w-home-90': "thermos|vacuum flask", // 保溫瓶
    'w-home-91': "bottle opener", // 開瓶器
    'w-home-92': "remote control|remote", // 遙控器
    'w-home-93': "fire extinguisher", // 滅火器
    'w-home-94': "toolbox", // 工具箱
    'w-home-95': "screwdriver", // 螺絲起子
    'w-home-96': "razor|shaver", // 刮鬍刀
    'w-home-97': "bug zapper|electric fly swatter", // 電蚊拍
    'w-home-98': "projector", // 投影機
    'w-home-99': "first aid kit|first-aid kit", // 急救箱
    'w-home-100': "cotton swab|q-tip", // 棉花棒
    'w-home-101': "headphones|earphones|earbuds", // 耳機
    'w-home-102': "radio", // 收音機
    'w-home-103': "telescope|binoculars", // 望遠鏡
    'w-home-104': "compass", // 指南針
    'w-home-105': "rag|dishcloth|cleaning cloth", // 抹布
    'w-home-106': "stamp|postage stamp", // 郵票
    'w-home-107': "keychain|key ring", // 鑰匙圈
    'w-home-108': "dishwasher", // 洗碗機
    'w-home-109': "induction cooker|induction stove", // 電磁爐
    'w-home-110': "water heater", // 熱水器
    'w-home-111': "water dispenser|water cooler", // 飲水機
    'w-home-112': "dehumidifier", // 除濕機
    'w-home-113': "coffee maker|coffee machine", // 咖啡機
    'w-home-114': "toaster", // 烤麵包機
    'w-home-115': "plastic wrap|cling film|cling wrap", // 保鮮膜
    'w-home-116': "food container|lunch container|tupperware", // 保鮮盒
    'w-home-117': "aluminum foil|tin foil", // 鋁箔紙
    'w-home-118': "scouring pad|scrub sponge", // 菜瓜布
    'w-home-119': "dish soap|dishwashing liquid", // 洗碗精
    'w-home-120': "laundry detergent|detergent", // 洗衣精
    'w-home-121': "body wash|shower gel", // 沐浴乳
    'w-home-122': "shampoo", // 洗髮精
    'w-home-123': "clothes dryer|tumble dryer|dryer", // 烘衣機
    'w-home-124': "air purifier", // 清淨機
    'w-home-125': "range hood|extractor hood|kitchen hood", // 抽油煙機
    'w-home-126': "gas stove|stove", // 瓦斯爐
    'w-home-127': "air fryer", // 氣炸鍋
    'w-home-128': "water purifier|water filter", // 淨水器
    'w-home-129': "ice maker", // 製冰機
    'w-home-130': "massage chair", // 按摩椅
    'w-home-131': "robot vacuum|robot vacuum cleaner|roomba", // 掃地機
    'w-home-132': "security camera|cctv|surveillance camera", // 監視器
    'w-home-133': "router|wifi router", // 路由器
    'w-home-134': "scanner", // 掃描器
    'w-home-135': "curling iron|curling wand", // 捲髮棒
    'w-home-136': "clothespin|clothes peg|clothespeg", // 曬衣夾
    'w-home-137': "storage box|storage bin", // 收納箱
    'w-home-138': "locker|cabinet", // 置物櫃
    'w-home-139': "sieve|strainer", // 篩子
    'w-home-140': "spirit level|level", // 水平儀
    'w-home-141': "garden shears|pruning shears|pruners", // 園藝剪
    'w-home-142': "barbecue grill|bbq grill|grill", // 烤肉架
    'w-home-143': "soy milk maker", // 豆漿機
    'w-home-144': "laundry basket|hamper", // 洗衣籃
    'w-home-145': "garbage bag|trash bag|bin bag", // 垃圾袋
    'w-vehicle-0': "subway|metro|mrt|underground", // 捷運
    'w-vehicle-1': "taxi|cab", // 計程車
    'w-vehicle-2': "police car|cop car", // 警車
    'w-vehicle-3': "school bus", // 校車
    'w-vehicle-4': "bullet train|high speed rail|high-speed train", // 高鐵
    'w-vehicle-5': "cruise ship|cruise liner|cruise", // 郵輪
    'w-vehicle-6': "fishing boat", // 漁船
    'w-vehicle-7': "stroller|baby stroller|pram", // 嬰兒車
    'w-vehicle-8': "wheelchair", // 輪椅
    'w-vehicle-9': "race car|racing car", // 賽車
    'w-vehicle-10': "garbage truck|trash truck|rubbish truck", // 垃圾車
    'w-vehicle-11': "bulldozer", // 推土機
    'w-vehicle-12': "excavator|digger", // 挖土機
    'w-vehicle-13': "cement mixer|concrete mixer", // 水泥車
    'w-vehicle-14': "camper van|rv|motorhome|campervan", // 露營車
    'w-vehicle-15': "jeep", // 吉普車
    'w-vehicle-16': "electric car|ev|electric vehicle", // 電動車
    'w-vehicle-17': "pickup truck|pickup|van", // 小貨車
    'w-vehicle-18': "speedboat", // 快艇
    'w-vehicle-19': "hovercraft", // 氣墊船
    'w-vehicle-20': "parachute", // 降落傘
    'w-vehicle-21': "baby carriage|pushchair", // 娃娃車
    'w-vehicle-22': "horse carriage|carriage|horse-drawn carriage", // 馬車
    'w-vehicle-23': "glider", // 滑翔機
    'w-vehicle-24': "water truck|water sprinkler truck|street sprinkler", // 灑水車
    'w-vehicle-25': "tanker truck|tanker|oil tanker", // 油罐車
    'w-vehicle-26': "flatbed truck|flatbed", // 拖板車
    'w-vehicle-27': "bumper car|bumper cars|dodgems", // 碰碰車
    'w-vehicle-28': "paraglider|paragliding", // 飛行傘
    'w-vehicle-29': "off-road vehicle|suv|offroad vehicle", // 越野車
    'w-vehicle-30': "crane", // 起重機
    'w-vehicle-31': "convertible|cabriolet", // 敞篷車
    'w-vehicle-32': "steam train|steam locomotive", // 蒸汽火車
    'w-vehicle-33': "tour bus|coach", // 遊覽車
    'w-vehicle-34': "spaceship|spacecraft|space ship", // 太空船
    'w-vehicle-35': "handcart|cart|wheelbarrow", // 手推車
    'w-vehicle-36': "unicycle|wheelbarrow", // 獨輪車
    'w-vehicle-37': "double-decker bus|double decker|double-decker", // 雙層巴士
    'w-vehicle-38': "airship|blimp|zeppelin", // 飛船
    'w-vehicle-39': "sled|sleigh|sledge", // 雪橇
    'w-vehicle-40': "bamboo raft|raft", // 竹筏
    'w-vehicle-41': "ferry", // 渡輪
    'w-vehicle-42': "inline skates|rollerblades", // 直排輪
    'w-vehicle-43': "mountain bike", // 登山車
    'w-vehicle-44': "hang glider|hang gliding", // 滑翔翼
    'w-vehicle-45': "tow truck", // 拖吊車
    'w-vehicle-46': "refrigerated truck|reefer truck", // 冷凍車
    'w-vehicle-47': "semi truck|tractor trailer|semi-trailer", // 聯結車
    'w-vehicle-48': "monorail", // 單軌列車
    'w-vehicle-49': "maglev|maglev train", // 磁浮列車
    'w-vehicle-50': "steamboat|steamship", // 蒸汽船
    'w-vehicle-51': "jet ski|motorboat", // 摩托艇
    'w-vehicle-52': "electric skateboard|e-skateboard|electric scooter", // 電動滑板
    'w-vehicle-53': "sampan", // 舢舨
    'w-vehicle-54': "space shuttle|shuttle", // 太空梭
    'w-nature-0': "sky", // 天空
    'w-nature-1': "river", // 河流
    'w-nature-2': "forest|woods", // 森林
    'w-nature-3': "stone|rock", // 石頭
    'w-nature-4': "grass|lawn|meadow", // 草地
    'w-nature-5': "snowflake", // 雪花
    'w-nature-6': "shooting star|meteor", // 流星
    'w-nature-7': "petal", // 花瓣
    'w-nature-8': "sunflower", // 向日葵
    'w-nature-9': "rose", // 玫瑰
    'w-nature-10': "palm tree|coconut tree", // 椰子樹
    'w-nature-11': "pine tree|pine", // 松樹
    'w-nature-12': "earth|globe|planet earth", // 地球
    'w-nature-13': "pond", // 池塘
    'w-nature-14': "beach|seashore", // 海灘
    'w-nature-15': "stream|creek|brook", // 溪流
    'w-nature-16': "bamboo forest|bamboo grove|bamboo", // 竹林
    'w-nature-17': "cave", // 山洞
    'w-nature-18': "iceberg", // 冰山
    'w-nature-19': "swamp|marsh", // 沼澤
    'w-nature-20': "soil|dirt|mud", // 泥土
    'w-nature-21': "branch|twig", // 樹枝
    'w-nature-22': "fruit", // 果實
    'w-nature-23': "maple tree|maple", // 楓樹
    'w-nature-24': "vine|vines", // 藤蔓
    'w-nature-25': "starry sky|night sky|starry night", // 星空
    'w-nature-26': "sea of clouds|cloud sea", // 雲海
    'w-nature-27': "tree trunk|trunk", // 樹幹
    'w-nature-28': "tree rings|tree ring|growth rings", // 年輪
    'w-nature-29': "fern|ferns", // 蕨類
    'w-nature-30': "chrysanthemum|mum", // 菊花
    'w-nature-31': "plum blossom|plum flower", // 梅花
    'w-nature-32': "wheat field", // 麥田
    'w-nature-33': "sapling|seedling", // 樹苗
    'w-nature-34': "basin", // 盆地
    'w-nature-35': "plateau|highland", // 高原
    'w-nature-36': "coast|coastline|shore", // 海岸
    'w-nature-37': "reef|sea rock", // 礁石
    'w-nature-38': "hillside|slope|hill slope", // 山坡
    'w-nature-39': "puddle", // 水窪
    'w-nature-40': "lake", // 湖泊
    'w-nature-41': "prairie|grassland|steppe", // 草原
    'w-nature-42': "valley", // 山谷
    'w-nature-43': "cliff", // 懸崖
    'w-nature-44': "glacier", // 冰河
    'w-nature-45': "oasis", // 綠洲
    'w-nature-46': "sand dune|dune", // 沙丘
    'w-nature-47': "tree root|root|roots", // 樹根
    'w-nature-48': "garden", // 花園
    'w-nature-49': "seed|seeds", // 種子
    'w-nature-50': "cherry blossom|sakura", // 櫻花
    'w-nature-51': "tulip", // 鬱金香
    'w-nature-52': "lily", // 百合
    'w-nature-53': "dandelion", // 蒲公英
    'w-nature-54': "lotus|lotus flower", // 荷花
    'w-nature-55': "moss", // 苔蘚
    'w-nature-56': "dewdrop|dew", // 露珠
    'w-nature-57': "mountain range|mountains", // 山脈
    'w-nature-58': "bark|tree bark", // 樹皮
    'w-nature-59': "pinecone|pine cone", // 松果
    'w-nature-60': "lotus leaf|lily pad", // 荷葉
    'w-nature-61': "orchid", // 蘭花
    'w-nature-62': "morning glory", // 牽牛花
    'w-nature-63': "peach blossom", // 桃花
    'w-nature-64': "rice field|paddy|rice paddy", // 稻田
    'w-nature-65': "bamboo shoot|bamboo shoots", // 竹筍
    'w-nature-66': "fallen leaves|fallen leaf", // 落葉
    'w-nature-67': "canyon|gorge", // 峽谷
    'w-nature-68': "bush|bushes|thicket", // 草叢
    'w-nature-69': "spring water|natural spring", // 泉水
    'w-nature-70': "ice cube|ice", // 冰塊
    'w-nature-71': "plain|plains", // 平原
    'w-nature-72': "hills|hill", // 丘陵
    'w-nature-73': "sandbar|sand bar", // 沙洲
    'w-nature-74': "tundra", // 苔原
    'w-nature-75': "dead branch|dry twig", // 枯枝
    'w-fun-0': "baseball", // 棒球
    'w-fun-1': "volleyball", // 排球
    'w-fun-2': "tennis|tennis ball", // 網球
    'w-fun-3': "table tennis|ping pong", // 桌球
    'w-fun-4': "badminton|shuttlecock", // 羽毛球
    'w-fun-5': "tent", // 帳篷
    'w-fun-6': "bubbles|bubble", // 泡泡
    'w-fun-7': "building blocks|blocks|lego", // 積木
    'w-fun-8': "teddy bear|stuffed toy|plush toy", // 泰迪熊
    'w-fun-9': "balloon", // 氣球
    'w-fun-10': "seesaw|teeter-totter", // 蹺蹺板
    'w-fun-11': "frisbee|flying disc", // 飛盤
    'w-fun-12': "spinning top|top", // 陀螺
    'w-fun-13': "robot", // 機器人
    'w-fun-14': "billiards|pool|snooker", // 撞球
    'w-fun-15': "jianzi|footbag|hacky sack", // 毽子
    'w-fun-16': "marbles|marble", // 彈珠
    'w-fun-17': "chinese chess|xiangqi", // 象棋
    'w-fun-18': "gashapon|capsule toy", // 扭蛋
    'w-fun-19': "streamer|streamers|ribbon streamer", // 彩帶
    'w-fun-20': "easel", // 畫架
    'w-fun-21': "artist brush|art brush|drawing brush", // 畫筆
    'w-fun-22': "watercolor|watercolour|watercolors", // 水彩
    'w-fun-23': "crayon|crayons", // 蠟筆
    'w-fun-24': "sleeping bag", // 睡袋
    'w-fun-25': "windmill|pinwheel", // 風車
    'w-fun-26': "horizontal bar|high bar", // 單槓
    'w-fun-27': "high jump", // 跳高
    'w-fun-28': "shot put", // 鉛球
    'w-fun-29': "stopwatch", // 碼表
    'w-fun-30': "goal|goalpost|soccer goal", // 球門
    'w-fun-31': "net|ball net", // 球網
    'w-fun-32': "goggles|swim goggles|swimming goggles", // 泳鏡
    'w-fun-33': "sticker|stickers", // 貼紙
    'w-fun-34': "haunted house", // 鬼屋
    'w-fun-35': "archery", // 射箭
    'w-fun-36': "board game|board games", // 桌遊
    'w-fun-37': "swim ring|inflatable ring|swim tube|float ring", // 游泳圈
    'w-fun-38': "snowboard|ski|skis", // 滑雪板
    'w-fun-39': "dumbbell|dumbbells", // 啞鈴
    'w-fun-40': "treadmill", // 跑步機
    'w-fun-41': "toy car", // 玩具車
    'w-fun-42': "weiqi|go|igo", // 圍棋
    'w-fun-43': "chess", // 西洋棋
    'w-fun-44': "mahjong|mahjongg", // 麻將
    'w-fun-45': "campfire|bonfire", // 營火
    'w-fun-46': "trampoline", // 跳跳床
    'w-fun-47': "darts|dart", // 飛鏢
    'w-fun-48': "parallel bars", // 雙槓
    'w-fun-49': "long jump", // 跳遠
    'w-fun-50': "javelin", // 標槍
    'w-fun-51': "relay baton|baton", // 接力棒
    'w-fun-52': "whistle", // 哨子
    'w-fun-53': "basketball hoop|hoop", // 籃框
    'w-fun-54': "running track|track", // 跑道
    'w-fun-55': "kickboard|swim board|float board", // 浮板
    'w-fun-56': "comic book|comic|manga", // 漫畫
    'w-fun-57': "pirate ship", // 海盜船
    'w-fun-58': "whack-a-mole", // 打地鼠
    'w-fun-59': "chinese checkers|checkers", // 跳棋
    'w-fun-60': "beach ball", // 沙灘球
    'w-fun-61': "weightlifting|weight lifting", // 舉重
    'w-fun-62': "fishing rod|fishing pole", // 釣竿
    'w-fun-63': "roller skates|ice skates|skates", // 溜冰鞋
    'w-fun-64': "hula hoop", // 呼拉圈
    'w-fun-65': "doll", // 洋娃娃
    'w-fun-66': "rubik's cube|rubiks cube|magic cube", // 魔術方塊
    'w-fun-67': "carousel|merry-go-round", // 旋轉木馬
    'w-fun-68': "roller coaster|rollercoaster", // 雲霄飛車
    'w-fun-69': "claw machine|crane game", // 夾娃娃機
    'w-fun-70': "surfboard", // 衝浪板
    'w-fun-71': "boxing gloves|boxing glove", // 拳擊手套
    'w-fun-72': "sandbox|sandpit", // 沙坑
    'w-fun-73': "fencing", // 擊劍
    'w-fun-74': "gymnastics", // 體操
    'w-fun-75': "golf", // 高爾夫
    'w-fun-76': "dodgeball", // 躲避球
    'w-fun-77': "sail|windsurfing sail", // 風帆
    'w-fun-78': "ring toss", // 套圈圈
    'w-fun-79': "scoreboard", // 計分板
    'w-fun-80': "bowling pin|bowling pins", // 保齡球瓶
    'w-fun-81': "paint palette|palette", // 調色盤
    'w-fun-82': "sketchbook|sketch book", // 素描本
    'w-emotion-0': "happy|joyful|glad", // 開心
    'w-emotion-1': "sad|heartbroken|unhappy", // 傷心
    'w-emotion-2': "angry|mad", // 生氣
    'w-emotion-3': "scared|afraid|frightened", // 害怕
    'w-emotion-4': "surprised|shocked", // 驚訝
    'w-emotion-5': "shy|bashful", // 害羞
    'w-emotion-6': "excited", // 興奮
    'w-emotion-7': "nervous", // 緊張
    'w-emotion-8': "bored", // 無聊
    'w-emotion-9': "tired|sleepy|exhausted", // 疲倦
    'w-emotion-10': "smug|pleased with oneself|self-satisfied", // 得意
    'w-emotion-11': "wronged|aggrieved|feeling wronged", // 委屈
    'w-emotion-12': "lonely|alone", // 孤單
    'w-emotion-13': "blissful|bliss|happiness", // 幸福
    'w-emotion-14': "touched|moved", // 感動
    'w-emotion-15': "proud", // 驕傲
    'w-emotion-16': "worried|troubled|bothered", // 煩惱
    'w-emotion-17': "embarrassed|awkward", // 尷尬
    'w-emotion-18': "pleasant surprise|delighted", // 驚喜
    'w-emotion-19': "courageous|brave|bold", // 勇敢
    'w-emotion-20': "smitten|heart flutter|crush", // 心動
    'w-emotion-21': "in pain|suffering|agony", // 痛苦
    'w-emotion-22': "comfortable|comfy|cozy", // 舒服
    'w-emotion-23': "disappointed", // 失望
    'w-emotion-24': "anxious|anxiety", // 焦慮
    'w-emotion-25': "jealous", // 嫉妒
    'w-emotion-26': "anticipation|looking forward|expectant", // 期待
    'w-emotion-27': "warm|warmth|heartwarming", // 溫暖
    'w-emotion-28': "curious", // 好奇
    'w-emotion-29': "confident|self-confident", // 自信
    'w-emotion-30': "grateful|thankful|thanks", // 感謝
    'w-emotion-31': "dejected|discouraged|downcast", // 沮喪
    'w-emotion-32': "relaxed|at ease|carefree", // 輕鬆
    'w-emotion-33': "regretful|regret|remorse", // 後悔
    'w-emotion-34': "satisfied|content|fulfilled", // 滿足
    'w-emotion-35': "sweet|sweetness|lovey-dovey", // 甜蜜
    'w-emotion-36': "envious|envy", // 羨慕
    'w-emotion-37': "thrilled|overjoyed|jumping for joy", // 雀躍
    'w-emotion-38': "hopeless|despair|desperate", // 絕望
    'w-emotion-39': "nostalgic|nostalgia|missing", // 懷念
    'w-idiom-0': "wait for a rabbit|waiting for a rabbit|rabbit and the stump|wait by a stump", // 守株待兔
    'w-idiom-1': "draw legs on a snake|drawing legs on a snake|gild the lily|legs on a snake", // 畫蛇添足
    'w-idiom-2': "frog in a well|frog in the well|well frog", // 井底之蛙
    'w-idiom-3': "mend the fold|lock the barn door|close the barn door|mend the pen after sheep are lost", // 亡羊補牢
    'w-idiom-4': "fox and the tiger|fox borrows the tiger's might|fox borrowing the tiger's power", // 狐假虎威
    'w-idiom-5': "steal a bell|cover your ears to steal a bell|plug ears to steal a bell|stealing a bell", // 掩耳盜鈴
    'w-idiom-6': "play music to a cow|play the lute to a cow|cast pearls before swine|playing music to a cow", // 對牛彈琴
    'w-idiom-7': "carve a boat for a sword|sword overboard|mark the boat to find a sword|lost sword", // 刻舟求劍
    'w-idiom-8': "snake in the cup|snake in a cup|bow in the cup|bow reflection snake", // 杯弓蛇影
    'w-idiom-9': "snipe and clam|clam and snipe|the snipe and the clam", // 鷸蚌相爭
    'w-idiom-10': "blessing in disguise|old man lost his horse|the old man's horse", // 塞翁失馬
    'w-idiom-11': "blind men and the elephant|blind man and elephant|blind men and elephant", // 盲人摸象
    'w-idiom-12': "move a mountain|moving mountains|move mountains|foolish old man moves mountains", // 愚公移山
    'w-idiom-13': "pull up seedlings|pulling seedlings|pull seedlings to help them grow", // 拔苗助長
    'w-idiom-14': "lord ye loves dragons|fake dragon lover|ye gong loves dragons", // 葉公好龍
    'w-idiom-15': "three visits to the cottage|visit the cottage three times|three visits", // 三顧茅廬
    'w-idiom-16': "crouching tiger hidden dragon|crouching tiger|hidden dragon|tiger and dragon", // 臥虎藏龍
    'w-idiom-17': "add the finishing touch|finishing touch|dot the dragon's eyes", // 畫龍點睛
    'w-idiom-18': "two birds with one arrow|two eagles with one arrow|one arrow two birds", // 一箭雙鵰
    'w-idiom-19': "never miss|perfect aim|hit every shot|bullseye every time", // 百發百中
    'w-idiom-20': "instant success|success on arrival|horse brings success", // 馬到成功
    'w-idiom-21': "fail the exam|failed the exam|last on the list", // 名落孫山
    'w-idiom-22': "burn the boats|burn your bridges|burn the bridges|no turning back|burn your boats", // 破釜沉舟
    'w-idiom-23': "sleep on firewood and taste gall|taste gall|endure hardship for revenge", // 臥薪嘗膽
    'w-idiom-24': "return the jade|return the jade intact|return jade to zhao", // 完璧歸趙
    'w-idiom-25': "carry thorns to apologize|carry thorns and say sorry|bear a switch", // 負荊請罪
    'w-idiom-26': "armchair general|armchair strategist|paper strategy|talk big on paper", // 紙上談兵
    'w-idiom-27': "surrounded on all sides|surrounded by enemies|besieged|trapped on all sides", // 四面楚歌
    'w-idiom-28': "call a deer a horse|calling a deer a horse|point at a deer call it a horse", // 指鹿為馬
    'w-idiom-29': "plums to quench thirst|picture plums to ease thirst|imagine plums", // 望梅止渴
    'w-idiom-30': "every bush is an enemy|seeing enemies everywhere|paranoid", // 草木皆兵
    'w-idiom-31': "have a plan in mind|have a clear plan|bamboo in mind|well prepared", // 胸有成竹
    'w-idiom-32': "charcoal in the snow|a friend in need|timely help|give charcoal in snow", // 雪中送炭
    'w-idiom-33': "icing on the cake|add flowers to brocade|cherry on top", // 錦上添花
    'w-idiom-34': "add fuel to the fire|pour oil on the fire|fuel the fire|fuel to the fire", // 火上加油
    'w-idiom-35': "like a fish in water|fish in water|in your element", // 如魚得水
    'w-idiom-36': "kill two birds with one stone|two birds one stone|two birds with one stone", // 一石二鳥
    'w-idiom-37': "a drop in the ocean|drop in the ocean|a drop in the bucket|drop in the bucket", // 九牛一毛
    'w-idiom-38': "chickens and dogs running wild|chaos|pandemonium|mayhem|total chaos", // 雞飛狗跳
    'w-idiom-39': "dragon and phoenix dancing|flowing calligraphy|flamboyant calligraphy|dragons and phoenixes", // 龍飛鳳舞
    'w-idiom-40': "birds sing flowers bloom|birds and flowers|birdsong and flowers", // 鳥語花香
    'w-idiom-41': "sunny and breezy|lovely weather|fine weather|beautiful day", // 風和日麗
    'w-idiom-42': "flowers bloom in spring|spring has come|warm spring|spring flowers", // 春暖花開
    'w-idiom-43': "ice and snow|snowy landscape|frozen world|icy and snowy", // 冰天雪地
    'w-idiom-44': "the truth comes out|truth revealed|truth comes out|water recedes rocks appear", // 水落石出
    'w-idiom-45': "water wears away stone|dripping water pierces stone|constant dripping wears away stone|persistence", // 滴水穿石
    'w-idiom-46': "look at flowers on horseback|quick glance|skim through|a quick look", // 走馬看花
    'w-idiom-47': "pie in the sky|draw a cake to satisfy hunger|empty promises", // 畫餅充飢
    'w-idiom-48': "tiger parent|tiger mom|hope child becomes a dragon|high hopes for a child", // 望子成龍
    'w-idiom-49': "cornered dog jumps the wall|cornered dog|cornered animal|desperate measures", // 狗急跳牆
    'w-idiom-50': "strong start weak finish|start strong finish weak|big head thin tail", // 虎頭蛇尾
    'w-idiom-51': "startle the snake|beat the grass startle the snake|tip off the enemy", // 打草驚蛇
    'w-idiom-52': "invite the wolf in|let the wolf in|invite a wolf into the house", // 引狼入室
    'w-idiom-53': "mantis stalks the cicada|mantis hunting cicada|mantis and cicada", // 螳螂捕蟬
    'w-idiom-54': "old horse knows the way|an old horse knows the road|experienced guide", // 老馬識途
    'w-idiom-55': "add wings to a tiger|winged tiger|even stronger", // 如虎添翼
    'w-idiom-56': "wolf it down|wolf down food|gobble up|devour|eat like a wolf", // 狼吞虎嚥
    'w-idiom-57': "on pins and needles|on edge|butterflies in my stomach|jittery", // 七上八下
    'w-idiom-58': "colorful|multicolored|rainbow colors|all the colors", // 五顏六色
    'w-idiom-59': "everyone talking at once|all talking at once|noisy discussion", // 七嘴八舌
    'w-idiom-60': "in a flurry|flustered|scrambling|rushing about", // 手忙腳亂
    'w-idiom-61': "dumbfounded|stunned|speechless|jaw drop|gobsmacked", // 目瞪口呆
    'w-idiom-62': "red in the face|blushing|flushed|beet red", // 面紅耳赤
    'w-idiom-63': "over the moon|overjoyed|elated|heart blooming with joy", // 心花怒放
    'w-idiom-64': "forget to eat and sleep|lose sleep over it|absorbed in work", // 廢寢忘食
    'w-idiom-65': "contradict yourself|self-contradiction|spear and shield|contradiction", // 自相矛盾
    'w-idiom-66': "show off in front of an expert|teach your grandmother|swing an axe before the master", // 班門弄斧
    'w-idiom-67': "blind imitation|copycat|imitating xi shi|dong shi copies xi shi", // 東施效顰
    'w-idiom-68': "fake it in the band|pretend to play the flute|just filling the numbers", // 濫竽充數
    'w-idiom-69': "head in the wrong direction|wrong direction|opposite direction|going the wrong way", // 南轅北轍
    'w-idiom-70': "lips sealed|keep a secret|keep mum|tight-lipped", // 守口如瓶
    'w-idiom-71': "from bad to worse|make matters worse|add insult to injury|adding frost to snow", // 雪上加霜
    'w-idiom-72': "time flies|time flies like an arrow", // 光陰似箭
    'w-idiom-73': "the sea becomes farmland|great changes over time|how times change", // 滄海桑田
    'w-idiom-74': "shangri-la|utopia|paradise|peach blossom spring", // 世外桃源
    'w-idiom-75': "clear at a glance|plain as day|obvious|crystal clear", // 一目瞭然
    'w-idiom-76': "same difference|six of one half a dozen of the other|about the same|no difference", // 半斤八兩
    'w-idiom-77': "ripe fruit falls|all in good time|things happen naturally|when the melon is ripe it falls", // 瓜熟蒂落
    'w-idiom-78': "see the sky from a well|narrow view|narrow minded|narrow-minded", // 坐井觀天
    'w-idiom-79': "eyes glued|eyes glued to it|stare without blinking|unblinking", // 目不轉睛
    'w-idiom-80': "every little bit helps|sand piles into a tower|little by little|many a little makes a mickle|small things add up", // 聚沙成塔
    'w-idiom-81': "dazzled|dizzying|bewildered|dazzling display|eye-popping", // 眼花撩亂
    'w-idiom-82': "light at the end of the tunnel|a new hope|unexpected turn for the better", // 柳暗花明
    'w-idiom-83': "get straight to the point|get to the point|straight to the point|cut to the chase", // 開門見山
    'w-idiom-84': "soar to the sky|take off|skyrocket|shoot to fame|meteoric rise", // 一飛沖天
    'w-idiom-85': "full of energy|full of life|energetic|lively as a dragon", // 生龍活虎
    'w-idiom-86': "black sheep|bad apple|rotten apple", // 害群之馬
    'w-idiom-87': "beautiful scenery|picturesque landscape|green hills and clear water", // 山明水秀
    'w-idiom-88': "half-hearted|half hearted|two minds|indecisive|fickle", // 三心二意
    'w-idiom-89': "wholeheartedly|whole-hearted|with all your heart|single-minded", // 一心一意
    'w-idiom-90': "quick eyes quick hands|quick-witted|sharp eyes and fast hands|quick reflexes", // 眼明手快
    'w-idiom-91': "eye-opening|eye opening|eye opener|broaden your horizons|open your eyes", // 大開眼界
    'w-phenomenon-0': "snowfall|snowing|snow", // 下雪
    'w-phenomenon-1': "sunrise", // 日出
    'w-phenomenon-2': "sunset", // 日落
    'w-phenomenon-3': "ocean wave|wave|waves", // 海浪
    'w-phenomenon-4': "earthquake", // 地震
    'w-phenomenon-5': "typhoon|hurricane", // 颱風
    'w-phenomenon-6': "thunderstorm", // 雷雨
    'w-phenomenon-7': "aurora|northern lights", // 極光
    'w-phenomenon-8': "fog|mist", // 濃霧
    'w-phenomenon-9': "lunar eclipse|moon eclipse", // 月蝕
    'w-phenomenon-10': "solar eclipse|sun eclipse", // 日蝕
    'w-phenomenon-11': "flood|flooding", // 洪水
    'w-phenomenon-12': "landslide", // 山崩
    'w-phenomenon-13': "avalanche", // 雪崩
    'w-phenomenon-14': "tide|tides", // 潮汐
    'w-phenomenon-15': "tsunami|tidal wave", // 海嘯
    'w-phenomenon-16': "hail|hailstorm", // 冰雹
    'w-phenomenon-17': "drought", // 乾旱
    'w-phenomenon-18': "evening glow|afterglow|sunset glow", // 晚霞
    'w-phenomenon-19': "comet", // 彗星
    'w-phenomenon-20': "meteor shower", // 流星雨
    'w-phenomenon-21': "blizzard|snowstorm", // 暴風雪
    'w-phenomenon-22': "sandstorm|dust storm", // 沙塵暴
    'w-phenomenon-23': "volcanic eruption|eruption|volcano eruption", // 火山爆發
    'w-phenomenon-24': "mudslide|debris flow", // 土石流
    'w-phenomenon-25': "freezing|frozen", // 結冰
    'w-phenomenon-26': "icicle", // 冰柱
    'w-phenomenon-27': "rain shower|shower", // 陣雨
    'w-phenomenon-28': "heavy rain|downpour", // 暴雨
    'w-phenomenon-29': "full moon", // 滿月
    'w-phenomenon-30': "meteorite", // 隕石
    'w-phenomenon-31': "heat wave|heatwave", // 熱浪
    'w-phenomenon-32': "mirage", // 海市蜃樓
    'w-phenomenon-33': "foehn wind|foehn|hot dry wind", // 焚風
    'w-phenomenon-34': "smog|haze", // 霧霾
    'w-phenomenon-35': "cold wave|cold snap", // 寒流
    'w-phenomenon-36': "plum rain|rainy season", // 梅雨
    'w-phenomenon-37': "monsoon", // 季風
    'w-phenomenon-38': "sun halo|solar halo|halo", // 日暈
    'w-phenomenon-39': "moon halo|lunar halo", // 月暈
    'w-phenomenon-40': "frost", // 結霜
    'w-phenomenon-41': "high tide|rising tide", // 漲潮
    'w-phenomenon-42': "low tide|ebb tide", // 退潮
    'w-phenomenon-43': "morning glow|sunrise glow", // 朝霞
    'w-phenomenon-44': "dawn|daybreak", // 黎明
    'w-phenomenon-45': "dusk|twilight", // 黃昏
    'w-phenomenon-46': "drizzle", // 毛毛雨
    'w-phenomenon-47': "gale|strong wind|high wind", // 狂風
    'w-phenomenon-48': "snowdrift|snow cover", // 積雪
    'w-place-0': "school", // 學校
    'w-place-1': "hospital", // 醫院
    'w-place-2': "classroom", // 教室
    'w-place-3': "park", // 公園
    'w-place-4': "supermarket|grocery store", // 超市
    'w-place-5': "airport", // 機場
    'w-place-6': "bridge", // 橋
    'w-place-7': "swimming pool|pool", // 游泳池
    'w-place-8': "zoo", // 動物園
    'w-place-9': "amusement park|theme park|playground park", // 遊樂園
    'w-place-10': "castle", // 城堡
    'w-place-11': "lighthouse", // 燈塔
    'w-place-12': "kitchen", // 廚房
    'w-place-13': "bathroom", // 浴室
    'w-place-14': "post office", // 郵局
    'w-place-15': "market", // 市場
    'w-place-16': "restaurant", // 餐廳
    'w-place-17': "bookstore|bookshop", // 書店
    'w-place-18': "playground|schoolyard", // 操場
    'w-place-19': "temple", // 廟宇
    'w-place-20': "farm", // 農場
    'w-place-21': "orchard", // 果園
    'w-place-22': "greenhouse", // 溫室
    'w-place-23': "living room", // 客廳
    'w-place-24': "stairs|staircase|stairway", // 樓梯
    'w-place-25': "roof|rooftop", // 屋頂
    'w-place-26': "tunnel", // 隧道
    'w-place-27': "pavilion|gazebo", // 涼亭
    'w-place-28': "corridor|hallway", // 走廊
    'w-place-29': "pharmacy|drugstore", // 藥局
    'w-place-30': "overpass|pedestrian bridge|footbridge", // 天橋
    'w-place-31': "library", // 圖書館
    'w-place-32': "bank", // 銀行
    'w-place-33': "night market", // 夜市
    'w-place-34': "bakery", // 麵包店
    'w-place-35': "flower shop|florist", // 花店
    'w-place-36': "aquarium", // 水族館
    'w-place-37': "art museum|art gallery|gallery", // 美術館
    'w-place-38': "gymnasium|sports hall|indoor stadium", // 體育館
    'w-place-39': "train station|station", // 車站
    'w-place-40': "harbor|harbour|port", // 港口
    'w-place-41': "gas station|petrol station", // 加油站
    'w-place-42': "fire station", // 消防局
    'w-place-43': "church", // 教堂
    'w-place-44': "ranch", // 牧場
    'w-place-45': "vegetable garden|veggie garden", // 菜園
    'w-place-46': "bedroom", // 臥室
    'w-place-47': "balcony", // 陽台
    'w-place-48': "elevator|lift", // 電梯
    'w-place-49': "dental clinic|dentist's office", // 牙科
    'w-place-50': "barbershop|barber shop|hair salon", // 理髮店
    'w-place-51': "toy store|toy shop", // 玩具店
    'w-place-52': "fruit stand|fruit stall", // 水果攤
    'w-place-53': "drink shop|juice bar|bubble tea shop", // 飲料店
    'w-place-54': "gym|fitness center|fitness centre", // 健身房
    'w-place-55': "stadium|ballpark|sports field", // 球場
    'w-place-56': "skating rink|ice rink|rink", // 溜冰場
    'w-place-57': "campsite|campground", // 露營區
    'w-place-58': "convenience store", // 便利商店
    'w-place-59': "cafe|coffee shop|café", // 咖啡廳
    'w-place-60': "cinema|movie theater|movie theatre", // 電影院
    'w-place-61': "museum", // 博物館
    'w-place-62': "parking lot|car park", // 停車場
    'w-place-63': "police station", // 警察局
    'w-place-64': "skyscraper|tall building", // 摩天大樓
    'w-place-65': "fountain", // 噴水池
    'w-place-66': "breakfast shop|breakfast diner", // 早餐店
    'w-place-67': "fast food restaurant|fast food place|fast food", // 速食店
    'w-place-68': "pet shop|pet store", // 寵物店
    'w-place-69': "ski resort|ski slope|ski field", // 滑雪場
    'w-place-70': "hardware store", // 五金行
    'w-place-71': "internet cafe|internet café|gaming cafe", // 網咖
    'w-place-72': "dessert shop|dessert store|sweet shop", // 甜點店
    'w-place-73': "bus shelter|bus stop", // 候車亭
    'w-place-74': "clinic", // 診所
    'w-place-75': "laundromat|laundry|dry cleaner", // 洗衣店
    'w-place-76': "stationery store|stationery shop", // 文具店
    'w-place-77': "observation deck|viewing platform|lookout", // 觀景台
    'w-place-78': "underpass|pedestrian underpass", // 地下道
    'w-expression-0': "smile", // 微笑
    'w-expression-1': "cry|crying|weep", // 哭泣
    'w-expression-2': "laugh|laughing|laughing out loud", // 大笑
    'w-expression-3': "wink|blink", // 眨眼
    'w-expression-4': "wave|waving|wave hello|wave goodbye", // 揮手
    'w-expression-5': "thumbs up|like", // 比讚
    'w-expression-6': "hug|embrace", // 擁抱
    'w-expression-7': "pout|pouting", // 嘟嘴
    'w-expression-8': "sigh", // 嘆氣
    'w-expression-9': "shake head|shake your head|head shake", // 搖頭
    'w-expression-10': "nod|nodding|nod head", // 點頭
    'w-expression-11': "blow a kiss|air kiss|flying kiss", // 飛吻
    'w-expression-12': "silly grin|goofy grin|goofy smile|smirk", // 傻笑
    'w-expression-13': "zone out|daydream|daydreaming|space out|spacing out|blank stare", // 發呆
    'w-expression-14': "stomp|stomp feet|stomp your feet|stamp feet", // 跺腳
    'w-expression-15': "finger heart|heart sign|make a heart|heart hands|heart gesture", // 比心
    'w-expression-16': "scratch head|scratch your head|head scratch", // 抓頭
    'w-expression-17': "frown|furrowed brow", // 皺眉
    'w-expression-18': "sneeze|achoo", // 打噴嚏
    'w-expression-19': "cough|coughing", // 咳嗽
    'w-expression-20': "clap|applaud|clapping|applause", // 鼓掌
    'w-expression-21': "salute", // 敬禮
    'w-expression-22': "handshake|shake hands", // 握手
    'w-expression-23': "act spoiled|acting spoiled|pester sweetly", // 撒嬌
    'w-expression-24': "glare|stare|glaring", // 瞪眼
    'w-expression-25': "snicker|giggle|snigger", // 偷笑
    'w-expression-26': "shout|yell|scream|shouting", // 大叫
    'w-expression-27': "drool|drooling", // 流口水
    'w-expression-28': "blush|blushing", // 臉紅
    'w-expression-29': "funny face|silly face|make a face", // 鬼臉
    'w-expression-30': "cover mouth|cover your mouth|hand over mouth|gasp", // 摀嘴
    'w-expression-31': "high five|high-five", // 擊掌
    'w-expression-32': "shrug", // 聳肩
    'w-expression-33': "stretch|stretching", // 伸懶腰
    'w-expression-34': "stick out tongue|stick out your tongue|tongue out", // 吐舌頭
    'w-expression-35': "yawn|yawning", // 打哈欠
    'w-expression-36': "peace sign|v sign|victory sign|peace", // 剪刀手
    'w-expression-37': "whistling|whistle a tune", // 吹口哨
    'w-expression-38': "doze off|dozing|snooze|nodding off", // 打瞌睡
    'w-expression-39': "wry smile|bitter smile|forced smile", // 苦笑
    'w-expression-40': "squint|squinting", // 瞇眼
    'w-expression-41': "pursed lips|press lips|lips pressed|purse lips", // 抿嘴
    'w-expression-42': "rub hands|rub your hands|rubbing hands", // 搓手
    'w-expression-43': "grind teeth|grinding teeth|teeth grinding", // 磨牙
    'w-expression-44': "raise an eyebrow|raised eyebrow|arch eyebrow|eyebrow raise", // 挑眉
    'w-expression-45': "open mouth|open your mouth|mouth open|gape", // 張嘴
    'w-expression-46': "act cute|play cute|acting cute|cutesy", // 裝可愛
    'w-job-0': "doctor", // 醫生
    'w-job-1': "teacher", // 老師
    'w-job-2': "police officer|policeman|police|cop", // 警察
    'w-job-3': "firefighter|fireman", // 消防員
    'w-job-4': "chef|cook", // 廚師
    'w-job-5': "painter|artist", // 畫家
    'w-job-6': "singer", // 歌手
    'w-job-7': "farmer", // 農夫
    'w-job-8': "mail carrier|postman|mailman|letter carrier", // 郵差
    'w-job-9': "nurse", // 護士
    'w-job-10': "veterinarian|vet", // 獸醫
    'w-job-11': "judge", // 法官
    'w-job-12': "news anchor|anchor|newscaster|anchorman", // 主播
    'w-job-13': "actor|actress", // 演員
    'w-job-14': "dancer", // 舞者
    'w-job-15': "coach|trainer", // 教練
    'w-job-16': "fisherman|fisher", // 漁夫
    'w-job-17': "store clerk|shop assistant|salesclerk|clerk", // 店員
    'w-job-18': "airline captain|captain", // 機長
    'w-job-19': "ship captain|sea captain|captain of a ship", // 船長
    'w-job-20': "astronaut", // 太空人
    'w-job-21': "pilot|aviator", // 飛行員
    'w-job-22': "engineer", // 工程師
    'w-job-23': "lawyer|attorney", // 律師
    'w-job-24': "reporter|journalist", // 記者
    'w-job-25': "writer|author", // 作家
    'w-job-26': "film director|director|movie director", // 導演
    'w-job-27': "conductor|orchestra conductor", // 指揮家
    'w-job-28': "referee|umpire", // 裁判
    'w-job-29': "hunter", // 獵人
    'w-job-30': "carpenter|woodworker", // 木匠
    'w-job-31': "plumber|electrician", // 水電工
    'w-job-32': "barber|hairdresser|hair stylist", // 理髮師
    'w-job-33': "driver", // 司機
    'w-job-34': "lifeguard", // 救生員
    'w-job-35': "gardener", // 園丁
    'w-job-36': "cleaner|janitor|sanitation worker", // 清潔員
    'w-job-37': "courier|delivery person|delivery man|delivery driver", // 快遞員
    'w-job-38': "security guard|guard", // 保全
    'w-job-39': "barista", // 咖啡師
    'w-job-40': "principal|headmaster|school principal", // 校長
    'w-job-41': "photographer", // 攝影師
    'w-job-42': "magician", // 魔術師
    'w-job-43': "scientist", // 科學家
    'w-job-44': "architect", // 建築師
    'w-job-45': "musician", // 音樂家
    'w-job-46': "athlete", // 運動員
    'w-job-47': "baker", // 麵包師
    'w-job-48': "waiter|waitress|server", // 服務生
    'w-job-49': "flight attendant|stewardess|air hostess", // 空服員
    'w-job-50': "diver|scuba diver", // 潛水員
    'w-job-51': "dentist", // 牙醫
    'w-job-52': "pastry chef|pastry cook|dessert chef", // 甜點師
    'w-job-53': "beautician|beauty therapist|cosmetologist", // 美容師
    'w-job-54': "illustrator", // 插畫家
    'w-job-55': "host|emcee|presenter", // 主持人
    'w-job-56': "worker|laborer|labourer", // 工人
    'w-job-57': "shepherd", // 牧羊人
    'w-job-58': "secretary", // 秘書
    'w-job-59': "psychologist|therapist|counselor", // 心理師
    'w-job-60': "sculptor", // 雕刻家
    'w-job-61': "calligrapher", // 書法家
    'w-job-62': "librarian", // 圖書館員
    'w-job-63': "archaeologist|archeologist", // 考古學家
    'w-job-64': "explorer|adventurer", // 探險家
    'w-job-65': "bank teller|banker|bank clerk", // 銀行員
    'w-job-66': "bartender|mixologist", // 調酒師
    'w-job-67': "florist|flower arranger|floral designer", // 花藝師
    'w-job-68': "masseur|masseuse|massage therapist", // 按摩師
    'w-job-69': "yoga teacher|yoga instructor", // 瑜珈老師
    'w-job-70': "physical therapist|physiotherapist|rehab therapist", // 復健師
    'w-job-71': "cartoonist|comic artist|manga artist", // 漫畫家
    'w-job-72': "potter|ceramic artist|ceramist", // 陶藝家
    'w-job-73': "translator|interpreter", // 翻譯員
    'w-job-74': "model|fashion model", // 模特兒
    'w-job-75': "designer", // 設計師
    'w-job-76': "professor", // 教授
    'w-job-77': "pharmacist|chemist|druggist", // 藥師
    'w-fantasy-0': "princess", // 公主
    'w-fantasy-1': "king", // 國王
    'w-fantasy-2': "angel", // 天使
    'w-fantasy-3': "pirate", // 海盜
    'w-fantasy-4': "dragon", // 巨龍
    'w-fantasy-5': "mermaid|merman", // 人魚
    'w-fantasy-6': "space alien|alien|extraterrestrial|martian", // 外星人
    'w-fantasy-7': "ghost|spirit", // 幽靈
    'w-fantasy-8': "fairy|fairy godmother", // 仙女
    'w-fantasy-9': "werewolf", // 狼人
    'w-fantasy-10': "zombie", // 殭屍
    'w-fantasy-11': "witch", // 巫婆
    'w-fantasy-12': "knight", // 騎士
    'w-fantasy-13': "prince", // 王子
    'w-fantasy-14': "queen", // 女王
    'w-fantasy-15': "ninja", // 忍者
    'w-fantasy-16': "superman|superhero", // 超人
    'w-fantasy-17': "demon|devil", // 惡魔
    'w-fantasy-18': "magic wand|wand", // 魔法棒
    'w-fantasy-19': "treasure map", // 藏寶圖
    'w-fantasy-20': "treasure chest|treasure box|chest", // 寶箱
    'w-fantasy-21': "pegasus|flying horse|winged horse", // 飛馬
    'w-fantasy-22': "fire dragon|fire-breathing dragon", // 火龍
    'w-fantasy-23': "wizard|mage|sorcerer|warlock", // 魔法師
    'w-fantasy-24': "phoenix", // 鳳凰
    'w-fantasy-25': "time machine", // 時光機
    'w-fantasy-26': "magic carpet|flying carpet", // 魔毯
    'w-fantasy-27': "elf|sprite|pixie|little elf", // 小精靈
    'w-fantasy-28': "unicorn", // 獨角獸
    'w-fantasy-29': "vampire", // 吸血鬼
    'w-fantasy-30': "dwarf|gnome", // 小矮人
    'w-fantasy-31': "mummy", // 木乃伊
    'w-fantasy-32': "crystal ball", // 水晶球
    'w-fantasy-33': "flying broomstick|broomstick|flying broom|witch's broom", // 飛天掃帚
    'w-fantasy-34': "magic lamp|genie lamp|aladdin's lamp|genie", // 神燈
    'w-fantasy-35': "dragon egg", // 龍蛋
    'w-fantasy-36': "ufo|flying saucer", // 飛碟
    'w-fantasy-37': "sun wukong|monkey king|wukong", // 孫悟空
    'w-fantasy-38': "chang'e|moon goddess", // 嫦娥
    'w-fantasy-39': "giant", // 巨人
    'w-fantasy-40': "yeti|abominable snowman|snow monster", // 雪怪
    'w-fantasy-41': "god of wealth|money god|fortune god", // 財神
    'w-fantasy-42': "matchmaker god|god of matchmaking|matchmaker", // 月老
    'w-fantasy-43': "treant|ent|tree man", // 樹人
    'w-fantasy-44': "griffin|gryphon|griffon", // 獅鷲
    'w-fantasy-45': "samurai|warrior", // 武士
    'w-fantasy-46': "hero", // 英雄
    'w-fantasy-47': "monster|yokai|spirit monster", // 妖怪
    'w-fantasy-48': "tengu", // 天狗
    'w-fantasy-49': "thunder god|god of thunder", // 雷神
    'w-fantasy-50': "nezha|nata", // 哪吒
    'w-fantasy-51': "jade rabbit|moon rabbit", // 玉兔
    'w-fantasy-52': "cowherd|the cowherd", // 牛郎
    'w-fantasy-53': "mazu|matsu|sea goddess", // 媽祖
    'w-fantasy-54': "sea monster|kraken", // 海怪
    'w-fantasy-55': "portal|teleport portal|teleporter", // 傳送門
    'w-fantasy-56': "siren|sea siren|sea witch", // 海妖
    'w-fantasy-57': "dryad|tree spirit|tree nymph", // 樹精
    'w-fantasy-58': "kappa", // 河童
    'w-fantasy-59': "fox spirit|fox fairy|huli jing", // 狐仙
    'w-fantasy-60': "dragon king", // 龍王
    'w-fantasy-61': "sha wujing|sandy|friar sand", // 沙悟淨
    'w-fantasy-62': "weaver girl|weaver maiden|the weaver girl", // 織女
    'w-fantasy-63': "centaur", // 半人馬
    'w-fantasy-64': "nine-tailed fox|nine tailed fox|kitsune", // 九尾狐
    'w-fantasy-65': "spellbook|magic book|book of spells", // 魔法書
    'w-fantasy-66': "wishing well|wishing fountain|wish pond", // 許願池
    'w-fantasy-67': "invisibility cloak|invisible cloak|cloak of invisibility", // 隱形斗篷
    'w-fantasy-68': "gargoyle", // 石像鬼
    'w-fantasy-69': "cerberus|three-headed dog|three headed dog", // 三頭犬
    'w-fantasy-70': "cyclops", // 獨眼巨人
    'w-fantasy-71': "zhu bajie|pigsy", // 豬八戒
    'w-fantasy-72': "tang monk|tripitaka|xuanzang", // 唐三藏
    'w-fantasy-73': "earth god|land god|tudigong|god of the land", // 土地公
    'w-fantasy-74': "noah's ark|noahs ark", // 諾亞方舟
    'w-action-0': "running|run|jogging", // 跑步
    'w-action-1': "sleeping|sleep", // 睡覺
    'w-action-2': "swimming|swim", // 游泳
    'w-action-3': "fishing|go fishing", // 釣魚
    'w-action-4': "brushing teeth|brush teeth|brush your teeth", // 刷牙
    'w-action-5': "taking a bath|take a shower|bathe|shower|bath", // 洗澡
    'w-action-6': "eating|eat|having a meal|having dinner", // 吃飯
    'w-action-7': "singing|sing", // 唱歌
    'w-action-8': "dancing|dance", // 跳舞
    'w-action-9': "reading|read a book|reading a book", // 看書
    'w-action-10': "taking a photo|take a picture|taking pictures|take a photo", // 拍照
    'w-action-11': "drawing|painting|draw", // 畫畫
    'w-action-12': "hiking|climbing a mountain|mountain climbing|hike", // 爬山
    'w-action-13': "planting flowers|plant flowers|gardening", // 種花
    'w-action-14': "drinking water|drink water|drinking", // 喝水
    'w-action-15': "sweeping|sweep the floor|sweeping the floor", // 掃地
    'w-action-16': "washing dishes|wash dishes|do the dishes", // 洗碗
    'w-action-17': "watering flowers|water the flowers|watering plants|water plants", // 澆花
    'w-action-18': "taking a walk|walking|go for a walk|stroll", // 散步
    'w-action-19': "climbing a tree|climb a tree|tree climbing", // 爬樹
    'w-action-20': "skiing|ski", // 滑雪
    'w-action-21': "diving|scuba diving|snorkeling", // 潛水
    'w-action-22': "camping|go camping", // 露營
    'w-action-23': "picnic|having a picnic", // 野餐
    'w-action-24': "writing|handwriting|write", // 寫字
    'w-action-25': "paper cutting|cutting paper|paper cut|paper-cutting", // 剪紙
    'w-action-26': "waiting in line|queueing|standing in line|queue up|lining up", // 排隊
    'w-action-27': "going to school|go to school", // 上學
    'w-action-28': "dreaming|dream|having a dream", // 做夢
    'w-action-29': "moving house|moving|moving day|move house", // 搬家
    'w-action-30': "growing vegetables|grow vegetables|planting vegetables|vegetable gardening", // 種菜
    'w-action-31': "feeding birds|feed the birds|feed birds", // 餵鳥
    'w-action-32': "washing a car|car wash|wash the car|washing the car", // 洗車
    'w-action-33': "cooking|cook rice|cooking rice|cook dinner", // 煮飯
    'w-action-34': "getting a shot|getting an injection|injection|vaccination|get a shot", // 打針
    'w-action-35': "playing soccer|play soccer|kicking a ball|play football", // 踢足球
    'w-action-36': "washing hands|wash your hands|wash hands|handwashing", // 洗手
    'w-action-37': "mopping|mop the floor|mopping the floor", // 拖地
    'w-action-38': "walking the dog|walk the dog|dog walking|walking a dog", // 遛狗
    'w-action-39': "ice skating|skating|roller skating", // 溜冰
    'w-action-40': "surfing|surf", // 衝浪
    'w-action-41': "rowing|row a boat|rowing a boat|boating", // 划船
    'w-action-42': "barbecue|bbq|grilling|barbecuing", // 烤肉
    'w-action-43': "shopping|go shopping", // 購物
    'w-action-44': "origami|paper folding|folding paper|fold paper", // 摺紙
    'w-action-45': "making a phone call|phone call|calling|make a call|talking on the phone", // 打電話
    'w-action-46': "playing games|play games|gaming|video games", // 玩遊戲
    'w-action-47': "snoring|snore", // 打呼
    'w-action-48': "skateboarding|skate", // 溜滑板
    'w-action-49': "hopscotch", // 跳格子
    'w-action-50': "blowing out candles|blow out the candles|blow out candles", // 吹蠟燭
    'w-action-51': "opening presents|open gifts|unwrapping gifts|open a present|unwrap a present", // 拆禮物
    'w-action-52': "mailing a letter|send a letter|post a letter|sending a letter", // 寄信
    'w-action-53': "feeding fish|feed the fish|feed fish", // 餵魚
    'w-action-54': "folding clothes|fold clothes|folding laundry|fold the laundry", // 摺衣服
    'w-action-55': "grocery shopping|buying groceries|buy groceries|shopping for groceries", // 買菜
    'w-action-56': "making tea|brew tea|make tea|brewing tea", // 泡茶
    'w-action-57': "getting a haircut|haircut|cutting hair|get a haircut", // 剪頭髮
    'w-action-58': "playing basketball|play basketball|shooting hoops|shoot hoops", // 打籃球
    'w-action-59': "baking a cake|bake a cake|making a cake|make a cake", // 做蛋糕
    'w-action-60': "flying a kite|fly a kite|kite flying|flying kites", // 放風箏
    'w-action-61': "playing guitar|play guitar|play the guitar|playing the guitar", // 彈吉他
    'w-action-62': "riding a bike|ride a bike|cycling|bike riding|riding a bicycle", // 騎腳踏車
    'w-action-63': "hanging laundry|hang laundry|drying clothes|hang clothes to dry|hanging clothes", // 曬衣服
    'w-action-64': "building a snowman|build a snowman|make a snowman|making a snowman", // 堆雪人
    'w-action-65': "watching tv|watch tv|watching television|watch television", // 看電視
    'w-action-66': "taking a flight|flying|take a plane|boarding a plane", // 搭飛機
    'w-action-67': "crossing the street|cross the street|crossing the road|cross the road", // 過馬路
    'w-action-68': "playing baseball|play baseball|batting|swinging a bat", // 打棒球
    'w-action-69': "building a sandcastle|build a sandcastle|make a sandcastle|making a sandcastle|sandcastle", // 堆沙堡
    'w-action-70': "hide and seek|hide-and-seek|playing hide and seek", // 捉迷藏
    'w-action-71': "blowing bubbles|blow bubbles|bubble blowing", // 吹泡泡
    'w-action-72': "climbing stairs|climb the stairs|climbing the stairs|go upstairs|take the stairs", // 爬樓梯
    'w-action-73': "seeing a doctor|see a doctor|visiting the doctor|doctor visit|go to the doctor", // 看醫生
    'w-action-74': "after school|school is out|school is over|leaving school|going home from school", // 放學
    'w-action-75': "making a wish|make a wish|wishing|wish", // 許願
    'w-action-76': "writing a card|write a card|writing cards|make a card", // 寫卡片
    'w-action-77': "making coffee|brew coffee|make coffee|brewing coffee|pour-over coffee", // 沖咖啡
    'w-action-78': "taking the elevator|take the elevator|riding the elevator|ride the elevator|taking an elevator", // 搭電梯
    'w-action-79': "browsing the night market|visiting a night market|night market stroll|going to the night market", // 逛夜市
    'w-action-80': "playing volleyball|play volleyball|spiking|volleyball game", // 打排球
    'w-action-81': "playing badminton|play badminton|badminton game", // 打羽球
    'w-action-82': "playing house|play house|pretend play|playing pretend|house play", // 扮家家酒
    'w-action-83': "wrapping a gift|wrap a gift|wrapping presents|gift wrapping|wrap a present", // 包禮物
    'w-action-84': "cleaning windows|wash windows|clean the window|wiping windows|washing windows", // 擦窗戶
    'w-action-85': "ironing|iron clothes|ironing clothes|press clothes", // 燙衣服
    'w-action-86': "baking cookies|bake cookies|make cookies|baking biscuits", // 烤餅乾
    'w-action-87': "taking a temperature|take temperature|checking temperature|take someone's temperature|temperature check", // 量體溫
    'w-action-88': "waiting at a red light|stopped at a red light|red light|waiting for the light|stop at red light", // 等紅燈
    'w-star-0': "jay chou", // 周杰倫
    'w-star-1': "jolin tsai", // 蔡依林
    'w-star-2': "mayday", // 五月天
    'w-star-3': "a-mei|amei|a-mei chang", // 張惠妹
    'w-star-4': "jj lin", // 林俊傑
    'w-star-5': "andy lau", // 劉德華
    'w-star-6': "jackie chan", // 成龍
    'w-star-7': "stephen chow", // 周星馳
    'w-star-8': "tony leung", // 梁朝偉
    'w-star-9': "jacky cheung", // 張學友
    'w-star-10': "aaron kwok", // 郭富城
    'w-star-11': "g.e.m.|gem tang|g.e.m. tang", // 鄧紫棋
    'w-star-12': "jam hsiao", // 蕭敬騰
    'w-star-13': "eason chan", // 陳奕迅
    'w-star-14': "ang lee", // 李安
    'w-star-15': "michelle yeoh", // 楊紫瓊
    'w-star-16': "shu qi", // 舒淇
    'w-star-17': "lin chi-ling|chiling lin", // 林志玲
    'w-star-18': "takeshi kaneshiro", // 金城武
    'w-star-19': "chow yun-fat|chow yun fat", // 周潤發
    'w-star-20': "bruce lee", // 李小龍
    'w-star-21': "donnie yen", // 甄子丹
    'w-star-22': "maggie cheung", // 張曼玉
    'w-star-23': "gong li", // 鞏俐
    'w-star-24': "zhang ziyi", // 章子怡
    'w-star-25': "fei yu-ching|yu-ching fei", // 費玉清
    'w-star-26': "feng fei-fei|fong fei-fei", // 鳳飛飛
    'w-star-27': "teresa teng", // 鄧麗君
    'w-star-28': "wu bai", // 伍佰
    'w-star-29': "leslie cheung", // 張國榮
    'w-star-30': "taylor swift", // 泰勒絲
    'w-star-31': "beyonce|beyoncé", // 碧昂絲
    'w-star-32': "madonna", // 瑪丹娜
    'w-star-33': "michael jackson", // 麥可傑克森
    'w-star-34': "elvis presley|elvis", // 貓王
    'w-star-35': "the beatles|beatles", // 披頭四
    'w-star-36': "tom cruise", // 湯姆克魯斯
    'w-star-37': "leonardo dicaprio|leo dicaprio|dicaprio", // 李奧納多
    'w-star-38': "brad pitt", // 布萊德彼特
    'w-star-39': "emma watson", // 艾瑪華森
    'w-star-40': "keanu reeves", // 基努李維
    'w-star-41': "audrey hepburn", // 奧黛麗赫本
    'w-star-42': "marilyn monroe", // 瑪麗蓮夢露
    'w-star-43': "charlie chaplin|chaplin", // 卓別林
    'w-star-44': "mr bean|mr. bean|mister bean", // 憨豆先生
    'w-star-45': "michael jordan", // 麥可喬丹
    'w-star-46': "lionel messi|messi", // 梅西
    'w-star-47': "david beckham|beckham", // 貝克漢
    'w-star-48': "roger federer|federer", // 費德勒
    'w-star-49': "shohei ohtani|ohtani", // 大谷翔平
    'w-star-50': "chien-ming wang|wang chien-ming", // 王建民
    'w-star-51': "tai tzu-ying|tai tzu ying", // 戴資穎
    'w-star-52': "ariel lin", // 林依晨
    'w-star-53': "gwei lun-mei|gwei lun mei", // 桂綸鎂
    'w-star-54': "jeannie hsieh|hsieh chin-yen|jinny hsieh", // 謝金燕
    'w-star-55': "stefanie sun", // 孫燕姿
    'w-star-56': "emil chau", // 周華健
    'w-star-57': "chang chen-yue|a-yue", // 張震嶽
    'w-star-58': "cheer chen", // 陳綺貞
    'w-star-59': "crowd lu", // 盧廣仲
    'w-star-60': "rainie yang", // 楊丞琳
    'w-star-61': "elva hsiao", // 蕭亞軒
    'w-star-62': "vivian hsu", // 徐若瑄
    'w-star-63': "chang hsiao-yen|xiao yan zhang", // 張小燕
    'w-star-64': "rene liu", // 劉若英
    'w-star-65': "fish leong", // 梁靜茹
    'w-star-66': "jody chiang", // 江蕙
    'w-star-67': "richie jen", // 任賢齊
    'w-star-68': "lady gaga", // 女神卡卡
    'w-star-69': "adele", // 愛黛兒
    'w-star-70': "ed sheeran", // 艾德希蘭
    'w-star-71': "celine dion|céline dion", // 席琳狄翁
    'w-star-72': "dwayne johnson|the rock", // 巨石強森
    'w-star-73': "tom hanks", // 湯姆漢克斯
    'w-star-74': "meryl streep", // 梅莉史翠普
    'w-star-75': "natalie portman", // 娜塔莉波曼
    'w-star-76': "robert downey jr|robert downey jr.|rdj", // 小勞勃道尼
    'w-movie-0': "titanic", // 鐵達尼號
    'w-movie-1': "avatar", // 阿凡達
    'w-movie-2': "jurassic park", // 侏羅紀公園
    'w-movie-3': "star wars", // 星際大戰
    'w-movie-4': "harry potter", // 哈利波特
    'w-movie-5': "the lord of the rings|lord of the rings", // 魔戒
    'w-movie-6': "toy story", // 玩具總動員
    'w-movie-7': "frozen", // 冰雪奇緣
    'w-movie-8': "the lion king|lion king", // 獅子王
    'w-movie-9': "finding nemo|nemo", // 海底總動員
    'w-movie-10': "monsters inc|monsters, inc.", // 怪獸電力公司
    'w-movie-11': "up|pixar up|up movie", // 天外奇蹟
    'w-movie-12': "inside out", // 腦筋急轉彎
    'w-movie-13': "wreck-it ralph|wreck it ralph", // 無敵破壞王
    'w-movie-14': "zootopia|zootropolis", // 動物方城市
    'w-movie-15': "cars", // 汽車總動員
    'w-movie-16': "the incredibles|incredibles", // 超人特攻隊
    'w-movie-17': "wall-e|wall e|walle", // 瓦力
    'w-movie-18': "mulan", // 花木蘭
    'w-movie-19': "aladdin", // 阿拉丁
    'w-movie-20': "beauty and the beast", // 美女與野獸
    'w-movie-21': "the little mermaid|little mermaid", // 小美人魚
    'w-movie-22': "snow white", // 白雪公主
    'w-movie-23': "sleeping beauty", // 睡美人
    'w-movie-24': "cinderella", // 灰姑娘
    'w-movie-25': "peter pan", // 彼得潘
    'w-movie-26': "pinocchio", // 木偶奇遇記
    'w-movie-27': "my neighbor totoro|totoro", // 龍貓
    'w-movie-28': "spirited away", // 神隱少女
    'w-movie-29': "castle in the sky|laputa", // 天空之城
    'w-movie-30': "kiki's delivery service|kikis delivery service|kiki", // 魔女宅急便
    'w-movie-31': "spider-man|spiderman|spider man", // 蜘蛛人
    'w-movie-32': "batman", // 蝙蝠俠
    'w-movie-33': "iron man|ironman", // 鋼鐵人
    'w-movie-34': "captain america", // 美國隊長
    'w-movie-35': "thor", // 雷神索爾
    'w-movie-36': "the avengers|avengers", // 復仇者聯盟
    'w-movie-37': "black panther", // 黑豹
    'w-movie-38': "wonder woman", // 神力女超人
    'w-movie-39': "transformers", // 變形金剛
    'w-movie-40': "fast and furious|the fast and the furious|fast & furious", // 玩命關頭
    'w-movie-41': "top gun", // 捍衛戰士
    'w-movie-42': "back to the future", // 回到未來
    'w-movie-43': "the godfather|godfather", // 教父
    'w-movie-44': "jaws", // 大白鯊
    'w-movie-45': "the matrix|matrix", // 駭客任務
    'w-movie-46': "inception", // 全面啟動
    'w-movie-47': "interstellar", // 星際效應
    'w-movie-48': "forrest gump|forest gump", // 阿甘正傳
    'w-movie-49': "kung fu panda", // 功夫熊貓
    'w-movie-50': "how to train your dragon", // 馴龍高手
    'w-movie-51': "alien|aliens", // 異形
    'w-movie-52': "the terminator|terminator", // 魔鬼終結者
    'w-movie-53': "soul", // 靈魂急轉彎
    'w-movie-54': "coco", // 可可夜總會
    'w-movie-55': "brave|merida|disney brave", // 勇敢傳說
    'w-movie-56': "moana", // 海洋奇緣
    'w-movie-57': "tangled", // 魔髮奇緣
    'w-movie-58': "tarzan", // 泰山
    'w-movie-59': "dumbo", // 小飛象
    'w-movie-60': "bambi", // 小鹿斑比
    'w-movie-61': "detective conan|case closed|conan", // 名偵探柯南
    'w-movie-62': "naruto", // 火影忍者
    'w-movie-63': "dragon ball|dragon ball z", // 七龍珠
    'w-movie-64': "demon slayer", // 鬼滅之刃
    'w-movie-65': "slam dunk", // 灌籃高手
    'w-movie-66': "chibi maruko-chan|chibi maruko chan|maruko", // 櫻桃小丸子
    'w-movie-67': "crayon shin-chan|crayon shin chan|shin-chan", // 蠟筆小新
    'w-movie-68': "sailor moon", // 美少女戰士
    'w-movie-69': "saint seiya|knights of the zodiac", // 聖鬥士星矢
    'w-movie-70': "one piece", // 航海王
    'w-movie-71': "pokemon|pokémon", // 寶可夢
    'w-movie-72': "pikachu", // 皮卡丘
    'w-movie-73': "cape no 7|cape no. 7|cape number 7", // 海角七號
    'w-movie-74': "seediq bale", // 賽德克巴萊
    'w-movie-75': "monga", // 艋舺
    'w-movie-76': "shaolin soccer", // 少林足球
    'w-movie-77': "infernal affairs", // 無間道
    'w-trend-0': "artificial intelligence|ai", // 人工智慧
    'w-trend-1': "chatbot|chat bot", // 聊天機器人
    'w-trend-2': "self-driving car|self driving|autonomous driving|autopilot", // 自動駕駛
    'w-trend-3': "space travel|space tourism", // 太空旅行
    'w-trend-4': "virtual reality|vr", // 虛擬實境
    'w-trend-5': "metaverse", // 元宇宙
    'w-trend-6': "cryptocurrency|bitcoin|crypto", // 加密貨幣
    'w-trend-7': "mobile payment|mobile pay|tap to pay", // 行動支付
    'w-trend-8': "food delivery rider|delivery rider|food delivery", // 外送員
    'w-trend-9': "online shopping|e-commerce|shopping online", // 網購
    'w-trend-10': "live stream|livestream|live streaming", // 直播
    'w-trend-11': "short video|short videos|tiktok", // 短影音
    'w-trend-12': "social media", // 社群媒體
    'w-trend-13': "influencer|internet celebrity", // 網紅
    'w-trend-14': "remote work|work from home|working from home|telecommuting", // 遠距上班
    'w-trend-15': "video call|video conference|video meeting|zoom meeting", // 視訊會議
    'w-trend-16': "online course|online class|e-learning", // 線上課程
    'w-trend-17': "smartwatch|smart watch", // 智慧手錶
    'w-trend-18': "drone", // 無人機
    'w-trend-19': "smart speaker", // 智慧音箱
    'w-trend-20': "e-book|ebook|e-reader", // 電子書
    'w-trend-21': "solar panel|solar panels", // 太陽能板
    'w-trend-22': "wind power|wind turbine|wind energy", // 風力發電
    'w-trend-23': "recycling|recycle", // 資源回收
    'w-trend-24': "reusable cup|eco cup|reusable mug", // 環保杯
    'w-trend-25': "rapid test|covid test|rapid antigen test|test kit", // 快篩
    'w-trend-26': "vaccine|vaccination", // 疫苗
    'w-trend-27': "bike sharing|bike share|shared bike|youbike", // 共享單車
    'w-trend-28': "world cup", // 世界盃
    'w-trend-29': "olympics|olympic games|the olympics", // 奧運
    'w-trend-30': "live concert|pop concert|live show", // 演唱會
    'w-trend-31': "power bank|portable charger", // 行動電源
    'w-trend-32': "selfie stick", // 自拍棒
    'w-trend-33': "esports|e-sports|gaming tournament", // 電競
    'w-trend-34': "electric scooter|e-scooter|electric motorcycle", // 電動機車
    'w-trend-35': "charging station|ev charger|charging point", // 充電樁
    'w-trend-36': "voice assistant|virtual assistant|siri", // 語音助理
    'w-trend-37': "smart home|smart appliance|smart appliances", // 智慧家電
    'w-trend-38': "wearable|wearables|wearable device", // 穿戴裝置
    'w-trend-39': "foldable phone|folding phone|flip phone", // 折疊手機
    'w-trend-40': "virtual idol|virtual singer|vtuber", // 虛擬偶像
    'w-trend-41': "online scam|internet scam|phishing", // 網路詐騙
    'w-trend-42': "mobile game|mobile games|phone game", // 手遊
    'w-trend-43': "video streaming|streaming|netflix", // 串流影音
    'w-trend-44': "e-invoice|electronic receipt|digital receipt", // 電子發票
    'w-history-0': "great wall of china|great wall", // 萬里長城
    'w-history-1': "terracotta army|terracotta warriors", // 兵馬俑
    'w-history-2': "pyramid|pyramids|great pyramid", // 金字塔
    'w-history-3': "sphinx|great sphinx", // 人面獅身
    'w-history-4': "colosseum|coliseum", // 羅馬競技場
    'w-history-5': "leaning tower of pisa|tower of pisa|leaning tower", // 比薩斜塔
    'w-history-6': "stonehenge", // 巨石陣
    'w-history-7': "easter island|moai", // 復活節島
    'w-history-8': "machu picchu", // 馬丘比丘
    'w-history-9': "angkor wat", // 吳哥窟
    'w-history-10': "taj mahal", // 泰姬瑪哈陵
    'w-history-11': "forbidden city", // 紫禁城
    'w-history-12': "dunhuang|mogao caves", // 敦煌
    'w-history-13': "silk road", // 絲路
    'w-history-14': "grand canal", // 大運河
    'w-history-15': "gunpowder", // 火藥
    'w-history-16': "papermaking|paper making|invention of paper", // 造紙術
    'w-history-17': "movable type|movable type printing|printing press", // 活字印刷
    'w-history-18': "steam engine", // 蒸汽機
    'w-history-19': "columbus|christopher columbus", // 哥倫布
    'w-history-20': "magellan|ferdinand magellan", // 麥哲倫
    'w-history-21': "marco polo", // 馬可波羅
    'w-history-22': "confucius", // 孔子
    'w-history-23': "laozi|lao tzu|lao tse", // 老子
    'w-history-24': "the art of war|art of war", // 孫子兵法
    'w-history-25': "qin shi huang|first emperor of qin|qin shihuang", // 秦始皇
    'w-history-26': "wu zetian|empress wu", // 武則天
    'w-history-27': "zhuge liang", // 諸葛亮
    'w-history-28': "guan yu", // 關羽
    'w-history-29': "zhang fei", // 張飛
    'w-history-30': "cao cao", // 曹操
    'w-history-31': "liu bei", // 劉備
    'w-history-32': "yue fei", // 岳飛
    'w-history-33': "koxinga|zheng chenggong", // 鄭成功
    'w-history-34': "li bai|li po", // 李白
    'w-history-35': "du fu", // 杜甫
    'w-history-36': "su dongpo|su shi", // 蘇東坡
    'w-history-37': "wang xizhi", // 王羲之
    'w-history-38': "picasso|pablo picasso", // 畢卡索
    'w-history-39': "van gogh|vincent van gogh", // 梵谷
    'w-history-40': "leonardo da vinci|da vinci", // 達文西
    'w-history-41': "mozart", // 莫札特
    'w-history-42': "beethoven", // 貝多芬
    'w-history-43': "einstein|albert einstein", // 愛因斯坦
    'w-history-44': "isaac newton|newton", // 牛頓
    'w-history-45': "thomas edison|edison", // 愛迪生
    'w-history-46': "marie curie|madame curie", // 居禮夫人
    'w-history-47': "florence nightingale|nightingale", // 南丁格爾
    'w-history-48': "wright brothers|the wright brothers", // 萊特兄弟
    'w-history-49': "galileo|galileo galilei", // 伽利略
    'w-history-50': "napoleon|napoleon bonaparte", // 拿破崙
    'w-history-51': "genghis khan", // 成吉思汗
    'w-history-52': "oracle bones|oracle bone script", // 甲骨文
    'w-history-53': "french revolution", // 法國大革命
    'w-history-54': "berlin wall", // 柏林圍牆
    'w-history-55': "rosetta stone", // 羅塞塔石碑
    'w-history-56': "trojan horse", // 木馬屠城
    'w-history-57': "pompeii", // 龐貝城
    'w-history-58': "opium war|opium wars", // 鴉片戰爭
    'w-history-59': "xinhai revolution|1911 revolution", // 辛亥革命
    'w-history-60': "zheng he", // 鄭和
    'w-history-61': "zhang qian", // 張騫
    'w-history-62': "sima qian", // 司馬遷
    'w-history-63': "sun yat-sen|sun yat sen", // 孫中山
    'w-history-64': "george washington|washington", // 華盛頓
    'w-history-65': "abraham lincoln|lincoln", // 林肯
    'w-history-66': "winston churchill|churchill", // 邱吉爾
    'w-history-67': "shakespeare|william shakespeare", // 莎士比亞
    'w-history-68': "plato", // 柏拉圖
    'w-history-69': "mencius", // 孟子
    'w-history-70': "zhuangzi|chuang tzu", // 莊子
    'w-history-71': "judge bao|bao zheng|justice bao", // 包青天
    'w-geography-0': "taiwan", // 台灣
    'w-geography-1': "japan", // 日本
    'w-geography-2': "south korea|korea", // 韓國
    'w-geography-3': "thailand", // 泰國
    'w-geography-4': "vietnam", // 越南
    'w-geography-5': "singapore", // 新加坡
    'w-geography-6': "india", // 印度
    'w-geography-7': "egypt", // 埃及
    'w-geography-8': "france", // 法國
    'w-geography-9': "united kingdom|uk|britain|england|great britain", // 英國
    'w-geography-10': "germany", // 德國
    'w-geography-11': "italy", // 義大利
    'w-geography-12': "spain", // 西班牙
    'w-geography-13': "netherlands|holland", // 荷蘭
    'w-geography-14': "switzerland", // 瑞士
    'w-geography-15': "greece", // 希臘
    'w-geography-16': "russia", // 俄羅斯
    'w-geography-17': "united states|usa|us|america|united states of america", // 美國
    'w-geography-18': "canada", // 加拿大
    'w-geography-19': "mexico", // 墨西哥
    'w-geography-20': "brazil", // 巴西
    'w-geography-21': "argentina", // 阿根廷
    'w-geography-22': "australia", // 澳洲
    'w-geography-23': "new zealand", // 紐西蘭
    'w-geography-24': "kenya", // 肯亞
    'w-geography-25': "south africa", // 南非
    'w-geography-26': "iceland", // 冰島
    'w-geography-27': "finland", // 芬蘭
    'w-geography-28': "turkiye|turkey|türkiye", // 土耳其
    'w-geography-29': "mongolia", // 蒙古
    'w-geography-30': "mount fuji|mt fuji|fuji", // 富士山
    'w-geography-31': "himalayas|the himalayas|himalaya", // 喜馬拉雅山
    'w-geography-32': "mount everest|everest", // 聖母峰
    'w-geography-33': "sahara desert|sahara", // 撒哈拉沙漠
    'w-geography-34': "amazon river|amazon", // 亞馬遜河
    'w-geography-35': "nile river|nile|the nile", // 尼羅河
    'w-geography-36': "yangtze river|yangtze", // 長江
    'w-geography-37': "yellow river", // 黃河
    'w-geography-38': "mississippi river|mississippi", // 密西西比河
    'w-geography-39': "grand canyon", // 大峽谷
    'w-geography-40': "niagara falls|niagara", // 尼加拉瀑布
    'w-geography-41': "dead sea", // 死海
    'w-geography-42': "lake baikal|baikal", // 貝加爾湖
    'w-geography-43': "equator", // 赤道
    'w-geography-44': "north pole|arctic", // 北極
    'w-geography-45': "south pole|antarctica", // 南極
    'w-geography-46': "rainforest|rain forest|tropical rainforest", // 熱帶雨林
    'w-geography-47': "great barrier reef", // 大堡礁
    'w-geography-48': "mediterranean sea|mediterranean", // 地中海
    'w-geography-49': "china", // 中國
    'w-geography-50': "philippines|the philippines", // 菲律賓
    'w-geography-51': "malaysia", // 馬來西亞
    'w-geography-52': "indonesia", // 印尼
    'w-geography-53': "myanmar|burma", // 緬甸
    'w-geography-54': "nepal", // 尼泊爾
    'w-geography-55': "israel", // 以色列
    'w-geography-56': "sweden", // 瑞典
    'w-geography-57': "norway", // 挪威
    'w-geography-58': "denmark", // 丹麥
    'w-geography-59': "poland", // 波蘭
    'w-geography-60': "czech republic|czechia|czech", // 捷克
    'w-geography-61': "austria", // 奧地利
    'w-geography-62': "portugal", // 葡萄牙
    'w-geography-63': "ireland", // 愛爾蘭
    'w-geography-64': "chile", // 智利
    'w-geography-65': "peru", // 秘魯
    'w-geography-66': "cuba", // 古巴
    'w-geography-67': "morocco", // 摩洛哥
    'w-geography-68': "ethiopia", // 衣索比亞
    'w-geography-69': "dubai", // 杜拜
    'w-geography-70': "hong kong|hongkong", // 香港
    'w-geography-71': "macau|macao", // 澳門
    'w-geography-72': "eiffel tower|the eiffel tower", // 艾菲爾鐵塔
    'w-geography-73': "statue of liberty|lady liberty", // 自由女神
    'w-geography-74': "big ben", // 大笨鐘
    'w-geography-75': "sydney opera house|opera house", // 雪梨歌劇院
    'w-geography-76': "white house|the white house", // 白宮
    'w-geography-77': "sagrada familia|sagrada família", // 聖家堂
    'w-civics-0': "voting|vote|cast a vote", // 投票
    'w-civics-1': "election|elections", // 選舉
    'w-civics-2': "constitution", // 憲法
    'w-civics-3': "law|laws", // 法律
    'w-civics-4': "national flag|flag", // 國旗
    'w-civics-5': "parliament|congress|legislature", // 國會
    'w-civics-6': "court|courthouse|court of law", // 法院
    'w-civics-7': "verdict|judgment|ruling", // 判決
    'w-civics-8': "paying taxes|pay taxes|taxes|tax", // 納稅
    'w-civics-9': "id card|identity card|id", // 身分證
    'w-civics-10': "passport", // 護照
    'w-civics-11': "household registration|household register|family register", // 戶口名簿
    'w-civics-12': "referendum", // 公投
    'w-civics-13': "mayor", // 市長
    'w-civics-14': "village chief|neighborhood chief|ward chief|village head", // 里長
    'w-civics-15': "district office|town hall|township office", // 公所
    'w-civics-16': "military service|conscription|draft", // 兵役
    'w-civics-17': "health insurance card|national health card|health card", // 健保卡
    'w-civics-18': "driver's license|drivers license|driving license|driver license", // 駕照
    'w-civics-19': "waste sorting|garbage sorting|trash sorting|sorting trash", // 垃圾分類
    'w-civics-20': "traffic sign|traffic signal|road sign", // 交通號誌
    'w-civics-21': "crosswalk|zebra crossing|pedestrian crossing", // 斑馬線
    'w-civics-22': "traffic light|traffic lights|stoplight", // 紅綠燈
    'w-civics-23': "fire drill", // 消防演習
    'w-civics-24': "earthquake drill", // 地震演習
    'w-civics-25': "jury|jurors", // 陪審團
    'w-civics-26': "volunteer|volunteers", // 志工
    'w-civics-27': "seat belt|seatbelt", // 安全帶
    'w-civics-28': "drunk driving|drink driving|dui", // 酒駕
    'w-civics-29': "accessibility|wheelchair access|barrier-free", // 無障礙
    'w-civics-30': "compulsory education|mandatory education", // 義務教育
    'w-civics-31': "ticket|traffic ticket|fine|parking ticket", // 罰單
    'w-physics-0': "gravity", // 重力
    'w-physics-1': "friction", // 摩擦力
    'w-physics-2': "buoyancy|floating force", // 浮力
    'w-physics-3': "reflection", // 反射
    'w-physics-4': "refraction", // 折射
    'w-physics-5': "evaporation", // 蒸發
    'w-physics-6': "condensation", // 凝結
    'w-physics-7': "lever", // 槓桿
    'w-physics-8': "pulley", // 滑輪
    'w-physics-9': "spring|coil spring", // 彈簧
    'w-physics-10': "static electricity|static", // 靜電
    'w-physics-11': "electric current|current|electricity", // 電流
    'w-physics-12': "magnet", // 磁鐵
    'w-physics-13': "prism", // 稜鏡
    'w-physics-14': "echo", // 回聲
    'w-physics-15': "boiling|boil", // 沸騰
    'w-physics-16': "shadow", // 影子
    'w-physics-17': "thermal expansion|expansion and contraction|heat expansion", // 熱脹冷縮
    'w-physics-18': "surface tension", // 表面張力
    'w-physics-19': "capillary action|capillary effect|capillarity", // 毛細現象
    'w-physics-20': "free fall|freefall|falling object", // 自由落體
    'w-physics-21': "parabola|projectile motion|parabolic arc", // 拋物線
    'w-physics-22': "gear|cogwheel|gears", // 齒輪
    'w-physics-23': "ramp|slope|inclined plane|incline", // 斜坡
    'w-physics-24': "balance scale|balance|scales", // 天平
    'w-physics-25': "pendulum", // 擺錘
    'w-physics-26': "water pressure", // 水壓
    'w-physics-27': "air pressure|atmospheric pressure|barometric pressure", // 氣壓
    'w-physics-28': "centrifugal force", // 離心力
    'w-physics-29': "siphon|syphon", // 虹吸
    'w-physics-30': "ultraviolet|uv|uv rays|ultraviolet rays", // 紫外線
    'w-physics-31': "laser", // 雷射
    'w-physics-32': "convex lens", // 凸透鏡
    'w-physics-33': "concave lens", // 凹透鏡
    'w-physics-34': "magnifying glass|magnifier", // 放大鏡
    'w-physics-35': "sound wave|sound waves", // 聲波
    'w-physics-36': "ultrasound|ultrasonic|ultrasonic wave", // 超音波
    'w-physics-37': "electromagnet", // 電磁鐵
    'w-physics-38': "crystal|crystallization|crystals", // 結晶
    'w-astro-0': "solar system", // 太陽系
    'w-astro-1': "milky way|the milky way", // 銀河系
    'w-astro-2': "black hole", // 黑洞
    'w-astro-3': "supernova", // 超新星
    'w-astro-4': "constellation|zodiac", // 星座
    'w-astro-5': "big dipper|the big dipper|plough", // 北斗七星
    'w-astro-6': "orion|orion constellation", // 獵戶座
    'w-astro-7': "north star|polaris|pole star", // 北極星
    'w-astro-8': "mars", // 火星
    'w-astro-9': "venus", // 金星
    'w-astro-10': "jupiter", // 木星
    'w-astro-11': "mercury", // 水星
    'w-astro-12': "saturn", // 土星
    'w-astro-13': "uranus", // 天王星
    'w-astro-14': "neptune", // 海王星
    'w-astro-15': "pluto", // 冥王星
    'w-astro-16': "moon phases|phases of the moon|lunar phases|moon phase", // 月相
    'w-astro-17': "crater|impact crater|meteor crater", // 隕石坑
    'w-astro-18': "space station|iss", // 太空站
    'w-astro-19': "spacesuit|space suit", // 太空衣
    'w-astro-20': "moon landing|landing on the moon", // 登月
    'w-astro-21': "satellite|artificial satellite", // 人造衛星
    'w-astro-22': "halley's comet|halleys comet", // 哈雷彗星
    'w-astro-23': "observatory", // 天文台
    'w-astro-24': "space telescope|hubble|hubble telescope", // 太空望遠鏡
    'w-astro-25': "asteroid", // 小行星
    'w-astro-26': "lunar rover|moon rover|moon buggy", // 月球車
    'w-astro-27': "rocket launch|rocket liftoff|launch|liftoff", // 火箭發射
    'w-astro-28': "zero gravity|weightlessness|microgravity|zero-g", // 無重力
    'w-astro-29': "sirius|dog star", // 天狼星
    'w-astro-30': "vega", // 織女星
    'w-astro-31': "altair", // 牛郎星
    'w-astro-32': "planetarium", // 星象儀
    'w-astro-33': "mars rover|rover", // 火星車
    'w-astro-34': "space junk|space debris|orbital debris", // 太空垃圾
    'w-astro-35': "galaxy", // 星系
    'w-astro-36': "sunspot|sunspots|sun spots", // 太陽黑子
    'w-music-0': "loudspeaker|megaphone|horn", // 喇叭
    'w-music-1': "bell|jingle bell", // 鈴鐺
    'w-music-2': "violin|fiddle", // 小提琴
    'w-music-3': "harmonica|mouth organ", // 口琴
    'w-music-4': "triangle", // 三角鐵
    'w-music-5': "vinyl record|record|vinyl", // 唱片
    'w-music-6': "drumsticks|drumstick", // 鼓棒
    'w-music-7': "maracas|shaker", // 沙鈴
    'w-music-8': "xylophone", // 木琴
    'w-music-9': "musical staff|staff|stave", // 五線譜
    'w-music-10': "conductor's baton", // 指揮棒
    'w-music-11': "sheet music|score", // 樂譜
    'w-music-12': "cello", // 大提琴
    'w-music-13': "flute", // 長笛
    'w-music-14': "accordion", // 手風琴
    'w-music-15': "tambourine", // 鈴鼓
    'w-music-16': "harp", // 豎琴
    'w-music-17': "bass guitar|bass", // 貝斯
    'w-music-18': "castanets", // 響板
    'w-music-19': "hand drum|bongo|bongos", // 手鼓
    'w-music-20': "trumpet", // 小號
    'w-music-21': "glockenspiel|metallophone", // 鐵琴
    'w-music-22': "saxophone|sax", // 薩克斯風
    'w-music-23': "musical rest|rest", // 休止符
    'w-music-24': "treble clef|g clef", // 高音譜號
    'w-music-25': "metronome", // 節拍器
    'w-music-26': "music box", // 音樂盒
    'w-music-27': "clarinet", // 豎笛
    'w-music-28': "choir|chorus", // 合唱團
    'w-music-29': "band|music band", // 樂團
    'w-music-30': "rock music|rock and roll", // 搖滾
    'w-music-31': "rap|hip hop", // 饒舌
    'w-music-32': "jazz", // 爵士
    'w-music-33': "classical music", // 古典樂
    'w-music-34': "lullaby", // 搖籃曲
    'w-music-35': "waltz", // 圓舞曲
    'w-music-36': "national anthem|anthem", // 國歌
    'w-music-37': "pachelbel's canon|canon", // 卡農
    'w-music-38': "nursery rhyme|children's song", // 兒歌
    'w-music-39': "recording studio|studio", // 錄音室
    'w-music-40': "duet", // 二重唱
    'w-music-41': "solo|solo performance", // 獨奏
    'w-music-42': "oboe", // 雙簧管
    'w-music-43': "trombone", // 伸縮號
    'w-music-44': "viola", // 中提琴
    'w-music-45': "double bass|contrabass", // 低音提琴
    'w-music-46': "french horn", // 法國號
    'w-music-47': "symphony orchestra|orchestra", // 交響樂團
    'w-music-48': "concert", // 音樂會
    'w-music-49': "pop song|pop music|pop", // 流行歌
    'w-music-50': "march|marching song", // 進行曲
    'w-music-51': "happy birthday song|happy birthday", // 生日快樂歌
    'w-music-52': "electronic music|edm", // 電子音樂
    'w-music-53': "street performer|busker", // 街頭藝人
    'w-music-54': "percussion", // 打擊樂
    'w-people-0': "dad|father|daddy", // 爸爸
    'w-people-1': "mom|mother|mum|mommy", // 媽媽
    'w-people-2': "baby|infant", // 嬰兒
    'w-people-3': "grandpa|grandfather", // 爺爺
    'w-people-4': "grandma|grandmother", // 奶奶
    'w-people-5': "older brother|big brother", // 哥哥
    'w-people-6': "older sister|big sister", // 姊姊
    'w-people-7': "younger brother|little brother", // 弟弟
    'w-people-8': "younger sister|little sister", // 妹妹
    'w-people-9': "maternal grandfather|mother's father", // 外公
    'w-people-10': "maternal grandmother|mother's mother", // 外婆
    'w-people-11': "old man|elderly person|senior|old person", // 老人
    'w-people-12': "bride", // 新娘
    'w-people-13': "groom|bridegroom", // 新郎
    'w-people-14': "twins|twin", // 雙胞胎
    'w-people-15': "student|pupil", // 學生
    'w-people-16': "birthday boy|birthday girl|birthday person", // 壽星
    'w-people-17': "audience|spectator|viewer", // 觀眾
    'w-people-18': "fan|fans", // 粉絲
    'w-people-19': "uncle", // 叔叔
    'w-people-20': "aunt|auntie", // 阿姨
    'w-people-21': "maternal uncle|mother's brother", // 舅舅
    'w-people-22': "cousin|older cousin", // 表哥
    'w-people-23': "classmate", // 同學
    'w-people-24': "neighbor|neighbour", // 鄰居
    'w-people-25': "friend", // 朋友
    'w-people-26': "guest|visitor", // 客人
    'w-people-27': "captain|team leader", // 隊長
    'w-people-28': "roommate|flatmate", // 室友
    'w-people-29': "tour guide|guide", // 導遊
    'w-people-30': "passerby|passer-by|bystander", // 路人
    'w-people-31': "idol", // 偶像
    'w-people-32': "teenager|teen|adolescent", // 青少年
    'w-people-33': "class leader|class monitor|class president", // 班長
    'w-people-34': "landlord|landlady", // 房東
    'w-people-35': "customer|client", // 顧客
    'w-people-36': "partner|buddy|companion", // 夥伴
    'w-people-37': "opponent|rival", // 對手
    'w-people-38': "boss", // 老闆
    'w-people-39': "elementary school student|primary school student|schoolchild", // 小學生
    'w-people-40': "college student|university student", // 大學生
    'w-people-41': "graduate", // 畢業生
    'w-people-42': "contest judge|jury|judging panel", // 評審
    'w-people-43': "babysitter|nanny", // 保母
    'w-body-0': "nose", // 鼻子
    'w-body-1': "mouth", // 嘴巴
    'w-body-2': "ear|ears", // 耳朵
    'w-body-3': "tooth|teeth", // 牙齒
    'w-body-4': "foot|feet", // 腳
    'w-body-5': "hair", // 頭髮
    'w-body-6': "finger|fingers", // 手指
    'w-body-7': "footprint|footprints", // 腳印
    'w-body-8': "eyebrow|eyebrows", // 眉毛
    'w-body-9': "tongue", // 舌頭
    'w-body-10': "neck", // 脖子
    'w-body-11': "belly|tummy", // 肚子
    'w-body-12': "belly button|navel", // 肚臍
    'w-body-13': "bottom|butt", // 屁股
    'w-body-14': "knee|knees", // 膝蓋
    'w-body-15': "arm|arms", // 手臂
    'w-body-16': "fingernail|nail|nails", // 指甲
    'w-body-17': "bone|bones", // 骨頭
    'w-body-18': "heart", // 心臟
    'w-body-19': "brain", // 大腦
    'w-body-20': "muscle|muscles", // 肌肉
    'w-body-21': "beard|mustache|moustache", // 鬍子
    'w-body-22': "eyelash|eyelashes", // 睫毛
    'w-body-23': "fist", // 拳頭
    'w-body-24': "lips|lip", // 嘴唇
    'w-body-25': "dimple|dimples", // 酒窩
    'w-body-26': "shoulder|shoulders", // 肩膀
    'w-body-27': "elbow", // 手肘
    'w-body-28': "ankle", // 腳踝
    'w-body-29': "chin|jaw", // 下巴
    'w-body-30': "forehead", // 額頭
    'w-body-31': "lung|lungs", // 肺
    'w-body-32': "stomach", // 胃
    'w-body-33': "intestine|intestines|gut|bowel", // 腸子
    'w-body-34': "beauty mark|mole", // 痣
    'w-body-35': "freckle|freckles", // 雀斑
    'w-clothes-0': "skirt", // 裙子
    'w-clothes-1': "pants|trousers", // 褲子
    'w-clothes-2': "socks|sock", // 襪子
    'w-clothes-3': "gloves|glove", // 手套
    'w-clothes-4': "scarf", // 圍巾
    'w-clothes-5': "necktie|tie", // 領帶
    'w-clothes-6': "watch|wristwatch", // 手錶
    'w-clothes-7': "ring", // 戒指
    'w-clothes-8': "raincoat", // 雨衣
    'w-clothes-9': "slippers|flip-flops", // 拖鞋
    'w-clothes-10': "jacket|coat", // 外套
    'w-clothes-11': "shorts", // 短褲
    'w-clothes-12': "dress", // 洋裝
    'w-clothes-13': "sweater|jumper", // 毛衣
    'w-clothes-14': "vest|tank top", // 背心
    'w-clothes-15': "pajamas|pyjamas", // 睡衣
    'w-clothes-16': "swimsuit|swimming suit|bathing suit", // 泳衣
    'w-clothes-17': "underwear|underpants", // 內褲
    'w-clothes-18': "face mask|mask", // 口罩
    'w-clothes-19': "necklace", // 項鍊
    'w-clothes-20': "earrings|earring", // 耳環
    'w-clothes-21': "rain boots|rubber boots|wellies", // 雨鞋
    'w-clothes-22': "high heels|high heel|heels", // 高跟鞋
    'w-clothes-23': "boots|boot", // 靴子
    'w-clothes-24': "belt", // 皮帶
    'w-clothes-25': "bow|ribbon", // 蝴蝶結
    'w-clothes-26': "hairpin|hair clip|barrette", // 髮夾
    'w-clothes-27': "backpack|schoolbag|rucksack", // 背包
    'w-clothes-28': "wallet|purse", // 錢包
    'w-clothes-29': "handbag|bag|tote bag", // 手提包
    'w-clothes-30': "helmet|safety helmet|hard hat", // 安全帽
    'w-clothes-31': "straw hat", // 草帽
    'w-clothes-32': "apron", // 圍裙
    'w-clothes-33': "uniform", // 制服
    'w-clothes-34': "suit|business suit", // 西裝
    'w-clothes-35': "cheongsam|qipao", // 旗袍
    'w-clothes-36': "kimono", // 和服
    'w-clothes-37': "wedding dress|wedding gown", // 婚紗
    'w-clothes-38': "tuxedo|tailcoat", // 燕尾服
    'w-clothes-39': "jeans|blue jeans", // 牛仔褲
    'w-clothes-40': "hoodie|hooded sweatshirt", // 連帽衫
    'w-clothes-41': "down jacket|puffer jacket|puffy jacket", // 羽絨外套
    'w-clothes-42': "headband|hairband", // 髮箍
    'w-clothes-43': "bracelet|wristband", // 手環
    'w-clothes-44': "earmuffs", // 耳罩
    'w-clothes-45': "bamboo hat|conical hat|rice hat", // 斗笠
    'w-taiwan-0': "taipei 101|101", // 台北101
    'w-taiwan-1': "jade mountain|yushan|mount yu|mt. yu", // 玉山
    'w-taiwan-2': "alishan|mount ali|ali mountain", // 阿里山
    'w-taiwan-3': "sun moon lake", // 日月潭
    'w-taiwan-4': "sunlight and moonlight|sun moon light", // 日月光
    'w-taiwan-5': "betel nut|areca nut", // 檳榔
    'w-taiwan-6': "taroko|taroko gorge", // 太魯閣
    'w-taiwan-7': "kenting", // 墾丁
    'w-taiwan-8': "penghu|pescadores", // 澎湖
    'w-taiwan-9': "orchid island|lanyu", // 蘭嶼
    'w-taiwan-10': "mazu pilgrimage|mazu procession|matsu pilgrimage", // 媽祖遶境
    'w-taiwan-11': "yanshui beehive fireworks|yanshui fireworks|beehive fireworks", // 鹽水蜂炮
    'w-festival-0': "red envelope|lucky money|hongbao", // 紅包
    'w-festival-1': "gift|present", // 禮物
    'w-festival-2': "santa claus|santa", // 聖誕老人
    'w-festival-3': "fireworks|firework", // 煙火
    'w-festival-4': "firecracker|firecrackers", // 鞭炮
    'w-festival-5': "jack-o'-lantern|jack o lantern|pumpkin lantern", // 南瓜燈
    'w-festival-6': "sky lantern|flying lantern", // 天燈
    'w-festival-7': "spring couplets|couplets|new year couplets", // 春聯
    'w-festival-8': "dragon dance", // 舞龍
    'w-festival-9': "lion dance", // 舞獅
    'w-festival-10': "lantern festival", // 元宵節
    'w-festival-11': "mid-autumn festival|moon festival", // 中秋節
    'w-festival-12': "dragon boat festival", // 端午節
    'w-festival-13': "dragon boat", // 龍舟
    'w-festival-14': "chinese new year|lunar new year|spring festival", // 春節
    'w-festival-15': "christmas|xmas", // 聖誕節
    'w-festival-16': "halloween", // 萬聖節
    'w-festival-17': "easter", // 復活節
    'w-festival-18': "easter egg|painted egg|colored egg", // 彩蛋
    'w-festival-19': "valentine's day|valentines day|valentine", // 情人節
    'w-festival-20': "mother's day|mothers day", // 母親節
    'w-festival-21': "father's day|fathers day", // 父親節
    'w-festival-22': "children's day|childrens day", // 兒童節
    'w-festival-23': "birthday", // 生日
    'w-festival-24': "christmas stocking|stocking", // 聖誕襪
    'w-festival-25': "new year's eve dinner|reunion dinner", // 年夜飯
    'w-festival-26': "moon gazing|moon watching", // 賞月
    'w-festival-27': "lantern riddles|riddle game|lantern riddle", // 猜燈謎
    'w-festival-28': "teachers' day|teachers day|teacher's day", // 教師節
    'w-festival-29': "tomb sweeping day|qingming festival|qingming", // 清明節
    'w-festival-30': "new year's eve|chinese new year's eve", // 除夕
    'w-festival-31': "qixi festival|qixi|chinese valentine's day", // 七夕
    'w-festival-32': "double ninth festival|chongyang festival", // 重陽節
    'w-festival-33': "thanksgiving", // 感恩節
    'w-festival-34': "ghost festival|hungry ghost festival", // 中元節
    'w-festival-35': "new year countdown|countdown", // 跨年
  };
}));
