import type { IAuthenticateGeneric, ICredentialType, INodeProperties, Icon } from 'n8n-workflow';

export class BearerTokenAuthApi implements ICredentialType {
	name = 'bearerTokenAuthApi';
	displayName = 'Bearer Token Auth API';
	documentationUrl = 'https://docs.n8n.io/integrations/builtin/credentials/httpheaderauth/';
	icon: Icon = 'file:../nodes/MultipleUploadRequest/upload.svg';
	properties: INodeProperties[] = [
		{
			displayName: 'Token',
			name: 'token',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'The bearer token for authentication',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.token}}',
			},
		},
	};
}
