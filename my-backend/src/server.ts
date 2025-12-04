/**
 * 后端服务器主文件
 * 使用 Express.js 搭建 AI 问答服务
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

import { AskRequest, AskResponse, ErrorResponse, LLMMessage, SiliconFlowResponse } from './types/index';
import { detectTool, ToolType, getToolDescription } from './tools/index';

// 加载环境变量
dotenv.config();

const app = express();

// ========== 中间件配置 ==========

app.use(cors());
app.use(express.json());

// 日志中间件
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ========== 初始化检查 ==========

console.log('='.repeat(50));
console.log('🚀 后端服务启动中...');
console.log('使用 LLM: 硅基流动 (DeepSeek API)');
console.log('语言: TypeScript + Node.js');
console.log('环境变量检查:');
console.log('  SILICONFLOW_API_KEY:', process.env.SILICONFLOW_API_KEY ? '✓ 已配置' : '✗ 未配置');
console.log('='.repeat(50));

// ========== 类型定义 ==========

interface AIRequestPayload {
  model: string;
  messages: LLMMessage[];
  max_tokens: number;
  temperature: number;
}

// ========== 辅助函数 ==========

/**
 * 生成系统 Prompt
 */
function generateSystemPrompt(): string {
  return `你是一个前端开发助手，帮助开发者分析网页问题、优化代码。

你的职责：
1. 分析用户提出的前端问题
2. 根据提供的页面信息（DOM、CSS、网络请求等）给出具体建议
3. 用简洁、友好的语言回答
4. 提供可操作的优化建议

如果用户提问与前端开发相关，请优先基于提供的页面信息进行分析。`;
}

/**
 * 调用硅基流动 API
 */
async function callSiliconFlowAPI(messages: LLMMessage[]): Promise<string> {
  const apiKey = process.env.SILICONFLOW_API_KEY;

  if (!apiKey) {
    throw new Error('SILICONFLOW_API_KEY 环境变量未配置');
  }

  const payload: AIRequestPayload = {
    model: 'deepseek-ai/DeepSeek-V3',
    messages,
    max_tokens: 1000,
    temperature: 0.7
  };

  console.log('📤 正在调用硅基流动 API...');

  try {
    const response = await axios.post<SiliconFlowResponse>(
      'https://api.siliconflow.cn/v1/chat/completions',
      payload,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log('✅ 成功获得回答');
    const answer = response.data.choices[0].message.content;
    return answer;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ API 调用失败');
      console.error('状态码:', error.response?.status);
      console.error('错误信息:', error.response?.data);

      if (error.response?.status === 401) {
        throw new Error('API Key 无效或已过期，请检查 .env 文件中的 SILICONFLOW_API_KEY');
      } else if (error.response?.status === 429) {
        throw new Error('API 调用太频繁或额度不足，请稍后再试');
      } else if (error.response?.status === 500) {
        throw new Error('硅基流动服务器错误，请稍后再试');
      }
    }

    throw error;
  }
}

/**
 * 执行多步推理
 */
async function executeMultiStepReasoning(question: string): Promise<string> {
  console.log('🧠 开始多步推理...');

  const lowerQuestion = question.toLowerCase();
  let context = '';

  // 场景1: 性能瓶颈分析
  if (lowerQuestion.match(/为什么|原因|瓶颈|为啥|slow|why|bottleneck/i)) {
    console.log('📊 检测到性能分析问题，准备多步推理...');
    console.log('  Step 1: 获取网络请求信息');
    console.log('  Step 2: 获取 DOM 结构信息');
    console.log('  Step 3: 分析关键渲染路径');
    
    context = `
【多步分析过程】
1. 首先分析网络请求，找出加载时间最长的资源
2. 然后检查 DOM 结构，看是否有阻塞性脚本
3. 最后综合分析，判断是否为关键渲染路径阻塞

建议分析内容：
- 最耗时的资源类型（JS/CSS/图片）
- 是否有同步脚本阻塞页面加载
- 是否可以延迟加载非关键资源
`;
  }

  // 场景2: 大小和性能优化
  if (lowerQuestion.match(/优化|提升|改进|加快|speed.*up|improve|optimize/i)) {
    console.log('⚡ 检测到优化问题，准备多步推理...');
    
    context = `
【多步优化分析】
1. 分析代码体积
   - 检查最大的资源文件
   - 是否需要代码分割
   
2. 分析网络瓶颈
   - 识别最慢的请求
   - 考虑 CDN 缓存
   
3. 分析 DOM 结构
   - 检查不必要的 DOM 节点
   - 优化 CSS 选择器

4. 提供具体建议
   - 懒加载图片
   - 压缩资源
   - 启用缓存策略
`;
  }

  // 场景3: 可访问性检查
  if (lowerQuestion.match(/无障碍|accessibility|a11y|barrier|inclusive/i)) {
    console.log('♿ 检测到无障碍性检查，准备多步推理...');
    
    context = `
【多步无障碍性分析】
1. 检查 HTML 语义化
   - 使用了合适的标签吗？
   - 标题结构是否正确？

2. 检查交互元素
   - 所有按钮都可以被聚焦吗？
   - 表单标签是否关联？

3. 检查视觉元素
   - 颜色对比度是否足够？
   - 是否提供了替代文本（alt）？

4. 检查动画和动态内容
   - 是否尊重 prefers-reduced-motion？
   - 是否有动画陷阱？
`;
  }

  return context;
}

/**
 * 根据问题类型生成可交互式操作建议
 */
function generateActionSuggestions(question: string, tool: ToolType): any[] {
  const suggestions = [];
  const lowerQuestion = question.toLowerCase();

  // 网络/性能相关 - 提供优化查看按钮
  if (tool === ToolType.GET_NETWORK) {
    suggestions.push({
      id: 'view-optimization',
      label: '📊 查看详细优化方案',
      action: 'viewOptimization',
      params: { type: 'network' }
    });
  }

  // 图片相关 - 提供 srcset 生成建议
  if (tool === ToolType.GET_IMAGES || lowerQuestion.match(/图片|image|img|大小|size/i)) {
    suggestions.push({
      id: 'generate-srcset',
      label: '🖼️ 生成响应式图片方案',
      action: 'generateSrcset',
      params: {}
    });
  }

  // 无障碍性 - 提供详细检查
  if (lowerQuestion.match(/无障碍|accessibility|a11y/i)) {
    suggestions.push({
      id: 'check-accessibility',
      label: '♿ 详细无障碍性检查',
      action: 'checkAccessibility',
      params: {}
    });
  }

  // 优化相关 - 提供进一步分析
  if (lowerQuestion.match(/优化|improve|optimize/i)) {
    suggestions.push({
      id: 'analyze-more',
      label: '🔍 深度性能分析',
      action: 'analyzeMore',
      params: { type: 'performance' }
    });
  }

  return suggestions;
}

// ========== API 路由 ==========

/**
 * 健康检查端点
 */
app.get('/api/test', (req: Request, res: Response) => {
  console.log('📍 收到 /api/test 请求');
  res.json({
    message: '后端服务正常工作！',
    llm: '硅基流动 (DeepSeek)',
    timestamp: new Date().toISOString(),
    language: 'TypeScript',
    features: ['DOM分析', 'CSS检查', '网络分析', '多步推理', '可交互反馈']
  });
});

/**
 * 主要的 AI 问答端点
 */
app.post('/api/ask', async (req: Request<unknown, unknown, AskRequest>, res: Response<AskResponse | ErrorResponse>): Promise<void> => {
  console.log('\n' + '='.repeat(50));
  console.log('📨 收到新问题');

  const { question, context } = req.body;

  // 参数验证
  if (!question || typeof question !== 'string') {
    console.log('❌ 参数验证失败：问题为空或格式错误');
    res.status(400).json({ error: '问题不能为空' });
    return;
  }

  try {
    console.log('问题内容:', question);

    // Step 1: 检测需要的工具
    const detectedTool = detectTool(question);
    console.log('🔧 检测到工具:', getToolDescription(detectedTool));

    // Step 2: 检查是否需要多步推理
    let multiStepContext = '';
    if (detectedTool === ToolType.NONE || question.match(/为什么|原因|优化|无障碍/i)) {
      multiStepContext = await executeMultiStepReasoning(question);
      console.log('🧠 多步推理已启动');
    }

    // Step 3: 构建消息
    let userMessage = question;
    if (context && context.trim()) {
      userMessage = `${question}\n\n【页面信息】\n${context}`;
    }
    if (multiStepContext) {
      userMessage += `\n\n【推理过程】\n${multiStepContext}`;
    }

    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: generateSystemPrompt()
      },
      {
        role: 'user',
        content: userMessage
      }
    ];

    // Step 4: 调用 AI
    const answer = await callSiliconFlowAPI(messages);

    console.log('✓ 回答已生成，长度:', answer.length, '字符');
    console.log('='.repeat(50) + '\n');

    // Step 5: 生成操作建议
    const suggestions = generateActionSuggestions(question, detectedTool);

    // Step 6: 返回结果
    res.json({
      answer,
      context: context ? '页面上下文已处理' : '无页面上下文',
      suggestions
    });

  } catch (error) {
    console.log('\n❌ 发生错误');
    console.error('错误:', error instanceof Error ? error.message : String(error));
    console.log('='.repeat(50) + '\n');

    const errorMessage = error instanceof Error ? error.message : '未知错误';
    res.status(500).json({
      error: '服务器错误',
      details: errorMessage
    });
  }
});

// ========== 错误处理中间件 ==========

app.use((err: Error, req: Request, res: Response) => {
  console.error('未捕获的错误:', err.message);
  res.status(500).json({
    error: '服务器发生错误',
    details: err.message
  });
});

// ========== 启动服务器 ==========

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n✅ 服务器已启动`);
  console.log(`📍 监听端口: ${PORT}`);
  console.log(`🔗 API 测试: http://localhost:${PORT}/api/test`);
  console.log('💡 等待请求...\n');
});

export default app;