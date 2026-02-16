/**
 * ModelScope API Type Definitions
 *
 * This file contains all TypeScript interfaces for ModelScope API requests and responses
 * to ensure type safety throughout the codebase.
 */

import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// ============================================================================
// Chat Completion Types
// ============================================================================

export interface ModelScopeChatCompletionRequest {
	model: string;
	messages: ChatCompletionMessageParam[];
	stream?: boolean;
	temperature?: number;
	max_tokens?: number;
}

export interface ModelScopeChatCompletionResponse {
	id: string;
	object: string;
	created: number;
	model: string;
	choices: Array<{
		index: number;
		message: {
			role: string;
			content: string;
		};
		finish_reason: string;
	}>;
	usage: {
		prompt_tokens: number;
		completion_tokens: number;
		total_tokens: number;
	};
}

export interface ModelScopeChatCompletionResult extends ModelScopeChatCompletionResponse {
	status: 'completed' | 'stream';
	processing_time: string;
	input_tokens: number;
	output_tokens: number;
	total_tokens: number;
	completed_at: string;
}

// ============================================================================
// Vision Chat Types
// ============================================================================

export interface ModelScopeVisionChatRequest {
	model: string;
	messages: ChatCompletionMessageParam[];
	imageUrl: string;
	temperature?: number;
	max_tokens?: number;
}

export interface ModelScopeVisionChatResponse {
	id: string;
	object: string;
	created: number;
	model: string;
	choices: Array<{
		index: number;
		message: {
			role: string;
			content: string;
		};
		finish_reason: string;
	}>;
	usage: {
		prompt_tokens: number;
		completion_tokens: number;
		total_tokens: number;
	};
}

export interface ModelScopeVisionChatResult extends ModelScopeVisionChatResponse {
	status: 'completed';
	processing_time: string;
	input_tokens: number;
	output_tokens: number;
	total_tokens: number;
	completed_at: string;
	image_url: string;
}

// ============================================================================
// Image Generation Types
// ============================================================================

export interface ModelScopeImageGenerationRequest {
	model: string;
	prompt: string;
	negative_prompt?: string;
	size?: string;
	num_inference_steps?: number;
	guidance_scale?: number;
}

export interface ModelScopeImageGenerationResponse {
	task_id: string;
	status: string;
}

export interface ModelScopeTaskStatusResponse {
	task_id: string;
	task_status: 'PENDING' | 'RUNNING' | 'SUCCEED' | 'FAILED';
	output_images?: string[];
	error_message?: string;
}

export interface ModelScopeImageGenerationResult {
	task_id: string;
	status: 'completed' | 'failed' | 'timeout';
	progress: number;
	model: string;
	prompt: string;
	negative_prompt?: string;
	size?: string;
	steps?: number;
	images?: string[];
	error_message?: string;
	created_at: string;
	processing_time: string;
	attempts_used: number;
}

// ============================================================================
// Error Types
// ============================================================================

export enum ModelScopeErrorCode {
	INVALID_TOKEN = 'INVALID_TOKEN',
	QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
	RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
	MODEL_NOT_AVAILABLE = 'MODEL_NOT_AVAILABLE',
	TASK_TIMEOUT = 'TASK_TIMEOUT',
	INVALID_PARAMETER = 'INVALID_PARAMETER',
	INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export interface ModelScopeErrorResponse {
	error?: {
		code: string;
		message: string;
		type?: string;
	};
	message?: string;
}

// ============================================================================
// Parameter Types
// ============================================================================

export interface ModelParameters {
	model: string;
	temperature?: number;
	maxTokens?: number;
	stream?: boolean;
}

export interface ImageParameters {
	model: string;
	prompt: string;
	negativePrompt?: string;
	size?: string;
	steps?: number;
	timeout?: number;
}

export interface VisionParameters {
	model: string;
	imageUrl: string;
	temperature?: number;
	maxTokens?: number;
}
