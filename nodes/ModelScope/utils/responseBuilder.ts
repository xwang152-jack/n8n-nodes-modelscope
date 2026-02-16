/**
 * Response Builder Utilities
 *
 * Provides standardized response formatting functions to ensure
 * consistent response structure across all operations.
 */

import type {
	ModelScopeChatCompletionResponse,
	ModelScopeVisionChatResponse,
	ModelScopeTaskStatusResponse,
	ModelScopeImageGenerationResult,
} from '../types/api.types';
import type { ImageParameters } from '../types/api.types';

export class ResponseBuilder {
	/**
	 * Build standardized chat completion response with metadata
	 */
	static buildChatCompletionResponse(
		response: ModelScopeChatCompletionResponse,
		startTime: number,
	): ModelScopeChatCompletionResponse & {
		status: string;
		processing_time: string;
		input_tokens: number;
		output_tokens: number;
		total_tokens: number;
		completed_at: string;
	} {
		const processingTime = Math.round((Date.now() - startTime) / 1000);

		return {
			id: response.id,
			object: response.object,
			created: response.created,
			model: response.model,
			choices: response.choices,
			usage: response.usage,
			// Metadata
			status: 'completed',
			processing_time: `${processingTime}秒`,
			input_tokens: response.usage?.prompt_tokens || 0,
			output_tokens: response.usage?.completion_tokens || 0,
			total_tokens: response.usage?.total_tokens || 0,
			completed_at: new Date().toISOString(),
		};
	}

	/**
	 * Build standardized vision chat response with metadata
	 */
	static buildVisionChatResponse(
		response: ModelScopeVisionChatResponse,
		imageUrl: string,
		startTime: number,
	): ModelScopeVisionChatResponse & {
		status: string;
		processing_time: string;
		input_tokens: number;
		output_tokens: number;
		total_tokens: number;
		completed_at: string;
		image_url: string;
	} {
		const processingTime = Math.round((Date.now() - startTime) / 1000);

		return {
			id: response.id,
			object: response.object,
			created: response.created,
			model: response.model,
			choices: response.choices,
			usage: response.usage,
			// Metadata
			status: 'completed',
			processing_time: `${processingTime}秒`,
			input_tokens: response.usage?.prompt_tokens || 0,
			output_tokens: response.usage?.completion_tokens || 0,
			total_tokens: response.usage?.total_tokens || 0,
			completed_at: new Date().toISOString(),
			image_url: imageUrl,
		};
	}

	/**
	 * Build standardized image generation response with metadata
	 */
	static buildImageResponse(
		taskId: string,
		statusResponse: ModelScopeTaskStatusResponse,
		params: ImageParameters,
		startTime: number,
		attempts: number,
	): ModelScopeImageGenerationResult {
		const processingTime = Math.round((Date.now() - startTime) / 1000);

		return {
			task_id: taskId,
			status: 'completed',
			progress: 100,
			model: params.model,
			prompt: params.prompt,
			negative_prompt: params.negativePrompt,
			size: params.size,
			steps: params.steps,
			images: statusResponse.output_images || [],
			created_at: new Date().toISOString(),
			processing_time: `${processingTime}秒`,
			attempts_used: attempts + 1,
		};
	}

	/**
	 * Build streaming response marker
	 */
	static buildStreamResponse(response: any): { stream: true; response: any } {
		return {
			stream: true,
			response,
		};
	}

	/**
	 * Build error response for failed operations
	 */
	static buildErrorResponse(
		error: Error,
		startTime: number,
	): { error: string; processing_time: string } {
		const processingTime = Math.round((Date.now() - startTime) / 1000);

		return {
			error: error.message,
			processing_time: `${processingTime}秒`,
		};
	}
}
