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
		displayName: 'File Pattern',
		name: 'filePattern',
		type: 'string',
		default: '*',
		placeholder: '*.jpg or image_*.png',
		description:
			'Pattern to filter binary files. Use * to match any characters and ? to match a single character. Leave as * to upload all binary files.',
	},
	{
		displayName: 'Binary Property Name',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		description:
			'Name of the binary property which contains the files to upload. Multiple properties can be comma-separated.',
	},
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
