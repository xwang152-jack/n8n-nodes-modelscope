# n8n-nodes-modelscope

[![npm version](https://badge.fury.io/js/n8n-nodes-modelscope.svg)](https://badge.fury.io/js/n8n-nodes-modelscope)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

这是一个用于 [n8n](https://n8n.io/) 的 ModelScope API 集成节点包，提供双节点架构支持大语言模型、视觉模型、文生图模型的调用，以及 AI Agent/Chain 集成功能。

## 节点架构

本包提供两个互补的节点：

### 🔧 ModelScope 节点
传统的 API 调用节点，支持：
- 🤖 **大语言模型 (LLM)**: 支持对话完成，包括 Qwen、GLM、DeepSeek 等主流模型
- 👁️ **视觉模型 (Vision)**: 支持图像理解和视觉问答
- 🎨 **文生图模型 (Image)**: 支持文本到图像的生成，包括 Qwen-Image 等模型
- ⚡ **异步处理**: 支持文生图任务的异步处理和状态轮询

### 🔗 ModelScope Chat Model 节点
AI Agent/Chain 集成节点，专为 n8n AI 工作流设计：
- 🤖 **LangChain 集成**: 基于 ChatOpenAI 的 LangChain 兼容接口
- 🔄 **AI Agent 支持**: 可与 n8n AI Agent 和 AI Chain 节点无缝集成
- ⚙️ **丰富配置**: 支持温度、最大令牌数、频率惩罚等高级参数
- 🎯 **专业化**: 专注于大语言模型的 AI 工作流集成

## 功能特性

- 🔐 **安全认证**: 使用 ModelScope API Token 进行身份验证
- 🎛️ **丰富配置**: 支持温度、最大令牌数、图像尺寸等参数调节
- 🚀 **双重集成**: 既支持传统 API 调用，也支持现代 AI Agent 工作流
- 📊 **完善错误处理**: 包含详细的错误处理和状态反馈机制

## 安装

### 通过 npm 安装

```bash
npm install n8n-nodes-modelscope
```

### 通过 n8n 社区节点安装

1. 在 n8n 界面中，转到 **Settings** > **Community Nodes**
2. 点击 **Install a community node**
3. 输入 `n8n-nodes-modelscope`
4. 点击 **Install**

## 配置

### 获取 ModelScope API Token

1. 访问 [ModelScope](https://modelscope.cn/) 并注册账号
2. 登录后，进入 [个人中心 - API Token](https://modelscope.cn/my/myaccesstoken)
3. 创建新的 API Token
4. 复制生成的 Token

### 在 n8n 中配置凭据

1. 在 n8n 工作流中添加 ModelScope 节点
2. 点击 **Create New Credential**
3. 输入您的 ModelScope API Token
4. 保存凭据

## 使用方法

### ModelScope 节点使用

#### 大语言模型 (LLM)

支持与大语言模型进行对话：

- **模型选择**: ZhipuAI/GLM-4.7、deepseek-ai/DeepSeek-V3.2、Qwen/Qwen3-235B-A22B-Instruct-2507 等
- **消息模板**: 自定义、代码生成、文本分析、翻译等预设模板
- **参数配置**: 温度、最大令牌数、流式输出等

**示例配置**:
```json
{
  "resource": "llm",
  "operation": "chatCompletion",
  "model": "ZhipuAI/GLM-4.7",
  "messages": [
    {
      "role": "user",
      "content": "请帮我写一个 Python 函数来计算斐波那契数列"
    }
  ],
  "temperature": 0.7,
  "maxTokens": 2048
}
```

#### 视觉模型 (Vision)

支持图像理解和视觉问答：

- **模型选择**: Qwen/Qwen3-VL-235B-A22B-Instruct、Qwen/Qwen3-VL-30B-A3B-Instruct 等
- **图像输入**: 支持图像 URL
- **视觉问答**: 对图像内容进行描述、分析、问答

**示例配置**:
```json
{
  "resource": "vision",
  "operation": "visionChat",
  "model": "Qwen/Qwen3-VL-235B-A22B-Instruct",
  "imageUrl": "https://example.com/image.jpg",
  "prompt": "请描述这张图片的内容",
  "temperature": 0.7,
  "maxTokens": 2048
}
```

#### 文生图模型 (Image)

支持根据文本描述生成图像：

- **模型选择**: Qwen/Qwen-Image、Qwen/Qwen-Image-2512 等
- **提示词**: 支持正面和负面提示词
- **图像配置**: 多种尺寸选择、生成步数调节
- **异步处理**: 自动处理异步任务和状态轮询

**示例配置**:
```json
{
  "resource": "image",
  "operation": "textToImage",
  "model": "Qwen/Qwen-Image-2512",
  "prompt": "一只可爱的小猫坐在花园里，阳光明媚，高质量，4K",
  "negativePrompt": "blurry, low quality, distorted",
  "size": "1024x1024",
  "steps": 30,
  "timeout": 5
}
```

### ModelScope Chat Model 节点使用

ModelScope Chat Model 节点专为 n8n AI 工作流设计，可与 AI Agent 和 AI Chain 节点无缝集成：

#### AI Agent 集成

1. 在工作流中添加 **AI Agent** 节点
2. 在 AI Agent 的 **Chat Model** 配置中选择 **ModelScope Chat Model**
3. 配置模型参数和选项

#### AI Chain 集成

1. 在工作流中添加 **AI Chain** 节点
2. 在 AI Chain 的 **Language Model** 配置中选择 **ModelScope Chat Model**
3. 配置模型参数和选项

#### 配置选项

- **模型选择**: 支持多种大语言模型
- **温度 (Temperature)**: 控制输出的随机性 (0.0-2.0)
- **最大令牌数 (Max Tokens)**: 限制输出长度
- **频率惩罚 (Frequency Penalty)**: 减少重复内容 (-2.0-2.0)
- **存在惩罚 (Presence Penalty)**: 鼓励话题多样性 (-2.0-2.0)
- **Top P**: 核采样参数 (0.0-1.0)
- **响应格式**: 文本或 JSON 格式
- **推理努力**: 控制模型推理深度 (低/中/高)

## 支持的模型

### 大语言模型 (LLM)
- **ZhipuAI 系列**:
  - ZhipuAI/GLM-4.7
- **DeepSeek 系列**:
  - deepseek-ai/DeepSeek-V3.2
- **Qwen 系列**:
  - Qwen/Qwen3-235B-A22B-Instruct-2507
  - Qwen/Qwen3-235B-A22B-Thinking-2507
  - Qwen/Qwen3-Next-80B-A3B-Instruct
  - Qwen/Qwen3-Coder-480B-A35B-Instruct
  - Qwen/Qwen3-Next-80B-A3B-Thinking
- 更多模型持续更新中...

### 视觉模型 (Vision)
- Qwen/Qwen3-VL-235B-A22B-Instruct
- Qwen/Qwen3-VL-30B-A3B-Instruct
- 更多模型持续更新中...

### 文生图模型 (Image)
- Qwen/Qwen-Image
- Qwen/Qwen-Image-2512
- 更多模型持续更新中...

## 使用限制

- 每用户每天总计 2000 次 API 调用
- 单个模型每天不超过 500 次调用
- 部分大模型限制 200 次/天
- 文生图任务为异步处理，生成时间通常为 30 秒 - 5 分钟

## 错误处理

节点包含完善的错误处理机制：

- **401 错误**: API Token 无效或过期
- **429 错误**: 请求频率超限或配额不足
- **400 错误**: 请求参数错误
- **500 错误**: 服务器内部错误

## 开发

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/xwang152-jack/n8n-nodes-modelscope.git
cd n8n-nodes-modelscope

# 安装依赖
npm install

# 构建
npm run build

# 链接到本地 n8n
npm link
cd ~/.n8n/nodes
npm link n8n-nodes-modelscope
```

### 项目结构

```
n8n-nodes-modelscope/
├── nodes/
│   ├── ModelScope/                     # 传统 API 调用节点
│   │   ├── ModelScope.node.ts          # 主节点文件
│   │   ├── utils/                       # 工具与常量
│   │   │   ├── apiClient.ts
│   │   │   ├── constants.ts
│   │   │   └── errorHandler.ts
│   │   └── resources/
│   │       ├── llm/                    # 大语言模型资源
│   │       ├── vision/                 # 视觉模型资源
│   │       └── image/                  # 图像生成资源
│   └── ModelScopeChain/                # AI Agent/Chain 集成节点
│       ├── ModelScopeChain.node.ts     # Chat Model 节点文件
│       └── utils/
│           └── loadModels.ts           # 模型加载工具
├── credentials/
│   └── ModelScopeApi.credentials.ts     # API 凭证配置
├── package.json                        # 项目配置
├── tsconfig.json                       # TypeScript 配置
└── README.md                          # 项目文档
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 相关链接

- [ModelScope 官网](https://modelscope.cn/)
- [ModelScope API 文档](https://modelscope.cn/docs/api-inference/intro)
- [n8n 官网](https://n8n.io/)
- [n8n 社区节点文档](https://docs.n8n.io/integrations/community-nodes/)
