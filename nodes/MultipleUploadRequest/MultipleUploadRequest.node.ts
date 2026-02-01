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
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { multipleUploadRequestDescription } from './description';
import { filterBinaryFiles } from './utils';

export class MultipleUploadRequest implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Multiple Upload Request',
		name: 'multipleUploadRequest',
		icon: 'file:upload.svg',
		group: ['transform'],
		version: 1,
		description: 'Upload multiple binary files with pattern filtering',
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
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const requestMethod = this.getNodeParameter('requestMethod', itemIndex) as string;
				const url = this.getNodeParameter('url', itemIndex) as string;
				const filePattern = this.getNodeParameter('filePattern', itemIndex, '*') as string;
				const binaryPropertyName = this.getNodeParameter(
					'binaryPropertyName',
					itemIndex,
					'data',
				) as string;
				const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;

				// Validate URL
				if (!url) {
					throw new NodeOperationError(this.getNode(), 'URL is required', { itemIndex });
				}

				// Get binary data
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

				// Prepare form data
				const formData: IDataObject = {};

				// Add filtered binary files
				for (const [key, binaryData] of Object.entries(filteredFiles)) {
					const buffer = await this.helpers.getBinaryDataBuffer(itemIndex, key);
					formData[key] = {
						value: buffer,
						options: {
							filename: binaryData.fileName || key,
							contentType: binaryData.mimeType || 'application/octet-stream',
						},
					};
				}

				// Add additional form fields
				if (options.formFields) {
					const formFields = (options.formFields as IDataObject).field as IDataObject[];
					if (formFields && Array.isArray(formFields)) {
						for (const field of formFields) {
							if (field.name) {
								formData[field.name as string] = field.value;
							}
						}
					}
				}

				// Prepare request options
				const requestOptions: IHttpRequestOptions = {
					method: requestMethod as IHttpRequestMethods,
					url,
					body: formData,
					headers: {},
				};

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

				// Execute the request
				const authentication = this.getNodeParameter('authentication', itemIndex) as string;
				let response: IDataObject;
				
				if (authentication === 'none') {
					response = await this.helpers.httpRequest(requestOptions);
				} else if (authentication === 'customHeader') {
					// Handle custom header authentication manually
					const credentials = await this.getCredentials('customHeaderAuthApi');
					const headerName = credentials.headerName as string;
					const headerValue = credentials.headerValue as string;
					
					if (!requestOptions.headers) {
						requestOptions.headers = {};
					}
					requestOptions.headers[headerName] = headerValue;
					
					response = await this.helpers.httpRequest(requestOptions);
				} else {
					response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						authentication,
						requestOptions,
					);
				}

				// Return response
				returnData.push({
					json: response as IDataObject,
					pairedItem: { item: itemIndex },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
						pairedItem: { item: itemIndex },
					});
					continue;
				}

				if (error.context) {
					error.context.itemIndex = itemIndex;
					throw error;
				}

				throw new NodeOperationError(this.getNode(), error, {
					itemIndex,
				});
			}
		}

		return [returnData];
	}
}
