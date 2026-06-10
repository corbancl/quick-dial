import type { ChatMessage } from '../types';

// ====== 内置 AI 提供商配置 ======
export interface AIModelOption {
  label: string;
  value: string;
}

export interface AIProvider {
  id: string;
  name: string;
  nameEn: string;
  baseUrl: string;
  models: AIModelOption[];
  defaultModel: string;
  needKey: boolean;
}

export const CUSTOM_MODEL_VALUE = '__custom__';
export const CUSTOM_MODEL_LABEL = '自定义 / Custom';

export const BUILTIN_PROVIDERS: AIProvider[] = [
  {
    baseUrl: 'https://api.deepseek.com/chat/completions',
    models: [
      { label: 'DeepSeek V3 (最新)', value: 'deepseek-chat' },
      { label: 'DeepSeek R1', value: 'deepseek-reasoner' },
      { label: CUSTOM_MODEL_LABEL, value: CUSTOM_MODEL_VALUE },
    ],
    defaultModel: 'deepseek-chat',
    needKey: true,
  },
  {
    id: 'openai', name: 'OpenAI', nameEn: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    models: [
      { label: 'GPT-4o (最新)', value: 'gpt-4o' },
      { label: 'GPT-4o Mini', value: 'gpt-4o-mini' },
      { label: 'o3-mini', value: 'o3-mini' },
      { label: 'o1', value: 'o1' },
      { label: 'GPT-4.1', value: 'gpt-4.1' },
      { label: 'GPT-4.1 Mini', value: 'gpt-4.1-mini' },
      { label: 'GPT-4.1 Nano', value: 'gpt-4.1-nano' },
      { label: CUSTOM_MODEL_LABEL, value: CUSTOM_MODEL_VALUE },
    ],
    defaultModel: 'gpt-4o-mini',
    needKey: true,
  },
  {
    id: 'qwen', name: '通义千问', nameEn: 'Qwen',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    models: [
      { label: 'Qwen-Max (最新)', value: 'qwen-max' },
      { label: 'Qwen-Plus', value: 'qwen-plus' },
      { label: 'Qwen-Turbo', value: 'qwen-turbo' },
      { label: 'Qwen-Long', value: 'qwen-long' },
      { label: 'Qwen2.5-72B', value: 'qwen2.5-72b-instruct' },
      { label: 'Qwen2.5-7B', value: 'qwen2.5-7b-instruct' },
      { label: CUSTOM_MODEL_LABEL, value: CUSTOM_MODEL_VALUE },
    ],
    defaultModel: 'qwen-turbo',
    needKey: true,
  },
  {
    id: 'moonshot', name: '月之暗面 Kimi', nameEn: 'Moonshot Kimi',
    baseUrl: 'https://api.moonshot.cn/v1/chat/completions',
    models: [
      { label: 'Kimi K2 (最新)', value: 'kimi-k2' },
      { label: 'Kimi K2 32K', value: 'moonshot-v1-32k' },
      { label: 'Kimi K2 128K', value: 'moonshot-v1-128k' },
      { label: CUSTOM_MODEL_LABEL, value: CUSTOM_MODEL_VALUE },
    ],
    defaultModel: 'kimi-k2',
    needKey: true,
  },
  {
    id: 'zhipu', name: '智谱 GLM', nameEn: 'Zhipu GLM',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    models: [
      { label: 'GLM-4-Plus (最新)', value: 'glm-4-plus' },
      { label: 'GLM-4-Flash', value: 'glm-4-flash' },
      { label: 'GLM-4-Air', value: 'glm-4-air' },
      { label: CUSTOM_MODEL_LABEL, value: CUSTOM_MODEL_VALUE },
    ],
    defaultModel: 'glm-4-plus',
    needKey: true,
  },
  {
    id: 'baidu', name: '文心一言', nameEn: 'ERNIE Bot',
    baseUrl: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions_pro',
    models: [
      { label: 'ERNIE 4.0 (最新)', value: 'completions_pro' },
      { label: 'ERNIE 3.5', value: 'completions' },
      { label: 'ERNIE Speed', value: 'ernie_speed' },
      { label: CUSTOM_MODEL_LABEL, value: CUSTOM_MODEL_VALUE },
    ],
    defaultModel: 'completions_pro',
    needKey: true,
  },
  {
    id: 'ollama', name: 'Ollama 本地', nameEn: 'Ollama (Local)',
    baseUrl: 'http://localhost:11434/api/chat',
    models: [
      { label: 'Llama 3.2 (最新)', value: 'llama3.2' },
      { label: 'Llama 3.1', value: 'llama3.1' },
      { label: 'Llama 3', value: 'llama3' },
      { label: 'Qwen 2.5', value: 'qwen2.5' },
      { label: 'DeepSeek R1', value: 'deepseek-r1:7b' },
      { label: 'Mistral', value: 'mistral' },
      { label: 'Phi-4', value: 'phi4' },
      { label: 'Phi-3', value: 'phi3' },
      { label: CUSTOM_MODEL_LABEL, value: CUSTOM_MODEL_VALUE },
    ],
    defaultModel: 'llama3.2',
    needKey: false,
  },
];

export interface AIConfig {
  provider: string;
  apiKey: string;
  model: string;
}

export function getProvider(id: string): AIProvider | undefined {
  return BUILTIN_PROVIDERS.find(p => p.id === id);
}

// ====== 调用 AI API ======
export async function chatCompletion(messages: ChatMessage[], config: AIConfig): Promise<string> {
  const provider = getProvider(config.provider);
  if (!provider) throw new Error(`Unknown provider: ${config.provider}`);

  const model = config.model || provider.defaultModel;

  if (config.provider === 'ollama') {
    const res = await fetch(provider.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: messages.map(m => ({ role: m.role, content: m.text })),
        stream: false,
      }),
    });
    if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
    const data = await res.json();
    return data.message?.content || '';
  }

  // OpenAI-compatible (DeepSeek, Qwen, Kimi, GLM, etc.)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (config.apiKey) headers['Authorization'] = `Bearer ${config.apiKey}`;

  const body = {
    model,
    messages: messages.map(m => ({ role: m.role, content: m.text })),
    stream: false,
  };

  const res = await fetch(provider.baseUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}
