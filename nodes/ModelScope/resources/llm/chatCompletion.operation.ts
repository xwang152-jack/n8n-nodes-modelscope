import type { IExecuteFunctions } from 'n8n-workflow';
import { OperationHelper } from '../../utils/operationHelper';
import { ResponseBuilder } from '../../utils/responseBuilder';
import { ModelScopeErrorHandler } from '../../utils/errorHandler';

export async function executeChatCompletion(
	this: IExecuteFunctions,
	itemIndex: number,
) {
	const startTime = Date.now();

	try {
		// Extract parameters and get client
		const { client } = await OperationHelper.getClientAndCredentials(this, itemIndex);
		const params = OperationHelper.extractModelParams(this, itemIndex);
		const messages = OperationHelper.extractMessages(this, itemIndex);

		// Validate messages
		OperationHelper.validateMessages(messages, 'ModelScope');

		this.logger.info(`开始LLM对话完成 - 模型: ${params.model}, 消息数: ${messages.length}`);

		// Execute chat completion
		const response = await client.chatCompletion({
			model: params.model,
			messages,
			temperature: params.temperature,
			max_tokens: params.maxTokens,
			stream: params.stream,
		});

		// Handle streaming response
		if (params.stream) {
			return ResponseBuilder.buildStreamResponse(response);
		}

		// Build and return standardized response
		const result = ResponseBuilder.buildChatCompletionResponse(response, startTime);
		this.logger.info(`LLM对话完成 - 用时: ${result.processing_time}, tokens: ${result.total_tokens}`);

		return result;
    } catch (error: unknown) {
        const processingTime = Math.round((Date.now() - startTime) / 1000);
        this.logger.error(`LLM对话失败 - 用时: ${processingTime}秒, 错误: ${(error as Error).message}`);
        throw ModelScopeErrorHandler.handleApiError(error);
    }
}