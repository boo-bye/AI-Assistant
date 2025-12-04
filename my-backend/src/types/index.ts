/**
 * 类型定义文件
 * 定义整个应用的数据结构和接口
 */

/**
 * API 请求体
 */
export interface AskRequest {
  question: string;
  context?: string;
}

/**
 * 操作建议（可交互式反馈）
 */
export interface ActionSuggestion {
  id: string;
  label: string;
  action: 'generateSrcset' | 'viewOptimization' | 'checkAccessibility' | 'analyzeMore';
  params?: Record<string, any>;
}

/**
 * API 响应体
 */
export interface AskResponse {
  answer: string;
  context?: string;
  suggestions?: ActionSuggestion[];
}

/**
 * 错误响应
 */
export interface ErrorResponse {
  error: string;
  details?: string;
}

/**
 * 硅基流动 API 响应
 */
export interface SiliconFlowResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * LLM 消息格式
 */
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Tool 工具的返回类型
 */
export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * 网络请求信息
 */
export interface NetworkRequest {
  url: string;
  method: string;
  status: number;
  size: number;
  time: number;
  type: string;
  cached: boolean;
}

/**
 * HAR 格式（通用网络请求格式）
 */
export interface HAREntry {
  request: {
    method: string;
    url: string;
  };
  response: {
    status: number;
    content: {
      size: number;
    };
  };
  timings: {
    wait: number;
    receive: number;
  };
  cache: any;
}