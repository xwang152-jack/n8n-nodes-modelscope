import { OpenAI } from 'openai';
import { API_CONFIG, ERROR_MESSAGES } from './constants';
import { ModelScopeErrorHandler } from './errorHandler';
import type {
	ModelScopeChatCompletionRequest,
	ModelScopeImageGenerationRequest,
	ModelScopeImageGenerationResponse,
	ModelScopeTaskStatusResponse,
} from '../types/api.types';

export class ModelScopeClient {
    private client?: OpenAI;
    private accessToken: string;

    constructor(accessToken: string) {
        this.accessToken = accessToken || '';
    }

    private getOpenAIClient() {
        if (!this.accessToken || !this.accessToken.trim()) {
            throw new Error(ERROR_MESSAGES.EMPTY_TOKEN);
        }
        if (!this.client) {
            this.client = new OpenAI({
                apiKey: this.accessToken,
                baseURL: API_CONFIG.BASE_URL,
                timeout: API_CONFIG.TIMEOUTS.DEFAULT_REQUEST_MS,
            });
        }
        return this.client;
    }

    private ensureAccessToken() {
        if (!this.accessToken || !this.accessToken.trim()) {
            throw new Error(ERROR_MESSAGES.EMPTY_TOKEN);
        }
    }

	/**
	 * Chat completion using OpenAI SDK
	 */
	async chatCompletion(params: ModelScopeChatCompletionRequest): Promise<any> {
        try {
            const client = this.getOpenAIClient();
            return await client.chat.completions.create(params);
        } catch (error: unknown) {
            throw ModelScopeErrorHandler.handleApiError(error);
        }
    }

	/**
	 * Generate image using ModelScope API
	 * Returns a task ID for async processing
	 */
	async generateImage(params: ModelScopeImageGenerationRequest, timeoutMs: number = API_CONFIG.TIMEOUTS.DEFAULT_REQUEST_MS): Promise<ModelScopeImageGenerationResponse> {
        this.ensureAccessToken();

		// Build request parameters
		const requestParams: ModelScopeImageGenerationRequest = {
			model: params.model,
			prompt: params.prompt,
			negative_prompt: params.negative_prompt,
			size: params.size,
			num_inference_steps: params.num_inference_steps,
			guidance_scale: params.guidance_scale,
		};

		// Create abort controller for timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

		try {
			const response = await fetch(`${API_CONFIG.BASE_URL}/images/generations`, {
				method: 'POST',
				headers: {
					'Authorization': `${API_CONFIG.HEADERS.AUTHORIZATION_PREFIX}${this.accessToken}`,
					'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
					'X-ModelScope-Async-Mode': API_CONFIG.HEADERS.X_ASYNC_MODE,
				},
				body: JSON.stringify(requestParams),
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				await ModelScopeErrorHandler.handleHttpResponse(response, 'Image Generation');
			}

			return await response.json();
		} catch (error: unknown) {
			clearTimeout(timeoutId);

			if ((error as Error).name === 'AbortError') {
				throw new Error(ERROR_MESSAGES.TASK_TIMEOUT + ` (${timeoutMs}ms)`);
			}

			throw ModelScopeErrorHandler.handleApiError(error);
		}
    }

	/**
	 * Get task status for async image generation
	 */
	async getTaskStatus(taskId: string, timeoutMs: number = API_CONFIG.TIMEOUTS.DEFAULT_REQUEST_MS): Promise<ModelScopeTaskStatusResponse> {
        this.ensureAccessToken();

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

		try {
			const response = await fetch(`${API_CONFIG.BASE_URL}/tasks/${taskId}`, {
				method: 'GET',
				headers: {
					'Authorization': `${API_CONFIG.HEADERS.AUTHORIZATION_PREFIX}${this.accessToken}`,
					'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
					'X-ModelScope-Task-Type': API_CONFIG.HEADERS.X_TASK_TYPE_IMAGE_GENERATION,
				},
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				await ModelScopeErrorHandler.handleHttpResponse(response, 'Task Status');
			}

			return await response.json();
		} catch (error: unknown) {
			clearTimeout(timeoutId);

			if ((error as Error).name === 'AbortError') {
				throw new Error(ERROR_MESSAGES.TASK_TIMEOUT + ` (${timeoutMs}ms)`);
			}

			throw ModelScopeErrorHandler.handleApiError(error);
		}
    }
}
