// 公開先と、言語ごとのページ・サムネイルの文言。build.mjs と og-image.mjs が使う。
// 題名は index.html の I18N[..].ui.title と同じにしておく。
export const SITE_URL = 'https://yandod.github.io/learn-agentic/';

export const LANGS = {
  ja: {
    dir: '', ogLocale: 'ja_JP',
    title: 'エージェントが質問に答えるまで',
    description: '答えるだけのAIから、道具を使うAI、そしてエージェントへ。計画・点検・実行・確認の流れを、4つの段階で一歩ずつ動かして見るデモです。',
    imageAlt: '「エージェントが質問に答えるまで」。Planner、Executor、Tools、Evaluator、Finish が矢印でつながった図と、4つの段階。',
    // サムネイルの中の文言
    tagline: '計画して、道具を使い、結果を確かめる。\nエージェントのしくみを一歩ずつ動かして見るデモ',
    nodes: { query: '質問', planner: '計画役', executor: '実行役', tools: '道具', evaluator: '評価役', finish: '完了' },
    retry: '差し戻し',
    stageNo: n => `段階 ${n}`,
    stages: ['答えるだけのAI', '道具を使うAI', 'エージェント', '画面の道具をつなぐ'],
  },
  en: {
    dir: 'en/', ogLocale: 'en_US',
    title: 'How an Agent Answers a Question',
    description: 'From an AI that only answers, to an AI that uses tools, to an agent. Step through four stages and watch an agent plan, run tools, and check its own work.',
    imageAlt: '“How an Agent Answers a Question”: a diagram linking Planner, Executor, Tools, Evaluator, and Finish, with the four stages of the demo.',
    tagline: 'Plan, use tools, check the results.\nStep through how an agent works, one move at a time',
    nodes: {},
    retry: 'retry',
    stageNo: n => `Stage ${n}`,
    stages: ['Answer-only AI', 'Tool-using AI', 'Agent', 'On-screen tools'],
  },
  ko: {
    dir: 'ko/', ogLocale: 'ko_KR',
    title: '에이전트가 질문에 답하기까지',
    description: '답하기만 하는 AI에서 도구를 쓰는 AI, 그리고 에이전트로. 계획·점검·실행·확인의 흐름을 네 단계로 한 걸음씩 움직이며 보는 데모입니다.',
    imageAlt: '“에이전트가 질문에 답하기까지”. Planner, Executor, Tools, Evaluator, Finish가 화살표로 연결된 그림과 네 단계.',
    tagline: '계획하고, 도구를 쓰고, 결과를 확인한다.\n에이전트의 구조를 한 걸음씩 움직이며 보는 데모',
    nodes: { query: '질문', planner: '계획 담당', executor: '실행 담당', tools: '도구', evaluator: '평가 담당', finish: '완료' },
    retry: '되돌리기',
    stageNo: n => `${n}단계`,
    stages: ['답하기만 하는 AI', '도구를 쓰는 AI', '에이전트', '화면의 도구 연결'],
  },
};

export const pageUrl = lang => SITE_URL + LANGS[lang].dir;
export const imageUrl = lang => `${SITE_URL}og/${lang}.png`;
