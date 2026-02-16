import { ERROR_MESSAGES } from './constants';
import type { ModelScopeErrorCode, ModelScopeErrorResponse } from '../types/api.types';

export class ModelScopeErrorHandler {
	/**
	 * Handle API errors from OpenAI SDK and HTTP requests
	 */
	static handleApiError(error: any): Error {
		// Handle OpenAI SDK errors
		if (error.response) {
			const status = error.response.status;
			const errorData = error.response.data as ModelScopeErrorResponse | undefined;
			const message = errorData?.error?.message || errorData?.message || error.response.statusText || error.message;
			const errorCode = errorData?.error?.code as ModelScopeErrorCode;

			// Check for specific error codes first
			if (errorCode && this.getErrorMessageForCode(errorCode)) {
				return new Error(this.getErrorMessageForCode(errorCode)!);
			}

			// Fall back to HTTP status code handling
			return this.handleHttpError(status, message);
		}

		// Handle network errors
		if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
			return new Error(ERROR_MESSAGES.NETWORK_ERROR + ': ' + error.message);
		}

		// Handle timeout errors
		if (error.name === 'AbortError' || error.message?.includes('timeout')) {
			return new Error(ERROR_MESSAGES.TASK_TIMEOUT + ': ' + error.message);
		}

		// Return original error if no specific handling
		return error;
	}

	/**
	 * Handle HTTP response errors
	 */
	static async handleHttpResponse(response: Response, context: string): Promise<never> {
		let errorMessage = response.statusText;
		let errorCode: string | undefined;

		try {
			const errorData = await response.json() as ModelScopeErrorResponse;
			errorMessage = errorData.error?.message || errorData.message || errorMessage;
			errorCode = errorData.error?.code;
		} catch {
			// Use status text if JSON parsing fails
		}

		// Check for specific error codes
		if (errorCode) {
			const specificMessage = this.getErrorMessageForCode(errorCode as ModelScopeErrorCode);
			if (specificMessage) {
				throw new Error(specificMessage);
			}
		}

		throw new Error(`ModelScope ${context} Error (${response.status}): ${errorMessage}${errorCode ? ` [${errorCode}]` : ''}`);
	}

	/**
	 * Get error message for specific error code
	 */
	private static getErrorMessageForCode(code: ModelScopeErrorCode): string | undefined {
		const errorMessages: Record<ModelScopeErrorCode, string> = {
			INVALID_TOKEN: ERROR_MESSAGES.INVALID_TOKEN,
			QUOTA_EXCEEDED: ERROR_MESSAGES.QUOTA_EXCEEDED,
			RATE_LIMIT_EXCEEDED: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
			MODEL_NOT_AVAILABLE: ERROR_MESSAGES.MODEL_NOT_AVAILABLE,
			TASK_TIMEOUT: ERROR_MESSAGES.TASK_TIMEOUT,
			INVALID_PARAMETER: ERROR_MESSAGES.INVALID_PARAMETER,
			INTERNAL_ERROR: ERROR_MESSAGES.INTERNAL_ERROR,
		};

		return errorMessages[code];
	}

	/**
	 * Handle errors by HTTP status code
	 */
	private static handleHttpError(status: number, message: string): Error {
		switch (status) {
			case 401:
				return new Error(ERROR_MESSAGES.INVALID_TOKEN);
			case 429:
				return new Error(ERROR_MESSAGES.RATE_LIMIT_EXCEEDED + ': ' + (message || '请稍后重试或检查每日配额'));
			case 400:
				return new Error(ERROR_MESSAGES.INVALID_PARAMETER + ': ' + message);
			case 500:
			case 502:
			case 503:
				return new Error(ERROR_MESSAGES.INTERNAL_ERROR + ', 请稍后重试');
			default:
				return new Error(`API调用失败 (${status}): ${message || '无详细错误信息'}`);
		}
	}

	/**
	 * Validate that model is in supported list
	 */
	static validateModel(model: string, supportedModels: string[]): void {
		if (!supportedModels.includes(model)) {
			throw new Error(ERROR_MESSAGES.MODEL_NOT_AVAILABLE + `: ${model}`);
		}
	}

	/**
	 * Validate rate limits (for future use)
	 */
	static validateRateLimit(dailyUsage: number, modelUsage: number): void {
		if (dailyUsage >= 2000) {
			throw new Error(ERROR_MESSAGES.QUOTA_EXCEEDED + ' (每日总调用限制2000次)');
		}

		if (modelUsage >= 500) {
			throw new Error(ERROR_MESSAGES.QUOTA_EXCEEDED + ' (单模型每日调用限制500次)');
		}
	}
}
