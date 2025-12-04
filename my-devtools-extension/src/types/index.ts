/**
 * 前端类型定义
 */

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  suggestions?: ActionSuggestion[];
}

export interface ActionSuggestion {
  id: string;
  label: string;
  action: string;
  params?: Record<string, any>;
}

export interface AppState {
  messages: Message[];
  loading: boolean;
  error: string | null;
}

export interface AIResponse {
  answer: string;
  context?: string;
}