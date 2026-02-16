/**
 * Operation Helper Utilities
 *
 * Provides reusable helper functions for common operation patterns
 * to reduce code duplication across resource operations.
 */

import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { ModelScopeClient } from './apiClient';
import type { ModelParameters, ImageParameters, VisionParameters } from '../types/api.types';

export class OperationHelper {
	/**
	 * Get authenticated API client and credentials
	 */
	static async getClientAndCredentials(
		context: IExecuteFunctions,
		itemIndex: number,
	) {
		const credentials = await context.getCredentials('modelScopeApi');

		if (!credentials?.accessToken || !String(credentials.accessToken).trim()) {
			throw new NodeOperationError(
				context.getNode(),
				'认证失败: 未配置 ModelScope Access Token，请在凭据中填写并绑定节点',
			);
		}

		const client = new ModelScopeClient(credentials.accessToken as string);

		return { client, credentials };
	}

	/**
	 * Extract common model parameters (temperature, maxTokens, etc.)
	 */
	static extractModelParams(
		context: IExecuteFunctions,
		itemIndex: number,
	): ModelParameters {
		return {
			model: context.getNodeParameter('model', itemIndex) as string,
			temperature: context.getNodeParameter('temperature', itemIndex, 0.7) as number,
			maxTokens: context.getNodeParameter('maxTokens', itemIndex, 2048) as number,
			stream: context.getNodeParameter('stream', itemIndex, false) as boolean,
		};
	}

	/**
	 * Extract image generation parameters
	 */
	static extractImageParams(
		context: IExecuteFunctions,
		itemIndex: number,
	): ImageParameters {
		return {
			model: context.getNodeParameter('model', itemIndex) as string,
			prompt: context.getNodeParameter('prompt', itemIndex) as string,
			negativePrompt: context.getNodeParameter('negativePrompt', itemIndex, '') as string,
			size: context.getNodeParameter('size', itemIndex, '1024x1024') as string,
			steps: context.getNodeParameter('steps', itemIndex, 30) as number,
			timeout: context.getNodeParameter('timeout', itemIndex, 5) as number,
		};
	}

	/**
	 * Extract vision chat parameters
	 */
	static extractVisionParams(
		context: IExecuteFunctions,
		itemIndex: number,
	): VisionParameters {
		return {
			model: context.getNodeParameter('model', itemIndex) as string,
			imageUrl: context.getNodeParameter('imageUrl', itemIndex) as string,
			temperature: context.getNodeParameter('temperature', itemIndex, 0.7) as number,
			maxTokens: context.getNodeParameter('maxTokens', itemIndex, 2048) as number,
		};
	}

	/**
	 * Extract messages from node parameter
	 */
	static extractMessages(context: IExecuteFunctions, itemIndex: number) {
		const messagesData = context.getNodeParameter('messages', itemIndex) as {
			message: Array<{ role: string; content: string }>;
		};

		return messagesData.message.map(msg => ({
			role: msg.role as 'system' | 'user' | 'assistant',
			content: msg.content,
		}));
	}

	/**
	 * Validate that messages array is not empty and contains non-empty content
	 */
	static validateMessages(messages: Array<{ content: string }>, nodeName: string): void {
		if (!messages.length || !messages.some(msg => typeof msg.content === 'string' && msg.content.trim())) {
			throw new NodeOperationError(
				{ name: nodeName } as any,
				'至少需要一条非空消息',
			);
		}
	}

	/**
	 * Validate that prompt is not empty
	 */
	static validatePrompt(prompt: string, nodeName: string): void {
		if (!prompt.trim()) {
			throw new NodeOperationError(
				{ name: nodeName } as any,
				'提示词不能为空',
			);
		}
	}

	/**
	 * Validate that imageUrl is not empty
	 */
	static validateImageUrl(imageUrl: string, nodeName: string): void {
		if (!imageUrl.trim()) {
			throw new NodeOperationError(
				{ name: nodeName } as any,
				'图像 URL 不能为空',
			);
		}
	}
}
