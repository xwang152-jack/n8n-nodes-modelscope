// ============================================================================
// Model Type Enums
// ============================================================================

export enum ModelType {
	LLM = 'llm',
	VISION = 'vision',
	IMAGE = 'image',
}

// ============================================================================
// Supported Models
// ============================================================================

export const SUPPORTED_MODELS = {
	[ModelType.LLM]: [
		'ZhipuAI/GLM-5',
		'MiniMax/MiniMax-M2.5',
		'moonshotai/Kimi-K2.5',
		'Qwen/Qwen3.5-397B-A17B',
		'ZhipuAI/GLM-4.7-Flash',
		'deepseek-ai/DeepSeek-V3.2',
		'deepseek-ai/DeepSeek-R1-0528',
		'XiaomiMiMo/MiMo-V2-Flash',
		'Qwen/Qwen3-235B-A22B-Instruct-2507',
		'Qwen/Qwen3-235B-A22B-Thinking-2507',
		'Qwen/Qwen3-Next-80B-A3B-Instruct',
		'Qwen/Qwen3-Coder-480B-A35B-Instruct',
		'Qwen/Qwen3-Next-80B-A3B-Thinking',
	],
	[ModelType.VISION]: [
		'Qwen/Qwen3-VL-235B-A22B-Instruct',
		'Qwen/Qwen3-VL-30B-A3B-Instruct',
	],
	[ModelType.IMAGE]: [
		'Qwen/Qwen-Image',
		'Qwen/Qwen-Image-2512',
		'Tongyi-MAI/Z-Image-Turbo',
	],
} as const;

// ============================================================================
// API Configuration
// ============================================================================

export const API_CONFIG = {
	BASE_URL: 'https://api-inference.modelscope.cn/v1',
	HEADERS: {
		CONTENT_TYPE: 'application/json',
		AUTHORIZATION_PREFIX: 'Bearer ',
		X_ASYNC_MODE: 'true',
		X_TASK_TYPE_IMAGE_GENERATION: 'image_generation',
	},
	TIMEOUTS: {
		DEFAULT_REQUEST_MS: 30000,
		TASK_POLLING_MS: 600000,
	},
} as const;

export const MODELSCOPE_BASE_URL = API_CONFIG.BASE_URL;

// ============================================================================
// Polling Configuration
// ============================================================================

export const POLLING_CONFIG = {
	DEFAULT_INTERVAL_MS: 5000,
	MAX_INTERVAL_MS: 15000,
	INTERVAL_MULTIPLIER: 1.3,
	ATTEMPTS_PER_MINUTE: 12,
} as const;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get model options for dropdown
 */
export const getModelOptions = (modelType: ModelType) => {
	return SUPPORTED_MODELS[modelType].map(model => ({
		name: model,
		value: model,
	}));
};

/**
 * Get model type from model ID string
 */
export const getModelType = (modelId: string): ModelType | null => {
	if (SUPPORTED_MODELS[ModelType.LLM].includes(modelId as any)) {
		return ModelType.LLM;
	}
	if (SUPPORTED_MODELS[ModelType.VISION].includes(modelId as any)) {
		return ModelType.VISION;
	}
	if (SUPPORTED_MODELS[ModelType.IMAGE].includes(modelId as any)) {
		return ModelType.IMAGE;
	}
	return null;
};

// ============================================================================
// UI Options
// ============================================================================

/**
 * Image size options for text-to-image generation
 */
export const IMAGE_SIZE_OPTIONS = [
	{ name: '1024x1024', value: '1024x1024' },
	{ name: '1024x768', value: '1024x768' },
	{ name: '768x1024', value: '768x1024' },
	{ name: '1152x896', value: '1152x896' },
	{ name: '896x1152', value: '896x1152' },
] as const;

/**
 * Message templates for chat completion
 */
export const MESSAGE_TEMPLATES = {
	custom: {
		name: 'Custom',
		value: 'custom',
		description: '自定义消息',
	},
	code: {
		name: 'Code Generation',
		value: 'code',
		description: '代码生成',
		template: '请帮我生成以下功能的代码：',
	},
	analysis: {
		name: 'Text Analysis',
		value: 'analysis',
		description: '文本分析',
		template: '请分析以下文本内容：',
	},
	translation: {
		name: 'Translation',
		value: 'translation',
		description: '翻译',
		template: '请将以下内容翻译成中文：',
	},
} as const;

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
	INVALID_TOKEN: '认证失败：API Token 无效或已过期',
	QUOTA_EXCEEDED: '配额已用完，请升级套餐或等待次日重置',
	RATE_LIMIT_EXCEEDED: '请求频率超限，请稍后重试',
	MODEL_NOT_AVAILABLE: '模型不可用或不存在',
	TASK_TIMEOUT: '任务处理超时',
	INVALID_PARAMETER: '请求参数错误',
	INTERNAL_ERROR: '服务器内部错误',
	NETWORK_ERROR: '网络请求失败',
	EMPTY_TOKEN: '认证失败：未配置 ModelScope Access Token，请在凭据中填写并绑定节点',
	EMPTY_MESSAGES: '至少需要一条非空消息',
	EMPTY_PROMPT: '提示词不能为空',
	EMPTY_IMAGE_URL: '图像 URL 不能为空',
} as const;
