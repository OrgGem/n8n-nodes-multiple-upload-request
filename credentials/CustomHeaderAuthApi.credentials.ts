import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class CustomHeaderAuthApi implements ICredentialType {
	name = 'customHeaderAuthApi';
	displayName = 'Custom Header Auth API';
	documentationUrl = 'https://docs.n8n.io/integrations/builtin/credentials/httpheaderauth/';
	icon: Icon = 'file:../nodes/MultipleUploadRequest/upload.svg';
	properties: INodeProperties[] = [
		{
			displayName: 'Header Name',
			name: 'headerName',
			type: 'string',
			default: '',
			required: true,
			description: 'The name of the custom header (e.g., X-API-Key)',
		},
		{
			displayName: 'Header Value',
			name: 'headerValue',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'The value of the custom header',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'={{$credentials.headerName}}': '={{$credentials.headerValue}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials?.testUrl}}',
			url: '',
		},
	};
}
