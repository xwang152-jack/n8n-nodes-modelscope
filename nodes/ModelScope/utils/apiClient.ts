import { OpenAI } from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { MODELSCOPE_BASE_URL } from './constants';
import { ModelScopeErrorHandler } from './errorHandler';

export class ModelScopeClient {
    private client?: OpenAI;
    private accessToken: string;

    constructor(accessToken: string) {
        this.accessToken = accessToken || '';
    }

    private getOpenAIClient() {
        if (!this.accessToken || !this.accessToken.trim()) {
            throw new Error('认证失败: Access Token 为空，请在凭据中配置 ModelScope Token');
        }
        if (!this.client) {
            this.client = new OpenAI({
                apiKey: this.accessToken,
                baseURL: MODELSCOPE_BASE_URL,
            });
        }
        return this.client;
    }

    private ensureAccessToken() {
        if (!this.accessToken || !this.accessToken.trim()) {
            throw new Error('认证失败: 未配置 ModelScope Access Token，请在凭据中填写并绑定节点');
        }
    }

	async chatCompletion(params: {
		model: string;
		messages: ChatCompletionMessageParam[];
		stream?: boolean;
		temperature?: number;
		max_tokens?: number;
	}) {
        try {
            const client = this.getOpenAIClient();
            return await client.chat.completions.create(params);
        } catch (error: any) {
            throw ModelScopeErrorHandler.handleApiError(error);
        }
    }

    async generateImage(params: {
        model: string;
        prompt: string;
        negative_prompt?: string;
        size?: string;
        num_inference_steps?: number;
        guidance_scale?: number;
    }) {
        this.ensureAccessToken();
		// 构建请求参数
		const requestParams: any = {
			model: params.model,
			prompt: params.prompt,
		};

		// 添加可选参数
		if (params.negative_prompt) {
			requestParams.negative_prompt = params.negative_prompt;
		}
		
		if (params.size) {
			requestParams.size = params.size;
		}
		
		if (params.num_inference_steps) {
			requestParams.num_inference_steps = params.num_inference_steps;
		}
		
		if (params.guidance_scale) {
			requestParams.guidance_scale = params.guidance_scale;
		}

        const response = await fetch(`${MODELSCOPE_BASE_URL}/images/generations`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
                'X-ModelScope-Async-Mode': 'true',
            },
            body: JSON.stringify(requestParams),
        });

		if (!response.ok) {
			let errorMessage = response.statusText;
			try {
				const errorData = await response.json() as any;
				errorMessage = errorData.error?.message || errorData.message || errorMessage;
			} catch (e) {
				// If response body is not JSON, use status text
			}
			throw new Error(`ModelScope Image API Error: ${response.status} - ${errorMessage}`);
		}

		return await response.json();
	}

    async getTaskStatus(taskId: string) {
        this.ensureAccessToken();
        const response = await fetch(`${MODELSCOPE_BASE_URL}/tasks/${taskId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'X-ModelScope-Task-Type': 'image_generation',
            },
        });

		if (!response.ok) {
			let errorMessage = response.statusText;
			try {
				const errorData = await response.json() as any;
				errorMessage = errorData.error?.message || errorData.message || errorMessage;
			} catch (e) {
				// If response body is not JSON, use status text
			}
			throw new Error(`ModelScope Task API Error: ${response.status} - ${errorMessage}`);
		}

		return await response.json();
	}
}
