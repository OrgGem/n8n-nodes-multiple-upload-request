import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestOptions,
	IDataObject,
	IHttpRequestMethods,
	IBinaryData,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError, jsonParse } from 'n8n-workflow';
import FormData from 'form-data';
import { multipleUploadRequestDescription } from './description';
import { filterBinaryFiles } from './utils';
import { createConcurrencyLimiter } from '../ParallelExecuteWorkflow/concurrency';

export class MultipleUploadRequest implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Multiple Upload Request',
		name: 'multipleUploadRequest',
		icon: 'file:upload.svg',
		group: ['transform'],
		version: [1, 2],
		description: 'Upload multiple binary files with pattern filtering and parallel execution',
		defaults: {
			name: 'Multiple Upload Request',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'bearerTokenAuthApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['bearer'],
					},
				},
			},
			{
				name: 'customHeaderAuthApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['customHeader'],
					},
				},
			},
		],
		properties: multipleUploadRequestDescription,
		usableAsTool: true,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const executionMode = this.getNodeParameter('executionMode', 0, 'sequential') as string;

		if (executionMode === 'parallel') {
			return executeParallel.call(this, items);
		} else {
			return executeSequential.call(this, items);
		}
	}
}

// ============================================================
// Sequential Execution (original behavior)
// ============================================================

async function executeSequential(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[][]> {
	const returnData: INodeExecutionData[] = [];

	for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
		try {
			const result = await processItem.call(this, items, itemIndex);
			returnData.push({
				json: result as IDataObject,
				pairedItem: { item: itemIndex },
			});
		} catch (error) {
			if (this.continueOnFail()) {
				returnData.push({
					json: { error: (error as Error).message },
					pairedItem: { item: itemIndex },
				});
				continue;
			}

			if ((error as NodeOperationError).context) {
				(error as NodeOperationError).context.itemIndex = itemIndex;
				throw error;
			}

			throw new NodeOperationError(this.getNode(), error as Error, { itemIndex });
		}
	}

	return [returnData];
}

// ============================================================
// Parallel Execution (Promise.all / Promise.allSettled)
// ============================================================

async function executeParallel(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[][]> {
	const concurrencyLimit = this.getNodeParameter('concurrencyLimit', 0, 0) as number;
	const onError = this.getNodeParameter('options.onError', 0, 'stopAll') as string;
	const limit = createConcurrencyLimiter(concurrencyLimit);

	// Create all execution promises
	const promises = items.map((_, itemIndex) =>
		limit(() =>
			processItem.call(this, items, itemIndex).then((result) => ({ itemIndex, result })),
		),
	);

	if (onError === 'continueOthers') {
		// Promise.allSettled — continue even if some fail
		const settled = await Promise.allSettled(promises);
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < settled.length; i++) {
			const outcome = settled[i];
			if (outcome.status === 'fulfilled') {
				returnData.push({
					json: outcome.value.result as IDataObject,
					pairedItem: { item: outcome.value.itemIndex },
				});
			} else {
				returnData.push({
					json: {
						error: (outcome.reason as Error).message || 'Unknown error',
						itemIndex: i,
						status: 'failed',
					},
					pairedItem: { item: i },
				});
			}
		}

		return [returnData];
	} else {
		// Promise.all — fail-fast
		try {
			const results = await Promise.all(promises);
			const returnData: INodeExecutionData[] = results.map(({ itemIndex, result }) => ({
				json: result as IDataObject,
				pairedItem: { item: itemIndex },
			}));
			return [returnData];
		} catch (error) {
			if (this.continueOnFail()) {
				return [
					[
						{
							json: { error: (error as Error).message },
							pairedItem: { item: 0 },
						},
					],
				];
			}
			throw error;
		}
	}
}

// ============================================================
// Process a single item — build request and execute
// ============================================================

async function processItem(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	itemIndex: number,
): Promise<IDataObject> {
	const requestMethod = this.getNodeParameter('requestMethod', itemIndex) as string;
	const url = this.getNodeParameter('url', itemIndex) as string;
	const sendMethod = this.getNodeParameter('sendMethod', itemIndex, 'multipart') as string;
	const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;

	// Validate URL
	if (!url) {
		throw new NodeOperationError(this.getNode(), 'URL is required', { itemIndex });
	}

	// Build request options based on send method
	let requestOptions: IHttpRequestOptions;

	if (sendMethod === 'jsonBody') {
		// --- JSON Body (Raw) mode ---
		requestOptions = await buildJsonBodyRequest.call(this, itemIndex, requestMethod, url);
	} else if (sendMethod === 'base64') {
		// --- Base64 JSON mode ---
		requestOptions = await buildBase64Request.call(
			this,
			items,
			itemIndex,
			requestMethod,
			url,
			options,
		);
	} else {
		// --- Multipart Form Data mode (default) ---
		requestOptions = await buildMultipartRequest.call(
			this,
			items,
			itemIndex,
			requestMethod,
			url,
			options,
		);
	}

	// Apply common options (query params, headers, timeout, SSL)
	applyCommonOptions(requestOptions, options);

	// Execute the request with authentication
	const authentication = this.getNodeParameter('authentication', itemIndex) as string;
	return executeHttpRequest.call(this, authentication, requestOptions);
}

// ============================================================
// Request builders
// ============================================================

async function buildJsonBodyRequest(
	this: IExecuteFunctions,
	itemIndex: number,
	requestMethod: string,
	url: string,
): Promise<IHttpRequestOptions> {
	const jsonBodyContent = this.getNodeParameter('jsonBodyContent', itemIndex, '{}') as string;
	const body = jsonParse<IDataObject>(jsonBodyContent, {
		errorMessage: 'Invalid JSON body. Please check your JSON syntax.',
	});

	return {
		method: requestMethod as IHttpRequestMethods,
		url,
		body,
		headers: {
			'Content-Type': 'application/json',
		},
	};
}

async function buildBase64Request(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	itemIndex: number,
	requestMethod: string,
	url: string,
	options: IDataObject,
): Promise<IHttpRequestOptions> {
	const fileFieldName = this.getNodeParameter('fileFieldName', itemIndex, 'files') as string;
	const filteredFiles = getFilteredBinaryFiles.call(this, items, itemIndex);

	const base64Files: Array<{ filename: string; mimeType: string; data: string }> = [];

	for (const [key, binaryData] of Object.entries(filteredFiles)) {
		const buffer = await this.helpers.getBinaryDataBuffer(itemIndex, key);
		base64Files.push({
			filename: binaryData.fileName || key,
			mimeType: binaryData.mimeType || 'application/octet-stream',
			data: buffer.toString('base64'),
		});
	}

	// Build JSON body
	const jsonBody: IDataObject = {
		[fileFieldName]: base64Files,
	};

	// Add additional form fields to JSON body
	addFormFieldsToJsonBody(jsonBody, options);

	return {
		method: requestMethod as IHttpRequestMethods,
		url,
		body: jsonBody,
		headers: {
			'Content-Type': 'application/json',
		},
	};
}

async function buildMultipartRequest(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	itemIndex: number,
	requestMethod: string,
	url: string,
	options: IDataObject,
): Promise<IHttpRequestOptions> {
	const fileFieldName = this.getNodeParameter('fileFieldName', itemIndex, 'files') as string;
	const filteredFiles = getFilteredBinaryFiles.call(this, items, itemIndex);
	const form = new FormData();

	// Add filtered binary files using array-style field naming
	let fileIndex = 0;
	for (const [key, binaryData] of Object.entries(filteredFiles)) {
		const buffer = await this.helpers.getBinaryDataBuffer(itemIndex, key);
		const fieldKey = `${fileFieldName}[${fileIndex}]`;
		form.append(fieldKey, buffer, {
			filename: binaryData.fileName || key,
			contentType: binaryData.mimeType || 'application/octet-stream',
		});
		fileIndex++;
	}

	// Add additional form fields
	if (options.formFields) {
		const formFields = (options.formFields as IDataObject).field as IDataObject[];
		if (formFields && Array.isArray(formFields)) {
			for (const field of formFields) {
				if (field.name) {
					form.append(field.name as string, String(field.value ?? ''));
				}
			}
		}
	}

	return {
		method: requestMethod as IHttpRequestMethods,
		url,
		body: form as unknown as FormData,
		headers: form.getHeaders() as IDataObject,
	};
}

// ============================================================
// Helpers
// ============================================================

function getFilteredBinaryFiles(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	itemIndex: number,
): Record<string, IBinaryData> {
	const filePattern = this.getNodeParameter('filePattern', itemIndex, '*') as string;
	const binaryPropertyName = this.getNodeParameter(
		'binaryPropertyName',
		itemIndex,
		'data',
	) as string;

	const item = items[itemIndex];
	if (!item.binary) {
		throw new NodeOperationError(
			this.getNode(),
			'No binary data found in input. Please connect a node that provides binary data.',
			{ itemIndex },
		);
	}

	// Handle multiple binary property names
	const propertyNames = binaryPropertyName.split(',').map((name) => name.trim());
	let allBinaryFiles: Record<string, IBinaryData> = {};

	for (const propName of propertyNames) {
		if (item.binary[propName]) {
			allBinaryFiles[propName] = item.binary[propName];
		}
	}

	// If no specific properties found, get all binary data
	if (Object.keys(allBinaryFiles).length === 0) {
		allBinaryFiles = item.binary;
	}

	// Filter files based on pattern
	const filteredFiles = filterBinaryFiles(allBinaryFiles, filePattern);

	if (Object.keys(filteredFiles).length === 0) {
		throw new NodeOperationError(
			this.getNode(),
			`No binary files match the pattern: ${filePattern}`,
			{ itemIndex },
		);
	}

	return filteredFiles;
}

function addFormFieldsToJsonBody(jsonBody: IDataObject, options: IDataObject): void {
	if (options.formFields) {
		const formFields = (options.formFields as IDataObject).field as IDataObject[];
		if (formFields && Array.isArray(formFields)) {
			for (const field of formFields) {
				if (field.name) {
					jsonBody[field.name as string] = field.value;
				}
			}
		}
	}
}

function applyCommonOptions(
	requestOptions: IHttpRequestOptions,
	options: IDataObject,
): void {
	// Add query parameters
	if (options.queryParameters) {
		const queryParams = (options.queryParameters as IDataObject).parameter as IDataObject[];
		if (queryParams && Array.isArray(queryParams)) {
			const qs: IDataObject = {};
			for (const param of queryParams) {
				if (param.name) {
					qs[param.name as string] = param.value;
				}
			}
			requestOptions.qs = qs;
		}
	}

	// Add additional headers
	if (options.headers) {
		const headers = (options.headers as IDataObject).header as IDataObject[];
		if (headers && Array.isArray(headers)) {
			for (const header of headers) {
				if (header.name) {
					requestOptions.headers![header.name as string] = header.value as string;
				}
			}
		}
	}

	// Add timeout
	if (options.timeout) {
		requestOptions.timeout = options.timeout as number;
	}

	// Add SSL options
	if (options.ignoreSSL) {
		requestOptions.skipSslCertificateValidation = options.ignoreSSL as boolean;
	}
}

async function executeHttpRequest(
	this: IExecuteFunctions,
	authentication: string,
	requestOptions: IHttpRequestOptions,
): Promise<IDataObject> {
	if (authentication === 'none') {
		return this.helpers.httpRequest(requestOptions);
	} else if (authentication === 'customHeader') {
		return this.helpers.httpRequestWithAuthentication.call(
			this,
			'customHeaderAuthApi',
			requestOptions,
		);
	} else {
		return this.helpers.httpRequestWithAuthentication.call(
			this,
			'bearerTokenAuthApi',
			requestOptions,
		);
	}
}
