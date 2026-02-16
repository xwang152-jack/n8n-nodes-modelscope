import type { INodeProperties } from 'n8n-workflow';
import { FieldFactory } from '../../utils/fieldFactory';
import { ModelType } from '../../utils/constants';

export const visionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['vision'],
			},
		},
		options: [
			{
				name: 'Vision Chat',
				value: 'visionChat',
				description: '与视觉模型进行图像对话',
				action: 'Vision chat',
			},
		],
		default: 'visionChat',
	},
];

export const visionFields: INodeProperties[] = [
	// Usage notice
	FieldFactory.createUsageNoticeField('info', { show: { resource: ['vision'] } }),

	// Model selection
	FieldFactory.createModelField(ModelType.VISION, 'visionChat', 'Model', 'Qwen/Qwen3-VL-30B-A3B-Instruct'),

	// Image source selector
	{
		displayName: 'Image Source',
		name: 'imageSource',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['vision'],
				operation: ['visionChat'],
			},
		},
		options: [
			{
				name: 'Image URL',
				value: 'url',
				description: '通过URL提供图片',
			},
			{
				name: 'Binary',
				value: 'binary',
				description: '从输入数据的binary属性读取图片',
			},
		],
		default: 'url',
		required: true,
	},

	// Image URL field (conditional)
	{
		displayName: 'Image URL',
		name: 'imageUrl',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['vision'],
				operation: ['visionChat'],
				imageSource: ['url'],
			},
		},
		default: '',
		required: true,
		description: '要分析的图像URL地址',
		placeholder: 'https://example.com/image.jpg',
	},

	// Binary property field (conditional)
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['vision'],
				operation: ['visionChat'],
				imageSource: ['binary'],
			},
		},
		default: 'data',
		required: true,
		description: '包含图片的binary字段名，例如 data',
	},

	// Prompt field
	{
		displayName: 'Prompt',
		name: 'prompt',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['vision'],
				operation: ['visionChat'],
			},
		},
		typeOptions: {
			rows: 3,
		},
		default: '请描述这张图片的内容',
		required: true,
		description: '对图像的提问或指令',
	},

	// Temperature
	FieldFactory.createTemperatureField(ModelType.VISION, 'visionChat', 0.7),

	// Max tokens
	FieldFactory.createMaxTokensField(ModelType.VISION, 'visionChat', 2048),
];
