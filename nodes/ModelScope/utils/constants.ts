// 支持的模型列表
export const SUPPORTED_MODELS = {
	llm: [
		'ZhipuAI/GLM-4.7',
		'deepseek-ai/DeepSeek-V3.2',
		'Qwen/Qwen3-235B-A22B-Instruct-2507',
		'Qwen/Qwen3-235B-A22B-Thinking-2507',
		'Qwen/Qwen3-Next-80B-A3B-Instruct',
		'Qwen/Qwen3-Coder-480B-A35B-Instruct',
		'Qwen/Qwen3-Next-80B-A3B-Thinking',
	],
	vision: [
		'Qwen/Qwen3-VL-235B-A22B-Instruct',
		'Qwen/Qwen3-VL-30B-A3B-Instruct',
	],
	image: [
		'Qwen/Qwen-Image',
		'Qwen/Qwen-Image-2512',
	],
};

export const MODELSCOPE_BASE_URL = 'https://api-inference.modelscope.cn/v1';

// 模型选项生成器
export const getModelOptions = (modelType: keyof typeof SUPPORTED_MODELS) => {
	return SUPPORTED_MODELS[modelType].map(model => ({
		name: model,
		value: model,
	}));
};

// 图像尺寸选项
export const IMAGE_SIZE_OPTIONS = [
	{ name: '1024x1024', value: '1024x1024' },
	{ name: '1024x768', value: '1024x768' },
	{ name: '768x1024', value: '768x1024' },
	{ name: '1152x896', value: '1152x896' },
	{ name: '896x1152', value: '896x1152' },
];

// 消息模板
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
};
