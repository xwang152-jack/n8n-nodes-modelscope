import type { INodeProperties } from 'n8n-workflow';
import { FieldFactory } from '../../utils/fieldFactory';
import { ModelType } from '../../utils/constants';

export const imageOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['image'],
			},
		},
		options: [
			{
				name: 'Text to Image',
				value: 'textToImage',
				description: '根据文本描述生成图像',
				action: 'Text to image',
			},
		],
		default: 'textToImage',
	},
];

export const imageFields: INodeProperties[] = [
	// Usage notice
	FieldFactory.createUsageNoticeField('warning', { show: { resource: ['image'] } }),

	// Model selection
	FieldFactory.createModelField(ModelType.IMAGE, 'textToImage', 'Model', 'Qwen/Qwen-Image'),

	// Prompt
	FieldFactory.createPromptField(
		ModelType.IMAGE,
		'textToImage',
		'一只可爱的小猫坐在花园里，阳光明媚，高质量，4K',
		4
	),

	// Negative prompt
	FieldFactory.createNegativePromptField(ModelType.IMAGE, 'textToImage'),

	// Image size
	FieldFactory.createImageSizeField(ModelType.IMAGE, 'textToImage'),

	// Steps
	FieldFactory.createImageStepsField(ModelType.IMAGE, 'textToImage'),

	// Timeout
	FieldFactory.createTimeoutField(ModelType.IMAGE, 'textToImage'),
];