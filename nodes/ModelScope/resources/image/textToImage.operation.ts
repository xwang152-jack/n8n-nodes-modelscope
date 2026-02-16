import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { OperationHelper } from '../../utils/operationHelper';
import { ResponseBuilder } from '../../utils/responseBuilder';
import { ModelScopeErrorHandler } from '../../utils/errorHandler';
import { POLLING_CONFIG, ERROR_MESSAGES } from '../../utils/constants';
import type { ModelScopeTaskStatusResponse } from '../../types/api.types';

export async function executeTextToImage(
	this: IExecuteFunctions,
	itemIndex: number,
) {
	const startTime = Date.now();

	try {
		// Get client and extract parameters
		const { client } = await OperationHelper.getClientAndCredentials(this, itemIndex);
		const params = OperationHelper.extractImageParams(this, itemIndex);

		// Validate prompt
		OperationHelper.validatePrompt(params.prompt, 'ModelScope');

		this.logger.info(`开始文生图任务 - 模型: ${params.model}, 提示词: ${params.prompt.substring(0, 50)}...`);

		// Submit async task
		const submitResponse = await client.generateImage({
			model: params.model,
			prompt: params.prompt,
			negative_prompt: params.negativePrompt,
			size: params.size,
			num_inference_steps: params.steps,
			guidance_scale: 7.5,
		});

		const taskId = submitResponse.task_id;
		if (!taskId) {
			throw new Error('任务提交失败，未获取到任务ID');
		}

		this.logger.info(`文生图任务已提交 - 任务ID: ${taskId}, 超时: ${params.timeout}分钟`);

		// Poll for task completion with exponential backoff
		let attempts = 0;
		const maxAttempts = params.timeout! * POLLING_CONFIG.ATTEMPTS_PER_MINUTE;
		let pollInterval: number = POLLING_CONFIG.DEFAULT_INTERVAL_MS;

		while (attempts < maxAttempts) {
			const statusResponse = await client.getTaskStatus(taskId) as ModelScopeTaskStatusResponse;

			// Log polling progress
			const progress = Math.round((attempts / maxAttempts) * 100);
			const elapsedTime = Math.round((Date.now() - startTime) / 1000);

			this.logger.info(
				`图像生成进度: ${progress}% - 状态: ${statusResponse.task_status} ` +
				`(尝试 ${attempts + 1}/${maxAttempts}, 已用时: ${elapsedTime}秒)`
			);

			// Handle successful completion
			if (statusResponse.task_status === 'SUCCEED') {
				const result = ResponseBuilder.buildImageResponse(
					taskId,
					statusResponse,
					params,
					startTime,
					attempts,
				);

				this.logger.info(
					`图像生成成功 - 任务ID: ${taskId}, ` +
					`用时: ${result.processing_time}, ` +
					`图片数: ${result.images?.length || 0}, ` +
					`轮询次数: ${result.attempts_used}`
				);

				return result;
			}

			// Handle failure
			if (statusResponse.task_status === 'FAILED') {
				throw new Error(`图像生成失败: ${statusResponse.error_message || ERROR_MESSAGES.INTERNAL_ERROR}`);
			}

			// Log intermediate states
			if (statusResponse.task_status === 'RUNNING') {
				this.logger.info(`任务正在处理中... 进度: ${progress}%, 已用时: ${elapsedTime}秒`);
			} else if (statusResponse.task_status === 'PENDING') {
				this.logger.info(`任务排队中... 进度: ${progress}%, 已用时: ${elapsedTime}秒`);
			}

			// Wait before next retry with exponential backoff
			await new Promise((resolve) => setTimeout(resolve, pollInterval));
			attempts++;
			pollInterval = Math.min(
				POLLING_CONFIG.MAX_INTERVAL_MS,
				Math.round(pollInterval * POLLING_CONFIG.INTERVAL_MULTIPLIER)
			);
		}

		// Handle timeout
		const processingTime = Math.round((Date.now() - startTime) / 1000);
		throw new NodeOperationError(
			this.getNode(),
			ERROR_MESSAGES.TASK_TIMEOUT + ` (${params.timeout}分钟，任务ID: ${taskId}, 已用时: ${processingTime}秒)`
		);
	} catch (error: unknown) {
		const processingTime = Math.round((Date.now() - startTime) / 1000);
		this.logger.error(`文生图任务失败 - 用时: ${processingTime}秒, 错误: ${(error as Error).message}`);
		throw ModelScopeErrorHandler.handleApiError(error);
	}
}