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

export const BUILTIN_PROVIDERS: AIProvider[] = [
  {
    id: 'deepseek', name: 'DeepSeek', nameEn: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/chat/completions',
    models: [
      { label: 'DeepSeek (最新版)', value: 'deepseek-chat' },
      { label: 'DeepSeek V3', value: 'deepseek-chat-v3' },
      { label: 'DeepSeek R1', value: 'deepseek-reasoner' },
    ],
    defaultModel: 'deepseek-chat',
    needKey: true,
  },
  {
    id: 'openai', name: 'OpenAI', nameEn: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    models: [
      { label: 'GPT-4o', value: 'gpt-4o' },
      { label: 'GPT-4o Mini', value: 'gpt-4o-mini' },
      { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
      { label: 'GPT-4', value: 'gpt-4' },
      { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
    ],
    defaultModel: 'gpt-4o-mini',
    needKey: true,
  },
  {
    id: 'qwen', name: '通义千问', nameEn: 'Qwen',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    models: [
      { label: '通义千问 Turbo', value: 'qwen-turbo' },
      { label: '通义千问 Plus', value: 'qwen-plus' },
      { label: '通义千问 Max', value: 'qwen-max' },
      { label: '通义千问 Long', value: 'qwen-long' },
    ],
    defaultModel: 'qwen-turbo',
    needKey: true,
  },
  {
    id: 'moonshot', name: '月之暗面 Kimi', nameEn: 'Moonshot Kimi',
    baseUrl: 'https://api.moonshot.cn/v1/chat/completions',
    models: [
      { label: 'Kimi K2', value: 'moonshot-v1-8k' },
      { label: 'Kimi K2 32K', value: 'moonshot-v1-32k' },
      { label: 'Kimi K2 128K', value: 'moonshot-v1-128k' },
    ],
    defaultModel: 'moonshot-v1-8k',
    needKey: true,
  },
  {
    id: 'zhipu', name: '智谱 GLM', nameEn: 'Zhipu GLM',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    models: [
      { label: 'GLM-4-Flash', value: 'glm-4-flash' },
      { label: 'GLM-4-Plus', value: 'glm-4-plus' },
      { label: 'GLM-4-0520', value: 'glm-4-0520' },
    ],
    defaultModel: 'glm-4-flash',
    needKey: true,
  },
  {
    id: 'baidu', name: '文心一言', nameEn: 'ERNIE Bot',
    baseUrl: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions_pro',
    models: [
      { label: 'ERNIE 4.0', value: 'ernie-4.0' },
      { label: 'ERNIE 3.5', value: 'ernie-3.5' },
      { label: 'ERNIE Speed', value: 'ernie-speed' },
    ],
    defaultModel: 'ernie-speed',
    needKey: true,
  },
  {
    id: 'ollama', name: 'Ollama 本地', nameEn: 'Ollama (Local)',
    baseUrl: 'http://localhost:11434/api/chat',
    models: [
      { label: 'Llama 3 (默认)', value: 'llama3' },
      { label: 'Llama 3.1', value: 'llama3.1' },
      { label: 'Qwen 2.5', value: 'qwen2.5' },
      { label: 'DeepSeek R1 (本地)', value: 'deepseek-r1:7b' },
      { label: 'Mistral', value: 'mistral' },
      { label: 'Phi-3', value: 'phi3' },
      { label: '自定义', value: 'custom' },
    ],
    defaultModel: 'llama3',
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
