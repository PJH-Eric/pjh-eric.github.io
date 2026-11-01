/* Offline semantic scenes composed from the game's topic-specific outline recipes. */
(function (root, factory) {
  'use strict';
  var api = factory(
    typeof module === 'object' && module.exports ? require('./words.js') : root.Words,
    typeof module === 'object' && module.exports ? require('./reference.js') : root.DrawingReference,
    typeof module === 'object' && module.exports ? require('./reference-recipes.js') : root.ReferenceRecipes
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MeaningReference = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (Words, DrawingReference, Recipes) {
  'use strict';

  /* Each scene combines visible objects so an artist can infer the phrase. */
  var scenes = {
    'w-idiom-0': ['farmer', 'stump', 'rabbit'],
    'w-idiom-1': ['snake with legs'],
    'w-idiom-10': ['old man', 'horse', 'fence'],
    'w-idiom-11': ['blind person', 'elephant'],
    'w-idiom-12': ['old man', 'mountain', 'wheelbarrow'],
    'w-idiom-13': ['hand', 'seedling', 'soil'],
    'w-idiom-14': ['lord', 'dragon'],
    'w-idiom-15': ['visitor', 'cottage', 'footprints'],
    'w-idiom-16': ['tiger', 'dragon', 'cloud'],
    'w-idiom-17': ['dragon', 'eye', 'brush'],
    'w-idiom-18': ['arrow', 'two birds'],
    'w-idiom-19': ['archer', 'target', 'arrow'],
    'w-idiom-2': ['frog', 'well', 'sky'],
    'w-idiom-20': ['horse', 'flag'],
    'w-idiom-21': ['student', 'exam paper', 'mountain'],
    'w-idiom-22': ['burning boat', 'person'],
    'w-idiom-23': ['person', 'firewood', 'bitter cup'],
    'w-idiom-24': ['jade', 'box', 'road'],
    'w-idiom-25': ['person', 'thorns', 'hands together'],
    'w-idiom-26': ['paper map', 'soldier', 'sword'],
    'w-idiom-27': ['person', 'four music notes'],
    'w-idiom-28': ['deer', 'horse', 'person pointing'],
    'w-idiom-29': ['thirsty person', 'plum'],
    'w-idiom-3': ['sheep', 'fence', 'hammer'],
    'w-idiom-30': ['grass', 'soldier', 'shield'],
    'w-idiom-31': ['person', 'bamboo', 'heart'],
    'w-idiom-32': ['snowflake', 'charcoal', 'hands'],
    'w-idiom-33': ['cake', 'flower'],
    'w-idiom-34': ['fire', 'oil bottle'],
    'w-idiom-35': ['fish', 'water', 'person'],
    'w-idiom-36': ['two birds', 'stone'],
    'w-idiom-37': ['nine cows', 'single hair'],
    'w-idiom-38': ['chicken', 'dog', 'footprints'],
    'w-idiom-39': ['dragon', 'phoenix', 'music notes'],
    'w-idiom-4': ['fox', 'tiger', 'person'],
    'w-idiom-40': ['bird', 'flower', 'sun'],
    'w-idiom-41': ['sun', 'wind', 'cloud'],
    'w-idiom-42': ['spring flowers', 'mountain'],
    'w-idiom-43': ['ice', 'snowflake', 'mountain'],
    'w-idiom-44': ['water', 'stone', 'magnifying glass'],
    'w-idiom-45': ['water drop', 'stone'],
    'w-idiom-46': ['horse', 'flower', 'person'],
    'w-idiom-47': ['pie', 'hungry person'],
    'w-idiom-48': ['parent', 'child', 'dragon'],
    'w-idiom-49': ['dog', 'wall'],
    'w-idiom-5': ['person', 'bell', 'hands over ears'],
    'w-idiom-50': ['tiger head', 'snake tail'],
    'w-idiom-51': ['grass', 'snake', 'stick'],
    'w-idiom-52': ['wolf', 'open door', 'house'],
    'w-idiom-53': ['mantis', 'cicada', 'tree'],
    'w-idiom-54': ['old horse', 'path'],
    'w-idiom-55': ['tiger', 'wings'],
    'w-idiom-56': ['wolf', 'bowl', 'food'],
    'w-idiom-57': ['person', 'up arrow', 'down arrow'],
    'w-idiom-58': ['palette', 'six colors'],
    'w-idiom-59': ['seven mouths', 'speech bubbles'],
    'w-idiom-6': ['cow', 'person', 'musical notes'],
    'w-idiom-60': ['busy hands', 'tangled feet'],
    'w-idiom-61': ['wide eyes', 'open mouth'],
    'w-idiom-62': ['red face', 'ears'],
    'w-idiom-63': ['heart', 'flower'],
    'w-idiom-64': ['person', 'moon', 'bowl'],
    'w-idiom-65': ['spear', 'shield'],
    'w-idiom-66': ['axe', 'school gate', 'expert'],
    'w-idiom-67': ['person', 'mirror', 'frown'],
    'w-idiom-68': ['bamboo flute', 'three musicians'],
    'w-idiom-69': ['cart', 'two arrows'],
    'w-idiom-7': ['boat', 'sword', 'water'],
    'w-idiom-70': ['mouth', 'bottle'],
    'w-idiom-71': ['snowflake', 'frost'],
    'w-idiom-72': ['clock', 'arrow'],
    'w-idiom-73': ['sea', 'field', 'mulberry tree'],
    'w-idiom-74': ['mountain', 'peach tree', 'house'],
    'w-idiom-75': ['eye', 'clear window'],
    'w-idiom-76': ['two scales', 'weights'],
    'w-idiom-77': ['ripe melon', 'vine'],
    'w-idiom-78': ['person', 'well', 'sky'],
    'w-idiom-79': ['eyes', 'glue'],
    'w-idiom-8': ['snake', 'cup', 'bow'],
    'w-idiom-80': ['sand', 'tower'],
    'w-idiom-81': ['dazzled eyes', 'stars'],
    'w-idiom-82': ['willow', 'flowers', 'sunlight'],
    'w-idiom-83': ['open door', 'mountain'],
    'w-idiom-84': ['bird', 'cloud', 'sky'],
    'w-idiom-85': ['dragon', 'tiger', 'person'],
    'w-idiom-86': ['sheep', 'black wool', 'flock'],
    'w-idiom-87': ['mountain', 'river', 'flower'],
    'w-idiom-88': ['three hearts', 'two arrows'],
    'w-idiom-89': ['one heart', 'one arrow'],
    'w-idiom-9': ['snipe', 'clam', 'fisherman'],
    'w-idiom-90': ['eyes', 'fast hands'],
    'w-idiom-91': ['wide eyes', 'open door']
  };

  var primitives = {
    person: [['c', 500, 220, 70], ['l', 500, 290, 500, 620], ['l', 500, 390, 340, 500], ['l', 500, 390, 660, 500], ['l', 500, 620, 370, 850], ['l', 500, 620, 630, 850]],
    farmer: [['c', 500, 260, 75], ['l', 380, 200, 620, 200], ['l', 500, 335, 500, 660], ['l', 500, 430, 335, 530], ['l', 500, 430, 665, 530], ['l', 500, 660, 380, 870], ['l', 500, 660, 620, 870]],
    'old man': [['c', 500, 230, 90], ['p', 420, 235, 455, 170, 520, 170, 590, 235], ['l', 500, 320, 480, 650], ['l', 485, 425, 360, 550], ['l', 485, 425, 640, 520], ['l', 480, 650, 370, 860], ['l', 480, 650, 610, 860], ['l', 630, 520, 680, 870]],
    'blind person': [['c', 500, 230, 75], ['l', 410, 220, 590, 220], ['l', 500, 305, 500, 620], ['l', 500, 400, 350, 520], ['l', 500, 400, 650, 520], ['l', 500, 620, 380, 850], ['l', 500, 620, 620, 850], ['l', 340, 205, 660, 245]],
    'thirsty person': [['c', 500, 220, 70], ['l', 500, 290, 500, 610], ['l', 500, 390, 345, 500], ['l', 500, 390, 650, 500], ['l', 500, 610, 390, 850], ['l', 500, 610, 610, 850], ['p', 545, 310, 610, 335, 545, 360]],
    'hungry person': [['c', 500, 220, 75], ['l', 500, 295, 500, 610], ['l', 500, 390, 350, 520], ['l', 500, 390, 640, 500], ['l', 500, 610, 390, 850], ['l', 500, 610, 610, 850], ['p', 455, 242, 490, 265, 520, 242]],
    'open door': [['r', 300, 150, 420, 700], ['p', 300, 150, 600, 230, 600, 850, 300, 850], ['c', 555, 510, 18]],
    'school gate': [['p', 200, 850, 200, 300, 500, 130, 800, 300, 800, 850], ['l', 200, 430, 800, 430], ['l', 350, 430, 350, 850], ['l', 650, 430, 650, 850]],
    stump: [['p', 330, 350, 670, 350, 620, 780, 380, 780, 330, 350], ['l', 380, 780, 300, 870], ['l', 620, 780, 700, 870]],
    well: [['e', 500, 300, 310, 110, 0], ['l', 190, 300, 250, 810], ['l', 810, 300, 750, 810], ['e', 500, 810, 250, 80, 0]],
    wall: [['r', 200, 300, 600, 540], ['l', 200, 480, 800, 480], ['l', 200, 660, 800, 660], ['l', 400, 300, 400, 480], ['l', 600, 480, 600, 660], ['l', 350, 660, 350, 840], ['l', 650, 660, 650, 840]],
    cottage: [['r', 280, 420, 440, 400], ['p', 220, 430, 500, 170, 780, 430], ['r', 440, 590, 120, 230], ['r', 320, 500, 90, 90]],
    arrow: [['l', 200, 800, 800, 200], ['l', 610, 220, 800, 200], ['l', 780, 390, 800, 200]],
    target: [['c', 500, 500, 320], ['c', 500, 500, 210], ['c', 500, 500, 95], ['l', 510, 490, 840, 160]],
    fire: [['p', 300, 850, 250, 650, 360, 520, 390, 680, 500, 420, 590, 620, 620, 470, 760, 650, 700, 850, 300, 850], ['p', 440, 820, 470, 700, 520, 630, 560, 820]],
    'oil bottle': [['p', 420, 230, 420, 130, 580, 130, 580, 230], ['p', 360, 300, 640, 300, 700, 820, 300, 820, 360, 300], ['l', 410, 500, 600, 500]],
    'exam paper': [['r', 280, 170, 440, 660], ['l', 360, 310, 640, 310], ['l', 360, 410, 600, 410], ['l', 360, 510, 630, 510], ['l', 360, 610, 550, 610]],
    'firewood': [['l', 250, 360, 700, 360], ['l', 220, 450, 670, 450], ['l', 300, 550, 750, 550], ['l', 260, 640, 680, 640]],
    'seedling': [['l', 500, 820, 500, 420], ['p', 500, 600, 350, 450, 300, 460, 390, 600, 500, 600], ['p', 500, 530, 650, 380, 700, 400, 610, 540, 500, 530], ['l', 250, 830, 750, 830]],
    'snowflake': [['l', 500, 180, 500, 820], ['l', 220, 340, 780, 660], ['l', 220, 660, 780, 340], ['p', 410, 270, 500, 350, 590, 270], ['p', 410, 730, 500, 650, 590, 730]],
    'oil drop': [['p', 500, 170, 300, 470, 320, 670, 500, 820, 680, 670, 700, 470, 500, 170]],
    'bamboo flute': [['l', 300, 260, 720, 740], ['c', 340, 300, 18], ['c', 435, 405, 18], ['c', 530, 510, 18], ['c', 625, 615, 18]],
    'paper map': [['p', 180, 300, 390, 220, 600, 300, 820, 220, 820, 720, 600, 800, 390, 720, 180, 800, 180, 300], ['l', 390, 220, 390, 720], ['l', 600, 300, 600, 800]],
    'hands together': [['p', 280, 400, 450, 550, 500, 500, 550, 550, 720, 400], ['l', 450, 550, 420, 760], ['l', 550, 550, 580, 760]],
    'hands over ears': [['c', 500, 270, 100], ['p', 400, 280, 300, 190, 270, 340, 390, 400], ['p', 600, 280, 700, 190, 730, 340, 610, 400], ['l', 500, 370, 500, 750]],
    'snake with legs': [['p', 170, 600, 300, 450, 430, 600, 560, 450, 700, 600, 840, 450], ['l', 330, 560, 290, 760], ['l', 440, 560, 480, 760], ['l', 680, 560, 640, 760], ['l', 790, 540, 820, 740]],
    'two birds': [['p', 200, 480, 310, 360, 420, 480, 310, 600, 200, 480], ['p', 580, 480, 690, 360, 800, 480, 690, 600, 580, 480], ['l', 310, 480, 310, 670], ['l', 690, 480, 690, 670]],
    'two music notes': [['c', 330, 720, 70], ['c', 670, 620, 70], ['l', 400, 720, 400, 300], ['l', 740, 620, 740, 200], ['l', 400, 300, 740, 200]],
    'one hair': [['p', 500, 840, 430, 650, 550, 470, 460, 260, 530, 140]],
    'speech bubbles': [['r', 140, 250, 260, 190], ['p', 200, 440, 200, 520, 300, 440], ['r', 440, 350, 300, 190], ['p', 680, 540, 780, 620, 750, 540], ['l', 190, 330, 350, 330], ['l', 500, 430, 680, 430]],
    'tangled feet': [['p', 350, 200, 350, 500, 650, 820], ['p', 650, 200, 650, 500, 350, 820], ['p', 300, 700, 480, 650, 520, 700, 700, 650]],
    'wide eyes': [['e', 350, 450, 130, 180, 0], ['e', 650, 450, 130, 180, 0], ['c', 350, 450, 35], ['c', 650, 450, 35]],
    'open mouth': [['e', 500, 650, 150, 210, 0]],
    'red face': [['c', 500, 500, 320], ['c', 390, 440, 28], ['c', 610, 440, 28], ['p', 400, 650, 500, 600, 600, 650]],
    ears: [['e', 240, 520, 80, 140, 0], ['e', 760, 520, 80, 140, 0]],
    heart: [['p', 500, 780, 250, 570, 250, 390, 380, 320, 500, 430, 620, 320, 750, 390, 750, 570, 500, 780]],
    'bitter cup': [['p', 300, 350, 700, 350, 650, 800, 350, 800, 300, 350], ['l', 700, 440, 820, 440, 840, 650, 680, 650]],
    'hands': [['p', 350, 700, 300, 500, 360, 450, 450, 620, 430, 420, 500, 390, 530, 620, 560, 420, 630, 430, 600, 650, 700, 500, 760, 540, 650, 760, 500, 830, 350, 700]],
    'four music notes': [['c', 220, 720, 48], ['c', 430, 620, 48], ['c', 640, 710, 48], ['c', 810, 560, 48], ['l', 268, 720, 268, 410], ['l', 478, 620, 478, 300], ['l', 688, 710, 688, 370], ['l', 858, 560, 858, 220]],
    'up arrow': [['l', 400, 800, 400, 240], ['l', 240, 400, 400, 240], ['l', 560, 400, 400, 240]],
    'down arrow': [['l', 600, 200, 600, 760], ['l', 440, 600, 600, 760], ['l', 760, 600, 600, 760]],
    'six colors': [['c', 250, 500, 100], ['c', 450, 500, 100], ['c', 650, 500, 100], ['c', 350, 700, 100], ['c', 550, 700, 100], ['c', 750, 700, 100]],
    palette: [['e', 500, 520, 330, 250, 0], ['c', 330, 470, 30], ['c', 470, 370, 30], ['c', 610, 410, 30], ['c', 700, 540, 30], ['p', 270, 680, 430, 760, 600, 730]],
    'black wool': [['c', 500, 520, 230], ['p', 320, 510, 370, 430, 420, 510, 470, 430, 520, 510, 570, 430, 620, 510, 680, 430]],
    'clear window': [['r', 260, 240, 480, 520], ['l', 500, 240, 500, 760], ['l', 260, 500, 740, 500]],
    'ripe melon': [['e', 500, 560, 270, 190, 0], ['p', 480, 370, 500, 280, 570, 260], ['l', 570, 260, 660, 230]],
    'one arrow': [['l', 220, 720, 760, 280], ['l', 600, 290, 760, 280], ['l', 750, 440, 760, 280]],
    'three hearts': [['p', 270, 540, 200, 450, 200, 350, 270, 300, 340, 360, 410, 300, 480, 350, 480, 450, 270, 540], ['p', 700, 540, 630, 450, 630, 350, 700, 300, 770, 360, 840, 300, 910, 350, 910, 450, 700, 540]],
    'fast hands': [['p', 300, 650, 300, 460, 350, 430, 390, 560, 410, 360, 470, 350, 490, 560, 520, 380, 580, 380, 590, 610, 650, 460, 700, 500, 620, 700, 470, 780, 300, 650]],
    fence: [['l', 220, 320, 780, 320], ['l', 220, 500, 780, 500], ['l', 280, 250, 280, 780], ['l', 500, 250, 500, 780], ['l', 720, 250, 720, 780]],
    wheelbarrow: [['l', 180, 430, 760, 430], ['l', 240, 430, 400, 700], ['l', 400, 700, 760, 430], ['c', 300, 760, 70], ['l', 180, 430, 100, 380], ['l', 760, 430, 840, 380]],
    brush: [['l', 500, 270, 500, 760], ['p', 390, 220, 390, 140, 610, 140, 610, 220, 500, 300], ['l', 410, 760, 590, 760]],
    jade: [['p', 500, 130, 790, 430, 500, 850, 210, 430, 500, 130], ['l', 210, 430, 790, 430], ['l', 500, 130, 500, 850]],
    box: [['p', 220, 300, 500, 160, 780, 300, 500, 450, 220, 300], ['p', 220, 300, 220, 700, 500, 850, 500, 450], ['p', 500, 450, 780, 300, 780, 700, 500, 850]],
    road: [['p', 330, 180, 670, 180, 850, 850, 150, 850, 330, 180], ['l', 500, 260, 500, 390], ['l', 500, 500, 500, 630], ['l', 500, 740, 500, 820]],
    thorns: [['p', 180, 650, 820, 350], ['l', 350, 570, 300, 420], ['l', 430, 530, 480, 690], ['l', 580, 460, 540, 300], ['l', 680, 420, 740, 570]],
    sword: [['p', 500, 140, 570, 600, 500, 760, 430, 600, 500, 140], ['l', 420, 660, 580, 660], ['l', 430, 760, 570, 760], ['l', 500, 760, 500, 870]],
    bamboo: [['l', 360, 170, 360, 830], ['l', 640, 140, 640, 860], ['l', 330, 380, 390, 380], ['l', 330, 610, 390, 610], ['l', 610, 340, 670, 340], ['l', 610, 600, 670, 600], ['p', 360, 300, 230, 220, 160, 240], ['p', 640, 480, 770, 400, 840, 420]],
    charcoal: [['p', 220, 700, 260, 500, 420, 480, 470, 690, 220, 700], ['p', 420, 720, 470, 510, 640, 520, 720, 730, 420, 720], ['p', 640, 680, 700, 540, 820, 590, 830, 740, 640, 680]],
    water: [['p', 150, 390, 280, 330, 410, 390, 540, 330, 670, 390, 800, 330], ['p', 150, 560, 280, 500, 410, 560, 540, 500, 670, 560, 800, 500], ['p', 150, 730, 280, 670, 410, 730, 540, 670, 670, 730, 800, 670]],
    'nine cows': [['e', 250, 310, 100, 70, 0], ['e', 500, 310, 100, 70, 0], ['e', 750, 310, 100, 70, 0], ['l', 175, 310, 130, 220], ['l', 325, 310, 370, 220], ['l', 425, 310, 380, 220], ['l', 575, 310, 630, 220], ['l', 675, 310, 630, 220], ['l', 825, 310, 870, 220], ['p', 180, 400, 150, 550, 350, 550, 320, 400], ['p', 430, 400, 400, 550, 600, 550, 570, 400], ['p', 680, 400, 650, 550, 850, 550, 820, 400]],
    'water drop': [['p', 500, 150, 300, 450, 320, 670, 500, 830, 680, 670, 700, 450, 500, 150]],
    'snake tail': [['p', 180, 550, 300, 400, 420, 550, 540, 400, 660, 550, 820, 400]],
    stick: [['l', 260, 780, 740, 220], ['p', 470, 535, 320, 470, 280, 350], ['p', 540, 455, 690, 500, 740, 380]],
    wings: [['p', 500, 500, 400, 300, 180, 230, 300, 500, 180, 720, 420, 650, 500, 500], ['p', 500, 500, 600, 300, 820, 230, 700, 500, 820, 720, 580, 650, 500, 500]],
    food: [['p', 250, 470, 750, 470, 680, 760, 320, 760, 250, 470], ['p', 300, 400, 350, 330, 400, 400], ['p', 460, 400, 510, 330, 560, 400], ['l', 720, 200, 720, 400], ['l', 780, 200, 780, 400]],
    'seven mouths': [['e', 260, 330, 80, 55, 0], ['e', 500, 290, 80, 55, 0], ['e', 740, 330, 80, 55, 0], ['e', 200, 520, 80, 55, 0], ['e', 400, 500, 80, 55, 0], ['e', 600, 500, 80, 55, 0], ['e', 800, 520, 80, 55, 0], ['l', 220, 330, 300, 290], ['l', 540, 290, 680, 330]],
    spear: [['l', 350, 850, 650, 180], ['p', 650, 180, 570, 300, 650, 160, 730, 250, 650, 180]],
    shield: [['p', 250, 220, 750, 220, 720, 600, 500, 830, 280, 600, 250, 220], ['l', 500, 230, 500, 790], ['l', 270, 500, 730, 500]],
    axe: [['l', 430, 820, 570, 280], ['p', 500, 430, 550, 190, 780, 160, 720, 370, 500, 430]],
    'three musicians': [['c', 300, 250, 65], ['c', 500, 220, 65], ['c', 700, 250, 65], ['l', 300, 315, 300, 650], ['l', 500, 285, 500, 620], ['l', 700, 315, 700, 650], ['l', 300, 400, 240, 520], ['l', 500, 390, 560, 490], ['l', 700, 400, 770, 500], ['c', 570, 520, 35], ['l', 605, 520, 605, 390], ['c', 815, 535, 35], ['l', 850, 535, 850, 400]],
    'two arrows': [['l', 150, 700, 450, 400], ['l', 370, 400, 450, 400], ['l', 450, 480, 450, 400], ['l', 850, 300, 550, 600], ['l', 630, 600, 550, 600], ['l', 550, 520, 550, 600]],
    bottle: [['p', 430, 170, 430, 300, 350, 370, 350, 800, 650, 800, 650, 370, 570, 300, 570, 170, 430, 170], ['l', 430, 250, 570, 250], ['l', 370, 500, 630, 500]],
    weights: [['l', 500, 220, 500, 720], ['l', 300, 350, 700, 350], ['p', 310, 350, 230, 580, 390, 580, 310, 350], ['p', 690, 350, 610, 580, 770, 580, 690, 350], ['l', 340, 760, 660, 760], ['l', 420, 720, 580, 720]],
    sand: [['p', 180, 800, 300, 560, 390, 680, 500, 420, 610, 670, 700, 540, 820, 800, 180, 800], ['c', 260, 460, 12], ['c', 740, 350, 12], ['c', 600, 280, 12]],
    tower: [['p', 300, 830, 700, 830, 650, 170, 350, 170, 300, 830], ['l', 320, 650, 680, 650], ['l', 330, 470, 670, 470], ['l', 345, 300, 655, 300], ['r', 440, 680, 120, 150], ['r', 440, 500, 120, 150], ['r', 440, 320, 120, 150]],
    wind: [['p', 180, 350, 400, 350, 480, 300, 430, 250], ['p', 120, 500, 650, 500, 760, 440, 700, 380], ['p', 240, 650, 520, 650, 600, 600, 560, 560]],
    willow: [['l', 500, 220, 500, 800], ['p', 500, 360, 330, 440, 320, 660, 370, 550, 420, 690], ['p', 500, 380, 670, 450, 680, 680, 630, 560, 580, 710], ['p', 500, 300, 400, 250, 340, 130], ['p', 500, 300, 600, 240, 660, 120]],
    flock: [['c', 300, 300, 70], ['c', 500, 250, 70], ['c', 700, 300, 70], ['e', 300, 570, 100, 150, 0], ['e', 500, 540, 100, 150, 0], ['e', 700, 570, 100, 150, 0], ['l', 300, 370, 300, 500], ['l', 500, 320, 500, 470], ['l', 700, 370, 700, 500]]
  };

  var aliases = {
    'old man': 'person', 'farmer': '農夫', 'rabbit': '兔子', 'snake': '蛇', 'frog': '青蛙',
    'elephant': '大象', 'mountain': '山', 'horse': '馬', 'fox': '狐狸', 'tiger': '老虎',
    'dragon': '龍', 'phoenix': '鳳凰', 'bird': '鳥', 'cow': '牛', 'fish': '魚', 'stone': '石頭',
    'boat': '船', 'flower': '花', 'sheep': '羊', 'dog': '狗', 'wolf': '狼', 'clam': '蛤蜊',
    'cicada': '蟬', 'bamboo': '竹子', 'sun': '太陽', 'moon': '月亮', 'cloud': '雲', 'rain': '雨',
    'grass': '草', 'seed': '種子', 'sea': '海', 'eye': '眼睛', 'mouth': '嘴巴', 'heart': '心臟',
    'cake': '蛋糕', 'clock': '時鐘', 'map': '地圖', 'brush': '毛筆', 'bell': '鈴鐺',
    'wheelbarrow': '推車', 'visitor': '旅人', 'student': '學生', 'person': 'person', 'deer': '鹿',
    'plum': '李子', 'ice': '冰塊', 'spear': '長矛', 'shield': '盾牌', 'axe': '斧頭', 'sword': '劍',
    'target': '靶', 'mantis': '螳螂', 'willow': '柳樹', 'river': '河流', 'tower': '塔', 'cart': '馬車',
    'bowl': '碗', 'food': '食物', 'bottle': '瓶子', 'mirror': '鏡子', 'path': '道路', 'flower': '花',
    'cottage': '小屋', 'house': '房子', 'arrow': 'arrow', 'stump': 'stump', 'well': 'well',
    'wall': 'wall', 'firewood': 'firewood', 'charcoal': 'charcoal', 'seedling': 'seedling',
    'hands': 'hands', 'bamboo flute': 'flute', 'exam paper': 'exam paper', 'water': 'water',
    'oil bottle': 'oil bottle', 'two birds': 'two birds', 'snipe': 'bird', 'two scales': 'scale',
    'weights': 'weight', 'plum tree': 'tree', 'tree': '樹', 'footprints': 'footprints', 'fire': 'fire',
    'rice': 'rice', 'bitter cup': 'bitter cup', 'jade': 'jade', 'thorns': 'thorns', 'soil': 'soil',
    'soldier': 'person', 'four music notes': 'four music notes', 'hands together': 'hands together',
    'hands over ears': 'hands over ears', 'snake with legs': 'snake with legs', 'two birds': 'two birds',
    'one hair': 'one hair', 'speech bubbles': 'speech bubbles', 'tangled feet': 'tangled feet',
    'wide eyes': 'wide eyes', 'open mouth': 'open mouth', 'red face': 'red face', 'ears': 'ears',
    'bitter cup': 'bitter cup', 'four music notes': 'four music notes', 'up arrow': 'up arrow',
    'down arrow': 'down arrow', 'six colors': 'six colors', 'palette': 'palette', 'black wool': 'black wool',
    'clear window': 'clear window', 'ripe melon': 'ripe melon', 'one arrow': 'one arrow',
    'three hearts': 'three hearts', 'fast hands': 'fast hands', 'magnifying glass': '放大鏡',
    'house': 'house', 'person pointing': 'person', 'hands': 'hands', 'spring flowers': 'flower',
    'music notes': 'two music notes', 'two arrows': 'two arrows', 'fence': 'fence', 'archer': 'person',
    'flag': 'flag', 'paper map': 'paper map', 'thirsty person': 'thirsty person', 'hungry person': 'hungry person',
    'burning boat': 'boat', 'old horse': 'horse', 'old man': 'person', 'willow': '柳樹', 'flowers': '花',
    'mulberry tree': '樹', 'peach tree': '樹', 'sunlight': 'sun', 'frost': 'snowflake', 'bowl': '碗',
    'glue': 'glue', 'sand': '沙子', 'stars': '星星', 'eyes': 'eye', 'fast arrow': 'arrow'
  };

  Object.assign(aliases, {
    'lord': '國王', 'dragon': 'dragon', 'visitor': 'person', 'footprints': 'footprint',
    'wheelbarrow': 'wheelbarrow', 'fence': 'fence', 'brush': 'brush', 'jade': 'jade',
    'box': 'box', 'road': 'road', 'thorns': 'thorns', 'sword': 'sword', 'deer': '梅花鹿',
    'plum': 'plum blossom', 'sheep': '綿羊', 'bamboo': 'bamboo', 'charcoal': 'charcoal',
    'water': 'water', 'nine cows': 'nine cows', 'chicken': '小雞', 'wind': 'wind',
    'water drop': 'water drop', 'pie': 'apple pie', 'parent': 'person', 'tiger head': '老虎',
    'snake tail': 'snake tail', 'stick': 'stick', 'wings': 'wings', 'food': 'food',
    'seven mouths': 'seven mouths', 'musical notes': 'two music notes', 'busy hands': 'hands',
    'spear': 'spear', 'shield': 'shield', 'axe': 'axe', 'expert': '木匠',
    'three musicians': 'three musicians', 'two arrows': 'two arrows', 'bottle': 'bottle',
    'field': '稻田', 'weights': 'weights', 'sand': 'sand', 'tower': 'tower',
    'dazzled eyes': 'wide eyes', 'willow': 'willow', 'flock': 'flock', 'one heart': 'heart',
    'single hair': 'one hair', 'grass': '草地', 'path': 'road', 'sea': '大海',
    'flag': '國旗', 'archer': 'person', 'soldier': 'person', 'person pointing': 'person', 'wind': 'wind'
  });

  var wordsByText = Object.create(null);
  Words.all().forEach(function (word) {
    wordsByText[word.text.toLowerCase()] = word;
    var english = Words.byId(word.id, 'en');
    if (english && english.text) wordsByText[english.text.toLowerCase()] = word;
  });
  var cache = Object.create(null);

  function primitiveStrokes(name) {
    var operations = primitives[name];
    if (!operations) return null;
    return operations.reduce(function (all, operation) {
      return all.concat(Words.pointsOf(operation)
        .filter(function (points) { return points.length >= 4; })
        .map(function (points) { return { p: points }; }));
    }, []);
  }

  function iconStrokes(name) {
    var primitive = primitiveStrokes(name);
    if (primitive) return primitive;
    var label = aliases[name] || name;
    primitive = primitiveStrokes(label);
    if (primitive) return primitive;
    var word = wordsByText[label.toLowerCase()];
    if (!word) return null;
    var manual = DrawingReference.get(word.id);
    if (manual) return manual;
    var strokes = Words.strokesOf(word.id);
    if (word.id.indexOf('w-') === 0 && strokes.length > 3) strokes = strokes.slice(0, -3);
    return strokes;
  }

  var PEOPLE = /person|man|farmer|soldier|archer|visitor|student|parent|lord|expert|musician|hands|feet|face|eyes?|mouth|ears/;
  var PRIMITIVE_PALETTES = [
    [/fire|oil|sun/, 'orange'], [/water|drop|sea|river/, 'blue'], [/snow|ice/, 'ice'],
    [/bamboo|seedling|willow|grass|tree|soil/, 'green'], [/heart|red/, 'red'],
    [/stump|wall|fence|wheelbarrow|firewood|charcoal|stick|axe|spear|sword|shield|road|well/, 'brown'],
    [/jade|box|paper|map|palette|bottle|cup|tower|bell|brush|weights|flute/, 'home'],
    [/note|music/, 'music'], [/arrow|target|bubble/, 'gold']
  ];

  function paletteOf(name) {
    var label = aliases[name] || name;
    var word = wordsByText[label.toLowerCase()];
    if (word) return DrawingReference.paletteKeyOf(word.id);
    if (PEOPLE.test(name)) return 'people';
    for (var i = 0; i < PRIMITIVE_PALETTES.length; i++)
      if (PRIMITIVE_PALETTES[i][0].test(name)) return PRIMITIVE_PALETTES[i][1];
    return 'nature';
  }

  function get(id) {
    // A hand-composed recipe for the topic replaces the generic composed scene.
    if (Recipes && Recipes[id]) return null;
    if (cache[id]) return cache[id];
    var scene = scenes[id];
    if (!scene) return null;
    var icons = scene.map(function (name) {
      var strokes = iconStrokes(name);
      return strokes && strokes.length ? { name: name, strokes: strokes, palette: paletteOf(name) } : null;
    }).filter(Boolean);
    if (!icons.length || icons.length !== scene.length) return null;
    var layouts = icons.length === 1
      ? [[500, 560, 0.68]]
      : icons.length === 2
        ? [[320, 560, 0.54], [680, 560, 0.54]]
        : icons.length === 3
          ? [[205, 560, 0.36], [500, 560, 0.36], [795, 560, 0.36]]
          : [[280, 360, 0.35], [720, 360, 0.35], [280, 730, 0.35], [720, 730, 0.35]];
    var result = [];
    icons.forEach(function (icon, index) {
      var layout = layouts[index] || [500, 560, 0.3];
      icon.strokes.forEach(function (stroke) {
        var points = stroke.p;
        var transformed = points.map(function (value, pointIndex) {
          var center = pointIndex % 2 === 0 ? layout[0] : layout[1];
          return Math.round((value - 500) * layout[2] + center);
        });
        result.push({ p: transformed, c: icon.palette });
      });
    });
    cache[id] = result;
    return result;
  }

  function svg(id, step) {
    var strokes = get(id);
    if (!strokes) return '';
    return DrawingReference.render(strokes, step, 'idiom');
  }

  return {
    get: get,
    svg: svg,
    ids: function () {
      return Object.keys(scenes).filter(function (id) { return !(Recipes && Recipes[id]); });
    },
    components: function (id) {
      return (scenes[id] || []).map(function (name) {
        return { name: name, available: !!iconStrokes(name) };
      });
    }
  };
});
