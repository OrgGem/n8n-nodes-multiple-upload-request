import type {
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
			default: 'X-API-Key',
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
}
