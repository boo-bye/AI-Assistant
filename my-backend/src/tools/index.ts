/**
 * Agent 工具模块
 * 定义 AI Agent 可以调用的各种工具
 */

import { ToolResult } from '../types/index';

/**
 * 工具枚举
 */
export enum ToolType {
  NONE = 'none',
  GET_DOM = 'getDOM',
  GET_STYLES = 'getStyles',
  GET_PAGE_INFO = 'getPageInfo',
  GET_IMAGES = 'getImages',
  GET_NETWORK = 'getNetwork'
}

/**
 * 根据问题内容检测需要调用哪个工具
 * @param question - 用户的问题
 * @returns 工具类型
 */
export function detectTool(question: string): ToolType {
  const lowerQuestion = question.toLowerCase();

  // DOM 相关
  if (lowerQuestion.match(/dom|html|结构|标签|元素|语义|h\d|div|span|semantic/i)) {
    return ToolType.GET_DOM;
  }

  // 样式相关
  if (lowerQuestion.match(/css|样式|颜色|字体|大小|间距|padding|margin|font|color|width|height/i)) {
    return ToolType.GET_STYLES;
  }

  // 页面信息相关
  if (lowerQuestion.match(/页面|标题|链接|表单|可访问性|无障碍|accessibility|a11y|form|input/i)) {
    return ToolType.GET_PAGE_INFO;
  }

  // 图片相关
  if (lowerQuestion.match(/图片|image|img|picture|photo|src|alt/i)) {
    return ToolType.GET_IMAGES;
  }

  // 网络相关
  if (lowerQuestion.match(/网络|请求|加载|慢|性能|资源|resource|network|request|speed|slow|performance/i)) {
    return ToolType.GET_NETWORK;
  }

  return ToolType.NONE;
}

/**
 * 获取工具的描述信息
 */
export function getToolDescription(tool: ToolType): string {
  const descriptions: Record<ToolType, string> = {
    [ToolType.NONE]: '无需调用工具，直接回答',
    [ToolType.GET_DOM]: '获取页面 DOM 结构',
    [ToolType.GET_STYLES]: '获取页面样式信息',
    [ToolType.GET_PAGE_INFO]: '获取页面元素统计',
    [ToolType.GET_IMAGES]: '获取页面图片列表',
    [ToolType.GET_NETWORK]: '获取网络请求分析'
  };

  return descriptions[tool];
}

/**
 * 工具结果类型
 */
export interface ToolExecutionResult extends ToolResult {
  toolType: ToolType;
  toolDescription: string;
}