// ═══════════════════════════════════════════════════════════
// 사주 다이어리 — 고전 기반 분석 시스템
// 자평진전, 적천수, 삼명통회, 궁통보감, 신봉통고 이론 기반
// ═══════════════════════════════════════════════════════════

// ─── 사건 유형 (일반인 친화 라벨) ─────────────────────────
export const DIARY_EVENT_TYPES = [
  '직장 생활', '건강/돌발', '돈 관리', '투자/사업',
  '공부/시험', '고민/방황', '취미/여행', '다툼/이별',
  '경쟁/자존심', '손해/후회'
];

// ─── 십신 매핑 ──────────────────────────────────────────
export const DIARY_SIPSIN_MAP = {
  '직장 생활': {
    sipsin: '정관', hanja: '正官',
    elementRelation: '나를 다잡아주는 에너지',
    desc: '회사일, 상사관계, 승진/강등, 조직 변화 등',
    lifeAreas: ['직장', '승진', '상사관계', '조직변화', '사회적 평판'],
    defaultPillar: '월주',
    possibleEffects: [
      { effects: ['충', '형'], weight: 3, context: '직장 내 충돌과 스트레스가 겹치는 시기' },
      { effects: ['충'], weight: 2, context: '갑작스러운 업무 변동이 찾아오는 시기' },
      { effects: ['형', '파'], weight: 2, context: '조직 내부 갈등과 시스템 균열' },
      { effects: ['합'], weight: 1, context: '새로운 협력 관계나 좋은 기회가 열리는 시기' }
    ],
    summaryTemplates: [
      '사주에서 정관(正官)은 나를 바로잡아주는 질서의 에너지예요. 이 시기 {effects}의 영향으로 직장 내 관계와 업무에 변화가 생기기 쉬운 흐름이에요.',
      '직장·조직을 관장하는 정관의 기운이 {season} {effects}의 영향을 받아, 상사나 조직과의 관계에서 긴장이 나타난 시기예요.',
      '나를 이끌어주는 정관의 에너지에 {effects}가 작용하면서, 직장 환경에 의미 있는 변화가 생긴 흐름이에요.'
    ],
    classicalQuotes: [
      { text: '정관의 기운이 제대로 작용하려면, 내 몸과 마음이 먼저 튼튼해야 해요', source: '자평진전', chapter: '논정관' },
      { text: '조직 안에서 인정을 받으려면, 실력과 함께 사람을 얻는 덕이 있어야 해요', source: '적천수', chapter: '관운론' },
      { text: '직장이나 조직의 압박이 지나치면, 오히려 독이 될 수 있어요', source: '삼명통회', chapter: '논관성' }
    ],
    patternTags: ['직장변동형', '조직갈등형']
  },

  '건강/돌발': {
    sipsin: '편관', hanja: '七殺',
    elementRelation: '나를 강하게 몰아치는 에너지',
    desc: '갑작스러운 사고, 건강 문제, 예상 못한 위기 상황 등',
    lifeAreas: ['건강', '사고', '예상 못한 위기', '수술', '긴급 상황'],
    defaultPillar: '일주',
    possibleEffects: [
      { effects: ['충', '형'], weight: 3, context: '갑작스러운 충격과 쌓인 압박이 동시에 터지는 시기' },
      { effects: ['충'], weight: 3, context: '예상 못한 돌발 상황이 찾아오는 시기' },
      { effects: ['형'], weight: 2, context: '오래 쌓인 피로가 몸이나 마음에 드러나는 시기' },
      { effects: ['파', '해'], weight: 1, context: '안전하다고 느꼈던 것에 균열이 생기는 시기' }
    ],
    summaryTemplates: [
      '사주에서 칠살(七殺)은 나를 강하게 밀어붙이는 에너지예요. {effects}의 영향으로 갑작스러운 위기나 건강 이슈가 나타나기 쉬운 흐름이에요.',
      '강한 압박의 에너지가 {season} {effects}와 만나면서, 예측하기 어려운 돌발 상황이 일어난 시기예요.',
      '나를 시험하는 칠살의 에너지가 {effects}를 통해 몸이나 생활에 직접적인 영향을 준 흐름이에요.'
    ],
    classicalQuotes: [
      { text: '강한 압박도 잘 다스리면 오히려 나를 성장시키는 힘이 돼요', source: '자평진전', chapter: '논편관' },
      { text: '외부 압박이 클 때는, 나를 보호해줄 안전장치가 꼭 필요해요', source: '적천수', chapter: '체용론' },
      { text: '시련이 있어야 단단해지고, 아픔 없이는 특별해질 수 없어요', source: '신봉통고', chapter: '병약론' }
    ],
    patternTags: ['돌발위기형', '건강주의형']
  },

  '돈 관리': {
    sipsin: '정재', hanja: '正財',
    elementRelation: '내가 관리하는 안정적인 에너지',
    desc: '월급, 저축, 계약, 부동산, 생활비 관련 일 등',
    lifeAreas: ['월급', '계약', '부동산', '저축', '안정적 수입'],
    defaultPillar: '일주',
    possibleEffects: [
      { effects: ['합'], weight: 3, context: '계약 성사나 재물이 안정적으로 모이는 시기' },
      { effects: ['파', '해'], weight: 2, context: '안정적이던 돈 흐름에 균열이 생기는 시기' },
      { effects: ['충'], weight: 2, context: '금전 관련 상황이 급변하는 시기' },
      { effects: ['형'], weight: 1, context: '돈 문제로 마음고생이 심한 시기' }
    ],
    summaryTemplates: [
      '사주에서 정재(正財)는 내가 꾸준히 관리하는 안정적인 재물의 에너지예요. {effects}의 영향으로 수입이나 계약, 자산에 변화가 생긴 흐름이에요.',
      '재물의 안정을 관장하는 정재가 {season} {effects}와 만나면서, 돈의 흐름에 변화가 감지된 시기예요.',
      '내가 관리하는 정재 에너지에 {effects}가 개입하면서, 금전적으로 신경 쓸 일이 생긴 흐름이에요.'
    ],
    classicalQuotes: [
      { text: '재물의 흐름이 안정적으로 통하면, 자연스럽게 풍요가 찾아와요', source: '적천수', chapter: '재운론' },
      { text: '돈이 많아도 관리할 체력이 부족하면, 부자 집에 사는 가난한 사람이 돼요', source: '자평진전', chapter: '논재' },
      { text: '꾸준한 재물은 가까운 사람의 도움과 함께할 때 더 단단해져요', source: '삼명통회', chapter: '논재성' }
    ],
    patternTags: ['재물변동형', '금전관리형']
  },

  '투자/사업': {
    sipsin: '편재', hanja: '偏財',
    elementRelation: '크게 움직이는 재물 에너지',
    desc: '투자, 사업, 부업, 큰돈 움직임, 아버지 관련 일 등',
    lifeAreas: ['투자', '사업', '부업', '큰돈', '아버지'],
    defaultPillar: '월주',
    possibleEffects: [
      { effects: ['파', '해'], weight: 3, context: '투자나 사업에 예상 못한 손실이 생기는 시기' },
      { effects: ['합'], weight: 2, context: '투자 성과가 나거나 좋은 사업 기회가 열리는 시기' },
      { effects: ['충'], weight: 2, context: '재물 흐름이 급격히 뒤바뀌는 시기' },
      { effects: ['형'], weight: 1, context: '돈 걱정으로 잠을 못 이루는 시기' }
    ],
    summaryTemplates: [
      '사주에서 편재(偏財)는 크게 움직이는 재물의 에너지예요. {effects}의 영향으로 투자나 사업 흐름에 변동이 생긴 시기예요.',
      '큰 재물을 관장하는 편재가 {season} {effects}와 만나면서, 돈의 흐름이 크게 요동친 시기예요.',
      '유동적인 편재 에너지에 {effects}가 작용하면서, 예상 밖의 금전 변동이 나타난 흐름이에요.'
    ],
    classicalQuotes: [
      { text: '큰돈은 누구에게나 열려 있지만, 감당할 그릇이 되어야 내 것이 돼요', source: '자평진전', chapter: '논편재' },
      { text: '재물 운이 확실하지 않을 때 무리하면, 결국 빈손으로 돌아오게 돼요', source: '적천수', chapter: '재운론' },
      { text: '여러 사람이 같은 이익을 탐하면, 재앙이 함께 찾아오기 쉬워요', source: '삼명통회', chapter: '논겁재' }
    ],
    patternTags: ['투자변동형', '큰돈움직임형']
  },

  '공부/시험': {
    sipsin: '정인', hanja: '正印',
    elementRelation: '나를 성장시켜주는 에너지',
    desc: '시험, 자격증, 공부, 자기계발, 어머니 관련 일 등',
    lifeAreas: ['시험', '자격증', '공부', '자기계발', '어머니'],
    defaultPillar: '월주',
    possibleEffects: [
      { effects: ['합'], weight: 3, context: '노력이 결실을 맺고 합격하는 시기' },
      { effects: ['충'], weight: 2, context: '공부 환경이 갑자기 바뀌는 시기' },
      { effects: ['형'], weight: 1, context: '공부 압박과 자기 의심이 커지는 시기' },
      { effects: ['해'], weight: 1, context: '성장 과정에서 감정적으로 지치는 시기' }
    ],
    summaryTemplates: [
      '사주에서 정인(正印)은 나를 키워주고 보호해주는 에너지예요. {effects}의 영향으로 공부나 자기계발 방향에 변화가 생긴 흐름이에요.',
      '성장을 도와주는 정인의 기운이 {season} {effects}와 만나면서, 배움의 흐름에 전환점이 나타난 시기예요.',
      '나를 보살펴주는 정인의 에너지가 {effects}의 영향으로 학업이나 성장에 변화를 만든 흐름이에요.'
    ],
    classicalQuotes: [
      { text: '배움의 기운이 강할 때 좋은 기회를 만나면, 크게 빛날 수 있어요', source: '자평진전', chapter: '논인수' },
      { text: '나를 성장시켜주는 에너지는 어머니의 사랑처럼 따뜻하고 든든해요', source: '적천수', chapter: '체용론' },
      { text: '힘든 시기에 배움이 함께하면, 오히려 이름을 높이는 기회가 돼요', source: '삼명통회', chapter: '논인성' }
    ],
    patternTags: ['학업변화형', '성장형']
  },

  '고민/방황': {
    sipsin: '편인', hanja: '偏印',
    elementRelation: '나를 흔들어 깨우는 에너지',
    desc: '진로 고민, 이직 충동, 방향 상실, 갑작스런 깨달음 등',
    lifeAreas: ['진로 고민', '이직', '방향 상실', '새로운 깨달음', '외로움'],
    defaultPillar: '시주',
    possibleEffects: [
      { effects: ['충'], weight: 3, context: '기존 방향이 확 바뀌거나 예상 밖의 깨달음이 오는 시기' },
      { effects: ['형'], weight: 2, context: '내면 깊은 곳에서 올라오는 불안과 고민' },
      { effects: ['합'], weight: 2, context: '뜻밖의 인연이나 기회와 만나는 시기' },
      { effects: ['해'], weight: 1, context: '기존 관계가 소모되면서 새로운 방향을 찾게 되는 시기' }
    ],
    summaryTemplates: [
      '사주에서 편인(偏印)은 나를 흔들어 깨워주는 독특한 에너지예요. {effects}의 영향으로 기존 방향에 의문이 생기고 새로운 전환이 시작된 흐름이에요.',
      '변화를 이끄는 편인의 기운이 {season} {effects}와 만나면서, 일상의 궤도에서 벗어나는 변화가 찾아온 시기예요.',
      '새로운 방향을 찾게 해주는 편인이 {effects}와 만나면서, 기존 틀을 벗어나는 고민이 시작된 흐름이에요.'
    ],
    classicalQuotes: [
      { text: '방향이 바뀌는 시기에는, 지금 누리는 안정이 흔들릴 수 있어요', source: '자평진전', chapter: '논편인' },
      { text: '고민이 깊어질 때 기존에 잘 되던 일이 막히기 시작하면, 변화의 신호예요', source: '적천수', chapter: '체용론' },
      { text: '내면의 불안이 커지면 가까운 사람과의 관계에도 영향을 줄 수 있어요', source: '삼명통회', chapter: '논효신' }
    ],
    patternTags: ['방향전환형', '고민심화형']
  },

  '취미/여행': {
    sipsin: '식신', hanja: '食神',
    elementRelation: '내가 만들어내는 풍요로운 에너지',
    desc: '맛집, 여행, 취미활동, 창작, 여유로운 시간 등',
    lifeAreas: ['여행', '취미', '맛집', '창작', '여유'],
    defaultPillar: '시주',
    possibleEffects: [
      { effects: ['합'], weight: 3, context: '즐거운 일이 잘 이어지고 좋은 경험이 생기는 시기' },
      { effects: ['충'], weight: 1, context: '여유로운 흐름이 외부 변수로 깨지는 시기' },
      { effects: ['형'], weight: 1, context: '하고 싶은 게 있는데 현실에 막히는 시기' },
      { effects: ['해'], weight: 1, context: '즐거워야 할 시간이 감정적으로 지치는 시기' }
    ],
    summaryTemplates: [
      '사주에서 식신(食神)은 내가 만들어내는 여유롭고 풍요로운 에너지예요. {effects}의 영향으로 취미나 일상의 즐거움에 변화가 생긴 흐름이에요.',
      '풍요로운 식신의 기운이 {season} {effects}와 만나면서, 삶의 즐거움이나 표현 방식에 변화가 온 시기예요.',
      '내면의 여유를 관장하는 식신이 {effects}와 만나면서, 즐겁게 보내는 시간의 질이 달라진 시기예요.'
    ],
    classicalQuotes: [
      { text: '여유와 즐거움의 에너지가 충만하면, 돈이나 지위보다 더 큰 힘이 돼요', source: '자평진전', chapter: '논식신' },
      { text: '내면의 풍요로움이 강할 때, 어떤 압박도 이겨내는 용기가 생겨요', source: '삼명통회', chapter: '논식신' },
      { text: '생활 속 소소한 행복이 쌓이면, 재물이나 명예보다 값진 결과를 만들어요', source: '적천수', chapter: '체용론' }
    ],
    patternTags: ['여유충전형', '즐거움변화형']
  },

  '다툼/이별': {
    sipsin: '상관', hanja: '傷官',
    elementRelation: '내 안에서 터져나오는 에너지',
    desc: '말다툼, 감정폭발, 연인/친구와 이별, 참지 못한 순간 등',
    lifeAreas: ['다툼', '이별', '감정폭발', '관계 깨짐', '후회하는 말'],
    defaultPillar: '일주',
    possibleEffects: [
      { effects: ['충', '형'], weight: 3, context: '감정이 폭발하면서 관계까지 깨지는 시기' },
      { effects: ['충', '해'], weight: 3, context: '관계가 급격히 끊어지고 감정이 소모되는 시기' },
      { effects: ['충'], weight: 2, context: '참았던 감정이 갑자기 터져 나오는 시기' },
      { effects: ['형'], weight: 2, context: '속으로 쌓인 불만이 관계를 파괴하는 시기' }
    ],
    summaryTemplates: [
      '사주에서 상관(傷官)은 내 안에서 강하게 터져나오는 에너지예요. {effects}의 영향으로 감정 폭발이나 관계 깨짐으로 이어진 흐름이에요.',
      '참을 수 없는 상관의 에너지가 {season} {effects}와 만나면서, 기존 관계에 균열이 생긴 시기예요.',
      '내 안의 불만을 터뜨리는 상관의 기운이 {effects}를 통해 감정적 폭발로 이어진 흐름이에요.'
    ],
    classicalQuotes: [
      { text: '감정이 폭발하는 시기에 권위와 부딪히면, 여러 가지 문제가 생겨요', source: '자평진전', chapter: '논상관' },
      { text: '터져나오는 감정을 배움과 성찰로 다스리면, 오히려 큰 성장이 돼요', source: '적천수', chapter: '체용론' },
      { text: '감정을 끝까지 쏟아내고 나면, 예상 밖의 새로운 국면이 열리기도 해요', source: '삼명통회', chapter: '논상관' }
    ],
    patternTags: ['감정폭발형', '관계깨짐형']
  },

  '경쟁/자존심': {
    sipsin: '비견', hanja: '比肩',
    elementRelation: '나와 같은 힘으로 부딪히는 에너지',
    desc: '경쟁, 자존심 싸움, 형제/동료 갈등, 주도권 다툼 등',
    lifeAreas: ['경쟁', '자존심', '형제갈등', '동료 갈등', '주도권'],
    defaultPillar: '월주',
    possibleEffects: [
      { effects: ['충'], weight: 3, context: '경쟁 상대와 정면으로 부딪히는 시기' },
      { effects: ['형'], weight: 2, context: '비슷한 위치의 사람과 보이지 않는 신경전이 심한 시기' },
      { effects: ['합'], weight: 2, context: '경쟁자가 동지가 되는 협력의 시기' },
      { effects: ['해'], weight: 1, context: '경쟁 때문에 감정적으로 지치는 시기' }
    ],
    summaryTemplates: [
      '사주에서 비견(比肩)은 나와 대등한 힘을 가진 에너지예요. {effects}의 영향으로 경쟁이나 자존심 문제가 부각된 흐름이에요.',
      '나와 맞서는 비견의 기운이 {season} {effects}와 만나면서, 주도권이나 독립에 대한 고민이 커진 시기예요.',
      '동등한 힘의 비견이 {effects}와 만나면서, 누군가와의 경쟁이나 비교에서 스트레스를 받은 흐름이에요.'
    ],
    classicalQuotes: [
      { text: '나와 비슷한 사람이 많을수록, 갈등을 다스리는 지혜가 필요해요', source: '적천수', chapter: '체용론' },
      { text: '경쟁자가 사방에 있을 때는, 목표를 분명히 하는 것이 돌파구예요', source: '자평진전', chapter: '논비견' },
      { text: '강한 경쟁심이 따라다니는 사람은, 평생 승부를 피할 수 없어요', source: '삼명통회', chapter: '논비견' }
    ],
    patternTags: ['경쟁심화형', '자존심형']
  },

  '손해/후회': {
    sipsin: '겁재', hanja: '劫財',
    elementRelation: '내 것을 빼앗아가는 에너지',
    desc: '재물 손실, 믿었던 사람에게 배신, 무리한 도전의 대가 등',
    lifeAreas: ['재물 손실', '배신', '무리한 도전', '후회', '사기 피해'],
    defaultPillar: '일주',
    possibleEffects: [
      { effects: ['파', '해'], weight: 3, context: '돈이나 관계에서 예상 못한 손실이 발생하는 시기' },
      { effects: ['충'], weight: 3, context: '큰 손실과 함께 상황이 급변하는 시기' },
      { effects: ['형'], weight: 2, context: '무리한 시도 때문에 자신을 몰아세우는 시기' },
      { effects: ['합'], weight: 1, context: '위험을 감수하고 새로운 도전에 뛰어드는 시기' }
    ],
    summaryTemplates: [
      '사주에서 겁재(劫財)는 내 것을 빼앗아가는 에너지예요. {effects}의 영향으로 손실이나 예상 못한 피해가 나타난 흐름이에요.',
      '빼앗기는 겁재의 기운이 {season} {effects}와 만나면서, 돈이나 관계에서 뜻밖의 손해가 발생한 시기예요.',
      '내 것을 지키기 어려운 겁재의 에너지가 {effects}를 통해 기존에 가지고 있던 것에 균열을 낸 흐름이에요.'
    ],
    classicalQuotes: [
      { text: '빼앗기는 기운이 강할 때 무리하면, 큰 손실로 이어질 수 있어요', source: '자평진전', chapter: '논겁재' },
      { text: '여러 사람이 같은 이익을 노릴 때, 재앙이 함께 따라오기 쉬워요', source: '적천수', chapter: '재운론' },
      { text: '손실의 기운 속에서 욕심을 부리면, 반드시 다툼이 생겨요', source: '삼명통회', chapter: '논겁재' }
    ],
    patternTags: ['손실형', '뒤늦은후회형']
  }
};

// ─── 궁위(宮位) 시스템 ──────────────────────────────────
export const PILLAR_POSITIONS = {
  '년주': { name: '년주(年柱)', timeOfLife: '어린 시절', domain: '가문, 사회적 배경', relations: '조부모, 윗사람', emoji: '🏛️' },
  '월주': { name: '월주(月柱)', timeOfLife: '청년기', domain: '부모, 직장, 사회생활', relations: '부모, 직장', emoji: '🏢' },
  '일주': { name: '일주(日柱)', timeOfLife: '현재~중년', domain: '나 자신, 배우자, 핵심 관계', relations: '나, 배우자', emoji: '💎' },
  '시주': { name: '시주(時柱)', timeOfLife: '미래~노년', domain: '자녀, 미래, 결과', relations: '자녀, 후배', emoji: '🌱' }
};

// ─── 합충형파해 해설 ────────────────────────────────────
export const EFFECT_DETAILS = {
  '충': { emoji: '⚡', name: '충(沖)', color: 'amber', description: '기존 흐름을 확 뒤흔드는 변화의 에너지예요. 갑작스런 이동·분리·충돌을 일으키지만, 정체된 상황을 깨는 전환점이 되기도 해요.' },
  '형': { emoji: '🔥', name: '형(刑)', color: 'rose', description: '안에서 쌓이는 압박과 스트레스의 에너지예요. 자기 자신을 옥죄는 성질이 있어서 번아웃이나 건강 문제로 나타나기 쉬워요.' },
  '합': { emoji: '🤝', name: '합(合)', color: 'emerald', description: '서로 다른 것이 하나로 맺어지는 에너지예요. 좋은 인연·성과·계약이 성사되지만, 가끔은 원치 않는 묶임이 되기도 해요.' },
  '파': { emoji: '💔', name: '파(破)', color: 'purple', description: '안정적이던 것에 금이 가는 에너지예요. 관계나 시스템의 약한 부분이 드러나면서 변화가 시작돼요.' },
  '해': { emoji: '🌊', name: '해(害)', color: 'blue', description: '보이지 않게 관계를 갉아먹는 에너지예요. 서서히 신뢰가 줄어들고, 정서적으로 지치게 만드는 상황이에요.' }
};

// ─── 오행 계절 역학 (궁통보감 조후론 기반) ────────────────
export const SEASON_DYNAMICS = {
  '01': { season: '겨울', dominant: '수(水)', weak: '화(火)', needed: '화(火)·목(木)', desc: '한겨울의 깊은 물 기운. 모든 것이 움츠러들고, 내면의 에너지가 응축되는 시기예요.', element: '水' },
  '02': { season: '초봄', dominant: '목(木)', weak: '금(金)', needed: '화(火)', desc: '얼어붙은 기운이 풀리기 시작하는 전환기. 새로운 시작의 에너지가 싹트는 시기예요.', element: '木' },
  '03': { season: '봄', dominant: '목(木)', weak: '금(金)', needed: '화(火)·수(水)', desc: '나무 기운이 올라오는 성장기. 확장과 도전의 에너지가 활발해지는 시기예요.', element: '木' },
  '04': { season: '봄', dominant: '목(木)', weak: '토(土)', needed: '금(金)·화(火)', desc: '나무 기운이 절정인 시기. 성장 에너지가 최고조지만, 과욕을 경계해야 해요.', element: '木' },
  '05': { season: '초여름', dominant: '화(火)', weak: '수(水)', needed: '수(水)·금(金)', desc: '불 기운이 시작되는 시기. 열정과 행동력이 급상승해요.', element: '火' },
  '06': { season: '여름', dominant: '화(火)', weak: '수(水)', needed: '수(水)', desc: '불 기운이 가득한 시기. 에너지가 밖으로 최대한 발산돼요.', element: '火' },
  '07': { season: '늦여름', dominant: '토(土)', weak: '목(木)', needed: '수(水)·금(金)', desc: '계절이 바뀌는 전환기. 여러 에너지가 섞이면서 변화가 많아요.', element: '土' },
  '08': { season: '초가을', dominant: '금(金)', weak: '목(木)', needed: '수(水)·화(火)', desc: '쇠 기운이 시작되는 시기. 정리하고 수확하는 에너지가 생겨요.', element: '金' },
  '09': { season: '가을', dominant: '금(金)', weak: '목(木)', needed: '수(水)', desc: '쇠 기운이 강해지는 시기. 결단력과 판단력이 올라가요.', element: '金' },
  '10': { season: '가을', dominant: '금(金)', weak: '화(火)', needed: '화(火)·수(水)', desc: '쇠 기운이 절정인 시기. 냉철해지지만 과하면 차가워질 수 있어요.', element: '金' },
  '11': { season: '초겨울', dominant: '수(水)', weak: '화(火)', needed: '화(火)·목(木)', desc: '물 기운이 시작되는 시기. 에너지가 안으로 모이기 시작해요.', element: '水' },
  '12': { season: '겨울', dominant: '수(水)', weak: '토(土)', needed: '화(火)·목(木)', desc: '물 기운이 깊어지는 시기. 깊은 생각과 내면 성찰의 에너지가 커져요.', element: '水' }
};

// ─── 오행 관계 매핑 ──────────────────────────────────────
const SIPSIN_ELEMENT_NATURE = {
  '정관': '극아(克我)', '편관': '극아(克我)',
  '정인': '생아(生我)', '편인': '생아(生我)',
  '비견': '동아(同我)', '겁재': '동아(同我)',
  '식신': '아생(我生)', '상관': '아생(我生)',
  '정재': '아극(我克)', '편재': '아극(我克)'
};

// ─── 강도/감정 기반 심화 해석 ────────────────────────────
const DEPTH_INSIGHTS = {
  high_negative: '체감 강도가 높고 감정도 힘들었던 만큼, 이 패턴이 당신에게 특히 강하게 작용하는 유형일 가능성이 높아요. 이렇게 강한 발현일수록 패턴을 읽는 데 핵심적인 데이터가 돼요.',
  high_positive: '강하게 느꼈는데 결과는 좋았다는 건, 이 시기의 에너지가 당신에게 성장의 기회로 작용한 거예요. 비슷한 흐름이 올 때 적극적으로 활용해볼 수 있는 패턴이에요.',
  high_neutral: '큰 변화가 있었는데 감정적으로 흔들리지 않은 건, 당신이 그 상황을 충분히 감당할 수 있었다는 뜻이에요. 내면의 힘이 탄탄한 시기였어요.',
  low_negative: '가볍게 지나간 것 같지만 부정적 감정이 남아있다면, 이 패턴이 서서히 쌓이는 방식으로 작동할 수 있어요. 비슷한 일이 반복되지 않는지 살펴보세요.',
  low_positive: '가벼운 좋은 경험이에요. 비슷한 시기에 이런 흐름이 반복될 수 있으니, 나중에 비교해보면 재미있는 패턴을 발견할 수 있어요.',
  low_neutral: '작은 변화지만, 기록 자체가 소중한 데이터예요. 이런 사소한 것들이 쌓여야 전체 패턴이 보이기 시작해요.'
};

// ─── 분석 함수 ──────────────────────────────────────────
export function generateDiaryAnalysis(eventType, year, month, intensity, emotion) {
  const sipsinData = DIARY_SIPSIN_MAP[eventType];
  if (!sipsinData) {
    return {
      sipsin: { name: '미상', hanja: '未詳', relation: '' },
      triggeredEffects: ['충'],
      effectExplanations: {},
      pillar: PILLAR_POSITIONS['일주'],
      seasonalContext: { season: '', dominant: '', note: '' },
      classicalQuote: null,
      summary: '해당 시기의 기운이 사건 형태로 나타난 것으로 보여요.',
      depthInsight: '',
      patternTags: ['사건화형']
    };
  }

  // 1) 합충형파해 선택 (날짜 해시 기반 가중 선택)
  const dateHash = (parseInt(year) * 17 + parseInt(month) * 7 + intensity) % 100;
  let cumWeight = 0;
  const totalWeight = sipsinData.possibleEffects.reduce((s, e) => s + e.weight, 0);
  const normalizedHash = (dateHash / 100) * totalWeight;
  let selectedEffect = sipsinData.possibleEffects[0];
  for (const eff of sipsinData.possibleEffects) {
    cumWeight += eff.weight;
    if (normalizedHash < cumWeight) { selectedEffect = eff; break; }
  }

  // 2) 효과별 해설
  const effectExplanations = {};
  selectedEffect.effects.forEach(e => {
    if (EFFECT_DETAILS[e]) effectExplanations[e] = EFFECT_DETAILS[e].description;
  });

  // 3) 궁위
  const pillar = PILLAR_POSITIONS[sipsinData.defaultPillar];

  // 4) 계절 역학
  const monthKey = month.padStart(2, '0');
  const seasonal = SEASON_DYNAMICS[monthKey] || SEASON_DYNAMICS['01'];

  // 5) 고전 인용 선택
  const quoteIdx = (parseInt(year) + parseInt(month)) % sipsinData.classicalQuotes.length;
  const classicalQuote = sipsinData.classicalQuotes[quoteIdx];

  // 6) 요약 생성
  const templateIdx = (parseInt(year) * 13 + parseInt(month)) % sipsinData.summaryTemplates.length;
  const effectLabel = selectedEffect.effects.map(e => EFFECT_DETAILS[e]?.name || e).join('·');
  let summary = sipsinData.summaryTemplates[templateIdx]
    .replace('{effects}', effectLabel)
    .replace('{season}', `${seasonal.season} ${seasonal.dominant} 시기`);

  // 7) 심화 해석
  const isHigh = intensity >= 4;
  const emotionKey = emotion === '긍정' ? 'positive' : emotion === '부정' ? 'negative' : 'neutral';
  const depthInsight = DEPTH_INSIGHTS[`${isHigh ? 'high' : 'low'}_${emotionKey}`] || '';

  // 8) 패턴 태그
  const patternTags = [...sipsinData.patternTags];
  selectedEffect.effects.forEach(e => {
    const effectTag = { '충': '충변동형', '형': '스트레스누적형', '합': '좋은인연형', '파': '균열발생형', '해': '서서히지침형' }[e];
    if (effectTag && !patternTags.includes(effectTag)) patternTags.push(effectTag);
  });
  if (intensity >= 4 && emotion === '부정') patternTags.push('강하게힘듦형');
  if (intensity >= 4 && emotion === '긍정') patternTags.push('성장전환형');

  return {
    sipsin: {
      name: sipsinData.sipsin,
      hanja: sipsinData.hanja,
      relation: sipsinData.elementRelation,
      nature: SIPSIN_ELEMENT_NATURE[sipsinData.sipsin] || ''
    },
    triggeredEffects: selectedEffect.effects,
    effectContext: selectedEffect.context,
    effectExplanations,
    pillar: { ...pillar, key: sipsinData.defaultPillar },
    seasonalContext: {
      season: seasonal.season,
      dominant: seasonal.dominant,
      element: seasonal.element,
      note: seasonal.desc
    },
    classicalQuote,
    summary,
    depthInsight,
    patternTags
  };
}

// ─── 패턴 요약 ──────────────────────────────────────────
export function getDiaryPatternSummary(events) {
  const tags = events.flatMap(ev => ev.analysis?.patternTags || []);
  const countMap = {};
  tags.forEach(tag => { countMap[tag] = (countMap[tag] || 0) + 1; });
  return Object.entries(countMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);
}

// ─── 초기 폼 ────────────────────────────────────────────
export const DIARY_INITIAL_FORM = {
  year: String(new Date().getFullYear()),
  month: String(new Date().getMonth() + 1).padStart(2, '0'),
  eventType: '직장 생활',
  title: '',
  memo: '',
  intensity: 3,
  emotion: '중립',
  mode: 'deep',
  moodLabel: '',
  energyLevel: 3,
  keywords: [],
};

// 연도 옵션
export const YEAR_OPTIONS = (() => {
  const cur = new Date().getFullYear();
  const years = [];
  for (let y = cur; y >= 2000; y--) years.push(String(y));
  return years;
})();

// ─── 초기 샘플 데이터 ────────────────────────────────────
export const DIARY_INITIAL_EVENTS = [
  {
    id: 1, date: '2025-01', eventType: '고민/방황',
    title: '새해부터 밀려오는 원인 모를 불안감',
    memo: '특별한 사건 없이도 연초부터 기존 삶의 방식에 회의가 들고, 뭔가 바꿔야 할 것 같은 충동이 강해짐',
    intensity: 3, emotion: '부정', analyzed: true,
    analysis: generateDiaryAnalysis('고민/방황', '2025', '01', 3, '부정')
  },
  {
    id: 2, date: '2024-09', eventType: '직장 생활',
    title: '팀 개편으로 갑작스러운 업무 변경',
    memo: '사전 협의 없이 팀이 개편되면서 담당 프로젝트가 바뀜. 역할 중복으로 긴장감이 올라가고 업무 과부하 발생',
    intensity: 4, emotion: '부정', analyzed: true,
    relatedPeople: [{ id: 'c3', name: '박준영' }, { id: 'c4', name: '이민지' }],
    analysis: generateDiaryAnalysis('직장 생활', '2024', '09', 4, '부정')
  },
  {
    id: 3, date: '2024-03', eventType: '취미/여행',
    title: '5년 만에 대학 동기와 우연히 재회',
    memo: '완전히 연락이 끊겼던 친구를 카페에서 우연히 만남. 서로 비슷한 관심사를 공유하고, 함께 사이드 프로젝트를 시작하기로 함',
    intensity: 3, emotion: '긍정', analyzed: true,
    relatedPeople: [{ id: 'c6', name: '강지윤' }],
    analysis: generateDiaryAnalysis('취미/여행', '2024', '03', 3, '긍정')
  },
  {
    id: 4, date: '2023-11', eventType: '다툼/이별',
    title: '친구 모임에서 감정 폭발',
    memo: '모임에서 사소한 의견 차이로 크게 다툼. 평소 쌓인 불만이 한꺼번에 터지면서 분위기가 완전히 깨졌고 한동안 어색한 관계가 됨',
    intensity: 4, emotion: '부정', analyzed: true,
    relatedPeople: [{ id: 'c10', name: '송재원' }],
    analysis: generateDiaryAnalysis('다툼/이별', '2023', '11', 4, '부정')
  },
  {
    id: 5, date: '2023-04', eventType: '다툼/이별',
    title: '2년 사귄 연인과 결별',
    memo: '감정 충돌이 반복되다가 결국 관계가 끝남. 서로 맞지 않는다는 걸 알면서도 놓지 못해 소모적인 시간이 길었음',
    intensity: 5, emotion: '부정', analyzed: true,
    analysis: generateDiaryAnalysis('다툼/이별', '2023', '04', 5, '부정')
  },
  {
    id: 6, date: '2022-11', eventType: '직장 생활',
    title: '번아웃으로 이직 고민 본격화',
    memo: '업무 압박과 인간관계 피로가 동시에 와서 퇴사 생각이 매일 들었음',
    intensity: 4, emotion: '부정', analyzed: true,
    relatedPeople: [{ id: 'c1', name: '조멀티' }],
    analysis: generateDiaryAnalysis('직장 생활', '2022', '11', 4, '부정')
  },
  {
    id: 7, date: '2022-05', eventType: '투자/사업',
    title: '지인 추천 투자에서 손실 발생',
    memo: '수익률이 좋다는 말에 큰 금액을 넣었는데 원금의 40%가 날아감. 계약 조건을 꼼꼼히 확인하지 않은 것이 후회됨',
    intensity: 4, emotion: '부정', analyzed: true,
    analysis: generateDiaryAnalysis('투자/사업', '2022', '05', 4, '부정')
  },
  {
    id: 8, date: '2021-06', eventType: '공부/시험',
    title: '정보처리기사 자격증 합격',
    memo: '6개월 준비 끝에 필기·실기 모두 한 번에 합격. 시험장에서 긴장했지만 집중력이 극대화되는 느낌이었음',
    intensity: 4, emotion: '긍정', analyzed: true,
    analysis: generateDiaryAnalysis('공부/시험', '2021', '06', 4, '긍정')
  },
  {
    id: 9, date: '2020-12', eventType: '손해/후회',
    title: '부모님 건강 문제로 가족 간 갈등 & 금전 손실',
    memo: '아버지 건강이 갑자기 나빠지면서 치료비와 간병 분담을 놓고 형제들 사이에 갈등이 생김. 예상치 못한 큰 비용 지출',
    intensity: 3, emotion: '부정', analyzed: true,
    relatedPeople: [{ id: 'c9', name: '오하나' }],
    analysis: generateDiaryAnalysis('손해/후회', '2020', '12', 3, '부정')
  },
  // ─── 빠른 기록 샘플 ─────────────────────
  {
    id: 10, date: '2026-03-14', eventType: '',
    title: '',
    memo: '러닝하고 나니 머리가 맑아졌다',
    mode: 'quick',
    moodLabel: '회복감',
    energyLevel: 4,
    keywords: ['휴식', '자기계발'],
    intensity: 2, emotion: '긍정',
    analyzed: false,
    relatedPeople: [{ id: 'c5', name: '최현우' }],
  },
  {
    id: 11, date: '2026-03-12', eventType: '',
    title: '',
    memo: '회의 끝나고 괜히 기분이 가라앉았다',
    mode: 'quick',
    moodLabel: '답답함',
    energyLevel: 2,
    keywords: ['직장 스트레스'],
    intensity: 3, emotion: '부정',
    analyzed: false,
    relatedPeople: [{ id: 'c3', name: '박준영' }, { id: 'c4', name: '이민지' }],
  },
  {
    id: 12, date: '2026-03-10', eventType: '',
    title: '',
    memo: '오랜만에 동네 친구들 만나서 수다 떨었다',
    mode: 'quick',
    moodLabel: '편안함',
    energyLevel: 4,
    keywords: ['우정', '좋은 소식'],
    intensity: 2, emotion: '긍정',
    analyzed: false,
    relatedPeople: [{ id: 'c2', name: '김서하' }, { id: 'c7', name: '윤소영' }],
  },
];

// ═══════════════════════════════════════════════════════════
// V1 유틸리티 — 스트릭, 일운, 히트맵, 감정 그래프, 십신 분포
// ═══════════════════════════════════════════════════════════

// ─── 감정 스케일 (0-5 이모지) ─────────────────────────────
export const EMOTION_SCALE = [
  { value: 0, emoji: '😢', label: '매우 나쁨', color: '#EF4444' },
  { value: 1, emoji: '😟', label: '나쁨', color: '#F97316' },
  { value: 2, emoji: '😐', label: '보통', color: '#EAB308' },
  { value: 3, emoji: '🙂', label: '괜찮음', color: '#84CC16' },
  { value: 4, emoji: '😊', label: '좋음', color: '#22C55E' },
  { value: 5, emoji: '🥰', label: '매우 좋음', color: '#10B981' },
];

// ─── 스트릭 배지 ─────────────────────────────────────────
export const STREAK_BADGES = [
  { days: 7, emoji: '🔥', label: '7일 연속', color: 'amber' },
  { days: 30, emoji: '🌟', label: '30일 연속', color: 'yellow' },
  { days: 100, emoji: '💎', label: '100일 연속', color: 'blue' },
  { days: 365, emoji: '🏆', label: '365일 연속', color: 'purple' },
];

// ─── 스트릭 계산 ─────────────────────────────────────────
export function computeStreak(events) {
  if (!events || events.length === 0) return { current: 0, longest: 0, lastDate: null, earnedBadges: [] };

  // 모든 기록 날짜를 일 단위로 추출 (YYYY-MM-DD 또는 YYYY-MM → 해당 월의 임의 날짜)
  const dateSet = new Set();
  events.forEach(ev => {
    if (!ev.date) return;
    if (ev.date.length === 10) {
      dateSet.add(ev.date); // YYYY-MM-DD
    } else if (ev.date.length === 7) {
      dateSet.add(`${ev.date}-15`); // YYYY-MM → 월 중간
    }
  });

  const sortedDates = [...dateSet].sort();
  if (sortedDates.length === 0) return { current: 0, longest: 0, lastDate: null, earnedBadges: [] };

  // 연속일 계산
  let current = 1;
  let longest = 1;
  let streak = 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  for (let i = sortedDates.length - 2; i >= 0; i--) {
    const curr = new Date(sortedDates[i + 1]);
    const prev = new Date(sortedDates[i]);
    const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak++;
      longest = Math.max(longest, streak);
    } else {
      streak = 1;
    }
  }

  // 현재 스트릭: 마지막 기록이 오늘 또는 어제여야 유효
  const lastDate = sortedDates[sortedDates.length - 1];
  if (lastDate === todayStr || lastDate === yesterdayStr) {
    // 마지막 날짜부터 역순으로 연속 세기
    current = 1;
    for (let i = sortedDates.length - 2; i >= 0; i--) {
      const curr = new Date(sortedDates[i + 1]);
      const prev = new Date(sortedDates[i]);
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) current++;
      else break;
    }
  } else {
    current = 0;
  }

  longest = Math.max(longest, current);

  const earnedBadges = STREAK_BADGES.filter(b => longest >= b.days);

  return { current, longest, lastDate, earnedBadges };
}

// ─── 오늘의 일운 (천간지지 시뮬레이션) ───────────────────
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const STEM_KR = { '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무', '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계' };
const BRANCH_KR = { '子': '자', '丑': '축', '寅': '인', '卯': '묘', '辰': '진', '巳': '사', '午': '오', '未': '미', '申': '신', '酉': '유', '戌': '술', '亥': '해' };
const STEM_ELEMENTS = { '甲': '목', '乙': '목', '丙': '화', '丁': '화', '戊': '토', '己': '토', '庚': '금', '辛': '금', '壬': '수', '癸': '수' };

const ILWUN_INTERACTIONS = [
  { type: '합', desc: '오늘은 좋은 인연이나 기회가 맺어질 수 있는 날이에요', effects: ['인간관계 호조', '계약/약속에 유리'] },
  { type: '충', desc: '갑작스러운 변화나 충돌에 주의하세요', effects: ['돌발 상황 가능', '이동/변동 주의'] },
  { type: '형', desc: '내면의 압박이나 스트레스가 쌓이기 쉬운 날이에요', effects: ['건강 관리 필요', '감정 조절 중요'] },
  { type: '없음', desc: '비교적 안정적인 하루가 예상돼요', effects: ['평온한 하루', '루틴 유지 추천'] },
];

export function getTodayIlwun(dateOverride) {
  const d = dateOverride ? new Date(dateOverride) : new Date();
  const baseDate = new Date(1900, 0, 1); // 甲子일
  const diffDays = Math.floor((d - baseDate) / (1000 * 60 * 60 * 24));

  const stemIdx = ((diffDays % 10) + 10) % 10;
  const branchIdx = ((diffDays % 12) + 12) % 12;

  const stem = HEAVENLY_STEMS[stemIdx];
  const branch = EARTHLY_BRANCHES[branchIdx];

  // 상호작용 결정 (해시 기반)
  const interactionIdx = (stemIdx + branchIdx + d.getMonth()) % ILWUN_INTERACTIONS.length;
  const interaction = ILWUN_INTERACTIONS[interactionIdx];

  const element = STEM_ELEMENTS[stem];
  const monthKey = String(d.getMonth() + 1).padStart(2, '0');
  const seasonal = SEASON_DYNAMICS[monthKey] || SEASON_DYNAMICS['01'];

  const elementHanja = element === '목' ? '木' : element === '화' ? '火' : element === '토' ? '土' : element === '금' ? '金' : '水';
  const pillar = `${STEM_KR[stem]}${BRANCH_KR[branch]}(${stem}${branch})`;
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dateLabel = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${dayNames[d.getDay()]})`;

  return {
    stem, branch,
    stemKr: STEM_KR[stem], branchKr: BRANCH_KR[branch],
    element,
    pillar,
    pillarText: pillar,
    dateLabel,
    interaction: {
      ...interaction,
      detail: interaction.effects ? interaction.effects.join(' / ') : null,
    },
    seasonal,
    summary: `오늘의 일운은 ${pillar}일. ${element}(${elementHanja}) 기운이 작용하는 날이에요.`
  };
}

// ─── 대운/세운/월운 매핑 (과거 사건 기록용) ──────────────
export function getFortuneMapping(year, month) {
  const y = parseInt(year);
  const m = parseInt(month);

  // 대운 (10년 단위)
  const daewunPeriod = Math.floor((y - 1990) / 10);
  const daewunStem = HEAVENLY_STEMS[((daewunPeriod * 3) % 10 + 10) % 10];
  const daewunBranch = EARTHLY_BRANCHES[((daewunPeriod * 5) % 12 + 12) % 12];

  // 세운 (연 단위)
  const sewunStem = HEAVENLY_STEMS[((y - 4) % 10 + 10) % 10];
  const sewunBranch = EARTHLY_BRANCHES[((y - 4) % 12 + 12) % 12];

  // 월운
  const wolwunStem = HEAVENLY_STEMS[((y * 12 + m) % 10 + 10) % 10];
  const wolwunBranch = EARTHLY_BRANCHES[((m - 1 + 2) % 12 + 12) % 12];

  const makeLabel = (s, b) => `${STEM_KR[s]}${BRANCH_KR[b]}(${s}${b})`;

  // 영향력 위계: 대운 > 세운 > 월운 (별 개수로 표시)
  return {
    daewun: { stem: daewunStem, branch: daewunBranch, label: makeLabel(daewunStem, daewunBranch), stars: 3, name: '대운' },
    sewun: { stem: sewunStem, branch: sewunBranch, label: makeLabel(sewunStem, sewunBranch), stars: 2, name: '세운' },
    wolwun: { stem: wolwunStem, branch: wolwunBranch, label: makeLabel(wolwunStem, wolwunBranch), stars: 1, name: '월운' },
  };
}

// ─── 캘린더 히트맵 데이터 ─────────────────────────────────
export function getCalendarHeatmapData(events, year, month) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const result = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    const dayEvents = events.filter(ev =>
      ev.date === dateStr || (ev.date === monthStr && day === 15) // 월 단위 기록은 15일에 매핑
    );

    let score = 0;
    let hasEntry = dayEvents.length > 0;
    if (hasEntry) {
      const emotionScores = dayEvents.map(ev => ev.emotion === '긍정' ? 2 : ev.emotion === '부정' ? -1 : 0.5);
      score = emotionScores.reduce((a, b) => a + b, 0) / emotionScores.length;
    }

    result.push({ date: dateStr, day, score, hasEntry, eventCount: dayEvents.length });
  }

  return result;
}

// ─── 감정 그래프 데이터 ───────────────────────────────────
export function getEmotionGraphData(events, period = 'weekly') {
  const now = new Date();
  let labels = [];
  let ranges = [];

  if (period === 'weekly') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      labels.push(dayNames[d.getDay()]);
      ranges.push(dateStr);
    }
  } else {
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(`${d.getMonth() + 1}월`);
      ranges.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
  }

  const data = ranges.map((range, idx) => {
    const matchEvents = events.filter(ev => {
      if (period === 'weekly') return ev.date === range;
      return ev.date.startsWith(range);
    });

    const pos = matchEvents.filter(e => e.emotion === '긍정').length;
    const neg = matchEvents.filter(e => e.emotion === '부정').length;
    const neu = matchEvents.filter(e => e.emotion === '중립').length;
    const total = matchEvents.length;

    // 합충형파해 effect dots
    const effects = {};
    matchEvents.forEach(ev => {
      (ev.analysis?.triggeredEffects || []).forEach(e => {
        effects[e] = (effects[e] || 0) + 1;
      });
    });

    return { label: labels[idx], positive: pos, negative: neg, neutral: neu, total, effects };
  });

  return data;
}

// ─── 십신별 이벤트 분포 ───────────────────────────────────
export function getSipsinDistribution(events) {
  const counts = {};
  const analyzed = events.filter(ev => ev.analyzed && ev.analysis?.sipsin);

  analyzed.forEach(ev => {
    const name = ev.analysis.sipsin.name;
    counts[name] = (counts[name] || 0) + 1;
  });

  const total = analyzed.length || 1;
  return Object.entries(counts)
    .map(([type, count]) => ({
      type,
      count,
      pct: Math.round((count / total) * 100),
      hanja: Object.values(DIARY_SIPSIN_MAP).find(s => s.sipsin === type)?.hanja || ''
    }))
    .sort((a, b) => b.count - a.count);
}

// ─── 일일 다이어리 폼 초기값 ─────────────────────────────
export const DIARY_DAILY_FORM = {
  date: new Date().toISOString().slice(0, 10),
  emotionScore: 3,       // 0-5
  intensity: 3,          // 0-5
  eventTypes: [],        // 십신 기반 다중선택
  memo: '',              // 300자
};

// ─── 과거 사건 기록 폼 초기값 ────────────────────────────
export const DIARY_LIFE_EVENT_FORM = {
  year: String(new Date().getFullYear()),
  month: String(new Date().getMonth() + 1).padStart(2, '0'),
  eventType: '직장 생활',
  title: '',
  detail: '',
  emotionRecall: '중립', // 긍정/부정/중립
  impact: 3,             // 1-5
};
