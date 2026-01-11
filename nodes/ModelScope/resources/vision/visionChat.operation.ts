import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { ModelScopeClient } from '../../utils/apiClient';
import { ModelScopeErrorHandler } from '../../utils/errorHandler';

export async function executeVisionChat(
	this: IExecuteFunctions,
	itemIndex: number,
) {
	const startTime = Date.now();
	
	try {
		const credentials = await this.getCredentials('modelScopeApi');
		const client = new ModelScopeClient(credentials.accessToken as string);

		const model = this.getNodeParameter('model', itemIndex) as string;
		const imageSource = this.getNodeParameter('imageSource', itemIndex, 'url') as string;
		const imageUrl = this.getNodeParameter('imageUrl', itemIndex, '') as string;
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', itemIndex, 'data') as string;
		const prompt = this.getNodeParameter('prompt', itemIndex) as string;
		const temperature = this.getNodeParameter('temperature', itemIndex, 0.7) as number;
		const maxTokens = this.getNodeParameter('maxTokens', itemIndex, 2048) as number;

		let resolvedImageUrl = '';
		let imageMimeType = '';
		let imageBytes = 0;
		let imageBinaryProperty = '';

		if (imageSource === 'binary') {
			const items = this.getInputData();
			const item = items[itemIndex];
			const binary = item?.binary?.[binaryPropertyName] as any;

			if (!binary) {
				throw new NodeOperationError(this.getNode(), `未找到binary数据: ${binaryPropertyName}`);
			}

			imageMimeType = String(binary.mimeType || 'image/png');

			const helpersAny = this.helpers as any;
			let base64Data = '';

			if (typeof helpersAny.getBinaryDataBuffer === 'function') {
				const buffer = await helpersAny.getBinaryDataBuffer(itemIndex, binaryPropertyName);
				base64Data = buffer.toString('base64');
				imageBytes = buffer.length;
			} else if (binary.data) {
				base64Data = String(binary.data);
				imageBytes = Buffer.byteLength(base64Data, 'base64');
			} else {
				throw new NodeOperationError(this.getNode(), `binary数据缺少data字段: ${binaryPropertyName}`);
			}

			resolvedImageUrl = `data:${imageMimeType};base64,${base64Data}`;
			imageBinaryProperty = binaryPropertyName;
		} else {
			if (!imageUrl.trim()) {
				throw new NodeOperationError(this.getNode(), '图片URL不能为空');
			}
			resolvedImageUrl = imageUrl;
		}

		if (!prompt.trim()) {
			throw new NodeOperationError(this.getNode(), '提示词不能为空');
		}

		if (imageSource === 'binary') {
			this.logger.info(`开始视觉对话 - 模型: ${model}, 图片: binary.${imageBinaryProperty}, ${imageBytes} bytes`);
		} else {
			this.logger.info(`开始视觉对话 - 模型: ${model}, 图片: ${imageUrl.substring(0, 50)}...`);
		}

		// 构建视觉聊天消息
		const messages: ChatCompletionMessageParam[] = [
			{
				role: 'user',
				content: [
					{
						type: 'text',
						text: prompt,
					},
					{
						type: 'image_url',
						image_url: {
							url: resolvedImageUrl,
						},
					},
				],
			},
		];

		const response = await client.chatCompletion({
			model,
			messages,
			temperature,
			max_tokens: maxTokens,
		});

		// 非流式响应
		const chatResponse = response as any;
        const processingTime = Math.round((Date.now() - startTime) / 1000);
        this.logger.info(`视觉对话完成 - 用时: ${processingTime}秒, tokens: ${chatResponse.usage?.total_tokens || 0}`);
		
		return {
			id: chatResponse.id,
			object: chatResponse.object,
			created: chatResponse.created,
			model: chatResponse.model,
			choices: chatResponse.choices,
			usage: chatResponse.usage,
			// 添加状态和元数据信息
			status: 'completed',
			processing_time: `${processingTime}秒`,
			input_tokens: chatResponse.usage?.prompt_tokens || 0,
			output_tokens: chatResponse.usage?.completion_tokens || 0,
			total_tokens: chatResponse.usage?.total_tokens || 0,
			image_url: imageSource === 'url' ? imageUrl : '',
			image_source: imageSource,
			image_binary_property: imageSource === 'binary' ? imageBinaryProperty : '',
			image_mime_type: imageSource === 'binary' ? imageMimeType : '',
			image_bytes: imageSource === 'binary' ? imageBytes : 0,
			completed_at: new Date().toISOString(),
		};
    } catch (error: any) {
        const processingTime = Math.round((Date.now() - startTime) / 1000);
        this.logger.error(`视觉对话失败 - 用时: ${processingTime}秒, 错误: ${error.message}`);
        throw ModelScopeErrorHandler.handleApiError(error);
    }
}
