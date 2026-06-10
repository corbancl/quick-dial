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
  /** 无用户 API Key 时的代理地址（同源路径或完整 URL），Key 由服务端持有不泄露 */
  proxyUrl?: string;
}

export const CUSTOM_MODEL_VALUE = '__custom__';
export const CUSTOM_MODEL_LABEL = '自定义 / Custom';

export const BUILTIN_PROVIDERS: AIProvider[] = [
  {
    id: 'deepseek', name: 'DeepSeek (默认)', nameEn: 'DeepSeek (Default)',
    baseUrl: 'https://api.deepseek.com/chat/completions',
    models: [
      { label: 'DeepSeek V3 (最新)', value: 'deepseek-chat' },
      { label: 'DeepSeek R1', value: 'deepseek-reasoner' },
      { label: CUSTOM_MODEL_LABEL, value: CUSTOM_MODEL_VALUE },
    ],
    defaultModel: 'deepseek-chat',
    needKey: false,
    proxyUrl: '/api/ai-proxy',
  },
  {
    id: 'deepseek-custom', name: 'DeepSeek (自填Key)', nameEn: 'DeepSeek (BYOK)',
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
    id: 'anthropic', name: 'Anthropic Claude', nameEn: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1/messages',
    models: [
      { label: 'Claude 4 Sonnet (最新)', value: 'claude-sonnet-4-20250514' },
      { label: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet-20241022' },
      { label: 'Claude 3 Opus', value: 'claude-3-opus-20240229' },
      { label: 'Claude 3 Haiku', value: 'claude-3-haiku-20240307' },
      { label: CUSTOM_MODEL_LABEL, value: CUSTOM_MODEL_VALUE },
    ],
    defaultModel: 'claude-sonnet-4-20250514',
    needKey: true,
  },
  {
    id: 'mistral', name: 'Mistral AI', nameEn: 'Mistral AI',
    baseUrl: 'https://api.mistral.ai/v1/chat/completions',
    models: [
      { label: 'Mistral Large (最新)', value: 'mistral-large-latest' },
      { label: 'Mistral Small', value: 'mistral-small-latest' },
      { label: 'Pixtral Large', value: 'pixtral-large-latest' },
      { label: 'Codestral', value: 'codestral-latest' },
      { label: 'Open Mistral Nemo', value: 'open-mistral-nemo' },
      { label: CUSTOM_MODEL_LABEL, value: CUSTOM_MODEL_VALUE },
    ],
    defaultModel: 'mistral-large-latest',
    needKey: true,
  },
  {
    id: 'groq', name: 'Groq', nameEn: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
    models: [
      { label: 'Llama 3.3 70B (最新)', value: 'llama-3.3-70b-versatile' },
      { label: 'Llama 3.1 8B', value: 'llama-3.1-8b-instant' },
      { label: 'Mixtral 8x7B', value: 'mixtral-8x7b-32768' },
      { label: 'Gemma 2 9B', value: 'gemma2-9b-it' },
      { label: 'Qwen QwQ 32B', value: 'qwen-qwq-32b' },
      { label: CUSTOM_MODEL_LABEL, value: CUSTOM_MODEL_VALUE },
    ],
    defaultModel: 'llama-3.3-70b-versatile',
    needKey: true,
  },
  {
    id: 'hunyuan', name: '腾讯混元', nameEn: 'Hunyuan',
    baseUrl: 'https://api.hunyuan.cloud.tencent.com/v1/chat/completions',
    models: [
      { label: 'Hunyuan-Turbos (最新)', value: 'hunyuan-turbos-latest' },
      { label: 'Hunyuan-Lite', value: 'hunyuan-lite' },
      { label: 'Hunyuan-Standard', value: 'hunyuan-standard-256k' },
      { label: 'Hunyuan-Pro', value: 'hunyuan-pro' },
      { label: CUSTOM_MODEL_LABEL, value: CUSTOM_MODEL_VALUE },
    ],
    defaultModel: 'hunyuan-turbos-latest',
    needKey: true,
  },
  {
    id: 'volc', name: '火山引擎(豆包)', nameEn: 'Volcengine / Doubao',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    models: [
      { label: 'Doubao-1.5-Pro (最新)', value: 'doubao-1-5-pro-256k' },
      { label: 'Doubao-1.5-Lite', value: 'doubao-1-5-lite-32k' },
      { label: 'DeepSeek-R1 (火山)', value: 'deepseek-r1-250120' },
      { label: 'DeepSeek-V3 (火山)', value: 'deepseek-v3-241226' },
      { label: CUSTOM_MODEL_LABEL, value: CUSTOM_MODEL_VALUE },
    ],
    defaultModel: 'doubao-1-5-pro-256k',
    needKey: true,
  },
  {
    id: 'siliconflow', name: '硅基流动', nameEn: 'SiliconFlow',
    baseUrl: 'https://api.siliconflow.cn/v1/chat/completions',
    models: [
      { label: 'DeepSeek-V3 (最新)', value: 'deepseek-ai/DeepSeek-V3' },
      { label: 'DeepSeek-R1', value: 'deepseek-ai/DeepSeek-R1' },
      { label: 'Qwen2.5-72B', value: 'Qwen/Qwen2.5-72B-Instruct' },
      { label: 'Qwen2.5-32B', value: 'Qwen/Qwen2.5-32B-Instruct' },
      { label: 'Llama-3.3-70B', value: 'meta-llama/Llama-3.3-70B-Instruct' },
      { label: CUSTOM_MODEL_LABEL, value: CUSTOM_MODEL_VALUE },
    ],
    defaultModel: 'deepseek-ai/DeepSeek-V3',
    needKey: true,
  },
  {
    id: 'together', name: 'Together AI', nameEn: 'Together AI',
    baseUrl: 'https://api.together.xyz/v1/chat/completions',
    models: [
      { label: 'Llama 3.3 70B (最新)', value: 'meta-llama/Llama-3.3-70B-Instruct-Turbo' },
      { label: 'DeepSeek-V3', value: 'deepseek-ai/DeepSeek-V3' },
      { label: 'Qwen2.5-72B', value: 'Qwen/Qwen2.5-72B-Instruct-Turbo' },
      { label: 'Mixtral 8x7B', value: 'mistralai/Mixtral-8x7B-Instruct-v0.1' },
      { label: CUSTOM_MODEL_LABEL, value: CUSTOM_MODEL_VALUE },
    ],
    defaultModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
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

  // Anthropic uses Messages API (different format)
  if (config.provider === 'anthropic') {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    };
    const body = {
      model,
      max_tokens: 8192,
      messages: messages.map(m => ({ role: m.role, content: m.text })),
    };
    const res = await fetch(provider.baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(`Anthropic error ${res.status}: ${err.slice(0, 200)}`);
    }
    const data = await res.json();
    return data.content?.[0]?.text || '';
  }

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
  // needKey=false + proxyUrl → 强制走代理（Key 由服务端持有，不泄露）
  const hasProxy = provider.proxyUrl && (!config.apiKey || !provider.needKey);
  const apiUrl = hasProxy ? provider.proxyUrl! : provider.baseUrl;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (config.apiKey) headers['Authorization'] = `Bearer ${config.apiKey}`;

  const body = {
    model,
    messages: messages.map(m => ({ role: m.role, content: m.text })),
    stream: false,
  };

  const res = await fetch(apiUrl, {
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
