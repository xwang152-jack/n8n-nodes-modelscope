import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import { llmOperations, llmFields } from './resources/llm';
import { visionOperations, visionFields } from './resources/vision';
import { imageOperations, imageFields } from './resources/image';
import { executeChatCompletion } from './resources/llm/chatCompletion.operation';
import { executeVisionChat } from './resources/vision/visionChat.operation';
import { executeTextToImage } from './resources/image/textToImage.operation';
import { MODELSCOPE_BASE_URL } from './utils/constants';

export class ModelScope implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ModelScope',
		name: 'modelScope',
		icon: 'file:modelscope.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Interact with ModelScope API-Inference services',
		defaults: {
			name: 'ModelScope',
		},
		inputs: ['main'],
		outputs: ['main'],
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
			// 资源选择
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
					options: [
						{
							name: 'Large Language Model',
							value: 'llm',
							description: '大语言模型对话完成',
						},
						{
							name: 'Vision Model',
							value: 'vision',
							description: '视觉多模态模型',
						},
						{
							name: 'Text to Image',
							value: 'image',
							description: '文生图模型',
						},
					],
					default: 'llm',
				},
			// 动态加载操作选项
			...llmOperations,
			...visionOperations,
				...imageOperations,
			// 动态加载字段选项
			...llmFields,
			...visionFields,
				...imageFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData;

				switch (resource) {
					case 'llm':
						switch (operation) {
							case 'chatCompletion':
								responseData = await executeChatCompletion.call(this, i);
								break;
							default:
								throw new NodeOperationError(
									this.getNode(),
									`Unknown LLM operation: ${operation}`,
								);
						}
						break;
					case 'vision':
						switch (operation) {
							case 'visionChat':
								responseData = await executeVisionChat.call(this, i);
								break;
							default:
								throw new NodeOperationError(
									this.getNode(),
									`Unknown Vision operation: ${operation}`,
								);
						}
						break;
					case 'image':
						switch (operation) {
							case 'textToImage':
								responseData = await executeTextToImage.call(this, i);
								break;
							default:
								throw new NodeOperationError(
									this.getNode(),
									`Unknown Image operation: ${operation}`,
								);
						}
						break;
					default:
						throw new NodeOperationError(
							this.getNode(),
							`Unknown resource: ${resource}`,
						);
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as any),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
