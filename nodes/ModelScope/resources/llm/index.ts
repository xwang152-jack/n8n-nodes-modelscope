import type { INodeProperties } from 'n8n-workflow';
import { FieldFactory } from '../../utils/fieldFactory';
import { ModelType } from '../../utils/constants';

export const llmOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['llm'],
			},
		},
		options: [
			{
				name: 'Chat Completion',
				value: 'chatCompletion',
				description: '与大语言模型进行对话',
				action: 'Chat completion',
			},
		],
		default: 'chatCompletion',
	},
];

export const llmFields: INodeProperties[] = [
	// Usage notice
	FieldFactory.createUsageNoticeField('info', { show: { resource: ['llm'] } }),

	// Model selection
	FieldFactory.createModelField(ModelType.LLM, 'chatCompletion', 'Model', 'ZhipuAI/GLM-5'),

	// Message template
	FieldFactory.createMessageTemplateField(ModelType.LLM, 'chatCompletion'),

	// Messages
	FieldFactory.createMessagesField(ModelType.LLM, 'chatCompletion'),

	// Temperature
	FieldFactory.createTemperatureField(ModelType.LLM, 'chatCompletion', 0.7),

	// Max tokens
	FieldFactory.createMaxTokensField(ModelType.LLM, 'chatCompletion', 2048),

	// Stream
	FieldFactory.createStreamField(ModelType.LLM, 'chatCompletion'),
];