import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { OperationHelper } from '../../utils/operationHelper';
import { ResponseBuilder } from '../../utils/responseBuilder';
import { ModelScopeErrorHandler } from '../../utils/errorHandler';
import { ERROR_MESSAGES } from '../../utils/constants';

export async function executeVisionChat(
	this: IExecuteFunctions,
	itemIndex: number,
) {
	const startTime = Date.now();

	try {
		// Get client and extract basic parameters
		const { client } = await OperationHelper.getClientAndCredentials(this, itemIndex);
		const params = OperationHelper.extractVisionParams(this, itemIndex);

		// Get image source parameters
		const imageSource = this.getNodeParameter('imageSource', itemIndex, 'url') as string;
		const imageUrlParam = this.getNodeParameter('imageUrl', itemIndex, '') as string;
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', itemIndex, 'data') as string;
		const prompt = this.getNodeParameter('prompt', itemIndex) as string;

		// Validate prompt
		if (!prompt.trim()) {
			throw new NodeOperationError(this.getNode(), ERROR_MESSAGES.EMPTY_PROMPT);
		}

		// Resolve image URL (from binary or URL)
		let resolvedImageUrl = '';
		let imageMetadata: {
			image_source: string;
			image_url: string;
			image_binary_property: string;
			image_mime_type: string;
			image_bytes: number;
		} = {
			image_source: imageSource,
			image_url: '',
			image_binary_property: '',
			image_mime_type: '',
			image_bytes: 0,
		};

		if (imageSource === 'binary') {
			// Handle binary image data
			const items = this.getInputData();
			const item = items[itemIndex];
			const binary = item?.binary?.[binaryPropertyName];

			if (!binary) {
				throw new NodeOperationError(this.getNode(), `未找到binary数据: ${binaryPropertyName}`);
			}

			const imageMimeType = String(binary.mimeType || 'image/png');
			const helpersAny = this.helpers as any;
			let base64Data = '';
			let imageBytes = 0;

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

			imageMetadata = {
				image_source: 'binary',
				image_url: '',
				image_binary_property: binaryPropertyName,
				image_mime_type: imageMimeType,
				image_bytes: imageBytes,
			};

			this.logger.info(`开始视觉对话 - 模型: ${params.model}, 图片: binary.${binaryPropertyName}, ${imageBytes} bytes`);
		} else {
			// Handle URL image
			if (!imageUrlParam.trim()) {
				throw new NodeOperationError(this.getNode(), ERROR_MESSAGES.EMPTY_IMAGE_URL);
			}
			resolvedImageUrl = imageUrlParam;

			imageMetadata = {
				image_source: 'url',
				image_url: imageUrlParam,
				image_binary_property: '',
				image_mime_type: '',
				image_bytes: 0,
			};

			this.logger.info(`开始视觉对话 - 模型: ${params.model}, 图片: ${imageUrlParam.substring(0, 50)}...`);
		}

		// Build vision chat messages
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

		// Execute vision chat
		const response = await client.chatCompletion({
			model: params.model,
			messages,
			temperature: params.temperature,
			max_tokens: params.maxTokens,
		});

		// Build standardized response
		const baseResult = ResponseBuilder.buildVisionChatResponse(response, resolvedImageUrl, startTime);

		// Add vision-specific metadata
		const result = {
			...baseResult,
			image_source: imageMetadata.image_source,
			image_url: imageMetadata.image_url,
			image_binary_property: imageMetadata.image_binary_property,
			image_mime_type: imageMetadata.image_mime_type,
			image_bytes: imageMetadata.image_bytes,
		};

		this.logger.info(`视觉对话完成 - 用时: ${result.processing_time}, tokens: ${result.total_tokens}`);

		return result;
    } catch (error: unknown) {
        const processingTime = Math.round((Date.now() - startTime) / 1000);
        this.logger.error(`视觉对话失败 - 用时: ${processingTime}秒, 错误: ${(error as Error).message}`);
        throw ModelScopeErrorHandler.handleApiError(error);
    }
}
