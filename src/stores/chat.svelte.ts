import type { ChatMessage, AIConfig } from '../types';
import { BUILTIN_PROVIDERS } from '../utils/ai';

let messages = $state<ChatMessage[]>([]);
let loading = $state(false);
let config = $state<AIConfig>({
  provider: 'deepseek',
  apiKey: '',
  model: 'deepseek-chat',
});

let _initDone = false;

const COMPROMISED_KEYS = ['sk-f4650a5f17dc4678bd1ab61d05a881fe'];

export function initChat(data: { messages?: ChatMessage[]; config?: AIConfig } | undefined): void {
  if (!data || _initDone) return;
  if (data.messages) messages = data.messages;
  if (data.config) {
    const c = { ...data.config };
    // 过滤已泄露的 key，旧版本可能将硬编码 key 持久化到了 localStorage
    if (c.apiKey && COMPROMISED_KEYS.includes(c.apiKey)) c.apiKey = '';
    config = { ...config, ...c };
  }
  _initDone = true;
}

export function getChatMessages(): ChatMessage[] {
  return messages;
}

export function getChatConfig(): AIConfig {
  return { ...config };
}

export function isChatLoading(): boolean {
  return loading;
}

export function setAIConfig(c: Partial<AIConfig>): void {
  config = { ...config, ...c };
}

export function getCurrentProvider() {
  return BUILTIN_PROVIDERS.find(p => p.id === config.provider) || BUILTIN_PROVIDERS[0];
}

export async function sendMessage(text: string, chatCompletion: (messages: ChatMessage[], config: AIConfig) => Promise<string>): Promise<void> {
  const userMsg: ChatMessage = { role: 'user', text: text.trim(), time: Date.now() };
  messages = [...messages, userMsg];
  loading = true;

  try {
    const result = await chatCompletion(messages, config);
    const assistantMsg: ChatMessage = { role: 'assistant', text: result.trim(), time: Date.now() };
    messages = [...messages, assistantMsg];
  } catch (e: any) {
    const errMsg: ChatMessage = { role: 'assistant', text: `错误: ${e.message}`, time: Date.now() };
    messages = [...messages, errMsg];
  } finally {
    loading = false;
  }
}

export function clearChat(): void {
  messages = [];
}
