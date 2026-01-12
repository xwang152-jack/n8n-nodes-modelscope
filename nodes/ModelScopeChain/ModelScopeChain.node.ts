import type {
    ISupplyDataFunctions,
    ILoadOptionsFunctions,
    INodeType,
    INodeTypeDescription,
    SupplyData,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { NodeConnectionTypes } from 'n8n-workflow';
import { ChatOpenAI } from '@langchain/openai';
import { getConnectionHintNoticeField } from './methods/sharedFields';
import { N8nLlmTracing } from '../N8nLlmTracing';
import { MODELSCOPE_BASE_URL } from '../ModelScope/utils/constants';

export class ModelScopeChain implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ModelScope Chat Model',
		name: 'modelScopeChain',
		icon: 'file:modelscope.svg',
		group: ['transform'],
		version: 1,
		description: 'ModelScope Chat Model for advanced usage with an AI chain',
		defaults: {
			name: 'ModelScope Chat Model',
		},
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Language Models', 'Chat Models'],
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'https://modelscope.cn/docs/api-inference',
					},
				],
			},
		},
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node
		inputs: [],
		outputs: [NodeConnectionTypes.AiLanguageModel, NodeConnectionTypes.AiChain],
		outputNames: ['Model', 'Chain'],
		credentials: [
			{
				name: 'modelScopeApi',
				required: true,
			},
		],
        requestDefaults: {
            baseURL: MODELSCOPE_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        },
		properties: [
			getConnectionHintNoticeField([NodeConnectionTypes.AiAgent, NodeConnectionTypes.AiChain]),
			{
				displayName: 'Mode',
				name: 'mode',
				type: 'options',
				default: 'chat',
                options: [
					{ name: 'Chat Model', value: 'chat' },
				],
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'resourceLocator',
				default: { mode: 'list', value: 'qwen/Qwen2.5-72B-Instruct' },
				required: true,
				description: 'The model which will generate the completion',
				modes: [
					{
						displayName: 'Model',
						name: 'list',
						type: 'list',
						placeholder: 'Select a model',
						typeOptions: {
							searchListMethod: 'searchModels',
							searchable: true,
						},
					},
					{
						displayName: 'ID',
						name: 'id',
						type: 'string',
						placeholder: 'qwen/Qwen2.5-72B-Instruct',
					},
				],
			},
			{
				displayName: 'Options',
				name: 'options',
				placeholder: 'Add Option',
				description: 'Additional options to configure',
				type: 'collection',
				default: {},
				options: [
					{
						displayName: 'Base URL',
						name: 'baseURL',
						default: MODELSCOPE_BASE_URL,
						description: 'Override the default base URL for the API',
						type: 'string',
					},
					{
						displayName: 'Frequency Penalty',
						name: 'frequencyPenalty',
						default: 0,
						typeOptions: { maxValue: 2, minValue: -2, numberPrecision: 1 },
						description:
							'Positive values penalize new tokens based on their existing frequency in the text so far',
						type: 'number',
					},
					{
						displayName: 'Max Retries',
						name: 'maxRetries',
						default: 2,
						description: 'Maximum number of retries to make when generating',
						type: 'number',
					},
					{
						displayName: 'Maximum Number of Tokens',
						name: 'maxTokens',
						default: -1,
						description:
							'The maximum number of tokens to generate in the chat completion. -1 = no limit.',
						type: 'number',
						typeOptions: {
							minValue: -1,
						},
					},
					{
						displayName: 'Presence Penalty',
						name: 'presencePenalty',
						default: 0,
						typeOptions: { maxValue: 2, minValue: -2, numberPrecision: 1 },
						description:
							'Positive values penalize new tokens based on whether they appear in the text so far',
						type: 'number',
					},
					{
						displayName: 'Reasoning Effort',
						name: 'reasoningEffort',
						type: 'options',
						default: 'medium',
						description: 'Controls how much effort the model puts into reasoning',
						options: [
							{
								name: 'Low',
								value: 'low',
							},
							{
								name: 'Medium',
								value: 'medium',
							},
							{
								name: 'High',
								value: 'high',
							},
						],
					},
                    {
                        displayName: 'Response Format',
                        name: 'responseFormat',
                        type: 'options',
                        default: 'text',
                        description: 'Response format type',
                        options: [
                            {
                                name: 'Text',
                                value: 'text',
                            },
                            {
                                name: 'JSON Object',
                                value: 'json_object',
                            },
                        ],
                    },
					{
						displayName: 'Sampling Temperature',
						name: 'temperature',
						default: 1,
						typeOptions: { maxValue: 2, minValue: 0, numberPrecision: 1 },
						description:
							'Controls randomness: Lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive.',
						type: 'number',
					},
                    {
                        displayName: 'Timeout',
                        name: 'timeout',
                        default: 60000,
                        description: 'Maximum amount of time a request is allowed to take in milliseconds',
                        type: 'number',
                    },
                    {
                        displayName: 'Tool Choice',
                        name: 'toolChoice',
                        type: 'options',
                        default: 'auto',
                        description: 'Control tool calling behavior when using agents/tools',
                        options: [
                            { name: 'Auto', value: 'auto' },
                            { name: 'None', value: 'none' },
                        ],
                    },
					{
						displayName: 'Top P',
						name: 'topP',
						default: 1,
						typeOptions: { maxValue: 1, minValue: 0, numberPrecision: 3 },
						description:
							'Controls diversity via nucleus sampling: 0.5 means half of all likelihood-weighted options are considered. We generally recommend altering this or temperature but not both.',
						type: 'number',
					},
				],
			},
		],
	};

	methods = {
		listSearch: {
			searchModels: async function (
				this: ILoadOptionsFunctions,
				filter?: string,
			) {
				const { searchModels } = await import('./methods/loadModels');
				return searchModels.call(this, filter);
			},
		},
	};

    async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
        const credentials = await this.getCredentials('modelScopeApi');

        if (!credentials?.accessToken || !String(credentials.accessToken).trim()) {
            throw new NodeOperationError(this.getNode(), '未配置 ModelScope Access Token，请在凭据中填写并绑定节点');
        }

        const options = this.getNodeParameter('options', itemIndex, {}) as {
            baseURL?: string;
            frequencyPenalty?: number;
            maxRetries?: number;
            maxTokens?: number;
			presencePenalty?: number;
			reasoningEffort?: string;
			responseFormat?: string;
			temperature?: number;
			timeout?: number;
			topP?: number;
            toolChoice?: 'auto' | 'none';
		};

		const modelName = this.getNodeParameter('model', itemIndex, '', { extractValue: true }) as string;

        const config: any = {
            apiKey: credentials.accessToken as string,
            // 兼容不同版本的字段名
            openAIApiKey: credentials.accessToken as string,
            model: modelName,
            configuration: {
                baseURL: options.baseURL || MODELSCOPE_BASE_URL,
            },
        };

		if (options.frequencyPenalty !== undefined) {
			config.frequencyPenalty = options.frequencyPenalty;
		}
		if (options.maxRetries !== undefined) {
			config.maxRetries = options.maxRetries;
		}
		if (options.maxTokens !== undefined && options.maxTokens !== -1) {
			config.maxTokens = options.maxTokens;
		}
		if (options.presencePenalty !== undefined) {
			config.presencePenalty = options.presencePenalty;
		}
		if (options.reasoningEffort !== undefined) {
			config.reasoningEffort = options.reasoningEffort;
		}
        if (options.responseFormat !== undefined) {
            config.responseFormat = { type: options.responseFormat };
            config.modelKwargs = {
                ...(config.modelKwargs || {}),
                response_format: { type: options.responseFormat },
            };
        }
		if (options.temperature !== undefined) {
			config.temperature = options.temperature;
		}
		if (options.timeout !== undefined) {
			config.timeout = options.timeout;
		}
        if (options.topP !== undefined) {
            config.topP = options.topP;
        }

        if (options.toolChoice !== undefined) {
            config.toolChoice = options.toolChoice;
        }

		const model = new ChatOpenAI({
			...config,
			callbacks: [new N8nLlmTracing(this as ISupplyDataFunctions)],
		});

		return {
			response: model,
		};
	}
}
