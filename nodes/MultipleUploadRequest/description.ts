import type { INodeProperties } from 'n8n-workflow';

export const multipleUploadRequestDescription: INodeProperties[] = [
	{
		displayName: 'Authentication',
		name: 'authentication',
		type: 'options',
		options: [
			{
				name: 'None',
				value: 'none',
			},
			{
				name: 'Bearer Token',
				value: 'bearer',
			},
			{
				name: 'Custom Header',
				value: 'customHeader',
			},
		],
		default: 'none',
		description: 'The authentication method to use',
	},
	{
		displayName: 'Request Method',
		name: 'requestMethod',
		type: 'options',
		options: [
			{
				name: 'POST',
				value: 'POST',
			},
			{
				name: 'PUT',
				value: 'PUT',
			},
			{
				name: 'PATCH',
				value: 'PATCH',
			},
		],
		default: 'POST',
		description: 'The HTTP method to use for the request',
	},
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'https://api.example.com/upload',
		description: 'The URL to send the request to',
	},
	{
		displayName: 'Send Method',
		name: 'sendMethod',
		type: 'options',
		options: [
			{
				name: 'Multipart Form Data',
				value: 'multipart',
				description: 'Send files as multipart/form-data (standard file upload)',
			},
			{
				name: 'Base64 JSON',
				value: 'base64',
				description: 'Send files as base64-encoded strings in JSON body',
			},
			{
				name: 'JSON Body (Raw)',
				value: 'jsonBody',
				description:
					'Send a raw JSON body. Paste or use an expression for the full request body instead of filling individual fields.',
			},
		],
		default: 'multipart',
		description: 'How to send the files to the endpoint',
	},

	// ----------------------------------
	//    JSON Body (Raw) input
	// ----------------------------------
	{
		displayName: 'JSON Body',
		name: 'jsonBodyContent',
		type: 'json',
		typeOptions: {
			rows: 10,
		},
		displayOptions: {
			show: {
				sendMethod: ['jsonBody'],
			},
		},
		default: '{}',
		required: true,
		description:
			'The raw JSON body to send with the request. Use n8n expressions to include dynamic data. Binary files are NOT attached in this mode.',
	},

	// ----------------------------------
	//    File-related fields (hidden for jsonBody mode)
	// ----------------------------------
	{
		displayName: 'File Field Name',
		name: 'fileFieldName',
		type: 'string',
		default: 'files',
		placeholder: 'files',
		description:
			'The field name for files in the request. For multipart: each file uses this as prefix (e.g. files[0], files[1]). For base64: the JSON array key.',
		displayOptions: {
			hide: {
				sendMethod: ['jsonBody'],
			},
		},
	},
	{
		displayName: 'File Pattern',
		name: 'filePattern',
		type: 'string',
		default: '*',
		placeholder: '*.jpg or image_*.png',
		description:
			'Pattern to filter binary files. Use * to match any characters and ? to match a single character. Leave as * to upload all binary files.',
		displayOptions: {
			hide: {
				sendMethod: ['jsonBody'],
			},
		},
	},
	{
		displayName: 'Binary Property Name',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		description:
			'Name of the binary property which contains the files to upload. Multiple properties can be comma-separated.',
		displayOptions: {
			hide: {
				sendMethod: ['jsonBody'],
			},
		},
	},

	// ----------------------------------
	//    Execution Mode
	// ----------------------------------
	{
		displayName: 'Execution Mode',
		name: 'executionMode',
		type: 'options',
		options: [
			{
				name: 'Sequential',
				value: 'sequential',
				description: 'Process each input item one at a time (default behavior)',
			},
			{
				name: 'Parallel (Promise.all)',
				value: 'parallel',
				description:
					'Process all input items simultaneously. All HTTP requests are fired in parallel and the node waits for all to complete.',
			},
		],
		default: 'sequential',
		description: 'How to process multiple input items',
	},
	{
		displayName: 'Concurrency Limit',
		name: 'concurrencyLimit',
		type: 'number',
		default: 0,
		typeOptions: {
			minValue: 0,
		},
		displayOptions: {
			show: {
				executionMode: ['parallel'],
			},
		},
		description:
			'Maximum number of HTTP requests to run simultaneously. Set to 0 for unlimited. Use a limit to avoid overwhelming the target API.',
	},

	// ----------------------------------
	//    Options collection
	// ----------------------------------
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		options: [
			{
				displayName: 'Additional Form Fields',
				name: 'formFields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				placeholder: 'Add Field',
				default: {},
				options: [
					{
						name: 'field',
						displayName: 'Field',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Name of the form field',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value of the form field',
							},
						],
					},
				],
			},
			{
				displayName: 'Additional Headers',
				name: 'headers',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				placeholder: 'Add Header',
				default: {},
				options: [
					{
						name: 'header',
						displayName: 'Header',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Name of the header',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value of the header',
							},
						],
					},
				],
			},
			{
				displayName: 'Ignore SSL Issues',
				name: 'ignoreSSL',
				type: 'boolean',
				default: false,
				description: 'Whether to ignore SSL certificate errors',
			},
			{
				displayName: 'On Error',
				name: 'onError',
				type: 'options',
				options: [
					{
						name: 'Stop All (Promise.all)',
						value: 'stopAll',
						description:
							'If any request fails, stop and report the error immediately (only applies in Parallel mode)',
					},
					{
						name: 'Continue Others (Promise.allSettled)',
						value: 'continueOthers',
						description:
							'Continue other requests even if some fail, output errors as items (only applies in Parallel mode)',
					},
				],
				default: 'stopAll',
				description:
					'How to handle errors when running in Parallel mode. In Sequential mode, use the built-in "Continue On Fail" setting.',
				displayOptions: {
					show: {
						'/executionMode': ['parallel'],
					},
				},
			},
			{
				displayName: 'Query Parameters',
				name: 'queryParameters',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				placeholder: 'Add Parameter',
				default: {},
				options: [
					{
						name: 'parameter',
						displayName: 'Parameter',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Name of the query parameter',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value of the query parameter',
							},
						],
					},
				],
			},
			{
				displayName: 'Timeout',
				name: 'timeout',
				type: 'number',
				default: 10000,
				description: 'Time in milliseconds to wait for a response before failing the request',
			},
		],
	},
];
