import type { INodeProperties } from 'n8n-workflow';

export const parallelExecuteWorkflowDescription: INodeProperties[] = [
	// ----------------------------------
	//         Source Selection
	// ----------------------------------
	{
		displayName: 'Source',
		name: 'source',
		type: 'options',
		options: [
			{
				name: 'Database',
				value: 'database',
				description: 'Load the workflow from the database by ID',
			},
			{
				name: 'Define Below',
				value: 'parameter',
				description: 'Pass the JSON code of a workflow',
			},
		],
		default: 'database',
		description: 'Where to get the sub-workflow to execute from',
	},

	// ----------------------------------
	//         source:database
	// ----------------------------------
	{
		displayName: 'Workflow',
		name: 'workflowId',
		type: 'workflowSelector',
		displayOptions: {
			show: {
				source: ['database'],
			},
		},
		default: '',
		required: true,
		description: 'The sub-workflow to execute in parallel for each input item',
	},

	// ----------------------------------
	//         source:parameter
	// ----------------------------------
	{
		displayName: 'Workflow JSON',
		name: 'workflowJson',
		type: 'json',
		typeOptions: {
			rows: 10,
		},
		displayOptions: {
			show: {
				source: ['parameter'],
			},
		},
		default: '\n\n\n',
		required: true,
		description: 'The workflow JSON code to execute',
	},

	// ----------------------------------
	//         Parallel Options
	// ----------------------------------
	{
		displayName: 'Concurrency Limit',
		name: 'concurrencyLimit',
		type: 'number',
		default: 0,
		description:
			'Maximum number of sub-workflows to run simultaneously. Set to 0 for unlimited. Use a limit to prevent overloading your n8n server when processing many items.',
		typeOptions: {
			minValue: 0,
		},
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		default: {},
		placeholder: 'Add Option',
		options: [
			{
				displayName: 'Wait for Sub-Workflow Completion',
				name: 'waitForSubWorkflow',
				type: 'boolean',
				default: true,
				description:
					'Whether the main workflow should wait for all sub-workflows to complete before proceeding',
			},
			{
				displayName: 'On Sub-workflow Failure',
				name: 'onFailure',
				type: 'options',
				options: [
					{
						name: 'Stop All (Promise.all)',
						value: 'stopAll',
						description:
							'If any sub-workflow fails, stop immediately and report the error. Already running sub-workflows will complete but their results will be discarded.',
					},
					{
						name: 'Continue Others (Promise.allSettled)',
						value: 'continueOthers',
						description:
							'Continue running other sub-workflows even if some fail. Failed sub-workflows will have error information in the output.',
					},
				],
				default: 'stopAll',
				description: 'How to handle when one or more sub-workflows fail during parallel execution',
			},
		],
	},
];
