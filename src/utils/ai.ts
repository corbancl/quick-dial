import type { ChatMessage } from '../types';

// ====== 内置 AI 提供商配置 ======
export interface AIProvider {
  id: string;
  name: string;
  nameEn: string;
  baseUrl: string;
  model: string;
  needKey: boolean;
}

export const BUILTIN_PROVIDERS: AIProvider[] = [
  { id: 'deepseek', name: 'DeepSeek', nameEn: 'DeepSeek', baseUrl: 'https://api.deepseek.com/chat/completions', model: 'deepseek-chat', needKey: true },
  { id: 'qwen', name: '通义千问', nameEn: 'Qwen', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', model: 'qwen-turbo', needKey: true },
  { id: 'ollama', name: 'Ollama 本地', nameEn: 'Ollama (Local)', baseUrl: 'http://localhost:11434/api/chat', model: 'llama3', needKey: false },
];

export interface AIConfig {
  provider: string;
  apiKey: string;
  model: string;
}

// ====== 调用 AI API ======
export async function chatCompletion(messages: ChatMessage[], config: AIConfig): Promise<string> {
  const provider = BUILTIN_PROVIDERS.find(p => p.id === config.provider) || BUILTIN_PROVIDERS[0];

  if (config.provider === 'ollama') {
    const res = await fetch(provider.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model || provider.model,
        messages: messages.map(m => ({ role: m.role, content: m.text })),
        stream: false,
      }),
    });
    if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
    const data = await res.json();
    return data.message?.content || '';
  }

  // DeepSeek / Qwen (OpenAI-compatible)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (config.apiKey) headers['Authorization'] = `Bearer ${config.apiKey}`;

  const body = {
    model: config.model || provider.model,
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
