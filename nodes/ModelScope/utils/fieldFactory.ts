/**
 * Field Factory Utilities
 *
 * Provides reusable UI field definition factories to reduce duplication
 * across resource index files.
 */

import type { INodeProperties } from 'n8n-workflow';
import { SUPPORTED_MODELS, IMAGE_SIZE_OPTIONS, MESSAGE_TEMPLATES, ModelType } from './constants';

export class FieldFactory {
	/**
	 * Create a usage notice field with specified theme
	 */
	static createUsageNoticeField(
		theme: 'info' | 'warning' | 'error',
		displayOptions: { show: { resource: string[] } }
	): INodeProperties {
		return {
			displayName: 'Usage Notice',
			name: 'usageNotice',
			type: 'notice',
			default: '',
			displayOptions,
			typeOptions: { theme },
		} as INodeProperties;
	}

	/**
	 * Create a model selection dropdown field
	 */
	static createModelField(
		modelType: ModelType,
		operation: string,
		displayName: string = 'Model',
		defaultValue?: string
	): INodeProperties {
		const models = SUPPORTED_MODELS[modelType];

		return {
			displayName,
			name: 'model',
			type: 'options',
			default: defaultValue || models[0] as string,
			displayOptions: {
				show: {
					resource: [modelType],
					operation: [operation],
				},
			},
			options: models.map(model => ({
				name: model,
				value: model,
			})),
			required: true,
			description: `选择要使用的${displayName}`,
		};
	}

	/**
	 * Create temperature parameter field
	 */
	static createTemperatureField(
		resource: ModelType,
		operation: string,
		defaultValue: number = 0.7
	): INodeProperties {
		return {
			displayName: 'Temperature',
			name: 'temperature',
			type: 'number',
			displayOptions: {
				show: {
					resource: [resource],
					operation: [operation],
				},
			},
			default: defaultValue,
			typeOptions: {
				minValue: 0,
				maxValue: 2,
				numberStepSize: 0.1,
			},
			description: '控制输出的随机性，范围0-2',
		};
	}

	/**
	 * Create max tokens field
	 */
	static createMaxTokensField(
		resource: ModelType,
		operation: string,
		defaultValue: number = 2048
	): INodeProperties {
		return {
			displayName: 'Max Tokens',
			name: 'maxTokens',
			type: 'number',
			displayOptions: {
				show: {
					resource: [resource],
					operation: [operation],
				},
			},
			default: defaultValue,
			typeOptions: {
				minValue: 1,
				maxValue: 8192,
			},
			description: '生成的最大令牌数',
		};
	}

	/**
	 * Create stream field
	 */
	static createStreamField(
		resource: ModelType,
		operation: string
	): INodeProperties {
		return {
			displayName: 'Stream',
			name: 'stream',
			type: 'boolean',
			displayOptions: {
				show: {
					resource: [resource],
					operation: [operation],
				},
			},
			default: false,
			description: 'Whether to enable streaming output',
		};
	}

	/**
	 * Create messages fixed collection field
	 */
	static createMessagesField(
		resource: ModelType,
		operation: string
	): INodeProperties {
		return {
			displayName: 'Messages',
			name: 'messages',
			type: 'fixedCollection',
			displayOptions: {
				show: {
					resource: [resource],
					operation: [operation],
				},
			},
			typeOptions: {
				multipleValues: true,
			},
			default: {
				message: [
					{
						role: 'user',
						content: '',
					},
				],
			},
			options: [
				{
					name: 'message',
					displayName: 'Message',
					values: [
						{
							displayName: 'Role',
							name: 'role',
							type: 'options',
							options: [
								{
									name: 'System',
									value: 'system',
								},
								{
									name: 'User',
									value: 'user',
								},
								{
									name: 'Assistant',
									value: 'assistant',
								},
							],
							default: 'user',
						},
						{
							displayName: 'Content',
							name: 'content',
							type: 'string',
							typeOptions: {
								rows: 3,
							},
							default: '',
							description: '消息内容',
						},
					],
				},
			],
			description: '对话消息列表',
		};
	}

	/**
	 * Create message template field
	 */
	static createMessageTemplateField(
		resource: ModelType,
		operation: string
	): INodeProperties {
		return {
			displayName: 'Message Template',
			name: 'messageTemplate',
			type: 'options',
			displayOptions: {
				show: {
					resource: [resource],
					operation: [operation],
				},
			},
			options: Object.values(MESSAGE_TEMPLATES),
			default: 'custom',
			description: '选择消息模板',
		};
	}

	/**
	 * Create image size selection field
	 */
	static createImageSizeField(
		resource: ModelType,
		operation: string
	): INodeProperties {
		return {
			displayName: 'Size',
			name: 'size',
			type: 'options',
			displayOptions: {
				show: {
					resource: [resource],
					operation: [operation],
				},
			},
			options: [...IMAGE_SIZE_OPTIONS],
			default: '1024x1024',
			description: '生成图像的尺寸',
		};
	}

	/**
	 * Create prompt field
	 */
	static createPromptField(
		resource: ModelType,
		operation: string,
		placeholder: string,
		rows: number = 4
	): INodeProperties {
		return {
			displayName: 'Prompt',
			name: 'prompt',
			type: 'string',
			displayOptions: {
				show: {
					resource: [resource],
					operation: [operation],
				},
			},
			typeOptions: {
				rows,
			},
			default: '',
			required: true,
			description: '图像生成的描述文本',
			placeholder,
		};
	}

	/**
	 * Create negative prompt field
	 */
	static createNegativePromptField(
		resource: ModelType,
		operation: string,
		placeholder: string = 'blurry, low quality, distorted'
	): INodeProperties {
		return {
			displayName: 'Negative Prompt',
			name: 'negativePrompt',
			type: 'string',
			displayOptions: {
				show: {
					resource: [resource],
					operation: [operation],
				},
			},
			typeOptions: {
				rows: 2,
			},
			default: '',
			description: '不希望在图像中出现的内容',
			placeholder,
		};
	}

	/**
	 * Create image steps field
	 */
	static createImageStepsField(
		resource: ModelType,
		operation: string
	): INodeProperties {
		return {
			displayName: 'Steps',
			name: 'steps',
			type: 'number',
			displayOptions: {
				show: {
					resource: [resource],
					operation: [operation],
				},
			},
			default: 30,
			typeOptions: {
				minValue: 10,
				maxValue: 100,
			},
			description: '生成步数，越高质量越好但耗时更长',
		};
	}

	/**
	 * Create timeout field
	 */
	static createTimeoutField(
		resource: ModelType,
		operation: string
	): INodeProperties {
		return {
			displayName: 'Timeout (Minutes)',
			name: 'timeout',
			type: 'number',
			displayOptions: {
				show: {
					resource: [resource],
					operation: [operation],
				},
			},
			default: 5,
			typeOptions: {
				minValue: 1,
				maxValue: 10,
			},
			description: '任务超时时间（分钟）',
		};
	}

	/**
	 * Create image URL field
	 */
	static createImageUrlField(
		resource: ModelType,
		operation: string
	): INodeProperties {
		return {
			displayName: 'Image URL',
			name: 'imageUrl',
			type: 'string',
			displayOptions: {
				show: {
					resource: [resource],
					operation: [operation],
				},
			},
			default: '',
			required: true,
			description: '图像的 URL 地址',
			placeholder: 'https://example.com/image.jpg',
		};
	}
}
