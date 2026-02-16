import type { INodeProperties } from 'n8n-workflow';
import { getModelOptions, MESSAGE_TEMPLATES } from '../../utils/constants';

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
	// 使用限制提醒
	{
		displayName: 'Usage Notice',
		name: 'usageNotice',
		type: 'notice',
		default: '',
		displayOptions: {
			show: {
				resource: ['llm'],
			},
		},
		typeOptions: {
			theme: 'info',
		},
	} as any,
	// 模型选择
	{
		displayName: 'Model',
		name: 'model',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['llm'],
				operation: ['chatCompletion'],
			},
		},
		options: getModelOptions('llm'),
		default: 'ZhipuAI/GLM-5',
		required: true,
		description: '选择要使用的大语言模型',
	},
	// 消息模板
	{
		displayName: 'Message Template',
		name: 'messageTemplate',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['llm'],
				operation: ['chatCompletion'],
			},
		},
		options: [
			MESSAGE_TEMPLATES.custom,
			MESSAGE_TEMPLATES.code,
			MESSAGE_TEMPLATES.analysis,
			MESSAGE_TEMPLATES.translation,
		],
		default: 'custom',
		description: '选择消息模板',
	},
	// 消息内容
	{
		displayName: 'Messages',
		name: 'messages',
		type: 'fixedCollection',
		displayOptions: {
			show: {
				resource: ['llm'],
				operation: ['chatCompletion'],
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
	},
	// 温度参数
	{
		displayName: 'Temperature',
		name: 'temperature',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['llm'],
				operation: ['chatCompletion'],
			},
		},
		default: 0.7,
		typeOptions: {
			minValue: 0,
			maxValue: 2,
			numberStepSize: 0.1,
		},
		description: '控制输出的随机性，范围0-2',
	},
	// 最大令牌数
	{
		displayName: 'Max Tokens',
		name: 'maxTokens',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['llm'],
				operation: ['chatCompletion'],
			},
		},
		default: 2048,
		typeOptions: {
			minValue: 1,
			maxValue: 8192,
		},
		description: '生成的最大令牌数',
	},
	// 流式输出
	{
		displayName: 'Stream',
		name: 'stream',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['llm'],
				operation: ['chatCompletion'],
			},
		},
		default: false,
		description: 'Whether to enable streaming output',
	},
];